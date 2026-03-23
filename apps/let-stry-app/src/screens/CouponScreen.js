// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   TextInput,
//   ActivityIndicator,
//   FlatList,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import Ionicons from "react-native-vector-icons/Ionicons";
// import LinearGradient from "react-native-linear-gradient";
// import CouponService from '../services/CouponService';
// import { useCart } from '../context/CartContext';
// import { RFValue } from "react-native-responsive-fontsize";
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// // ✅ New Scale Constant: Change this value to scale the entire UI
// const SCALE_CONSTANT = 1;

// // --- Components ---
// const GradientHeader = ({ title, onBack }) => (
//     <LinearGradient
//       colors={["#F2D377", "#F5F5F5"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 0, y: 1 }}
//       style={headerStyles.header}
//     >
//       <View style={headerStyles.headerContent}>
//         <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
//           <Ionicons name="chevron-back" size={RFValue(21 * SCALE_CONSTANT)} color="#222" />
//         </TouchableOpacity>
//         <Text style={headerStyles.title} allowFontScaling={false} adjustsFontSizeToFit>{title}</Text>
//         <View style={headerStyles.iconPlaceholder} />
//       </View>
//     </LinearGradient>
// );

// const CouponScreen = ({ navigation, route }) => {
//   // ... All component logic remains the same ...
//   const [coupons, setCoupons] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [couponCode, setCouponCode] = useState('');
//   const [applyingCoupon, setApplyingCoupon] = useState(null);
//   const [manualApplying, setManualApplying] = useState(false);

//   const { cartTotal, applyCoupon, appliedCoupon, removeCoupon } = useCart();
//   const insets = useSafeAreaInsets();
  
//   useEffect(() => {
//     fetchCoupons();
//   }, []);

//   const fetchCoupons = async () => {
//     setLoading(true);
//     try {
//       const result = await CouponService.fetchActiveCoupons();
//       if (result.success) {
//         setCoupons(result.data);
//       }
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApplyCoupon = async (code) => {
//     if (applyingCoupon || manualApplying) return;

//     setApplyingCoupon(code);
//     try {
//       const result = await CouponService.applyCoupon(code, cartTotal);

//       if (result.success && result.valid) {
//         const couponData = coupons.find(coupon => coupon.code === code);
//         applyCoupon({
//           code: code,
//           discount: result.discountAmount,
//           message: result.message,
//           minOrderValue: couponData?.minOrderValue || 0
//         });
//         navigation.goBack();
//       }
//     } catch (error) {
//     } finally {
//       setApplyingCoupon(null);
//     }
//   };

//   const handleManualApply = async () => {
//     if (manualApplying || applyingCoupon) return;

//     if (couponCode.trim()) {
//       setManualApplying(true);
//       try {
//         const code = couponCode.trim().toUpperCase();
//         const result = await CouponService.applyCoupon(code, cartTotal);

//         if (result.success && result.valid) {
//           const couponData = coupons.find(coupon => coupon.code === code);
//           applyCoupon({
//             code: code,
//             discount: result.discountAmount,
//             message: result.message,
//             minOrderValue: couponData?.minOrderValue || result.minOrderValue || 0
//           });
//           navigation.goBack();
//         }
//       } catch (error) {
//       } finally {
//         setManualApplying(false);
//       }
//     }
//   };
  
//   const handleRemoveCoupon = () => {
//     if (removeCoupon) {
//       removeCoupon();
//     }
//   };

//   const renderCouponItem = ({ item }) => {
//     const isApplying = applyingCoupon === item.code;
//     const minOrderValue = item.minOrderValue || 0;
//     const isEligible = cartTotal >= minOrderValue;
//     const diff = Math.max(minOrderValue - cartTotal, 0);
//     const isApplied = appliedCoupon && appliedCoupon.code === item.code;
//     const isDisabled = !isEligible || isApplying || manualApplying;

//     return (
//       <View style={[styles.couponCard, !isEligible && styles.couponCardDisabled, isApplied && styles.couponCardApplied]}>
//         <View style={styles.couponContent}>
//           <Text style={[styles.couponTitle, !isEligible && styles.textDisabled, isApplied && styles.appliedText]} allowFontScaling={false} adjustsFontSizeToFit>
//             {item.description}
//             {item.maxDiscount ? ` upto ₹${item.maxDiscount}` : ""}
//           </Text>
//           <View style={styles.couponCodeContainer}>
//             <View style={[styles.couponCodeBox, isApplied && styles.appliedCouponCodeBox]}>
//               <Text style={[styles.couponCode, !isEligible && styles.textDisabled, isApplied && styles.appliedText]} allowFontScaling={false} adjustsFontSizeToFit>
//                 {item.code}
//               </Text>
//             </View>

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.applyButton,
//                   isApplied ? styles.appliedButton : isDisabled ? styles.disabledButton : null
//                 ]}
//                 onPress={() => handleApplyCoupon(item.code)}
//                 disabled={isDisabled || isApplied}
//                 activeOpacity={0.7}
//               >
//                 {isApplying ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <Text style={styles.applyButtonText} allowFontScaling={false} adjustsFontSizeToFit>
//                     {isApplied ? 'APPLIED' : 'APPLY'}
//                   </Text>
//                 )}
//               </TouchableOpacity>

//               {isApplied && (
//                 <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeButton}>
//                   <Icon name="delete" size={RFValue(16 * SCALE_CONSTANT)} color="#888" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>

//           {minOrderValue > 0 && (
//             <Text style={[styles.couponCondition, !isEligible && styles.textDisabled, isApplied && styles.appliedText]} allowFontScaling={false} adjustsFontSizeToFit>
//               Min order value: ₹{minOrderValue}
//             </Text>
//           )}
//           {item.expiryDate && (
//             <Text style={[styles.couponExpiry, isApplied && styles.appliedText]} allowFontScaling={false} adjustsFontSizeToFit>
//               Valid till: {new Date(item.expiryDate).toLocaleDateString()}
//             </Text>
//           )}
//           {!isEligible && minOrderValue > 0 && (
//             <Text style={styles.eligibilityMsg} allowFontScaling={false} adjustsFontSizeToFit>
//               Add items worth ₹{diff} to apply this coupon.
//             </Text>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container,{marginBottom:insets.bottom}]}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F2D377" />
//       <GradientHeader
//         title="Apply Coupon"
//         onBack={() => navigation.goBack()}
//       />
//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         <View style={styles.manualCouponSection}>
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.couponInput}
//               placeholder="Enter Coupon Code"
//               placeholderTextColor="#999"
//               value={couponCode}
//               onChangeText={setCouponCode}
//               autoCapitalize="characters"
//               editable={!manualApplying && !applyingCoupon}
//             />
//             <TouchableOpacity
//               style={[
//                 styles.manualApplyButton,
//                 (manualApplying || applyingCoupon) && styles.disabledManualButton
//               ]}
//               onPress={handleManualApply}
//               disabled={!!(manualApplying || applyingCoupon)}
//               activeOpacity={0.7}
//             >
//               {manualApplying ? (
//                 <ActivityIndicator size="small" color="#666" />
//               ) : (
//                 <Text style={styles.manualApplyText} allowFontScaling={false} adjustsFontSizeToFit>APPLY</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View style={styles.moreOffersSection}>
//           <Text style={styles.sectionTitle} allowFontScaling={false} adjustsFontSizeToFit>More offers</Text>
//           {loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#F2D377" />
//               <Text style={styles.loadingText} allowFontScaling={false} adjustsFontSizeToFit>Loading coupons...</Text>
//             </View>
//           ) : coupons.length > 0 ? (
//             <FlatList
//               data={coupons}
//               renderItem={renderCouponItem}
//               keyExtractor={(item) => item.id?.toString() || item.code}
//               scrollEnabled={false}
//               showsVerticalScrollIndicator={false}
//             />
//           ) : (
//             <View style={styles.noCouponsContainer}>
//               <Text style={styles.noCouponsText} allowFontScaling={false} adjustsFontSizeToFit>No coupons available at the moment</Text>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // --- Stylesheet ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   content: {
//     flex: 1,
//   },
//   couponCard: {
//     backgroundColor: '#FFF7E8',
//     borderRadius: wp(2 * SCALE_CONSTANT),
//     padding: hp(1.6 * SCALE_CONSTANT),
//     marginBottom: hp(1.2 * SCALE_CONSTANT),
//     borderLeftWidth: wp(1 * SCALE_CONSTANT),
//     borderLeftColor: '#F2D377',
//   },
//   couponCardDisabled: {
//     backgroundColor: "#F5F5F5",
//     opacity: 0.7,
//   },
//   couponCardApplied: {
//     backgroundColor: '#E6F4EA', 
//     borderLeftColor: '#4CAF50',
//     borderLeftWidth: wp(3 * SCALE_CONSTANT),
//   },
//   couponContent: {
//     flex: 1,
//   },
//   couponTitle: {
//     fontSize: RFValue(11.5 * SCALE_CONSTANT),
//     color: '#333',
//     marginBottom: hp(1 * SCALE_CONSTANT),
//     lineHeight: hp(2 * SCALE_CONSTANT),
//   },
//   textDisabled: {
//     color: "#999",
//   },
//   appliedText: {
//     color: '#0C5273',
//   },
//   couponCodeContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     justifyContent: 'space-between',
//     marginBottom: hp(1 * SCALE_CONSTANT),
//   },
//   couponCodeBox: {
//     borderWidth: 1,
//     borderColor: '#0C5273',
//     borderStyle: 'dashed',
//     paddingHorizontal: wp(2.2 * SCALE_CONSTANT),
//     paddingVertical: hp(0.7 * SCALE_CONSTANT),
//     borderRadius: wp(1.5 * SCALE_CONSTANT),
//     backgroundColor: 'white',
//     marginTop: hp(0.5 * SCALE_CONSTANT),
//   },
//   couponCode: {
//     fontSize: RFValue(12 * SCALE_CONSTANT),
//     fontWeight: '600',
//     color: '#0C5273',
//     letterSpacing: 0.5,
//   },
//   applyButton: {
//     backgroundColor: '#0C5273',
//     paddingHorizontal: wp(4 * SCALE_CONSTANT),
//     paddingVertical: hp(0.8 * SCALE_CONSTANT),
//     borderRadius: wp(1.5 * SCALE_CONSTANT),
//     minWidth: wp(19 * SCALE_CONSTANT),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   disabledButton: {
//     backgroundColor: '#BDBDBD',
//     opacity: 0.8,
//   },
//   appliedButton: {
//     backgroundColor: '#4CAF50',
//   },
//   applyButtonText: {
//     color: 'white',
//     fontSize: RFValue(10.5 * SCALE_CONSTANT),
//     fontWeight: '600',
//   },
//   couponCondition: {
//     fontSize: RFValue(10 * SCALE_CONSTANT),
//     color: '#666',
//     marginBottom: hp(0.5 * SCALE_CONSTANT),
//   },
//   couponExpiry: {
//     fontSize: RFValue(10 * SCALE_CONSTANT),
//     color: '#666',
//   },
//   eligibilityMsg: {
//     marginTop: hp(0.8 * SCALE_CONSTANT),
//     color: "#C62828",
//     fontSize: RFValue(10 * SCALE_CONSTANT),
//     fontWeight: "500",
//   },
//   buttonContainer: {
//     alignItems: 'center',
//   },
//   removeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: hp(0.8 * SCALE_CONSTANT),
//     paddingVertical: hp(0.25 * SCALE_CONSTANT),
//     paddingHorizontal: wp(2 * SCALE_CONSTANT),
//   },
//   removeButtonText: {
//     marginLeft: wp(1 * SCALE_CONSTANT),
//     color: '#666',
//     fontSize: RFValue(11 * SCALE_CONSTANT),
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     paddingVertical: hp(5 * SCALE_CONSTANT),
//   },
//   loadingText: {
//     marginTop: hp(1.5 * SCALE_CONSTANT),
//     fontSize: RFValue(12 * SCALE_CONSTANT),
//     color: '#666',
//   },
//   noCouponsContainer: {
//     alignItems: 'center',
//     paddingVertical: hp(5 * SCALE_CONSTANT),
//   },
//   noCouponsText: {
//     fontSize: RFValue(12.5 * SCALE_CONSTANT),
//     color: '#666',
//   },
//   manualCouponSection: {
//     backgroundColor: 'white',
//     padding: hp(1.5 * SCALE_CONSTANT),
//     marginBottom: hp(1 * SCALE_CONSTANT),
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: wp(2 * SCALE_CONSTANT),
//     backgroundColor: '#F9F9F9',
//   },
//   couponInput: {
//     flex: 1,
//     paddingHorizontal: wp(3 * SCALE_CONSTANT),
//     paddingVertical: Platform.OS === 'ios' ? hp(1.2 * SCALE_CONSTANT) : hp(1.1 * SCALE_CONSTANT),
//     fontSize: RFValue(12.5 * SCALE_CONSTANT),
//     color: '#333',
//   },
//   manualApplyButton: {
//     paddingHorizontal: wp(4 * SCALE_CONSTANT),
//     paddingVertical: hp(1.1 * SCALE_CONSTANT),
//     marginRight: wp(1.5 * SCALE_CONSTANT),
//   },
//   disabledManualButton: {
//     opacity: 0.5,
//   },
//   manualApplyText: {
//     fontSize: RFValue(11 * SCALE_CONSTANT),
//     fontWeight: '600',
//     color: '#666',
//   },
//   moreOffersSection: {
//     backgroundColor: 'white',
//     padding: hp(1.5 * SCALE_CONSTANT),
//   },
//   sectionTitle: {
//     fontSize: RFValue(14 * SCALE_CONSTANT),
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: hp(1.5 * SCALE_CONSTANT),
//   },
// });

// const headerStyles = StyleSheet.create({
//     header: {
//         paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || hp(4 * SCALE_CONSTANT) : hp(5 * SCALE_CONSTANT),
//         paddingHorizontal: wp(4 * SCALE_CONSTANT),
//         paddingBottom: hp(1 * SCALE_CONSTANT),
//         backgroundColor: "transparent",
//     },
//     headerContent: {
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//     },
//     iconButton: {
//         padding: wp(2 * SCALE_CONSTANT),
//     },
//     iconPlaceholder: {
//         width: wp(8 * SCALE_CONSTANT),
//         height: wp(8 * SCALE_CONSTANT),
//     },
//     title: {
//         flex: 1,
//         color: "#222",
//         fontSize: RFValue(13 * SCALE_CONSTANT),
//         fontWeight: "bold",
//         textAlign: "center",
//     },
// });

// export default CouponScreen;


































import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import CouponService from '../services/CouponService';
import { useCart } from '../context/CartContext';
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ✅ New Scale Constant: Change this value to scale the entire UI
const SCALE_CONSTANT = 1;

// --- Components ---
// ✅ CHANGE: Updated the Header component to match the Profile screen's header
// It now accepts 'insets' to handle the top status bar area correctly on all devices.
const GradientHeader = ({ title, onBack, insets }) => (
    <LinearGradient
      colors={["#F2D377", "#F5F5F5"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={headerStyles.gradient}
    >
      <View style={{ paddingTop: insets.top }}>
        <View style={headerStyles.headerContent}>
          <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
            <Ionicons name="chevron-back" size={RFValue(20 * SCALE_CONSTANT)} color="#222" />
          </TouchableOpacity>
          <Text style={headerStyles.title} allowFontScaling={false} adjustsFontSizeToFit>{title}</Text>
          <View style={headerStyles.iconPlaceholder} />
        </View>
      </View>
    </LinearGradient>
);

const CouponScreen = ({ navigation, route }) => {
  // ... All component logic remains the same ...
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(null);
  const [manualApplying, setManualApplying] = useState(false);

  const { cartTotal, applyCoupon, appliedCoupon, removeCoupon } = useCart();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const result = await CouponService.fetchActiveCoupons();
      if (result.success) {
        setCoupons(result.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (code) => {
    if (applyingCoupon || manualApplying) return;

    setApplyingCoupon(code);
    try {
      const result = await CouponService.applyCoupon(code, cartTotal);

      if (result.success && result.valid) {
        const couponData = coupons.find(coupon => coupon.code === code);
        applyCoupon({
          code: code,
          discount: result.discountAmount,
          message: result.message,
          minOrderValue: couponData?.minOrderValue || 0
        });
        navigation.goBack();
      }
    } catch (error) {
    } finally {
      setApplyingCoupon(null);
    }
  };

  const handleManualApply = async () => {
    if (manualApplying || applyingCoupon) return;

    if (couponCode.trim()) {
      setManualApplying(true);
      try {
        const code = couponCode.trim().toUpperCase();
        const result = await CouponService.applyCoupon(code, cartTotal);

        if (result.success && result.valid) {
          const couponData = coupons.find(coupon => coupon.code === code);
          applyCoupon({
            code: code,
            discount: result.discountAmount,
            message: result.message,
            minOrderValue: couponData?.minOrderValue || result.minOrderValue || 0
          });
          navigation.goBack();
        }
      } catch (error) {
      } finally {
        setManualApplying(false);
      }
    }
  };
  
  const handleRemoveCoupon = () => {
    if (removeCoupon) {
      removeCoupon();
    }
  };

  const renderCouponItem = ({ item }) => {
    const isApplying = applyingCoupon === item.code;
    const minOrderValue = item.minOrderValue || 0;
    const isEligible = cartTotal >= minOrderValue;
    const diff = Math.max(minOrderValue - cartTotal, 0);
    const isApplied = appliedCoupon && appliedCoupon.code === item.code;
    const isDisabled = !isEligible || isApplying || manualApplying;

    return (
      <View style={[styles.couponCard, !isEligible && styles.couponCardDisabled, isApplied && styles.couponCardApplied]}>
        <View style={styles.couponContent}>
          <Text style={[styles.couponTitle, !isEligible && styles.textDisabled, isApplied && styles.appliedText]} allowFontScaling={false} >
            {item.description}
            {item.maxDiscount ? ` upto ₹${item.maxDiscount}` : ""}
          </Text>
          <View style={styles.couponCodeContainer}>
            <View style={[styles.couponCodeBox, isApplied && styles.appliedCouponCodeBox]}>
              <Text style={[styles.couponCode, !isEligible && styles.textDisabled, isApplied && styles.appliedText]} allowFontScaling={false} adjustsFontSizeToFit>
                {item.code}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  isApplied ? styles.appliedButton : isDisabled ? styles.disabledButton : null
                ]}
                onPress={() => handleApplyCoupon(item.code)}
                disabled={isDisabled || isApplied}
                activeOpacity={0.7}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.applyButtonText} allowFontScaling={false} adjustsFontSizeToFit>
                    {isApplied ? 'APPLIED' : 'APPLY'}
                  </Text>
                )}
              </TouchableOpacity>

              {isApplied && (
                <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeButton}>
                  <Icon name="delete" size={RFValue(16 * SCALE_CONSTANT)} color="#888" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {minOrderValue > 0 && (
            <Text style={[styles.couponCondition, !isEligible && styles.textDisabled, isApplied && styles.appliedText]} allowFontScaling={false} adjustsFontSizeToFit>
              Min order value: ₹{minOrderValue}
            </Text>
          )}
          {item.expiryDate && (
            <Text style={[styles.couponExpiry, isApplied && styles.appliedText]} allowFontScaling={false} adjustsFontSizeToFit>
              Valid till: {new Date(item.expiryDate).toLocaleDateString()}
            </Text>
          )}
          {!isEligible && minOrderValue > 0 && (
            <Text style={styles.eligibilityMsg} allowFontScaling={false} adjustsFontSizeToFit>
              Add items worth ₹{diff} to apply this coupon.
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    // ✅ CHANGE: Switched to a regular View since the new header handles the safe area
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <GradientHeader
        title="Apply Coupon"
        onBack={() => navigation.goBack()}
        // ✅ CHANGE: Passed the 'insets' prop to the new header
        insets={insets}
      />
      {/* ✅ CHANGE: Wrapped the content in a SafeAreaView to avoid the bottom navigation/home bar */}
      <SafeAreaView style={{ flex: 1, marginBottom: insets.bottom > 0 ? 0 : 10 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.manualCouponSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Coupon Code"
                placeholderTextColor="#999"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                editable={!manualApplying && !applyingCoupon}
              />
              <TouchableOpacity
                style={[
                  styles.manualApplyButton,
                  (manualApplying || applyingCoupon) && styles.disabledManualButton
                ]}
                onPress={handleManualApply}
                disabled={!!(manualApplying || applyingCoupon)}
                activeOpacity={0.7}
              >
                {manualApplying ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <Text style={styles.manualApplyText} allowFontScaling={false} adjustsFontSizeToFit>APPLY</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.moreOffersSection}>
            <Text style={styles.sectionTitle} allowFontScaling={false} adjustsFontSizeToFit>More offers</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F2D377" />
                <Text style={styles.loadingText} allowFontScaling={false} adjustsFontSizeToFit>Loading coupons...</Text>
              </View>
            ) : coupons.length > 0 ? (
              <FlatList
                data={coupons}
                renderItem={renderCouponItem}
                keyExtractor={(item) => item.id?.toString() || item.code}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noCouponsContainer}>
                <Text style={styles.noCouponsText} allowFontScaling={false} adjustsFontSizeToFit>No coupons available at the moment</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// --- Stylesheet ---
// This 'styles' object is completely unchanged.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  couponCard: {
    backgroundColor: '#FFF7E8',
    borderRadius: wp(2 * SCALE_CONSTANT),
    padding: hp(1.6 * SCALE_CONSTANT),
    marginBottom: hp(1.2 * SCALE_CONSTANT),
    borderLeftWidth: wp(1 * SCALE_CONSTANT),
    borderLeftColor: '#F2D377',
  },
  couponCardDisabled: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
  },
  couponCardApplied: {
    backgroundColor: '#E6F4EA', 
    borderLeftColor: '#4CAF50',
    borderLeftWidth: wp(3 * SCALE_CONSTANT),
  },
  couponContent: {
    flex: 1,
  },
  couponTitle: {
    fontSize: RFValue(11.5 * SCALE_CONSTANT),
    color: '#333',
    marginBottom: hp(1 * SCALE_CONSTANT),
    lineHeight: hp(2 * SCALE_CONSTANT),
  },
  textDisabled: {
    color: "#999",
  },
  appliedText: {
    color: '#0C5273',
  },
  couponCodeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: hp(1 * SCALE_CONSTANT),
  },
  couponCodeBox: {
    borderWidth: 1,
    borderColor: '#0C5273',
    borderStyle: 'dashed',
    paddingHorizontal: wp(2.2 * SCALE_CONSTANT),
    paddingVertical: hp(0.7 * SCALE_CONSTANT),
    borderRadius: wp(1.5 * SCALE_CONSTANT),
    backgroundColor: 'white',
    marginTop: hp(0.5 * SCALE_CONSTANT),
  },
  couponCode: {
    fontSize: RFValue(12 * SCALE_CONSTANT),
    fontWeight: '600',
    color: '#0C5273',
    letterSpacing: 0.5,
  },
  applyButton: {
    backgroundColor: '#0C5273',
    paddingHorizontal: wp(4 * SCALE_CONSTANT),
    paddingVertical: hp(0.8 * SCALE_CONSTANT),
    borderRadius: wp(1.5 * SCALE_CONSTANT),
    minWidth: wp(19 * SCALE_CONSTANT),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    opacity: 0.8,
  },
  appliedButton: {
    backgroundColor: '#4CAF50',
  },
  applyButtonText: {
    color: 'white',
    fontSize: RFValue(10.5 * SCALE_CONSTANT),
    fontWeight: '600',
  },
  couponCondition: {
    fontSize: RFValue(10 * SCALE_CONSTANT),
    color: '#666',
    marginBottom: hp(0.5 * SCALE_CONSTANT),
  },
  couponExpiry: {
    fontSize: RFValue(10 * SCALE_CONSTANT),
    color: '#666',
  },
  eligibilityMsg: {
    marginTop: hp(0.8 * SCALE_CONSTANT),
    color: "#C62828",
    fontSize: RFValue(10 * SCALE_CONSTANT),
    fontWeight: "500",
  },
  buttonContainer: {
    alignItems: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.8 * SCALE_CONSTANT),
    paddingVertical: hp(0.25 * SCALE_CONSTANT),
    paddingHorizontal: wp(2 * SCALE_CONSTANT),
  },
  removeButtonText: {
    marginLeft: wp(1 * SCALE_CONSTANT),
    color: '#666',
    fontSize: RFValue(11 * SCALE_CONSTANT),
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: hp(5 * SCALE_CONSTANT),
  },
  loadingText: {
    marginTop: hp(1.5 * SCALE_CONSTANT),
    fontSize: RFValue(12 * SCALE_CONSTANT),
    color: '#666',
  },
  noCouponsContainer: {
    alignItems: 'center',
    paddingVertical: hp(5 * SCALE_CONSTANT),
  },
  noCouponsText: {
    fontSize: RFValue(12.5 * SCALE_CONSTANT),
    color: '#666',
  },
  manualCouponSection: {
    backgroundColor: 'white',
    padding: hp(1.5 * SCALE_CONSTANT),
    marginBottom: hp(1 * SCALE_CONSTANT),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp(2 * SCALE_CONSTANT),
    backgroundColor: '#F9F9F9',
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: wp(3 * SCALE_CONSTANT),
    paddingVertical: Platform.OS === 'ios' ? hp(1.2 * SCALE_CONSTANT) : hp(1.1 * SCALE_CONSTANT),
    fontSize: RFValue(12.5 * SCALE_CONSTANT),
    color: '#333',
  },
  manualApplyButton: {
    paddingHorizontal: wp(4 * SCALE_CONSTANT),
    paddingVertical: hp(1.1 * SCALE_CONSTANT),
    marginRight: wp(1.5 * SCALE_CONSTANT),
  },
  disabledManualButton: {
    opacity: 0.5,
  },
  manualApplyText: {
    fontSize: RFValue(11 * SCALE_CONSTANT),
    fontWeight: '600',
    color: '#666',
  },
  moreOffersSection: {
    backgroundColor: 'white',
    padding: hp(1.5 * SCALE_CONSTANT),
  },
  sectionTitle: {
    fontSize: RFValue(14 * SCALE_CONSTANT),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(1.5 * SCALE_CONSTANT),
  },
});

// ✅ CHANGE: Replaced the old header styles with the new, more robust ones.
const headerStyles = StyleSheet.create({
  gradient: {
    paddingBottom: hp("2.5%"),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("4%"),
  },
  iconButton: {
    padding: wp("2%"),
  },
  iconPlaceholder: {
    width: wp("10%"),
    height: hp("4%"),
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontWeight: "bold",
    fontSize: RFValue(14 * SCALE_CONSTANT),
    color: "#000",
    textAlign: "center",
  },
});

export default CouponScreen;











