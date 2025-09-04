import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { getColors } from '../src/theme/colors';

const { width, height } = Dimensions.get('window');

const ErrorModal = ({ 
  visible, 
  title, 
  message,
  onClose
}) => {
  const { isDarkMode } = useDarkMode();
  const colors = getColors(isDarkMode);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      width: width - 40,
      maxHeight: height - 100,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    icon: {
      marginRight: 16,
    },
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: '#d32f2f',
    },
    message: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    button: {
      backgroundColor: '#d32f2f',
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 8,
      alignItems: 'center',
      alignSelf: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons 
              name="warning" 
              size={28} 
              color="#d32f2f" 
              style={styles.icon}
            />
            <AmharicText style={styles.title}>
              {title || 'Sync Error'}
            </AmharicText>
          </View>
          
          <AmharicText style={styles.message}>
            {message || 'Something went wrong while syncing. Please try again.'}
          </AmharicText>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;
