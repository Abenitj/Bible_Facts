import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const SyncStatus = ({ 
  isVisible, 
  isSyncing, 
  message, 
  isError = false 
}) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  if (!isVisible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: isError ? '#ffebee' : colors.primary + '20',
      borderBottomWidth: 1,
      borderBottomColor: isError ? '#f44336' : colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 1000,
    },
    icon: {
      marginRight: 8,
    },
    text: {
      flex: 1,
      fontSize: 14,
      color: isError ? '#d32f2f' : colors.primary,
      fontWeight: '500',
    },
    spinner: {
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.container}>
      {isError ? (
        <Ionicons 
          name="warning" 
          size={16} 
          color="#d32f2f" 
          style={styles.icon}
        />
      ) : (
        <Ionicons 
          name="information-circle" 
          size={16} 
          color={colors.primary} 
          style={styles.icon}
        />
      )}
      
      <AmharicText style={styles.text}>
        {message}
      </AmharicText>
      
      {isSyncing && (
        <ActivityIndicator 
          size="small" 
          color={colors.primary} 
          style={styles.spinner}
        />
      )}
    </View>
  );
};

export default SyncStatus;
