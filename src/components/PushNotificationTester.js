import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from './AmharicText';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getColors } from '../theme/colors';
import pushNotificationService from '../services/PushNotificationService';

const PushNotificationTester = ({ navigation }) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  const [pushToken, setPushToken] = useState(null);
  const [isDevelopmentBuild, setIsDevelopmentBuild] = useState(false);
  const [isExpoGo, setIsExpoGo] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkEnvironment();
    getPushToken();
  }, []);

  const checkEnvironment = () => {
    const devBuild = pushNotificationService.isDevelopmentBuild();
    const expoGo = pushNotificationService.isExpoGo();
    
    setIsDevelopmentBuild(devBuild);
    setIsExpoGo(expoGo);
    
    console.log('Environment check:', { devBuild, expoGo });
  };

  const getPushToken = async () => {
    try {
      const token = await pushNotificationService.getPushToken();
      setPushToken(token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  };

  const initializePushNotifications = async () => {
    try {
      setLoading(true);
      const success = await pushNotificationService.initialize();
      
      if (success) {
        Alert.alert('Success', 'Push notifications initialized successfully!');
        await getPushToken(); // Refresh token
      } else {
        Alert.alert('Error', 'Failed to initialize push notifications. Check permissions.');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      Alert.alert('Error', 'Failed to initialize push notifications.');
    } finally {
      setLoading(false);
    }
  };

  const testPushNotification = async () => {
    try {
      setLoading(true);
      const success = await pushNotificationService.testPushNotification();
      
      if (success) {
        Alert.alert('Success', 'Test push notification sent! Check your device.');
      } else {
        Alert.alert('Error', 'Failed to send test push notification.');
      }
    } catch (error) {
      console.error('Error testing push notification:', error);
      Alert.alert('Error', 'Failed to test push notification.');
    } finally {
      setLoading(false);
    }
  };

  const sendCustomPushNotification = async () => {
    try {
      setLoading(true);
      const success = await pushNotificationService.sendPushToUser(
        'test-user',
        'Custom Bible Fact',
        'Here is an interesting Bible fact for you!',
        { type: 'bible_fact', factId: '123' }
      );
      
      if (success) {
        Alert.alert('Success', 'Custom push notification sent!');
      } else {
        Alert.alert('Error', 'Failed to send custom push notification.');
      }
    } catch (error) {
      console.error('Error sending custom push notification:', error);
      Alert.alert('Error', 'Failed to send custom push notification.');
    } finally {
      setLoading(false);
    }
  };

  const renderInfoCard = ({ title, content, icon, color }) => (
    <View style={[styles.infoCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <View style={styles.infoContent}>
        <AmharicText variant="subheading" style={[styles.infoTitle, { color: colors.textPrimary }]}>
          {title}
        </AmharicText>
        <AmharicText variant="caption" style={[styles.infoText, { color: colors.textSecondary }]}>
          {content}
        </AmharicText>
      </View>
    </View>
  );

  const renderButton = ({ title, onPress, icon, variant = 'primary' }) => (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: variant === 'primary' ? colors.primary : colors.border,
          borderColor: colors.border 
        }
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={variant === 'primary' ? 'white' : colors.textSecondary} 
        style={styles.buttonIcon}
      />
      <AmharicText 
        variant="subheading" 
        style={[
          styles.buttonText, 
          { color: variant === 'primary' ? 'white' : colors.textSecondary }
        ]}
      >
        {title}
      </AmharicText>
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
          Push Notification Tester
        </AmharicText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Environment Info */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Environment Information
          </AmharicText>
          
          {renderInfoCard({
            title: 'Build Type',
            content: isDevelopmentBuild ? 'Development Build' : 'Expo Go',
            icon: isDevelopmentBuild ? 'phone-portrait' : 'globe',
            color: isDevelopmentBuild ? '#10B981' : '#F59E0B'
          })}
          
          {renderInfoCard({
            title: 'Push Token',
            content: pushToken ? `${pushToken.substring(0, 20)}...` : 'Not available',
            icon: 'key',
            color: pushToken ? '#3B82F6' : '#6B7280'
          })}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Actions
          </AmharicText>
          
          {renderButton({
            title: 'Initialize Push Notifications',
            onPress: initializePushNotifications,
            icon: 'notifications',
            variant: 'primary'
          })}
          
          {renderButton({
            title: 'Test Push Notification',
            onPress: testPushNotification,
            icon: 'send',
            variant: 'primary'
          })}
          
          {renderButton({
            title: 'Send Custom Notification',
            onPress: sendCustomPushNotification,
            icon: 'create',
            variant: 'primary'
          })}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Testing Instructions
          </AmharicText>
          
          <View style={[styles.instructionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <AmharicText variant="caption" style={[styles.instructionText, { color: colors.textSecondary }]}>
              1. Make sure you're using a development build (not Expo Go){'\n'}
              2. Grant notification permissions when prompted{'\n'}
              3. Click "Initialize Push Notifications"{'\n'}
              4. Click "Test Push Notification" to send a test{'\n'}
              5. You should receive a notification on your device
            </AmharicText>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Status
          </AmharicText>
          
          <View style={[styles.statusCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {isDevelopmentBuild 
                ? '✅ Ready to test push notifications' 
                : '⚠️ Push notifications only work in development builds'
              }
            </Text>
          </View>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  statusCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default PushNotificationTester;
