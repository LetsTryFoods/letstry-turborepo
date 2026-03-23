// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";

// const SCALE = 0.87;

// /**
//  * Props
//  * ──────────────────────────────────────────────────────────
//  * visible      – boolean, show/hide banner
//  * onViewPress  – callback for “VIEW”
//  * style        – optional StyleSheet / inline style override
//  */
// const InTransitBanner = ({ visible, onViewPress, style }) => {
  
//   if (!visible) return null;

//   return (
//     <View style={[styles.container, style]}>
//       <View style={styles.left}>
//         <MaterialCommunityIcons
//           name="truck-fast-outline"
//           size={RFValue(22 * SCALE)}
//           color="#000"
//         />
//         <Text
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           style={styles.label}
//         >
//           Order is on the way
//         </Text>
//       </View>

//       <TouchableOpacity style={styles.viewBtn} onPress={onViewPress}>
//         <Text
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           style={styles.viewText}
//         >
//           VIEW
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginHorizontal: wp(4),
//     paddingVertical: hp(1.5 * SCALE),
//     paddingHorizontal: wp(3 * SCALE),
//     backgroundColor: "#F7F7F7", // very light grey
//     borderWidth: 0.5,
//     borderColor: "#E0E0E0",
//     borderTopLeftRadius:15,
//     borderTopRightRadius:15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 4, 
//   },
//   left: { flexDirection: "row", alignItems: "center" },
//   label: {
//     marginLeft: wp(2.5 * SCALE),
//     fontWeight: "700",
//     fontSize: RFValue(14 * SCALE),
//     color: "#000",
//     maxWidth: wp(55),
//   },
//   viewBtn: {
//     paddingVertical: hp(0.5 * SCALE),
//     paddingHorizontal: wp(4 * SCALE),
//     borderWidth: 1.5,
//     borderColor: "#0C5273",
//     borderRadius: wp(2 * SCALE),
//     backgroundColor: "rgba(0,0,0,0.05)",
//   },
//   viewText: {
//     fontSize: RFValue(12 * SCALE),
//     fontWeight: "700",
//     color: "#0C5273",
//     textAlign: 'center',
//   },
// });


// export default InTransitBanner;






// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";

// const SCALE = 0.87;

// /**
//  * Props
//  * ──────────────────────────────────────────────────────────
//  * visible      – boolean, show/hide banner
//  * onViewPress  – callback for “VIEW”
//  * onClosePress – callback for the close (X) button
//  * style        – optional StyleSheet / inline style override
//  */
// const InTransitBanner = ({ visible, onViewPress, onClosePress, style }) => {
//   if (!visible) return null;

//   return (
//     <View style={[styles.container, style]}>
//       {/* ===== Close Button Redesigned Here ===== */}
//       <TouchableOpacity style={styles.closeBtn} onPress={onClosePress}>
//         <View style={styles.closeBtnCircle}>
//           <MaterialCommunityIcons
//             name="close"
//             size={RFValue(18 * SCALE)}
//             color="#fff" // White color for the cross
//           />
//         </View>
//       </TouchableOpacity>
      
//       {/* Original Content */}
//       <View style={styles.left}>
//         <MaterialCommunityIcons
//           name="truck-fast-outline"
//           size={RFValue(22 * SCALE)}
//           color="#000"
//         />
//         <Text
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           style={styles.label}
//         >
//           Order is on the way
//         </Text>
//       </View>

//       <TouchableOpacity style={styles.viewBtn} onPress={onViewPress}>
//         <Text
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           style={styles.viewText}
//         >
//           VIEW
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginHorizontal: wp(4),
//     paddingTop: hp(2.5 * SCALE), // Adjust top padding for close button
//     paddingBottom: hp(1.5 * SCALE),
//     paddingHorizontal: wp(3 * SCALE),
//     backgroundColor: "#F7F7F7",
//     borderWidth: 0.5,
//     borderColor: "#E0E0E0",
//     borderTopLeftRadius:15,
//     borderTopRightRadius:15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 4, 
//   },
//   // ===== Updated style for the close button and its circle =====
//   closeBtn: {
//     position: 'absolute',
//     top: -hp(1.5), // Position outside the banner, slightly above
//     right: wp(1),
//     zIndex: 1, // Ensure it's on top
//   },
//   closeBtnCircle: {
//     width: RFValue(30 * SCALE),
//     height: RFValue(30 * SCALE),
//     borderRadius: RFValue(15 * SCALE), // Half of width/height for a perfect circle
//     backgroundColor: '#000', // Black circle
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   left: { 
//     flexDirection: "row", 
//     alignItems: "center" 
//   },
//   label: {
//     marginLeft: wp(2.5 * SCALE),
//     fontWeight: "700",
//     fontSize: RFValue(14 * SCALE),
//     color: "#000",
//     maxWidth: wp(55),
//   },
//   viewBtn: {
//     paddingVertical: hp(0.5 * SCALE),
//     paddingHorizontal: wp(4 * SCALE),
//     borderWidth: 1.5,
//     borderColor: "#0C5273",
//     borderRadius: wp(2 * SCALE),
//     backgroundColor: "rgba(0,0,0,0.05)",
//   },
//   viewText: {
//     fontSize: RFValue(12 * SCALE),
//     fontWeight: "700",
//     color: "#0C5273",
//     textAlign: 'center',
//   },
// });

// export default InTransitBanner;









import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

/**
 * Props
 * ──────────────────────────────────────────────────────────
 * visible      – boolean, show/hide banner
 * onViewPress  – callback for “VIEW”
 * onClosePress – callback for the close (X) button
 * style        – optional StyleSheet / inline style override
 */
const InTransitBanner = ({ visible, onViewPress, onClosePress, style }) => {
  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Left side content: Text */}
      <Text style={styles.label}>Order is on the way</Text>

      {/* Right side content: VIEW button and Close button */}
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.viewBtn} onPress={onViewPress}>
          <Text style={styles.viewText}>VIEW</Text>
        </TouchableOpacity>

        {/* The new Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClosePress}>
          <MaterialCommunityIcons
            name="close"
            size={RFValue(16)}
            color="#666666" // Dark grey color for the 'X'
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Pushes text to the left and buttons to the right
    backgroundColor: "#F5F5F5", // A light grey background like the image
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    marginHorizontal: wp(4),
    borderRadius: 8, // Added a subtle border radius
  },
  label: {
    fontWeight: "bold",
    fontSize: RFValue(14),
    color: "#000000",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewBtn: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(5),
    borderWidth: 1.5,
    borderColor: "#0C5273",
    borderRadius: 6,
  },
  viewText: {
    fontSize: RFValue(12),
    fontWeight: "700",
    color: "#0C5273",
  },
  // --- STYLES FOR THE NEW CLOSE BUTTON ---
  closeButton: {
    width: RFValue(28),
    height: RFValue(28),
    borderRadius: RFValue(14), // Half of width/height to make it a circle
    backgroundColor: "#E0E0E0", // Light grey circle background
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(3), // Space between VIEW button and close button
  },
});

export default InTransitBanner;