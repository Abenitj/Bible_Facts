import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBar from '../components/AppBar';
import AmharicText from '../src/components/AmharicText';
import TextWithBibleVerses from '../components/TextWithBibleVerses';
import ErrorModal from '../components/ErrorModal';
import SyncService from '../src/services/SyncService';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const TopicDetailScreen = ({ navigation, route }) => {
  const { religion, topicId } = route.params;
  const [topic, setTopic] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    if (topicId) {
      loadTopicData();
    }
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      const storedContent = await SyncService.getStoredContent();
      
      // Find the topic
      const foundTopic = storedContent.topics.find(t => t.id === topicId);
      if (foundTopic) {
        setTopic(foundTopic);
        
        // Find the topic detail
        const foundDetail = storedContent.topicDetails.find(d => d.topicId === topicId);
        if (foundDetail) {
          setTopicDetail(foundDetail);
          console.log(`Loaded topic detail for: ${foundTopic.title}`);
        } else {
          console.log('No topic detail found');
        }
      } else {
        console.log('Topic not found');
      }
    } catch (error) {
      console.error('Error loading topic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      console.log('Starting sync from topic detail screen...');
      const result = await SyncService.performFullSync();
      console.log('Sync result:', result);
      
      if (result.success) {
        console.log('Sync completed successfully:', result.message);
        // Reload topic data after successful sync
        await loadTopicData();
        console.log('Topic data synced and reloaded');
      } else {
        console.log('Sync failed:', result.message);
        // Show error modal for real sync failures
        setErrorMessage(result.message || 'Sync failed. Please try again.');
        setShowErrorModal(true);
        // Still try to load existing data even if sync fails
        await loadTopicData();
      }
    } catch (error) {
      console.error('Error syncing:', error);
      // Show error modal for unexpected errors
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
      // Still try to load existing data even if sync fails
      await loadTopicData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (!topic || !topicDetail) return;

    try {
      const shareContent = {
        title: topic.title,
        message: `${topic.title}\n\nጥያቄ: ${topic.description}\n\nዝርዝር ማብራሪያ:\n${topicDetail.explanation}\n\nMelhik - Evangelism Tool`,
        url: 'https://melhik.app',
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

  // If no topic is provided, show a message
  if (!topicId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            ርዕሰ መልእክት ይምረጡ
          </AmharicText>
          <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
            ዝርዝር መረጃ ለማግኘት ርዕሰ መልእክት ይምረጡ።
          </AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <AppBar 
          title="ዝርዝር መረጃ"
          colors={colors}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AmharicText variant="body" style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading content...
          </AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  if (!topic || !topicDetail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <AppBar 
          title="ዝርዝር መረጃ"
          colors={colors}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            ይዘት አልተገኘም
          </AmharicText>
          <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
            ይህ ርዕሰ መልእክት ዝርዝር መረጃ አልተገኘም።
          </AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ErrorModal
        visible={showErrorModal}
        title="Sync Error"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
      <AppBar 
        title="ዝርዝር መረጃ"
        colors={colors}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Question Section */}
        <View style={[styles.questionSection, { backgroundColor: colors.cardBackground }]}>
          <AmharicText variant="subheading" style={[styles.questionTitle, { color: colors.textPrimary }]}>
            ጥያቄ
          </AmharicText>
          <AmharicText variant="body" style={[styles.questionText, { color: colors.textPrimary }]}>
            {topic.description}
          </AmharicText>
        </View>

        {/* Separator */}
        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {/* Description Section */}
        <View style={[styles.descriptionSection, { backgroundColor: colors.cardBackground }]}>
          <AmharicText variant="subheading" style={[styles.descriptionTitle, { color: colors.textPrimary }]}>
            ዝርዝር ማብራሪያ
          </AmharicText>
          
          <View style={styles.sectionContent}>
            <TextWithBibleVerses
              text={topicDetail.explanation}
              style={[styles.explanationText, { color: colors.textSecondary }]}
              verseData={[]} // Pass an empty array as Bible verses are now data-free
            />
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={24} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 2,
    paddingVertical: 16,
    paddingBottom: 80,
  },
  questionSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionSection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    marginVertical: 12,
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
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  shareButton: {
    alignSelf: 'center',
    padding: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionContent: {
    flex: 1,
    paddingBottom: 80,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 26,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
});

export default TopicDetailScreen;
