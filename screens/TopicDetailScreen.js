import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import BibleReference from '../components/BibleReference';
import AmharicText from '../src/components/AmharicText';
import { getTopicById } from '../src/database/simpleData';

const TopicDetailScreen = ({ navigation, route }) => {
  const { religion, topicId } = route.params;
  const [topic, setTopic] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const loadTopic = async () => {
    try {
      const topicData = await getTopicById(topicId);
      setTopic(topicData);
      
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
    } catch (error) {
      console.error('Error loading topic:', error);
    }
  };

  if (!topic) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar 
          title="ዝርዝር መረጃ"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <AmharicText variant="body">ይዘት እያደረገ ነው...</AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppBar 
        title={topic.title}
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
          <AmharicText variant="caption" style={styles.questionLabel}>ጥያቄ:</AmharicText>
          <AmharicText variant="subheading" style={styles.questionText}>{topic.description}</AmharicText>
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
            <AmharicText style={styles.sectionIcon}>💡</AmharicText>
            <AmharicText variant="subheading" style={styles.sectionTitle}>የመጽሐፍ ቅዱስ ጽንሰ ሐሳብ</AmharicText>
          </View>
          <View style={styles.sectionContent}>
            <AmharicText variant="body" style={styles.sectionText}>{topic.content.concept}</AmharicText>
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
            <AmharicText style={styles.sectionIcon}>📝</AmharicText>
            <AmharicText variant="subheading" style={styles.sectionTitle}>ዝርዝር ማብራሪያ</AmharicText>
          </View>
          <View style={styles.sectionContent}>
            <AmharicText variant="body" style={styles.sectionText}>{topic.content.explanation}</AmharicText>
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
            <AmharicText style={styles.sectionIcon}>🎯</AmharicText>
            <AmharicText variant="subheading" style={styles.sectionTitle}>ዋና ነጥቦች</AmharicText>
          </View>
          <View style={styles.sectionContent}>
            {topic.content.keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPointContainer}>
                <AmharicText style={styles.keyPointBullet}>•</AmharicText>
                <AmharicText variant="body" style={styles.keyPointText}>{point}</AmharicText>
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
            <AmharicText style={styles.sectionIcon}>📖</AmharicText>
            <AmharicText variant="subheading" style={styles.sectionTitle}>የመጽሐፍ ቅዱስ ጥቅሶች</AmharicText>
          </View>
          <View style={styles.sectionContent}>
            <AmharicText variant="caption" style={styles.referencesIntro}>
              ሙሉ ጽሑፍ እና ማብራሪያ ለማንበብ ጥቅስ ይንኩ:
            </AmharicText>
            {topic.references.map((reference, index) => (
              <BibleReference key={index} reference={reference} />
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <AmharicText variant="body" style={styles.footerText}>
            "እርሱን በልባችሁ ጌታ አድርጉ፥ በልባችሁም ያለውን ተስፋ ለሚጠይቁ ሁሉ ለመግለጫ ሁልጊዜ ዝግጁ ሆናችሁ፥ ግን በደጋፊነትና በፍርሃት አድርጉ።"
          </AmharicText>
          <AmharicText variant="caption" style={styles.footerReference}>- 1 ጴጥሮስ 3:15</AmharicText>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
