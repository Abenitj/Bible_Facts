import React from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  const renderSettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    showArrow = true 
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
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
      
      <View style={styles.settingRight}>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={switchValue ? colors.primaryLight : colors.textTertiary}
          />
        ) : showArrow ? (
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <AmharicText variant="heading" style={[styles.headerTitle, { color: colors.textPrimary }]}>
          ቅንብሮች
        </AmharicText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Appearance
          </AmharicText>
          {renderSettingItem({
            icon: isDarkMode ? 'moon' : 'sunny',
            title: 'Dark Mode',
            subtitle: 'Switch between light and dark themes',
            showSwitch: true,
            switchValue: isDarkMode,
            onSwitchChange: toggleDarkMode,
            showArrow: false
          })}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support
          </AmharicText>
          {renderSettingItem({
            icon: 'help-circle-outline',
            title: 'Contact Support',
            subtitle: 'Get help and report issues',
            onPress: () => console.log('Contact Support pressed')
          })}
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Legal
          </AmharicText>
          {renderSettingItem({
            icon: 'shield-checkmark-outline',
            title: 'Privacy Policy',
            subtitle: 'Learn about data collection and usage',
            onPress: () => console.log('Privacy Policy pressed')
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AmharicText variant="caption" style={[styles.footerText, { color: colors.textTertiary }]}>
            Melhik Bible Facts App
          </AmharicText>
          <AmharicText variant="caption" style={[styles.footerText, { color: colors.textTertiary }]}>
            Version 1.0.0
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
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
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
