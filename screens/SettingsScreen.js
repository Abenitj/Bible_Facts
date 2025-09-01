import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Settings',
      'Are you sure you want to clear all settings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All settings have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear settings.');
            }
          },
        },
      ]
    );
  };

  const contactSupport = () => {
    Alert.alert('Contact Support', 'Support feature coming soon!');
  };

  const openPrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
  };

  const openTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of service coming soon!');
  };

  const renderSettingItem = ({ icon, title, subtitle, showSwitch = false, switchValue = false, onSwitchChange, onPress }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color="#3B82F6" style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
          thumbColor={switchValue ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color="#6B7280" style={styles.settingArrow} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Settings Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem({
            icon: 'moon-outline',
            title: 'Dark Mode',
            subtitle: 'Switch between light and dark themes',
            showSwitch: true,
            switchValue: isDarkMode,
            onSwitchChange: toggleTheme
          })}
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          {renderSettingItem({
            icon: 'trash-outline',
            title: 'Clear All Settings',
            subtitle: 'Reset all app settings',
            onPress: clearAllData
          })}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem({
            icon: 'mail-outline',
            title: 'Contact Support',
            subtitle: 'Get help with the app',
            onPress: contactSupport
          })}
          {renderSettingItem({
            icon: 'document-text-outline',
            title: 'Privacy Policy',
            subtitle: 'Read our privacy policy',
            onPress: openPrivacyPolicy
          })}
          {renderSettingItem({
            icon: 'document-outline',
            title: 'Terms of Service',
            subtitle: 'Read our terms of service',
            onPress: openTermsOfService
          })}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingItem({
            icon: 'book-outline',
            title: 'Melhik',
            subtitle: 'Version 1.0.0'
          })}
          {renderSettingItem({
            icon: 'bulb-outline',
            title: 'Discover amazing biblical truths',
            subtitle: 'Learn fascinating facts from the Bible'
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for biblical education
          </Text>
          <Text style={styles.footerSubtext}>
            © 2024 Melhik App
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingArrow: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SettingsScreen;
