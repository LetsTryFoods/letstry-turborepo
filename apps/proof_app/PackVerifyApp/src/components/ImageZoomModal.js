import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const AnimatedView = Reanimated.createAnimatedComponent(View);

const ImageZoomModal = ({ visible, imageUrl, onClose, title }) => {
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = startScale.value * event.scale;
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 10, mass: 1 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scale.value,
      [0.5, 1, 2],
      [0.5, 1, 1],
      'clamp'
    );

    return {
      transform: [{ scale: scale.value }],
      opacity,
    };
  });

  const handleClose = () => {
    scale.value = 1;
    startScale.value = 1;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
      animationType="fade"
    >
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          {title && <View style={{ flex: 1 }} />}
        </View>

        <GestureDetector gesture={pinchGesture}>
          <AnimatedView style={[styles.imageContainer, animatedStyle]}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </AnimatedView>
        </GestureDetector>

        <View style={styles.footer}>
          <View style={styles.zoomHint}>
            <Ionicons name="hand-left" size={16} color={COLORS.white} />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  zoomHint: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
});

export default ImageZoomModal;
