// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   Alert,
//   StatusBar,
//   Platform,
//   Linking,
// } from "react-native";
// import { useAuth } from "../context/AuthContext";
// import LinearGradient from "react-native-linear-gradient";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import {
//   heightPercentageToDP as hp,
//   widthPercentageToDP as wp,
// } from "react-native-responsive-screen";
// import { RFValue } from "react-native-responsive-fontsize";

// const GradientHeader = ({ title, onBack }) => (
//   <LinearGradient
//     colors={["#F2D377", "#F5F5F5"]}
//     start={{ x: 0, y: 0 }}
//     end={{ x: 0, y: 1 }}
//     style={headerStyles.header}
//   >
//     <View style={headerStyles.headerContent}>
//       <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
//         <Ionicons name="chevron-back" size={RFValue(20)} color="#222" />
//       </TouchableOpacity>
//       <Text allowFontScaling={false} adjustsFontSizeToFit style={headerStyles.title}>{title}</Text>
//       <View style={headerStyles.iconPlaceholder} />
//     </View>
//   </LinearGradient>
// );

// const SettingsScreen = ({ navigation }) => {
//   const { user, signOut, loading } = useAuth();

//   const handleDeleteAccount = () => {
//     Alert.alert(
//       "Delete Account",
//       "Are you sure you want to delete your account? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await signOut();
//               navigation.reset({index:0, routes:[{name : "Login"}]});
//             }
//            catch (error) {
//             Alert.alert("Logout Failed", error.message || "Failed to logout.");
//            }
//           },
//         },
//       ]
//     );
//   };

//   const handleNotifications = async () => {
//     try {
//       if (Platform.OS === "ios") {
//         await Linking.openURL("app-settings:");
//       } else {
//         await Linking.openSettings();
//       }
//     } catch (error) {
//       console.log("Cannot open settings", error);
//       Alert.alert(
//         "Settings Unavailable",
//         "Unable to open notification settings. Please check your device settings manually."
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
//       <GradientHeader title="Settings" onBack={() => navigation.goBack()} />

//       <View style={styles.container}>
//         <View style={styles.section}>
//           <TouchableOpacity
//             style={styles.settingRow}
//             activeOpacity={0.7}
//             onPress={handleNotifications}
//           >
//             <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.settingText}>Notifications</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={styles.deleteButton}
//           activeOpacity={0.8}
//           onPress={handleDeleteAccount}
//         >
//           <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.deleteButtonText}>Delete Account</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   section: {
//     marginTop: hp("2%"),
//     paddingHorizontal: wp("5%"),
//   },
//   settingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: wp("2.5%"),
//     paddingHorizontal: wp("5%"),
//     paddingVertical: hp("1%"),
//     marginBottom: hp("2%"),
//     borderWidth: 1,
//     borderColor: "#eee",
//     justifyContent: "space-between",
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 1 },
//   },
//   settingText: {
//     fontSize: RFValue(15),
//     color: "#222",
//     fontWeight: "500",
//     textAlign: "center",
//   },
//   deleteButton: {
//     backgroundColor: "#0C5273",
//     borderRadius: wp("3%"),
//     paddingVertical: hp("1.2%"),
//     alignItems: "center",
//     marginTop: hp("4.5%"),
//     marginHorizontal: wp("5%"),
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 1 },
//   },
//   deleteButtonText: {
//     color: "#fff",
//     fontSize: RFValue(15),
//     fontWeight: "bold",
//     letterSpacing: 0.5,
//     textAlign: "center",
//   },
// });

// const headerStyles = StyleSheet.create({
//   header: {
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || hp("5%") : hp("6%"),
//     paddingHorizontal: wp("4%"),
//     paddingBottom: hp("2.5%"),
//     backgroundColor: "transparent",
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   iconButton: {
//     padding: wp("2%"),
//   },
//   iconPlaceholder: {
//     width: wp("10%"),
//     height: hp("4%"),
//   },
//   title: {
//     flex: 1,
//     color: "#222",
//     fontSize: RFValue(14),
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });

// export default SettingsScreen;







import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  Linking,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
// ✅ ADDED: SafeAreaInsets hook for better status bar handling
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  // ✅ ADDED: Get insets for safe area padding
  const insets = useSafeAreaInsets();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } catch (error) {
              Alert.alert(
                "Logout Failed",
                error.message || "Failed to logout."
              );
            }
          },
        },
      ]
    );
  };

  // ✅ UPDATED: A generic function to open app settings
  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.log("Cannot open settings", error);
      Alert.alert(
        "Settings Unavailable",
        "Unable to open settings. Please check your device settings manually."
      );
    }
  };

  return (
    // ✅ FIX: Removed SafeAreaView, as padding is handled manually now
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ✅ FIX: Header from TermsOfServiceScreen is now used here */}
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
              Settings
            </Text>
            <View style={styles.iconButtonRight} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={openAppSettings} // Using the generic function
          >
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              style={styles.settingText}
            >
              Notifications
            </Text>
          </TouchableOpacity>

          {/* ✅ ADDED: Location Settings Button */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={openAppSettings} // Re-using the same function
          >
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              style={styles.settingText}
            >
              Location Settings
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.8}
          onPress={handleDeleteAccount}
        >
          <Text
            allowFontScaling={false}
            adjustsFontSizeToFit
            style={styles.deleteButtonText}
          >
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  // ✅ ADDED: Header styles from the other screen for consistency
  header: {
    paddingBottom: hp(1.5),
    backgroundColor: "transparent",
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
    width: wp(9), // Ensures title is centered
  },
  headerTitle: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#222",
  },
  section: {
    marginTop: hp("2%"),
    paddingHorizontal: wp("5%"),
  },
  settingRow: {
    backgroundColor: "#fff",
    borderRadius: wp("2.5%"),
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("1.5%"), // Increased padding slightly for better touch area
    marginBottom: hp("1.5%"), // Adjusted margin
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  settingText: {
    fontSize: RFValue(14),
    color: "#333",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#0c5273", // A more standard "delete" color
    borderRadius: wp("3%"),
    paddingVertical: hp("1.5%"),
    alignItems: "center",
    marginTop: hp("3%"),
    marginHorizontal: wp("5%"),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: RFValue(15),
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

export default SettingsScreen;