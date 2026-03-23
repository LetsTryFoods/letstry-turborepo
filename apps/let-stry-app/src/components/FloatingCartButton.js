import { TouchableOpacity, Text, View, StyleSheet } from "react-native"
import { useCart } from "../context/CartContext"
import { RFValue } from "react-native-responsive-fontsize"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen"
import Ionicons from "react-native-vector-icons/Ionicons"

const FloatingCartButton = ({ onPress, customStyle }) => {
  const { cartItems, cartCount } = useCart()

  if (cartCount === 0) {
    return null
  }

  // Count total items (including quantities)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <TouchableOpacity style={[styles.container, customStyle]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="cart-outline" size={wp(6)} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text 
              allowFontScaling={false} 
              adjustsFontSizeToFit
              style={styles.itemCount}
            >
              {totalItems} ITEMS
            </Text>
            <Text 
              allowFontScaling={false} 
              adjustsFontSizeToFit
              style={styles.viewCartText}
            >
              View cart
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Ionicons name="chevron-forward" size={RFValue(17)} color="#0C5273" />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: hp(2.5),
    left: wp(30),
    right: wp(30),
    backgroundColor: "#0C5273",
    borderRadius: wp(5),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: wp(3),
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  itemCount: {
    color: "white",
    fontWeight: "bold",
    fontSize: RFValue(10),
    marginBottom: hp(0.2),
  },
  rightSection: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "#fff"
  },
  viewCartText: {
    color: "white",
    fontWeight: "600",
    fontSize: RFValue(8),
  },
})

export default FloatingCartButton


