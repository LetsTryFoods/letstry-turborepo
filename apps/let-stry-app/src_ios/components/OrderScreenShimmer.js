import React from "react";
import { View, StyleSheet } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

const PLACEHOLDER_COUNT = 3;

const OrderScreenShimmer = () => (
  <View style={{ padding: 16 }}>
    {[...Array(PLACEHOLDER_COUNT)].map((_, idx) => (
      <View key={idx} style={styles.card}>
        {/* Status shimmer */}
        <View style={styles.row}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            visible={false}
            style={styles.statusIcon}
          />
          <View style={{ flex: 1 }}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              visible={false}
              style={styles.statusBar}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              visible={false}
              style={styles.priceBar}
            />
          </View>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            visible={false}
            style={styles.dateBar}
          />
        </View>
        <View style={styles.divider} />
        {/* Image thumbnails */}
        <View style={styles.row}>
          {Array(3)
            .fill(0)
            .map((__, i) => (
              <ShimmerPlaceholder
                key={i}
                LinearGradient={LinearGradient}
                visible={false}
                style={styles.imageThumb}
              />
            ))}
        </View>
        <View style={styles.divider} />
        {/* Action bar */}
        <View style={styles.row}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            visible={false}
            style={styles.actionBtn}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            visible={false}
            style={styles.actionBtn}
          />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  statusIcon: { width: 30, height: 30, marginRight: 10, borderRadius: 15 },
  statusBar: { width: 80, height: 16, borderRadius: 8, marginBottom: 6 },
  priceBar: { width: 40, height: 12, borderRadius: 6 },
  dateBar: { width: 64, height: 12, borderRadius: 6, marginLeft: "auto" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  imageThumb: { width: 46, height: 46, borderRadius: 10, marginRight: 8 },
  actionBtn: { width: 90, height: 24, borderRadius: 12, marginRight: 14 },
});

export default OrderScreenShimmer;
