import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';
import ImageCacheService from '../src/services/ImageCacheService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Modern Image Card Component
 * 
 * A professional, modern image card with:
 * - Smooth loading animations
 * - Error handling
 * - Caption support
 * - Tap to view full-screen
 * - Cached image support
 * - Dark mode support
 * - Professional styling
 */
const ImageCard = ({
  imageUrl,
  caption,
  altText,
  height = null, // null means flexible sizing
  borderRadius = 0, // No rounded corners by default
  onPress,
  onLongPress,
  showCaption = true,
  showFullScreen = true,
  flexible = true, // Enable flexible sizing by default
  maxHeight = null, // Optional max height constraint
  style,
  containerStyle,
  ...props
}) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Handle both local sources (numbers from require) and URLs (strings)
  const isLocalSource = typeof imageUrl === 'number';
  const [displayUri, setDisplayUri] = useState(isLocalSource ? imageUrl : imageUrl);
  const [imageDimensions, setImageDimensions] = useState(null); // { width, height }
  const [calculatedHeight, setCalculatedHeight] = useState(height || 300);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Get image dimensions for flexible sizing
  useEffect(() => {
    if (!imageUrl) {
      setCalculatedHeight(height || 300);
      return;
    }
    
    // Skip dimension calculation for local sources (require)
    if (typeof imageUrl === 'number') {
      setCalculatedHeight(height || 300);
      return;
    }
    
    // Get image dimensions if flexible sizing is enabled
    if (flexible && !height) {
      // Use original URL for dimension calculation (works better than cached URI)
      Image.getSize(
        imageUrl,
        (width, imgHeight) => {
          const aspectRatio = imgHeight / width;
          const screenWidth = SCREEN_WIDTH - 32; // Account for padding
          let calculatedH = screenWidth * aspectRatio;
          
          // Apply max height constraint if provided
          if (maxHeight && calculatedH > maxHeight) {
            calculatedH = maxHeight;
          }
          
          setImageDimensions({ width, height: imgHeight });
          setCalculatedHeight(calculatedH);
        },
        (error) => {
          console.warn('ImageCard: Could not get image dimensions, trying cached URI:', error);
          // Try with displayUri if original URL fails
          if (displayUri && displayUri !== imageUrl) {
            Image.getSize(
              displayUri,
              (width, imgHeight) => {
                const aspectRatio = imgHeight / width;
                const screenWidth = SCREEN_WIDTH - 32;
                let calculatedH = screenWidth * aspectRatio;
                
                if (maxHeight && calculatedH > maxHeight) {
                  calculatedH = maxHeight;
                }
                
                setImageDimensions({ width, height: imgHeight });
                setCalculatedHeight(calculatedH);
              },
              (err) => {
                console.warn('ImageCard: Could not get image dimensions from cached URI:', err);
                // Fallback to default height if dimensions can't be retrieved
                setCalculatedHeight(height || 300);
              }
            );
          } else {
            // Fallback to default height if dimensions can't be retrieved
            setCalculatedHeight(height || 300);
          }
        }
      );
    } else {
      setCalculatedHeight(height || 300);
    }
  }, [imageUrl, flexible, height, maxHeight]);

  // Check for cached version on mount (non-blocking, optional optimization)
  useEffect(() => {
    // Skip caching for local sources (require)
    if (typeof imageUrl === 'number') {
      setDisplayUri(imageUrl);
      return;
    }
    
    // Check if imageUrl is a valid string before calling string methods
    if (!imageUrl || typeof imageUrl !== 'string') {
      setDisplayUri(imageUrl);
      return;
    }
    
    if (imageUrl.startsWith('file://')) {
      setDisplayUri(imageUrl);
      return;
    }

    // Check if cached version exists (non-blocking check)
    ImageCacheService.getCachedImageUri(imageUrl)
      .then(cachedUri => {
        if (cachedUri && typeof cachedUri === 'string' && cachedUri.startsWith('file://')) {
          // Use cached version if available
          setDisplayUri(cachedUri);
        }
        // Otherwise keep using original URL (already set)
      })
      .catch(() => {
        // On error, keep using original URL (already set)
      });
  }, [imageUrl]);

  // Loading shimmer animation
  useEffect(() => {
    if (loading) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => {
        shimmer.stop();
        shimmerAnim.setValue(0);
      };
    } else {
      shimmerAnim.setValue(0);
    }
  }, [loading]);

  // Fade in animation when image loads
  useEffect(() => {
    if (imageLoaded && !loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [imageLoaded, loading]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    setImageLoaded(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setImageLoaded(true);
    
    // Cache image AFTER it loads successfully (background, non-blocking)
    // Only cache if imageUrl is a string URL (not local require source)
    if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('file://')) {
      ImageCacheService.cacheImage(imageUrl)
        .then(cachedUri => {
          // If cached successfully, update to use cached version
          if (cachedUri && typeof cachedUri === 'string' && cachedUri.startsWith('file://')) {
            setDisplayUri(cachedUri);
            ImageCacheService.updateLastAccessed(imageUrl);
          }
        })
        .catch(err => {
          // Silently fail - image is already displayed
          console.warn('Background caching failed (non-critical):', err.message);
        });
    }
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    setImageLoaded(false);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (showFullScreen && !error && displayUri) {
      // Open full-screen viewer (would need to be implemented)
      console.log('Open full-screen for:', displayUri);
    }
  };

  const displayCaption = caption || altText;
  const imageHeight = flexible && !height ? calculatedHeight : (height || 300);

  // Don't render if no image URI
  if (!displayUri) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.imageContainer, { minHeight: 200, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
          <AmharicText variant="caption" color={colors.textTertiary} style={{ marginTop: 8 }}>
            ምስል አልተገኘም
          </AmharicText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onLongPress={onLongPress}
        style={[styles.imageWrapper, style]}
        {...props}
      >
        {/* Image Container */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          {!error ? (
            <>
              {/* Shimmer Loading Effect */}
              {loading && (
                <Animated.View
                  style={[
                    styles.shimmerContainer,
                    {
                      opacity: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.6],
                      }),
                      backgroundColor: isDarkMode ? colors.surface : '#F3F4F6',
                    },
                  ]}
                />
              )}

              {/* Image */}
              <Animated.Image
                source={typeof displayUri === 'number' 
                  ? displayUri 
                  : { uri: displayUri, cache: 'default' }}
                style={[
                  styles.image,
                  {
                    width: '100%',
                    height: imageHeight,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
                resizeMode={flexible ? "contain" : "cover"}
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                onError={(error) => {
                  console.warn('ImageCard: Error loading image:', displayUri, error);
                  handleError();
                }}
              />

              {/* Loading Overlay */}
              {loading && (
                <View style={[styles.loadingOverlay, { backgroundColor: colors.overlayLight }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <AmharicText
                    variant="caption"
                    color={colors.textSecondary}
                    style={styles.loadingText}
                  >
                    ይጠብቃል...
                  </AmharicText>
                </View>
              )}

              {/* Full-Screen Indicator */}
              {showFullScreen && !loading && !error && (
                <View style={styles.fullScreenIndicator}>
                  <View 
                    style={[
                      styles.fullScreenBadge, 
                      { 
                        backgroundColor: isDarkMode 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(0, 0, 0, 0.6)'
                      }
                    ]}
                  >
                    <Ionicons 
                      name="expand" 
                      size={16} 
                      color={isDarkMode ? '#FFFFFF' : '#FFFFFF'} 
                    />
                  </View>
                </View>
              )}
            </>
          ) : (
            /* Error State */
            <View
              style={[
                styles.errorContainer,
                {
                  minHeight: imageHeight,
                  backgroundColor: isDarkMode ? colors.surface : '#F9FAFB',
                },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={48}
                color={colors.textTertiary}
              />
              <AmharicText
                variant="caption"
                color={colors.textTertiary}
                align="center"
                style={styles.errorText}
              >
                {error ? 'ምስል ሊጫን አልቻለም' : 'ምስል የለም'}
              </AmharicText>
            </View>
          )}
        </View>

        {/* Caption */}
        {showCaption && displayCaption && !loading && (
          <Animated.View
            style={[
              styles.captionContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <AmharicText
              variant="caption"
              color={colors.textSecondary}
              style={styles.captionText}
              numberOfLines={2}
            >
              {displayCaption}
            </AmharicText>
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  fullScreenIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  fullScreenBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
  },
  captionContainer: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  captionText: {
    lineHeight: 18,
  },
});

export default ImageCard;

