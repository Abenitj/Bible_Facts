export const lightColors = {
  // Primary colors
  primary: '#3B82F6',
  primaryLight: '#DBEAFE',
  primaryDark: '#2563EB',
  
  // Background colors
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Shadow colors
  shadow: '#000000',
  
  // Overlay colors
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.1)',
};

export const darkColors = {
  // Primary colors
  primary: '#60A5FA',
  primaryLight: '#1E3A8A',
  primaryDark: '#3B82F6',
  
  // Background colors
  background: '#111827',
  surface: '#1F2937',
  card: '#374151',
  
  // Text colors
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#111827',
  
  // Border colors
  border: '#374151',
  borderLight: '#4B5563',
  
  // Status colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Shadow colors
  shadow: '#000000',
  
  // Overlay colors
  overlay: 'rgba(0,0,0,0.8)',
  overlayLight: 'rgba(0,0,0,0.3)',
};

export const getColors = (isDarkMode) => {
  try {
    return isDarkMode ? darkColors : lightColors;
  } catch (error) {
    console.warn('Error getting colors, falling back to light mode:', error);
    return lightColors;
  }
};
