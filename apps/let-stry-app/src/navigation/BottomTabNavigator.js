



import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import HomeScreen from "../screens/HomeScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import CartScreen from "../screens/CartScreen";
import AccountScreen from "../screens/AccountScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useInTransit } from "../context/InTransitContext";
import { useCart } from "../context/CartContext";

// --- ✅ NEW IMPORT FOR ANALYTICS ---
import analytics from '@react-native-firebase/analytics';

const Tab = createBottomTabNavigator();

// Reduced sizes
const ICON_SIZE = wp(5.525); // ~21px on 375px width
const BADGE_SIZE = wp(3.825); // ~15px
const BADGE_RIGHT = -wp(2.125); // ~-8px
const BADGE_TOP = -hp(0.68); // ~-5px
const BADGE_FONT_SIZE = RFValue(8.5);
const LABEL_FONT_SIZE_FOCUSED = RFValue(13.6);
const LABEL_FONT_SIZE_UNFOCUSED = RFValue(11.9);
const PADDING_VERTICAL_TAB_ITEM = hp(1.02);
const PADDING_TOP_TAB_BAR = hp(0.425);

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { inTransit } = useInTransit();
  const { cartCount } = useCart();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom, paddingTop: PADDING_TOP_TAB_BAR }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          // --- ✅ LOG CUSTOM EVENT ---
          // This logs an event to Firebase every time a tab is pressed
          analytics().logEvent('tab_press', {
            tab_name: route.name,
            tab_label: label,
          });
          // --- END OF NEW CODE ---

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        let iconSource;
        switch (route.name) {
          case "Home":
            iconSource = isFocused
              ? require("../assets/icons/home_yellow.png")
              : require("../assets/icons/home_black.png");
            break;
          case "Categories":
            iconSource = isFocused
              ? require("../assets/icons/categories_yellow.png")
              : require("../assets/icons/categories_black.png");
            break;
          case "Cart":
            iconSource = isFocused
              ? require("../assets/icons/cart_yellow.png")
              : require("../assets/icons/cart_black.png");
            break;
          case "Account":
            iconSource = isFocused
              ? require("../assets/icons/account_yellow.png")
              : require("../assets/icons/account_black.png");
            break;
        }

        // Show badge only on Cart tab, when inTransit is true and cartCount > 0
        const showBadge = route.name === "Cart" && cartCount > 0;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={{ position: "relative" }}>
              <Image
                source={iconSource}
                style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                }}
                resizeMode="contain"
              />
              {showBadge && (
                <View style={styles.badgeContainer}>
                  <Text
                    allowFontScaling={false}
                    adjustsFontSizeToFit
                    style={styles.badgeText}
                  >
                    {cartCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit
              style={[
                styles.tabLabel,
                {
                  color: "#000",
                  fontSize: isFocused ? LABEL_FONT_SIZE_FOCUSED : LABEL_FONT_SIZE_UNFOCUSED,
                  fontWeight: isFocused ? "bold" : "normal",
                  marginTop: hp(0.5),
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: PADDING_VERTICAL_TAB_ITEM,
  },
  tabLabel: {
    // fontSize and marginTop are set inline for responsiveness
  },
  badgeContainer: {
    position: "absolute",
    right: BADGE_RIGHT,
    top: BADGE_TOP,
    backgroundColor: "#FFD600", // yellow badge
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
    zIndex: 10,
    paddingHorizontal: wp(0.5),
  },
  badgeText: {
    color: "#222",
    fontSize: BADGE_FONT_SIZE,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default BottomTabNavigator;