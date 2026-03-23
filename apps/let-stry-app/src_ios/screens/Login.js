import React, { useState } from "react";
import {
  ImageBackground,
  Platform,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Linking,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { getAuth, signInWithPhoneNumber } from "@react-native-firebase/auth";
import crashlytics from "@react-native-firebase/crashlytics"; // <-- Import Crashlytics here
import { useLocation } from "../context/LocationContext";
import LoginBg from "../assets/images/background.png";
import LogoImg from "../assets/images/logo.png";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupAnim] = useState(new Animated.Value(-100));
  const { location, address } = useLocation();

  // Mask phone number for privacy (show last 4 digits only)
  const maskedPhoneNumber = phoneNumber
    ? phoneNumber.replace(/.(?=.{4})/g, "*")
    : "";

  const showPopup = (msg) => {
    setPopupMessage(msg);
    setPopupVisible(true);
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(popupAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setPopupVisible(false));
      }, 2200);
    });
  };

  const handleContinue = async () => {
    crashlytics().log("Continue button pressed");
    crashlytics().setAttribute("entered_phone_number", maskedPhoneNumber);
    crashlytics().setAttribute("loading", loading.toString());

    if (phoneNumber.length === 10) {
      setLoading(true);
      try {
        const authInstance = getAuth();
        const confirmation = await signInWithPhoneNumber(
          authInstance,
          `+91${phoneNumber}`
        );

        crashlytics().log("OTP requested successfully");
        crashlytics().setAttribute("otp_request_status", "success");

        setLoading(false);
        navigation.navigate("Verification", {
          confirmation,
          phoneNumber: `+91${phoneNumber}`,
        });
      } catch (error) {
        crashlytics().log("OTP request failed");
        crashlytics().setAttribute("otp_request_status", "failed");
        crashlytics().setAttribute("otp_request_error", error.message || "unknown");
        crashlytics().recordError(error);

        setLoading(false);
        showPopup("Failed to send OTP.");
        console.log("Failed to sign in", error);
      }
    } else {
      crashlytics().log("Invalid phone number submitted");
      crashlytics().setAttribute("otp_request_status", "invalid_phone");
      showPopup("Please enter a valid 10-digit phone number");
    }
  };

  const handleSkipLogin = async () => {
    crashlytics().log("Skip Login pressed");
    crashlytics().setAttribute("loading", loading.toString());
    try {
      await AsyncStorage.setItem("SKIPPED_LOGIN", "true");
      navigation.navigate("MainApp");
    } catch (e) {
      crashlytics().log("Failed to save skip login flag");
      crashlytics().setAttribute("skip_login_error", e.message || "unknown");
      crashlytics().recordError(e);
      console.log("Failed to save skip login flag: ", e);
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ImageBackground
            source={LoginBg}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <TouchableOpacity style={styles.skipButton} onPress={handleSkipLogin}>
              <Text style={styles.skipButtonText} adjustsFontSizeToFit numberOfLines={1}>
                Skip Login
              </Text>
            </TouchableOpacity>

            <KeyboardAwareScrollView
              contentContainerStyle={styles.contentContainer}
              enableOnAndroid
              extraScrollHeight={40}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Image source={LogoImg} style={styles.logoImage} resizeMode="contain" />

              <Text style={styles.loginTitle} adjustsFontSizeToFit numberOfLines={1}>
                Login to Continue
              </Text>

              <Text style={styles.loginSubtitle} adjustsFontSizeToFit numberOfLines={1}>
                Enter your phone number to proceed
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText} adjustsFontSizeToFit numberOfLines={1}>
                    +91
                  </Text>
                </View>
                <TextInput
                  placeholder="Enter mobile number"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={styles.input}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.continueButtonText} adjustsFontSizeToFit numberOfLines={1}>
                    Continue
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.termsText} adjustsFontSizeToFit numberOfLines={3}>
                By continuing, you agree to our{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Linking.openURL("https://letstryfoods.com/policies/terms-of-service")
                  }
                >
                  Terms of Service
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.termsLink}
                  onPress={() =>
                    Linking.openURL("https://letstryfoods.com/pages/privacy-policy")
                  }
                >
                  Privacy Policy
                </Text>.
              </Text>
            </KeyboardAwareScrollView>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  skipButton: {
    position: "absolute",
    top: (StatusBar.currentHeight || 20) + verticalScale(40),
    right: scale(12),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(10),
    backgroundColor: "#0c5273",
    borderRadius: scale(12),
    zIndex: 100,
  },
  skipButtonText: {
    color: "white",
    fontSize: moderateScale(13), 
    fontWeight: "600",
    textAlign: "center",
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(100), // moved up
    paddingBottom: verticalScale(30),
  },
  logoImage: {
    width: scale(150),
    height: verticalScale(150),
    marginBottom: verticalScale(15),
  },
  loginTitle: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: "#000",
    marginBottom: verticalScale(7),
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: moderateScale(14),
    color: "#666",
    marginBottom: verticalScale(24),
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    width: "90%",
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: scale(8),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    marginBottom: verticalScale(18),
  },
  countryCode: {
    width: scale(60),
    paddingHorizontal: scale(8),
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    height: "100%",
  },
  countryCodeText: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: "#000",
  },
  input: {
    flex: 1,
    paddingHorizontal: scale(15),
    fontSize: moderateScale(15),
    color: "#000",
  },
  continueButton: {
    width: "90%",
    height: verticalScale(48),
    backgroundColor: "#0C5273",
    borderRadius: scale(8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(15),
  },
  continueButtonText: {
    color: "white",
    fontSize: moderateScale(15),
    fontWeight: "bold",
  },
  termsText: {
    fontSize: moderateScale(8),
    color: "#666",
    textAlign: "center",
    lineHeight: verticalScale(16),
    marginTop: verticalScale(2),
    marginBottom: verticalScale(10),
  },
  termsLink: {
    color: "#145DA0",
    fontWeight: "bold",
  },
});

export default Login;





