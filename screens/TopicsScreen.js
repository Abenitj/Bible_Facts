import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import TopicCard from '../components/TopicCard';
import { getTopicsByReligion } from '../data/evangelismData';

const TopicsScreen = ({ navigation, route }) => {
  const { religion } = route.params;
  const [topics, setTopics] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const religionTopics = getTopicsByReligion(religion.id);
    setTopics(religionTopics);
    
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [religion.id]);

  const navigateToTopic = (topic) => {
    navigation.navigate('TopicDetail', { religion, topic });
  };

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
            <Text style={styles.listHeaderTitle}>
              {topics.length} Topic{topics.length !== 1 ? 's' : ''} Available
            </Text>
            <Text style={styles.listHeaderSubtitle}>
              Tap on any topic to explore biblical answers
            </Text>
          </Animated.View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>No topics available</Text>
            <Text style={styles.emptyText}>
              Topics for this religion will be added soon.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  topicsList: {
    paddingVertical: 16,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
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
