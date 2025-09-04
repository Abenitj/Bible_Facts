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
import { getColors } from '../src/theme/colors';

const TopicsScreen = ({ navigation, route }) => {
  const { religion } = route.params || {};
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isDarkMode } = useDarkMode();
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
          <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
          <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            ሃይማኖት ይምረጡ
          </AmharicText>
          <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
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
          showBack={true}
          onBackPress={() => navigation.goBack()}
          colors={colors}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AmharicText variant="body" style={[styles.loadingText, { color: colors.textSecondary }]}>
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
      colors={colors}
    />
  );

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
        showBack={true}
        onBackPress={() => navigation.goBack()}
        colors={colors}
      />

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
          <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
          <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            ርዕሰ መልእክት{topics.length !== 1 ? 'ዎች' : ''} የሉም
          </AmharicText>
          <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
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
  topicsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
