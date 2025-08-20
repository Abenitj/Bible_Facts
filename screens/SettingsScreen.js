import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageService } from '../utils/storage';
import AppBar from '../components/AppBar';

const SettingsScreen = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const theme = await StorageService.getTheme();
    setIsDarkMode(theme === 'dark');
  };

  const toggleTheme = async (value) => {
    setIsDarkMode(value);
    const theme = value ? 'dark' : 'light';
    await StorageService.setTheme(theme);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will reset all your settings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset theme to light
              await StorageService.setTheme('light');
              setIsDarkMode(false);
              Alert.alert('Success', 'All settings have been reset');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear settings');
            }
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    // You can replace this with your actual privacy policy URL
    Alert.alert('Privacy Policy', 'Privacy policy will be available soon.');
  };

  const openTermsOfService = () => {
    // You can replace this with your actual terms of service URL
    Alert.alert('Terms of Service', 'Terms of service will be available soon.');
  };

  const contactSupport = () => {
    Alert.alert('Contact Support', 'Support contact information will be available soon.');
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, showSwitch = false, switchValue = false, onSwitchChange }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={showSwitch}>
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#ecf0f1', true: '#3498db' }}
          thumbColor={switchValue ? '#ffffff' : '#ffffff'}
        />
      ) : (
        <Text style={styles.settingArrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar 
        title="Settings"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem({
            icon: '🌙',
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
            icon: '🗑️',
            title: 'Clear All Settings',
            subtitle: 'Reset all app settings',
            onPress: clearAllData
          })}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem({
            icon: '📧',
            title: 'Contact Support',
            subtitle: 'Get help with the app',
            onPress: contactSupport
          })}
          {renderSettingItem({
            icon: '📄',
            title: 'Privacy Policy',
            subtitle: 'Read our privacy policy',
            onPress: openPrivacyPolicy
          })}
          {renderSettingItem({
            icon: '📋',
            title: 'Terms of Service',
            subtitle: 'Read our terms of service',
            onPress: openTermsOfService
          })}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingItem({
            icon: '📖',
            title: 'Melhik',
            subtitle: 'Version 1.0.0'
          })}
          {renderSettingItem({
            icon: '💡',
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
    backgroundColor: '#F0E6D2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#9b59b6',
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
    color: '#654321',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5DC',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D2B48C',
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
    color: '#654321',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8B4513',
  },
  settingArrow: {
    fontSize: 20,
    color: '#A0522D',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#A0522D',
    textAlign: 'center',
  },
});

export default SettingsScreen;
