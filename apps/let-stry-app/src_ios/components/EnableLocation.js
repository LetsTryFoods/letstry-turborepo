// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
// import { Linking, Platform } from "react-native";

// const openLocationSettings = () => {
//   if (Platform.OS === "ios") {
//     Linking.openURL("App-Prefs:Privacy&path=LOCATION"); // iOS location settings
//   } else {
//     Linking.openSettings(); // Android app settings
//   }
// };

// const LocationPermissionPopup = ({ onClose }) => (
//   <View style={styles.overlay}>
//     <View style={styles.popup}>
//       <Image
//         source={require("../assets/images/no-location.png")} // Use your own icon or SVG
//         style={styles.icon}
//         resizeMode="contain"
//       />
//       <Text 
//         style={styles.title} 
//         allowFontScaling={false} 
//         adjustsFontSizeToFit
//         numberOfLines={2}
//       >
//         Location permission disabled
//       </Text>
//       <Text 
//         style={styles.subtitle} 
//         allowFontScaling={false}
//         adjustsFontSizeToFit
//         numberOfLines={3}
//       >
//         Please enable location permission for a better delivery experience
//       </Text>
//       <TouchableOpacity style={styles.button} onPress={openLocationSettings}>
//         <Text 
//           style={styles.buttonText} 
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           numberOfLines={1}
//         >
//           Enable device location
//         </Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// );

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.95)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1000,
//   },
//   popup: {
//     width: 280,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     alignItems: "center",
//     paddingVertical: 32,
//     paddingHorizontal: 18,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   icon: {
//     width: 64,
//     height: 64,
//     marginBottom: 18,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#222",
//     marginBottom: 6,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 22,
//     textAlign: "center",
//   },
//   button: {
//     backgroundColor: "#0C5273",
//     borderRadius: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 24,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 15,
//   },
// });

// export default LocationPermissionPopup;






// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from "react-native";

// // OPEN APP SETTINGS (public API — ok for App Review)
// const openLocationSettings = () => {
//   Linking.openSettings();
// };

// /**
//  * Props:
//  *  - onSetManually: () => void      // navigate to your MapSearchScreen / Address flow
//  *  - onSkip: () => void             // mark opt-out and continue app use
//  */
// const LocationPermissionPopup = ({ onSetManually, onSkip }) => (
//   <View style={styles.overlay}>
//     <View style={styles.popup}>
//       <Image
//         source={require("../assets/images/no-location.png")}
//         style={styles.icon}
//         resizeMode="contain"
//       />

//       <Text
//         style={styles.title}
//         allowFontScaling={false}
//         adjustsFontSizeToFit
//         numberOfLines={2}
//       >
//         Location permission disabled
//       </Text>

//       <Text
//         style={styles.subtitle}
//         allowFontScaling={false}
//         adjustsFontSizeToFit
//         numberOfLines={3}
//       >
//         Enable location or set it manually for the best delivery experience.
//       </Text>

//       {/* Primary: enable device location */}
//       <TouchableOpacity style={[styles.button, styles.primary]} onPress={openLocationSettings}>
//         <Text style={styles.primaryText} allowFontScaling={false} numberOfLines={1}>
//           Enable Device Location
//         </Text>
//       </TouchableOpacity>

//       {/* Secondary: manual selection */}
//       <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onSetManually}>
//         <Text style={styles.secondaryText} allowFontScaling={false} numberOfLines={1}>
//           Set Location Manually
//         </Text>
//       </TouchableOpacity>

//       {/* Tertiary: skip */}
//       <TouchableOpacity onPress={onSkip} style={styles.skipTapArea}>
//         <Text style={styles.skipText}>Skip for Now</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// );

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(255,255,255,0.95)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1000,
//   },
//   popup: {
//     width: 320,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     alignItems: "center",
//     paddingVertical: 28,
//     paddingHorizontal: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   icon: {
//     width: 64,
//     height: 64,
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#222",
//     marginBottom: 6,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 18,
//     textAlign: "center",
//   },
//   button: {
//     width: "100%",
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   primary: {
//     backgroundColor: "#0C5273",
//   },
//   primaryText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   secondary: {
//     backgroundColor: "#EFF5F8",
//   },
//   secondaryText: {
//     color: "#0C5273",
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   skipTapArea: { paddingVertical: 4, paddingHorizontal: 8 },
//   skipText: {
//     color: "#6B7280",
//     fontSize: 15,
//   },
// });

// export default LocationPermissionPopup;






import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// OPEN APP SETTINGS (public API — ok for App Review)
const openLocationSettings = () => {
  Linking.openSettings();
};

const LocationPermissionPopup = ({ onSkip }) => {
  const [visible, setVisible] = useState(true);

  // Don't show if user previously skipped
  useEffect(() => {
    (async () => {
      const optedOut = await AsyncStorage.getItem("locationOptOut");
      if (optedOut === "true") setVisible(false);
    })();
  }, []);

  if (!visible) return null; // ✅ hides popup when closed

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Image
          source={require("../assets/images/no-location.png")}
          style={styles.icon}
          resizeMode="contain"
        />

        <Text style={styles.title} allowFontScaling={false} numberOfLines={2}>
          Location permission disabled
        </Text>

        <Text style={styles.subtitle} allowFontScaling={false} numberOfLines={3}>
         Continue without location. Add address at checkout manually or enable later in Settings.
        </Text>

        {/* Primary: enable device location */}
        <TouchableOpacity
          style={[styles.button, styles.primary]}
          onPress={() => {
            openLocationSettings();
            setVisible(false); // ✅ hide after tap
          }}
        >
          <Text style={styles.primaryText} allowFontScaling={false}>
            Enable Device Location
          </Text>
        </TouchableOpacity>

        {/* Secondary: skip */}
        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.setItem("locationOptOut", "true"); // ✅ persist skip
            if (onSkip) onSkip();
            setVisible(false); // ✅ hide after tap
          }}
          style={styles.skipTapArea}
        >
          <Text style={styles.skipText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: { width: 64, height: 64, marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 18,
    textAlign: "center",
  },
  button: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primary: { backgroundColor: "#0C5273" },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  skipTapArea: { paddingVertical: 4, paddingHorizontal: 8 },
  skipText: { color: "#000000", fontSize: 18,fontWeight: "700" },
});

export default LocationPermissionPopup;