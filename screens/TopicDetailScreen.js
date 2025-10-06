import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import ContentBlockRenderer from '../components/ContentBlockRenderer';
import SyncService from '../src/services/SyncService';
import { getColors } from '../src/theme/colors';
import { useDarkMode } from '../src/contexts/DarkModeContext';

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
  
  // Ensure colors object has all required properties
  if (!colors || typeof colors !== 'object') {
    console.warn('Invalid colors object, using defaults');
    colors = getColors(false);
  }
  
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
    }
  }, [topic, topicDetail]);

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
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading topic details...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
      <Text style={styles.errorTitle}>Error Loading Content</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadTopicData}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeroSection = () => (
    <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
      <SimpleGradient
        colors={['#1F2937', '#111827']}
        style={styles.heroGradient}
      >
        {/* Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{topic?.title || 'Topic'}</Text>
          <Text style={styles.heroSubtitle}>
            Explore the depths of this important topic
          </Text>
        </View>
      </SimpleGradient>
    </Animated.View>
  );

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
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <MaterialCommunityIcons name="help-circle" size={24} color={colors.primary} />
          <Text style={styles.questionTitle}>What is this topic about?</Text>
        </View>
        <Text style={styles.questionText}>
          {topic?.description || `This topic explores the fundamental concepts and teachings related to ${topic?.title?.toLowerCase() || 'this subject'}.`}
        </Text>
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
              <Text style={styles.sectionTitle}>Content</Text>
              <Text style={styles.sectionSubtitle}>
                {topicDetail?.contentBlocks?.length || 0} content blocks
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentBlocksContainer}>
          {topicDetail?.contentBlocks && Array.isArray(topicDetail.contentBlocks) && topicDetail.contentBlocks.length > 0 ? (
            topicDetail.contentBlocks.map((block, index) => {
              // Validate block structure
              if (!block || !block.blockType) {
                console.warn('Invalid block at index', index, block);
                return null;
              }
              
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
                    block={block} 
                    colors={colors}
                    isDarkMode={isDarkMode}
                  />
                </Animated.View>
              );
            }).filter(Boolean)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="book-open" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Content Available</Text>
              <Text style={styles.emptyMessage}>
                This topic doesn't have any content blocks yet.
              </Text>
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
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Topic Not Found</Text>
        <Text style={styles.errorMessage}>The requested topic could not be found.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderHeroSection()}
        {renderQuestionCard()}
        {renderMainContent()}
      </ScrollView>
    </View>
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
    height: 200,
    marginBottom: 0,
    marginHorizontal: 0,
    width: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 24,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  questionCardContainer: {
    marginHorizontal: 0,
    marginBottom: 0,
    paddingHorizontal: 16,
    marginTop: -20,
    zIndex: 10,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  questionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
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