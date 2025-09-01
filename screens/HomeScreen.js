import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { getReligions, initializeSampleData } from '../src/database/simpleData';
import SyncService from '../src/services/SyncService';

// ReligionCard component with animation
const ReligionCard = ({ item, index, onPress }) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const [opacityValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Staggered animation for cards
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.religionCard,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <AmharicText variant="subheading" style={styles.title}>{item.name}</AmharicText>
          <AmharicText variant="caption" style={styles.description}>{item.description}</AmharicText>
        </View>
        
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const [religions, setReligions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    console.log('HomeScreen: Starting initialization...');
    
    try {
      // Initialize sample data
      await initializeSampleData();
      console.log('HomeScreen: Sample data initialized');
      
      // Load religions
      await loadReligions();
      console.log('HomeScreen: Religions loaded');
      
      // Check for updates
      await SyncService.checkForUpdates();
      console.log('HomeScreen: Sync check completed');
      
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      console.log('HomeScreen: Animation started');
    } catch (error) {
      console.error('HomeScreen initialization failed:', error);
    }
  };

  const loadReligions = async () => {
    try {
      const data = await getReligions();
      setReligions(data);
    } catch (error) {
      console.error('Error loading religions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadReligions();
      await SyncService.checkForUpdates();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleReligionPress = (religion) => {
    // Navigate to Topics tab and pass the religion data
    navigation.navigate('Topics', { religion });
  };

  const renderReligionCard = ({ item, index }) => (
    <ReligionCard 
      item={item} 
      index={index} 
      onPress={() => handleReligionPress(item)}
    />
  );

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.welcomeSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color="#374151" />
      <AmharicText variant="subheading" style={styles.emptyTitle}>ሃይማኖቶች የሉም</AmharicText>
      <AmharicText variant="body" style={styles.emptyText}>
        ሃይማኖቶች በቅርቡ ይጨመራሉ።
      </AmharicText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Welcome Header */}
      <Animated.View 
        style={[
          styles.welcomeSection,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <AmharicText variant="heading" style={styles.welcomeTitle}>
          እንኳን ደስ አለዎት!
        </AmharicText>
        <AmharicText variant="body" style={styles.welcomeSubtitle}>
          የመጽሐፍ ቅዱስ መልሶችን ለማግኘት ሃይማኖት ይምረጡ
        </AmharicText>
      </Animated.View>

      {/* Religions List */}
      <FlatList
        data={religions}
        renderItem={renderReligionCard}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  welcomeSection: {
    padding: 24,
    margin: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  religionCard: {
    marginVertical: 6,
  },
  card: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.15)',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default HomeScreen;
