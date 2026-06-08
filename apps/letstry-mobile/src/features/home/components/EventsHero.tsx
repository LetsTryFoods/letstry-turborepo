import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { wp, hp, RFValue, getImageUrl } from "../../../lib/utils/ui-utils";
import SearchBar from "../../../components/common/SearchBar";

interface Event {
  id: string;
  name: string;
  imageUrl: string;
}

interface EventsHeroProps {
  backgroundImageUrl?: string;
  events: Event[];
  onEventSelect?: (event: Event) => void;
  sduiConfig?: any;
  safeAreaTop?: number;
  marginTop?: number;
  marginBottom?: number;
}

const CARD_WIDTH = (wp("100%") - wp("10%")) / 4;

const EventsHero: React.FC<EventsHeroProps> = ({
  backgroundImageUrl,
  events,
  onEventSelect,
  sduiConfig,
  safeAreaTop,
  marginTop,
  marginBottom,
}) => {
  // Use a default background if none provided
  const bgImage = backgroundImageUrl
    ? { uri: backgroundImageUrl }
    : require("../../../../assets/images/bg-image.png");

  const topMargin =
    marginTop !== undefined
      ? marginTop
      : (sduiConfig?.homeEventsHeroTopMargin ?? 0);
  const botMargin = marginBottom !== undefined ? marginBottom : 0;

  const safeTop = safeAreaTop ?? 0;

  // Estimate global Y of the container assuming it's the first item
  const containerGlobalY = safeTop + hp(topMargin);

  // Default search bar top (relative to container) is hp('1%')
  let searchBarTop = hp("1%");

  // Ensure the search bar NEVER goes under the status bar
  const minGlobalY = safeTop + hp("1%");
  if (containerGlobalY + searchBarTop < minGlobalY) {
    searchBarTop = minGlobalY - containerGlobalY;
  }

  return (
    <View
      style={[
        styles.container,
        { marginTop: hp(topMargin), marginBottom: hp(botMargin) },
      ]}
    >
      <Image
        source={bgImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      {/* Search Bar overlaid on the background */}
      <View style={[styles.searchOverlay, { top: searchBarTop }]}>
        <SearchBar placeholder="Search for snacks, sweets..." />
      </View>

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
    height: hp("65%"),
    justifyContent: "flex-end",
    paddingBottom: hp("4%"),
  },
  searchOverlay: {
    position: "absolute",
    top: hp("1%"),
    left: wp("5%"),
    right: wp("5%"),
    zIndex: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: wp("4.0%"),
    marginTop: hp("2%"), // More space above the grid
  },
  card: {
    width: CARD_WIDTH - 2.5,
    aspectRatio: 0.78, // Slightly taller to allow larger image
    marginBottom: hp("1.2%"),
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: hp("0.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    height: hp("4.5%"), // Increased for larger text
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  name: {
    fontSize: RFValue(10.5), // Increased text size
    color: "#0c5273",
    fontWeight: "800",
    textAlign: "center",
    textTransform: "capitalize",
  },
  image: {
    width: "98%", // Maximize width
    height: "76%", // Maximize height
  },
});

export default EventsHero;
