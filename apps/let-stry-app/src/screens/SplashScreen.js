import React, { useEffect, useRef } from "react";
import { View, Text, Image, StatusBar, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";
import Background from "../components/Background";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocation } from "../context/LocationContext";

const Splash = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);
  const { isInDeliveryArea, loading: locationLoading } = useLocation();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setTimeout(async () => {
        if (!hasNavigated.current) {
          if (user) {
            hasNavigated.current = true;
            navigation.reset({
              index: 0,
              routes: [{ name: "MainApp" }],
            });
          } else {
            // Check if user skipped login
            try {
              const skipped = await AsyncStorage.getItem("SKIPPED_LOGIN");
              if (skipped === "true") {
                hasNavigated.current = true;
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainApp" }],
                });
              } else {
                hasNavigated.current = true;
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }
            } catch (error) {
              // fallback: go to Login
              hasNavigated.current = true;
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }
          }
        }
      }, 1000);
    });
    return unsubscribe;
  }, [navigation]);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Background>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <Text
              allowFontScaling={false}
              adjustsFontSizeToFit={true}
              style={styles.title}
              numberOfLines={2}
            >
              BETTER & HEALTHY{"\n"}
              WAY TO SNACK
            </Text>
            {/* You may also want to comment out the ActivityIndicator if it's tied to location loading */}
            {/* {auth().currentUser && (locationLoading || isInDeliveryArea === null) && (
              <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#7D6E00" />
            )} */}
          </View>
        </View>
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFBEB" },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    justifyContent: "space-between", 
    paddingTop: 60, 
    paddingBottom: 40 
  },
  logoContainer: { alignItems: "center" },
  logo: { 
    width: 220, 
    height: 220, 
    alignContent: "center", 
    marginTop: "50%" 
  },
  textContainer: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#7D6E00", 
    textAlign: "center", 
    lineHeight: 38, 
    top: -50 
  },
});

export default Splash;









