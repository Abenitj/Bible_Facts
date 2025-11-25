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
  height = 300,
  borderRadius = 16,
  onPress,
  onLongPress,
  showCaption = true,
  showFullScreen = true,
  style,
  containerStyle,
  ...props
}) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayUri, setDisplayUri] = useState(imageUrl); // Use URL directly
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Check for cached version on mount (non-blocking, optional optimization)
  useEffect(() => {
    if (!imageUrl || imageUrl.startsWith('file://')) {
      setDisplayUri(imageUrl);
      return;
    }

    // Check if cached version exists (non-blocking check)
    ImageCacheService.getCachedImageUri(imageUrl)
      .then(cachedUri => {
        if (cachedUri && cachedUri.startsWith('file://')) {
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
    if (imageUrl && !imageUrl.startsWith('file://')) {
      ImageCacheService.cacheImage(imageUrl)
        .then(cachedUri => {
          // If cached successfully, update to use cached version
          if (cachedUri && cachedUri.startsWith('file://')) {
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

  // Don't render if no image URI
  if (!displayUri) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.card, { height, borderRadius, backgroundColor: isDarkMode ? colors.surface : '#FFFFFF' }, style]}>
          <View style={[styles.imageContainer, { borderRadius, height, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
            <AmharicText variant="caption" color={colors.textTertiary} style={{ marginTop: 8 }}>
              ምስል አልተገኘም
            </AmharicText>
          </View>
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
        style={[
          styles.card,
          {
            height,
            borderRadius,
            backgroundColor: isDarkMode ? colors.surface : '#FFFFFF',
            shadowColor: colors.shadow,
          },
          style,
        ]}
        {...props}
      >
        {/* Image Container */}
        <View style={[styles.imageContainer, { borderRadius, height }]}>
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
                source={{ 
                  uri: displayUri,
                  cache: 'default' // Use default cache
                }}
                style={[
                  styles.image,
                  {
                    height,
                    borderRadius,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
                resizeMode="cover"
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
                  <View style={[styles.fullScreenBadge, { backgroundColor: colors.overlay }]}>
                    <Ionicons name="expand" size={16} color={colors.textInverse} />
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
                  height,
                  borderRadius,
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
                backgroundColor: isDarkMode ? colors.surface : '#FFFFFF',
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.captionIconContainer}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.primary}
              />
            </View>
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
  card: {
    width: '100%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  captionIconContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  captionText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default ImageCard;

