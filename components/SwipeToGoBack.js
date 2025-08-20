import React from 'react';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SwipeToGoBack = ({ children, onSwipeBack, enabled = true }) => {
  const translateX = new Animated.Value(0);
  const opacity = new Animated.Value(1);
  const scale = new Animated.Value(1);
  const progressOpacity = new Animated.Value(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationX } = event.nativeEvent;
        const progress = Math.min(translationX / (screenWidth * 0.25), 1);
        
        // Show progress indicator when swiping
        if (translationX > 0) {
          progressOpacity.setValue(progress);
        } else {
          progressOpacity.setValue(0);
        }
      }
    }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Check if swipe is significant enough to trigger back navigation
      const shouldGoBack = translationX > screenWidth * 0.25 || velocityX > 400;
      
      if (shouldGoBack && enabled) {
        // Animate out with enhanced effects
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipeBack();
        });
      } else {
        // Animate back to original position with spring
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // Real-time animation during gesture
  const animatedStyle = {
    transform: [
      { translateX },
      { scale },
    ],
    opacity,
  };

  // Progress indicator style
  const progressStyle = {
    opacity: progressOpacity,
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
        style={[
          {
            flex: 1,
          },
          animatedStyle,
        ]}
      >
        {children}
        
        {/* Swipe Progress Indicator */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              width: 4,
              height: '100%',
              backgroundColor: '#654321',
              borderRadius: 2,
            },
            progressStyle,
          ]}
        />
      </Animated.View>
    </PanGestureHandler>
  );
};

export default SwipeToGoBack;
