import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { PanGestureHandler, State, PinchGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBar from '../components/AppBar';
import AmharicText from '../src/components/AmharicText';
import ZoomableText from '../components/ZoomableText';
import TextWithBibleVerses from '../components/TextWithBibleVerses';
import { getTopicById } from '../src/database/simpleData';
import { mockBibleVerses } from '../src/database/mockBibleVerses';

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

  const handleShare = async () => {
    if (!topic) return;

    try {
      const shareContent = {
        title: topic.title,
        message: `${topic.title}\n\nጥያቄ: ${topic.description}\n\nዝርዝር ማብራሪያ:\n${topic.content.explanation}\n\nየመጽሐፍ ቅዱስ ጥቅሶች:\n${topic.references.map(ref => ref.verse).join(', ')}\n\nMelhik - Evangelism Tool`,
        url: 'https://melhik.app', // Replace with actual app URL when available
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('ስህተት', 'ይዘቱን ለማጋራት አልተቻለም።');
    }
  };

  // Zoom functionality moved to ZoomableText component

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
        title="ዝርዝር መረጃ"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
          {/* Description Section */}
          <Animated.View 
            style={[
              styles.descriptionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Question Section */}
            <View style={styles.questionSection}>
              <AmharicText variant="subheading" style={styles.questionText}>{topic.description}</AmharicText>
            </View>
            
            {/* Separator Above */}
            <View style={styles.separator} />
            
            {/* Description Title */}
            <View style={styles.descriptionTitleSection}>
              <Ionicons name="create-outline" size={20} color="#8B4513" style={styles.sectionIcon} />
              <AmharicText variant="subheading" style={styles.sectionTitle}>ዝርዝር ማብራሪያ</AmharicText>
            </View>
            
            {/* Separator Below */}
            <View style={styles.separator} />
            
            <View style={styles.sectionContent}>
              <TextWithBibleVerses 
                text={topic.content.explanation}
                style={styles.explanationText}
                verseData={mockBibleVerses}
              />
            </View>
            
            {/* Share Button at Bottom */}
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-social" size={18} color="#8B4513" />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    padding: 12,
  },
  // questionContainer removed - question now included in description container
  questionSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  questionText: {
    fontSize: 18,
    color: '#1F2937',
    lineHeight: 26,
    fontWeight: 'bold',
  },
  descriptionTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    marginVertical: 8,
  },
  questionShareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 1,
  },
  descriptionContainer: {
    padding: 20,
    marginBottom: 20,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  shareButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 1,
  },
  sectionContent: {
    flex: 1,
    paddingBottom: 60, // Add space for the share button
  },
  explanationText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  // Footer styles removed
});

export default TopicDetailScreen;
