import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TextSizeContext = createContext();

export const useTextSize = () => {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
};

export const TextSizeProvider = ({ children }) => {
  const [textSize, setTextSize] = useState('medium'); // small, medium, large, extra-large

  // Load text size preference on app start
  useEffect(() => {
    loadTextSizePreference();
  }, []);

  const loadTextSizePreference = async () => {
    try {
      const savedTextSize = await AsyncStorage.getItem('textSize');
      if (savedTextSize) {
        setTextSize(savedTextSize);
      }
    } catch (error) {
      console.error('Error loading text size preference:', error);
    }
  };

  const updateTextSize = async (newTextSize) => {
    try {
      setTextSize(newTextSize);
      await AsyncStorage.setItem('textSize', newTextSize);
    } catch (error) {
      console.error('Error saving text size preference:', error);
    }
  };

  // Get text size multiplier
  const getTextSizeMultiplier = () => {
    switch (textSize) {
      case 'small':
        return 0.85;
      case 'medium':
        return 1.0;
      case 'large':
        return 1.15;
      case 'extra-large':
        return 1.3;
      default:
        return 1.0;
    }
  };

  // Get text size label
  const getTextSizeLabel = () => {
    switch (textSize) {
      case 'small':
        return 'Small';
      case 'medium':
        return 'Medium';
      case 'large':
        return 'Large';
      case 'extra-large':
        return 'Extra Large';
      default:
        return 'Medium';
    }
  };

  const value = {
    textSize,
    updateTextSize,
    getTextSizeMultiplier,
    getTextSizeLabel,
  };

  return (
    <TextSizeContext.Provider value={value}>
      {children}
    </TextSizeContext.Provider>
  );
};
