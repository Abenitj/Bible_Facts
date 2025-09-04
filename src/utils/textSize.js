import { useTextSize } from '../contexts/TextSizeContext';

// Utility function to get scaled font size
export const getScaledFontSize = (baseFontSize, textSizeMultiplier) => {
  return Math.round(baseFontSize * textSizeMultiplier);
};

// Hook to get text size styles
export const useTextSizeStyles = () => {
  const { getTextSizeMultiplier } = useTextSize();
  const multiplier = getTextSizeMultiplier();

  return {
    // Common text sizes
    small: {
      fontSize: getScaledFontSize(12, multiplier),
    },
    body: {
      fontSize: getScaledFontSize(14, multiplier),
    },
    subheading: {
      fontSize: getScaledFontSize(16, multiplier),
    },
    heading: {
      fontSize: getScaledFontSize(18, multiplier),
    },
    title: {
      fontSize: getScaledFontSize(20, multiplier),
    },
    largeTitle: {
      fontSize: getScaledFontSize(24, multiplier),
    },
    // Line height adjustments
    lineHeight: (fontSize) => ({
      lineHeight: getScaledFontSize(fontSize * 1.4, multiplier),
    }),
  };
};

// Utility to create responsive text styles
export const createTextSizeStyle = (baseStyle, textSizeMultiplier) => {
  if (!baseStyle.fontSize) return baseStyle;
  
  return {
    ...baseStyle,
    fontSize: getScaledFontSize(baseStyle.fontSize, textSizeMultiplier),
    lineHeight: baseStyle.lineHeight ? getScaledFontSize(baseStyle.lineHeight, textSizeMultiplier) : undefined,
  };
};
