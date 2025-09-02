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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import ImageSlider from '../components/ImageSlider';
import SyncService from '../src/services/SyncService';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const HomeScreen = ({ navigation }) => {
  const [religions, setReligions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useDarkMode();
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
        console.log(`Loaded ${storedContent.religions.length} religions from storage`);
      } else {
        console.log('No stored religions found');
        setReligions([]);
      }
    } catch (error) {
      console.error('Error loading religions:', error);
      setReligions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      console.log('Starting refresh...');
      
      // Check for updates first
      const updates = await SyncService.checkForUpdates();
      console.log('Updates check result:', updates);
      
      if (updates.hasUpdates) {
        console.log('Updates available, downloading...');
        // Download new content
        await SyncService.downloadContent();
        // Reload data
        await loadReligions();
        console.log('Refresh completed with new data');
      } else {
        console.log('No updates available');
      }
    } catch (error) {
      console.error('Error refreshing:', error);
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
    <TouchableOpacity
      style={[styles.religionCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleReligionPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.religionHeader}>
          <Text style={styles.religionIcon}>{item.icon || '⛪'}</Text>
          <View style={styles.religionInfo}>
            <AmharicText variant="subheading" style={[styles.religionTitle, { color: colors.textPrimary }]}>
              {item.name}
            </AmharicText>
            <AmharicText variant="body" style={[styles.religionDescription, { color: colors.textSecondary }]}>
              {item.description}
            </AmharicText>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.primary} />
    </TouchableOpacity>
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
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Image Slider */}
        <ImageSlider />

        {/* Religions List or Empty State */}
        {religions.length > 0 ? (
          <View style={styles.religionsSection}>
            <View style={styles.sectionHeader}>
              <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                ሃይማኖቶች
              </AmharicText>
              <AmharicText variant="caption" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Select a religion to explore topics and biblical answers
              </AmharicText>
            </View>
            
            <FlatList
              data={religions}
              renderItem={renderReligionCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.religionsList}
            />
          </View>
        ) : (
          <View style={styles.emptyStateSection}>
            {renderEmpty()}
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
  religionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  religionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  religionIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  religionInfo: {
    flex: 1,
  },
  religionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  religionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  religionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    marginBottom: 10,
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
    paddingBottom: 80, // Add padding at the bottom for the sync button
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
