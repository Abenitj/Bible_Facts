import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBar from '../components/AppBar';
import TopicCard from '../components/TopicCard';
import AmharicText from '../src/components/AmharicText';
import { getTopicsByReligion } from '../src/database/simpleData';

const TopicsScreen = ({ navigation, route }) => {
  const { religion } = route.params || {};
  const [topics, setTopics] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (religion) {
      loadTopics();
    }
  }, [religion?.id]);

  const loadTopics = async () => {
    if (!religion) return;
    
    try {
      const religionTopics = await getTopicsByReligion(religion.id);
      setTopics(religionTopics);
      
      // Entrance animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const navigateToTopic = (topic) => {
    if (religion) {
      navigation.navigate('TopicDetail', { religion, topicId: topic.id });
    }
  };

  // If no religion is provided, show a message
  if (!religion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#374151" />
          <AmharicText variant="subheading" style={styles.emptyTitle}>
            ሃይማኖት ይምረጡ
          </AmharicText>
          <AmharicText variant="body" style={styles.emptyText}>
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
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar 
        title={religion.name}
        showBack={true}
        onBackPress={() => navigation.navigate('Home')}
      />

      {/* Topics List */}
      <FlatList
        data={topics}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.topicsList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View 
            style={[
              styles.listHeader,
              { opacity: fadeAnim }
            ]}
          >
            <AmharicText variant="subheading" style={styles.listHeaderTitle}>
              {topics.length} ርዕሰ መልእክት{topics.length !== 1 ? 'ዎች' : ''} ይገኛሉ
            </AmharicText>
            <AmharicText variant="caption" style={styles.listHeaderSubtitle}>
              የመጽሐፍ ቅዱስ መልሶችን ለማግኘት ርዕሰ መልእክት ይንኩ
            </AmharicText>
          </Animated.View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#374151" />
            <AmharicText variant="subheading" style={styles.emptyTitle}>ርዕሰ መልእክቶች የሉም</AmharicText>
            <AmharicText variant="body" style={styles.emptyText}>
              ለዚህ ሃይማኖት ርዕሰ መልእክቶች በቅርቡ ይጨመራሉ።
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
    backgroundColor: '#F9FAFB',
  },
  topicsList: {
    paddingVertical: 16,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default TopicsScreen;
