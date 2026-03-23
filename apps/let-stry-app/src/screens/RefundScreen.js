




import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons"; // Changed from MaterialIcons
import { useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Added for safe area

const SCALE = 0.87;

const RefundScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // Hook to get safe area insets

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Header Updated to match the new style */}
      <LinearGradient
        colors={["#F2D377", "#F5F5F5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={{ paddingTop: insets.top }}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
            </TouchableOpacity>

            <Text
              style={styles.headerTitle}
              allowFontScaling={false}
              adjustsFontSizeToFit
            >
              Refund & Cancellations
            </Text>
            <View style={styles.iconButtonRight} />
          </View>
        </View>
      </LinearGradient>

      {/* Content remains unchanged */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.paragraph}>
          We offer a 3-day policy. Unfortunately, we are unable to provide you
          with a refund or exchange if 3 days have passed since the delivery of
          your item.
        </Text>

        <Text style={styles.paragraph}>
          Since our goods are perishable, we only accept returns and refunds in
          the event of a manufacturing defect.
        </Text>

        <View style={styles.bulletGroup}>
          <Text style={styles.bulletPoint}>
            • Cancellation is allowed till the order is dispatched from the
            warehouse, with a full refund.
          </Text>
          <Text style={styles.bulletPoint}>
            • If you have any concerns regarding the quality of the product, we
            kindly request you to keep the item ready for pickup. We will arrange
            for its collection to ensure a thorough review and to prevent such
            issues from occurring in the future.
          </Text>
          <Text style={styles.bulletPoint}>
            • The refund will be processed back to the source within 7–10
            business days.
          </Text>
          <Text style={styles.bulletPoint}>
            • No cancellation of order post-order dispatch from warehouse.
          </Text>
          <Text style={styles.bulletPoint}>
            • If you have any complaints about the product, please make a video
            and send it to the email address below:{" "}
            <Text style={styles.email}>mail@earthcrust.co.in</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • To initiate cancellation of National Delivery orders, please send a
            cancellation request email with order ID to{" "}
            <Text style={styles.email}>mail@earthcrust.co.in</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default RefundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  // Header styles updated to match the new structure
  header: {
    paddingBottom: hp(1.5),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
  },
  iconButton: {
    padding: wp(1),
  },
  iconButtonRight: {
    // Used for alignment, takes up same space as the left icon
    width: RFValue(22) + wp(2),
  },
  headerTitle: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#222",
  },
  // Content styles remain unchanged
  contentContainer: {
    padding: wp(5),
    paddingBottom: hp(5),
  },
  paragraph: {
    fontSize: RFValue(14 * SCALE),
    color: "#333",
    marginBottom: hp(1.5),
    lineHeight: RFValue(21 * SCALE),
  },
  bulletGroup: {
    marginTop: hp(0.5),
  },
  bulletPoint: {
    fontSize: RFValue(13.5 * SCALE),
    color: "#444",
    marginBottom: hp(1.2),
    lineHeight: RFValue(21 * SCALE),
  },
  email: {
    color: "#0C5273",
    fontWeight: "600",
  },
});