import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

const AnimatedSection = ({ children, index }) => {
  // Start items slightly down and fully transparent
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate to final position (translateY: 0) and full opacity (1)
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 120, // The delay based on index creates the stagger
        useNativeDriver: true, // Use the native driver for smoother performance
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacityAnim, slideAnim]);

  return (
    <Animated.View style={[styles.container, { 
      opacity: opacityAnim, 
      transform: [{ translateY: slideAnim }] 
    }]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // Ensures content isn't transparent
  },
});

export default AnimatedSection;