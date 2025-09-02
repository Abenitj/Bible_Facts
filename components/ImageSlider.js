import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

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

const styles = StyleSheet.create({
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
});

export default ImageSlider;
