import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';
import SyncService from '../src/services/SyncService';
import ImageCacheService from '../src/services/ImageCacheService';

// Pure React Native gradient component (no native modules required)
const LinearGradientComponent = ({ colors, style, children, start, end, ...props }) => {
  if (!colors || colors.length === 0) {
    return <View style={style} {...props}>{children}</View>;
  }
  
  // For simple gradients, use the middle color as background
  // This avoids native module dependencies
  const middleIndex = Math.floor(colors.length / 2);
  const backgroundColor = colors[middleIndex] || colors[0];
  
  return (
    <View style={[style, { backgroundColor }]} {...props}>
      {children}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Start animations immediately
  useEffect(() => {
    // Create smooth animation sequence
    const animationSequence = async () => {
      // 1. Initial fade in with scale
      await new Promise(resolve => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start(resolve);
      });

      // 2. Logo rotation and scale animation
      await new Promise(resolve => {
        Animated.parallel([
          Animated.timing(logoScaleAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(resolve);
      });

      // 3. Text slide up and fade in
      await new Promise(resolve => {
        Animated.parallel([
          Animated.timing(slideUpAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(textFadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(resolve);
      });

      // 4. Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // 5. Continuous pulse animation for logo
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 6. Wait a moment for animations to complete, then navigate
      // (Navigation will happen after loading completes)
    };

    animationSequence();
  }, []);

  // Initialize app data and navigate when ready
  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        // Initialize services in parallel (non-blocking)
        const initPromises = [
          // Initialize image cache service
          ImageCacheService.initialize().catch(err => {
            console.warn('ImageCacheService initialization failed:', err);
            return null;
          }),
          // Load stored content (non-blocking)
          SyncService.getStoredContent().catch(err => {
            console.warn('Failed to load stored content:', err);
            return { religions: [], topics: [], topicDetails: [] };
          }),
        ];

        // Wait for initialization (but don't block on errors)
        await Promise.allSettled(initPromises);

        // Minimum splash screen display time (for smooth UX)
        // This ensures animations have time to play
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to main app only if component is still mounted
        if (isMounted) {
          try {
            navigation.replace('MainApp');
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback: try navigate instead of replace
            try {
              navigation.navigate('MainApp');
            } catch (fallbackError) {
              console.error('Fallback navigation also failed:', fallbackError);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Still proceed even if initialization fails
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              try {
                navigation.replace('MainApp');
              } catch (navError) {
                console.error('Navigation error in catch block:', navError);
                try {
                  navigation.navigate('MainApp');
                } catch (fallbackError) {
                  console.error('Fallback navigation also failed:', fallbackError);
                }
              }
            }
          }, 2000);
        }
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Background gradient */}
      <LinearGradientComponent
        colors={
          isDarkMode
            ? [colors.background, colors.surface, colors.background]
            : [colors.background, colors.primaryLight, colors.background]
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated background circles */}
      <Animated.View
        style={[
          styles.backgroundCircle1,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.circle,
            {
              backgroundColor: isDarkMode
                ? 'rgba(96, 165, 250, 0.1)'
                : 'rgba(59, 130, 246, 0.15)',
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.backgroundCircle2,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.circle,
            {
              backgroundColor: isDarkMode
                ? 'rgba(96, 165, 250, 0.08)'
                : 'rgba(59, 130, 246, 0.12)',
            },
          ]}
        />
      </Animated.View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo container with rotation and pulse */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScaleAnim },
                { rotate },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.logoGradient,
              { backgroundColor: colors.primary }
            ]}
          >
            <Ionicons
              name="book"
              size={64}
              color={colors.textInverse}
              style={styles.logoIcon}
            />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <AmharicText
            variant="largeTitle"
            color={colors.textPrimary}
            bold
            style={styles.appName}
          >
            Melhik
          </AmharicText>
          <AmharicText
            variant="body"
            color={colors.textSecondary}
            style={styles.appSubtitle}
          >
            የአስተማሪ መሳሪያ
          </AmharicText>
        </Animated.View>

        {/* Progress bar */}
        <Animated.View
          style={[
            styles.progressContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <View
            style={[
              styles.progressBarBackground,
              {
                backgroundColor: isDarkMode
                  ? colors.border
                  : colors.borderLight,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Footer quote */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: textFadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.footerLine,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />
        <AmharicText
          variant="caption"
          color={colors.textSecondary}
          align="center"
          style={styles.footerText}
        >
          "Always be prepared to give an answer to everyone who asks you to give
          the reason for the hope that you have."
        </AmharicText>
        <AmharicText
          variant="small"
          color={colors.textTertiary}
          align="center"
          style={styles.footerReference}
        >
          1 Peter 3:15
        </AmharicText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoIcon: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 18,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  progressContainer: {
    width: width * 0.6,
    marginTop: 24,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  footerLine: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
    maxWidth: width * 0.85,
  },
  footerReference: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
