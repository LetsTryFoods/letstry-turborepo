import React from "react"
import { Image, View, StyleSheet } from "react-native"

// Import logo images
import Logo1 from "../assets/images/l1.png"
import Logo2 from "../assets/images/l2.png"
import Logo3 from "../assets/images/l3.png"
import Logo4 from "../assets/images/l4.png"

// Custom image-based tab icons
export const LogoIcon1 = () => (
  <View style={styles.iconContainer}>
    <Image source={Logo1} style={styles.logoImage} resizeMode="contain" />
  </View>
)

export const LogoIcon2 = () => (
  <View style={styles.iconContainer}>
    <Image source={Logo2} style={styles.logoImage} resizeMode="contain" />
  </View>
)

export const LogoIcon3 = () => (
  <View style={styles.iconContainer}>
    <Image source={Logo3} style={styles.logoImage} resizeMode="contain" />
  </View>
)

export const LogoIcon4 = () => (
  <View style={styles.iconContainer}>
    <Image source={Logo4} style={styles.logoImage} resizeMode="contain" />
  </View>
)

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 20,
    height: 20,
  },
})