import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';

const AppBar = ({ 
  title, 
  showBack = false, 
  onBackPress,
  colors = {}
}) => {
  // Default colors if none provided
  const defaultColors = {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#DBEAFE',
    textInverse: '#FFFFFF'
  };
  
  const finalColors = Object.keys(colors).length > 0 ? colors : defaultColors;
  
  // Ensure text and icons are always white for good contrast
  const textColor = '#FFFFFF';
  const iconColor = '#FFFFFF';
  const indicatorColor = finalColors.primaryLight || '#DBEAFE';
  
  return (
    <View style={[styles.appBar, { 
      backgroundColor: finalColors.primary,
      borderBottomColor: finalColors.primaryDark,
    }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              console.log('AppBar back button pressed');
              if (onBackPress) {
                onBackPress();
              } else {
                console.warn('No onBackPress handler provided');
              }
            }}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.titleSection}>
        <AmharicText variant="subheading" style={[styles.title, { color: textColor }]}>{title}</AmharicText>
        <View style={[styles.titleIndicator, { backgroundColor: indicatorColor }]} />
      </View>
      
      <View style={styles.rightSection}>
        {/* Placeholder for future right-side buttons */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  titleIndicator: {
    width: 20,
    height: 2,
    borderRadius: 1,
    alignSelf: 'center',
  },
  rightSection: {
    minWidth: 40,
  },
});

export default AppBar;
