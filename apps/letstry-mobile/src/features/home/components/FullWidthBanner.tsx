import React from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { getImageUrl } from "../../../lib/utils/ui-utils";
import { ActionEngine, SDUIAction } from "../../../lib/sdui/ActionEngine";

interface FullWidthBannerProps {
  imageUrl: string;
  height?: number;
  action?: SDUIAction;
}

const FullWidthBanner: React.FC<FullWidthBannerProps> = ({
  imageUrl,
  height = 140,
  action,
}) => {
  const { width } = useWindowDimensions();

  if (!imageUrl) return null;

  return (
    <TouchableOpacity
      activeOpacity={action ? 0.85 : 1}
      onPress={() => action && ActionEngine.execute(action)}
      style={{ width, height, overflow: "hidden" }}
    >
      <Image
        source={{ uri: getImageUrl(imageUrl) }}
        style={{ width, height }}
        contentFit="cover"
      />
    </TouchableOpacity>
  );
};

export default FullWidthBanner;
