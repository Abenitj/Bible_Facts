import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';
import AmharicText from '../src/components/AmharicText';
import { Ionicons } from '@expo/vector-icons';

const AppBar = ({ 
  title, 
  onBackPress, 
  showBack = false, 
  colors = null,
  rightComponent 
}) => {
  const { isDarkMode } = useDarkMode();
  const themeColors = colors || getColors(isDarkMode);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.cardBackground || themeColors.background,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      shadowColor: themeColors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
      minHeight: 60,
    },
    leftSection: {
      width: 56, // Fixed width for balance
      alignItems: 'flex-start',
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.textPrimary,
      textAlign: 'center',
    },
    titleIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: themeColors.primary,
      alignSelf: 'center',
      marginTop: 4,
    },
    rightSection: {
      width: 56, // Fixed width to balance left section
      alignItems: 'flex-end',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {/* Left section kept for balance */}
        </View>
        
        <View style={styles.titleContainer}>
          <AmharicText variant="subheading" style={styles.title}>{title}</AmharicText>
          <View style={styles.titleIndicator} />
        </View>
        
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

export default AppBar;
