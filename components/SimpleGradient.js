import React from 'react';
import { View, StyleSheet } from 'react-native';

// Fallback gradient component using View layering
export const SimpleGradient = ({ colors, style, children, start, end }) => {
  // Create a simple gradient effect using opacity layers
  const gradientStyle = {
    backgroundColor: colors[0] || '#667eea',
  };

  return (
    <View style={[gradientStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SimpleGradient;







