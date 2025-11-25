import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import ImageCard from './ImageCard';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';
import ImageCacheService from '../src/services/ImageCacheService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 300;
const FULLSCREEN_HEIGHT = SCREEN_HEIGHT;

/**
 * Modern Image Carousel Component
 * 
 * Features:
 * - Swipeable images with smooth animations
 * - Pagination dots
 * - Full-screen image viewer
 * - Loading states
 * - Error handling
 * - Dark mode support
 */
const ImageCarousel = ({ 
  images = [], 
  height = null, // null means flexible sizing
  showPagination = true,
  showFullScreen = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  flexible = true, // Enable flexible sizing by default
  maxHeight = null, // Optional max height constraint
  showCounter = true, // Show counter badge
  style,
}) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Helper functions (defined before useMemo)
  const getImageSource = (img) => {
    // Handle local require() sources (numbers)
    if (typeof img === 'number') return img;
    // Handle string URLs
    if (typeof img === 'string') return { uri: img };
    // Handle objects with url property
    if (img?.url) {
      // Check if it's a local require() source
      if (typeof img.url === 'number') return img.url;
      return { uri: img.url };
    }
    // Handle objects with imageUrl property
    if (img?.imageUrl) {
      if (typeof img.imageUrl === 'number') return img.imageUrl;
      return { uri: img.imageUrl };
    }
    return null;
  };

  const getImageUrl = (img) => {
    // For local sources (require), return the number
    if (typeof img === 'number') return img;
    if (typeof img === 'string') return img;
    return img?.url || img?.imageUrl || '';
  };

  const getImageCaption = (img) => {
    if (typeof img === 'string' || typeof img === 'number') return null;
    return img?.caption || img?.altText || null;
  };

  // Filter out invalid images (memoized to prevent unnecessary recalculations)
  const validImages = useMemo(() => {
    return images.filter(img => {
      const source = getImageSource(img);
      return source !== null;
    });
  }, [images]);

  useEffect(() => {
    if (autoPlay && validImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % validImages.length;
          scrollToIndex(next);
          return next;
        });
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, validImages.length, autoPlayInterval]);

  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        if (index !== currentIndex && index >= 0 && index < validImages.length) {
          setCurrentIndex(index);
        }
      },
    }
  );

  const openFullScreen = (index) => {
    if (showFullScreen) {
      setFullScreenIndex(index);
      setFullScreenVisible(true);
    }
  };

  const closeFullScreen = () => {
    setFullScreenVisible(false);
  };

  if (validImages.length === 0) {
    return (
      <View style={[styles.emptyContainer, { minHeight: height || 200 }, style]}>
        <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
        <AmharicText variant="caption" color={colors.textTertiary}>
          No images available
        </AmharicText>
      </View>
    );
  }

  if (validImages.length === 1) {
    const imageUrl = getImageUrl(validImages[0]);
    const caption = getImageCaption(validImages[0]);
    
    return (
      <View style={[styles.container, style]}>
        <ImageCard
          imageUrl={imageUrl} // Always pass original URL, ImageCard will handle caching
          caption={caption}
          height={height}
          flexible={flexible}
          maxHeight={maxHeight}
          borderRadius={0}
          onPress={() => openFullScreen(0)}
          showFullScreen={showFullScreen}
          containerStyle={styles.singleImageContainer}
        />
        {showPagination && (
          <View style={styles.paginationContainer}>
            <View style={[styles.paginationDot, styles.paginationDotActive]} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        contentContainerStyle={[styles.scrollContent, { width: SCREEN_WIDTH * validImages.length }]}
      >
        {validImages.map((img, index) => {
          const imageUrl = getImageUrl(img);
          // Always pass original URL, ImageCard will handle caching internally
          const caption = getImageCaption(img);
          
          return (
            <View key={index} style={styles.imageWrapper}>
              <ImageCard
                imageUrl={imageUrl} // Pass original URL, not cached URI
                caption={caption}
                height={height}
                flexible={flexible}
                maxHeight={maxHeight}
                borderRadius={0}
                onPress={() => openFullScreen(index)}
                showFullScreen={showFullScreen}
                showCaption={false}
                style={styles.carouselImageCard}
              />
            </View>
          );
        })}
      </Animated.ScrollView>

      {showPagination && validImages.length > 1 && (
        <View style={styles.paginationContainer}>
          {validImages.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const dotScale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    opacity: dotOpacity,
                    transform: [{ scale: dotScale }],
                  },
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            );
          })}
        </View>
      )}

      {validImages.length > 1 && showCounter && (
        <View style={styles.counterContainer}>
          <View style={[styles.counterBadge, { backgroundColor: colors.overlay }]}>
            <AmharicText variant="small" color={colors.textInverse} bold>
              {currentIndex + 1} / {validImages.length}
            </AmharicText>
          </View>
        </View>
      )}

      {showFullScreen && (
        <FullScreenViewer
          visible={fullScreenVisible}
          images={validImages}
          initialIndex={fullScreenIndex}
          onClose={closeFullScreen}
          colors={colors}
          isDarkMode={isDarkMode}
        />
      )}
    </View>
  );
};


// Full Screen Image Viewer
const FullScreenViewer = ({ visible, images, initialIndex, onClose, colors, isDarkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef(null);
  
  // Helper functions for full-screen viewer
  const getImageSource = (img) => {
    // Handle local require() sources (numbers)
    if (typeof img === 'number') return img;
    // Handle string URLs
    if (typeof img === 'string') return { uri: img };
    // Handle objects with url property
    if (img?.url) {
      // Check if it's a local require() source
      if (typeof img.url === 'number') return img.url;
      return { uri: img.url };
    }
    // Handle objects with imageUrl property
    if (img?.imageUrl) {
      if (typeof img.imageUrl === 'number') return img.imageUrl;
      return { uri: img.imageUrl };
    }
    return null;
  };

  const getImageUrl = (img) => {
    // For local sources (require), return the number
    if (typeof img === 'number') return img;
    if (typeof img === 'string') return img;
    return img?.url || img?.imageUrl || '';
  };

  const getImageCaption = (img) => {
    if (typeof img === 'string' || typeof img === 'number') return null;
    return img?.caption || img?.altText || null;
  };

  useEffect(() => {
    if (visible && scrollViewRef.current && images.length > 0) {
      const validIndex = Math.min(Math.max(0, currentIndex), images.length - 1);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: validIndex * SCREEN_WIDTH,
          animated: false,
        });
      }, 100);
    }
  }, [visible, currentIndex, images.length]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.fullScreenContainer}>
        <TouchableOpacity
          style={styles.fullScreenCloseButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={28} color={colors.textInverse} />
        </TouchableOpacity>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.fullScreenScrollContent}
        >
          {images.map((img, index) => {
            const imageSource = getImageSource(img);
            const caption = getImageCaption(img);
            
            // Skip if no valid image source
            if (!imageSource) {
              return null;
            }
            
            return (
              <View key={index} style={styles.fullScreenImageWrapper}>
                <Image
                  source={imageSource}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                  onLoadEnd={() => {
                    // Cache image after it loads (background, non-blocking) - only for URLs
                    const imageUrl = getImageUrl(img);
                    if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('file://')) {
                      ImageCacheService.cacheImage(imageUrl).catch(() => {
                        // Silently fail - image is already displayed
                      });
                    }
                  }}
                />
                {caption && (
                  <View style={[styles.fullScreenCaption, { backgroundColor: colors.overlay }]}>
                    <AmharicText variant="body" color={colors.textInverse} align="center">
                      {caption}
                    </AmharicText>
                  </View>
                )}
              </View>
            );
          }).filter(Boolean)}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.fullScreenPagination}>
            <View style={[styles.fullScreenCounter, { backgroundColor: colors.overlay }]}>
              <AmharicText variant="caption" color={colors.textInverse} bold>
                {currentIndex + 1} / {images.length}
              </AmharicText>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: '100%',
    flex: 0,
  },
  singleImageContainer: {
    width: '100%',
  },
  carouselImageCard: {
    borderRadius: 0,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  paginationDotActive: {
    opacity: 1,
    backgroundColor: '#FFFFFF',
  },
  counterContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  counterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Full Screen Styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fullScreenScrollContent: {
    alignItems: 'center',
  },
  fullScreenImageWrapper: {
    width: SCREEN_WIDTH,
    height: FULLSCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: FULLSCREEN_HEIGHT,
  },
  fullScreenCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  fullScreenPagination: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fullScreenCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default ImageCarousel;

