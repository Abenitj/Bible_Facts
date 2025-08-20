import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import AmharicText from '../src/components/AmharicText';
import { getReligions, initDatabase, initializeSampleData } from '../src/database/simpleData';
import SyncService from '../src/services/SyncService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [religions, setReligions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('HomeScreen: Starting initialization...');
      
      // Initialize sample data
      await initializeSampleData();
      console.log('HomeScreen: Sample data initialized');
      
      // Load religions from database
      await loadReligions();
      console.log('HomeScreen: Religions loaded');
      
      // Check for updates
      await SyncService.checkForUpdates();
      console.log('HomeScreen: Sync check completed');
      
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
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
      console.error('Error initializing HomeScreen:', error);
      // Start animation even if there's an error
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
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

  const navigateToReligion = (religion) => {
    navigation.navigate('Topics', { religion });
  };

  const renderReligionCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.religionCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigateToReligion(item)}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <AmharicText style={styles.icon}>{item.icon}</AmharicText>
        </View>
        
        <View style={styles.content}>
          <AmharicText variant="subheading" style={styles.title}>{item.name}</AmharicText>
          <AmharicText variant="caption" style={styles.description}>{item.description}</AmharicText>
        </View>
        
        <View style={styles.arrowContainer}>
          <AmharicText style={styles.arrow}>›</AmharicText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar 
        title="Evangelism Tool" 
        showMenu={true}
        onMenuPress={() => navigation.openDrawer()}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <AmharicText variant="heading" style={styles.welcomeTitle}>Melhik ን እንኳን በደህና መጡ</AmharicText>
          <AmharicText variant="body" style={styles.welcomeSubtitle}>
            ክርስትናን ለማስረዳት የሚያገለግል ሁለገብ መሳሪያ
          </AmharicText>
        </Animated.View>

        {/* Religions List */}
        <View style={styles.religionsContainer}>
          <AmharicText variant="subheading" style={styles.sectionTitle}>ሃይማኖት ወይም አመለካከት ይምረጡ</AmharicText>
          <AmharicText variant="caption" style={styles.sectionSubtitle}>
            የተለመዱ ጥያቄዎችን እና የመጽሐፍ ቅዱስ መልሶችን ለማግኘት ሃይማኖት ይምረጡ
          </AmharicText>
          
          {religions.length > 0 ? (
            religions.map((religion, index) => (
              <View key={religion.id}>
                {renderReligionCard({ item: religion, index })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <AmharicText variant="subheading" style={styles.emptyTitle}>
                ሃይማኖቶች አልተገኙም
              </AmharicText>
              <AmharicText variant="body" style={styles.emptyText}>
                ይዘት እያደረገ ነው፣ እባክዎ ያስተናግዱ...
              </AmharicText>
            </View>
          )}
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E6D2',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 24,
    backgroundColor: '#F5F5DC',
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A0522D',
    shadowColor: '#654321',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#654321',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    lineHeight: 24,
  },
  religionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#654321',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  religionCard: {
    marginVertical: 6,
  },
  card: {
    backgroundColor: '#F5F5DC',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
    shadowColor: '#654321',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#654321',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#A0522D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#8B4513',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B4513',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#8B4513',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A0522D',
    textAlign: 'center',
    paddingHorizontal: 32,
  },

});

export default HomeScreen;
