import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Image,
  Dimensions,
  ImageBackground,
  Alert,
} from "react-native";
import { getAuth, signInWithPhoneNumber } from "@react-native-firebase/auth";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocation } from "../context/LocationContext";
import OtpInput from "../components/OtpInput";
import { TrackingService } from "../services/AnalyticsService";
// Assets
import LoginBg from "../assets/images/background.png";
import LogoImg from "../assets/images/logo.png";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Verification = ({ route, navigation }) => {
  const { confirmation, phoneNumber } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [isManualVerification, setIsManualVerification] = useState(false);
  const otpInputRef = useRef();

  const { isInDeliveryArea, loading: locationLoading, location, address } = useLocation();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(focusTimeout);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !isManualVerification) {
        console.log("Auto-verification detected, user signed in");

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "MainApp" }],
          });
        }, 300);
      }
    });

    const timeoutId = setTimeout(() => {
      unsubscribe();
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigation, isManualVerification]);

const handleVerify = async () => {
  if (otp.length !== 6) {
    setError("Please enter complete OTP");
    return;
  }

  try {
    setLoading(true);
    setError("");
    setIsManualVerification(true);

    const credential = await confirmation.confirm(otp);
    const currentUser = getAuth().currentUser;
    const idToken = await currentUser.getIdToken();
    console.log(idToken)
    // ✅ Send Firebase ID token to backend
    const response = await fetch("https://apiv2.letstryfoods.com/api/user/login-firebase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error("Backend login failed");
    }

    const data = await response.json();
    console.log(data)
    const jwt = data.token;

    // ✅ Save JWT securely in AsyncStorage
    await AsyncStorage.setItem("AUTH_TOKEN", jwt);
    await AsyncStorage.setItem("USER_UID", data.uid);
    await AsyncStorage.setItem("USER_PHONE", data.phone);

    // ✅ Navigate to main screen
    navigation.reset({
      index: 0,
      routes: [{ name: "MainApp" }],
    });
  } catch (error) {
    console.error("", error);
    setError("");
    setIsManualVerification(false);
  } finally {
    setLoading(false);
  }
};

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const newConfirmation = await signInWithPhoneNumber(auth, phoneNumber);
      route.params.confirmation = newConfirmation;
      setTimer(30);
      setCanResend(false);
      setOtp("");
      setError("");
      setIsManualVerification(false);

      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } catch (error) {
      setError("Could not resend verification code. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || otp.length !== 6;

  return (
    <ImageBackground source={LoginBg} style={styles.backgroundImage} resizeMode="cover">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={40}
      >
        <View style={styles.contentContainer}>
          <Image source={LogoImg} style={styles.logoImage} resizeMode="contain" />

          <Text style={styles.otpMsg}>
            We've sent an OTP to your phone number
          </Text>

          <OtpInput
            ref={otpInputRef}
            value={otp}
            onChange={setOtp}
            onComplete={handleVerify}
            error={error}
          />

          <View style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                onPress={handleVerify}
                disabled={isDisabled}
                style={styles.proceedButtonText}
              >
                Proceed
              </Text>
            )}
          </View>

          <Text style={styles.resendText}>
            {canResend ? (
              <Text onPress={handleResendOtp} style={styles.resendLink}>
                Resend OTP
              </Text>
            ) : (
              `Resend OTP in ${timer}s`
            )}
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(80), // moved up
    paddingBottom: verticalScale(40),
  },
  contentContainer: {
    alignItems: "center",
  },
  logoImage: {
    width: scale(150),
    height: verticalScale(150),
    marginBottom: verticalScale(15),
  },
  otpMsg: {
    fontSize: moderateScale(14),
    color: "#222",
    textAlign: "center",
    marginBottom: verticalScale(20),
    fontWeight: "500",
  },
  proceedButton: {
    width: "90%",
    height: verticalScale(48),
    backgroundColor: "#0C5273",
    borderRadius: scale(8),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },
  proceedButtonDisabled: {
    backgroundColor: "#BFC2C8",
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "bold",
  },
  resendText: {
    fontSize: moderateScale(13),
    color: "#222",
    textAlign: "center",
  },
  resendLink: {
    fontWeight: "bold",
    color: "#145DA0",
  },
});

export default Verification;























