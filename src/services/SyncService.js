import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/storage';
import notificationService from './NotificationService';

class SyncService {
  constructor() {
    // Update this URL to your actual CMS domain when ready
    this.apiUrl = 'http://192.168.0.122:3000/api'; // For local testing - using computer's IP
    // this.apiUrl = 'https://your-cms-domain.com/api'; // For production
    this.lastSyncKey = STORAGE_KEYS.LAST_SYNC;
    this.contentVersionKey = STORAGE_KEYS.CONTENT_VERSION;
    this.testMode = false; // Disable test mode to use real CMS
  }

  // Test sync that works without CMS server
  async performTestSync() {
    try {
      console.log('Performing test sync...');
      
      // Send notification that sync is starting
      await this.sendSyncStartNotification('test');
      
      // Simulate some delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create test data
      const testData = {
        religions: [
          { id: 1, name: 'Christianity', description: 'Test religion data' },
          { id: 2, name: 'Islam', description: 'Test religion data' }
        ],
        topics: [
          { id: 1, title: 'Bible Facts', content: 'Test topic content' },
          { id: 2, title: 'Christian History', content: 'Test topic content' }
        ],
        topicDetails: [],
        version: '1.0.0',
        syncType: 'test'
      };
      
      // Store test content
      await this.storeContent(testData);
      await this.updateLastSyncTime(Date.now().toString());
      await this.updateContentVersion(testData.version);
      
      // Send notification about test content
      await this.sendSyncNotification(testData, '0');
      
      // Send completion notification
      await this.sendSyncCompleteNotification('test', testData);
      
      console.log('Test sync completed successfully');
      
      return {
        success: true,
        data: testData,
        syncTimestamp: Date.now().toString(),
        message: 'Test sync completed successfully'
      };
    } catch (error) {
      console.error('Test sync failed:', error);
      
      // Send notification that sync failed
      await this.sendSyncErrorNotification('test', error.message);
      
      throw error;
    }
  }

  async checkForUpdates() {
    try {
      console.log('Checking for updates...');
      
      if (this.testMode) {
        console.log('Test mode enabled, returning mock update check');
        return { hasUpdates: true, serverData: null, lastSync: '0', serverTime: null };
      }
      
      const lastSync = await this.getLastSyncTime();
      const currentVersion = await this.getContentVersion();
      
      console.log(`Making request to: ${this.apiUrl}/sync/status`);
      const response = await fetch(`${this.apiUrl}/sync/status`);
      
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
      console.log(`Downloading content since: ${lastSync}`);
      
      if (this.testMode) {
        console.log('Test mode enabled, returning test data');
        return this.performTestSync();
      }
      
      const url = `${this.apiUrl}/sync/download?lastSync=${lastSync}`;
      console.log('Download URL:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`Content downloaded: ${result.data.syncType} sync, ${result.data.religions?.length || 0} religions, ${result.data.topics?.length || 0} topics`);
          
          await this.storeContent(result.data);
          await this.updateLastSyncTime(result.syncTimestamp);
          await this.updateContentVersion(result.data.version);
          
          // Send notification about new content
          await this.sendSyncNotification(result.data, lastSync);
          
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

  // Send notification when content is synced
  async sendSyncNotification(content, lastSync) {
    try {
      console.log('Attempting to send sync notification...');
      
      const preferences = await notificationService.getNotificationPreferences();
      console.log('Notification preferences:', preferences);
      
      // Only send notifications if user has enabled them
      if (!preferences.newContent) {
        console.log('New content notifications disabled by user');
        return;
      }

      let notificationTitle = '';
      let notificationBody = '';
      let newContentCount = 0;

      // Count new content
      if (content.religions && content.religions.length > 0) {
        newContentCount += content.religions.length;
      }
      if (content.topics && content.topics.length > 0) {
        newContentCount += content.topics.length;
      }

      if (newContentCount > 0) {
        if (lastSync === '0') {
          // First time sync
          notificationTitle = 'Bible Facts App Ready!';
          notificationBody = `Successfully loaded ${newContentCount} pieces of content. Start exploring!`;
        } else {
          // Incremental sync
          notificationTitle = 'New Content Available!';
          notificationBody = `Downloaded ${newContentCount} new Bible facts and topics.`;
        }

        console.log(`Sending notification: ${notificationTitle} - ${notificationBody}`);
        
        // Send the notification
        const notificationResult = await notificationService.sendLocalNotification(
          notificationTitle,
          notificationBody,
          {
            type: 'new_content',
            contentType: 'sync_update',
            contentCount: newContentCount,
            syncType: lastSync === '0' ? 'full' : 'incremental'
          }
        );

        console.log(`Sync notification result:`, notificationResult);
      } else {
        console.log('No new content to notify about');
      }
    } catch (error) {
      console.error('Error sending sync notification:', error);
      // Don't fail the sync if notification fails
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
      console.log('Performing full sync...');
      
      if (this.testMode) {
        console.log('Test mode enabled, performing test sync');
        return this.performTestSync();
      }
      
      // Send notification that sync is starting
      await this.sendSyncStartNotification('full');
      
      const result = await this.downloadContent('0'); // '0' means get all data
      console.log('Full sync completed successfully');
      
      // Send notification that sync completed
      await this.sendSyncCompleteNotification('full', result.data);
      
      return result;
    } catch (error) {
      console.error('Full sync failed:', error);
      
      // Send notification that sync failed
      await this.sendSyncErrorNotification('full', error.message);
      
      throw error;
    }
  }

  async performIncrementalSync() {
    try {
      console.log('Performing incremental sync...');
      
      if (this.testMode) {
        console.log('Test mode enabled, performing test sync');
        return this.performTestSync();
      }
      
      // Send notification that sync is starting
      await this.sendSyncStartNotification('incremental');
      
      const lastSync = await this.getLastSyncTime();
      const result = await this.downloadContent(lastSync);
      console.log('Incremental sync completed successfully');
      
      // Send notification that sync completed
      await this.sendSyncCompleteNotification('incremental', result.data);
      
      return result;
    } catch (error) {
      console.error('Incremental sync failed:', error);
      
      // Send notification that sync failed
      await this.sendSyncErrorNotification('incremental', error.message);
      
      throw error;
    }
  }

  // Send notification when sync starts
  async sendSyncStartNotification(syncType) {
    try {
      console.log(`Sending sync start notification for ${syncType} sync...`);
      
      const preferences = await notificationService.getNotificationPreferences();
      console.log('Sync start notification preferences:', preferences);
      
      if (!preferences.newContent) {
        console.log('New content notifications disabled, skipping sync start notification');
        return;
      }

      const title = syncType === 'full' ? 'Starting Full Sync' : 'Checking for Updates';
      const body = syncType === 'full' ? 'Downloading all content from CMS...' : 'Checking for new content...';

      console.log(`Sending sync start notification: ${title} - ${body}`);
      
      const result = await notificationService.sendLocalNotification(title, body, {
        type: 'sync_status',
        syncType: syncType,
        status: 'started'
      });
      
      console.log('Sync start notification result:', result);
    } catch (error) {
      console.error('Error sending sync start notification:', error);
    }
  }

  // Send notification when sync completes
  async sendSyncCompleteNotification(syncType, data) {
    try {
      console.log(`Sending sync complete notification for ${syncType} sync...`);
      
      const preferences = await notificationService.getNotificationPreferences();
      console.log('Sync complete notification preferences:', preferences);
      
      if (!preferences.newContent) {
        console.log('New content notifications disabled, skipping sync complete notification');
        return;
      }

      const title = 'Sync Complete!';
      const body = `Successfully synced ${data.religions?.length || 0} religions and ${data.topics?.length || 0} topics.`;

      console.log(`Sending sync complete notification: ${title} - ${body}`);
      
      const result = await notificationService.sendLocalNotification(title, body, {
        type: 'sync_status',
        syncType: syncType,
        status: 'completed',
        contentCount: (data.religions?.length || 0) + (data.topics?.length || 0)
      });
      
      console.log('Sync complete notification result:', result);
    } catch (error) {
      console.error('Error sending sync complete notification:', error);
    }
  }

  // Send notification when sync fails
  async sendSyncErrorNotification(syncType, errorMessage) {
    try {
      console.log(`Sending sync error notification for ${syncType} sync...`);
      
      const preferences = await notificationService.getNotificationPreferences();
      console.log('Sync error notification preferences:', preferences);
      
      if (!preferences.newContent) {
        console.log('New content notifications disabled, skipping sync error notification');
        return;
      }

      const title = 'Sync Failed';
      const body = `Failed to sync content: ${errorMessage}`;

      console.log(`Sending sync error notification: ${title} - ${body}`);
      
      const result = await notificationService.sendLocalNotification(title, body, {
        type: 'sync_status',
        syncType: syncType,
        status: 'failed',
        error: errorMessage
      });
      
      console.log('Sync error notification result:', result);
    } catch (error) {
      console.error('Error sending sync error notification:', error);
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
      
      // Send notification that content was cleared
      await this.sendContentClearedNotification();
    } catch (error) {
      console.error('Error clearing stored content:', error);
    }
  }

  // Send notification when content is cleared
  async sendContentClearedNotification() {
    try {
      const preferences = await notificationService.getNotificationPreferences();
      
      if (!preferences.newContent) return;

      await notificationService.sendLocalNotification(
        'Content Cleared',
        'All synced content has been removed from the app.',
        {
          type: 'content_cleared',
          action: 'clear_data'
        }
      );
    } catch (error) {
      console.error('Error sending content cleared notification:', error);
    }
  }

  // Toggle test mode
  toggleTestMode() {
    this.testMode = !this.testMode;
    console.log(`Test mode ${this.testMode ? 'enabled' : 'disabled'}`);
    return this.testMode;
  }

  // Get current test mode status
  isTestMode() {
    return this.testMode;
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
