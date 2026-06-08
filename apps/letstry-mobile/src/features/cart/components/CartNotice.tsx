import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { wp, hp, RFValue } from "../../../lib/utils/ui-utils";

interface CartNoticeProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  width?: string | number;
  padding?: number;
  marginVertical?: number;
  borderColor?: string;
  borderWidth?: number;
}

const CartNotice: React.FC<CartNoticeProps> = ({
  text,
  backgroundColor = "#F5F5F5",
  textColor = "#333",
  borderRadius = 8,
  width = "100%",
  padding = 12,
  marginVertical = 10,
  borderColor,
  borderWidth,
}) => {
  if (!text) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius,
          width: width as any,
          padding,
          marginVertical,
          borderColor,
          borderWidth,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: RFValue(12),
    textAlign: "center",
    fontWeight: "600",
  },
});

export default CartNotice;
