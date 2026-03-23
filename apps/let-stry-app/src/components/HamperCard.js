
// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Pressable,
//   Animated,
//   I18nManager,
// } from "react-native";
// import FastImage from "react-native-fast-image";
// import LinearGradient from "react-native-linear-gradient";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { useCart } from "../context/CartContext";

// const TagShimmer = ({ width = 90, height = 22, borderRadius = 6 }) => {
//   const anim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(anim, {
//         toValue: 1,
//         duration: 1800,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, [anim]);

//   const isRTL = I18nManager.isRTL;
//   const translateX = anim.interpolate({
//     inputRange: [0, 1],
//     outputRange: isRTL ? [width, -width] : [-width, width],
//   });

//   return (
//     <View style={{ width, height, overflow: "hidden", borderRadius }}>
//       <View style={{ ...StyleSheet.absoluteFillObject, opacity: 0.1, backgroundColor: "#fff" }} />
//       <Animated.View
//         style={{
//           position: "absolute",
//           top: 0,
//           bottom: 0,
//           width: width * 0.8,
//           transform: [{ translateX }],
//         }}
//       >
//         <LinearGradient
//           start={{ x: 0, y: 0.5 }}
//           end={{ x: 1, y: 0.5 }}
//           colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0.0)"]}
//           style={{ flex: 1 }}
//         />
//       </Animated.View>
//     </View>
//   );
// };

// const HamperCard = ({ product, onPress, onAddToCart, onRemoveFromCart }) => {
//   const [imageError, setImageError] = useState(false);
//   const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart();
//   const quantity = getItemQuantity(product?.id);
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.96,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       friction: 4,
//       tension: 40,
//       useNativeDriver: true,
//     }).start();
//   };

//   if (!product || typeof product !== "object") return null;

//   const handleImageError = () => setImageError(true);

//   const imageSource =
//     imageError || !product.imageUrl
//       ? require("../assets/images/nigga.png")
//       : {
//           uri: product.imageUrl,
//           priority: FastImage.priority.normal,
//           cache: FastImage.cacheControl.immutable,
//         };

//   const discountPercentage = Math.round(product.discountPercent || 0);
//   const mrp = product.price;
//   const actualPrice =
//     discountPercentage > 0 ? mrp - (mrp * discountPercentage) / 100 : mrp;
//   const showMRP = discountPercentage > 0;

//   const handleAddToCartPress = (e) => {
//     e.stopPropagation();
//     if (onAddToCart) onAddToCart(product);
//     else addItemToCart(product);
//   };

//   const handleRemoveFromCartPress = (e) => {
//     e.stopPropagation();
//     if (onRemoveFromCart) onRemoveFromCart(product);
//     else removeItemFromCart(product);
//   };

//   return (
//     <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
//       <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
//         <View style={styles.imageWrapper}>
//           <FastImage
//             source={imageSource}
//             style={styles.image}
//             resizeMode={FastImage.resizeMode.cover}
//             onError={handleImageError}
//           />
//         </View>

//         <View style={styles.content}>
//           <Text
//             style={styles.title}
//             adjustsFontSizeToFit
//             minimumFontScale={0.85}
//           >
//             {product.name || "Healthy Treats"}
//           </Text>

//           <Text
//             style={styles.weight}
//             adjustsFontSizeToFit
//             minimumFontScale={0.85}
//           >
//             {product.weight ? `${product.weight}` : "640 gm"}
//           </Text>

//           {discountPercentage > 0 && (
//             <Text
//               style={styles.discount}
//               adjustsFontSizeToFit
//               minimumFontScale={0.85}
//             >
//               {`${discountPercentage}% OFF`}
//             </Text>
//           )}

//           <View style={styles.priceRow}>
//             <Text
//               style={styles.price}
//               adjustsFontSizeToFit
//               minimumFontScale={0.85}
//             >
//               ₹{Number(actualPrice).toFixed(2)}
//             </Text>
//             {showMRP && (
//               <Text
//                 style={styles.mrp}
//                 adjustsFontSizeToFit
//                 minimumFontScale={0.85}
//               >
//                 ₹{Number(mrp).toFixed(2)}
//               </Text>
//             )}
//           </View>

//           <TouchableOpacity style={styles.addButton} onPress={handleAddToCartPress}>
//             <Text
//               style={styles.addText}
//               adjustsFontSizeToFit
//               minimumFontScale={0.85}
//             >
//               Add
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   cardContainer: {
//     width: wp("42%"),
//     borderRadius: 6,
//     backgroundColor: "#FBE9AE",
//     height: hp("33%"),
//     margin: wp("2%"),
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//     overflow: "hidden",
//   },
//   imageWrapper: {
//     width: "100%",
//     height: hp("14%"),
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//     overflow: "hidden",
//     padding: wp("1%"),
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 6,
//   },
//   content: {
//     paddingVertical: hp("1%"),
//     paddingHorizontal: wp("3%"),
//   },
//   title: {
//     fontSize: RFValue(12),
//     fontWeight: "700",
//     color: "#000",
//     marginBottom: hp("0.4%"),
//   },
//   weight: {
//     fontSize: RFValue(10),
//     color: "#666",
//     marginBottom: hp("0.8%"),
//   },
//   discount: {
//     fontSize: RFValue(10),
//     color: "#1B4EA0",
//     fontWeight: "600",
//     marginBottom: hp("0.8%"),
//   },
//   priceRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: hp("1.4%"),
//   },
//   price: {
//     fontSize: RFValue(12),
//     fontWeight: "bold",
//     color: "#000",
//     marginRight: wp("2%"),
//   },
//   mrp: {
//     fontSize: RFValue(10),
//     color: "#999",
//     textDecorationLine: "line-through",
//   },
//   addButton: {
//     backgroundColor: "#0C5273",
//     borderRadius: 5,
//     paddingVertical: hp(".8%"),
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   addText: {
//     color: "#fff",
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//   },
// });

// export default HamperCard;










// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Pressable,
//   Animated,
//   I18nManager,
// } from "react-native";
// import FastImage from "react-native-fast-image";
// import LinearGradient from "react-native-linear-gradient";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { useCart } from "../context/CartContext";

// const TagShimmer = ({ width = 90, height = 22, borderRadius = 6 }) => {
//   const anim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(anim, {
//         toValue: 1,
//         duration: 1800,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, [anim]);

//   const isRTL = I18nManager.isRTL;
//   const translateX = anim.interpolate({
//     inputRange: [0, 1],
//     outputRange: isRTL ? [width, -width] : [-width, width],
//   });

//   return (
//     <View style={{ width, height, overflow: "hidden", borderRadius }}>
//       <View style={{ ...StyleSheet.absoluteFillObject, opacity: 0.1, backgroundColor: "#fff" }} />
//       <Animated.View
//         style={{
//           position: "absolute",
//           top: 0,
//           bottom: 0,
//           width: width * 0.8,
//           transform: [{ translateX }],
//         }}
//       >
//         <LinearGradient
//           start={{ x: 0, y: 0.5 }}
//           end={{ x: 1, y: 0.5 }}
//           colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0.0)"]}
//           style={{ flex: 1 }}
//         />
//       </Animated.View>
//     </View>
//   );
// };

// const HamperCard = ({ product, onPress, onAddToCart, onRemoveFromCart }) => {
//   const [imageError, setImageError] = useState(false);
//   const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart();
//   const quantity = getItemQuantity(product?.id); // Gets the current quantity
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.96,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       friction: 4,
//       tension: 40,
//       useNativeDriver: true,
//     }).start();
//   };

//   if (!product || typeof product !== "object") return null;

//   const handleImageError = () => setImageError(true);

//   const imageSource =
//     imageError || !product.imageUrl
//       ? require("../assets/images/nigga.png")
//       : {
//           uri: product.imageUrl,
//           priority: FastImage.priority.normal,
//           cache: FastImage.cacheControl.immutable,
//         };

//   const discountPercentage = Math.round(product.discountPercent || 0);
//   const mrp = product.price;
//   const actualPrice =
//     discountPercentage > 0 ? mrp - (mrp * discountPercentage) / 100 : mrp;
//   const showMRP = discountPercentage > 0;

//   const handleAddToCartPress = (e) => {
//     e.stopPropagation();
//     if (onAddToCart) onAddToCart(product);
//     else addItemToCart(product);
//   };

//   const handleRemoveFromCartPress = (e) => {
//     e.stopPropagation();
//     if (onRemoveFromCart) onRemoveFromCart(product);
//     else removeItemFromCart(product);
//   };

//   const renderAddButton = () => {
//     if (quantity > 0) {
//       // Quantity control view
//       return (
//         <View style={styles.quantityControlContainer}>
//           {/* Decrement Button (-) */}
//           <TouchableOpacity 
//             style={styles.quantityButton} 
//             onPress={handleRemoveFromCartPress}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.quantityButtonText}>-</Text>
//           </TouchableOpacity>

//           {/* Quantity Text */}
//           <Text style={styles.quantityText}>{quantity}</Text>

//           {/* Increment Button (+) */}
//           <TouchableOpacity 
//             style={styles.quantityButton} 
//             onPress={handleAddToCartPress}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.quantityButtonText}>+</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     // Standard Add Button
//     return (
//       <TouchableOpacity 
//         style={styles.addButton} 
//         onPress={handleAddToCartPress}
//         activeOpacity={0.7}
//       >
//         <Text
//           style={styles.addText}
//           adjustsFontSizeToFit
//           minimumFontScale={0.85}
//         >
//           Add
//         </Text>
//       </TouchableOpacity>
//     );
//   };


//   return (
//     <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
//       <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
//         <View style={styles.imageWrapper}>
//           <FastImage
//             source={imageSource}
//             style={styles.image}
//             resizeMode={FastImage.resizeMode.cover}
//             onError={handleImageError}
//           />
//         </View>

//         <View style={styles.content}>
//           <Text
//             style={styles.title}
//             adjustsFontSizeToFit
//             minimumFontScale={0.85}
//           >
//             {product.name || "Healthy Treats"}
//           </Text>

//           <Text
//             style={styles.weight}
//             adjustsFontSizeToFit
//             minimumFontScale={0.85}
//           >
//             {product.weight ? `${product.weight}` : "640 gm"}
//           </Text>

//           {discountPercentage > 0 && (
//             <Text
//               style={styles.discount}
//               adjustsFontSizeToFit
//               minimumFontScale={0.85}
//             >
//               {`${discountPercentage}% OFF`}
//             </Text>
//           )}

//           <View style={styles.priceRow}>
//             <Text
//               style={styles.price}
//               adjustsFontSizeToFit
//               minimumFontScale={0.85}
//             >
//               ₹{Number(actualPrice).toFixed(2)}
//             </Text>
//             {showMRP && (
//               <Text
//                 style={styles.mrp}
//                 adjustsFontSizeToFit
//                 minimumFontScale={0.85}
//               >
//                 ₹{Number(mrp).toFixed(2)}
//               </Text>
//             )}
//           </View>

//           {/* Render the appropriate button/quantity control */}
//           {renderAddButton()}
//         </View>
//       </Animated.View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   cardContainer: {
//     width: wp("42%"),
//     borderRadius: 6,
//     backgroundColor: "#FBE9AE",
//     height: hp("33%"),
//     margin: wp("2%"),
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//     overflow: "hidden",
//   },
//   imageWrapper: {
//     width: "100%",
//     height: hp("14%"),
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//     overflow: "hidden",
//     padding: wp("1%"),
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 6,
//   },
//   content: {
//     paddingVertical: hp("1%"),
//     paddingHorizontal: wp("3%"),
//   },
//   title: {
//     fontSize: RFValue(12),
//     fontWeight: "700",
//     color: "#000",
//     marginBottom: hp("0.4%"),
//   },
//   weight: {
//     fontSize: RFValue(10),
//     color: "#666",
//     marginBottom: hp("0.8%"),
//   },
//   discount: {
//     fontSize: RFValue(10),
//     color: "#1B4EA0",
//     fontWeight: "600",
//     marginBottom: hp("0.8%"),
//   },
//   priceRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: hp("1.4%"),
//   },
//   price: {
//     fontSize: RFValue(12),
//     fontWeight: "bold",
//     color: "#000",
//     marginRight: wp("2%"),
//   },
//   mrp: {
//     fontSize: RFValue(10),
//     color: "#999",
//     textDecorationLine: "line-through",
//   },
//   // --- Standard Add Button Styles ---
//   addButton: {
//     backgroundColor: "#0C5273",
//     borderRadius: 5,
//     paddingVertical: hp(".8%"),
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   addText: {
//     color: "#fff",
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//   },
//   // --- New Quantity Control Styles ---
//   quantityControlContainer: {
//     flexDirection: "row",
//     backgroundColor: "#0C5273", // Background color for the quantity view
//     borderRadius: 5,
//     height: hp("3.8%"), // Adjusted height for better vertical alignment
//     overflow: 'hidden', // To ensure rounded corners
//   },
//   quantityButton: {
//     flex: 1, // Distribute space
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   quantityButtonText: {
//     color: "#fff", // White color for +/-
//     fontSize: RFValue(16), // Larger size for better visibility
//     fontWeight: "bold",
//     lineHeight: RFValue(16), // Helps center the text vertically
//   },
//   quantityText: {
//     backgroundColor: "#0c5273", // White background for the quantity count
//     color: "#fff", // Dark color for the quantity count text
//     width: wp("8%"), // Fixed width for the count display
//     textAlign: "center",
//     textAlignVertical: 'center', // Align text vertically (Android)
//     lineHeight: hp("3.8%"), // Align text vertically (iOS)
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//   },
// });

// export default HamperCard;









import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import FastImage from "react-native-fast-image";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useCart } from "../context/CartContext";

const HamperCard = ({ product, onPress, onAddToCart, onRemoveFromCart }) => {
  const [imageError, setImageError] = useState(false);
  const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart();
  
  if (!product || typeof product !== "object") {
    return null; 
  }

  const quantity = getItemQuantity(product.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleImageError = () => setImageError(true);

  const imageSource =
    imageError || !product.imageUrl
      ? require("../assets/images/product4.png")
      : {
          uri: product.imageUrl,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        };

  const discountPercentage = Math.round(product.discountPercent || 0);
  const mrp = product.price;
  const actualPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const showMRP = product.discountPrice > 0 && product.discountPrice < product.price;

  const handleAddToCartPress = (e) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
    else addItemToCart(product);
  };

  const handleRemoveFromCartPress = (e) => {
    e.stopPropagation();
    if (onRemoveFromCart) onRemoveFromCart(product);
    else removeItemFromCart(product);
  };

  const renderAddButton = () => {
    if (quantity > 0) {
      return (
        <View style={styles.quantityControlContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={handleRemoveFromCartPress}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={handleAddToCartPress}
            activeOpacity={0.7}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddToCartPress}
        activeOpacity={0.7}
      >
        <Text
          style={styles.addText}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          Add
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.imageWrapper}>
          <FastImage
            source={imageSource}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
            onError={handleImageError}
          />
        </View>

        <View style={styles.content}>
          <Text
            style={styles.title}
            
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            //numberOfLines={2}
          >
            {product.name || "Product Name"}
          </Text>

          <Text
            style={styles.weight}
          >
            {product.unit || ""}
          </Text>

          {discountPercentage > 0 && (
            <Text
              style={styles.discount}
            >
              {`${discountPercentage}% OFF`}
            </Text>
          )}

          <View style={styles.priceRow}>
            <Text
              style={styles.price}
            >
              ₹{Number(actualPrice).toFixed(2)}
            </Text>
            {showMRP && (
              <Text
                style={styles.mrp}
              >
                ₹{Number(mrp).toFixed(2)}
              </Text>
            )}
          </View>

          {renderAddButton()}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: wp("42%"),
    borderRadius: 6,
    backgroundColor: "#FBE9AE",
    height: hp("33%"),
    margin: wp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    height: hp("14%"),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    padding: wp("1%"),
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  content: {
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
  },
  title: {
    fontSize: RFValue(11.5),
    fontWeight: "700",
    color: "#000",
    marginBottom: hp("0.4%"),
    height: hp('4.5%'),
  },
  weight: {
    fontSize: RFValue(10),
    color: "#666",
    marginBottom: hp("0.8%"),
  },
  discount: {
    fontSize: RFValue(10),
    color: "#1B4EA0",
    fontWeight: "600",
    marginBottom: hp("0.8%"),
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("1.4%"),
  },
  price: {
    fontSize: RFValue(12),
    fontWeight: "bold",
    color: "#000",
    marginRight: wp("2%"),
  },
  mrp: {
    fontSize: RFValue(10),
    color: "#999",
    textDecorationLine: "line-through",
  },
  addButton: {
    backgroundColor: "#0C5273",
    borderRadius: 5,
    paddingVertical: hp(".8%"),
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    color: "#fff",
    fontSize: RFValue(12.5),
    fontWeight: "bold",
  },
  quantityControlContainer: {
    flexDirection: "row",
    backgroundColor: "#0C5273",
    borderRadius: 5,
    height: hp("3.8%"),
    overflow: 'hidden',
  },
  quantityButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: RFValue(16),
    fontWeight: "bold",
    lineHeight: RFValue(16),
  },
  quantityText: {
    backgroundColor: "#0c5273",
    color: "#fff",
    width: wp("8%"),
    textAlign: "center",
    textAlignVertical: 'center',
    lineHeight: hp("3.8%"),
    fontSize: RFValue(12.5),
    fontWeight: "bold",
  },
});

export default HamperCard;