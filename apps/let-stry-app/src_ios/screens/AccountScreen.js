
// import React, { useState } from "react";
// import AboutUsScreen from "../screens/AboutUsScreen"; // ✅ Add this at the top
// import Ionicons from "react-native-vector-icons/Ionicons";

// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Alert,
//   Share,
//   ScrollView,
//   Image,
//   Linking,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useAuth } from "../context/AuthContext";
// import { useNavigation } from "@react-navigation/native";
// import AddressBookModal from "../components/AddressBookModal";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";

// const SCALE = 0.87;

// const AccountScreen = () => {
//   const { user, signOut, loading } = useAuth();
//   const navigation = useNavigation();
//   const [sheetVisible, setSheetVisible] = useState(false);
//   const [accountsExpanded, setAccountsExpanded] = useState(false);
//   const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

//   const handleLogout = async () => {
//     setLogoutConfirmVisible(false);
//     try {
//       await signOut();
//       navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//     } catch (error) {
//       Alert.alert("Logout Failed", error.message);
//     }
//   };

//   const handleShareApp = async () => {
//     try {
//       await Share.share({
//         message:
//           "Check out this awesome app! Download it now: https://letstryfoods.com",
//       });
//     } catch (error) {
//       Alert.alert("Share Failed", error.message);
//     }
//   };

//   const openWhatsAppSupport = () => {
//     const phoneNumber = "7082300723";
//     const message = "Hi, I need help with my order.";
//     const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//       message
//     )}`;
//     Linking.openURL(url).catch(() =>
//       Alert.alert("Error", "WhatsApp is not installed on your device.")
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Icon name="chevron-back" size={RFValue(20 * SCALE)} color="#000" />
//       </TouchableOpacity>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.profileSection}>
//           <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.name}>
//             Account
//           </Text>
//           <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.phone}>
//             {user?.phoneNumber || "Sign in to access all features"}
//           </Text>

//           <View style={styles.topTilesWrapper}>
//             <View style={styles.tileBox}>
//               <TouchableOpacity
//                 style={styles.tileInnerBox}
//                 onPress={openWhatsAppSupport}
//               >
//                 <Image
//                   source={require("../assets/icons/help.png")}
//                   style={styles.tileIcon}
//                 />
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.tileText}>
//                   Support
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.verticalDivider} />

//             <View style={styles.tileBox}>
//               <TouchableOpacity
//                 style={styles.tileInnerBox}
//                 onPress={() =>
//                   user
//                     ? navigation.navigate("MyOrdersScreen")
//                     : navigation.navigate("Login")
//                 }
//               >
//                 <Image
//                   source={require("../assets/images/orders.png")}
//                   style={styles.tileIcon}
//                 />
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.tileText}>
//                   My Orders
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <View style={styles.optionsList}>
//           <TouchableOpacity
//             style={styles.optionItem}
//             onPress={() => setAccountsExpanded(!accountsExpanded)}
//           >
//             <View style={styles.optionContent}>
//               <Icon name="account-circle" size={RFValue(24 * SCALE)} color="#444" />
//               <View style={styles.optionTextContainer}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.optionTitle}>Accounts</Text>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.optionDesc}>
//                   View and edit your account
//                 </Text>
//               </View>
//             </View>
//             <Icon
//               name="chevron-right"
//               size={RFValue(20 * SCALE)}
//               color="#aaa"
//               style={{ transform: [{ rotate: accountsExpanded ? "90deg" : "0deg" }] }}
//             />
//           </TouchableOpacity>

//           {accountsExpanded && (
//             <View style={styles.subOptionsContainer}>
//               <OptionItem
//                 title="Profile"
//                 onPress={() => user
//                   ? navigation.navigate("ProfileScreen")
//                   : navigation.navigate("Login")
//                 }
//                 isSub
//               />
//               <View style={styles.separatorLine} />
//                 <OptionItem
//                   title="Settings"
//                   onPress={() => user
//                     ? navigation.navigate("SettingsScreen")
//                     : navigation.navigate("Login")
//                   }
//                   isSub
//                 />
//             </View>
//           )}

//           <OptionItem
//             title="Address Book"
//             desc="Manage your delivery addresses"
//             onPress={() =>
//               user ? setSheetVisible(true) : navigation.navigate("Login")
//             }
//             iconName="home"
//           />

//           <OptionItem
//             title="Share the App"
//             desc="Invite friends & family"
//             onPress={handleShareApp}
//             iconName="share"
//           />

//           {/* ✅ NEW ABOUT US BUTTON */}
//           <OptionItem
//             title="About Us"
//             desc="Terms & Conditions"
//             onPress={() => navigation.navigate("AboutUsScreen")}
//             iconName="info"
//           />
//         </View>

//         <TouchableOpacity
//           style={styles.logoutButton}
//           onPress={() =>
//             user ? setLogoutConfirmVisible(true) : navigation.navigate("Login")
//           }
//         >
//           <View style={styles.logoutContent}>
//             <Image
//               source={require("../assets/icons/logout.png")}
//               style={styles.logoutIcon}
//             />
//             <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.logoutText}>
//               {user ? (loading ? "Logging out..." : "Logout") : "Login"}
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </ScrollView>

//       <Modal
//         visible={sheetVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setSheetVisible(false)}
//       >
//         <View style={styles.sheetOverlay}>
//           <TouchableOpacity
//             style={styles.overlayTouchable}
//             onPress={() => setSheetVisible(false)}
//           />
//           <View style={styles.sheet}>
//             <View style={styles.sheetHeader}>
//               <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sheetTitle}>
//                 Select delivery location
//               </Text>
//               <TouchableOpacity onPress={() => setSheetVisible(false)}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.closeIcon}>
//                   ✕
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <AddressBookModal />
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         transparent
//         animationType="fade"
//         visible={logoutConfirmVisible}
//         onRequestClose={() => setLogoutConfirmVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalTitle}>
//               Logout Confirmation
//             </Text>
//             <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalMessage}>
//               Are you sure you want to logout?
//             </Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={{ color: "#fff", textAlign: "center" }}>
//                   Confirm
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => setLogoutConfirmVisible(false)}
//               >
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={{ color: "#0C5273", textAlign: "center" }}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const OptionItem = ({
//   title,
//   desc,
//   onPress,
//   isSub = false,
//   iconName = "chevron-right",
//   iconAsset,
// }) => (
//   <TouchableOpacity
//     style={[
//       styles.optionItem,
//       isSub && {
//         backgroundColor: "#fff",
//         borderRadius: wp(3 * SCALE),
//         paddingLeft: wp(7 * SCALE),
//         paddingVertical: hp(1.2 * SCALE),
//         width: "88%",
//         alignSelf: "center",
//         marginVertical: hp(0.4 * SCALE),
//       },
//     ]}
//     onPress={onPress}
//   >
//     <View style={styles.optionContent}>
//       {iconAsset ? (
//         <Image
//           source={iconAsset}
//           style={{
//             width: RFValue(24 * SCALE),
//             height: RFValue(24 * SCALE),
//             resizeMode: "contain",
//           }}
//         />
//       ) : (
//         <Icon name={iconName} size={RFValue(24 * SCALE)} color="#444" />
//       )}
//       <View style={styles.optionTextContainer}>
//         <Text allowFontScaling={false} adjustsFontSizeToFit style={isSub ? styles.subOptionTitle : styles.optionTitle}>
//           {title}
//         </Text>
//         {desc && (
//           <Text allowFontScaling={false} adjustsFontSizeToFit style={isSub ? styles.subOptionDesc : styles.optionDesc}>
//             {desc}
//           </Text>
//         )}
//       </View>
//     </View>
//     <Icon
//       name="chevron-right"
//       size={RFValue(isSub ? 16 * SCALE : 20 * SCALE)}
//       color="#aaa"
//     />
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f2f4f7" },
//   scrollContent: { paddingBottom: hp(12 * SCALE) },
//   backButton: {
//     position: "absolute",
//     top: hp(5.5 * SCALE),
//     left: wp(5 * SCALE),
//     zIndex: 10,
//     backgroundColor: "#fff",
//     borderRadius: wp(6 * SCALE),
//     padding: wp(2 * SCALE),
//     elevation: 3,
//   },
//   profileSection: {
//     alignItems: "center",
//     paddingTop: hp(16 * SCALE),
//     paddingBottom: hp(3 * SCALE),
//     backgroundColor: "#f2f4f7",
//   },
//   name: { fontSize: RFValue(20 * SCALE), fontWeight: "bold", color: "#000" },
//   phone: { fontSize: RFValue(14 * SCALE), color: "#555", marginTop: hp(0.5 * SCALE) },
//   topTilesWrapper: {
//     flexDirection: "row",
//     marginTop: hp(2 * SCALE),
//     backgroundColor: "rgba(255, 240, 180, 0.35)",
//     borderWidth: 1,
//     borderColor: "rgba(147, 147, 147, 0.15)",
//     width: "90%",
//     justifyContent: "space-between",
//     padding: wp(3 * SCALE),
//     borderRadius: wp(3 * SCALE),
//   },
//   tileBox: { flex: 1, alignItems: "center", justifyContent: "center" },
//   tileInnerBox: { flex: 1, alignItems: "center", justifyContent: "center" },
//   verticalDivider: {
//     width: 1.5,
//     backgroundColor: "#fff",
//     marginHorizontal: wp(2 * SCALE),
//     height: "120%",
//     alignSelf: "center",
//   },
//   tileIcon: {
//     width: RFValue(24 * SCALE),
//     height: RFValue(24 * SCALE),
//     resizeMode: "contain",
//     marginBottom: hp(0.6 * SCALE),
//   },
//   tileText: {
//     fontSize: RFValue(12 * SCALE),
//     fontWeight: "600",
//     color: "#333",
//   },
//   optionsList: {
//     marginTop: hp(2.5 * SCALE),
//     paddingBottom: hp(2.5 * SCALE),
//   },
//   optionItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingVertical: hp(2.2 * SCALE),
//     paddingHorizontal: wp(6 * SCALE),
//     borderRadius: wp(3 * SCALE),
//     marginVertical: hp(1.1 * SCALE),
//     alignSelf: "center",
//     width: "90%",
//   },
//   optionTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", color: "#222" },
//   optionDesc: { fontSize: RFValue(13 * SCALE), color: "#888" },
//   subOptionTitle: { fontSize: RFValue(13 * SCALE), fontWeight: "600", color: "#222" },
//   subOptionDesc: { fontSize: RFValue(11 * SCALE), color: "#888" },
//   optionContent: { flexDirection: "row", alignItems: "center" },
//   optionTextContainer: { marginLeft: wp(4 * SCALE) },
//   logoutButton: {
//     backgroundColor: "#0C5273",
//     borderRadius: wp(2.5 * SCALE),
//     paddingVertical: hp(1.7 * SCALE),
//     marginTop: hp(2.5 * SCALE),
//     marginBottom: hp(5 * SCALE),
//     alignSelf: "center",
//     width: "90%",
//     alignItems: "center",
//     elevation: 2,
//   },
//   logoutContent: { flexDirection: "row", alignItems: "center" },
//   logoutIcon: {
//     width: RFValue(20 * SCALE),
//     height: RFValue(20 * SCALE),
//     resizeMode: "contain",
//     marginRight: wp(2 * SCALE),
//   },
//   logoutText: {
//     color: "#fff",
//     fontSize: RFValue(15 * SCALE),
//     fontWeight: "700",
//   },
//   subOptionsContainer: { alignSelf: "center", width: "100%" },
//   separatorLine: { height: 1, backgroundColor: "#eee", marginHorizontal: wp(6 * SCALE) },
//   sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
//   overlayTouchable: { flex: 1 },
//   sheet: {
//     width: "100%",
//     height: hp(70),
//     backgroundColor: "#F6F7FB",
//     borderTopLeftRadius: wp(5 * SCALE),
//     borderTopRightRadius: wp(5 * SCALE),
//     paddingTop: hp(1.5 * SCALE),
//     elevation: 5,
//     paddingHorizontal: wp(2.5 * SCALE),
//   },
//   sheetHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: wp(4 * SCALE),
//     paddingBottom: hp(1.2 * SCALE),
//   },
//   sheetTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", color: "#333" },
//   closeIcon: { fontSize: RFValue(20 * SCALE), color: "#0C5273", fontWeight: "bold" },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: wp(3 * SCALE),
//     padding: wp(7 * SCALE),
//     width: "80%",
//     alignItems: "center",
//   },
//   modalTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", marginBottom: hp(1 * SCALE) },
//   modalMessage: { fontSize: RFValue(13 * SCALE), color: "#444", marginBottom: hp(2.5 * SCALE) },
//   modalActions: { flexDirection: "row", gap: wp(5 * SCALE) },
//   confirmBtn: {
//     backgroundColor: "#0C5273",
//     paddingVertical: hp(1 * SCALE),
//     paddingHorizontal: wp(6 * SCALE),
//     borderRadius: wp(2 * SCALE),
//     marginRight: wp(2 * SCALE),
//   },
//   cancelBtn: {
//     backgroundColor: "#F0F0F0",
//     paddingVertical: hp(1 * SCALE),
//     paddingHorizontal: wp(6 * SCALE),
//     borderRadius: wp(2 * SCALE),
//   },
// });

// export default AccountScreen;





















// import React, { useState } from "react";
// import AboutUsScreen from "../screens/AboutUsScreen";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   Alert,
//   Share,
//   ScrollView,
//   Image,
//   Linking,
// } from "react-native";
// // ✅ FIX: Import Ionicons specifically for the back button
// import Ionicons from "react-native-vector-icons/Ionicons";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useAuth } from "../context/AuthContext";
// import { useNavigation } from "@react-navigation/native";
// import AddressBookModal from "../components/AddressBookModal";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";

// const SCALE = 0.87;

// const AccountScreen = () => {
//   const { user, signOut, loading } = useAuth();
//   const navigation = useNavigation();
//   const [sheetVisible, setSheetVisible] = useState(false);
//   const [accountsExpanded, setAccountsExpanded] = useState(false);
//   const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

//   const handleLogout = async () => {
//     setLogoutConfirmVisible(false);
//     try {
//       await signOut();
//       navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//     } catch (error) {
//       Alert.alert("Logout Failed", error.message);
//     }
//   };

//   const handleShareApp = async () => {
//     try {
//       await Share.share({
//         message:
//           "Check out this awesome app! Download it now: https://letstryfoods.com",
//       });
//     } catch (error) {
//       Alert.alert("Share Failed", error.message);
//     }
//   };

//   const openWhatsAppSupport = () => {
//     const phoneNumber = "7082300723";
//     const message = "Hi, I need help with my order.";
//     const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//       message
//     )}`;
//     Linking.openURL(url).catch(() =>
//       Alert.alert("Error", "WhatsApp is not installed on your device.")
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         {/* ✅ FIX: Use the Ionicons component to get "chevron-back" */}
//         <Ionicons name="chevron-back" size={RFValue(20 * SCALE)} color="#000" />
//       </TouchableOpacity>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.profileSection}>
//           <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.name}>
//             Account
//           </Text>
//           <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.phone}>
//             {user?.phoneNumber || "Sign in to access all features"}
//           </Text>

//           <View style={styles.topTilesWrapper}>
//             <View style={styles.tileBox}>
//               <TouchableOpacity
//                 style={styles.tileInnerBox}
//                 onPress={openWhatsAppSupport}
//               >
//                 <Image
//                   source={require("../assets/icons/help.png")}
//                   style={styles.tileIcon}
//                 />
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.tileText}>
//                   Support
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.verticalDivider} />

//             <View style={styles.tileBox}>
//               <TouchableOpacity
//                 style={styles.tileInnerBox}
//                 onPress={() =>
//                   user
//                     ? navigation.navigate("MyOrdersScreen")
//                     : navigation.navigate("Login")
//                 }
//               >
//                 <Image
//                   source={require("../assets/images/orders.png")}
//                   style={styles.tileIcon}
//                 />
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.tileText}>
//                   My Orders
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <View style={styles.optionsList}>
//           <TouchableOpacity
//             style={styles.optionItem}
//             onPress={() => setAccountsExpanded(!accountsExpanded)}
//           >
//             <View style={styles.optionContent}>
//               <Icon name="account-circle" size={RFValue(24 * SCALE)} color="#444" />
//               <View style={styles.optionTextContainer}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.optionTitle}>Accounts</Text>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.optionDesc}>
//                   View and edit your account
//                 </Text>
//               </View>
//             </View>
//             <Icon
//               name="chevron-right"
//               size={RFValue(20 * SCALE)}
//               color="#aaa"
//               style={{ transform: [{ rotate: accountsExpanded ? "90deg" : "0deg" }] }}
//             />
//           </TouchableOpacity>

//           {accountsExpanded && (
//             <View style={styles.subOptionsContainer}>
//               <OptionItem
//                 title="Profile"
//                 onPress={() => user
//                   ? navigation.navigate("ProfileScreen")
//                   : navigation.navigate("Login")
//                 }
//                 isSub
//               />
//               <View style={styles.separatorLine} />
//                 <OptionItem
//                   title="Settings"
//                   onPress={() => user
//                     ? navigation.navigate("SettingsScreen")
//                     : navigation.navigate("Login")
//                   }
//                   isSub
//                 />
//             </View>
//           )}

//           <OptionItem
//             title="Address Book"
//             desc="Manage your delivery addresses"
//             onPress={() =>
//               user ? setSheetVisible(true) : navigation.navigate("Login")
//             }
//             iconName="home"
//           />

//           <OptionItem
//             title="Share the App"
//             desc="Invite friends & family"
//             onPress={handleShareApp}
//             iconName="share"
//           />

//           <OptionItem
//             title="About Us"
//             desc="Terms & Conditions"
//             onPress={() => navigation.navigate("AboutUsScreen")}
//             iconName="info"
//           />
//         </View>

//         <TouchableOpacity
//           style={styles.logoutButton}
//           onPress={() =>
//             user ? setLogoutConfirmVisible(true) : navigation.navigate("Login")
//           }
//         >
//           <View style={styles.logoutContent}>
//             <Image
//               source={require("../assets/icons/logout.png")}
//               style={styles.logoutIcon}
//             />
//             <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.logoutText}>
//               {user ? (loading ? "Logging out..." : "Logout") : "Login"}
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* MODALS ARE UNCHANGED */}
//       <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
//         <View style={styles.sheetOverlay}>
//           <TouchableOpacity style={styles.overlayTouchable} onPress={() => setSheetVisible(false)} />
//           <View style={styles.sheet}>
//             <View style={styles.sheetHeader}>
//               <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sheetTitle}>Select delivery location</Text>
//               <TouchableOpacity onPress={() => setSheetVisible(false)}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.closeIcon}>✕</Text>
//               </TouchableOpacity>
//             </View>
//             <AddressBookModal />
//           </View>
//         </View>
//       </Modal>

//       <Modal transparent animationType="fade" visible={logoutConfirmVisible} onRequestClose={() => setLogoutConfirmVisible(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalTitle}>Logout Confirmation</Text>
//             <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalMessage}>Are you sure you want to logout?</Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={{ color: "#fff", textAlign: "center" }}>Confirm</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutConfirmVisible(false)}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={{ color: "#0C5273", textAlign: "center" }}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const OptionItem = ({ title, desc, onPress, isSub = false, iconName = "chevron-right", iconAsset }) => (
//   <TouchableOpacity style={[styles.optionItem, isSub && { backgroundColor: "#fff", borderRadius: wp(3 * SCALE), paddingLeft: wp(7 * SCALE), paddingVertical: hp(1.2 * SCALE), width: "88%", alignSelf: "center", marginVertical: hp(0.4 * SCALE) }]} onPress={onPress}>
//     <View style={styles.optionContent}>
//       {iconAsset ? (<Image source={iconAsset} style={{ width: RFValue(24 * SCALE), height: RFValue(24 * SCALE), resizeMode: "contain" }} />) : (<Icon name={iconName} size={RFValue(24 * SCALE)} color="#444" />)}
//       <View style={styles.optionTextContainer}>
//         <Text allowFontScaling={false} adjustsFontSizeToFit style={isSub ? styles.subOptionTitle : styles.optionTitle}>{title}</Text>
//         {desc && (<Text allowFontScaling={false} adjustsFontSizeToFit style={isSub ? styles.subOptionDesc : styles.optionDesc}>{desc}</Text>)}
//       </View>
//     </View>
//     <Icon name="chevron-right" size={RFValue(isSub ? 16 * SCALE : 20 * SCALE)} color="#aaa" />
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f2f4f7" },
//   scrollContent: { paddingBottom: hp(12 * SCALE) },
//   backButton: { position: "absolute", top: hp(6.5 * SCALE), left: wp(5 * SCALE), zIndex: 10,  borderRadius: wp(6 * SCALE), padding: wp(2 * SCALE), elevation: 3 },
//   profileSection: {
//     alignItems: "center",
//     paddingTop: hp(16 * SCALE),
//     paddingBottom: hp(2 * SCALE), 
//     backgroundColor: "#f2f4f7",
//   },
//   name: { fontSize: RFValue(20 * SCALE), fontWeight: "bold", color: "#000" },
//   phone: { fontSize: RFValue(14 * SCALE), color: "#555", marginTop: hp(0.5 * SCALE) },
//   topTilesWrapper: { flexDirection: "row", marginTop: hp(2 * SCALE), backgroundColor: "rgba(255, 240, 180, 0.35)", borderWidth: 1, borderColor: "rgba(147, 147, 147, 0.15)", width: "90%", justifyContent: "space-between", padding: wp(3 * SCALE), borderRadius: wp(3 * SCALE) },
//   tileBox: { flex: 1, alignItems: "center", justifyContent: "center" },
//   tileInnerBox: { flex: 1, alignItems: "center", justifyContent: "center" },
//   verticalDivider: { width: 1.5, backgroundColor: "#fff", marginHorizontal: wp(2 * SCALE), height: "120%", alignSelf: "center" },
//   tileIcon: { width: RFValue(24 * SCALE), height: RFValue(24 * SCALE), resizeMode: "contain", marginBottom: hp(0.6 * SCALE) },
//   tileText: { fontSize: RFValue(12 * SCALE), fontWeight: "600", color: "#333" },
//   optionsList: {
//     marginTop: hp(1.00 * SCALE),
//     paddingBottom: hp(2.5 * SCALE),
//   },
//   optionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", paddingVertical: hp(2.2 * SCALE), paddingHorizontal: wp(6 * SCALE), borderRadius: wp(3 * SCALE), marginVertical: hp(1.1 * SCALE), alignSelf: "center", width: "90%" },
//   optionTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", color: "#222" },
//   optionDesc: { fontSize: RFValue(13 * SCALE), color: "#888" },
//   subOptionTitle: { fontSize: RFValue(13 * SCALE), fontWeight: "600", color: "#222" },
//   subOptionDesc: { fontSize: RFValue(11 * SCALE), color: "#888" },
//   optionContent: { flexDirection: "row", alignItems: "center" },
//   optionTextContainer: { marginLeft: wp(4 * SCALE) },
//   logoutButton: { backgroundColor: "#0C5273", borderRadius: wp(2.5 * SCALE), paddingVertical: hp(1.7 * SCALE), marginTop: hp(2.5 * SCALE), marginBottom: hp(5 * SCALE), alignSelf: "center", width: "90%", alignItems: "center", elevation: 2 },
//   logoutContent: { flexDirection: "row", alignItems: "center" },
//   logoutIcon: { width: RFValue(20 * SCALE), height: RFValue(20 * SCALE), resizeMode: "contain", marginRight: wp(2 * SCALE) },
//   logoutText: { color: "#fff", fontSize: RFValue(15 * SCALE), fontWeight: "700" },
//   subOptionsContainer: { alignSelf: "center", width: "100%" },
//   separatorLine: { height: 1, backgroundColor: "#eee", marginHorizontal: wp(6 * SCALE) },
//   sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
//   overlayTouchable: { flex: 1 },
//   sheet: { width: "100%", height: hp(70), backgroundColor: "#F6F7FB", borderTopLeftRadius: wp(5 * SCALE), borderTopRightRadius: wp(5 * SCALE), paddingTop: hp(1.5 * SCALE), elevation: 5, paddingHorizontal: wp(2.5 * SCALE) },
//   sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: wp(4 * SCALE), paddingBottom: hp(1.2 * SCALE) },
//   sheetTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", color: "#333" },
//   closeIcon: { fontSize: RFValue(20 * SCALE), color: "#0C5273", fontWeight: "bold" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
//   modalContent: { backgroundColor: "#fff", borderRadius: wp(3 * SCALE), padding: wp(7 * SCALE), width: "80%", alignItems: "center" },
//   modalTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", marginBottom: hp(1 * SCALE) },
//   modalMessage: { fontSize: RFValue(13 * SCALE), color: "#444", marginBottom: hp(2.5 * SCALE) },
//   modalActions: { flexDirection: "row", gap: wp(5 * SCALE) },
//   confirmBtn: { backgroundColor: "#0C5273", paddingVertical: hp(1 * SCALE), paddingHorizontal: wp(6 * SCALE), borderRadius: wp(2 * SCALE), marginRight: wp(2 * SCALE) },
//   cancelBtn: { backgroundColor: "#F0F0F0", paddingVertical: hp(1 * SCALE), paddingHorizontal: wp(6 * SCALE), borderRadius: wp(2 * SCALE) },
// });

// export default AccountScreen;









import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Share,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import AddressBookModal from "../components/AddressBookModal";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const SCALE = 0.87;

const AccountScreen = () => {
  const { user, signOut, loading } = useAuth();
  const navigation = useNavigation();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [accountsExpanded, setAccountsExpanded] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  
  // ✅ CHANGE 1: ADD THIS FUNCTION TO HANDLE CLOSING THE SHEET AND NAVIGATING
  const handleCloseAddressSheetAndNavigate = () => {
    setSheetVisible(false); // Close the sheet
    // Navigate after a small delay for a smooth animation on iOS
    setTimeout(() => {
      navigation.navigate("AddAddressScreen");
    }, 150);
  };

  const handleLogout = async () => {
    setLogoutConfirmVisible(false);
    try {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "Check out this awesome app! Download it now: https://letstryfoods.com",
      });
    } catch (error) {
      Alert.alert("Share Failed", error.message);
    }
  };

  const openWhatsAppSupport = () => {
    const phoneNumber = "7082300723";
    const message = "Hi, I need help with my order.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "WhatsApp is not installed on your device.")
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={RFValue(20 * SCALE)} color="#000" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.name}>
            Account
          </Text>
          <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.phone}>
            {user?.phoneNumber || "Sign in to access all features"}
          </Text>

          <View style={styles.topTilesWrapper}>
            <View style={styles.tileBox}>
              <TouchableOpacity
                style={styles.tileInnerBox}
                onPress={openWhatsAppSupport}
              >
                <Image
                  source={require("../assets/icons/help.png")}
                  style={styles.tileIcon}
                />
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.tileText}>
                  Support
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.tileBox}>
              <TouchableOpacity
                style={styles.tileInnerBox}
                onPress={() =>
                  user
                    ? navigation.navigate("MyOrdersScreen")
                    : navigation.navigate("Login")
                }
              >
                <Image
                  source={require("../assets/images/orders.png")}
                  style={styles.tileIcon}
                />
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.tileText}>
                  My Orders
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.optionsList}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setAccountsExpanded(!accountsExpanded)}
          >
            <View style={styles.optionContent}>
              <Icon name="account-circle" size={RFValue(24 * SCALE)} color="#444" />
              <View style={styles.optionTextContainer}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.optionTitle}>Accounts</Text>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.optionDesc}>
                  View and edit your account
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-right"
              size={RFValue(20 * SCALE)}
              color="#aaa"
              style={{ transform: [{ rotate: accountsExpanded ? "90deg" : "0deg" }] }}
            />
          </TouchableOpacity>

          {accountsExpanded && (
            <View style={styles.subOptionsContainer}>
              <OptionItem
                title="Profile"
                onPress={() => user
                  ? navigation.navigate("ProfileScreen")
                  : navigation.navigate("Login")
                }
                isSub
              />
              <View style={styles.separatorLine} />
                <OptionItem
                  title="Settings"
                  onPress={() => user
                    ? navigation.navigate("SettingsScreen")
                    : navigation.navigate("Login")
                  }
                  isSub
                />
            </View>
          )}

          <OptionItem
            title="Address Book"
            desc="Manage your delivery addresses"
            onPress={() =>
              user ? setSheetVisible(true) : navigation.navigate("Login")
            }
            iconName="home"
          />

          <OptionItem
            title="Share the App"
            desc="Invite friends & family"
            onPress={handleShareApp}
            iconName="share"
          />

          <OptionItem
            title="About Us"
            desc="Terms & Conditions"
            onPress={() => navigation.navigate("AboutUsScreen")}
            iconName="info"
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            user ? setLogoutConfirmVisible(true) : navigation.navigate("Login")
          }
        >
          <View style={styles.logoutContent}>
            <Image
              source={require("../assets/icons/logout.png")}
              style={styles.logoutIcon}
            />
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.logoutText}>
              {user ? (loading ? "Logging out..." : "Logout") : "Login"}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.overlayTouchable} onPress={() => setSheetVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sheetTitle}>Select delivery location</Text>
              <TouchableOpacity onPress={() => setSheetVisible(false)}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* ✅ CHANGE 2: PASS THE NEW FUNCTION AS A PROP */}
            <AddressBookModal
              onCloseRequest={handleCloseAddressSheetAndNavigate}
              onSelect={() => setSheetVisible(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={logoutConfirmVisible} onRequestClose={() => setLogoutConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalTitle}>Logout Confirmation</Text>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalMessage}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={{ color: "#fff", textAlign: "center" }}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutConfirmVisible(false)}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={{ color: "#0C5273", textAlign: "center" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const OptionItem = ({ title, desc, onPress, isSub = false, iconName = "chevron-right", iconAsset }) => (
  <TouchableOpacity style={[styles.optionItem, isSub && { backgroundColor: "#fff", borderRadius: wp(3 * SCALE), paddingLeft: wp(7 * SCALE), paddingVertical: hp(1.2 * SCALE), width: "88%", alignSelf: "center", marginVertical: hp(0.4 * SCALE) }]} onPress={onPress}>
    <View style={styles.optionContent}>
      {iconAsset ? (<Image source={iconAsset} style={{ width: RFValue(24 * SCALE), height: RFValue(24 * SCALE), resizeMode: "contain" }} />) : (<Icon name={iconName} size={RFValue(24 * SCALE)} color="#444" />)}
      <View style={styles.optionTextContainer}>
        <Text allowFontScaling={false} adjustsFontSizeToFit style={isSub ? styles.subOptionTitle : styles.optionTitle}>{title}</Text>
        {desc && (<Text allowFontScaling={false} adjustsFontSizeToFit style={isSub ? styles.subOptionDesc : styles.optionDesc}>{desc}</Text>)}
      </View>
    </View>
    <Icon name="chevron-right" size={RFValue(isSub ? 16 * SCALE : 20 * SCALE)} color="#aaa" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f7" },
  scrollContent: { paddingBottom: hp(12 * SCALE) },
  backButton: { position: "absolute", top: hp(6.5 * SCALE), left: wp(5 * SCALE), zIndex: 10,  borderRadius: wp(6 * SCALE), padding: wp(2 * SCALE), elevation: 3 },
  profileSection: {
    alignItems: "center",
    paddingTop: hp(16 * SCALE),
    paddingBottom: hp(2 * SCALE), 
    backgroundColor: "#f2f4f7",
  },
  name: { fontSize: RFValue(20 * SCALE), fontWeight: "bold", color: "#000" },
  phone: { fontSize: RFValue(14 * SCALE), color: "#555", marginTop: hp(0.5 * SCALE) },
  topTilesWrapper: { flexDirection: "row", marginTop: hp(2 * SCALE), backgroundColor: "rgba(255, 240, 180, 0.35)", borderWidth: 1, borderColor: "rgba(147, 147, 147, 0.15)", width: "90%", justifyContent: "space-between", padding: wp(3 * SCALE), borderRadius: wp(3 * SCALE) },
  tileBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  tileInnerBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  verticalDivider: { width: 1.5, backgroundColor: "#fff", marginHorizontal: wp(2 * SCALE), height: "120%", alignSelf: "center" },
  tileIcon: { width: RFValue(24 * SCALE), height: RFValue(24 * SCALE), resizeMode: "contain", marginBottom: hp(0.6 * SCALE) },
  tileText: { fontSize: RFValue(12 * SCALE), fontWeight: "600", color: "#333" },
  optionsList: {
    marginTop: hp(1.00 * SCALE),
    paddingBottom: hp(2.5 * SCALE),
  },
  optionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", paddingVertical: hp(2.2 * SCALE), paddingHorizontal: wp(6 * SCALE), borderRadius: wp(3 * SCALE), marginVertical: hp(1.1 * SCALE), alignSelf: "center", width: "90%" },
  optionTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", color: "#222" },
  optionDesc: { fontSize: RFValue(13 * SCALE), color: "#888" },
  subOptionTitle: { fontSize: RFValue(13 * SCALE), fontWeight: "600", color: "#222" },
  subOptionDesc: { fontSize: RFValue(11 * SCALE), color: "#888" },
  optionContent: { flexDirection: "row", alignItems: "center" },
  optionTextContainer: { marginLeft: wp(4 * SCALE) },
  logoutButton: { backgroundColor: "#0C5273", borderRadius: wp(2.5 * SCALE), paddingVertical: hp(1.7 * SCALE), marginTop: hp(2.5 * SCALE), marginBottom: hp(5 * SCALE), alignSelf: "center", width: "90%", alignItems: "center", elevation: 2 },
  logoutContent: { flexDirection: "row", alignItems: "center" },
  logoutIcon: { width: RFValue(20 * SCALE), height: RFValue(20 * SCALE), resizeMode: "contain", marginRight: wp(2 * SCALE) },
  logoutText: { color: "#fff", fontSize: RFValue(15 * SCALE), fontWeight: "700" },
  subOptionsContainer: { alignSelf: "center", width: "100%" },
  separatorLine: { height: 1, backgroundColor: "#eee", marginHorizontal: wp(6 * SCALE) },
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  overlayTouchable: { flex: 1 },
  sheet: { width: "100%", height: hp(70), backgroundColor: "#F6F7FB", borderTopLeftRadius: wp(5 * SCALE), borderTopRightRadius: wp(5 * SCALE), paddingTop: hp(1.5 * SCALE), elevation: 5, paddingHorizontal: wp(2.5 * SCALE) },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: wp(4 * SCALE), paddingBottom: hp(1.2 * SCALE) },
  sheetTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", color: "#333" },
  closeIcon: { fontSize: RFValue(20 * SCALE), color: "#0C5273", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: wp(3 * SCALE), padding: wp(7 * SCALE), width: "80%", alignItems: "center" },
  modalTitle: { fontSize: RFValue(16 * SCALE), fontWeight: "bold", marginBottom: hp(1 * SCALE) },
  modalMessage: { fontSize: RFValue(13 * SCALE), color: "#444", marginBottom: hp(2.5 * SCALE) },
  modalActions: { flexDirection: "row", gap: wp(5 * SCALE) },
  confirmBtn: { backgroundColor: "#0C5273", paddingVertical: hp(1 * SCALE), paddingHorizontal: wp(6 * SCALE), borderRadius: wp(2 * SCALE), marginRight: wp(2 * SCALE) },
  cancelBtn: { backgroundColor: "#F0F0F0", paddingVertical: hp(1 * SCALE), paddingHorizontal: wp(6 * SCALE), borderRadius: wp(2 * SCALE) },
});

export default AccountScreen;