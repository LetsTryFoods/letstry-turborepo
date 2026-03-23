






import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"; // ✅ Import NavigationContainerRef
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react'; // ✅ Import React

// Screens
import SplashScreen from "../screens/SplashScreen";
import Login from "../screens/Login";
import Verification from "../screens/Verification";
import BottomTabNavigator from "./BottomTabNavigator";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import HamperDetailsScreen from "../screens/HamperDetailsScreen"; // Make sure this import is correct
import CartScreen from "../screens/CartScreen";
import SearchScreen from "../screens/SearchScreen";
import AddressBook from "../components/AddressBook";
import AddAddressScreen from "../screens/AddAddressScreen";
import MapSearchScreen from "../screens/MapSearchScreen";
import HomeScreen from "../screens/HomeScreen";
import RangeScreen from "../screens/RangeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EventProductsScreen from '../screens/EventProductScreen';
import CouponScreen from "../screens/CouponScreen";
import ComingSoonScreen from "../screens/ComingSoon";
import AccountScreen from "../screens/AccountScreen";
import PaymentScreen from "../screens/PaymentScreen";
import PaymentFailedScreen from "../components/PaymentFailed";
import PaymentSuccessScreen from "../components/PaymentSuccess";
import CardScreen from "../screens/CardScreen";
import WebViewScreen from "../components/WebViewScreen";
import UpiLoadingScreen from "../screens/UpiLoadingScreen";
import MyOrdersScreen from "../screens/MyordersScreen";
import AboutUsScreen from "../screens/AboutUsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import RefundScreen from "../screens/RefundScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";

const Stack = createNativeStackNavigator();

// ✅ UPDATE THE COMPONENT TO ACCEPT PROPS
const AppNavigator = ({ linkingConfig, navigationRef, onReady, onStateChange }) => {
  return (
    // ✅ PASS THE PROPS TO NavigationContainer
    <NavigationContainer
      linking={linkingConfig}
      ref={navigationRef}
      onReady={onReady}
      onStateChange={onStateChange}
    >
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Verification" component={Verification} />
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="HamperDetails" component={HamperDetailsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="AddressBook" component={AddressBook} />
        <Stack.Screen name="AddAddressScreen" component={AddAddressScreen} />
        <Stack.Screen name="MapSearchScreen" component={MapSearchScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="RangeScreen" component={RangeScreen} options={({ route }) => ({ title: route.params.rangeName, headerShown: false, animation: "slide_from_right" })} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="EventProducts" component={EventProductsScreen} options={{ title: 'Event Products' }} />
        <Stack.Screen name="CouponScreen" component={CouponScreen} />
        <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
        <Stack.Screen name="AccountScreen" component={AccountScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="PaymentFailedScreen" component={PaymentFailedScreen} />
        <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
        <Stack.Screen name="CardScreen" component={CardScreen} />
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen name="UpiLoadingScreen" component={UpiLoadingScreen} />
        <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} />
        <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
        <Stack.Screen name="TermsOfServiceScreen" component={TermsOfServiceScreen} />
        <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
        <Stack.Screen name="RefundScreen" component={RefundScreen} />
        <Stack.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;