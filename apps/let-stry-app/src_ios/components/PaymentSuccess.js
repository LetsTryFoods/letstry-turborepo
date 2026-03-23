
// // import React, { useEffect } from "react";
// // import { View, Text, StyleSheet, StatusBar } from "react-native";
// // import { useRoute, useNavigation } from "@react-navigation/native";
// // import { RFValue } from "react-native-responsive-fontsize";
// // import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
// // import LottieView from "lottie-react-native";

// // const PaymentSuccessScreen = () => {
// //   const navigation = useNavigation();
// //   const route = useRoute();
// //   const { orderId, address } = route.params || {};

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       // This is the updated part, using replace()
// //       navigation.replace('MyOrdersScreen');
// //     }, 2500);

// //     return () => clearTimeout(timer);
// //   }, [navigation]);

// //   const addressText = address
// //     ? [address.buildingName, address.street].filter(Boolean).join(', ')
// //     : "Address details not found.";

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
// //       <LottieView
// //         source={require("../assets/animations/tick.json")}
// //         autoPlay
// //         loop={false}
// //         style={styles.animation}
// //       />
// //       <Text style={styles.title} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={2}>
// //         Order Confirmed
// //       </Text>

// //       {address && (
// //         <>
// //           <Text style={styles.subtitle} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={2}>
// //             Delivering to{' '}
// //             {address.label ? (
// //               <Text style={styles.bold} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
// //                 {address.label}
// //               </Text>
// //             ) : null}
// //           </Text>
// //           <Text style={styles.address} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={3}>
// //             {addressText}
// //           </Text>
// //         </>
// //       )}

// //       <Text style={styles.transaction} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={2}>
// //         Transaction id: <Text style={styles.transactionId} allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1}>
// //           {orderId || "N/A"}
// //         </Text>
// //       </Text>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", paddingHorizontal: wp(5) },
// //   animation: { width: wp(65), height: wp(65), marginBottom: hp(1) },
// //   title: { fontSize: RFValue(23), fontWeight: "bold", color: "#000000", textAlign: "center", marginBottom: hp(1.5) },
// //   subtitle: { fontSize: RFValue(18), color: "#222", textAlign: "center" },
// //   bold: { fontWeight: "bold", color: "#222" },
// //   address: { fontSize: RFValue(16), color: "#444", textAlign: "center", marginTop: hp(1), marginBottom: hp(3) },
// //   transaction: { fontSize: RFValue(14), color: "#999", textAlign: "center", marginTop: hp(1.5) },
// //   transactionId: { color: "#999" },
// // });

// // export default PaymentSuccessScreen;







// //payment with auto redirect


// import React, { useEffect } from "react";
// import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { RFValue } from "react-native-responsive-fontsize";
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
// import { useAddress } from "../context/AddressContext";
// import LottieView from "lottie-react-native";

// const PaymentSuccessScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { selectedAddress, loading: addressLoading } = useAddress();
//   const { orderId } = route.params || {};

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.reset({
//         index: 0,
//         routes: [
//           { name: 'MainApp' },
//           { 
//             name: 'MyOrdersScreen',
//             params: { initialTab: "inTransit" } 
//           }
//         ]
//       });
//     }, 2500);

//     return () => clearTimeout(timer);
//   }, [navigation]);

//   if (addressLoading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#333" />
//         <Text 
//           style={{ marginTop: 15, fontSize: RFValue(16), color: "#555" }}
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           numberOfLines={1}
//         >
//           Confirming details...
//         </Text>
//       </View>
//     );
//   }

//   const addressText = selectedAddress
//     ? [selectedAddress.buildingName, selectedAddress.street].filter(Boolean).join(', ')
//     : "Address details not found.";

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <LottieView
//         source={require("../assets/animations/tick.json")}
//         autoPlay
//         loop={false}
//         style={styles.animation}
//       />
//       <Text 
//         style={styles.title} 
//         allowFontScaling={false}
//         adjustsFontSizeToFit
//         numberOfLines={2}
//       >
//         Order Confirmed
//       </Text>

//       {selectedAddress && (
//         <>
//           <Text 
//             style={styles.subtitle} 
//             allowFontScaling={false}
//             adjustsFontSizeToFit
//             numberOfLines={2}
//           >
//             Delivering to{' '}
//             {selectedAddress.label ? (
//               <Text 
//                 style={styles.bold} 
//                 allowFontScaling={false}
//                 adjustsFontSizeToFit
//                 numberOfLines={1}
//               >
//                 {selectedAddress.label}
//               </Text>
//             ) : null}
//           </Text>
//           <Text 
//             style={styles.address} 
//             allowFontScaling={false}
//             adjustsFontSizeToFit
//             numberOfLines={3}
//           >
//             {addressText}
//           </Text>
//         </>
//       )}

//       <Text 
//         style={styles.transaction} 
//         allowFontScaling={false}
//         adjustsFontSizeToFit
//         numberOfLines={2}
//       >
//         Transaction id: <Text 
//           style={styles.transactionId} 
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           numberOfLines={1}
//         >
//           {orderId || "N/A"}
//         </Text>
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: wp(5),
//   },
//   animation: {
//     width: wp(65),
//     height: wp(65),
//     marginBottom: hp(1),
//   },
//   title: {
//     fontSize: RFValue(23),
//     fontWeight: "bold",
//     color: "#000000",
//     textAlign: "center",
//     marginBottom: hp(1.5),
//   },
//   subtitle: {
//     fontSize: RFValue(18),
//     color: "#222",
//     textAlign: "center",
//   },
//   bold: {
//     fontWeight: "bold",
//     color: "#222",
//   },
//   address: {
//     fontSize: RFValue(16),
//     color: "#444",
//     textAlign: "center",
//     marginTop: hp(1),
//     marginBottom: hp(3),
//   },
//   transaction: {
//     fontSize: RFValue(14),
//     color: "#999",
//     textAlign: "center",
//     marginTop: hp(1.5),
//   },
//   transactionId: {
//     color: "#999",
//   },
// });

// export default PaymentSuccessScreen;







import React, { useEffect } from "react";
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useAddress } from "../context/AddressContext";
import LottieView from "lottie-react-native";

// --- ✅ NAYE IMPORTS ---
import analytics from '@react-native-firebase/analytics';
import { useCart } from "../context/CartContext";
// --- END ---

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedAddress, loading: addressLoading } = useAddress();
  
  // --- ✅ NAYA HOOK ---
  const { clearCart } = useCart(); // Cart ko clear karne ke liye

  // --- ✅ Naya Data route.params se nikaalo ---
  const { orderId, purchaseData } = route.params || {};

  useEffect(() => {
    // --- ✅ PURCHASE EVENT YAHAN LOG HOGA ---
    if (purchaseData) {
      try {
        // Event log karo (FIXED: logEvent use kiya)
        analytics().logEvent('purchase', {
          transaction_id: purchaseData.transaction_id,
          value: purchaseData.value,
          currency: purchaseData.currency,
          tax: purchaseData.tax,
          shipping: purchaseData.shipping,
          coupon: purchaseData.coupon,
          items: purchaseData.items
        });
        
        // Event log hone ke baad hi cart clear karo
        clearCart();

      } catch (error) {
        console.error("Analytics Error (logPurchase):", error);
        // Agar analytics fail ho, tab bhi cart clear karke aage badho
        clearCart();
      }
    } else {
      // Fallback agar purchaseData nahi mila (aisa hona nahi chahiye)
      console.warn("Analytics Warning: purchaseData was missing on PaymentSuccessScreen.");
      clearCart();
    }
    // --- END ---

    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'MainApp' },
          { 
            name: 'MyOrdersScreen',
            params: { initialTab: "inTransit" } 
          }
        ]
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, orderId, purchaseData, clearCart]); // dependencies add kiye

  if (addressLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#333" />
        <Text 
          style={{ marginTop: 15, fontSize: RFValue(16), color: "#555" }}
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          Confirming details...
        </Text>
      </View>
    );
  }

  const addressText = selectedAddress
    ? [selectedAddress.buildingName, selectedAddress.street].filter(Boolean).join(', ')
    : "Address details not found.";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <LottieView
        source={require("../assets/animations/tick.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text 
        style={styles.title} 
        allowFontScaling={false}
        adjustsFontSizeToFit
        numberOfLines={2}
      >
        Order Confirmed
      </Text>

      {selectedAddress && (
        <>
          <Text 
            style={styles.subtitle} 
            allowFontScaling={false}
            adjustsFontSizeToFit
            numberOfLines={2}
          >
            Delivering to{' '}
            {selectedAddress.label ? (
              <Text 
                style={styles.bold} 
                allowFontScaling={false}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {selectedAddress.label}
              </Text>
            ) : null}
          </Text>
          <Text 
            style={styles.address} 
            allowFontScaling={false}
            adjustsFontSizeToFit
            numberOfLines={3}
          >
            {addressText}
          </Text>
        </>
      )}

      <Text 
        style={styles.transaction} 
        allowFontScaling={false}
        adjustsFontSizeToFit
        numberOfLines={2}
      >
        Transaction id: <Text 
          style={styles.transactionId} 
          allowFontScaling={false}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {orderId || "N/A"}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(5),
  },
  animation: {
    width: wp(65),
    height: wp(65),
    marginBottom: hp(1),
  },
  title: {
    fontSize: RFValue(23),
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: hp(1.5),
  },
  subtitle: {
    fontSize: RFValue(18),
    color: "#222",
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
    color: "#222",
  },
  address: {
    fontSize: RFValue(16),
    color: "#444",
    textAlign: "center",
    marginTop: hp(1),
    marginBottom: hp(3),
  },
  transaction: {
    fontSize: RFValue(14),
    color: "#999",
    textAlign: "center",
    marginTop: hp(1.5),
  },
  transactionId: {
    color: "#999",
  },
});

export default PaymentSuccessScreen;