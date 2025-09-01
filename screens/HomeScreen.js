import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
  FlatList,
  ScrollView,
  Dimensions,
  Image,
  Text,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { getReligions, initializeSampleData } from '../src/database/simpleData';
import SyncService from '../src/services/SyncService';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const { width } = Dimensions.get('window');

// Image Slider Component
const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);
  
  const images = [
    { 
      id: 1, 
      source: require('../assets/home/img1.webp'), 
      title: 'Biblical Truths', 
      subtitle: 'Discover amazing facts' 
    },
    { 
      id: 2, 
      source: require('../assets/home/img2.webp'), 
      title: 'Faith & Knowledge', 
      subtitle: 'Learn and grow' 
    },
    { 
      id: 3, 
      source: require('../assets/home/img3.webp'), 
      title: 'Spiritual Growth', 
      subtitle: 'Deepen your understanding' 
    },
  ];

  // Safety check for images array
  if (!images || images.length === 0) {
    return null;
  }

  useEffect(() => {
    if (images.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 20000); // 20 seconds

      return () => clearInterval(timer);
    }
  }, [images.length]);

  const onGestureEvent = (event) => {
    try {
      const { translationX, state } = event.nativeEvent;
      
      if (state === State.END) {
        const swipeThreshold = width * 0.15; // 15% of screen width for easier swiping
        
        if (translationX > swipeThreshold) {
          // Swipe right - go to previous slide
          setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
          );
        } else if (translationX < -swipeThreshold) {
          // Swipe left - go to next slide
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }
      }
    } catch (error) {
      console.error('Error handling gesture:', error);
    }
  };

  const goToSlide = (index) => {
    try {
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    } catch (error) {
      console.error('Error going to slide:', error);
    }
  };

  return (
    <View style={styles.sliderContainer}>
      <PanGestureHandler
        ref={slideRef}
        onGestureEvent={onGestureEvent}
        activeOffsetX={[-5, 5]}
        failOffsetY={[-20, 20]}
        shouldCancelWhenOutside={false}
      >
        <View style={styles.sliderContent}>
          <Image 
            source={images[currentIndex]?.source || images[0].source}
            style={styles.sliderImage}
            resizeMode="cover"
            onError={(error) => console.error('Image loading error:', error)}
          />
          
          <View style={styles.sliderTextOverlay}>
            <Text style={styles.sliderTitle}>{images[currentIndex]?.title || images[0].title}</Text>
            <Text style={styles.sliderSubtitle}>{images[currentIndex]?.subtitle || images[0].subtitle}</Text>
          </View>
        </View>
      </PanGestureHandler>
      
      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={styles.dotButton}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? '#3B82F6' : '#E5E7EB' }
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ReligionCard component with animation
const ReligionCard = ({ item, index, onPress, colors }) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const [opacityValue] = useState(new Animated.Value(0));

  // Safety check for item
  if (!item) return null;

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
        style={[styles.card, { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderLeftColor: colors.primary,
        }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <AmharicText variant="subheading" style={[styles.title, { color: colors.textPrimary }]}>{item.name || 'Unknown Religion'}</AmharicText>
          <AmharicText variant="caption" style={[styles.description, { color: colors.textSecondary }]}>{item.description || 'No description available'}</AmharicText>
        </View>
        
        <View style={[styles.arrowContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
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
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      await initializeSampleData();
      const religionsData = await getReligions();
      setReligions(religionsData);
      
      // Entrance animation
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
    } catch (error) {
      console.error('Error initializing screen:', error);
    }
  };

  const onRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setRefreshing(true);
    try {
      // Simple refresh - just reload the data
      const religionsData = await getReligions();
      if (religionsData && Array.isArray(religionsData)) {
        setReligions(religionsData);
        console.log('Data refreshed successfully');
      } else {
        console.warn('Invalid data received during refresh');
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      // Don't crash the app, just log the error
    } finally {
      // Add a small delay to ensure smooth UX
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    }
  };

  const handleReligionPress = (religion) => {
    try {
      if (navigation && religion) {
        // Navigate to ReligionTopics screen and pass the religion data
        navigation.navigate('ReligionTopics', { religion });
      } else {
        console.warn('Navigation or religion data not available');
      }
    } catch (error) {
      console.error('Error navigating to religion topics:', error);
      // Fallback: try to go back or show error
      if (navigation) {
        navigation.goBack();
      }
    }
  };

  const renderReligionCard = ({ item, index }) => {
    if (!item) return null;
    
    return (
      <ReligionCard 
        item={item} 
        index={index} 
        onPress={() => handleReligionPress(item)}
        colors={colors}
      />
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerSection,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Religions</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Select a religion to explore topics and biblical answers</Text>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
      <AmharicText variant="subheading" style={[styles.emptyTitle, { color: colors.textPrimary }]}>ሃይማኖቶች የሉም</AmharicText>
      <AmharicText variant="body" style={[styles.emptyText, { color: colors.textSecondary }]}>
        ሃይማኖቶች በቅርቡ ይጨመራሉ። እባክዎ በቅርቡ ይመልሱ።
      </AmharicText>
    </View>
  );

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

        {/* Religions List */}
        <View style={styles.religionsSection}>
          {renderHeader()}
          <FlatList
            data={religions}
            renderItem={renderReligionCard}
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            ListEmptyComponent={renderEmpty()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  sliderContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  sliderContent: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  sliderTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  sliderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sliderSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dotButton: {
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  religionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  headerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  religionCard: {
    marginVertical: 6,
  },
  card: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderBottomWidth: 1,
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
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default HomeScreen;
