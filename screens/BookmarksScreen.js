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
import AmharicText from '../src/components/AmharicText';
import AppBar from '../components/AppBar';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { useBookmarks } from '../src/contexts/BookmarksContext';
import { getColors } from '../src/theme/colors';

const BookmarksScreen = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { getRecentBookmarks, toggleBookmark } = useBookmarks();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const allBookmarks = getRecentBookmarks(100); // Get all bookmarks
      setBookmarks(allBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  const handleBookmarkPress = (bookmark) => {
    // Navigate to the topic detail
    const religion = { id: bookmark.religionId, name: bookmark.religionName };
    navigation.navigate('TopicDetail', { 
      religion, 
      topicId: bookmark.id,
      topic: {
        id: bookmark.id,
        title: bookmark.title,
        religionId: bookmark.religionId
      }
    });
  };

  const handleRemoveBookmark = (bookmark) => {
    toggleBookmark(bookmark.id, bookmark.title, bookmark.religionId, bookmark.religionName);
    // Remove from local state
    setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
  };

  const renderBookmarkItem = ({ item, index }) => (
    <View style={[styles.bookmarkCard, { 
      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.05)',
      borderWidth: 0.5,
      borderColor: 'rgba(0, 0, 0, 0.1)'
    }]}>
      <TouchableOpacity
        style={styles.bookmarkContent}
        onPress={() => handleBookmarkPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.bookmarkHeader}>
          <View style={styles.bookmarkInfo}>
            <AmharicText variant="subheading" style={[styles.bookmarkTitle, { 
              color: isDarkMode ? colors.textPrimary : '#111827', 
              fontWeight: '700' 
            }]}>
              {item.title}
            </AmharicText>
            <AmharicText variant="caption" style={[styles.bookmarkReligion, { 
              color: isDarkMode ? colors.textSecondary : '#374151', 
              fontWeight: '500' 
            }]}>
              {item.religionName}
            </AmharicText>
          </View>
          <View style={styles.bookmarkActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveBookmark(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark" size={20} color="#F59E0B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleBookmarkPress(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? colors.textSecondary : '#374151'} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={colors.textSecondary} />
      <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        የተመዘገቡ ርዕሰ መልእክቶች የሉም
      </AmharicText>
      <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
        የሚወዱትን ርዕሰ መልእክቶች በመመዝገብ እዚህ ያስቀምጡ።
      </AmharicText>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppBar title="Bookmarks" colors={colors} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AmharicText variant="body" style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading bookmarks...
          </AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar title="Bookmarks" colors={colors} />
      
      {bookmarks.length > 0 ? (
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Ionicons name="bookmark" size={24} color="#F59E0B" />
            <AmharicText variant="subheading" style={[styles.headerTitle, { 
              color: isDarkMode ? colors.textPrimary : '#111827', 
              fontWeight: '700' 
            }]}>
              የተመዘገቡ ርዕሰ መልእክቶች
            </AmharicText>
          </View>
          <AmharicText variant="caption" style={[styles.headerSubtitle, { 
            color: isDarkMode ? colors.textSecondary : '#374151', 
            fontWeight: '500' 
          }]}>
            {bookmarks.length} ርዕሰ መልእክት{bookmarks.length !== 1 ? 'ዎች' : ''} ተመዝግተዋል
          </AmharicText>
        </View>
      ) : null}

      <FlatList
        data={bookmarks}
        renderItem={renderBookmarkItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
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
  },
  loadingText: {
    marginTop: 10,
  },
  headerSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  bookmarkCard: {
    marginVertical: 6,
    borderRadius: 16,
  },
  bookmarkContent: {
    padding: 20,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmarkInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookmarkTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  bookmarkReligion: {
    fontSize: 14,
  },
  bookmarkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
});

export default BookmarksScreen;
