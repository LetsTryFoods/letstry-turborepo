// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   StatusBar,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { RFValue } from 'react-native-responsive-fontsize';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';

// const PaymentFailedScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();

//   // Get the specific error message passed from the previous screen
//   const message = route.params?.message || 'Something went wrong, please try again.';

//   const handleRetry = () => {
//     navigation.replace('PaymentScreen');
//   };

//   const handleBackToCart = () => {
//     navigation.navigate('Cart');
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       <Image
//         source={require('../assets/utilities/paymentfailed.png')}
//         style={styles.icon}
//         resizeMode="contain"
//       />

//       <Text 
//         style={styles.title} 
//         allowFontScaling={false}
//         adjustsFontSizeToFit
//         numberOfLines={2}
//       >
//         Payment Failed
//       </Text>
//       <Text 
//         style={styles.subtitle} 
//         allowFontScaling={false}
//         adjustsFontSizeToFit
//         numberOfLines={4}
//       >
//         {message}
//       </Text>

//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
//           <Text 
//             style={styles.retryButtonText} 
//             allowFontScaling={false}
//             adjustsFontSizeToFit
//             numberOfLines={1}
//           >
//             Try again
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToCart}>
//           <Text 
//             style={styles.secondaryButtonText} 
//             allowFontScaling={false}
//             adjustsFontSizeToFit
//             numberOfLines={1}
//           >
//             Back to Cart
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: wp(6),
//   },
//   icon: {
//     width: wp(20),
//     height: wp(20),
//     marginBottom: hp(3),
//   },
//   title: {
//     fontSize: RFValue(22),
//     fontWeight: 'bold',
//     color: '#1E1E1E',
//     textAlign: 'center',
//     marginBottom: hp(1.5),
//   },
//   subtitle: {
//     fontSize: RFValue(15),
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: hp(5),
//     lineHeight: RFValue(22),
//   },
//   buttonContainer: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   retryButton: {
//     width: '100%',
//     paddingVertical: hp(1.8),
//     backgroundColor: '#0C5273',
//     borderRadius: wp(3),
//     alignItems: 'center',
//     marginBottom: hp(2),
//   },
//   retryButtonText: {
//     fontSize: RFValue(14),
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   secondaryButton: {
//     width: '100%',
//     paddingVertical: hp(1.8),
//     borderColor: '#0C5273',
//     borderWidth: 1,
//     borderRadius: wp(3),
//     alignItems: 'center',
//   },
//   secondaryButtonText: {
//     fontSize: RFValue(14),
//     fontWeight: '500',
//     color: '#0C5273',
//   },
// });

// export default PaymentFailedScreen;






import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// --- ✅ NAYA IMPORT ---
import analytics from '@react-native-firebase/analytics';

const PaymentFailedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // ✅ orderId, message, aur purchaseData receive kiye
  const { 
    message = 'Something went wrong, please try again.', 
    orderId,
    purchaseData // Isme cart ki details hongi
  } = route.params || {};

  // --- ✅ NAYA useEffect EVENT LOG KARNE KE LIYE ---
  useEffect(() => {
    try {
      // ✅ YAHAN SE `items` ARRAY HATA DIYA HAI (ERROR FIX)
      analytics().logEvent('payment_failed', {
        transaction_id: orderId || 'N/A',
        failure_reason: message,
        value: purchaseData ? purchaseData.value : 0, 
        currency: 'INR',
        coupon: purchaseData ? purchaseData.coupon : undefined,
        // items array yahan allowed nahi hai
      });
    } catch (error) {
      console.error("Analytics Error (payment_failed):", error);
    }
  }, [orderId, message, purchaseData]); // Yeh tabhi fire hoga jab screen load hogi
  // --- END ---

  const handleRetry = () => {
    navigation.replace('PaymentScreen');
  };

  const handleBackToCart = () => {
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Image
        source={require('../assets/utilities/paymentfailed.png')}
        style={styles.icon}
        resizeMode="contain"
      />

      <Text 
        style={styles.title} 
        allowFontScaling={false}
        adjustsFontSizeToFit
        numberOfLines={2}
      >
        Payment Failed
      </Text>
      <Text 
        style={styles.subtitle} 
        allowFontScaling={false}
        adjustsFontSizeToFit
        numberOfLines={4}
      >
        {message}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text 
            style={styles.retryButtonText} 
            allowFontScaling={false}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            Try again
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToCart}>
          <Text 
            style={styles.secondaryButtonText} 
            allowFontScaling={false}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            Back to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  icon: {
    width: wp(20),
    height: wp(20),
    marginBottom: hp(3),
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  subtitle: {
    fontSize: RFValue(15),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(5),
    lineHeight: RFValue(22),
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  retryButton: {
    width: '100%',
    paddingVertical: hp(1.8),
    backgroundColor: '#0C5273',
    borderRadius: wp(3),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  retryButtonText: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: hp(1.8),
    borderColor: '#0C5273',
    borderWidth: 1,
    borderRadius: wp(3),
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#0C5273',
  },
});

export default PaymentFailedScreen;