import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/storage';
import { API_CONFIG, getApiUrl } from '../config/api';

class SyncService {
  constructor() {
    // Use API configuration
    this.apiUrl = API_CONFIG.BASE_URL;
    this.lastSyncKey = STORAGE_KEYS.LAST_SYNC;
    this.contentVersionKey = STORAGE_KEYS.CONTENT_VERSION;
    this.testMode = false; // Always use real CMS
  }


  async checkForUpdates(timeout = 10000) {
    try {
      console.log('Checking for updates from Melhik CMS...');
      
      const lastSync = await this.getLastSyncTime();
      const currentVersion = await this.getContentVersion();
      
      const statusUrl = getApiUrl(API_CONFIG.ENDPOINTS.SYNC_STATUS);
      console.log(`Making request to: ${statusUrl}`);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      let response;
      try {
        response = await fetch(statusUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn('Sync check timed out');
          return { hasUpdates: false, serverData: null, lastSync, serverTime: null };
        }
        throw fetchError;
      }
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const hasUpdates = new Date(result.data.lastUpdated) > new Date(parseInt(lastSync));
          console.log(`Sync check: lastSync=${lastSync}, serverLastUpdated=${result.data.lastUpdated}, hasUpdates=${hasUpdates}`);
          
          return {
            hasUpdates,
            serverData: result.data,
            lastSync,
            serverTime: result.data.serverTime
          };
        }
      }
      
      console.log(`Sync check failed: ${response.status} ${response.statusText}`);
      return { hasUpdates: false, serverData: null, lastSync, serverTime: null };
    } catch (error) {
      console.error('Sync check failed:', error);
      // Don't throw error for check - just return no updates
      // This allows app to continue with cached data
      return { hasUpdates: false, serverData: null, lastSync: lastSync || '0', serverTime: null };
    }
  }

  async downloadContent(lastSync = '0', timeout = 30000) {
    try {
      console.log(`Downloading content from Melhik CMS since: ${lastSync}`);
      
      const downloadUrl = getApiUrl(`${API_CONFIG.ENDPOINTS.SYNC_DOWNLOAD}?lastSync=${lastSync}`);
      console.log('Download URL:', downloadUrl);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      let response;
      try {
        response = await fetch(downloadUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Connection timed out. Please check your internet connection and try again.');
        }
        throw fetchError;
      }
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`Content downloaded: ${result.data.syncType} sync, ${result.data.religions?.length || 0} religions, ${result.data.topics?.length || 0} topics`);
          
          await this.storeContent(result.data);
          await this.updateLastSyncTime(result.syncTimestamp);
          await this.updateContentVersion(result.data.version);
          
          return {
            success: true,
            data: result.data,
            syncTimestamp: result.syncTimestamp,
            message: result.message || 'Content synced successfully'
          };
        }
      }
      
      // Provide user-friendly error messages
      let errorMessage = 'Unable to sync content';
      if (response.status === 401) {
        errorMessage = 'Server authentication failed';
      } else if (response.status === 403) {
        errorMessage = 'Access denied by server';
      } else if (response.status === 404) {
        errorMessage = 'Sync service not found';
      } else if (response.status === 500) {
        errorMessage = 'Server error occurred';
      } else if (response.status === 0 || !response.status) {
        errorMessage = 'Cannot connect to server';
      } else {
        errorMessage = `Server error (${response.status})`;
      }
      
      throw new Error(errorMessage);
    } catch (error) {
      // Determine if this is an expected network error
      const errorMessage = error.message || '';
      const errorName = error.name || '';
      const isNetworkError = 
        errorMessage.includes('Network request failed') || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Cannot connect') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('DNS') ||
        (errorName === 'TypeError' && (errorMessage.includes('Network') || errorMessage.includes('fetch')));
      
      // Only log unexpected errors - suppress expected network errors
      if (!isNetworkError) {
        console.error('Content download failed:', error);
      }
      // Network errors are expected and handled gracefully - no logging needed
      
      // Provide user-friendly error messages for network issues
      if (isNetworkError) {
        // Create error without logging
        const networkError = new Error('ኢንተርኔት ግንኙነት አልተገኘም። እባክዎ ኢንተርኔትዎን ይፈትሹ።');
        networkError.isNetworkError = true; // Mark as network error
        throw networkError;
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out') || errorMessage.includes('AbortError')) {
        const timeoutError = new Error('ግንኙነቱ ረጅም ጊዜ ወስዷል። እባክዎ እንደገና ይሞክሩ።');
        timeoutError.isNetworkError = true;
        throw timeoutError;
      } else if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
        throw new Error('ከሰርቨር የተሳሳተ መልስ ተቀብሏል።');
      }
      
      // If error message is already in Amharic, use it; otherwise provide generic message
      if (errorMessage.includes('ኢንተርኔት') || errorMessage.includes('ግንኙነት')) {
        error.isNetworkError = true;
        throw error;
      }
      
      throw new Error(`ስህተት: ${errorMessage || 'ያልታወቀ ስህተት ተፈጥሯል።'}`);
    }
  }

  async storeContent(content) {
    try {
      console.log('Storing content locally...');
      
      // Store religions
      if (content.religions && content.religions.length > 0) {
        await AsyncStorage.setItem('melhik_religions', JSON.stringify(content.religions));
        console.log(`Stored ${content.religions.length} religions`);
      }

      // Store topics
      if (content.topics && content.topics.length > 0) {
        await AsyncStorage.setItem('melhik_topics', JSON.stringify(content.topics));
        console.log(`Stored ${content.topics.length} topics`);
      }

      // Store topic details with content blocks
      if (content.topicDetails && content.topicDetails.length > 0) {
        // Process each topic detail to ensure content blocks are properly stored
        const processedTopicDetails = content.topicDetails.map(detail => {
          // Ensure contentBlocks is an array and properly formatted
          const contentBlocks = Array.isArray(detail.contentBlocks) 
            ? detail.contentBlocks.map(block => {
                const contentData = typeof block.contentData === 'string' 
                  ? JSON.parse(block.contentData) 
                  : block.contentData;
                
                return {
                  id: block.id,
                  blockType: block.blockType,
                  contentData: contentData,
                  orderIndex: block.orderIndex || 0,
                  createdAt: block.createdAt,
                  updatedAt: block.updatedAt
                };
              })
            : [];
          
          return {
            id: detail.id,
            topicId: detail.topicId,
            version: detail.version,
            useBlocks: detail.useBlocks,
            contentBlocks: contentBlocks,
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt
          };
        });
        
        await AsyncStorage.setItem('melhik_topic_details', JSON.stringify(processedTopicDetails));
        console.log(`Stored ${content.topicDetails.length} topic details`);
        
        // Log content blocks count for debugging
        const totalContentBlocks = processedTopicDetails.reduce((sum, detail) => 
          sum + (detail.contentBlocks?.length || 0), 0);
        console.log(`Total content blocks stored: ${totalContentBlocks}`);
        
        // Note: Images will be cached automatically after they load in ImageCard component
      }

      console.log('Content stored successfully');
    } catch (error) {
      console.error('Error storing content:', error);
      throw error;
    }
  }

  async getStoredContent() {
    try {
      const [religions, topics, topicDetails] = await Promise.all([
        AsyncStorage.getItem('melhik_religions'),
        AsyncStorage.getItem('melhik_topics'),
        AsyncStorage.getItem('melhik_topic_details')
      ]);

      return {
        religions: religions ? JSON.parse(religions) : [],
        topics: topics ? JSON.parse(topics) : [],
        topicDetails: topicDetails ? JSON.parse(topicDetails) : []
      };
    } catch (error) {
      console.error('Error getting stored content:', error);
      return { religions: [], topics: [], topicDetails: [] };
    }
  }

  async getLastSyncTime() {
    try {
      return await AsyncStorage.getItem(this.lastSyncKey) || '0';
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return '0';
    }
  }

  async updateLastSyncTime(timestamp) {
    try {
      await AsyncStorage.setItem(this.lastSyncKey, timestamp.toString());
      console.log(`Last sync time updated: ${timestamp}`);
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  async getContentVersion() {
    try {
      return await AsyncStorage.getItem(this.contentVersionKey) || '0';
    } catch (error) {
      console.error('Error getting content version:', error);
      return '0';
    }
  }

  async updateContentVersion(version) {
    try {
      await AsyncStorage.setItem(this.contentVersionKey, version.toString());
      console.log(`Content version updated: ${version}`);
    } catch (error) {
      console.error('Error updating content version:', error);
    }
  }

  async performFullSync() {
    try {
      console.log('Performing full sync from Melhik CMS...');
      
      // Check if we have cached data to fall back to
      const hasCachedData = await this.hasCachedContent();
      
      const result = await this.downloadContent('0'); // '0' means get all data
      console.log('Full sync completed successfully');
      
      return {
        success: true,
        message: result.message || 'ይዘቱ በተሳካ ሁኔታ ተሰምሯል።',
        data: result.data,
        hasCachedData
      };
    } catch (error) {
      // Check if this is an expected network error
      const errorMessage = error.message || '';
      const isNetworkError = 
        error.isNetworkError === true ||
        errorMessage.includes('ኢንተርኔት') ||
        errorMessage.includes('ግንኙነት') ||
        errorMessage.includes('Network') ||
        errorMessage.includes('timeout') ||
        (error.name === 'TypeError' && errorMessage.includes('Network'));
      
      // Only log unexpected errors - suppress expected network errors
      if (!isNetworkError) {
        console.error('Full sync failed with unexpected error:', error);
      }
      // Network errors are expected and handled gracefully - no logging needed
      
      // Check if we have cached data to use
      const hasCachedData = await this.hasCachedContent();
      
      // Return a user-friendly error with cached data status
      return {
        success: false,
        message: error.message || 'ስምር አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
        error: error.message,
        hasCachedData,
        canUseCachedData: hasCachedData,
        isNetworkError
      };
    }
  }

  async hasCachedContent() {
    try {
      const content = await this.getStoredContent();
      return content.religions.length > 0 || content.topics.length > 0;
    } catch (error) {
      return false;
    }
  }

  async performIncrementalSync() {
    try {
      console.log('Performing incremental sync from Melhik CMS...');
      
      const lastSync = await this.getLastSyncTime();
      const result = await this.downloadContent(lastSync);
      console.log('Incremental sync completed successfully');
      
      return {
        success: true,
        message: result.message || 'Content updated successfully',
        data: result.data
      };
    } catch (error) {
      // Check if this is an expected network error
      const errorMessage = error.message || '';
      const isNetworkError = 
        error.isNetworkError === true ||
        errorMessage.includes('ኢንተርኔት') ||
        errorMessage.includes('ግንኙነት') ||
        errorMessage.includes('Network') ||
        (error.name === 'TypeError' && errorMessage.includes('Network'));
      
      // Only log unexpected errors - suppress expected network errors
      if (!isNetworkError) {
        console.error('Incremental sync failed:', error);
      }
      // Network errors are expected and handled gracefully - no logging needed
      
      // Check if we have cached data
      const hasCachedData = await this.hasCachedContent();
      
      // Return a user-friendly error instead of throwing
      return {
        success: false,
        message: error.message || 'Update failed. Please try again.',
        error: error.message,
        hasCachedData,
        canUseCachedData: hasCachedData,
        isNetworkError
      };
    }
  }

  async clearStoredContent() {
    try {
      await Promise.all([
        AsyncStorage.removeItem('melhik_religions'),
        AsyncStorage.removeItem('melhik_topics'),
        AsyncStorage.removeItem('melhik_topic_details'),
        AsyncStorage.removeItem(this.lastSyncKey),
        AsyncStorage.removeItem(this.contentVersionKey)
      ]);
      console.log('Stored content cleared successfully');
    } catch (error) {
      console.error('Error clearing stored content:', error);
    }
  }

  getSyncStatus() {
    return {
      apiUrl: this.apiUrl,
      lastSyncKey: this.lastSyncKey,
      contentVersionKey: this.contentVersionKey,
      testMode: this.testMode
    };
  }
}

export default new SyncService();
