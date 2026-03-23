
// import React, { useState, useEffect } from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { enableScreens } from 'react-native-screens';
// import {
//   View,
//   Text,
//   Linking,
//   Platform,
//   StyleSheet,
//   ActivityIndicator,
//   Image, // <-- Import Image
//   TouchableOpacity, // <-- Import TouchableOpacity for custom button
// } from 'react-native';

// // --- Your Existing Imports ---
// import AppNavigator from './src/navigation/AppNavigator';
// import { CartProvider } from './src/context/CartContext';
// import { AuthProvider } from './src/context/AuthContext';
// import { AddressProvider } from './src/context/AddressContext';
// import { LocationProvider } from './src/context/LocationContext';
// import InternetCheckWrapper from './src/components/InternetCheckWrapper';
// import 'react-native-get-random-values';
// import { InTransitProvider } from './src/context/InTransitContext';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // --- New Imports for Force Update ---
// import remoteConfig from '@react-native-firebase/remote-config';
// import DeviceInfo from 'react-native-device-info';
// import semver from 'semver';

// enableScreens();

// // --- Your QueryClient setup ---
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       cacheTime: 1000 * 60 * 30, // 30 minutes
//     },
//   },
// });

// // --- App store links with your app's specific details ---
// const IOS_APP_STORE_LINK = 'itms-apps://apps.apple.com/app/id6749929023';
// const ANDROID_PLAY_STORE_LINK = 'market://details?id=com.letstryfoods';

// // --- Root App Component with Update Logic ---
// const App = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdateRequired, setUpdateRequired] = useState(false);

//   useEffect(() => {
//     const checkVersion = async () => {
//       try {
//         await remoteConfig().setConfigSettings({
//           minimumFetchIntervalMillis: 300000,
//         });
        
//         await remoteConfig().fetchAndActivate();
        
//         const parameterName = Platform.OS === 'ios' 
//           ? 'ios_minimum_version' 
//           : 'android_minimum_version';
        
//         const minVersionString = remoteConfig()
//           .getValue(parameterName)
//           .asString();
        
//         const currentVersion = DeviceInfo.getVersion();
//         console.log(`Current App Version: ${currentVersion}, Required Minimum Version: ${minVersionString}`);
        
//         if (minVersionString && semver.lt(currentVersion, minVersionString)) {
//           setUpdateRequired(true);
//         }

//       } catch (error) {
//         console.error('Error fetching remote config for version check: ', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkVersion();
//   }, []);

//   // if (isLoading) {
//   //   return (
//   //     <View style={styles.loadingContainer}>
//   //       <ActivityIndicator size="large" color="#0000ff" />
//   //     </View>
//   //   );
//   // }

//   if (isUpdateRequired) {
//     // Return the new, redesigned modal
//     return <ForceUpdateModal />;
//   }

//   // --- Your Original App Structure ---
//   return (
//     <SafeAreaProvider>
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//           <CartProvider>
//             <AddressProvider>
//               <LocationProvider>
//                 <InTransitProvider>
//                   <InternetCheckWrapper>
//                     <AppNavigator />
//                   </InternetCheckWrapper>
//                 </InTransitProvider>
//               </LocationProvider>
//             </AddressProvider>
//           </CartProvider>
//         </AuthProvider>
//       </QueryClientProvider>
//     </SafeAreaProvider>
//   );
// };


// // --- ✅ NEW AND IMPROVED Force Update Modal Component ---
// const ForceUpdateModal = () => {
//   const handleUpdatePress = async () => {
//     const link =
//       Platform.OS === 'ios' ? IOS_APP_STORE_LINK : ANDROID_PLAY_STORE_LINK;
//     try {
//       const supported = await Linking.canOpenURL(link);
//       if (supported) {
//         await Linking.openURL(link);
//       } else {
//         console.error(`Don't know how to open this URL: ${link}`);
//       }
//     } catch (error) {
//       console.error('An error occurred while trying to open the store link', error);
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       {/* Ensure the image path is correct */}
//       <Image 
//         source={require('./src/assets/update.png')} 
//         style={styles.image} 
//         resizeMode="contain"
//       />
//       <Text style={styles.modalTitle}>App Update Required!</Text>
//       <Text style={styles.modalText}>
//         We have added new features and fixed some bugs to make your experience seamless
//       </Text>
//       <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
//         <Text style={styles.updateButtonText}>Update App</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };


// // --- ✅ UPDATED Styles ---
// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40, // Add horizontal padding
//     backgroundColor: '#FFFFFF',
//   },
//   image: {
//     width: 250,
//     height: 250,
//     marginBottom: 30,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 24,
//   },
//   updateButton: {
//     backgroundColor: '#2E3A59', // A dark blue-gray color
//     paddingVertical: 15,
//     paddingHorizontal: 60,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//   },
//   updateButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default App;














// import React, { useState, useEffect, useCallback } from 'react'; // <-- useCallback added
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { enableScreens } from 'react-native-screens';
// import {
//   View,
//   Text,
//   Linking,
//   Platform,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
//   TouchableOpacity,
// } from 'react-native';

// // --- Your Existing Imports ---
// import AppNavigator from './src/navigation/AppNavigator';
// import { CartProvider } from './src/context/CartContext';
// import { AuthProvider } from './src/context/AuthContext';
// import { AddressProvider } from './src/context/AddressContext';
// import { LocationProvider } from './src/context/LocationContext';
// import InternetCheckWrapper from './src/components/InternetCheckWrapper';
// import 'react-native-get-random-values';
// import { InTransitProvider } from './src/context/InTransitContext';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // --- New Imports for Deep Linking (Assuming NavigationContainer is used inside AppNavigator) ---
// // Note: Normally, we define the linking config where NavigationContainer is used,
// // but for a robust example, we define the config here.

// // --- New Imports for Force Update ---
// import remoteConfig from '@react-native-firebase/remote-config';
// import DeviceInfo from 'react-native-device-info';
// import semver from 'semver';

// enableScreens();

// // --- Deep Linking Configuration (The Core of the Next Step) ---
// /**
//  * Define the configuration object for React Navigation's Linking.
//  * This maps URL paths to your screen names.
//  */
// const deepLinkConfig = {
//   // Use your Custom URL Scheme as the prefix
//   prefixes: ['cskapp://'], 
//   config: {
//     // Note: The screens defined here must match the screen names in your AppNavigator (which uses NavigationContainer)
//     screens: {
//       // Map 'cskapp://' (base URL) to the primary navigator/screen
//       HomeTab: { // Assuming HomeTab is your bottom tab navigator or main screen
//         path: 'home',
//         // Nested screens example
//         screens: { 
//           ProfileScreen: 'profile/:userId', // Maps cskapp://profile/123 to ProfileScreen
//           ProductsStack: {
//             screens: {
//               ProductDetails: 'product/:id', // Maps cskapp://product/456 to ProductDetails screen
//               SearchScreen: 'search', // Maps cskapp://search
//             },
//           },
//         },
//       },
//       // You can add paths for other top-level screens here
//       CheckoutScreen: 'checkout', // Maps cskapp://checkout
//       OrderConfirmation: 'order/confirm', // Maps cskapp://order/confirm
//     },
//   },
// };
// // --- END Deep Linking Configuration ---


// // --- Your QueryClient setup ---
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       cacheTime: 1000 * 60 * 30, // 30 minutes
//     },
//   },
// });

// // --- App store links with your app's specific details ---
// const IOS_APP_STORE_LINK = 'itms-apps://apps.apple.com/app/id6749929023';
// const ANDROID_PLAY_STORE_LINK = 'market://details?id=com.letstryfoods';

// // --- Root App Component with Update Logic ---
// const App = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdateRequired, setUpdateRequired] = useState(false);

//   // You can use this function to manually test the URL parsing if needed
//   // const handleUrl = useCallback(({ url }) => {
//   //   console.log('Deep link received (App running):', url);
//   //   // No manual navigation needed, React Navigation handles it via the 'linking' prop
//   // }, []);

//   useEffect(() => {
//     const checkVersion = async () => {
//       try {
//         await remoteConfig().setConfigSettings({
//           minimumFetchIntervalMillis: 300000,
//         });
        
//         await remoteConfig().fetchAndActivate();
        
//         const parameterName = Platform.OS === 'ios' 
//           ? 'ios_minimum_version' 
//           : 'android_minimum_version';
        
//         const minVersionString = remoteConfig()
//           .getValue(parameterName)
//           .asString();
        
//         const currentVersion = DeviceInfo.getVersion();
//         console.log(`Current App Version: ${currentVersion}, Required Minimum Version: ${minVersionString}`);
        
//         if (minVersionString && semver.lt(currentVersion, minVersionString)) {
//           setUpdateRequired(true);
//         }

//       } catch (error) {
//         console.error('Error fetching remote config for version check: ', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     // --- ⚠️ Optional: Manual Listener (React Navigation does this internally)
//     // const subscription = Linking.addEventListener('url', handleUrl);
//     // return () => {
//     //   subscription.remove();
//     // };
//     // ---

//     checkVersion();
//   }, []);

//   if (isUpdateRequired) {
//     // Return the new, redesigned modal
//     return <ForceUpdateModal />;
//   }

//   // --- Your Original App Structure with Linking pass-through ---
//   return (
//     <SafeAreaProvider>
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//           <CartProvider>
//             <AddressProvider>
//               <LocationProvider>
//                 <InTransitProvider>
//                   <InternetCheckWrapper>
//                     {/* 💡 Yahan hum AppNavigator (jiske andar NavigationContainer hai) 
//                          ko linking config pass kar rahe hain. */}
//                     <AppNavigator linkingConfig={deepLinkConfig} />
//                   </InternetCheckWrapper>
//                 </InTransitProvider>
//               </LocationProvider>
//             </AddressProvider>
//           </CartProvider>
//         </AuthProvider>
//       </QueryClientProvider>
//     </SafeAreaProvider>
//   );
// };


// // --- ✅ NEW AND IMPROVED Force Update Modal Component ---
// const ForceUpdateModal = () => {
//   const handleUpdatePress = async () => {
//     const link =
//       Platform.OS === 'ios' ? IOS_APP_STORE_LINK : ANDROID_PLAY_STORE_LINK;
//     try {
//       const supported = await Linking.canOpenURL(link);
//       if (supported) {
//         await Linking.openURL(link);
//       } else {
//         console.error(`Don't know how to open this URL: ${link}`);
//       }
//     } catch (error) {
//       console.error('An error occurred while trying to open the store link', error);
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       {/* Ensure the image path is correct */}
//       <Image 
//         source={require('./src/assets/update.png')} 
//         style={styles.image} 
//         resizeMode="contain"
//       />
//       <Text style={styles.modalTitle}>App Update Required!</Text>
//       <Text style={styles.modalText}>
//         We have added new features and fixed some bugs to make your experience seamless
//       </Text>
//       <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
//         <Text style={styles.updateButtonText}>Update App</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };


// // --- ✅ UPDATED Styles ---
// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40, // Add horizontal padding
//     backgroundColor: '#FFFFFF',
//   },
//   image: {
//     width: 250,
//     height: 250,
//     marginBottom: 30,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 24,
//   },
//   updateButton: {
//     backgroundColor: '#2E3A59', // A dark blue-gray color
//     paddingVertical: 15,
//     paddingHorizontal: 60,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//   },
//   updateButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default App;





















// import React, { useState, useEffect } from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { enableScreens } from 'react-native-screens';
// import {
//   View,
//   Text,
//   Linking,
//   Platform,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
//   TouchableOpacity,
// } from 'react-native';

// // --- Your Existing Imports ---
// import AppNavigator from './src/navigation/AppNavigator';
// import { CartProvider } from './src/context/CartContext';
// import { AuthProvider } from './src/context/AuthContext';
// import { AddressProvider } from './src/context/AddressContext';
// import { LocationProvider } from './src/context/LocationContext';
// import InternetCheckWrapper from './src/components/InternetCheckWrapper';
// import 'react-native-get-random-values';
// import { InTransitProvider } from './src/context/InTransitContext';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // --- New Imports for Force Update ---
// import remoteConfig from '@react-native-firebase/remote-config';
// import DeviceInfo from 'react-native-device-info';
// import semver from 'semver';

// enableScreens();

// // --- 🚀 DEEP LINKING CONFIGURATION ---
// /**
//  * Defines the mapping between URL paths (from cskapp://) and your React Navigation screen names.
//  */
// const deepLinkConfig = {
//   // Use your Custom URL Scheme as the prefix
//   prefixes: ['cskapp://'], 
//   config: {
//     // Note: Screen names must match the Stack.Screen names in AppNavigator
//     screens: {
//       SplashScreen: 'splash',
//       Login: 'login',
//       Verification: 'verify',
//       MainApp: { 
//         path: 'main', // cskapp://main will go to the main tab navigator
//         screens: { 
//           // Assuming 'Home' is one of the tabs inside the BottomTabNavigator
//           HomeScreen: 'home', // cskapp://main/home (though cskapp://main should default here)
//           ProfileScreen: 'profile/:userId', // cskapp://main/profile/123
//         },
//       },
//       // Top-level stack screens directly accessible via deep link:
//       ProductDetails: 'product/:id', // cskapp://product/456
//       Search: 'search',              // cskapp://search
//       OrderDetailsScreen: 'order/:orderId', // cskapp://order/XYZ
      
//       // Add other screens you want to link to here:
//       Cart: 'cart',
//       PaymentScreen: 'payment',
//     },
//   },
// };
// // --- END Deep Linking Configuration ---


// // --- Your QueryClient setup ---
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       cacheTime: 1000 * 60 * 30, // 30 minutes
//     },
//   },
// });

// // --- App store links with your app's specific details ---
// const IOS_APP_STORE_LINK = 'itms-apps://apps.apple.com/app/id6749929023';
// const ANDROID_PLAY_STORE_LINK = 'market://details?id=com.letstryfoods';

// // --- Root App Component with Update Logic ---
// const App = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdateRequired, setUpdateRequired] = useState(false);

//   useEffect(() => {
//     const checkVersion = async () => {
//       try {
//         await remoteConfig().setConfigSettings({
//           minimumFetchIntervalMillis: 300000,
//         });
        
//         await remoteConfig().fetchAndActivate();
        
//         const parameterName = Platform.OS === 'ios' 
//           ? 'ios_minimum_version' 
//           : 'android_minimum_version';
        
//         const minVersionString = remoteConfig()
//           .getValue(parameterName)
//           .asString();
        
//         const currentVersion = DeviceInfo.getVersion();
//         console.log(`Current App Version: ${currentVersion}, Required Minimum Version: ${minVersionString}`);
        
//         if (minVersionString && semver.lt(currentVersion, minVersionString)) {
//           setUpdateRequired(true);
//         }

//       } catch (error) {
//         console.error('Error fetching remote config for version check: ', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkVersion();
//   }, []);

//   if (isUpdateRequired) {
//     // Return the new, redesigned modal
//     return <ForceUpdateModal />;
//   }

//   // --- Your Original App Structure with Linking pass-through ---
//   return (
//     <SafeAreaProvider>
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//           <CartProvider>
//             <AddressProvider>
//               <LocationProvider>
//                 <InTransitProvider>
//                   <InternetCheckWrapper>
//                     {/* 🚀 Pass the linking configuration to AppNavigator */}
//                     <AppNavigator linkingConfig={deepLinkConfig} />
//                   </InternetCheckWrapper>
//                 </InTransitProvider>
//               </LocationProvider>
//             </AddressProvider>
//           </CartProvider>
//         </AuthProvider>
//       </QueryClientProvider>
//     </SafeAreaProvider>
//   );
// };


// // --- Force Update Modal Component ---
// const ForceUpdateModal = () => {
//   const handleUpdatePress = async () => {
//     const link =
//       Platform.OS === 'ios' ? IOS_APP_STORE_LINK : ANDROID_PLAY_STORE_LINK;
//     try {
//       const supported = await Linking.canOpenURL(link);
//       if (supported) {
//         await Linking.openURL(link);
//       } else {
//         console.error(`Don't know how to open this URL: ${link}`);
//       }
//     } catch (error) {
//       console.error('An error occurred while trying to open the store link', error);
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       <Image 
//         source={require('./src/assets/update.png')} 
//         style={styles.image} 
//         resizeMode="contain"
//       />
//       <Text style={styles.modalTitle}>App Update Required!</Text>
//       <Text style={styles.modalText}>
//         We have added new features and fixed some bugs to make your experience seamless
//       </Text>
//       <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
//         <Text style={styles.updateButtonText}>Update App</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };


// // --- Styles ---
// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     backgroundColor: '#FFFFFF',
//   },
//   image: {
//     width: 250,
//     height: 250,
//     marginBottom: 30,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 24,
//   },
//   updateButton: {
//     backgroundColor: '#2E3A59',
//     paddingVertical: 15,
//     paddingHorizontal: 60,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//   },
//   updateButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default App;














// App.js

// import React, { useState, useEffect } from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { enableScreens } from 'react-native-screens';
// import {
//   View,
//   Text,
//   Linking,
//   Platform,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
// } from 'react-native';

// // --- Your Existing Imports ---
// import AppNavigator from './src/navigation/AppNavigator';
// import { CartProvider } from './src/context/CartContext';
// import { AuthProvider } from './src/context/AuthContext';
// import { AddressProvider } from './src/context/AddressContext';
// import { LocationProvider } from './src/context/LocationContext';
// import InternetCheckWrapper from './src/components/InternetCheckWrapper';
// import 'react-native-get-random-values';
// import { InTransitProvider } from './src/context/InTransitContext';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // --- New Imports for Force Update ---
// import remoteConfig from '@react-native-firebase/remote-config';
// import DeviceInfo from 'react-native-device-info';
// import semver from 'semver';

// enableScreens();

// // --- Deep Linking Configuration ---
// const deepLinkConfig = {
//   prefixes: ['cskapp://'], 
//   config: {
//     screens: {
//       SplashScreen: 'splash',
//       Login: 'login',
//       Verification: 'verify',
//       MainApp: { 
//         path: 'main',
//         screens: { 
//           HomeScreen: 'home',
//           ProfileScreen: 'profile/:userId',
//         },
//       },
//       ProductDetails: 'product/:id',
//       Search: 'search',
//       OrderDetailsScreen: 'order/:orderId',
//       Cart: 'cart',
//       PaymentScreen: 'payment',
//     },
//   },
// };

// // --- Your QueryClient setup ---
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       cacheTime: 1000 * 60 * 30, // 30 minutes
//     },
//   },
// });

// const IOS_APP_STORE_LINK = 'itms-apps://apps.apple.com/app/id6749929023';
// const ANDROID_PLAY_STORE_LINK = 'market://details?id=com.letstryfoods';

// const App = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdateRequired, setUpdateRequired] = useState(false);

//   useEffect(() => {
//     const checkVersion = async () => {
//       try {
//         await remoteConfig().setConfigSettings({
//           minimumFetchIntervalMillis: 300000,
//         });
        
//         await remoteConfig().fetchAndActivate();
        
//         const parameterName = Platform.OS === 'ios' 
//           ? 'ios_minimum_version' 
//           : 'android_minimum_version';
        
//         const minVersionString = remoteConfig().getValue(parameterName).asString();
//         const currentVersion = DeviceInfo.getVersion();

//         if (minVersionString && semver.lt(currentVersion, minVersionString)) {
//           setUpdateRequired(true);
//         }

//       } catch (error) {
//         console.error('Error fetching remote config for version check: ', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkVersion();
//   }, []);

//   if (isUpdateRequired) {
//     return <ForceUpdateModal />;
//   }
  
//   // --- ✅ CORRECTED PROVIDER ORDER ---
//   return (
//     <SafeAreaProvider>
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//           <AddressProvider>  {/* Moved AddressProvider to wrap CartProvider */}
//             <CartProvider>
//               <LocationProvider>
//                 <InTransitProvider>
//                   <InternetCheckWrapper>
//                     <AppNavigator linkingConfig={deepLinkConfig} />
//                   </InternetCheckWrapper>
//                 </InTransitProvider>
//               </LocationProvider>
//             </CartProvider>
//           </AddressProvider>
//         </AuthProvider>
//       </QueryClientProvider>
//     </SafeAreaProvider>
//   );
// };

// // --- Force Update Modal Component (No changes needed here) ---
// const ForceUpdateModal = () => {
//   const handleUpdatePress = async () => {
//     const link = Platform.OS === 'ios' ? IOS_APP_STORE_LINK : ANDROID_PLAY_STORE_LINK;
//     try {
//       if (await Linking.canOpenURL(link)) {
//         await Linking.openURL(link);
//       }
//     } catch (error) {
//       console.error('An error occurred trying to open the store link', error);
//     }
//   };

//   return (
//     <View style={styles.modalContainer}>
//       <Image 
//         source={require('./src/assets/update.png')} 
//         style={styles.image} 
//         resizeMode="contain"
//       />
//       <Text style={styles.modalTitle}>App Update Required!</Text>
//       <Text style={styles.modalText}>
//         We have added new features and fixed some bugs to make your experience seamless
//       </Text>
//       <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
//         <Text style={styles.updateButtonText}>Update App</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // --- Styles (No changes needed here) ---
// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//     backgroundColor: '#FFFFFF',
//   },
//   image: {
//     width: 250,
//     height: 250,
//     marginBottom: 30,
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 15,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 24,
//   },
//   updateButton: {
//     backgroundColor: '#2E3A59',
//     paddingVertical: 15,
//     paddingHorizontal: 60,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//   },
//   updateButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

// export default App;



















// App.js (FIXED)

import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import {
  View,
  Text,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

// --- Your Existing Imports ---
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import { AddressProvider } from './src/context/AddressContext';
import { LocationProvider } from './src/context/LocationContext';
import InternetCheckWrapper from './src/components/InternetCheckWrapper';
import 'react-native-get-random-values';
import { InTransitProvider } from './src/context/InTransitContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- New Imports for Force Update ---
import remoteConfig from '@react-native-firebase/remote-config';
import DeviceInfo from 'react-native-device-info';
import semver from 'semver';

// --- ✅ NEW IMPORTS FOR ANALYTICS ---
// NavigationContainerRef import hata diya hai kyunki .js file mein type ki zaroorat nahi
import analytics from '@react-native-firebase/analytics';

enableScreens();

// --- Deep Linking Configuration ---
const deepLinkConfig = {
  prefixes: ['cskapp://'],
  config: {
    screens: {
      SplashScreen: 'splash',
      Login: 'login',
      Verification: 'verify',
      MainApp: {
        path: 'main',
        screens: {
          HomeScreen: 'home',
          ProfileScreen: 'profile/:userId',
        },
      },
      ProductDetails: 'product/:id',
      Search: 'search',
      OrderDetailsScreen: 'order/:orderId',
      Cart: 'cart',
      PaymentScreen: 'payment',
    },
  },
};

// --- Your QueryClient setup ---
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const IOS_APP_STORE_LINK = 'itms-apps://apps.apple.com/app/id6749929023';
const ANDROID_PLAY_STORE_LINK = 'market://details?id=com.letstryfoods';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateRequired, setUpdateRequired] = useState(false);

  // --- ✅ NEW REFS FOR SCREEN TRACKING (Types Hata Diye) ---
  const navigationRef = useRef(null);
  const routeNameRef = useRef();

  useEffect(() => {
    const checkVersion = async () => {
      try {
        await remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis: 300000,
        });

        await remoteConfig().fetchAndActivate();

        const parameterName = Platform.OS === 'ios'
          ? 'ios_minimum_version'
          : 'android_minimum_version';

        const minVersionString = remoteConfig().getValue(parameterName).asString();
        const currentVersion = DeviceInfo.getVersion();

        if (minVersionString && semver.lt(currentVersion, minVersionString)) {
          setUpdateRequired(true);
        }

      } catch (error) {
        console.error('Error fetching remote config for version check: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVersion();
  }, []);

  if (isUpdateRequired) {
    return <ForceUpdateModal />;
  }

  // --- ✅ CORRECTED PROVIDER ORDER ---
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AddressProvider>  {/* Moved AddressProvider to wrap CartProvider */}
            <CartProvider>
              <LocationProvider>
                <InTransitProvider>
                  <InternetCheckWrapper>
                    {/* --- ✅ MODIFIED AppNavigator props --- */}
                    <AppNavigator
                      linkingConfig={deepLinkConfig}
                      navigationRef={navigationRef} // Pass the ref
                      // Set the initial route name on load
                      onReady={() => {
                        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
                      }}
                      // Listen for state changes
                      onStateChange={async () => {
                        const previousRouteName = routeNameRef.current;
                        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

                        if (previousRouteName !== currentRouteName && currentRouteName) {
                          // Log the screen view event
                          await analytics().logScreenView({
                            screen_name: currentRouteName,
                            screen_class: currentRouteName,
                          });
                        }
                        
                        // Save the new route name
                        routeNameRef.current = currentRouteName;
                      }}
                    />
                  </InternetCheckWrapper>
                </InTransitProvider>
              </LocationProvider>
            </CartProvider>
          </AddressProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

// --- Force Update Modal Component (No changes needed here) ---
const ForceUpdateModal = () => {
  const handleUpdatePress = async () => {
    const link = Platform.OS === 'ios' ? IOS_APP_STORE_LINK : ANDROID_PLAY_STORE_LINK;
    try {
      if (await Linking.canOpenURL(link)) {
        await Linking.openURL(link);
      }
    } catch (error) {
      console.error('An error occurred trying to open the store link', error);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Image
        source={require('./src/assets/update.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.modalTitle}>App Update Required!</Text>
      <Text style={styles.modalText}>
        We have added new features and fixed some bugs to make your experience seamless
      </Text>
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
        <Text style={styles.updateButtonText}>Update App</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles (No changes needed here) ---
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  updateButton: {
    backgroundColor: '#2E3A59',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default App;