import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBar from '../components/AppBar';
import TopicCard from '../components/TopicCard';
import ErrorModal from '../components/ErrorModal';
import AmharicText from '../src/components/AmharicText';
import SyncService from '../src/services/SyncService';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { useReadingProgress } from '../src/contexts/ReadingProgressContext';
import { useBookmarks } from '../src/contexts/BookmarksContext';
import { getColors } from '../src/theme/colors';

const TopicsScreen = ({ navigation, route }) => {
  const { religion } = route.params || {};
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isDarkMode } = useDarkMode();
  const { isTopicRead, getReadingStats } = useReadingProgress();
  const { isBookmarked, getBookmarksCount } = useBookmarks();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    if (religion) {
      loadTopics();
    }
  }, [religion]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const storedContent = await SyncService.getStoredContent();
      
      if (storedContent.topics && storedContent.topics.length > 0) {
        // Filter topics for this specific religion
        const religionTopics = storedContent.topics.filter(topic => 
          topic.religionId === religion.id
        );
        setTopics(religionTopics);
        console.log(`Loaded ${religionTopics.length} topics for religion: ${religion.name}`);
      } else {
        console.log('No stored topics found');
        setTopics([]);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      console.log('Starting sync from topics screen...');
      const result = await SyncService.performFullSync();
      console.log('Sync result:', result);
      
      if (result.success) {
        console.log('Sync completed successfully:', result.message);
        // Reload topics after successful sync
        await loadTopics();
        console.log('Topics synced and reloaded');
      } else {
        console.log('Sync failed:', result.message);
        // Show error modal for real sync failures
        setErrorMessage(result.message || 'Sync failed. Please try again.');
        setShowErrorModal(true);
        // Still try to load existing data even if sync fails
        await loadTopics();
      }
    } catch (error) {
      console.error('Error syncing:', error);
      // Show error modal for unexpected errors
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
      // Still try to load existing data even if sync fails
      await loadTopics();
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToTopic = (topic) => {
    try {
      if (religion && navigation) {
        navigation.navigate('TopicDetail', { religion, topicId: topic.id });
      }
    } catch (error) {
      console.error('Error navigating to topic:', error);
      if (navigation) {
        navigation.goBack();
      }
    }
  };

  // If no religion is provided, show a message
  if (!religion) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={isDarkMode ? colors.textSecondary : '#6B7280'} />
          <AmharicText variant="subheading" style={[styles.emptyTitle, { 
            color: isDarkMode ? colors.textPrimary : '#111827',
            fontWeight: '700'
          }]}>
            ሃይማኖት ይምረጡ
          </AmharicText>
          <AmharicText variant="body" style={[styles.emptyText, { 
            color: isDarkMode ? colors.textSecondary : '#374151',
            fontWeight: '500'
          }]}>
            ርዕሰ መልእክቶችን ለማግኘት ዋና ገጽ ላይ ሃይማኖት ይምረጡ።
          </AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppBar 
          title={religion.name}
          colors={colors}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? colors.primary : '#2563EB'} />
          <AmharicText variant="body" style={[styles.loadingText, { 
            color: isDarkMode ? colors.textSecondary : '#374151',
            fontWeight: '500'
          }]}>
            Loading topics...
          </AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  const renderTopic = ({ item, index }) => (
    <TopicCard
      topic={item}
      onPress={() => navigateToTopic(item)}
      index={index}
      colors={{...colors, isDarkMode}}
      isRead={isTopicRead(item.id)}
      isBookmarked={isBookmarked(item.id)}
    />
  );

  // Calculate reading statistics
  const readingStats = getReadingStats();
  const totalTopics = topics.length;
  const readTopics = topics.filter(topic => isTopicRead(topic.id)).length;
  const bookmarkedTopics = topics.filter(topic => isBookmarked(topic.id)).length;
  const progressPercentage = totalTopics > 0 ? Math.round((readTopics / totalTopics) * 100) : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ErrorModal
        visible={showErrorModal}
        title="Sync Error"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
      <AppBar 
        title={religion.name}
        colors={colors}
      />

      {/* Professional Header Section with Statistics */}
      <View style={[styles.headerSection, { 
        backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.05)',
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.1)'
      }]}>
        <View style={styles.headerTop}>
          <View style={[styles.religionBadge, { borderColor: religion.color }]}>
            <AmharicText variant="caption" style={[styles.religionBadgeText, { color: religion.color }]}>
              {religion.name}
            </AmharicText>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Ionicons name="book-outline" size={16} color={isDarkMode ? colors.textSecondary : '#374151'} />
              <AmharicText variant="caption" style={[styles.statText, { 
                color: isDarkMode ? colors.textSecondary : '#374151',
                fontWeight: '600'
              }]}>
                {totalTopics}
              </AmharicText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={isDarkMode ? "#10B981" : "#059669"} />
              <AmharicText variant="caption" style={[styles.statText, { 
                color: isDarkMode ? "#10B981" : "#059669",
                fontWeight: '600'
              }]}>
                {readTopics}
              </AmharicText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="bookmark-outline" size={16} color={isDarkMode ? "#F59E0B" : "#D97706"} />
              <AmharicText variant="caption" style={[styles.statText, { 
                color: isDarkMode ? "#F59E0B" : "#D97706",
                fontWeight: '600'
              }]}>
                {bookmarkedTopics}
              </AmharicText>
            </View>
          </View>
        </View>
        
        {/* Progress Bar */}
        {totalTopics > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <AmharicText variant="body" style={[styles.progressLabel, { 
                color: isDarkMode ? colors.textSecondary : '#374151',
                fontWeight: '600'
              }]}>
                የንባብ ሂደት
              </AmharicText>
              <AmharicText variant="caption" style={[styles.progressPercentage, { 
                color: isDarkMode ? colors.primary : '#2563EB',
                fontWeight: '700'
              }]}>
                {progressPercentage}%
              </AmharicText>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${progressPercentage}%`
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Topics List */}
      {topics.length > 0 ? (
        <FlatList
          data={topics}
          renderItem={renderTopic}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.topicsList, { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={isDarkMode ? colors.textSecondary : '#6B7280'} />
          <AmharicText variant="subheading" style={[styles.emptyTitle, { 
            color: isDarkMode ? colors.textPrimary : '#111827',
            fontWeight: '700'
          }]}>
            ርዕሰ መልእክት{topics.length !== 1 ? 'ዎች' : ''} የሉም
          </AmharicText>
          <AmharicText variant="body" style={[styles.emptyText, { 
            color: isDarkMode ? colors.textSecondary : '#374151',
            fontWeight: '500'
          }]}>
            ለዚህ ሃይማኖት ርዕሰ መልእክት{topics.length !== 1 ? 'ዎች' : ''} በቅርቡ ይጨመራሉ።
          </AmharicText>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Professional Header Section Styles
  headerSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statText: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  
  // Progress Section Styles
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  // List Styles
  topicsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  
  // Empty States
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
  },
});

export default TopicsScreen;
