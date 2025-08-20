import React from 'react';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SwipeToGoBack = ({ children, onSwipeBack, enabled = true }) => {
  const translateX = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Check if swipe is significant enough to trigger back navigation
      const shouldGoBack = translationX > screenWidth * 0.3 || velocityX > 500;
      
      if (shouldGoBack && enabled) {
        // Animate out
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipeBack();
        });
      } else {
        // Animate back to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  if (!enabled) {
    return children;
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-20, 20]} // Only activate for right-to-left swipes
    >
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX }],
          opacity,
        }}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default SwipeToGoBack;
