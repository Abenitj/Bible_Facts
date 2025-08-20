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
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBar from '../components/AppBar';
import AmharicText from '../src/components/AmharicText';
// import TextWithBibleVerses from '../components/TextWithBibleVerses';
import { getTopicById } from '../src/database/simpleData';

const TopicDetailScreen = ({ navigation, route }) => {
  const { religion, topicId } = route.params;
  const [topic, setTopic] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  // const [scale] = useState(new Animated.Value(1));
  // const [lastScale, setLastScale] = useState(1);

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

  // Gesture handlers removed for now to fix import issues

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
          {/* Question Section */}
          <Animated.View 
            style={[
              styles.questionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AmharicText variant="subheading" style={styles.questionText}>{topic.description}</AmharicText>
          </Animated.View>

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
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={24} color="#8B4513" style={styles.sectionIcon} />
              <AmharicText variant="subheading" style={styles.sectionTitle}>ዝርዝር ማብራሪያ</AmharicText>
              <TouchableOpacity onPress={handleShare} style={styles.questionShareButton}>
                <Ionicons name="share-outline" size={20} color="#8B4513" />
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              <AmharicText style={styles.explanationText}>
                {topic.content.explanation}
              </AmharicText>
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
    backgroundColor: '#F0E6D2',
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
    padding: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.2)',
    backgroundColor: '#F5F0E0',
    borderRadius: 12,
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  questionText: {
    fontSize: 18,
    color: '#8B4513',
    lineHeight: 26,
    fontWeight: '600',
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.2)',
    backgroundColor: '#F5F0E0',
    borderRadius: 12,
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#8B4513',
    flex: 1,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  sectionContent: {
    flex: 1,
  },
  explanationText: {
    fontSize: 16,
    color: '#A0522D',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 69, 19, 0.2)',
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
