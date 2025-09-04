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


  async checkForUpdates() {
    try {
      console.log('Checking for updates from Melhik CMS...');
      
      const lastSync = await this.getLastSyncTime();
      const currentVersion = await this.getContentVersion();
      
      const statusUrl = getApiUrl(API_CONFIG.ENDPOINTS.SYNC_STATUS);
      console.log(`Making request to: ${statusUrl}`);
      const response = await fetch(statusUrl);
      
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
      return { hasUpdates: false, serverData: null, lastSync: '0', serverTime: null };
    }
  }

  async downloadContent(lastSync = '0') {
    try {
      console.log(`Downloading content from Melhik CMS since: ${lastSync}`);
      
      const downloadUrl = getApiUrl(`${API_CONFIG.ENDPOINTS.SYNC_DOWNLOAD}?lastSync=${lastSync}`);
      console.log('Download URL:', downloadUrl);
      
      const response = await fetch(downloadUrl);
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
            message: result.message
          };
        }
      }
      throw new Error(`Failed to download content: ${response.status}`);
    } catch (error) {
      console.error('Content download failed:', error);
      throw error;
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

      // Store topic details
      if (content.topicDetails && content.topicDetails.length > 0) {
        await AsyncStorage.setItem('melhik_topic_details', JSON.stringify(content.topicDetails));
        console.log(`Stored ${content.topicDetails.length} topic details`);
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
      
      const result = await this.downloadContent('0'); // '0' means get all data
      console.log('Full sync completed successfully');
      
      return result;
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  async performIncrementalSync() {
    try {
      console.log('Performing incremental sync from Melhik CMS...');
      
      const lastSync = await this.getLastSyncTime();
      const result = await this.downloadContent(lastSync);
      console.log('Incremental sync completed successfully');
      
      return result;
    } catch (error) {
      console.error('Incremental sync failed:', error);
      throw error;
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
