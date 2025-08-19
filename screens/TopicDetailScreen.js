import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import BibleReference from '../components/BibleReference';

const TopicDetailScreen = ({ navigation, route }) => {
  const { religion, topic } = route.params;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <AppBar 
        title={topic.title} 
        showMenu={false}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <Animated.View 
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{topic.description}</Text>
        </Animated.View>

        {/* Concept */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💡</Text>
            <Text style={styles.sectionTitle}>Biblical Concept</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionText}>{topic.content.concept}</Text>
          </View>
        </Animated.View>

        {/* Explanation */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Detailed Explanation</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.sectionText}>{topic.content.explanation}</Text>
          </View>
        </Animated.View>

        {/* Key Points */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎯</Text>
            <Text style={styles.sectionTitle}>Key Points</Text>
          </View>
          <View style={styles.sectionContent}>
            {topic.content.keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPointContainer}>
                <Text style={styles.keyPointBullet}>•</Text>
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Bible References */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📖</Text>
            <Text style={styles.sectionTitle}>Bible References</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.referencesIntro}>
              Tap on any verse to read the full text and explanation:
            </Text>
            {topic.references.map((reference, index) => (
              <BibleReference key={index} reference={reference} />
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "Sanctify Christ as Lord in your hearts, always being ready to make a defense to everyone who asks you to give an account for the hope that is in you."
          </Text>
          <Text style={styles.footerReference}>- 1 Peter 3:15</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DEB887',
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 18,
    color: '#8B4513',
    lineHeight: 26,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DEB887',
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  sectionContent: {
    flex: 1,
  },
  sectionText: {
    fontSize: 16,
    color: '#A0522D',
    lineHeight: 24,
  },
  keyPointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  keyPointBullet: {
    fontSize: 18,
    color: '#8B4513',
    marginRight: 12,
    marginTop: 2,
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    color: '#A0522D',
    lineHeight: 24,
  },
  referencesIntro: {
    fontSize: 14,
    color: '#A0522D',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#DEB887',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  footerReference: {
    fontSize: 14,
    color: '#A0522D',
    fontWeight: 'bold',
  },
});

export default TopicDetailScreen;
