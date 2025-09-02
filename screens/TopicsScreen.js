import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBar from '../components/AppBar';
import TopicCard from '../components/TopicCard';
import AmharicText from '../src/components/AmharicText';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const TopicsScreen = ({ navigation, route }) => {
  const { religion } = route.params || {};
  const [topics, setTopics] = useState([]);
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  // No loading needed - topics will come via sync
  useEffect(() => {
    if (religion) {
      // Set empty topics immediately - no loading state
      setTopics([]);
      console.log('Topics screen loaded - no data available yet');
    }
  }, [religion]);

  const navigateToTopic = (topic) => {
    try {
      if (religion && navigation) {
        navigation.navigate('TopicDetail', { religion, topicId: topic.id });
      } else {
        console.warn('Religion or navigation not available');
        if (navigation) {
          navigation.goBack();
        }
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
      <AppBar 
        title={religion.name}
        showBack={true}
        onBackPress={() => {
          console.log('Back button pressed in TopicsScreen');
          console.log('Navigation object:', navigation);
          console.log('Can go back:', navigation.canGoBack());
          try {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              console.log('Cannot go back, navigating to Home');
              navigation.navigate('Home');
            }
          } catch (error) {
            console.error('Error going back:', error);
            // Fallback: try to navigate to Home
            navigation.navigate('Home');
          }
        }}
        colors={colors}
      />

      {/* Topics List */}
      <FlatList
        data={topics}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.topicsList, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
            <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>ርዕሰ መልእክት{topics.length !== 1 ? 'ዎች' : ''} የሉም</AmharicText>
            <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
              ለዚህ ሃይማኖት ርዕሰ መልእክት{topics.length !== 1 ? 'ዎች' : ''} በቅርቡ ይጨመራሉ።
            </AmharicText>
          </View>
        }
      />
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
});

export default TopicsScreen;
