import { View, Image, StyleSheet } from "react-native"

const Background = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Background pattern */}
      <Image
        source={require("../assets/images/product-background.png")}
        style={styles.backgroundPattern}
        resizeMode="cover"
      />

      {/* Top right product */}
      {/* <View style={[styles.productContainer, styles.topRight]}>
        <Image source={require("../assets/images/product2.png")} style={styles.productImage} resizeMode="contain" />
      </View> */}

      {/* Bottom left product */}
      {/* <View style={[styles.productContainer, styles.bottomLeft]}>
        <Image source={require("../assets/images/product7.png")} style={styles.productImage} resizeMode="contain" />
      </View> */}

      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBEB",
  },
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  productContainer: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FFD233",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  topRight: {
    top: -30,
    right: -30,
  },
  bottomLeft: {
    bottom: -30,
    left: -30,
  },
  productImage: {
    width: "80%",
    height: "80%",
  },
})

export default Background

