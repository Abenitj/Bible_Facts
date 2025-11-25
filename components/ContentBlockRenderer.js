import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../src/theme/colors';
import ImageCarousel from './ImageCarousel';
import ImageCard from './ImageCard';
import AmharicText from '../src/components/AmharicText';

// Simple fallback component that doesn't rely on native modules
const SimpleGradient = ({ children, colors, style, ...props }) => (
  <View style={[style, { backgroundColor: colors[0] }]} {...props}>
    {children}
  </View>
);

const { width: screenWidth } = Dimensions.get('window');

const ImageBlockComponent = ({ imageData, colors, isDarkMode, style }) => {
  // Handle both 'url' and 'imageUrl' properties
  const imageUrl = imageData.url || imageData.imageUrl;
  const caption = imageData.caption || imageData.altText;

  if (!imageUrl) {
    return (
      <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f5' }, style]}>
        <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
        <AmharicText variant="caption" color={colors.textTertiary} align="center">
          ምስል የለም
        </AmharicText>
      </View>
    );
  }

  return (
    <View style={style}>
      <ImageCard
        imageUrl={imageUrl}
        caption={caption}
        height={400}
        borderRadius={16}
        showFullScreen={true}
        containerStyle={styles.imageCardContainer}
      />
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
        // Parse contentData if it's a string
        const textContentData = typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData;
        
        return (
          <View style={styles.textBlock}>
            <AmharicText 
              variant="body" 
              color={themeColors.textPrimary}
              style={styles.textContent}
            >
              {textContentData?.text || ''}
            </AmharicText>
          </View>
        );

      case 'image':
        // Parse contentData if it's a string
        const imageContentData = typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData;
        
        // Use carousel for single image (allows full-screen view)
        const imageUrl = imageContentData?.url || imageContentData?.imageUrl;
        if (imageUrl) {
          return (
            <View style={styles.imageBlock}>
              <ImageCarousel
                images={[imageContentData]}
                height={400}
                showPagination={false}
                showFullScreen={true}
              />
            </View>
          );
        }
        return (
          <View style={styles.imageBlock}>
            <ImageBlockComponent imageData={imageContentData} colors={themeColors} isDarkMode={isDarkMode} />
          </View>
        );

      case 'mixed':
        // Parse contentData if it's a string
        const mixedContentData = typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData;
        
        return (
          <View style={styles.mixedBlock}>
            {mixedContentData?.text && (
              <View style={styles.mixedTextSection}>
                <AmharicText 
                  variant="body" 
                  color={themeColors.textPrimary}
                  style={styles.textContent}
                >
                  {mixedContentData.text}
                </AmharicText>
              </View>
            )}
            {(mixedContentData?.imageUrl || mixedContentData?.url || (mixedContentData?.images && mixedContentData.images.length > 0)) && (
              <View style={styles.mixedImagesSection}>
                {mixedContentData.images && mixedContentData.images.length > 0 ? (
                  <ImageCarousel
                    images={mixedContentData.images}
                    height={350}
                    showPagination={true}
                    showFullScreen={true}
                  />
                ) : (
                  <ImageCarousel
                    images={[mixedContentData]}
                    height={350}
                    showPagination={false}
                    showFullScreen={true}
                  />
                )}
              </View>
            )}
          </View>
        );

      case 'gallery':
        // Parse contentData if it's a string
        const galleryContentData = typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData;
        
        return (
          <View style={styles.galleryBlock}>
            {galleryContentData?.images && galleryContentData.images.length > 0 ? (
              <ImageCarousel
                images={galleryContentData.images}
                height={400}
                showPagination={true}
                showFullScreen={true}
                autoPlay={false}
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f5' }]}>
                <Ionicons name="images-outline" size={48} color={themeColors.textTertiary} />
                <AmharicText variant="caption" color={themeColors.textTertiary} align="center">
                  No images in gallery
                </AmharicText>
              </View>
            )}
          </View>
        );

      case 'title':
        // Parse contentData if it's a string
        const titleContentData = typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData;
        
        return (
          <View style={styles.titleBlock}>
            <AmharicText 
              variant="heading" 
              color={themeColors.textPrimary}
              bold
              style={styles.titleContent}
            >
              {titleContentData?.text || ''}
            </AmharicText>
          </View>
        );

      case 'subtitle':
        // Parse contentData if it's a string
        const subtitleContentData = typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData;
        
        return (
          <View style={styles.subtitleBlock}>
            <AmharicText 
              variant="subheading" 
              color={themeColors.textSecondary}
              style={styles.subtitleContent}
            >
              {subtitleContentData?.text || ''}
            </AmharicText>
          </View>
        );

      case 'list':
        // Parse contentData if it's a string
        const listContentData = typeof block.contentData === 'string' 
          ? JSON.parse(block.contentData) 
          : block.contentData;
        
        return (
          <View style={styles.listBlock}>
            {listContentData?.items && listContentData.items.length > 0 ? (
              listContentData.items.map((item, index) => (
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
  imageCardContainer: {
    width: '100%',
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