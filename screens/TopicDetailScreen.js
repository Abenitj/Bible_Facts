import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppBar from '../components/AppBar';
import AmharicText from '../src/components/AmharicText';
import TextWithBibleVerses from '../components/TextWithBibleVerses';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const TopicDetailScreen = ({ navigation, route }) => {
  const { religion, topicId } = route.params;
  const [topic, setTopic] = useState(null);
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  useEffect(() => {
    if (topicId) {
      // Set empty topic immediately - no loading state
      setTopic(null);
      console.log('Topic detail screen loaded - no data available yet');
    }
  }, [topicId]);

  const handleShare = async () => {
    if (!topic) return;

    try {
      const shareContent = {
        title: topic.title,
        message: `${topic.title}\n\nጥያቄ: ${topic.description}\n\nዝርዝር ማብራሪያ:\n${topic.content.explanation}\n\nየመጽሐፍ ቅዱስ ጥቅሶች:\n${topic.references.map(ref => ref.verse).join(', ')}\n\nMelhik - Evangelism Tool`,
        url: 'https://melhik.app', // Replace with actual app URL when available
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('ስህተት', 'ይዘቱን ለማጋራት አልተቻለም።');
    }
  };

  // Zoom functionality moved to ZoomableText component

  if (!topic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <AppBar 
          title="ዝርዝር መረጃ"
          showBack={true}
          onBackPress={() => {
            console.log('Back button pressed in TopicDetailScreen (loading)');
            console.log('Navigation object:', navigation);
            console.log('Can go back:', navigation.canGoBack());
            try {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                console.log('Cannot go back, navigating to Home');
                navigation.navigate('Home');
              }
            } catch (error) {
              console.error('Error going back:', error);
              navigation.navigate('Home');
            }
          }}
          colors={colors}
        />
        <View style={styles.loadingContainer}>
          <AmharicText variant="body" style={{ color: colors.textSecondary }}>ይዘቱ እያደረገ ነው...</AmharicText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <AppBar 
        title="ዝርዝር መረጃ"
        showBack={true}
        onBackPress={() => {
          console.log('Back button pressed in TopicDetailScreen');
          console.log('Navigation object:', navigation);
          console.log('Can go back:', navigation.canGoBack());
          try {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              console.log('Cannot go back, navigating to Home');
              navigation.navigate('Home');
            }
          } catch (error) {
            console.error('Error going back:', error);
            navigation.navigate('Home');
          }
        }}
        colors={colors}
      />

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
          {/* Description Section */}
          <View 
            style={[
              styles.descriptionContainer,
            ]}
          >
            {/* Question Section */}
            <View style={[styles.questionSection, { 
              backgroundColor: colors.primaryLight,
              borderLeftColor: colors.primary,
            }]}>
              <AmharicText variant="subheading" style={[styles.questionText, { color: colors.textPrimary }]}>{topic.description}</AmharicText>
            </View>
            
            {/* Separator Above */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            
            {/* Description Title */}
            <View style={styles.descriptionTitleSection}>
              <Ionicons name="create-outline" size={20} color={colors.primary} style={styles.sectionIcon} />
              <AmharicText variant="subheading" style={[styles.sectionTitle, { color: colors.textPrimary }]}>ዝርዝር ማብራሪያ</AmharicText>
            </View>
            
            {/* Separator Below */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            
            <View style={styles.sectionContent}>
              <TextWithBibleVerses
                text={topic.content.explanation}
                style={[styles.explanationText, { color: colors.textSecondary }]}
                verseData={[]} // Pass an empty array as Bible verses are now data-free
              />
            </View>
            
            {/* Share Button at Bottom */}
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-social" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 2,
    paddingVertical: 16,
    paddingBottom: 80,
  },
  questionSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: 'bold',
  },
  descriptionTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  questionShareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 1,
  },
  descriptionContainer: {
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  shareButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    zIndex: 1,
  },
  sectionContent: {
    flex: 1,
    paddingBottom: 80,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 26,
  },
});

export default TopicDetailScreen;
