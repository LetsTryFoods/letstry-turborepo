import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { wp } from "../../../lib/utils/ui-utils";

interface TopBannerProps {
  visible?: boolean;
  imageUrl?: string;
  aspectRatio?: number;
  onPress?: () => void;
  onClose?: () => void;
}

const TopBanner: React.FC<TopBannerProps> = ({
  visible,
  imageUrl,
  aspectRatio = 10 / 1, // Default thin banner
  onPress,
  onClose,
}) => {
  React.useEffect(() => {
    console.log(
      "[TopBanner] Mounted with imageUrl:",
      imageUrl,
      "visible:",
      visible,
    );
    return () => console.log("[TopBanner] Unmounted");
  }, [imageUrl, visible]);

  if (visible === false || !imageUrl) return null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.container, { aspectRatio }]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
      </TouchableOpacity>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close-circle" size={20} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "relative",
  },
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 0,
    right: wp("1%"),
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
  },
});

export default TopBanner;
