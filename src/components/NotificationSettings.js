import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from './AmharicText';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getColors } from '../theme/colors';
import notificationService from '../services/NotificationService';

const NotificationSettings = ({ navigation }) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  const [preferences, setPreferences] = useState({
    dailyVerse: true,
    newContent: true,
    reminders: true,
    sound: true,
    vibration: true,
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleToggle = async (key, value) => {
    try {
      setLoading(true);
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      
      const success = await notificationService.updateNotificationPreferences(newPreferences);
      if (!success) {
        Alert.alert('Error', 'Failed to update notification settings. Please try again.');
        // Revert the change
        setPreferences(preferences);
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
      // Revert the change
      setPreferences(preferences);
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const success = await notificationService.sendLocalNotification(
        'Test Notification',
        'This is a test notification from Bible Facts app',
        { type: 'test' }
      );
      
      if (success) {
        Alert.alert('Success', 'Test notification sent successfully!');
      } else {
        Alert.alert('Error', 'Failed to send test notification.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, showArrow = true, isToggle = false, toggleValue = false, onToggleChange = null }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: colors.cardBackground, borderColor: colors.border }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isToggle}
    >
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={colors.primary} 
          />
        </View>
        <View style={styles.settingText}>
          <AmharicText variant="subheading" style={[styles.settingTitle, { color: colors.textPrimary }]}>
            {title}
          </AmharicText>
          {subtitle && (
            <AmharicText variant="caption" style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </AmharicText>
          )}
        </View>
      </View>
      
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={toggleValue ? colors.primary : colors.textSecondary}
          disabled={loading}
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AmharicText variant="heading" style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Notification Settings
        </AmharicText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Daily Verse Notifications */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Daily Verse Notifications
          </AmharicText>
          
          {renderSettingItem({
            icon: 'book',
            title: 'Daily Bible Verse',
            subtitle: 'Receive a daily Bible verse notification at 9:00 AM',
            isToggle: true,
            toggleValue: preferences.dailyVerse,
            onToggleChange: (value) => handleToggle('dailyVerse', value)
          })}
        </View>

        {/* Content Notifications */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Content Notifications
          </AmharicText>
          
          {renderSettingItem({
            icon: 'newspaper',
            title: 'New Content Alerts',
            subtitle: 'Get notified when new Bible facts are available',
            isToggle: true,
            toggleValue: preferences.newContent,
            onToggleChange: (value) => handleToggle('newContent', value)
          })}
          
          {renderSettingItem({
            icon: 'alarm',
            title: 'Reminders',
            subtitle: 'Receive reminder notifications',
            isToggle: true,
            toggleValue: preferences.reminders,
            onToggleChange: (value) => handleToggle('reminders', value)
          })}
        </View>

        {/* Notification Behavior */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Notification Behavior
          </AmharicText>
          
          {renderSettingItem({
            icon: 'volume-high',
            title: 'Sound',
            subtitle: 'Play sound for notifications',
            isToggle: true,
            toggleValue: preferences.sound,
            onToggleChange: (value) => handleToggle('sound', value)
          })}
          
          {renderSettingItem({
            icon: 'phone-portrait',
            title: 'Vibration',
            subtitle: 'Vibrate device for notifications',
            isToggle: true,
            toggleValue: preferences.vibration,
            onToggleChange: (value) => handleToggle('vibration', value)
          })}
        </View>

        {/* Test Section */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Testing
          </AmharicText>
          
          {renderSettingItem({
            icon: 'send',
            title: 'Send Test Notification',
            subtitle: 'Test your notification settings',
            onPress: testNotification
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NotificationSettings;
