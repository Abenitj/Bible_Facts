import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import AmharicText from '../src/components/AmharicText';
import TextWithBibleVerses from './TextWithBibleVerses';
import { getColors } from '../src/theme/colors';

const { width: screenWidth } = Dimensions.get('window');

const ContentBlockRenderer = ({ block, colors, isDarkMode }) => {
  const renderBlock = () => {
    switch (block.blockType) {
      case 'text':
        return (
          <View style={styles.textBlock}>
            <TextWithBibleVerses
              text={block.contentData.text || ''}
              style={[styles.textContent, { color: colors.textSecondary }]}
              verseData={[]}
            />
          </View>
        );

      case 'image':
        return (
          <View style={styles.imageBlock}>
            {block.contentData.url ? (
              <View>
                <Image
                  source={{ uri: block.contentData.url }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Image load error:', error);
                  }}
                />
                {block.contentData.caption && (
                  <AmharicText 
                    variant="caption" 
                    style={[styles.imageCaption, { color: colors.textSecondary }]}
                  >
                    {block.contentData.caption}
                  </AmharicText>
                )}
                {block.contentData.alt && (
                  <AmharicText 
                    variant="caption" 
                    style={[styles.imageAlt, { color: colors.textTertiary }]}
                  >
                    {block.contentData.alt}
                  </AmharicText>
                )}
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.cardBackground }]}>
                <AmharicText 
                  variant="caption" 
                  style={[styles.placeholderText, { color: colors.textSecondary }]}
                >
                  No image available
                </AmharicText>
              </View>
            )}
          </View>
        );

      case 'mixed':
        return (
          <View style={styles.mixedBlock}>
            {block.contentData.text && (
              <View style={styles.mixedTextSection}>
                <TextWithBibleVerses
                  text={block.contentData.text}
                  style={[styles.textContent, { color: colors.textSecondary }]}
                  verseData={[]}
                />
              </View>
            )}
            {block.contentData.images && block.contentData.images.length > 0 && (
              <View style={styles.mixedImagesSection}>
                {block.contentData.images.map((image, index) => (
                  <View key={index} style={styles.mixedImageContainer}>
                    {image.url ? (
                      <View>
                        <Image
                          source={{ uri: image.url }}
                          style={styles.mixedImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('Mixed image load error:', error);
                          }}
                        />
                        {image.caption && (
                          <AmharicText 
                            variant="caption" 
                            style={[styles.imageCaption, { color: colors.textSecondary }]}
                          >
                            {image.caption}
                          </AmharicText>
                        )}
                      </View>
                    ) : (
                      <View style={[styles.imagePlaceholder, { backgroundColor: colors.cardBackground }]}>
                        <AmharicText 
                          variant="caption" 
                          style={[styles.placeholderText, { color: colors.textSecondary }]}
                        >
                          No image {index + 1}
                        </AmharicText>
                      </View>
                    )}
                  </View>
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
                  <View key={index} style={styles.galleryItem}>
                    {image.url ? (
                      <View>
                        <Image
                          source={{ uri: image.url }}
                          style={styles.galleryImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('Gallery image load error:', error);
                          }}
                        />
                        {image.caption && (
                          <AmharicText 
                            variant="caption" 
                            style={[styles.galleryCaption, { color: colors.textSecondary }]}
                          >
                            {image.caption}
                          </AmharicText>
                        )}
                      </View>
                    ) : (
                      <View style={[styles.imagePlaceholder, { backgroundColor: colors.cardBackground }]}>
                        <AmharicText 
                          variant="caption" 
                          style={[styles.placeholderText, { color: colors.textSecondary }]}
                        >
                          No image {index + 1}
                        </AmharicText>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.cardBackground }]}>
                <AmharicText 
                  variant="caption" 
                  style={[styles.placeholderText, { color: colors.textSecondary }]}
                >
                  No images in gallery
                </AmharicText>
              </View>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.unknownBlock}>
            <AmharicText 
              variant="caption" 
              style={[styles.unknownText, { color: colors.textSecondary }]}
            >
              Unknown block type: {block.blockType}
            </AmharicText>
          </View>
        );
    }
  };

  return (
    <View style={[styles.blockContainer, { backgroundColor: colors.cardBackground }]}>
      {renderBlock()}
    </View>
  );
};

const styles = StyleSheet.create({
  blockContainer: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Text Block Styles
  textBlock: {
    width: '100%',
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
  },

  // Image Block Styles
  imageBlock: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageCaption: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  imageAlt: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },

  // Mixed Block Styles
  mixedBlock: {
    width: '100%',
  },
  mixedTextSection: {
    marginBottom: 16,
  },
  mixedImagesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mixedImageContainer: {
    width: '48%',
    marginBottom: 12,
  },
  mixedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 4,
  },

  // Gallery Block Styles
  galleryBlock: {
    width: '100%',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: '48%',
    marginBottom: 12,
  },
  galleryImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  galleryCaption: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // Placeholder Styles
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  placeholderText: {
    fontSize: 12,
    opacity: 0.6,
  },

  // Unknown Block Styles
  unknownBlock: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  unknownText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ContentBlockRenderer;

