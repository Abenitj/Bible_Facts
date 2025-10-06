import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../src/theme/colors';

// Simple fallback component that doesn't rely on native modules
const SimpleGradient = ({ children, colors, style, ...props }) => (
  <View style={[style, { backgroundColor: colors[0] }]} {...props}>
    {children}
  </View>
);

const { width: screenWidth } = Dimensions.get('window');

const ImageBlockComponent = ({ imageData, colors, isDarkMode, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle both 'url' and 'imageUrl' properties
  const imageUrl = imageData.url || imageData.imageUrl;

  return (
    <View style={style}>
      {imageUrl && !error ? (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
          {loading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="large" color="#667eea" />
            </View>
          )}
          {(imageData.caption || imageData.altText) && (
            <View style={styles.captionContainer}>
              <Ionicons name="information-circle" size={14} color={colors.textTertiary} />
              <Text style={[styles.imageCaption, { color: colors.textSecondary }]}>
                {imageData.caption || imageData.altText}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f5' }]}>
          <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
            {error ? 'Failed to load image' : 'No image'}
          </Text>
        </View>
      )}
    </View>
  );
};

const ContentBlockRenderer = ({ block, colors = {}, isDarkMode = false }) => {
  // Use theme colors as base, then override with provided colors
  const themeColors = { ...getColors(isDarkMode), ...colors };
  
  // Validate block data
  if (!block || !block.blockType) {
    console.warn('ContentBlockRenderer: Invalid block data', block);
    return (
      <View style={[styles.blockContainer, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.unknownText, { color: themeColors.textSecondary }]}>
          Invalid content block
        </Text>
      </View>
    );
  }
  const renderBlock = () => {
    switch (block.blockType) {
      case 'text':
        return (
          <View style={styles.textBlock}>
            <Text style={[styles.textContent, { color: themeColors.textPrimary }]}>
              {block.contentData.text || ''}
            </Text>
          </View>
        );

      case 'image':
        return (
          <View style={styles.imageBlock}>
            <ImageBlockComponent imageData={block.contentData} colors={themeColors} isDarkMode={isDarkMode} />
          </View>
        );

      case 'mixed':
        return (
          <View style={styles.mixedBlock}>
            {block.contentData.text && (
              <View style={styles.mixedTextSection}>
                <Text style={[styles.textContent, { color: themeColors.textPrimary }]}>
                  {block.contentData.text}
                </Text>
              </View>
            )}
            {block.contentData.imageUrl && (
              <View style={styles.mixedImagesSection}>
                <ImageBlockComponent 
                  imageData={block.contentData} 
                  colors={themeColors} 
                  isDarkMode={isDarkMode}
                  style={styles.mixedImageContainer}
                />
              </View>
            )}
            {block.contentData.images && block.contentData.images.length > 0 && (
              <View style={styles.mixedImagesSection}>
                {block.contentData.images.map((image, index) => (
                  <ImageBlockComponent 
                    key={index} 
                    imageData={image} 
                    colors={themeColors} 
                    isDarkMode={isDarkMode}
                    style={styles.mixedImageContainer}
                  />
                ))}
              </View>
            )}
          </View>
        );

      case 'gallery':
        return (
          <View style={styles.galleryBlock}>
            {block.contentData.images && block.contentData.images.length > 0 ? (
              <View style={styles.galleryGrid}>
                {block.contentData.images.map((image, index) => (
                  <ImageBlockComponent 
                    key={index} 
                    imageData={image} 
                    colors={themeColors} 
                    isDarkMode={isDarkMode}
                    style={styles.galleryItem}
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f5' }]}>
                <Ionicons name="images-outline" size={48} color={themeColors.textTertiary} />
                <Text style={[styles.placeholderText, { color: themeColors.textTertiary }]}>
                  No images in gallery
                </Text>
              </View>
            )}
          </View>
        );

      case 'title':
        return (
          <View style={styles.titleBlock}>
            <Text style={[styles.titleContent, { color: themeColors.textPrimary }]}>
              {block.contentData.text || ''}
            </Text>
          </View>
        );

      case 'subtitle':
        return (
          <View style={styles.subtitleBlock}>
            <Text style={[styles.subtitleContent, { color: themeColors.textSecondary }]}>
              {block.contentData.text || ''}
            </Text>
          </View>
        );

      case 'list':
        return (
          <View style={styles.listBlock}>
            {block.contentData.items && block.contentData.items.length > 0 ? (
              block.contentData.items.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={[styles.listBullet, { color: themeColors.primary }]}>•</Text>
                  <Text style={[styles.listItemText, { color: themeColors.textPrimary }]}>
                    {item}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyList, { color: themeColors.textTertiary }]}>
                No list items
              </Text>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.unknownBlock}>
            <Text style={[styles.unknownText, { color: themeColors.textSecondary }]}>
              Unknown block type: {block.blockType}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.blockContainer, { backgroundColor: themeColors.background }]}>
      {renderBlock()}
    </View>
  );
};

const styles = StyleSheet.create({
  blockContainer: {
    marginBottom: 16,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    width: '100%',
  },

  // Block Header Styles
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  blockTypeIcon: {
    width: 24,
    height: 24,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockTypeLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },

  // Text Block Styles
  textBlock: {
    width: '100%',
    paddingHorizontal: 4,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.3,
  },

  // Title Block Styles
  titleBlock: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  titleContent: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    letterSpacing: 0.5,
  },

  // Subtitle Block Styles
  subtitleBlock: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  subtitleContent: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0.3,
    opacity: 0.8,
  },

  // List Block Styles
  listBlock: {
    width: '100%',
    paddingHorizontal: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  listBullet: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  emptyList: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },

  // Image Block Styles
  imageBlock: {
    width: '100%',
    paddingHorizontal: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#e5e5e5',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  imageCaption: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    flex: 1,
  },

  // Mixed Block Styles
  mixedBlock: {
    width: '100%',
    paddingHorizontal: 4,
  },
  mixedTextSection: {
    marginBottom: 20,
  },
  mixedImagesSection: {
    flexDirection: 'column', // Stack images vertically for full width
    gap: 16,
    marginTop: 16,
  },
  mixedImageContainer: {
    width: '100%', // Make mixed images full width
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Gallery Block Styles
  galleryBlock: {
    width: '100%',
    paddingHorizontal: 4,
  },
  galleryGrid: {
    flexDirection: 'column', // Stack gallery images vertically for full width
    gap: 16,
  },
  galleryItem: {
    width: '100%', // Make gallery images full width
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Placeholder Styles
  imagePlaceholder: {
    width: '100%',
    height: 400,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 8,
  },

  // Unknown Block Styles
  unknownBlock: {
    padding: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  unknownText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#92400e',
  },
});

export default ContentBlockRenderer;