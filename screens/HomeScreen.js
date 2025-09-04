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
  const { getRecentBookmarks, getBookmarksCount } = useBookmarks();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    loadReligions();
  }, []);

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
    
    try {
      console.log('Starting sync...');
      
      // Perform full sync to get latest data
      const result = await SyncService.performFullSync();
      console.log('Sync result:', result);
      
      if (result.success) {
        console.log('Sync completed successfully:', result.message);
        // Reload data after successful sync
        await loadReligions();
        // Re-apply search filter if user is searching
        if (isSearching) {
          handleSearch(searchQuery);
        }
        console.log('Data reloaded after sync');
      } else {
        console.log('Sync failed:', result.message);
        // Show error modal for real sync failures
        setErrorMessage(result.message || 'Sync failed. Please try again.');
        setShowErrorModal(true);
        // Still try to load existing data even if sync fails
        await loadReligions();
      }
    } catch (error) {
      console.error('Error syncing:', error);
      // Show error modal for unexpected errors
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
      // Still try to load existing data even if sync fails
      await loadReligions();
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

        {/* Reading Progress Summary */}
        {!isSearching && (() => {
          const stats = getReadingStats();
          if (stats.totalRead > 0) {
            return (
              <View style={[styles.progressContainer, { 
                backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.05)',
                borderWidth: 0.5,
                borderColor: 'rgba(0, 0, 0, 0.1)'
              }]}>
                <View style={styles.progressHeader}>
                  <Ionicons name="book" size={24} color={colors.primary} />
                  <AmharicText variant="subheading" style={[styles.progressTitle, { color: isDarkMode ? colors.textPrimary : '#111827', fontWeight: '700' }]}>
                    የንባብ ሂደት
                  </AmharicText>
                </View>
                <AmharicText variant="body" style={[styles.progressText, { color: isDarkMode ? colors.textSecondary : '#374151', fontWeight: '500' }]}>
                  {stats.totalRead} ርዕሰ መልእክት{stats.totalRead !== 1 ? 'ዎች' : ''} ተነብተዋል
                </AmharicText>
              </View>
            );
          }
          return null;
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
    paddingBottom: 20,
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
});

export default HomeScreen;
