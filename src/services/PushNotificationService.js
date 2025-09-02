import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class PushNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Initialize the push notification service
  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }

      // Get the token that uniquely identifies this device
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        this.expoPushToken = token.data;
        await this.savePushToken(token.data);
        console.log('Expo push token:', token.data);
        
        // Send token to your server (for production)
        await this.sendTokenToServer(token.data);
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Send push token to your server
  async sendTokenToServer(token) {
    try {
      // Replace with your actual server endpoint
      const response = await fetch('https://your-server.com/api/push-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId: await this.getUserId(),
          deviceType: Device.osName,
          appVersion: Constants.expoConfig?.version || '1.0.0',
        }),
      });

      if (response.ok) {
        console.log('Push token sent to server successfully');
      } else {
        console.log('Failed to send push token to server');
      }
    } catch (error) {
      console.error('Error sending push token to server:', error);
    }
  }

  // Get user ID from storage
  async getUserId() {
    try {
      return await AsyncStorage.getItem('userId');
    } catch (error) {
      return null;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Push notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Push notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle incoming push notifications
  handleNotificationReceived(notification) {
    const data = notification.request.content.data;
    console.log('Handling push notification:', data);
    
    // You can add custom logic here
    // For example, updating app state, showing in-app notifications, etc.
  }

  // Handle notification responses (user taps)
  handleNotificationResponse(response) {
    const data = response.notification.request.content.data;
    
    // Handle different types of notifications
    if (data?.type === 'daily_verse') {
      console.log('Navigating to daily verse from push notification');
      // Navigate to daily verse screen
    } else if (data?.type === 'new_content') {
      console.log('Navigating to new content from push notification');
      // Navigate to new content screen
    } else if (data?.type === 'reminder') {
      console.log('Handling reminder from push notification');
      // Handle reminder
    } else if (data?.type === 'bible_fact') {
      console.log('Navigating to Bible fact from push notification');
      // Navigate to specific Bible fact
    }
  }

  // Save push token to storage
  async savePushToken(token) {
    try {
      await AsyncStorage.setItem('expoPushToken', token);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Get stored push token
  async getPushToken() {
    try {
      return await AsyncStorage.getItem('expoPushToken');
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Test push notification (for development)
  async testPushNotification() {
    try {
      if (!this.expoPushToken) {
        console.log('No push token available');
        return false;
      }

      // Send test notification to this device
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.expoPushToken,
          title: 'Test Push Notification',
          body: 'This is a test push notification from Bible Facts app!',
          data: { type: 'test', timestamp: Date.now() },
          sound: 'default',
          priority: 'high',
        }),
      });

      if (response.ok) {
        console.log('Test push notification sent successfully');
        return true;
      } else {
        console.log('Failed to send test push notification');
        return false;
      }
    } catch (error) {
      console.error('Error sending test push notification:', error);
      return false;
    }
  }

  // Send push notification to specific user
  async sendPushToUser(userId, title, body, data = {}) {
    try {
      // This would typically be done from your server
      // But for testing, you can use the Expo push service directly
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.expoPushToken, // In production, get token from server
          title,
          body,
          data,
          sound: 'default',
          priority: 'high',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Check if running in development build
  isDevelopmentBuild() {
    return Constants.appOwnership === 'standalone';
  }

  // Check if running in Expo Go
  isExpoGo() {
    return Constants.appOwnership === 'expo';
  }
}

// Create and export a singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
