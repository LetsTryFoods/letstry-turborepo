import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ViewToken, TouchableOpacity, Modal, SafeAreaView, Text } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { wp, hp, getImageUrl, RFValue } from '../../../lib/utils/ui-utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  images: { url: string; alt: string }[];
  onShare?: () => void;
}

const ProductImageCarousel: React.FC<Props> = ({ images, onShare }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  const insets = useSafeAreaInsets();

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setIsGalleryVisible(true);
  };

  const closeGallery = () => {
    setIsGalleryVisible(false);
  };

  if (!images || images.length === 0) return null;

  const viewerImages = images.map(img => ({
    url: getImageUrl(img.url),
    props: {
        // Use Expo Image for caching if possible, or leave default
    }
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.imageWrapper} 
            activeOpacity={0.9}
            onPress={() => openGallery(index)}
          >
            <Image
              source={{ uri: getImageUrl(item.url) }}
              style={styles.image}
              contentFit="contain"
              transition={300}
            />
          </TouchableOpacity>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                index === activeIndex ? styles.activeDot : null
              ]} 
            />
          ))}
        </View>
      )}

      {/* Floating Share Button */}
      {onShare && (
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={onShare}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social" size={20} color="#0C5273" />
        </TouchableOpacity>
      )}

      {/* Full-Screen Gallery Modal with Zoom */}
      <Modal
        visible={isGalleryVisible}
        transparent={true} // Transparent to allow status bar to be drawn over
        statusBarTranslucent={true} // Fill the above area fully
        animationType="fade"
        onRequestClose={closeGallery}
      >
        <ImageViewer
          imageUrls={viewerImages}
          index={galleryIndex}
          onSwipeDown={closeGallery}
          enableSwipeDown={true}
          backgroundColor="#FFFFFF" // Keep the background white
          renderIndicator={() => <View />} // Disable default indicator since we build a custom one
          renderHeader={(currentIndex) => (
            <SafeAreaView style={styles.modalHeader}>
              <Text style={styles.modalCounter}>
                {(currentIndex ?? 0) + 1} / {images.length}
              </Text>
            </SafeAreaView>
          )}
        />
        
        {/* Absolute Bottom Close Button */}
        <View style={styles.closeButtonWrapper}>
          <TouchableOpacity onPress={closeGallery} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp('40%'), 
    backgroundColor: '#FFFFFF',
    paddingBottom: 25,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '95%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0C5273',
    marginHorizontal: 4,
    opacity: 0.3,
  },
  activeDot: {
    opacity: 1,
    width: 14, 
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    position: 'absolute',
    top: 50, // Added top margin to account for translucent status bar
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modalCounter: {
    color: '#000', 
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  closeButtonWrapper: {
    position: 'absolute',
    bottom: 50, // Position at the bottom
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100, // Ensure it's above the image viewer
    elevation: 10,
  },
  closeButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Slightly darker for visibility
    borderRadius: 25,
  },
  shareButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderColor: '#EEEEEE',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
});

export default ProductImageCarousel;
