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

const { width } = Dimensions.get('window');

const TopicCard = ({ topic, onPress, index = 0, colors = {} }) => {
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
          backgroundColor: finalColors.card,
          borderBottomColor: finalColors.border,
          borderLeftColor: finalColors.primary,
        }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: finalColors.textPrimary }]}>{topic.title}</Text>
          <Text style={[styles.description, { color: finalColors.textSecondary }]}>{topic.description}</Text>
        </View>
        
        <View style={[styles.arrowContainer, { backgroundColor: finalColors.primaryLight }]}>
          <Ionicons name="chevron-forward" size={20} color={finalColors.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  card: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TopicCard;
