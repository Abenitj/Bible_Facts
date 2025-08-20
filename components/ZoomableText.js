import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import AmharicText from '../src/components/AmharicText';

const { width: screenWidth } = Dimensions.get('window');

const ZoomableText = ({ text, style, minFontSize = 14, maxFontSize = 24, initialFontSize = 16 }) => {
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [scale, setScale] = useState(1);
  const lastScale = useRef(1);

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: new Animated.Value(1) } }],
    { useNativeDriver: false }
  );

  const onPinchHandlerStateChange = event => {
    if (event.nativeEvent.state === State.END) {
      const newScale = lastScale.current * event.nativeEvent.scale;
      
      // Limit scale between 0.5 and 2.0
      const limitedScale = Math.max(0.5, Math.min(2.0, newScale));
      
      // Calculate new font size based on scale
      const newFontSize = Math.max(minFontSize, Math.min(maxFontSize, initialFontSize * limitedScale));
      
      setScale(limitedScale);
      setFontSize(newFontSize);
      lastScale.current = limitedScale;
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
    >
      <View style={styles.container}>
        <AmharicText 
          style={[
            styles.text,
            style,
            { fontSize: fontSize },
          ]}
        >
          {text}
        </AmharicText>
        
        {/* Zoom indicator */}
        {scale !== 1 && (
          <View style={styles.zoomIndicator}>
            <AmharicText style={styles.zoomText}>
              {Math.round(scale * 100)}%
            </AmharicText>
          </View>
        )}
      </View>
    </PinchGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  text: {
    color: '#A0522D',
    lineHeight: 24,
    textAlign: 'justify',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ZoomableText;
