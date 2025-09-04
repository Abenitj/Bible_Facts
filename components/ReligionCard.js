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

const { width } = Dimensions.get('window');

const ReligionCard = ({ religion, onPress, index = 0, colors = {} }) => {
  // Default colors if none provided
  const defaultColors = {
    card: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280'
  };
  
  const finalColors = Object.keys(colors).length > 0 ? colors : defaultColors;
  
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
          backgroundColor: 'rgba(55, 65, 81, 0.3)',
        }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Ionicons name="book" size={20} color="#10B981" style={styles.titleIcon} />
              <AmharicText variant="subheading" style={[styles.title, { color: finalColors.textPrimary }]}>
                {religion.name}
              </AmharicText>
            </View>
            <View style={[styles.arrowContainer, { backgroundColor: finalColors.primaryLight }]}>
              <Ionicons name="chevron-forward" size={16} color={finalColors.primary} />
            </View>
          </View>
          
          <AmharicText variant="body" style={[styles.description, { color: finalColors.textSecondary }]}>
            {religion.description}
          </AmharicText>
          
          <View style={styles.footerRow}>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Ionicons name="library" size={16} color="#3B82F6" />
                <AmharicText variant="caption" style={[styles.statusText, { color: '#3B82F6' }]}>
                  ርዕሰ መልእክቶች ይመልከቱ
                </AmharicText>
              </View>
            </View>
            
            <View style={styles.actionHint}>
              <AmharicText variant="caption" style={[styles.hintText, { color: finalColors.textSecondary }]}>
                ለመመልከት ይንኩ
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
    marginHorizontal: 16,
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
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    lineHeight: 24,
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

export default ReligionCard;
