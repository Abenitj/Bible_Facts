import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { getColors } from '../src/theme/colors';

const { width } = Dimensions.get('window');

const TopicCard = ({ topic, onPress, index = 0, colors = {}, isRead = false, isBookmarked = false }) => {
  // Use theme colors as base, then override with provided colors
  const finalColors = { ...getColors(colors.isDarkMode || false), ...colors };
  
  const [scaleValue] = useState(new Animated.Value(1));
  const [opacityValue] = useState(new Animated.Value(0));

  React.useEffect(() => {
    // Staggered animation for cards
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { 
          backgroundColor: finalColors.isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.05)',
          borderWidth: 0.5,
          borderColor: 'rgba(0, 0, 0, 0.1)'
        }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <AmharicText variant="subheading" style={[styles.title, { 
                color: finalColors.isDarkMode ? '#FFFFFF' : '#111827',
                fontWeight: '700',
                fontSize: 16
              }]}>
                {topic.title}
              </AmharicText>
              <View style={styles.indicators}>
                {isBookmarked && (
                  <View style={[styles.bookmarkIndicator, { 
                    backgroundColor: finalColors.isDarkMode ? '#F59E0B' : '#D97706'
                  }]}>
                    <Ionicons name="bookmark" size={12} color="white" />
                  </View>
                )}
                {isRead && (
                  <View style={[styles.readIndicator, { 
                    backgroundColor: finalColors.isDarkMode ? '#10B981' : '#059669'
                  }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </View>
            </View>
            <View style={[styles.arrowContainer, { 
              backgroundColor: colors.isDarkMode ? '#1E40AF' : '#DBEAFE'
            }]}>
              <Ionicons name="chevron-forward" size={16} color={colors.isDarkMode ? '#FFFFFF' : '#2563EB'} />
            </View>
          </View>
          
          <AmharicText variant="body" style={[styles.description, { 
            color: finalColors.isDarkMode ? '#D1D5DB' : '#374151',
            fontWeight: '500'
          }]}>
            {topic.description}
          </AmharicText>
          
          <View style={styles.footerRow}>
            <View style={styles.statusContainer}>
              {isRead ? (
                <View style={styles.statusItem}>
                  <Ionicons name="checkmark-circle" size={14} color={finalColors.isDarkMode ? "#10B981" : "#059669"} />
                  <AmharicText variant="caption" style={[styles.statusText, { 
                    color: finalColors.isDarkMode ? "#10B981" : "#059669",
                    fontWeight: '600'
                  }]}>
                    ተነብቷል
                  </AmharicText>
                </View>
              ) : (
                <View style={styles.statusItem}>
                  <Ionicons name="time-outline" size={14} color={finalColors.isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <AmharicText variant="caption" style={[styles.statusText, { 
                    color: finalColors.isDarkMode ? '#9CA3AF' : '#6B7280',
                    fontWeight: '500'
                  }]}>
                    አልተነበበም
                  </AmharicText>
                </View>
              )}
            </View>
            
            <View style={styles.actionHint}>
              <AmharicText variant="caption" style={[styles.hintText, { 
                color: finalColors.isDarkMode ? '#9CA3AF' : '#6B7280',
                fontWeight: '500'
              }]}>
                ለማንበብ ይንኩ
              </AmharicText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 24,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  bookmarkIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  readIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});

export default TopicCard;
