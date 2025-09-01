import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const [slideAnim] = useState(new Animated.Value(50));
  const [textFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Splash screen animation sequence
    const animationSequence = async () => {
      // Initial fade in
      await new Promise(resolve => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(resolve);
      });

      // Scale and slide animation
      await new Promise(resolve => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start(resolve);
      });

      // Text fade in
      await new Promise(resolve => {
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(resolve);
      });

      // Wait a moment, then navigate
      setTimeout(() => {
        navigation.replace('MainApp');
      }, 1500);
    };

    animationSequence();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      


      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ],
          },
        ]}
      >
        {/* Bible Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.bibleIcon}>📖</Text>
        </View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <Text style={styles.appName}>Melhik</Text>
          <Text style={styles.appSubtitle}>Evangelism Tool</Text>
        </Animated.View>
      </Animated.View>

      {/* Bible Verse */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: textFadeAnim,
          },
        ]}
      >
        <Text style={styles.footerText}>
          "Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have."
        </Text>
        <Text style={styles.footerReference}>- 1 Peter 3:15</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  bibleIcon: {
    fontSize: 50,
    color: '#FFFFFF',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 18,
    color: '#DBEAFE',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  footer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 22,
  },
  footerReference: {
    fontSize: 14,
    color: '#DBEAFE',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen;
