import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior for SDK 53
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Initialize the notification service
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
        console.log('Notification permissions not granted');
        return false;
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle incoming notifications
  handleNotificationReceived(notification) {
    // You can add custom logic here for when notifications are received
    console.log('Handling received notification:', notification);
  }

  // Handle notification responses (user taps)
  handleNotificationResponse(response) {
    const data = response.notification.request.content.data;
    
    // Handle different types of notifications
    if (data?.type === 'daily_verse') {
      console.log('Navigating to daily verse');
      // You can add navigation logic here
    } else if (data?.type === 'new_content') {
      console.log('Navigating to new content');
      // You can add navigation logic here
    } else if (data?.type === 'reminder') {
      console.log('Handling reminder');
      // You can add reminder logic here
    }
  }

  // Send local notification
  async sendLocalNotification(title, body, data = {}) {
    try {
      console.log(`Sending local notification: ${title} - ${body}`);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
      
      console.log('Local notification sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return false;
    }
  }

  // Schedule daily verse notification
  async scheduleDailyVerseNotification(hour = 9, minute = 0) {
    try {
      // Cancel existing daily notifications
      await this.cancelScheduledNotification('daily_verse');

      const trigger = {
        hour,
        minute,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Bible Verse',
          body: 'Start your day with wisdom from the Bible',
          data: { type: 'daily_verse' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
        identifier: 'daily_verse',
      });

      // Save notification time to storage
      await AsyncStorage.setItem('dailyVerseNotificationTime', JSON.stringify({ hour, minute }));
      console.log(`Daily verse notification scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
      return true;
    } catch (error) {
      console.error('Error scheduling daily verse notification:', error);
      return false;
    }
  }

  // Cancel specific scheduled notification
  async cancelScheduledNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      return false;
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Check notification permissions
  async checkPermissions() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return 'undetermined';
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return 'undetermined';
    }
  }

  // Get notification preferences from storage
  async getNotificationPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('notificationPreferences');
      return preferences ? JSON.parse(preferences) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  // Save notification preferences to storage
  async saveNotificationPreferences(preferences) {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return false;
    }
  }

  // Get default notification preferences
  getDefaultPreferences() {
    return {
      dailyVerse: true,
      dailyVerseTime: { hour: 9, minute: 0 },
      newContent: true,
      reminders: true,
      sound: true,
      vibration: true,
    };
  }

  // Update notification preferences
  async updateNotificationPreferences(newPreferences) {
    try {
      const currentPreferences = await this.getNotificationPreferences();
      const updatedPreferences = { ...currentPreferences, ...newPreferences };
      
      await this.saveNotificationPreferences(updatedPreferences);

      // Apply changes
      if (updatedPreferences.dailyVerse) {
        await this.scheduleDailyVerseNotification(
          updatedPreferences.dailyVerseTime.hour,
          updatedPreferences.dailyVerseTime.minute
        );
      } else {
        await this.cancelScheduledNotification('daily_verse');
      }

      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
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

  // Test notification functionality
  async testNotification() {
    try {
      const success = await this.sendLocalNotification(
        'Test Notification',
        'This is a test notification from Bible Facts app',
        { type: 'test' }
      );
      
      if (success) {
        console.log('Test notification sent successfully');
        return true;
      } else {
        console.log('Failed to send test notification');
        return false;
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
