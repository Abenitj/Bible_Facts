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
import SwipeToGoBack from '../components/SwipeToGoBack';
import { getTopicsByReligion } from '../src/database/simpleData';

const TopicsScreen = ({ navigation, route }) => {
  const { religion } = route.params;
  const [topics, setTopics] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadTopics();
  }, [religion.id]);

  const loadTopics = async () => {
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
    navigation.navigate('TopicDetail', { religion, topicId: topic.id });
  };

  const renderTopic = ({ item, index }) => (
    <TopicCard
      topic={item}
      onPress={() => navigateToTopic(item)}
      index={index}
    />
  );

  return (
    <SwipeToGoBack onSwipeBack={() => navigation.goBack()}>
      <SafeAreaView style={styles.container}>
        <AppBar 
          title={religion.name}
          showBack={true}
          onBackPress={() => navigation.goBack()}
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
            <Ionicons name="book-outline" size={64} color="#8B4513" />
            <AmharicText variant="subheading" style={styles.emptyTitle}>ርዕሰ መልእክቶች የሉም</AmharicText>
            <AmharicText variant="body" style={styles.emptyText}>
              ለዚህ ሃይማኖት ርዕሰ መልእክቶች በቅርቡ ይጨመራሉ።
            </AmharicText>
          </View>
        }
              />
      </SafeAreaView>
    </SwipeToGoBack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E6D2',
  },
  topicsList: {
    paddingVertical: 16,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.2)',
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
    textAlign: 'center',
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: '#A0522D',
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
    color: '#8B4513',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0522D',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default TopicsScreen;
