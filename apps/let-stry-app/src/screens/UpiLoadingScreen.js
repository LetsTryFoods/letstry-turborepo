










import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  AppState,
  Alert,
  BackHandler,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { checkUpiStatus } from "../services/PaymentService";
import { useAuth } from "../context/AuthContext";
import { useInTransit } from "../context/InTransitContext";

// -------------------- CONSTANTS --------------------
const CIRCLE_SIZE = wp(40);
const STROKE_WIDTH = wp(3);
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const POLLING_INTERVAL_MS = 3000;

export default function UpiLoadingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { idToken } = useAuth();
  
  // --- ✅ `purchaseData` KO YAHAN RECEIVE KIYA ---
  const { orderId, timeout, purchaseData } = route.params || {};
  // --- END ---
  
  const { refreshInTransitStatus } = useInTransit();

  const TOTAL_TIME = timeout ? parseInt(timeout, 10) * 60 : 300;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const startTimestampRef = useRef(Date.now());
  const pollingIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isNavigatingRef = useRef(false);

  const handleBackPress = () => {
    Alert.alert(
      "Are you sure?",
      "Going back might cancel your transaction. Do you want to proceed?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => navigation.goBack() },
      ],
      { cancelable: false }
    );
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [navigation]) // navigation ko dependency mein add kiya
  );

  const computeTimeLeft = () => {
    const elapsedSeconds = Math.floor((Date.now() - startTimestampRef.current) / 1000);
    return Math.max(TOTAL_TIME - elapsedSeconds, 0);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(computeTimeLeft());
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setTimeLeft(computeTimeLeft());
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !isNavigatingRef.current) {
      isNavigatingRef.current = true; 
      // --- ✅ `purchaseData` KO FAILURE PAR BHI PASS KAR RAHE HAIN ---
      navigation.replace("PaymentFailedScreen", {
        message: "Transaction timed out.",
        orderId: orderId,
        purchaseData: purchaseData 
      });
    }
  }, [timeLeft, navigation, orderId, purchaseData]); // dependencies add kiye

  useEffect(() => {
    const pollStatus = async () => {
      if (!orderId || isNavigatingRef.current) return; 

      try {
        const result = await checkUpiStatus(orderId, idToken);
        if (isNavigatingRef.current) return; 

        if (result?.txnStatus === "0") {
          isNavigatingRef.current = true; 
          await refreshInTransitStatus();
          // --- ✅ `purchaseData` KO SUCCESS PAR AAGE PASS KIYA ---
          navigation.replace("PaymentSuccessScreen", { 
            orderId: orderId,
            purchaseData: purchaseData // Yahan add kiya
          });
          // --- END ---
        } else if (result?.txnStatus === "1") {
          isNavigatingRef.current = true; 
          // --- ✅ `purchaseData` KO FAILURE PAR BHI PASS KAR RAHE HAIN ---
          navigation.replace("PaymentFailedScreen", {
            message: result.responseDescription || 'Payment Failed',
            orderId: orderId,
            purchaseData: purchaseData // Yahan add kiya
          });
          // --- END ---
        }
      } catch (error) {
        console.log("Error checking UPI status", error);
        clearInterval(pollingIntervalRef.current); 
        Alert.alert("Network Error", "We're having trouble checking your payment status. Please check your connection.");
      }
    };

    pollStatus();
    pollingIntervalRef.current = setInterval(pollStatus, POLLING_INTERVAL_MS);
    return () => clearInterval(pollingIntervalRef.current);
  }, [orderId, idToken, navigation, purchaseData, refreshInTransitStatus]); // purchaseData ko dependency mein add kiya

  const progress = (TOTAL_TIME - timeLeft) / TOTAL_TIME;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={RFValue(30)} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} allowFontScaling={false} adjustsFontSizeToFit>
          Payment
        </Text>
        <View style={styles.rightSpacer} />
      </View>

      <Text style={styles.topMessage} allowFontScaling={false} adjustsFontSizeToFit>
        Open your UPI app to approve{"\n"}the payment request.
      </Text>

      {/* Circular timer */}
      <View style={styles.timerContainer}>
        <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
          <Circle
            stroke="#E6E6E6"
            fill="none"
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
          />
          <Circle
            stroke="#FFC107"
            fill="none"
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
          />
        </Svg>
        <View style={styles.timeTextContainer}>
          <Text style={styles.timeText} allowFontScaling={false} adjustsFontSizeToFit>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.unitText} allowFontScaling={false} adjustsFontSizeToFit>
            mins
          </Text>
        </View>
      </View>

      <Text style={styles.mainMessage} allowFontScaling={false} adjustsFontSizeToFit>
        Please approve the payment request before{"\n"}it times out.
      </Text>

      <Text style={styles.bottomMessage} allowFontScaling={false} adjustsFontSizeToFit>
        Do not hit back button until the transaction is complete.
      </Text>
    </SafeAreaView>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
  },
  header: {
    height: hp(6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(16),
  },
  backButton: {
    width: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    flex: 1,
  },
  rightSpacer: {
    width: wp(12),
  },
  topMessage: {
    fontWeight: "600",
    fontSize: RFValue(14),
    color: "#999999",
    textAlign: "center",
    marginBottom: hp(6),
  },
  timerContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  timeTextContainer: {
    position: "absolute",
    alignItems: "center",
  },
  timeText: {
    fontSize: RFValue(25),
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 1.5,
  },
  unitText: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#999999",
  },
  mainMessage: {
    marginTop: hp(6),
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  bottomMessage: {
    marginTop: hp(2),
    fontSize: RFValue(10),
    fontWeight: "600",
    color: "#999999",
    textAlign: "center",
  },
});