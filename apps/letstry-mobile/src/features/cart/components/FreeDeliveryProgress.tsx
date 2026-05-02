import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  useSharedValue,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { RFValue, wp, hp } from '../../../lib/utils/ui-utils';
import Confetti from './Confetti';

interface FreeDeliveryProgressProps {
  subtotal: number;
  threshold: number;
  onThresholdReached?: () => void;
}

const FreeDeliveryProgress: React.FC<FreeDeliveryProgressProps> = ({ 
  subtotal, 
  threshold,
  onThresholdReached 
}) => {
  const [wasFree, setWasFree] = useState(subtotal >= threshold);
  const scale = useSharedValue(1);
  const progressValue = useSharedValue(subtotal / threshold);
  
  const isFree = subtotal >= threshold;
  const progress = Math.min(subtotal / threshold, 1);
  const remaining = Math.max(threshold - subtotal, 0);

  useEffect(() => {
    progressValue.value = withSpring(progress);
    
    if (isFree && !wasFree) {
      // Trigger Celebration Animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scale.value = withSequence(
        withSpring(1.2, { damping: 2, stiffness: 80 }),
        withSpring(1)
      );
      if (onThresholdReached) onThresholdReached();
      setWasFree(true);
    } else if (!isFree && wasFree) {
      setWasFree(false);
    }
  }, [subtotal, threshold, isFree, wasFree, onThresholdReached]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      borderColor: isFree ? '#4CAF50' : '#F0F0F0',
      borderWidth: isFree ? 2 : 1,
    };
  });

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
      backgroundColor: isFree ? '#4CAF50' : '#0C5273',
    };
  });

  if (!threshold) return null;

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isFree ? "checkmark-circle" : "bicycle-outline"} 
            size={22} 
            color={isFree ? "#4CAF50" : "#0C5273"} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.text}>
            {isFree ? (
              <Text style={[styles.bold, { color: '#2E7D32' }]}>Congratulations! FREE delivery unlocked</Text>
            ) : (
              <>
                Add <Text style={styles.bold}>₹{remaining.toFixed(0)}</Text> more for <Text style={styles.bold}>FREE delivery</Text>
              </>
            )}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
      </View>
      
      {isFree && (
        <Text style={styles.successSubtext}>You've saved ₹40 on delivery charges!</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    fontSize: RFValue(13),
    color: '#333',
    fontFamily: 'Inter_500Medium',
  },
  bold: {
    fontWeight: '700',
    color: '#000',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  successSubtext: {
    fontSize: RFValue(10),
    color: '#4CAF50',
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  }
});

export default FreeDeliveryProgress;
