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
    const response = await fetch("https://api.letstryfoods.com/api/user/login-firebase", {
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
    console.error("Verification or backend login failed:", error);
    setError("Invalid OTP or login failed");
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









// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Image,
//   ImageBackground,
// } from "react-native";
// import { getAuth, signInWithPhoneNumber } from "@react-native-firebase/auth";
// import { scale, verticalScale, moderateScale } from "react-native-size-matters";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import OtpInput from "../components/OtpInput";
// import LoginBg from "../assets/images/background.png";
// import LogoImg from "../assets/images/logo.png";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Helper function for creating a delay
// const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// const Verification = ({ route, navigation }) => {
//   const { confirmation, phoneNumber } = route.params;
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);
//   const [error, setError] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isManualVerification, setIsManualVerification] = useState(false);
//   const otpInputRef = useRef();

//   // --- Timer, Auto-Focus, and Auto-Verification Hooks (No changes) ---
//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((t) => t - 1), 1000);
//       return () => clearInterval(interval);
//     } else {
//       setCanResend(true);
//     }
//   }, [timer]);

//   useEffect(() => {
//     const focusTimeout = setTimeout(() => {
//       otpInputRef.current?.focus();
//     }, 300);
//     return () => clearTimeout(focusTimeout);
//   }, []);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user && !isManualVerification) {
//         console.log("--- Auto-verification detected, user signed in ---");
//         navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       }
//     });
//     const timeoutId = setTimeout(() => { unsubscribe(); }, 10000);
//     return () => { unsubscribe(); clearTimeout(timeoutId); };
//   }, [navigation, isManualVerification]);

//   // --- Main Verification Logic with RETRY MECHANISM ---
//   const handleVerify = async () => {
//     if (otp.length !== 6) {
//       setError("Please enter a complete 6-digit OTP.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setStatusMessage("Verifying your OTP...");
//     setIsManualVerification(true);
//     console.log("\n--- [START] OTP Verification Process ---");

//     try {
//       // Step 1: Confirm the OTP
//       console.log("Step 1: Confirming OTP with Firebase...");
//       const credential = await confirmation.confirm(otp);
//       console.log("✅ Step 1 SUCCESS: OTP confirmed.");
//       setStatusMessage("Generating your session...");

//       const user = credential.user;
//       if (!user) throw new Error("Firebase credential did not contain user object.");

//       // Step 2: Generate the ID Token with RETRY LOGIC
//       console.log("Step 2: Generating Firebase ID Token (will retry up to 3 times)...");
//       let idToken = null;
//       const MAX_RETRIES = 5;

//       for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//         try {
//           console.log(`   Attempt ${attempt} of ${MAX_RETRIES}...`);
//           // Pass `true` to force a token refresh, which is good practice for retries
//           idToken = await user.getIdToken(true);
//           if (idToken) {
//             console.log("✅ Token generated successfully on this attempt.");
//             break; // Exit the loop on success
//           }
//         } catch (e) {
//           console.warn(`   Attempt ${attempt} failed:`, e.message);
//           if (attempt === MAX_RETRIES) {
//             // If this was the last attempt, throw the error to be caught below
//             throw new Error("Failed to generate session token after multiple retries.");
//           }
//           // Wait for a second before the next attempt
//           console.log("   Waiting 1 second before retrying...");
//           await delay(1000);
//         }
//       }

//       // Step 3: FINAL CHECK - Ensure idToken is valid after retries
//       if (!idToken) {
//         throw new Error("Could not generate a valid session token.");
//       }
//       console.log("✅ Step 2 SUCCESS: ID Token is valid.");
//       console.log("Final Firebase ID Token:", idToken);
//       setStatusMessage("Logging you in...");

//       // Step 4: Send to backend
//       console.log("Step 3: Sending guaranteed ID Token to backend...");
//       const response = await fetch("https://api.letstryfoods.com/api/user/login-firebase", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken }),
//       });

//       if (!response.ok) {
//         const errorBody = await response.text();
//         throw new Error(`Backend login failed with status ${response.status}: ${errorBody}`);
//       }
//       console.log("✅ Step 3 SUCCESS: Backend responded positively.");

//       const data = await response.json();
//       console.log("API Response Payload:", data);
      
//       // Step 5: Save session and navigate
//       console.log("Step 4: Saving session and navigating...");
//       await AsyncStorage.setItem("AUTH_TOKEN", data.token);
//       await AsyncStorage.setItem("USER_UID", data.uid);
//       await AsyncStorage.setItem("USER_PHONE", data.phone);

//       navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       console.log("--- [END] Verification Process Successful ---");

//     } catch (error) {
//       console.error("--- [ERROR] Verification or login failed ---", error);
//       setError(error.message.includes("auth/invalid-verification-code") ? "Invalid OTP. Please try again." : "An error occurred. Please try again.");
//       setIsManualVerification(false);
//     } finally {
//       setLoading(false);
//       setStatusMessage("");
//     }
//   };
  
//   // (handleResendOtp function and JSX remain the same)
//   // ...
//   const handleResendOtp = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const auth = getAuth();
//       const newConfirmation = await signInWithPhoneNumber(auth, phoneNumber);
//       route.params.confirmation = newConfirmation;
//       setTimer(30);
//       setCanResend(false);
//       setOtp("");
//       setIsManualVerification(false);
//       setTimeout(() => { otpInputRef.current?.focus(); }, 100);
//     } catch (error) {
//       setError("Could not resend code. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isDisabled = loading || otp.length !== 6;

//   return (
//     <ImageBackground source={LoginBg} style={styles.backgroundImage} resizeMode="cover">
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
//       <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer} enableOnAndroid keyboardShouldPersistTaps="handled">
//         <View style={styles.contentContainer}>
//           <Image source={LogoImg} style={styles.logoImage} resizeMode="contain" />
//           <Text style={styles.otpMsg}>We've sent an OTP to your phone number</Text>
//           <OtpInput ref={otpInputRef} value={otp} onChange={setOtp} onComplete={handleVerify} error={!!error} />

//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//           {loading && statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

//           <View style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text onPress={isDisabled ? null : handleVerify} style={styles.proceedButtonText}>
//                 Proceed
//               </Text>
//             )}
//           </View>
//           <Text style={styles.resendText}>
//             {canResend ? (
//               <Text onPress={handleResendOtp} style={styles.resendLink}>Resend OTP</Text>
//             ) : (
//               `Resend OTP in ${timer}s`
//             )}
//           </Text>
//         </View>
//       </KeyboardAwareScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: { flex: 1, width: "100%", height: "100%" },
//   scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: scale(24) },
//   contentContainer: { alignItems: "center" },
//   logoImage: { width: scale(150), height: verticalScale(150), marginBottom: verticalScale(15) },
//   otpMsg: { fontSize: moderateScale(14), color: "#222", textAlign: "center", marginBottom: verticalScale(20), fontWeight: "500" },
//   proceedButton: { width: "90%", height: verticalScale(48), backgroundColor: "#0C5273", borderRadius: scale(8), justifyContent: "center", alignItems: "center", marginTop: verticalScale(10) },
//   proceedButtonDisabled: { backgroundColor: "#BFC2C8" },
//   proceedButtonText: { color: "#fff", fontSize: moderateScale(15), fontWeight: "bold" },
//   resendText: { fontSize: moderateScale(13), color: "#222", textAlign: "center", marginTop: verticalScale(20) },
//   resendLink: { fontWeight: "bold", color: "#145DA0" },
//   errorText: { color: "red", fontSize: moderateScale(12), marginTop: verticalScale(10), textAlign: "center" },
//   statusText: { color: "#0C5273", fontSize: moderateScale(12), marginTop: verticalScale(10), textAlign: "center", fontWeight: '500' },
// });

// export default Verification;


















// // src/screens/Verification.js
// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Image,
//   ImageBackground,
//   Platform,
// } from "react-native";
// import auth from "@react-native-firebase/auth";
// import { scale, verticalScale, moderateScale } from "react-native-size-matters";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import OtpInput from "../components/OtpInput";
// import LoginBg from "../assets/images/background.png";
// import LogoImg from "../assets/images/logo.png";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // -------- Helpers --------
// const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// // If you ever need local testing, you can switch here based on Platform/Device.
// // For production you’re already using the public API domain:
// const API_BASE = "https://api.letstryfoods.com";
// const LOGIN_URL = `${API_BASE}/api/user/login-firebase`;

// const Verification = ({ route, navigation }) => {
//   const { confirmation, phoneNumber } = route.params;
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);
//   const [error, setError] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isManualVerification, setIsManualVerification] = useState(false);
//   const otpInputRef = useRef();

//   // --- Countdown timer ---
//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((t) => t - 1), 1000);
//       return () => clearInterval(interval);
//     } else {
//       setCanResend(true);
//     }
//   }, [timer]);

//   // --- Auto focus OTP input ---
//   useEffect(() => {
//     const focusTimeout = setTimeout(() => {
//       otpInputRef.current?.focus();
//     }, 300);
//     return () => clearTimeout(focusTimeout);
//   }, []);

//   // --- Auto verification path (if Firebase auto-links the user) ---
//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged((user) => {
//       if (user && !isManualVerification) {
//         console.log("--- Auto-verification detected; navigating to MainApp ---");
//         navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       }
//     });
//     // Safety timeout to avoid dangling listeners on long screens
//     const timeoutId = setTimeout(() => {
//       try { unsubscribe(); } catch {}
//     }, 10000);

//     return () => {
//       try { unsubscribe(); } catch {}
//       clearTimeout(timeoutId);
//     };
//   }, [navigation, isManualVerification]);

//   const handleVerify = async () => {
//     if (otp.length !== 6) {
//       setError("Please enter a complete 6-digit OTP.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setStatusMessage("Verifying your OTP...");
//     setIsManualVerification(true);
//     console.log("\n--- [START] OTP Verification Process ---");

//     try {
//       // Step 1: Confirm OTP with Firebase
//       console.log("Step 1: Confirming OTP with Firebase...");
//       const credential = await confirmation.confirm(otp);
//       console.log("✅ Step 1 SUCCESS: OTP confirmed.");
//       setStatusMessage("Generating your session...");

//       const user = credential?.user;
//       if (!user) {
//         throw new Error("Firebase credential did not contain a user object.");
//       }

//       // Step 2: Generate Firebase ID token with retries
//       console.log("Step 2: Generating Firebase ID Token (with retry)...");
//       let idToken = null;
//       const MAX_RETRIES = 5;
//       for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//         try {
//           console.log(`   Attempt ${attempt} of ${MAX_RETRIES}...`);
//           idToken = await user.getIdToken(true); // force refresh
//           if (idToken) {
//             console.log(
//               `✅ Token generated. preview=${idToken.slice(0, 12)}... len=${idToken.length}`
//             );
//             break;
//           }
//         } catch (e) {
//           console.warn(`   Attempt ${attempt} failed:`, e?.message || String(e));
//           if (attempt === MAX_RETRIES) {
//             throw new Error("Failed to generate session token after multiple retries.");
//           }
//           await delay(1000);
//         }
//       }

//       if (!idToken) {
//         throw new Error("Could not generate a valid session token.");
//       }
//       console.log("✅ Step 2 SUCCESS: ID Token ready.");
//       setStatusMessage("Logging you in...");

//       // Step 3: Backend login (Authorization: Bearer <token>)
//       console.log(`Step 3: Calling backend: ${LOGIN_URL}`);
//       const res = await fetch(LOGIN_URL, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${idToken}`,
//           "Content-Type": "application/json",
//           "Accept": "application/json",
//         },
//         // Keep body minimal; your backend reads token from header
//         body: JSON.stringify({}),
//       });

//       const raw = await res.text();
//       let data;
//       try { data = JSON.parse(raw); } catch { data = { raw }; }

//       if (!res.ok) {
//         console.error("❌ Backend login failed", res.status, data);
//         throw new Error(`Backend login failed with status ${res.status}: ${raw}`);
//       }

//       console.log("✅ Step 3 SUCCESS: Backend responded 200.");
//       console.log("API Response Payload (keys):", Object.keys(data));

//       // Step 4: Persist session
//       console.log("Step 4: Persisting session and navigating...");
//       if (data?.token) await AsyncStorage.setItem("AUTH_TOKEN", String(data.token));
//       if (data?.uid) await AsyncStorage.setItem("USER_UID", String(data.uid));
//       if (data?.phone) await AsyncStorage.setItem("USER_PHONE", String(data.phone));

//       navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       console.log("--- [END] Verification Process Successful ---");
//     } catch (e) {
//       console.error("--- [ERROR] Verification or login failed ---", e);
//       const msg = e?.message || "Unknown error";
//       // Provide precise messages for common cases; fallback is generic
//       if (msg.includes("auth/invalid-verification-code")) {
//         setError("Invalid OTP. Please try again.");
//       } else if (msg.startsWith("Backend login failed")) {
//         setError("Login failed on server. Please try again.");
//       } else {
//         setError("An error occurred. Please try again.");
//       }
//       setIsManualVerification(false);
//     } finally {
//       setLoading(false);
//       setStatusMessage("");
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
//       // Update the confirmation object for this screen
//       route.params.confirmation = newConfirmation;

//       setTimer(30);
//       setCanResend(false);
//       setOtp("");
//       setIsManualVerification(false);

//       setTimeout(() => {
//         otpInputRef.current?.focus();
//       }, 100);
//     } catch (e) {
//       console.error("Resend OTP error:", e);
//       setError("Could not resend code. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isDisabled = loading || otp.length !== 6;

//   return (
//     <ImageBackground source={LoginBg} style={styles.backgroundImage} resizeMode="cover">
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
//       <KeyboardAwareScrollView
//         contentContainerStyle={styles.scrollContainer}
//         enableOnAndroid
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.contentContainer}>
//           <Image source={LogoImg} style={styles.logoImage} resizeMode="contain" />
//           <Text style={styles.otpMsg}>We've sent an OTP to your phone number</Text>

//           <OtpInput
//             ref={otpInputRef}
//             value={otp}
//             onChange={setOtp}
//             onComplete={handleVerify}
//             error={!!error}
//           />

//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//           {loading && statusMessage ? (
//             <Text style={styles.statusText}>{statusMessage}</Text>
//           ) : null}

//           <View style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text
//                 onPress={isDisabled ? null : handleVerify}
//                 style={styles.proceedButtonText}
//               >
//                 Proceed
//               </Text>
//             )}
//           </View>

//           <Text style={styles.resendText}>
//             {canResend ? (
//               <Text onPress={handleResendOtp} style={styles.resendLink}>
//                 Resend OTP
//               </Text>
//             ) : (
//               <Text>{`Resend OTP in ${timer}s`}</Text>
//             )}
//           </Text>
//         </View>
//       </KeyboardAwareScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: { flex: 1, width: "100%", height: "100%" },
//   scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: scale(24) },
//   contentContainer: { alignItems: "center" },
//   logoImage: { width: scale(150), height: verticalScale(150), marginBottom: verticalScale(15) },
//   otpMsg: {
//     fontSize: moderateScale(14),
//     color: "#222",
//     textAlign: "center",
//     marginBottom: verticalScale(20),
//     fontWeight: "500",
//   },
//   proceedButton: {
//     width: "90%",
//     height: verticalScale(48),
//     backgroundColor: "#0C5273",
//     borderRadius: scale(8),
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: verticalScale(10),
//   },
//   proceedButtonDisabled: { backgroundColor: "#BFC2C8" },
//   proceedButtonText: { color: "#fff", fontSize: moderateScale(15), fontWeight: "bold" },
//   resendText: {
//     fontSize: moderateScale(13),
//     color: "#222",
//     textAlign: "center",
//     marginTop: verticalScale(20),
//   },
//   resendLink: { fontWeight: "bold", color: "#145DA0" },
//   errorText: {
//     color: "red",
//     fontSize: moderateScale(12),
//     marginTop: verticalScale(10),
//     textAlign: "center",
//   },
//   statusText: {
//     color: "#0C5273",
//     fontSize: moderateScale(12),
//     marginTop: verticalScale(10),
//     textAlign: "center",
//     fontWeight: "500",
//   },
// });

// export default Verification;









// // src/screens/Verification.js
// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Image,
//   ImageBackground,
//   Platform,
// } from "react-native";
// import auth from "@react-native-firebase/auth";
// import { scale, verticalScale, moderateScale } from "react-native-size-matters";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import OtpInput from "../components/OtpInput";
// import LoginBg from "../assets/images/background.png";
// import LogoImg from "../assets/images/logo.png";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // -------- Helpers --------
// const delay = (ms) => new Promise((res) => setTimeout(res, ms));
// const API_BASE = "https://api.letstryfoods.com";
// const LOGIN_URL = `${API_BASE}/api/user/login-firebase`;

// const Verification = ({ route, navigation }) => {
//   const { confirmation, phoneNumber } = route.params;
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);
//   const [error, setError] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isManualVerification, setIsManualVerification] = useState(false);
//   const otpInputRef = useRef();

//   // --- Countdown timer ---
//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((t) => t - 1), 1000);
//       return () => clearInterval(interval);
//     } else {
//       setCanResend(true);
//     }
//   }, [timer]);

//   // --- Auto focus OTP input ---
//   useEffect(() => {
//     const focusTimeout = setTimeout(() => {
//       otpInputRef.current?.focus();
//     }, 300);
//     return () => clearTimeout(focusTimeout);
//   }, []);

//   // --- Auto verification path (if Firebase auto-links the user) ---
//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged((user) => {
//       if (user && !isManualVerification) {
//         console.log("--- Auto-verification detected; navigating to MainApp ---");
//         navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       }
//     });
//     const timeoutId = setTimeout(() => {
//       try { unsubscribe(); } catch {}
//     }, 10000);

//     return () => {
//       try { unsubscribe(); } catch {}
//       clearTimeout(timeoutId);
//     };
//   }, [navigation, isManualVerification]);

//   const handleVerify = async () => {
//     if (otp.length !== 6) {
//       setError("Please enter a complete 6-digit OTP.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setStatusMessage("Verifying your OTP...");
//     setIsManualVerification(true);
//     console.log("\n--- [START] OTP Verification Process ---");

//     try {
//       // Step 1: Confirm OTP with Firebase
//       console.log("Step 1: Confirming OTP with Firebase...");
//       const credential = await confirmation.confirm(otp);
//       console.log("✅ Step 1 SUCCESS: OTP confirmed.");
//       setStatusMessage("Generating your session...");

//       const user = credential?.user;
//       if (!user) throw new Error("Firebase credential did not contain a user object.");

//       // Step 2: Generate Firebase ID token with retries
//       console.log("Step 2: Generating Firebase ID Token (with retry)...");
//       let idToken = null;
//       const MAX_RETRIES = 5;
//       for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//         try {
//           console.log(`   Attempt ${attempt} of ${MAX_RETRIES}...`);
//           idToken = await user.getIdToken(true); // force refresh
//           if (idToken) {
//             console.log(`✅ Token generated. preview=${idToken.slice(0, 12)}... len=${idToken.length}`);
//             break;
//           }
//         } catch (e) {
//           console.warn(`   Attempt ${attempt} failed:`, e?.message || String(e));
//           if (attempt === MAX_RETRIES) throw new Error("Failed to generate session token after multiple retries.");
//           await delay(1000);
//         }
//       }
//       if (!idToken) throw new Error("Could not generate a valid session token.");
//       console.log("✅ Step 2 SUCCESS: ID Token ready.");
//       setStatusMessage("Logging you in...");

//       // Step 3: Backend login (Authorization: Bearer <token>) + body fallback
//       console.log(`Step 3: Calling backend: ${LOGIN_URL}`);
//       const res = await fetch(LOGIN_URL, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${idToken}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({ idToken }), // send also in body for resilience
//       });

//       const raw = await res.text();
//       let data;
//       try { data = JSON.parse(raw); } catch { data = { raw }; }
//       if (!res.ok) {
//         console.error("❌ Backend login failed", res.status, data);
//         throw new Error(`Backend login failed with status ${res.status}: ${raw}`);
//       }
//       console.log("✅ Step 3 SUCCESS: Backend responded 200.");
//       console.log("API Response Payload (keys):", Object.keys(data));

//       // Step 4: Persist session (safe writes)
//       console.log("Step 4: Persisting session and navigating...");
//       const currentUser = auth().currentUser;

//       const backendUid   = data?.uid ?? null;
//       const backendToken = data?.token ?? null;
//       const userPhone =
//         data?.phone ?? data?.phoneNumber ?? currentUser?.phoneNumber ?? null;

//       const writes = [];
//       if (backendToken != null) writes.push(["AUTH_TOKEN", String(backendToken)]);
//       if (backendUid   != null) writes.push(["USER_UID",   String(backendUid)]);
//       if (userPhone    != null) writes.push(["USER_PHONE", String(userPhone)]);
//       if (writes.length) await AsyncStorage.multiSet(writes);

//       if (backendToken == null) await AsyncStorage.removeItem("AUTH_TOKEN");
//       if (backendUid   == null) await AsyncStorage.removeItem("USER_UID");
//       if (userPhone    == null) await AsyncStorage.removeItem("USER_PHONE");

//       navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       console.log("--- [END] Verification Process Successful ---");
//     } catch (e) {
//       console.error("--- [ERROR] Verification or login failed ---", e);
//       const msg = e?.message || "Unknown error";
//       if (msg.includes("auth/invalid-verification-code")) {
//         setError("Invalid OTP. Please try again.");
//       } else if (msg.startsWith("Backend login failed")) {
//         setError("Login failed on server. Please try again.");
//       } else {
//         setError("An error occurred. Please try again.");
//       }
//       setIsManualVerification(false);
//     } finally {
//       setLoading(false);
//       setStatusMessage("");
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
//       route.params.confirmation = newConfirmation;

//       setTimer(30);
//       setCanResend(false);
//       setOtp("");
//       setIsManualVerification(false);

//       setTimeout(() => otpInputRef.current?.focus(), 100);
//     } catch (e) {
//       console.error("Resend OTP error:", e);
//       setError("Could not resend code. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isDisabled = loading || otp.length !== 6;

//   return (
//     <ImageBackground source={LoginBg} style={styles.backgroundImage} resizeMode="cover">
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
//       <KeyboardAwareScrollView
//         contentContainerStyle={styles.scrollContainer}
//         enableOnAndroid
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.contentContainer}>
//           <Image source={LogoImg} style={styles.logoImage} resizeMode="contain" />
//           <Text style={styles.otpMsg}>We've sent an OTP to your phone number</Text>

//           <OtpInput
//             ref={otpInputRef}
//             value={otp}
//             onChange={setOtp}
//             onComplete={handleVerify}
//             error={!!error}
//           />

//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//           {loading && statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

//           <View style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text onPress={isDisabled ? null : handleVerify} style={styles.proceedButtonText}>
//                 Proceed
//               </Text>
//             )}
//           </View>

//           <Text style={styles.resendText}>
//             {canResend ? (
//               <Text onPress={handleResendOtp} style={styles.resendLink}>Resend OTP</Text>
//             ) : (
//               <Text>{`Resend OTP in ${timer}s`}</Text>
//             )}
//           </Text>
//         </View>
//       </KeyboardAwareScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: { flex: 1, width: "100%", height: "100%" },
//   scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: scale(24) },
//   contentContainer: { alignItems: "center" },
//   logoImage: { width: scale(150), height: verticalScale(150), marginBottom: verticalScale(15) },
//   otpMsg: {
//     fontSize: moderateScale(14),
//     color: "#222",
//     textAlign: "center",
//     marginBottom: verticalScale(20),
//     fontWeight: "500",
//   },
//   proceedButton: {
//     width: "90%",
//     height: verticalScale(48),
//     backgroundColor: "#0C5273",
//     borderRadius: scale(8),
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: verticalScale(10),
//   },
//   proceedButtonDisabled: { backgroundColor: "#BFC2C8" },
//   proceedButtonText: { color: "#fff", fontSize: moderateScale(15), fontWeight: "bold" },
//   resendText: {
//     fontSize: moderateScale(13),
//     color: "#222",
//     textAlign: "center",
//     marginTop: verticalScale(20),
//   },
//   resendLink: { fontWeight: "bold", color: "#145DA0" },
//   errorText: {
//     color: "red",
//     fontSize: moderateScale(12),
//     marginTop: verticalScale(10),
//     textAlign: "center",
//   },
//   statusText: {
//     color: "#0C5273",
//     fontSize: moderateScale(12),
//     marginTop: verticalScale(10),
//     textAlign: "center",
//     fontWeight: "500",
//   },
// });

// export default Verification;













// src/screens/Verification.js

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Image,
//   ImageBackground,
// } from "react-native";
// import auth from "@react-native-firebase/auth";
// import { scale, verticalScale, moderateScale } from "react-native-size-matters";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import OtpInput from "../components/OtpInput";
// import LoginBg from "../assets/images/background.png";
// import LogoImg from "../assets/images/logo.png";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const delay = (ms) => new Promise((res) => setTimeout(res, ms));
// const API_BASE = "http://192.168.1.14:8000";
// const LOGIN_URL = `${API_BASE}/api/user/login-firebase`;

// const Verification = ({ route, navigation }) => {
//   const { confirmation, phoneNumber } = route.params; // phoneNumber only for resend, never stored
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);
//   const [error, setError] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isManualVerification, setIsManualVerification] = useState(false);
//   const otpInputRef = useRef();

//   useEffect(() => {
//     if (timer > 0) {
//       const i = setInterval(() => setTimer((t) => t - 1), 1000);
//       return () => clearInterval(i);
//     } else {
//       setCanResend(true);
//     }
//   }, [timer]);

//   useEffect(() => {
//     const t = setTimeout(() => otpInputRef.current?.focus(), 300);
//     return () => clearTimeout(t);
//   }, []);

//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged((user) => {
//       if (user && !isManualVerification) {
//         navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       }
//     });
//     const timeoutId = setTimeout(() => { try { unsubscribe(); } catch {} }, 10000);
//     return () => { try { unsubscribe(); } catch {}; clearTimeout(timeoutId); };
//   }, [navigation, isManualVerification]);

//   const handleVerify = async () => {
//     if (otp.length !== 6) {
//       setError("Please enter a complete 6-digit OTP.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setStatusMessage("Verifying your OTP...");
//     setIsManualVerification(true);

//     try {
//       // 0) Make absolutely sure USER_PHONE isn't lingering anywhere
//       await AsyncStorage.removeItem("USER_PHONE");

//       // 1) Confirm OTP
//       const credential = await confirmation.confirm(otp);
//       const user = credential?.user;
//       if (!user) throw new Error("Firebase credential missing user");

//       // 2) Get ID token (retry)
//       let idToken = null;
//       const MAX_RETRIES = 5;
//       for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//         try {
//           idToken = await user.getIdToken(true);
//           if (idToken) break;
//         } catch (e) {
//           if (attempt === MAX_RETRIES) throw e;
//           await delay(1000);
//         }
//       }
//       if (!idToken) throw new Error("Could not generate a valid session token.");

//       setStatusMessage("Logging you in...");

//       // 3) Backend login (header + body)
//       const res = await fetch(LOGIN_URL, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${idToken}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({ idToken }),
//       });

//       const raw = await res.text();
//       let data;
//       try { data = JSON.parse(raw); } catch { data = { raw }; }
//       if (!res.ok) throw new Error(`Backend login failed with status ${res.status}: ${raw}`);

//       // 4) Persist ONLY token + uid (no phone)
//       const token = data?.token ?? null;
//       const uid   = data?.uid ?? null;

//       if (token != null) await AsyncStorage.setItem("AUTH_TOKEN", String(token));
//       else await AsyncStorage.removeItem("AUTH_TOKEN");

//       if (uid != null) await AsyncStorage.setItem("USER_UID", String(uid));
//       else await AsyncStorage.removeItem("USER_UID");

//       // hard delete USER_PHONE just in case other code previously set it
//       await AsyncStorage.removeItem("USER_PHONE");

//       navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//     } catch (e) {
//       console.error("--- [ERROR] Verification or login failed ---", e);
//       const msg = e?.message || "Unknown error";
//       if (msg.includes("auth/invalid-verification-code")) {
//         setError("Invalid OTP. Please try again.");
//       } else if (msg.startsWith("Backend login failed")) {
//         setError("Login failed on server. Please try again.");
//       } else {
//         setError("An error occurred. Please try again.");
//       }
//       setIsManualVerification(false);
//     } finally {
//       setLoading(false);
//       setStatusMessage("");
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
//       route.params.confirmation = newConfirmation;
//       setTimer(30);
//       setCanResend(false);
//       setOtp("");
//       setIsManualVerification(false);
//       setTimeout(() => otpInputRef.current?.focus(), 100);
//     } catch (e) {
//       console.error("Resend OTP error:", e);
//       setError("Could not resend code. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isDisabled = loading || otp.length !== 6;

//   return (
//     <ImageBackground source={LoginBg} style={styles.backgroundImage} resizeMode="cover">
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
//       <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer} enableOnAndroid keyboardShouldPersistTaps="handled">
//         <View style={styles.contentContainer}>
//           <Image source={LogoImg} style={styles.logoImage} resizeMode="contain" />
//           <Text style={styles.otpMsg}>We've sent an OTP to your phone number</Text>

//           <OtpInput
//             ref={otpInputRef}
//             value={otp}
//             onChange={setOtp}
//             onComplete={handleVerify}
//             error={!!error}
//           />

//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//           {loading && statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

//           <View style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text onPress={isDisabled ? null : handleVerify} style={styles.proceedButtonText}>
//                 Proceed
//               </Text>
//             )}
//           </View>

//           <Text style={styles.resendText}>
//             {canResend ? (
//               <Text onPress={handleResendOtp} style={styles.resendLink}>Resend OTP</Text>
//             ) : (
//               <Text>{`Resend OTP in ${timer}s`}</Text>
//             )}
//           </Text>
//         </View>
//       </KeyboardAwareScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: { flex: 1, width: "100%", height: "100%" },
//   scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: scale(24) },
//   contentContainer: { alignItems: "center" },
//   logoImage: { width: scale(150), height: verticalScale(150), marginBottom: verticalScale(15) },
//   otpMsg: { fontSize: moderateScale(14), color: "#222", textAlign: "center", marginBottom: verticalScale(20), fontWeight: "500" },
//   proceedButton: { width: "90%", height: verticalScale(48), backgroundColor: "#0C5273", borderRadius: scale(8), justifyContent: "center", alignItems: "center", marginTop: verticalScale(10) },
//   proceedButtonDisabled: { backgroundColor: "#BFC2C8" },
//   proceedButtonText: { color: "#fff", fontSize: moderateScale(15), fontWeight: "bold" },
//   resendText: { fontSize: moderateScale(13), color: "#222", textAlign: "center", marginTop: verticalScale(20) },
//   resendLink: { fontWeight: "bold", color: "#145DA0" },
//   errorText: { color: "red", fontSize: moderateScale(12), marginTop: verticalScale(10), textAlign: "center" },
//   statusText: { color: "#0C5273", fontSize: moderateScale(12), marginTop: verticalScale(10), textAlign: "center", fontWeight: "500" },
// });

// export default Verification;












































// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Image,
//   ImageBackground,
// } from "react-native";
// import auth from "@react-native-firebase/auth";
// import { scale, verticalScale, moderateScale } from "react-native-size-matters";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import OtpInput from "../components/OtpInput";
// import LoginBg from "../assets/images/background.png";
// import LogoImg from "../assets/images/logo.png";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const delay = (ms) => new Promise((res) => setTimeout(res, ms));
//  const API_BASE = "http://192.168.1.22:8000";
// const LOGIN_URL = `${API_BASE}/api/user/login-firebase`;

// const Verification = ({ route, navigation }) => {
//   const { confirmation, phoneNumber } = route.params; // phoneNumber only for resend, never stored
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);
//   const [error, setError] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const [isManualVerification, setIsManualVerification] = useState(false);
//   const otpInputRef = useRef();

//   useEffect(() => {
//     if (timer > 0) {
//       const i = setInterval(() => setTimer((t) => t - 1), 1000);
//       return () => clearInterval(i);
//     } else {
//       setCanResend(true);
//     }
//   }, [timer]);

//   useEffect(() => {
//     const t = setTimeout(() => otpInputRef.current?.focus(), 300);
//     return () => clearTimeout(t);
//   }, []);

//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged((user) => {
//       if (user && !isManualVerification) {
//         navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//       }
//     });
//     const timeoutId = setTimeout(() => { try { unsubscribe(); } catch {} }, 10000);
//     return () => { try { unsubscribe(); } catch {}; clearTimeout(timeoutId); };
//   }, [navigation, isManualVerification]);

//   const handleVerify = async () => {
//     if (otp.length !== 6) {
//       setError("Please enter a complete 6-digit OTP.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setStatusMessage("Verifying your OTP...");
//     setIsManualVerification(true);

//     try {
//       // 0) Make absolutely sure USER_PHONE isn't lingering anywhere
//       await AsyncStorage.removeItem("USER_PHONE");

//       // 1) Confirm OTP
//       const credential = await confirmation.confirm(otp);
//       const user = credential?.user;
//       if (!user) throw new Error("Firebase credential missing user");

//       // 2) Get ID token (retry)
//       let idToken = null;
//       const MAX_RETRIES = 5;
//       for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
//         try {
//           idToken = await user.getIdToken(true);
//           if (idToken) break;
//         } catch (e) {
//           if (attempt === MAX_RETRIES) throw e;
//           await delay(1000);
//         }
//       }
//       if (!idToken) throw new Error("Could not generate a valid session token.");

//       setStatusMessage("Logging you in...");

//       // 3) Backend login (header + body)
//       const res = await fetch(LOGIN_URL, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${idToken}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({ idToken }),
//       });

//       const raw = await res.text();
//       let data;
//       try { data = JSON.parse(raw); } catch { data = { raw }; }
//       if (!res.ok) throw new Error(`Backend login failed with status ${res.status}: ${raw}`);

//       // 4) Persist ONLY token + uid (no phone)
//       const token = data?.token ?? null;
//       const uid   = data?.uid ?? null;

//       if (token != null) await AsyncStorage.setItem("AUTH_TOKEN", String(token));
//       else await AsyncStorage.removeItem("AUTH_TOKEN");

//       if (uid != null) await AsyncStorage.setItem("USER_UID", String(uid));
//       else await AsyncStorage.removeItem("USER_UID");

//       // hard delete USER_PHONE just in case other code previously set it
//       await AsyncStorage.removeItem("USER_PHONE");

//       navigation.reset({ index: 0, routes: [{ name: "MainApp" }] });
//     } catch (e) {
//       console.error("--- [ERROR] Verification or login failed ---", e);
//       const msg = e?.message || "Unknown error";
//       if (msg.includes("auth/invalid-verification-code")) {
//         setError("Invalid OTP. Please try again.");
//       } else if (msg.startsWith("Backend login failed")) {
//         setError("Login failed on server. Please try again.");
//       } else {
//         setError("An error occurred. Please try again.");
//       }
//       setIsManualVerification(false);
//     } finally {
//       setLoading(false);
//       setStatusMessage("");
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
//       route.params.confirmation = newConfirmation;
//       setTimer(30);
//       setCanResend(false);
//       setOtp("");
//       setIsManualVerification(false);
//       setTimeout(() => otpInputRef.current?.focus(), 100);
//     } catch (e) {
//       console.error("Resend OTP error:", e);
//       setError("Could not resend code. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isDisabled = loading || otp.length !== 6;

//   return (
//     <ImageBackground source={LoginBg} style={styles.backgroundImage} resizeMode="cover">
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
//       <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer} enableOnAndroid keyboardShouldPersistTaps="handled">
//         <View style={styles.contentContainer}>
//           <Image source={LogoImg} style={styles.logoImage} resizeMode="contain" />
//           <Text style={styles.otpMsg}>We've sent an OTP to your phone number</Text>

//           <OtpInput
//             ref={otpInputRef}
//             value={otp}
//             onChange={setOtp}
//             onComplete={handleVerify}
//             error={!!error}
//           />

//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//           {loading && statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

//           <View style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}>
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text onPress={isDisabled ? null : handleVerify} style={styles.proceedButtonText}>
//                 Proceed
//               </Text>
//             )}
//           </View>

//           <Text style={styles.resendText}>
//             {canResend ? (
//               <Text onPress={handleResendOtp} style={styles.resendLink}>Resend OTP</Text>
//             ) : (
//               <Text>{`Resend OTP in ${timer}s`}</Text>
//             )}
//           </Text>
//         </View>
//       </KeyboardAwareScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: { flex: 1, width: "100%", height: "100%" },
//   scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: scale(24) },
//   contentContainer: { alignItems: "center" },
//   logoImage: { width: scale(150), height: verticalScale(150), marginBottom: verticalScale(15) },
//   otpMsg: { fontSize: moderateScale(14), color: "#222", textAlign: "center", marginBottom: verticalScale(20), fontWeight: "500" },
//   proceedButton: { width: "90%", height: verticalScale(48), backgroundColor: "#0C5273", borderRadius: scale(8), justifyContent: "center", alignItems: "center", marginTop: verticalScale(10) },
//   proceedButtonDisabled: { backgroundColor: "#BFC2C8" },
//   proceedButtonText: { color: "#fff", fontSize: moderateScale(15), fontWeight: "bold" },
//   resendText: { fontSize: moderateScale(13), color: "#222", textAlign: "center", marginTop: verticalScale(20) },
//   resendLink: { fontWeight: "bold", color: "#145DA0" },
//   errorText: { color: "red", fontSize: moderateScale(12), marginTop: verticalScale(10), textAlign: "center" },
//   statusText: { color: "#0C5273", fontSize: moderateScale(12), marginTop: verticalScale(10), textAlign: "center", fontWeight: "500" },
// });

// export default Verification;