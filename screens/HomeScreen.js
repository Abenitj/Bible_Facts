import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import { religions } from '../data/evangelismData';
import { StorageService } from '../utils/storage';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    // Entrance animation
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
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
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
          <Text style={styles.welcomeTitle}>Welcome to Melhik</Text>
          <Text style={styles.welcomeSubtitle}>
            Your comprehensive evangelism tool for answering questions about Christianity
          </Text>
        </Animated.View>

        {/* Religions List */}
        <View style={styles.religionsContainer}>
          <Text style={styles.sectionTitle}>Choose a Religion or Perspective</Text>
          <Text style={styles.sectionSubtitle}>
            Select a religion to explore common questions and biblical answers
          </Text>
          
          {religions.map((religion, index) => (
            <View key={religion.id}>
              {renderReligionCard({ item: religion, index })}
            </View>
          ))}
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

});

export default HomeScreen;
