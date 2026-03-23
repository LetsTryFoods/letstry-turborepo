
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ToastAndroid,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import Clipboard from "@react-native-clipboard/clipboard";
// Import the responsive library
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function PromoTestModal({
  promoCode = "LT50",
  giftImage = require("../assets/images/gift.png"),
  scissorImage = require("../assets/images/scissors.png"),
}) {
  const [visible, setVisible] = useState(true);
  const [fire, setFire] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible) setFire(true);
  }, [visible]);

  const copyCode = () => {
    Clipboard.setString(promoCode);
    setCopied(true);
    if (Platform.OS === "android") {
      ToastAndroid.show("Code copied!", ToastAndroid.SHORT);
    }
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.cardWrap}>
          <Image source={giftImage} style={styles.gift} resizeMode="contain" />

          <TouchableOpacity
            style={styles.crossBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.crossTxt}>✕</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#FFE36A", "#FFA24A"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.card}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.h1}>Get flat 50% OFF</Text>
              <Text style={styles.h2}>Applicable on All Products</Text>

              <View style={styles.couponWrap}>
                <Image
                  source={scissorImage}
                  style={styles.scissorImg}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={copyCode}
                  style={styles.couponBox}
                >
                  <Text style={styles.couponText}>
                    Promo code:{" "}
                    <Text style={styles.couponBold}>{promoCode}</Text>
                  </Text>
                </TouchableOpacity>
                {copied && <Text style={styles.copied}>Copied!</Text>}
              </View>

              <TouchableOpacity style={styles.ctaButton}>
                {/* --- CHANGED THIS TEXT COMPONENT --- */}
                <Text 
                  style={styles.ctaText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  Don't miss out:Order now!!
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {fire && (
          <ConfettiCannon
            count={160}
            origin={{ x: wp("50%"), y: -20 }}
            fadeOut
            autoStart
            onAnimationEnd={() => setFire(false)}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: wp("4%"),
  },
  cardWrap: {
    width: wp("75%"),
    maxWidth: 400,
    alignItems: "center",
    //
  },
  card: {
    width: "100%",
    borderRadius: wp("9%"),
    elevation: 14,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    paddingTop: wp("18%"),
    height: hp("50%"),
  },
  // --- CHANGED THIS STYLE ---
  contentContainer: {
    paddingHorizontal: wp("6%"), // Changed from 'padding'
    paddingTop: wp("6%"),
    paddingBottom: hp("4%"), // Increased bottom padding for more space
    alignItems: "center",
    gap: hp("2%"),
  },
  gift: {
    position: "absolute",
    top: -wp("1%"),
    width: wp("63%"),
    height: wp("40.5%"),
    zIndex: 20,
  },
  crossBtn: {
    position: "absolute",
    top: hp("7%"),
    right: wp("2.5%"),
    width: wp("9%"),
    height: wp("9%"),
    borderRadius: wp("4.5%"),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    elevation: 5,
    zIndex: 20,
  },
  crossTxt: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#333",
  },
  h1: {
    fontSize: wp("7%"),
    fontWeight: "900",
    color: "#222",
    textAlign: "center",
    marginTop: wp("6%"),
  },
  h2: {
    fontSize: wp("4.5%"),
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginTop: -hp("1%"),
  },
  couponWrap: {
    width: "100%",
    alignItems: "center",
  },
  scissorImg: {
    position: "absolute",
    left: wp("3%"),
    top: "50%",
    marginTop: -hp("2%"),
    width: wp("8%"),
    height: wp("8%"),
    transform: [{ rotate: "-20deg" }],
    zIndex: 10,
    pointerEvents: "none",
  },
  couponBox: {
    width: "100%",
    paddingVertical: hp("1.8%"),
    paddingLeft: wp("14%"),
    borderRadius: wp("3.5%"),
    backgroundColor: "#FFF7E6",
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "dashed",
  },
  couponText: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  couponBold: { fontWeight: "900" },
  copied: {
    marginTop: hp("0.8%"),
    fontSize: wp("3.5%"),
    fontWeight: "700",
    color: "#0c5273",
  },
  ctaButton: {
    //backgroundColor: "#000",
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("8%"),
    borderRadius: wp("12.5%"),
    marginTop: hp("1%"),
    marginBottom: hp("8%"), // Added bottom margin for better spacing
  },
  ctaText: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    color: "#000000",
    
    
  },
});