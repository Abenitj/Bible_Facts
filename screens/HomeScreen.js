import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import ImageSlider from '../components/ImageSlider';
import ReligionCard from '../components/ReligionCard';
import AppBar from '../components/AppBar';
import ErrorModal from '../components/ErrorModal';
import SyncService from '../src/services/SyncService';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { useReadingProgress } from '../src/contexts/ReadingProgressContext';
import { useBookmarks } from '../src/contexts/BookmarksContext';
import { getColors } from '../src/theme/colors';

const HomeScreen = ({ navigation }) => {
  const [religions, setReligions] = useState([]);
  const [filteredReligions, setFilteredReligions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { getReadingStats } = useReadingProgress();
  const [readingStats, setReadingStats] = useState({ totalRead: 0, totalTopics: 0 });
  const { getRecentBookmarks, getBookmarksCount } = useBookmarks();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    loadReligions();
    loadReadingStats();
  }, []);

  // Reload stats when component focuses (user returns from reading)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReadingStats();
    });
    return unsubscribe;
  }, [navigation]);

  const loadReadingStats = async () => {
    try {
      const stats = await getReadingStats();
      setReadingStats(stats);
    } catch (error) {
      console.error('Error loading reading stats:', error);
    }
  };

  const loadReligions = async () => {
    try {
      setLoading(true);
      const storedContent = await SyncService.getStoredContent();
      if (storedContent.religions && storedContent.religions.length > 0) {
        setReligions(storedContent.religions);
        setFilteredReligions(storedContent.religions);
        console.log(`Loaded ${storedContent.religions.length} religions from storage`);
      } else {
        console.log('No stored religions found');
        setReligions([]);
        setFilteredReligions([]);
      }
    } catch (error) {
      console.error('Error loading religions:', error);
      setReligions([]);
      setFilteredReligions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    
    if (query.trim() === '') {
      setFilteredReligions(religions);
      return;
    }
    
    const filtered = religions.filter(religion => {
      const nameMatch = religion.name.toLowerCase().includes(query.toLowerCase());
      const nameEnMatch = religion.nameEn && religion.nameEn.toLowerCase().includes(query.toLowerCase());
      const descriptionMatch = religion.description && religion.description.toLowerCase().includes(query.toLowerCase());
      
      return nameMatch || nameEnMatch || descriptionMatch;
    });
    
    setFilteredReligions(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setFilteredReligions(religions);
  };

  const onRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setShowErrorModal(false); // Clear any previous errors
    
    try {
      console.log('Starting sync...');
      
      // Perform full sync to get latest data
      const result = await SyncService.performFullSync();
      
      if (result.success) {
        console.log('Sync completed successfully');
        // Reload data after successful sync
        await loadReligions();
        await loadReadingStats();
        // Re-apply search filter if user is searching
        if (isSearching) {
          handleSearch(searchQuery);
        }
      } else {
        // Sync failed - handle gracefully
        // If we have cached data, show a less severe error
        if (result.canUseCachedData) {
          // Load cached data and show info message
          await loadReligions();
          await loadReadingStats();
          
          // Only show error modal if user explicitly needs to know
          // For network errors with cached data, we can be silent or show a subtle message
          const isNetworkError = result.message?.includes('ኢንተርኔት') || result.message?.includes('ግንኙነት');
          
          if (isNetworkError) {
            // For network errors with cached data, don't show error modal
            // Just silently use cached data
            console.log('Using cached data due to network issue');
          } else {
            // For other errors, show the error
            setErrorMessage(
              `${result.message}\n\nአሁን የተቀመጡ ውሂቦች ጥቅም ላይ ውለዋል።`
            );
            setShowErrorModal(true);
          }
        } else {
          // No cached data - show error
          setErrorMessage(
            `${result.message}\n\nእባክዎ ኢንተርኔት ግንኙነትዎን ይፈትሹ።`
          );
          setShowErrorModal(true);
          // Still try to load existing data even if sync fails
          await loadReligions();
        }
      }
    } catch (error) {
      // Only log unexpected errors - network errors are expected and handled
      const isNetworkError = error.isNetworkError === true ||
                            error.message?.includes('ኢንተርኔት') || 
                            error.message?.includes('ግንኙነት') ||
                            error.message?.includes('Network') ||
                            (error.name === 'TypeError' && error.message?.includes('Network'));
      
      if (!isNetworkError) {
        console.error('Unexpected error during sync:', error);
      }
      // Network errors are expected - no logging needed
      
      // Try to load cached data even on unexpected errors
      try {
        await loadReligions();
        await loadReadingStats();
      } catch (loadError) {
        // Only log if it's not a network error
        const isLoadNetworkError = loadError.isNetworkError === true ||
                                  loadError.message?.includes('Network') ||
                                  (loadError.name === 'TypeError' && loadError.message?.includes('Network'));
        if (!isLoadNetworkError) {
          console.error('Error loading cached data:', loadError);
        }
      }
      
      // Only show error modal for non-network errors or if no cached data
      const hasCachedData = await SyncService.hasCachedContent();
      if (!hasCachedData || !isNetworkError) {
        const errorMsg = error.message || 'ያልታወቀ ስህተት ተፈጥሯል።';
        setErrorMessage(
          `${errorMsg}\n\nእባክዎ እንደገና ይሞክሩ።`
        );
        setShowErrorModal(true);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleReligionPress = (religion) => {
    try {
      if (navigation && religion) {
        navigation.navigate('ReligionTopics', { religion });
      }
    } catch (error) {
      console.error('Error navigating to religion topics:', error);
    }
  };

  const renderReligionCard = ({ item, index }) => (
    <ReligionCard
      religion={item}
      onPress={() => handleReligionPress(item)}
      index={index}
      colors={{...colors, isDarkMode}}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cloud-download-outline" size={64} color={colors.textSecondary} />
      <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        ዳታ የለም
      </AmharicText>
      <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
        ዳታው በሲንክ ወይም በድረ-ገጹ ላይ ከተገኘ በኋላ እዚህ ይታያል።
      </AmharicText>
      <TouchableOpacity 
        style={[styles.syncButton, { backgroundColor: colors.primary }]}
        onPress={onRefresh}
      >
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.syncButtonText}>Sync Now</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AmharicText variant="body" style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading content...
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
        title="Melhik"
        colors={colors}
      />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Professional Search Field */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { 
            backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.05)',
            borderWidth: 0.5,
            borderColor: 'rgba(0, 0, 0, 0.1)'
          }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? colors.textSecondary : '#374151'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? colors.textPrimary : '#111827', fontWeight: '600' }]}
              placeholder="Search religions and topics..."
              placeholderTextColor={isDarkMode ? colors.textSecondary : '#6B7280'}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {isSearching && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? colors.textSecondary : '#374151'} />
              </TouchableOpacity>
            )}
          </View>
        </View>



        {/* Simple Read Progress Header */}
        {!isSearching && (() => {
          const totalTopics = readingStats.totalTopics || 0;
          const readTopics = readingStats.totalRead || 0;
          const readPercentage = totalTopics > 0 ? Math.round((readTopics / totalTopics) * 100) : 0;

          return (
            <View style={[styles.readProgressHeader, { 
              backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.05)',
              borderWidth: 0.5,
              borderColor: 'rgba(0, 0, 0, 0.1)'
            }]}>
              <View style={styles.readProgressTitle}>
                <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? "#10B981" : "#059669"} />
                <AmharicText variant="subheading" style={[styles.readProgressTitleText, { 
                  color: isDarkMode ? colors.textPrimary : '#111827',
                  fontWeight: '700'
                }]}>
                  የንባብ ሂደት
                </AmharicText>
              </View>
              
              <View style={styles.readProgressContent}>
                <AmharicText variant="body" style={[styles.readProgressText, { 
                  color: isDarkMode ? colors.textSecondary : '#374151',
                  fontWeight: '600'
                }]}>
                  {readTopics} ርዕሰ መልእክት{readTopics !== 1 ? 'ዎች' : ''} ተነብተዋል
                </AmharicText>
                
                {totalTopics > 0 && (
                  <View style={styles.readProgressBarContainer}>
                    <View style={[styles.readProgressBar, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)' }]}>
                      <View style={[styles.readProgressFill, { 
                        width: `${readPercentage}%`,
                        backgroundColor: isDarkMode ? "#10B981" : "#059669"
                      }]} />
                    </View>
                    <AmharicText variant="caption" style={[styles.readProgressPercentage, { 
                      color: isDarkMode ? "#10B981" : "#059669",
                      fontWeight: '700'
                    }]}>
                      {readPercentage}%
                    </AmharicText>
                  </View>
                )}
              </View>
            </View>
          );
        })()}

        {/* Image Slider */}
        <ImageSlider />

        {/* Religions List or Empty State */}
        {filteredReligions.length > 0 ? (
          <View style={styles.religionsSection}>
            <View style={styles.sectionHeader}>
              <AmharicText variant="subheading" style={[styles.sectionTitle, { color: isDarkMode ? colors.textPrimary : '#111827', fontWeight: '700' }]}>
                ሃይማኖቶች
              </AmharicText>
              <AmharicText variant="caption" style={[styles.sectionSubtitle, { color: isDarkMode ? colors.textSecondary : '#374151', fontWeight: '500' }]}>
                Select a religion to explore topics and biblical answers
              </AmharicText>
            </View>
            
            <FlatList
              data={filteredReligions}
              renderItem={renderReligionCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.religionsList}
            />
          </View>
        ) : (
          <View style={styles.emptyStateSection}>
            {isSearching ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
                <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  No Results Found
                </AmharicText>
                <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Try searching with different keywords or clear your search to see all religions.
                </AmharicText>
                <TouchableOpacity 
                  style={[styles.syncButton, { backgroundColor: colors.primary }]}
                  onPress={clearSearch}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.syncButtonText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              renderEmpty()
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  progressContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 14,
  },
  emptyStateSection: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Fallback background
  },
  loadingText: {
    marginTop: 10,
  },
  religionsSection: {
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  religionsList: {
    paddingBottom: 100,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Simple Read Progress Header Styles
  readProgressHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  readProgressTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readProgressTitleText: {
    marginLeft: 8,
    fontSize: 18,
  },
  readProgressContent: {
    alignItems: 'center',
  },
  readProgressText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  readProgressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  readProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  readProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  readProgressPercentage: {
    fontSize: 16,
  },
});

export default HomeScreen;
