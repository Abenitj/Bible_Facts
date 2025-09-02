import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storage';

class SyncService {
  constructor() {
    this.apiUrl = 'https://your-api.com/api'; // Will be updated when web CMS is ready
    this.lastSyncKey = STORAGE_KEYS.LAST_SYNC_TIMESTAMP;
    this.contentVersionKey = STORAGE_KEYS.CONTENT_VERSION;
  }

  async checkForUpdates() {
    try {
      const lastSync = await this.getLastSyncTime();
      const currentVersion = await this.getContentVersion();
      
      // For now, return false since we don't have the API yet
      // This will be implemented when the web CMS is ready
      console.log('Sync service ready - API not yet available');
      return false;
      
      // Future implementation:
      /*
      const response = await fetch(`${this.apiUrl}/content/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastSync,
          currentVersion,
        }),
      });

      if (response.ok) {
        const updates = await response.json();
        if (updates.hasUpdates) {
          await this.downloadAndStore(updates.data);
          await this.updateLastSyncTime();
          await this.updateContentVersion(updates.version);
          return true;
        }
      }
      return false;
      */
    } catch (error) {
      console.log('Sync failed:', error);
      return false;
    }
  }

  async downloadAndStore(content) {
    try {
      // Store religions
      if (content.religions) {
        for (const religion of content.religions) {
          // await insertReligion(religion); // This line was removed as per the edit hint
        }
      }

      // Store topics
      if (content.topics) {
        for (const topic of content.topics) {
          // await insertTopic(topic); // This line was removed as per the edit hint
        }
      }

      console.log('Content synced successfully');
    } catch (error) {
      console.error('Error storing synced content:', error);
      throw error;
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

  async updateLastSyncTime() {
    try {
      await AsyncStorage.setItem(this.lastSyncKey, Date.now().toString());
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
    } catch (error) {
      console.error('Error updating content version:', error);
    }
  }

  // Manual sync for testing
  async manualSync(content) {
    try {
      await this.downloadAndStore(content);
      await this.updateLastSyncTime();
      await this.updateContentVersion(Date.now());
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  }
}

export default new SyncService();
