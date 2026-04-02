import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { Image } from 'expo-image';
import { wp, hp, RFValue, getImageUrl } from '../../../lib/utils/ui-utils';

interface Event {
  id: string;
  name: string;
  imageUrl: string;
}

interface EventsHeroProps {
  backgroundImageUrl?: string;
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

const CARD_WIDTH = (wp('100%') - wp('10%')) / 4;

const EventsHero: React.FC<EventsHeroProps> = ({
  backgroundImageUrl,
  events,
  onEventSelect
}) => {
  // Use a default background if none provided
  const bgImage = backgroundImageUrl
    ? { uri: backgroundImageUrl }
    : require('../../../../assets/images/bg-image.png');

  return (
    <View style={styles.container}>
      <Image
        source={bgImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.grid}>
        {events.slice(0, 8).map((event, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => onEventSelect?.(event)}
          >
            <View style={styles.textContainer}>
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={styles.name}
              >
                {event.name}
              </Text>
            </View>
            <Image
              source={{ uri: getImageUrl(event.imageUrl) }}
              style={styles.image}
              contentFit="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp('65%'), // Increased height to reduce congestion
    marginBottom: hp('2%'),
    justifyContent: 'flex-end',
    paddingBottom: hp('4%'), // More space at the bottom
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4.0%'),
    marginTop: hp('2%'), // More space above the grid
  },
  card: {
    width: CARD_WIDTH - 2.5,
    aspectRatio: 0.78, // Slightly taller to allow larger image
    marginBottom: hp('1.2%'),
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp('0.5%'),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    height: hp('4.5%'), // Increased for larger text
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  name: {
    fontSize: RFValue(10.5), // Increased text size
    color: '#0c5273',
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  image: {
    width: '98%', // Maximize width
    height: '76%', // Maximize height
  },
});

export default EventsHero;
