import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTextSize } from '../contexts/TextSizeContext';
import { getScaledFontSize } from '../utils/textSize';

const AmharicText = ({ children, style, variant = 'body', ...props }) => {
  const { getTextSizeMultiplier } = useTextSize();
  const textSizeMultiplier = getTextSizeMultiplier();

  const getFontStyle = () => {
    const baseStyle = (() => {
      switch (variant) {
        case 'heading':
          return styles.heading;
        case 'subheading':
          return styles.subheading;
        case 'body':
          return styles.body;
        case 'caption':
          return styles.caption;
        case 'button':
          return styles.button;
        default:
          return styles.body;
      }
    })();

    // Apply text size scaling
    return {
      ...baseStyle,
      fontSize: getScaledFontSize(baseStyle.fontSize, textSizeMultiplier),
      lineHeight: getScaledFontSize(baseStyle.lineHeight, textSizeMultiplier),
    };
  };

  return (
    <Text style={[getFontStyle(), style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontFamily: 'System', // Fallback for Amharic
    fontSize: 24,
    lineHeight: 32,
    color: '#2C2C2C',
    fontWeight: 'bold',
  },
  subheading: {
    fontFamily: 'System',
    fontSize: 18,
    lineHeight: 24,
    color: '#2C2C2C',
    fontWeight: '600',
  },
  body: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
    color: '#2C2C2C',
  },
  caption: {
    fontFamily: 'System',
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  button: {
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AmharicText;
