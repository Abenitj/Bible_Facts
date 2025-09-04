import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import AppBar from '../components/AppBar';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';
import { clearAllAppData, getStorageInfo } from '../utils/storage';
import SyncService from '../src/services/SyncService';

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const [storageInfo, setStorageInfo] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      console.log('Starting sync from settings...');
      const result = await SyncService.performFullSync();
      console.log('Sync completed:', result.message);
      Alert.alert('Sync Complete', 'Content has been synced successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      Alert.alert('Sync Failed', 'Failed to sync content. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all synced content and reset the app to its initial state. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllAppData();
              await SyncService.clearStoredContent();
              Alert.alert('Success', 'All app data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleStorageInfo = async () => {
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
      Alert.alert(
        'Storage Information',
        `App Data: ${info.appData}\nSync Data: ${info.syncData}\nUser Preferences: ${info.userPreferences}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error getting storage info:', error);
      Alert.alert('Error', 'Failed to get storage information.');
    }
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, showArrow = true, isDestructive = false }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: colors.cardBackground, borderColor: colors.border }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={[styles.settingIcon, { backgroundColor: isDestructive ? '#ef4444' : colors.primaryLight }]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDestructive ? 'white' : colors.primary} 
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
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar 
        title="ቅንብሮች"
        onSyncPress={handleSync}
        isSyncing={syncing}
        colors={colors}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Appearance
          </AmharicText>
          {renderSettingItem({
            icon: isDarkMode ? 'sunny' : 'moon',
            title: isDarkMode ? 'Light Mode' : 'Dark Mode',
            subtitle: 'Switch between light and dark themes',
            onPress: toggleDarkMode,
            showArrow: false
          })}
        </View>


        {/* Data Management Section */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Data Management
          </AmharicText>
          
          
          {renderSettingItem({
            icon: 'information-circle',
            title: 'Storage Information',
            subtitle: 'View app data usage and sync status',
            onPress: handleStorageInfo
          })}
          
          {renderSettingItem({
            icon: 'trash',
            title: 'Clear All Data',
            subtitle: 'Remove all synced content and reset app',
            onPress: handleClearData,
            isDestructive: true
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AmharicText variant="caption" style={[styles.footerText, { color: colors.textSecondary }]}>
            Melhik Evangelism Tool v1.0.0
          </AmharicText>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
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
  settingRight: {
    width: 50,
    alignItems: 'flex-end',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;
