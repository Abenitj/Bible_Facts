import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './NotificationService';

class WebhookNotificationService {
  constructor() {
    this.webhookUrl = null;
    this.isListening = false;
    this.pollingInterval = null;
    this.lastCheckTime = null;
  }

  // Initialize webhook service
  async initialize() {
    try {
      // Load webhook configuration
      const config = await this.loadWebhookConfig();
      if (config.enabled && config.webhookUrl) {
        this.webhookUrl = config.webhookUrl;
        this.startPolling();
        console.log('Webhook notification service initialized');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing webhook service:', error);
      return false;
    }
  }

  // Load webhook configuration from storage
  async loadWebhookConfig() {
    try {
      const config = await AsyncStorage.getItem('webhookConfig');
      return config ? JSON.parse(config) : this.getDefaultWebhookConfig();
    } catch (error) {
      console.error('Error loading webhook config:', error);
      return this.getDefaultWebhookConfig();
    }
  }

  // Save webhook configuration to storage
  async saveWebhookConfig(config) {
    try {
      await AsyncStorage.setItem('webhookConfig', JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error saving webhook config:', error);
      return false;
    }
  }

  // Get default webhook configuration
  getDefaultWebhookConfig() {
    return {
      enabled: false,
      webhookUrl: '',
      pollingInterval: 30000, // 30 seconds
      lastSyncTime: null,
      autoSync: true
    };
  }

  // Start polling for new notifications
  startPolling() {
    if (this.isListening) return;

    this.isListening = true;
    const interval = 30000; // 30 seconds

    this.pollingInterval = setInterval(async () => {
      await this.checkForNewNotifications();
    }, interval);

    console.log('Started polling for webhook notifications');
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isListening = false;
    console.log('Stopped polling for webhook notifications');
  }

  // Check for new notifications via webhook
  async checkForNewNotifications() {
    try {
      if (!this.webhookUrl) return;

      const config = await this.loadWebhookConfig();
      const lastSync = config.lastSyncTime || new Date(0).toISOString();

      // Make request to webhook endpoint
      const response = await fetch(`${this.webhookUrl}/check-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastSync: lastSync,
          deviceId: await this.getDeviceId(),
          appVersion: '1.0.0'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.notifications && data.notifications.length > 0) {
          await this.processNotifications(data.notifications);
          
          // Update last sync time
          config.lastSyncTime = new Date().toISOString();
          await this.saveWebhookConfig(config);
        }
      }
    } catch (error) {
      console.error('Error checking webhook notifications:', error);
    }
  }

  // Process received notifications
  async processNotifications(notifications) {
    for (const notification of notifications) {
      try {
        // Send local notification
        await notificationService.sendLocalNotification(
          notification.title,
          notification.body,
          {
            type: notification.type || 'webhook',
            data: notification.data || {},
            timestamp: notification.timestamp || new Date().toISOString()
          }
        );

        console.log(`Processed webhook notification: ${notification.title}`);
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    }
  }

  // Manual trigger to check for notifications
  async manualCheck() {
    try {
      await this.checkForNewNotifications();
      return true;
    } catch (error) {
      console.error('Manual check failed:', error);
      return false;
    }
  }

  // Send test webhook notification
  async sendTestWebhookNotification() {
    try {
      const testNotification = {
        title: 'Test Webhook Notification',
        body: 'This notification was triggered via webhook',
        type: 'test',
        data: { source: 'webhook' },
        timestamp: new Date().toISOString()
      };

      await this.processNotifications([testNotification]);
      return true;
    } catch (error) {
      console.error('Error sending test webhook notification:', error);
      return false;
    }
  }

  // Get device identifier
  async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `device_${Date.now()}`;
    }
  }

  // Update webhook configuration
  async updateWebhookConfig(newConfig) {
    try {
      const currentConfig = await this.loadWebhookConfig();
      const updatedConfig = { ...currentConfig, ...newConfig };
      
      await this.saveWebhookConfig(updatedConfig);

      // Apply changes
      if (updatedConfig.enabled && updatedConfig.webhookUrl) {
        this.webhookUrl = updatedConfig.webhookUrl;
        this.startPolling();
      } else {
        this.stopPolling();
      }

      return true;
    } catch (error) {
      console.error('Error updating webhook config:', error);
      return false;
    }
  }

  // Get webhook status
  async getWebhookStatus() {
    try {
      const config = await this.loadWebhookConfig();
      return {
        enabled: config.enabled,
        webhookUrl: config.webhookUrl,
        isListening: this.isListening,
        lastSyncTime: config.lastSyncTime,
        autoSync: config.autoSync
      };
    } catch (error) {
      console.error('Error getting webhook status:', error);
      return null;
    }
  }

  // Cleanup
  cleanup() {
    this.stopPolling();
  }
}

// Create and export a singleton instance
const webhookNotificationService = new WebhookNotificationService();
export default webhookNotificationService;
