import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContentBlockRenderer from '../components/ContentBlockRenderer';
import AmharicText from '../src/components/AmharicText';
import SyncService from '../src/services/SyncService';
import { getColors } from '../src/theme/colors';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { useReadingProgress } from '../src/contexts/ReadingProgressContext';
import ImageCarousel from '../components/ImageCarousel';

// Blur effect component using pure React Native (no native modules)
const BlurViewComponent = ({ intensity = 20, tint = 'dark', style, ...props }) => {
  // Single layer blur effect
  const baseOpacity = Math.min(intensity / 100, 0.4);
  const isDark = tint === 'dark';
  
  return (
    <View 
      style={[
        style, 
        { 
          backgroundColor: isDark 
            ? `rgba(0, 0, 0, ${baseOpacity})` 
            : `rgba(255, 255, 255, ${baseOpacity})`,
        }
      ]} 
      {...props} 
    />
  );
};

// Simple fallback components that don't rely on native modules
const SimpleGradient = ({ children, colors, style, ...props }) => (
  <View style={[style, { backgroundColor: colors[0] }]} {...props}>
    {children}
  </View>
);

const SimpleBlurView = ({ children, intensity, style, ...props }) => (
  <View style={[style, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} {...props}>
    {children}
  </View>
);

const TopicDetailScreen = ({ navigation, route }) => {
  const { religion, topicId } = route.params;
  const [topic, setTopic] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
  const scrollViewRef = useRef(null);
  const readTimerRef = useRef(null);
  
  // Get theme colors with fallback
  let isDarkMode = false;
  let colors = {};
  
  try {
    const darkModeContext = useDarkMode();
    isDarkMode = darkModeContext?.isDarkMode || false;
    colors = getColors(isDarkMode);
  } catch (error) {
    console.warn('Error getting dark mode context, using defaults:', error);
    isDarkMode = false;
    colors = getColors(false);
  }

  // Get reading progress context
  let markTopicAsRead = null;
  try {
    const readingProgress = useReadingProgress();
    markTopicAsRead = readingProgress?.markTopicAsRead;
  } catch (error) {
    console.warn('Error getting reading progress context:', error);
  }
  
  // Ensure colors object has all required properties
  if (!colors || typeof colors !== 'object') {
    console.warn('Invalid colors object, using defaults');
    colors = getColors(false);
  }
  
  // Use light gray background for better visual harmony
  const screenBackgroundColor = isDarkMode 
    ? colors.background 
    : colors.borderLight; // Light gray (#F3F4F6) for light mode
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Create styles with current colors
  const styles = createStyles(colors);

  useEffect(() => {
    if (topicId) {
      loadTopicData();
    }
  }, [topicId]);

  useEffect(() => {
    if (topic && topicDetail) {
      // Start animations when content loads
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Mark topic as read after user views it for 3 seconds
      // This ensures they actually read the content
      if (!hasMarkedAsRead && markTopicAsRead && religion) {
        readTimerRef.current = setTimeout(() => {
          try {
            markTopicAsRead(topicId, religion.id);
            setHasMarkedAsRead(true);
            console.log(`Marked topic ${topicId} as read`);
          } catch (error) {
            console.error('Error marking topic as read:', error);
          }
        }, 3000); // 3 seconds
      }
    }

    // Cleanup timer on unmount
    return () => {
      if (readTimerRef.current) {
        clearTimeout(readTimerRef.current);
      }
    };
  }, [topic, topicDetail, topicId, religion, hasMarkedAsRead, markTopicAsRead]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading topic data for topicId:', topicId);
      
      // Get stored content
      const storedContent = await SyncService.getStoredContent();
      console.log('Stored content:', {
        religions: storedContent.religions?.length || 0,
        topics: storedContent.topics?.length || 0,
        topicDetails: storedContent.topicDetails?.length || 0
      });
      
      // Find the topic
      const foundTopic = storedContent.topics?.find(t => t.id === topicId);
      console.log('Looking for topicId:', topicId);
      console.log('Available topics:', storedContent.topics?.map(t => ({ id: t.id, title: t.title })) || []);
      
      if (!foundTopic) {
        throw new Error('Topic not found');
      }
      
      setTopic(foundTopic);
      console.log('Found topic:', foundTopic.title);
      
      // Find the topic detail
      const foundDetail = storedContent.topicDetails?.find(d => d.topicId === topicId);
      console.log('Looking for topicDetail with topicId:', topicId);
      console.log('Available topicDetails:', storedContent.topicDetails?.map(d => ({ 
        topicId: d.topicId, 
        useBlocks: d.useBlocks, 
        contentBlocks: d.contentBlocks?.length || 0 
      })) || []);
      
      if (foundDetail) {
        setTopicDetail(foundDetail);
        console.log(`Loaded topic detail for: ${foundTopic.title}`, {
          useBlocks: foundDetail.useBlocks,
          contentBlocks: foundDetail.contentBlocks?.length || 0
        });
        
        // Debug: Log the actual content blocks structure
        if (foundDetail.contentBlocks && foundDetail.contentBlocks.length > 0) {
          console.log('Content blocks structure:', foundDetail.contentBlocks.map((block, index) => ({
            index,
            id: block.id,
            blockType: block.blockType,
            orderIndex: block.orderIndex,
            contentDataKeys: block.contentData ? Object.keys(block.contentData) : [],
            hasText: block.contentData?.text ? 'YES' : 'NO',
            hasImageUrl: block.contentData?.imageUrl ? 'YES' : 'NO',
            hasUrl: block.contentData?.url ? 'YES' : 'NO'
          })));
        } else {
          console.log('No content blocks found in topic detail');
        }
      } else {
        console.log('No topic detail found for topicId:', topicId);
        // Create a mock topic detail if none exists
        const mockDetail = {
          id: `detail_${topicId}`,
          topicId: topicId,
          useBlocks: true,
          contentBlocks: [
            {
              id: 1,
              blockType: 'text',
              contentData: {
                text: 'This topic is currently being prepared. Content will be available soon.',
              },
              orderIndex: 0,
            }
          ]
        };
        setTopicDetail(mockDetail);
      }
      
    } catch (error) {
      console.error('Error loading topic data:', error);
      setError(error.message || 'Failed to load topic data');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!topic || !topicDetail) return;

    try {
      let shareMessage = `${topic.title}\n\n`;

      // Add content blocks
      if (topicDetail.contentBlocks && topicDetail.contentBlocks.length > 0) {
        topicDetail.contentBlocks
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .forEach((block) => {
            const contentData = typeof block.contentData === 'string' 
              ? JSON.parse(block.contentData) 
              : block.contentData;

            if (contentData.text) {
              shareMessage += `${contentData.text}\n\n`;
            }
          });
      }

      shareMessage += `Melhik - Evangelism Tool`;

      await Share.share({
        title: topic.title,
        message: shareMessage,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share content');
    }
  };

  const renderLoadingState = () => (
    <SafeAreaView style={[styles.loadingContainer, { backgroundColor: screenBackgroundColor }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AmharicText variant="body" color={colors.textSecondary} style={styles.loadingText}>
        ይጠብቃል...
      </AmharicText>
    </SafeAreaView>
  );

  const renderErrorState = () => (
    <SafeAreaView style={[styles.errorContainer, { backgroundColor: screenBackgroundColor }]}>
      <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
      <AmharicText variant="heading" color={colors.textPrimary} style={styles.errorTitle}>
        ስህተት ተፈጥሯል
      </AmharicText>
      <AmharicText variant="body" color={colors.textSecondary} align="center" style={styles.errorMessage}>
        {error}
      </AmharicText>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: colors.primary }]} 
        onPress={loadTopicData}
      >
        <AmharicText variant="button" color={colors.textInverse}>
          እንደገና ሞክር
        </AmharicText>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const renderHeroSection = () => {
    // Use three images from assets
    const headerImages = [
      require('../assets/topic-header/bible 1.jpg'),
      require('../assets/topic-header/bible2.jpg'),
      require('../assets/topic-header/bible3.jpg'),
    ];
    
    const hasImages = headerImages.length > 0;
    
    return (
      <View style={styles.heroSection}>
        {hasImages ? (
          <View style={styles.heroImageContainer}>
            <ImageCarousel
              images={headerImages}
              height={250}
              flexible={false}
              showPagination={true}
              showFullScreen={true}
              autoPlay={true}
              autoPlayInterval={5000}
              showCounter={false}
            />
            {/* Linear gradient overlay with topic title */}
            <View style={styles.heroOverlay}>
              <View style={styles.heroContentOverlay}>
                <AmharicText 
                  variant="largeTitle" 
                  color="#FFFFFF" 
                  bold 
                  style={styles.heroTitleOverlay}
                >
                  {topic?.title || 'Topic'}
                </AmharicText>
                <AmharicText 
                  variant="body" 
                  color="rgba(255, 255, 255, 0.9)" 
                  style={styles.heroSubtitleOverlay}
                >
                  ይህንን አስፈላጊ ርዕስ ይመልከቱ
                </AmharicText>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.heroGradient, { backgroundColor: colors.surface }]}>
            <View style={styles.heroContent}>
              <AmharicText 
                variant="largeTitle" 
                color={colors.textPrimary} 
                bold 
                style={styles.heroTitle}
              >
                {topic?.title || 'Topic'}
              </AmharicText>
              <AmharicText 
                variant="body" 
                color={colors.textSecondary} 
                style={styles.heroSubtitle}
              >
                ይህንን አስፈላጊ ርዕስ ይመልከቱ
              </AmharicText>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderQuestionCard = () => (
    <Animated.View 
      style={[
        styles.questionCardContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View 
        style={[
          styles.questionCard, 
          { 
            backgroundColor: colors.surface,
            ...Platform.select({
              ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
              },
              android: {
                elevation: 3,
              },
            }),
          }
        ]}
      >
        <View style={styles.questionCardHeader}>
          <AmharicText variant="subheading" color={colors.textPrimary} bold style={styles.questionTitle}>
            ይህ ርዕስ ስለ ምን ነው?
          </AmharicText>
        </View>
        <View style={[styles.questionDivider, { backgroundColor: colors.borderLight }]} />
        <AmharicText variant="body" color={colors.textSecondary} style={styles.questionText}>
          {topic?.description || `ይህ ርዕስ ${topic?.title || 'ይህ ርዕስ'} ከተዛመዱ መሰረታዊ ጽንሰ-ሀሳቦችን እና ትምህርቶችን ያስላል።`}
        </AmharicText>
      </View>
    </Animated.View>
  );

  const renderMainContent = () => (
    <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
      <View style={styles.contentSection}>
        <View style={styles.modernSectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <SimpleGradient colors={[colors.primary, colors.primaryDark]} style={styles.sectionIcon}>
              <MaterialCommunityIcons name="book-open" size={20} color="#FFFFFF" />
            </SimpleGradient>
            <View style={styles.sectionTitleText}>
              <AmharicText variant="heading" color={colors.textPrimary} bold style={styles.sectionTitle}>
                ይዘት
              </AmharicText>
              <AmharicText variant="caption" color={colors.textSecondary} style={styles.sectionSubtitle}>
                {topicDetail?.contentBlocks?.length || 0} የይዘት ክፍሎች
              </AmharicText>
            </View>
          </View>
        </View>

        <View style={styles.contentBlocksContainer}>
          {topicDetail?.contentBlocks && Array.isArray(topicDetail.contentBlocks) && topicDetail.contentBlocks.length > 0 ? (
            topicDetail.contentBlocks
              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
              .map((block, index) => {
                // Validate block structure
                if (!block || !block.blockType) {
                  console.warn('Invalid block at index', index, block);
                  return null;
                }
                
                // Ensure contentData is an object, not a string
                const processedBlock = {
                  ...block,
                  contentData: typeof block.contentData === 'string' 
                    ? JSON.parse(block.contentData) 
                    : block.contentData
                };
                
                return (
                  <Animated.View
                    key={block.id || index}
                    style={[
                      styles.contentBlock,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: Animated.add(
                              slideAnim,
                              new Animated.Value(index * 20)
                            )
                          }
                        ]
                      }
                    ]}
                  >
                    <ContentBlockRenderer 
                      block={processedBlock} 
                      colors={colors}
                      isDarkMode={isDarkMode}
                    />
                  </Animated.View>
                );
              }).filter(Boolean)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="book-open" size={48} color={colors.textTertiary} />
              <AmharicText variant="subheading" color={colors.textPrimary} style={styles.emptyTitle}>
                ይዘት የለም
              </AmharicText>
              <AmharicText variant="body" color={colors.textSecondary} align="center" style={styles.emptyMessage}>
                ይህ ርዕስ እስካሁን የይዘት ክፍሎች የሉትም።
              </AmharicText>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (!topic) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: screenBackgroundColor }]}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <AmharicText variant="heading" color={colors.textPrimary} style={styles.errorTitle}>
          ርዕስ አልተገኘም
        </AmharicText>
        <AmharicText variant="body" color={colors.textSecondary} align="center" style={styles.errorMessage}>
          የተጠየቀው ርዕስ ሊገኝ አልቻለም።
        </AmharicText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={() => navigation.goBack()}
        >
          <AmharicText variant="button" color={colors.textInverse}>
            ተመለስ
          </AmharicText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBackgroundColor }]} edges={[]}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: screenBackgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderHeroSection()}
        {renderQuestionCard()}
        {renderMainContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    width: '100%',
    marginBottom: 0,
    marginHorizontal: 0,
  },
  heroImageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
  },
  heroGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  gradientLayer2: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  gradientLayer3: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  gradientLayer4: {
    position: 'absolute',
    top: '75%',
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  heroContentOverlay: {
    width: '100%',
    zIndex: 10,
  },
  heroTitleOverlay: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitleOverlay: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroGradient: {
    minHeight: 200,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    width: '100%',
  },
  heroContent: {
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  religionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  religionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  questionCardContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
  },
  questionCard: {
    borderRadius: 16,
    padding: 20,
  },
  questionCardHeader: {
    marginBottom: 16,
  },
  questionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },
  questionDivider: {
    height: 1,
    marginBottom: 16,
    width: '100%',
  },
  questionText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  mainContent: {
    paddingHorizontal: 0,
    paddingBottom: 32,
    marginTop: 16,
    width: '100%',
  },
  contentSection: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 24,
    marginHorizontal: 0,
    minHeight: 200,
    width: '100%',
  },
  modernSectionHeader: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  contentBlocksContainer: {
    gap: 16,
  },
  contentBlock: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TopicDetailScreen;