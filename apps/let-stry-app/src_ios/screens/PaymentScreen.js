
// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Linking,
//   Image
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useCart } from "../context/CartContext";
// import { makeUpiPayment, initiateUpiIntent } from '../services/PaymentService';
// import { useRoute } from '@react-navigation/native';
// import { placeOrder } from "../services/OrderService";
// import { useAuth } from "../context/AuthContext";
// import { useAddress } from '../context/AddressContext';

// export default function PaymentScreen({ navigation }) {
//   const route = useRoute();

//   const [expandedOption, setExpandedOption] = useState(null);
//   const [showNewUPI, setShowNewUPI] = useState(false);
//   const [newUPIID, setNewUPIID] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isIntentLoading, setIntentIsLoading] = useState(false);
//   const [currentIntentApp, setCurrentIntentApp] = useState(null);
//   const [availableApps, setAvailableApps] = useState({ gpay: false, phonepe: false, paytm: false });
//   const [orderId, setOrderId] = useState(null);

//   const insets = useSafeAreaInsets();
//   const { calculateGrandTotal, appliedCoupon } = useCart();
//   const { selectedAddress } = useAddress();
//   const { idToken } = useAuth();

//   const formatAddress = (address) => {
//     const { addressId, ...rest } = address;
//     return Object.values(rest)
//       .filter(value => value !== null && value !== undefined && value !== '')
//       .join(', ');
//   };

//   const formattedAddress = formatAddress(selectedAddress);

//   React.useEffect(() => {
//     const checkInstalledApps = async () => {
//       const schemes = {
//         gpay: 'upi://pay',
//         phonepe: 'phonepe://',
//         paytm: 'paytmmp://',
//       };
//       try {
//         const gpaySupported = await Linking.canOpenURL(schemes.gpay);
//         const phonepeSupported = await Linking.canOpenURL(schemes.phonepe);
//         const paytmSupported = await Linking.canOpenURL(schemes.paytm);
//         setAvailableApps({ gpay: gpaySupported, phonepe: phonepeSupported, paytm: paytmSupported });
//       } catch (error) {
//         console.error("Error checking for installed apps:", error);
//       }
//     };

//     checkInstalledApps();
//   }, []);

//   const handleExpand = (option) => {
//     setExpandedOption(expandedOption === option ? null : option);
//   };

//   const handleUpiSubmit = async () => {
//     if (!newUPIID.trim() || !newUPIID.includes('@')) {
//       console.log('Invalid UPI ID: Please enter a valid UPI ID (e.g., yourname@bank).');
//       return;
//     }
//     setIsLoading(true);

//     try {
//       const orderData = { addressId: selectedAddress?.addressId, promoCode: appliedCoupon?.code || null };
//       console.log("[UPI INTENT] Sending orderData to API:", orderData);
//       const response = await placeOrder(orderData, idToken);

//       const frontendTotal = calculateGrandTotal();
//       const backendTotal = response.totalAmount;

//       // if (Number(frontendTotal) !== Number(backendTotal)) {
//       //   throw new Error('Price mismatch detected.');
//       // }

//       const currentOrderId = response.orderId;
//       setOrderId(currentOrderId);

//       const upiData = {
//         orderId: currentOrderId,
//         amount: calculateGrandTotal().toString(),
//         email: "tech@letstryfoods.com",
//         vpa: newUPIID.trim(),
//       };

//       const result = await makeUpiPayment(upiData, idToken);
//       if (result.doRedirect === true) {
//         navigation.navigate('UpiLoadingScreen', {
//           orderId: currentOrderId,
//           token: result.bankPostData?.token,
//           upiTxnRefNo: result.bankPostData?.upiTxnRefNo,
//           timeout: result.bankPostData?.timeout,
//         });
//       } else {
//         console.error('Payment failed:', result);
//       }
//     } catch (error) {
//       console.error('Failed to make UPI payment:', error);
//       if (!error.message.includes('Price mismatch')) {
//         console.error('An unexpected error occurred:', error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpiIntentPayment = async (appIdentifier) => {
//     setIntentIsLoading(true);
//     setCurrentIntentApp(appIdentifier);

//     try {
//       console.log(appliedCoupon);
//       const orderData = { addressId: selectedAddress?.addressId, promoCode: appliedCoupon?.code || null };
//       console.log("[UPI INTENT] Sending orderData to API:", orderData);
//       const response = await placeOrder(orderData, idToken);

//       const frontendTotal = calculateGrandTotal();
//       const backendTotal = response.totalAmount;
//       console.log("Frontend Total:", frontendTotal, "Backend Total:", backendTotal);
//       // if (Number(frontendTotal) !== Number(backendTotal)) {
//       //   throw new Error('Price mismatch detected.');
//       // }

//       const currentOrderId = response.orderId;
//       setOrderId(currentOrderId);

//       const intentData = {
//         orderId: currentOrderId,
//         amount: calculateGrandTotal().toString(),
//         email: "tech@letstryfoods.com",
//       };

//       const result = await initiateUpiIntent(intentData, idToken);
//       if (result.responseCode === "208" && result.bankPostData) {
//         let upiUrl;
//         switch (appIdentifier) {
//           case 'gpay':
//             upiUrl = result.bankPostData.gpayIntentIosUrl;
//             break;
//           case 'phonepe':
//             upiUrl = result.bankPostData.phonepeIntentIosUrl;
//             break;
//           case 'paytm':
//             upiUrl = result.bankPostData.paytmIntentIosUrl;
//             break;
//           default:
//             upiUrl = result.bankPostData.androidIntentUrl;
//         }

//         if (!upiUrl) {
//           console.log(`The payment gateway did not provide a URL for ${appIdentifier}.`);
//           return;
//         }
//         const supported = await Linking.canOpenURL(upiUrl);
//         if (supported) {
//           await Linking.openURL(upiUrl);
//           navigation.navigate('UpiLoadingScreen', {
//             orderId: currentOrderId,
//             upiTxnRefNo: result.bankPostData?.upiTxnRefNo,
//             timeout: result.bankPostData?.timeout,
//             token: result.bankPostData?.token,
//           });
//         } else {
//           console.log(`It seems ${appIdentifier} is not installed on your device.`);
//         }
//       } else {
//         console.log('Payment Failed:', result.responseDescription || 'Could not initiate UPI payment.');
//       }
//     } catch (error) {
//       console.error('Failed to handle UPI Intent payment:', error);
//       if (!error.message.includes('Price mismatch')) {
//         console.log('An Error Occurred:', error.message || 'An unexpected error occurred.');
//       }
//     } finally {
//       setIntentIsLoading(false);
//       setCurrentIntentApp(null);
//     }
//   };

//   return (
//     <ScrollView
//       style={[styles.container, { marginBottom: insets.bottom }]}
//       keyboardShouldPersistTaps="handled"
//     >
//       <View style={[styles.headerRow, { paddingTop: insets.top }]}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-left" size={24} color="#222" />
//         </TouchableOpacity>
//         <View style={{ flex: 1, alignItems: 'center' }}>
//           <Text style={styles.header} allowFontScaling={false} adjustsFontSizeToFit={true}>
//             Payment Method
//           </Text>
//           <Text style={styles.total} allowFontScaling={false} adjustsFontSizeToFit={true}>
//             Total: ₹ {calculateGrandTotal()}
//           </Text>
//         </View>
//         <View style={{ width: 24 }} />
//       </View>

//       <Text style={styles.sectionTitleOutside} allowFontScaling={false} adjustsFontSizeToFit={true}>
//         Pay by any UPI App
//       </Text>
//       <View style={styles.cardSection}>
//         {availableApps.paytm && (
//           <>
//             <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('paytm')}>
//               <Image source={require('../assets/paymentLogo/paytm.png')} style={styles.radioIcon} />
//               <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Paytm UPI </Text>
//               <View style={styles.radioOuter}>
//                 {expandedOption === 'paytm' && <View style={styles.radioInner} />}
//               </View>
//             </TouchableOpacity>
//             {expandedOption === 'paytm' && (
//               <View style={styles.expandContent}>
//                 <TouchableOpacity
//                   style={[styles.payButton, isIntentLoading && styles.disabledButton]}
//                   onPress={() => handleUpiIntentPayment('paytm')}
//                   disabled={isIntentLoading}
//                 >
//                   {isIntentLoading && currentIntentApp === 'paytm'
//                     ? <ActivityIndicator color="#fff" />
//                     : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA PAYTM</Text>
//                   }
//                 </TouchableOpacity>
//               </View>
//             )}
//           </>
//         )}

//         {availableApps.gpay && (
//           <>
//             <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('gpay')}>
//               <Image source={require('../assets/paymentLogo/googlepay.png')} style={styles.radioIcon} />
//               <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Google Pay</Text>
//               <View style={styles.radioOuter}>
//                 {expandedOption === 'gpay' && <View style={styles.radioInner} />}
//               </View>
//             </TouchableOpacity>
//             {expandedOption === 'gpay' && (
//               <View style={styles.expandContent}>
//                 <TouchableOpacity
//                   style={[styles.payButton, isIntentLoading && styles.disabledButton]}
//                   onPress={() => handleUpiIntentPayment('gpay')}
//                   disabled={isIntentLoading}
//                 >
//                   {isIntentLoading && currentIntentApp === 'gpay'
//                     ? <ActivityIndicator color="#fff" />
//                     : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA GOOGLEPAY</Text>
//                   }
//                 </TouchableOpacity>
//               </View>
//             )}
//           </>
//         )}

//         {availableApps.phonepe && (
//           <>
//             <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('phonepe')}>
//               <Image source={require('../assets/paymentLogo/phonepe.png')} style={styles.radioIcon} />
//               <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>PhonePe</Text>
//               <View style={styles.radioOuter}>
//                 {expandedOption === 'phonepe' && <View style={styles.radioInner} />}
//               </View>
//             </TouchableOpacity>
//             {expandedOption === 'phonepe' && (
//               <View style={styles.expandContent}>
//                 <TouchableOpacity
//                   style={[styles.payButton, isIntentLoading && styles.disabledButton]}
//                   onPress={() => handleUpiIntentPayment('phonepe')}
//                   disabled={isIntentLoading}
//                 >
//                   {isIntentLoading && currentIntentApp === 'phonepe'
//                     ? <ActivityIndicator color="#fff" />
//                     : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA PHONEPE</Text>
//                   }
//                 </TouchableOpacity>
//               </View>
//             )}
//           </>
//         )}

//         <TouchableOpacity style={styles.addNewRow} onPress={() => setShowNewUPI(!showNewUPI)}>
//           <Icon name="plus-circle-outline" size={22} color="#0C5273" style={styles.radioIcon} />
//           <View>
//             <Text style={styles.addNewLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Add UPI ID</Text>
//             <Text style={styles.subLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>You need to have a registered UPI ID</Text>
//           </View>
//         </TouchableOpacity>
//         {showNewUPI && (
//           <View style={styles.inputRow}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter UPI ID (e.g. yourname@bank)"
//               placeholderTextColor="#888"
//               value={newUPIID}
//               onChangeText={setNewUPIID}
//               autoCapitalize="none"
//               editable={!isLoading}
//             />
//             <TouchableOpacity
//               style={[styles.saveButton, (isLoading || !newUPIID.trim()) && styles.disabledButton]}
//               onPress={handleUpiSubmit}
//               disabled={isLoading || !newUPIID.trim()}
//             >
//               {isLoading
//                 ? <ActivityIndicator color="#fff" />
//                 : <Text style={styles.saveButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>VERIFY & PAY</Text>
//               }
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       <Text style={styles.sectionTitleOutside} allowFontScaling={false} adjustsFontSizeToFit={true}>
//         Credit & Debit cards
//       </Text>
//       <View style={styles.cardSection}>
//         <TouchableOpacity
//           style={styles.addNewRow}
//           onPress={() => navigation.navigate('CardScreen', {
//             addressId: selectedAddress?.addressId,
//             amount: calculateGrandTotal(),
//           })}
//         >
//           <Icon
//             name="credit-card-plus-outline"
//             size={22}
//             color="#0C5273"
//             style={styles.radioIcon}
//           />
//           <View>
//             <Text style={styles.addNewLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>
//               Pay via card
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F7F7F7' },
//   headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 18, paddingBottom: 10, paddingHorizontal: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
//   header: { fontSize: 18, fontWeight: 'bold', color: '#222' },
//   total: { fontSize: 13, color: '#888', marginTop: 2 },
//   sectionTitleOutside: { fontWeight: 'bold', fontSize: 16, marginLeft: 24, marginTop: 24, marginBottom: 8, color: '#222' },
//   cardSection: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
//   radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2, borderRadius: 8, marginBottom: 2 },
//   radioIcon: {
//     width: 24,
//     height: 24,
//     marginRight: 12,
//     resizeMode: 'contain',
//   },
//   radioLabel: { flex: 1, fontSize: 15, color: '#222' },
//   radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#0C5273', alignItems: 'center', justifyContent: 'center' },
//   radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0C5273' },
//   payButton: { marginTop: 14, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#0C5273' },
//   payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
//   addNewRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, marginBottom: 2 },
//   addNewLabel: { color: '#0C5273', fontSize: 15, fontWeight: 'bold' },
//   subLabel: { fontSize: 12, color: '#888', marginTop: 2 },
//   inputRow: { marginTop: 6, marginBottom: 4 },
//   input: { borderWidth: 1, borderColor: '#bdbdbd', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#f5f5f5', marginBottom: 10, color: '#333' },
//   saveButton: { backgroundColor: '#0C5273', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 2 },
//   saveButtonText: { color: '#fff', fontWeight: 'bold' },
//   disabledButton: { backgroundColor: '#A5C4D1' },
//   optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2, borderRadius: 8, marginBottom: 2 },
//   expandContent: { paddingVertical: 8, paddingHorizontal: 2 },
// });












// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Linking,
//   Image
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useCart } from "../context/CartContext";
// import { makeUpiPayment, initiateUpiIntent } from '../services/PaymentService';
// import { useRoute } from '@react-navigation/native';
// import { placeOrder } from "../services/OrderService";
// import { useAuth } from "../context/AuthContext";
// import { useAddress } from '../context/AddressContext';

// export default function PaymentScreen({ navigation }) {
//   const route = useRoute();

//   const [expandedOption, setExpandedOption] = useState(null);
//   const [showNewUPI, setShowNewUPI] = useState(false);
//   const [newUPIID, setNewUPIID] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isIntentLoading, setIntentIsLoading] = useState(false);
//   const [currentIntentApp, setCurrentIntentApp] = useState(null);
//   const [availableApps, setAvailableApps] = useState({ gpay: false, phonepe: false, paytm: false });
//   const [orderId, setOrderId] = useState(null);

//   const insets = useSafeAreaInsets();
  
//   // --- ✅ YAHAN SAARA CART DATA FETCH KIYA ---
//   const { 
//     cartItems,
//     cartTotal,
//     appliedCoupon, 
//     getGstAmount, 
//     calculateDeliveryCharge,
//     calculateHandlingCharge,
//     getEffectivePrice,
//     calculateGrandTotal
//   } = useCart();
  
//   const { selectedAddress } = useAddress();
//   const { idToken } = useAuth();

//   const formatAddress = (address) => {
//     const { addressId, ...rest } = address;
//     return Object.values(rest)
//       .filter(value => value !== null && value !== undefined && value !== '')
//       .join(', ');
//   };

//   const formattedAddress = formatAddress(selectedAddress);

//   React.useEffect(() => {
//     const checkInstalledApps = async () => {
//       const schemes = {
//         gpay: 'upi://pay',
//         phonepe: 'phonepe://',
//         paytm: 'paytmmp://',
//       };
//       try {
//         const gpaySupported = await Linking.canOpenURL(schemes.gpay);
//         const phonepeSupported = await Linking.canOpenURL(schemes.phonepe);
//         const paytmSupported = await Linking.canOpenURL(schemes.paytm);
//         setAvailableApps({ gpay: gpaySupported, phonepe: phonepeSupported, paytm: paytmSupported });
//       } catch (error) {
//         console.error("Error checking for installed apps:", error);
//       }
//     };

//     checkInstalledApps();
//   }, []);

//   const handleExpand = (option) => {
//     setExpandedOption(expandedOption === option ? null : option);
//   };
  
//   // --- ✅ YEH HELPER FUNCTION BANAYA ---
//   // Yeh function purchase ki saari details collect karta hai
//   const createPurchaseData = (orderId) => {
//     return {
//       transaction_id: orderId,
//       value: calculateGrandTotal(),
//       currency: 'INR',
//       tax: getGstAmount(),
//       shipping: calculateDeliveryCharge() + calculateHandlingCharge(), // Shipping + Handling
//       coupon: appliedCoupon ? appliedCoupon.code : undefined,
//       items: cartItems.map(item => ({
//         item_id: item.id,
//         item_name: item.name,
//         item_category: item.category && item.category.length > 0 ? item.category[0] : 'N/A',
//         price: getEffectivePrice(item),
//         quantity: item.quantity
//       }))
//     };
//   };
//   // --- END ---

//   const handleUpiSubmit = async () => {
//     if (!newUPIID.trim() || !newUPIID.includes('@')) {
//       console.log('Invalid UPI ID: Please enter a valid UPI ID (e.g., yourname@bank).');
//       return;
//     }
//     setIsLoading(true);

//     try {
//       const orderData = { addressId: selectedAddress?.addressId, promoCode: appliedCoupon?.code || null };
//       console.log("[UPI INTENT] Sending orderData to API:", orderData);
//       const response = await placeOrder(orderData, idToken);

//       const currentOrderId = response.orderId;
//       setOrderId(currentOrderId);

//       // --- ✅ PURCHASE DATA CREATE KIYA ---
//       const purchaseData = createPurchaseData(currentOrderId);

//       const upiData = {
//         orderId: currentOrderId,
//         amount: calculateGrandTotal().toString(),
//         email: "tech@letstryfoods.com",
//         vpa: newUPIID.trim(),
//       };

//       const result = await makeUpiPayment(upiData, idToken);
//       if (result.doRedirect === true) {
//         // --- ✅ PURCHASE DATA AAGE PASS KIYA ---
//         navigation.navigate('UpiLoadingScreen', {
//           orderId: currentOrderId,
//           token: result.bankPostData?.token,
//           upiTxnRefNo: result.bankPostData?.upiTxnRefNo,
//           timeout: result.bankPostData?.timeout,
//           purchaseData: purchaseData, // Yahan add kiya
//         });
//       } else {
//         console.error('Payment failed:', result);
//       }
//     } catch (error) {
//       console.error('Failed to make UPI payment:', error);
//       if (!error.message.includes('Price mismatch')) {
//         console.error('An unexpected error occurred:', error);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpiIntentPayment = async (appIdentifier) => {
//     setIntentIsLoading(true);
//     setCurrentIntentApp(appIdentifier);

//     try {
//       console.log(appliedCoupon);
//       const orderData = { addressId: selectedAddress?.addressId, promoCode: appliedCoupon?.code || null };
//       console.log("[UPI INTENT] Sending orderData to API:", orderData);
//       const response = await placeOrder(orderData, idToken);

//       const currentOrderId = response.orderId;
//       setOrderId(currentOrderId);
      
//       // --- ✅ PURCHASE DATA CREATE KIYA ---
//       const purchaseData = createPurchaseData(currentOrderId);

//       const intentData = {
//         orderId: currentOrderId,
//         amount: calculateGrandTotal().toString(),
//         email: "tech@letstryfoods.com",
//       };

//       const result = await initiateUpiIntent(intentData, idToken);
//       if (result.responseCode === "208" && result.bankPostData) {
//         let upiUrl;
//         switch (appIdentifier) {
//           case 'gpay':
//             upiUrl = result.bankPostData.gpayIntentIosUrl;
//             break;
//           case 'phonepe':
//             upiUrl = result.bankPostData.phonepeIntentIosUrl;
//             break;
//           case 'paytm':
//             upiUrl = result.bankPostData.paytmIntentIosUrl;
//             break;
//           default:
//             upiUrl = result.bankPostData.androidIntentUrl;
//         }

//         if (!upiUrl) {
//           console.log(`The payment gateway did not provide a URL for ${appIdentifier}.`);
//           return;
//         }
//         const supported = await Linking.canOpenURL(upiUrl);
//         if (supported) {
//           await Linking.openURL(upiUrl);
//           // --- ✅ PURCHASE DATA AAGE PASS KIYA ---
//           navigation.navigate('UpiLoadingScreen', {
//             orderId: currentOrderId,
//             upiTxnRefNo: result.bankPostData?.upiTxnRefNo,
//             timeout: result.bankPostData?.timeout,
//             token: result.bankPostData?.token,
//             purchaseData: purchaseData, // Yahan add kiya
//           });
//         } else {
//           console.log(`It seems ${appIdentifier} is not installed on your device.`);
//         }
//       } else {
//         console.log('Payment Failed:', result.responseDescription || 'Could not initiate UPI payment.');
//       }
//     } catch (error) {
//       console.error('Failed to handle UPI Intent payment:', error);
//       if (!error.message.includes('Price mismatch')) {
//         console.log('An Error Occurred:', error.message || 'An unexpected error occurred.');
//       }
//     } finally {
//       setIntentIsLoading(false);
//       setCurrentIntentApp(null);
//     }
//   };

//   return (
//     <ScrollView
//       style={[styles.container, { marginBottom: insets.bottom }]}
//       keyboardShouldPersistTaps="handled"
//     >
//       <View style={[styles.headerRow, { paddingTop: insets.top }]}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-left" size={24} color="#222" />
//         </TouchableOpacity>
//         <View style={{ flex: 1, alignItems: 'center' }}>
//           <Text style={styles.header} allowFontScaling={false} adjustsFontSizeToFit={true}>
//             Payment Method
//           </Text>
//           <Text style={styles.total} allowFontScaling={false} adjustsFontSizeToFit={true}>
//             Total: ₹ {calculateGrandTotal()}
//           </Text>
//         </View>
//         <View style={{ width: 24 }} />
//       </View>

//       <Text style={styles.sectionTitleOutside} allowFontScaling={false} adjustsFontSizeToFit={true}>
//         Pay by any UPI App
//       </Text>
//       <View style={styles.cardSection}>
//         {availableApps.paytm && (
//           <>
//             <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('paytm')}>
//               <Image source={require('../assets/paymentLogo/paytm.png')} style={styles.radioIcon} />
//               <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Paytm UPI </Text>
//               <View style={styles.radioOuter}>
//                 {expandedOption === 'paytm' && <View style={styles.radioInner} />}
//               </View>
//             </TouchableOpacity>
//             {expandedOption === 'paytm' && (
//               <View style={styles.expandContent}>
//                 <TouchableOpacity
//                   style={[styles.payButton, isIntentLoading && styles.disabledButton]}
//                   onPress={() => handleUpiIntentPayment('paytm')}
//                   disabled={isIntentLoading}
//                 >
//                   {isIntentLoading && currentIntentApp === 'paytm'
//                     ? <ActivityIndicator color="#fff" />
//                     : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA PAYTM</Text>
//                   }
//                 </TouchableOpacity>
//               </View>
//             )}
//           </>
//         )}

//         {availableApps.gpay && (
//           <>
//             <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('gpay')}>
//               <Image source={require('../assets/paymentLogo/googlepay.png')} style={styles.radioIcon} />
//               <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Google Pay</Text>
//               <View style={styles.radioOuter}>
//                 {expandedOption === 'gpay' && <View style={styles.radioInner} />}
//               </View>
//             </TouchableOpacity>
//             {expandedOption === 'gpay' && (
//               <View style={styles.expandContent}>
//                 <TouchableOpacity
//                   style={[styles.payButton, isIntentLoading && styles.disabledButton]}
//                   onPress={() => handleUpiIntentPayment('gpay')}
//                   disabled={isIntentLoading}
//                 >
//                   {isIntentLoading && currentIntentApp === 'gpay'
//                     ? <ActivityIndicator color="#fff" />
//                     : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA GOOGLEPAY</Text>
//                   }
//                 </TouchableOpacity>
//               </View>
//             )}
//           </>
//         )}

//         {availableApps.phonepe && (
//           <>
//             <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('phonepe')}>
//               <Image source={require('../assets/paymentLogo/phonepe.png')} style={styles.radioIcon} />
//               <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>PhonePe</Text>
//               <View style={styles.radioOuter}>
//                 {expandedOption === 'phonepe' && <View style={styles.radioInner} />}
//               </View>
//             </TouchableOpacity>
//             {expandedOption === 'phonepe' && (
//               <View style={styles.expandContent}>
//                 <TouchableOpacity
//                   style={[styles.payButton, isIntentLoading && styles.disabledButton]}
//                   onPress={() => handleUpiIntentPayment('phonepe')}
//                   disabled={isIntentLoading}
//                 >
//                   {isIntentLoading && currentIntentApp === 'phonepe'
//                     ? <ActivityIndicator color="#fff" />
//                     : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA PHONEPE</Text>
//                   }
//                 </TouchableOpacity>
//               </View>
//             )}
//           </>
//         )}

//         <TouchableOpacity style={styles.addNewRow} onPress={() => setShowNewUPI(!showNewUPI)}>
//           <Icon name="plus-circle-outline" size={22} color="#0C5273" style={styles.radioIcon} />
//           <View>
//             <Text style={styles.addNewLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Add UPI ID</Text>
//             <Text style={styles.subLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>You need to have a registered UPI ID</Text>
//           </View>
//         </TouchableOpacity>
//         {showNewUPI && (
//           <View style={styles.inputRow}>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter UPI ID (e.g. yourname@bank)"
//               placeholderTextColor="#888"
//               value={newUPIID}
//               onChangeText={setNewUPIID}
//               autoCapitalize="none"
//               editable={!isLoading}
//             />
//             <TouchableOpacity
//               style={[styles.saveButton, (isLoading || !newUPIID.trim()) && styles.disabledButton]}
//               onPress={handleUpiSubmit}
//               disabled={isLoading || !newUPIID.trim()}
//             >
//               {isLoading
//                 ? <ActivityIndicator color="#fff" />
//                 : <Text style={styles.saveButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>VERIFY & PAY</Text>
//               }
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       <Text style={styles.sectionTitleOutside} allowFontScaling={false} adjustsFontSizeToFit={true}>
//         Credit & Debit cards
//       </Text>
//       <View style={styles.cardSection}>
//         <TouchableOpacity
//           style={styles.addNewRow}
//           onPress={() => navigation.navigate('CardScreen', {
//             addressId: selectedAddress?.addressId,
//             amount: calculateGrandTotal(),
//           })}
//         >
//           <Icon
//             name="credit-card-plus-outline"
//             size={22}
//             color="#0C5273"
//             style={styles.radioIcon}
//           />
//           <View>
//             <Text style={styles.addNewLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>
//               Pay via card
//             </Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F7F7F7' },
//   headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 18, paddingBottom: 10, paddingHorizontal: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
//   header: { fontSize: 18, fontWeight: 'bold', color: '#222' },
//   total: { fontSize: 13, color: '#888', marginTop: 2 },
//   sectionTitleOutside: { fontWeight: 'bold', fontSize: 16, marginLeft: 24, marginTop: 24, marginBottom: 8, color: '#222' },
//   cardSection: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
//   radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2, borderRadius: 8, marginBottom: 2 },
//   radioIcon: {
//     width: 24,
//     height: 24,
//     marginRight: 12,
//     resizeMode: 'contain',
//   },
//   radioLabel: { flex: 1, fontSize: 15, color: '#222' },
//   radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#0C5273', alignItems: 'center', justifyContent: 'center' },
//   radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0C5273' },
//   payButton: { marginTop: 14, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#0C5273' },
//   payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
//   addNewRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, marginBottom: 2 },
//   addNewLabel: { color: '#0C5273', fontSize: 15, fontWeight: 'bold' },
//   subLabel: { fontSize: 12, color: '#888', marginTop: 2 },
//   inputRow: { marginTop: 6, marginBottom: 4 },
//   input: { borderWidth: 1, borderColor: '#bdbdbd', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#f5f5f5', marginBottom: 10, color: '#333' },
//   saveButton: { backgroundColor: '#0C5273', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 2 },
//   saveButtonText: { color: '#fff', fontWeight: 'bold' },
//   disabledButton: { backgroundColor: '#A5C4D1' },
//   optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2, borderRadius: 8, marginBottom: 2 },
//   expandContent: { paddingVertical: 8, paddingHorizontal: 2 },
// });








import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from "../context/CartContext";
import { makeUpiPayment, initiateUpiIntent } from '../services/PaymentService';
import { useRoute } from '@react-navigation/native';
import { placeOrder } from "../services/OrderService";
import { useAuth } from "../context/AuthContext";
import { useAddress } from '../context/AddressContext';

export default function PaymentScreen({ navigation }) {
  const route = useRoute();

  const [expandedOption, setExpandedOption] = useState(null);
  const [showNewUPI, setShowNewUPI] = useState(false);
  const [newUPIID, setNewUPIID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIntentLoading, setIntentIsLoading] = useState(false);
  const [currentIntentApp, setCurrentIntentApp] = useState(null);
  const [availableApps, setAvailableApps] = useState({ gpay: false, phonepe: false, paytm: false });
  const [orderId, setOrderId] = useState(null);

  const insets = useSafeAreaInsets();
  
  // --- ✅ YAHAN SAARA CART DATA FETCH KIYA ---
  const { 
    cartItems,
    cartTotal,
    appliedCoupon, 
    getGstAmount, 
    calculateDeliveryCharge,
    calculateHandlingCharge,
    getEffectivePrice,
    calculateGrandTotal
  } = useCart();
  
  const { selectedAddress } = useAddress();
  const { idToken } = useAuth();

  const formatAddress = (address) => {
    const { addressId, ...rest } = address;
    return Object.values(rest)
      .filter(value => value !== null && value !== undefined && value !== '')
      .join(', ');
  };

  const formattedAddress = formatAddress(selectedAddress);

  React.useEffect(() => {
    const checkInstalledApps = async () => {
      const schemes = {
        gpay: 'upi://pay',
        phonepe: 'phonepe://',
        paytm: 'paytmmp://',
      };
      try {
        const gpaySupported = await Linking.canOpenURL(schemes.gpay);
        const phonepeSupported = await Linking.canOpenURL(schemes.phonepe);
        const paytmSupported = await Linking.canOpenURL(schemes.paytm);
        setAvailableApps({ gpay: gpaySupported, phonepe: phonepeSupported, paytm: paytmSupported });
      } catch (error) {
        console.error("Error checking for installed apps:", error);
      }
    };

    checkInstalledApps();
  }, []);

  const handleExpand = (option) => {
    setExpandedOption(expandedOption === option ? null : option);
  };
  
  // --- ✅ YEH HELPER FUNCTION BANAYA ---
  // Yeh function purchase ki saari details collect karta hai
  const createPurchaseData = (orderId) => {
    return {
      transaction_id: orderId,
      value: calculateGrandTotal(),
      currency: 'INR',
      tax: getGstAmount(),
      shipping: calculateDeliveryCharge() + calculateHandlingCharge(), // Shipping + Handling
      coupon: appliedCoupon ? appliedCoupon.code : undefined,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category && item.category.length > 0 ? item.category[0] : 'N/A',
        price: getEffectivePrice(item),
        quantity: item.quantity
      }))
    };
  };
  // --- END ---

  const handleUpiSubmit = async () => {
    if (!newUPIID.trim() || !newUPIID.includes('@')) {
      console.log('Invalid UPI ID: Please enter a valid UPI ID (e.g., yourname@bank).');
      return;
    }
    setIsLoading(true);

    try {
      const orderData = { addressId: selectedAddress?.addressId, promoCode: appliedCoupon?.code || null };
      console.log("[UPI INTENT] Sending orderData to API:", orderData);
      const response = await placeOrder(orderData, idToken);

      const currentOrderId = response.orderId;
      setOrderId(currentOrderId);

      // --- ✅ PURCHASE DATA CREATE KIYA ---
      const purchaseData = createPurchaseData(currentOrderId);

      const upiData = {
        orderId: currentOrderId,
        amount: calculateGrandTotal().toFixed(2), // --- 💡 FIX APPLIED HERE ---
        email: "tech@letstryfoods.com",
        vpa: newUPIID.trim(),
      };

      const result = await makeUpiPayment(upiData, idToken);
      if (result.doRedirect === true) {
        // --- ✅ PURCHASE DATA AAGE PASS KIYA ---
        navigation.navigate('UpiLoadingScreen', {
          orderId: currentOrderId,
          token: result.bankPostData?.token,
          upiTxnRefNo: result.bankPostData?.upiTxnRefNo,
          timeout: result.bankPostData?.timeout,
          purchaseData: purchaseData, // Yahan add kiya
        });
      } else {
        console.error('Payment failed:', result);
      }
    } catch (error) {
      console.error('Failed to make UPI payment:', error);
      if (!error.message.includes('Price mismatch')) {
        console.error('An unexpected error occurred:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpiIntentPayment = async (appIdentifier) => {
    setIntentIsLoading(true);
    setCurrentIntentApp(appIdentifier);

    try {
      console.log(appliedCoupon);
      const orderData = { addressId: selectedAddress?.addressId, promoCode: appliedCoupon?.code || null };
      console.log("[UPI INTENT] Sending orderData to API:", orderData);
      const response = await placeOrder(orderData, idToken);

      const currentOrderId = response.orderId;
      setOrderId(currentOrderId);
      
      // --- ✅ PURCHASE DATA CREATE KIYA ---
      const purchaseData = createPurchaseData(currentOrderId);

      const intentData = {
        orderId: currentOrderId,
        amount: calculateGrandTotal().toFixed(2), // --- 💡 FIX APPLIED HERE ---
        email: "tech@letstryfoods.com",
      };

      const result = await initiateUpiIntent(intentData, idToken);
      if (result.responseCode === "208" && result.bankPostData) {
        let upiUrl;
        switch (appIdentifier) {
          case 'gpay':
            upiUrl = result.bankPostData.gpayIntentIosUrl;
            break;
          case 'phonepe':
            upiUrl = result.bankPostData.phonepeIntentIosUrl;
            break;
          case 'paytm':
            upiUrl = result.bankPostData.paytmIntentIosUrl;
            break;
          default:
            upiUrl = result.bankPostData.androidIntentUrl;
        }

        if (!upiUrl) {
          console.log(`The payment gateway did not provide a URL for ${appIdentifier}.`);
          return;
        }
        const supported = await Linking.canOpenURL(upiUrl);
        if (supported) {
          await Linking.openURL(upiUrl);
          // --- ✅ PURCHASE DATA AAGE PASS KIYA ---
          navigation.navigate('UpiLoadingScreen', {
            orderId: currentOrderId,
            upiTxnRefNo: result.bankPostData?.upiTxnRefNo,
            timeout: result.bankPostData?.timeout,
            token: result.bankPostData?.token,
            purchaseData: purchaseData, // Yahan add kiya
          });
        } else {
          console.log(`It seems ${appIdentifier} is not installed on your device.`);
        }
      } else {
        console.log('Payment Failed:', result.responseDescription || 'Could not initiate UPI payment.');
      }
    } catch (error) {
      console.error('Failed to handle UPI Intent payment:', error);
      if (!error.message.includes('Price mismatch')) {
        console.log('An Error Occurred:', error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIntentIsLoading(false);
      setCurrentIntentApp(null);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { marginBottom: insets.bottom }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.headerRow, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.header} allowFontScaling={false} adjustsFontSizeToFit={true}>
            Payment Method
          </Text>
          <Text style={styles.total} allowFontScaling={false} adjustsFontSizeToFit={true}>
            Total: ₹ {calculateGrandTotal()}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.sectionTitleOutside} allowFontScaling={false} adjustsFontSizeToFit={true}>
        Pay by any UPI App
      </Text>
      <View style={styles.cardSection}>
        {availableApps.paytm && (
          <>
            <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('paytm')}>
              <Image source={require('../assets/paymentLogo/paytm.png')} style={styles.radioIcon} />
              <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Paytm UPI </Text>
              <View style={styles.radioOuter}>
                {expandedOption === 'paytm' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
            {expandedOption === 'paytm' && (
              <View style={styles.expandContent}>
                <TouchableOpacity
                  style={[styles.payButton, isIntentLoading && styles.disabledButton]}
                  onPress={() => handleUpiIntentPayment('paytm')}
                  disabled={isIntentLoading}
                >
                  {isIntentLoading && currentIntentApp === 'paytm'
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA PAYTM</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {availableApps.gpay && (
          <>
            <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('gpay')}>
              <Image source={require('../assets/paymentLogo/googlepay.png')} style={styles.radioIcon} />
              <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Google Pay</Text>
              <View style={styles.radioOuter}>
                {expandedOption === 'gpay' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
            {expandedOption === 'gpay' && (
              <View style={styles.expandContent}>
                <TouchableOpacity
                  style={[styles.payButton, isIntentLoading && styles.disabledButton]}
                  onPress={() => handleUpiIntentPayment('gpay')}
                  disabled={isIntentLoading}
                >
                  {isIntentLoading && currentIntentApp === 'gpay'
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA GOOGLEPAY</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {availableApps.phonepe && (
          <>
            <TouchableOpacity style={styles.radioRow} onPress={() => handleExpand('phonepe')}>
              <Image source={require('../assets/paymentLogo/phonepe.png')} style={styles.radioIcon} />
              <Text style={styles.radioLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>PhonePe</Text>
              <View style={styles.radioOuter}>
                {expandedOption === 'phonepe' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
            {expandedOption === 'phonepe' && (
              <View style={styles.expandContent}>
                <TouchableOpacity
                  style={[styles.payButton, isIntentLoading && styles.disabledButton]}
                  onPress={() => handleUpiIntentPayment('phonepe')}
                  disabled={isIntentLoading}
                >
                  {isIntentLoading && currentIntentApp === 'phonepe'
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.payButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>PAY VIA PHONEPE</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.addNewRow} onPress={() => setShowNewUPI(!showNewUPI)}>
          <Icon name="plus-circle-outline" size={22} color="#0C5273" style={styles.radioIcon} />
          <View>
            <Text style={styles.addNewLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>Add UPI ID</Text>
            <Text style={styles.subLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>You need to have a registered UPI ID</Text>
          </View>
        </TouchableOpacity>
        {showNewUPI && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID (e.g. yourname@bank)"
              placeholderTextColor="#888"
              value={newUPIID}
              onChangeText={setNewUPIID}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.saveButton, (isLoading || !newUPIID.trim()) && styles.disabledButton]}
              onPress={handleUpiSubmit}
              disabled={isLoading || !newUPIID.trim()}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveButtonText} allowFontScaling={false} adjustsFontSizeToFit={true}>VERIFY & PAY</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitleOutside} allowFontScaling={false} adjustsFontSizeToFit={true}>
        Credit & Debit cards
      </Text>
      <View style={styles.cardSection}>
        <TouchableOpacity
          style={styles.addNewRow}
          onPress={() => navigation.navigate('CardScreen', {
            addressId: selectedAddress?.addressId,
            amount: calculateGrandTotal(),
          })}
        >
          <Icon
            name="credit-card-plus-outline"
            size={22}
            color="#0C5273"
            style={styles.radioIcon}
          />
          <View>
            <Text style={styles.addNewLabel} allowFontScaling={false} adjustsFontSizeToFit={true}>
              Pay via card
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 18, paddingBottom: 10, paddingHorizontal: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  header: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  total: { fontSize: 13, color: '#888', marginTop: 2 },
  sectionTitleOutside: { fontWeight: 'bold', fontSize: 16, marginLeft: 24, marginTop: 24, marginBottom: 8, color: '#222' },
  cardSection: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2, borderRadius: 8, marginBottom: 2 },
  radioIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  radioLabel: { flex: 1, fontSize: 15, color: '#222' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#0C5273', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0C5273' },
  payButton: { marginTop: 14, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: '#0C5273' },
  payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  addNewRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, marginBottom: 2 },
  addNewLabel: { color: '#0C5273', fontSize: 15, fontWeight: 'bold' },
  subLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  inputRow: { marginTop: 6, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#bdbdbd', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#f5f5f5', marginBottom: 10, color: '#333' },
  saveButton: { backgroundColor: '#0C5273', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 2 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#A5C4D1' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2, borderRadius: 8, marginBottom: 2 },
  expandContent: { paddingVertical: 8, paddingHorizontal: 2 },
});