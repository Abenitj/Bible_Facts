import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { useTextSize } from '../contexts/TextSizeContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getScaledFontSize } from '../utils/textSize';
import { getColors } from '../theme/colors';

/**
 * Enhanced AmharicText Component
 * 
 * A comprehensive text component optimized for Amharic language support
 * with multiple variants, dark mode support, and flexible styling options.
 * 
 * @param {string} variant - Text variant: 'display', 'largeTitle', 'title', 'heading', 
 *                           'subheading', 'body', 'caption', 'small', 'button', 'label'
 * @param {string} align - Text alignment: 'left', 'center', 'right', 'justify'
 * @param {number} numberOfLines - Maximum number of lines
 * @param {string} ellipsizeMode - How to truncate text: 'head', 'middle', 'tail', 'clip'
 * @param {boolean} bold - Make text bold
 * @param {boolean} italic - Make text italic
 * @param {string} color - Custom text color (overrides variant default)
 * @param {number} letterSpacing - Letter spacing
 * @param {object} style - Additional custom styles
 * @param {ReactNode} children - Text content
 */
const AmharicText = ({ 
  children, 
  style, 
  variant = 'body',
  align = 'left',
  numberOfLines,
  ellipsizeMode,
  bold = false,
  italic = false,
  color,
  letterSpacing,
  ...props 
}) => {
  const { getTextSizeMultiplier } = useTextSize();
  const { isDarkMode } = useDarkMode();
  const textSizeMultiplier = getTextSizeMultiplier();
  const colors = getColors(isDarkMode);

  const getFontStyle = () => {
    const baseStyle = (() => {
      switch (variant) {
        case 'display':
          return styles.display;
        case 'largeTitle':
          return styles.largeTitle;
        case 'title':
          return styles.title;
        case 'heading':
          return styles.heading;
        case 'subheading':
          return styles.subheading;
        case 'body':
          return styles.body;
        case 'caption':
          return styles.caption;
        case 'small':
          return styles.small;
        case 'button':
          return styles.button;
        case 'label':
          return styles.label;
        default:
          return styles.body;
      }
    })();

    // Apply text size scaling
    const scaledStyle = {
      ...baseStyle,
      fontSize: getScaledFontSize(baseStyle.fontSize, textSizeMultiplier),
      lineHeight: getScaledFontSize(baseStyle.lineHeight, textSizeMultiplier),
    };

    // Apply text alignment
    if (align) {
      scaledStyle.textAlign = align;
    }

    // Apply custom color or use theme color
    if (color) {
      scaledStyle.color = color;
    } else if (!scaledStyle.color) {
      // Use theme color if not specified
      scaledStyle.color = isDarkMode ? colors.textPrimary : colors.textPrimary;
    }

    // Apply letter spacing
    if (letterSpacing !== undefined) {
      scaledStyle.letterSpacing = letterSpacing;
    }

    // Apply bold/italic
    if (bold) {
      scaledStyle.fontWeight = 'bold';
    }
    if (italic) {
      scaledStyle.fontStyle = 'italic';
    }

    return scaledStyle;
  };

  return (
    <Text 
      style={[getFontStyle(), style]} 
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  display: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  largeTitle: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heading: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  subheading: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  body: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  small: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  button: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});

export default AmharicText;
