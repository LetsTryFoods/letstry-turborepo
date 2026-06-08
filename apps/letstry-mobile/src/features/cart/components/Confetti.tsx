import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const NUM_PARTICLES = 30;

interface ConfettiProps {
  onAnimationComplete?: () => void;
}

const Particle = ({
  delay,
  onComplete,
}: {
  delay: number;
  onComplete?: () => void;
}) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(Math.random() * width);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(height + 50, { duration: 2500 }, (finished) => {
        if (finished && onComplete) runOnJS(onComplete)();
      }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(translateX.value + (Math.random() * 100 - 50), {
        duration: 2500,
      }),
    );
    rotation.value = withDelay(
      delay,
      withTiming(Math.random() * 720, { duration: 2500 }),
    );
    opacity.value = withDelay(delay + 2000, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
    backgroundColor: ["#4CAF50", "#0C5273", "#FFC107", "#E91E63", "#2196F3"][
      Math.floor(Math.random() * 5)
    ],
  }));

  return <Animated.View style={[styles.particle, animatedStyle]} />;
};

const Confetti: React.FC<ConfettiProps> = ({ onAnimationComplete }) => {
  const particles = Array.from({ length: NUM_PARTICLES });
  let completedCount = 0;

  const handleParticleComplete = () => {
    completedCount++;
    if (completedCount === NUM_PARTICLES && onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((_, i) => (
        <Particle key={i} delay={i * 50} onComplete={handleParticleComplete} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    width: 10,
    height: 10,
    position: "absolute",
    borderRadius: 2,
  },
});

export default Confetti;
