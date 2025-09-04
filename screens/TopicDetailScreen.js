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
import { useReadingProgress } from '../src/contexts/ReadingProgressContext';
import { useBookmarks } from '../src/contexts/BookmarksContext';
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
  const { markTopicAsRead, isTopicRead } = useReadingProgress();
  const { toggleBookmark, isBookmarked } = useBookmarks();
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
          
          // Mark topic as read
          markTopicAsRead(topicId, religion.id);
          console.log(`Marked topic ${topicId} as read`);
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
      let shareMessage = `${topic.title}\n\nጥያቄ: ${topic.description}\n\nዝርዝር ማብራሪያ:\n${topicDetail.explanation}`;

      // Add Bible verses if available
      if (topicDetail.bibleVerses && topicDetail.bibleVerses.length > 0) {
        shareMessage += `\n\nቅዱስ ጥቅሶች:\n${topicDetail.bibleVerses.map(verse => `• ${verse}`).join('\n')}`;
      }

      // Add key points if available
      if (topicDetail.keyPoints && topicDetail.keyPoints.length > 0) {
        shareMessage += `\n\nዋና ዋና ነጥቦች:\n${topicDetail.keyPoints.map(point => `• ${point}`).join('\n')}`;
      }

      // Add references if available
      if (topicDetail.references && topicDetail.references.length > 0) {
        shareMessage += `\n\nማጣቀሻዎች:\n${topicDetail.references.map(ref => `• ${ref.verse}: ${ref.text}`).join('\n')}`;
      }

      shareMessage += `\n\nMelhik - Evangelism Tool`;

      const shareContent = {
        title: topic.title,
        message: shareMessage,
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
        {/* Header Section with Topic Title and Religion Badge */}
        <View style={[styles.headerSection, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.headerTop}>
            <View style={[styles.religionBadge, { borderColor: religion.color }]}>
              <AmharicText variant="caption" style={[styles.religionBadgeText, { color: religion.color }]}>
                {religion.name}
              </AmharicText>
            </View>
            <TouchableOpacity 
              style={[styles.headerBookmarkButton, { 
                backgroundColor: isBookmarked(topic.id) ? colors.primary : 'transparent'
              }]}
              onPress={() => toggleBookmark({
                id: topic.id,
                title: topic.title,
                description: topic.description,
                religionId: religion.id,
                religionName: religion.name
              })}
            >
              <Ionicons 
                name={isBookmarked(topic.id) ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarked(topic.id) ? "white" : colors.primary} 
              />
            </TouchableOpacity>
          </View>
          
          <AmharicText variant="heading" style={[styles.topicTitle, { color: colors.textPrimary }]}>
            {topic.title}
          </AmharicText>
          
          <View style={[styles.questionCard, { backgroundColor: colors.background }]}>
            <View style={styles.questionHeader}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <AmharicText variant="subheading" style={[styles.questionLabel, { color: colors.primary }]}>
                ጥያቄ
              </AmharicText>
            </View>
            <AmharicText variant="body" style={[styles.questionText, { color: colors.textSecondary }]}>
              {topic.description}
            </AmharicText>
          </View>
        </View>

        {/* Main Explanation Section */}
        <View style={[styles.explanationSection, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                ዝርዝር ማብራሪያ
              </AmharicText>
            </View>
          </View>
          
          <View style={[styles.explanationCard, { backgroundColor: colors.background }]}>
            <TextWithBibleVerses
              text={topicDetail.explanation}
              style={[styles.explanationText, { color: colors.textSecondary }]}
              verseData={[]} // Pass an empty array as Bible verses are now data-free
            />
          </View>
        </View>

        {/* Bible Verses Section */}
        {topicDetail.bibleVerses && topicDetail.bibleVerses.length > 0 && (
          <View style={[styles.versesSection, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="book" size={24} color="#3B82F6" />
                <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  ቅዱስ ጥቅሶች
                </AmharicText>
              </View>
            </View>
            
            <View style={styles.versesList}>
              {topicDetail.bibleVerses.map((verse, index) => (
                <View key={index} style={[styles.verseCard, { backgroundColor: colors.background }]}>
                  <View style={[styles.verseNumber, { backgroundColor: '#3B82F6' }]}>
                    <AmharicText variant="caption" style={styles.verseNumberText}>
                      {index + 1}
                    </AmharicText>
                  </View>
                  <AmharicText variant="body" style={[styles.verseText, { color: colors.textSecondary }]}>
                    {verse}
                  </AmharicText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Key Points Section */}
        {topicDetail.keyPoints && topicDetail.keyPoints.length > 0 && (
          <View style={[styles.keyPointsSection, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  ዋና ዋና ነጥቦች
                </AmharicText>
              </View>
            </View>
            
            <View style={styles.keyPointsList}>
              {topicDetail.keyPoints.map((point, index) => (
                <View key={index} style={[styles.keyPointCard, { backgroundColor: colors.background }]}>
                  <View style={[styles.keyPointIcon, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                  <AmharicText variant="body" style={[styles.keyPointText, { color: colors.textSecondary }]}>
                    {point}
                  </AmharicText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* References Section */}
        {topicDetail.references && topicDetail.references.length > 0 && (
          <View style={[styles.referencesSection, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="library" size={24} color="#8B5CF6" />
                <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  ማጣቀሻዎች
                </AmharicText>
              </View>
            </View>
            
            <View style={styles.referencesList}>
              {topicDetail.references.map((reference, index) => (
                <View key={index} style={[styles.referenceCard, { backgroundColor: colors.background }]}>
                  <View style={styles.referenceHeader}>
                    <AmharicText variant="body" style={[styles.referenceVerse, { color: '#8B5CF6' }]}>
                      {reference.verse}
                    </AmharicText>
                  </View>
                  <AmharicText variant="body" style={[styles.referenceText, { color: colors.textSecondary }]}>
                    {reference.text}
                  </AmharicText>
                  {reference.explanation && (
                    <View style={[styles.referenceExplanationContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                      <AmharicText variant="body" style={[styles.referenceExplanation, { color: colors.textTertiary }]}>
                        {reference.explanation}
                      </AmharicText>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Floating Action Buttons */}
        <View style={styles.floatingButtons}>
          <TouchableOpacity 
            style={[styles.floatingButton, { backgroundColor: colors.primary }]}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={24} color="white" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  
  // Header Section Styles
  headerSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    width: '98%',
    alignSelf: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  religionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  religionBadgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
  headerBookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  questionCard: {
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionLabel: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
  },

  // Section Styles
  explanationSection: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  versesSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    width: '98%',
    alignSelf: 'center',
  },
  keyPointsSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    width: '98%',
    alignSelf: 'center',
  },
  referencesSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    width: '98%',
    alignSelf: 'center',
  },

  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  sectionBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },

  // Content Card Styles
  explanationCard: {
    padding: 8,
    borderRadius: 0,
    width: '100%',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 26,
  },

  // Verses Styles
  versesList: {
    marginTop: 4,
  },
  verseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    width: '100%',
  },
  verseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verseNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    fontStyle: 'italic',
  },

  // Key Points Styles
  keyPointsList: {
    marginTop: 4,
  },
  keyPointCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    width: '100%',
  },
  keyPointIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  keyPointText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },

  // References Styles
  referencesList: {
    marginTop: 4,
  },
  referenceCard: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    width: '100%',
  },
  referenceHeader: {
    paddingLeft: 12,
    marginBottom: 12,
  },
  referenceVerse: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  referenceText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  referenceExplanationContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  referenceExplanation: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'normal',
  },

  // Floating Buttons
  floatingButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty States
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
