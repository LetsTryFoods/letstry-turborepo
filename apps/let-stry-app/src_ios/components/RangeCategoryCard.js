
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Pressable, 
//   Animated,
//   I18nManager,
// } from "react-native";
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
//     const run = () => {
//       anim.setValue(0);
//       Animated.loop(
//         Animated.timing(anim, {
//           toValue: 1,
//           duration: 1800,
//           useNativeDriver: true,
//         })
//       ).start();
//     };
//     run();
//     return () => anim.stopAnimation();
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

// const RangeCategoryCard = ({ product, onPress, onAddToCart, onRemoveFromCart }) => {
//   const [imageError, setImageError] = useState(false);
//   const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart();
//   const quantity = getItemQuantity(product?.id);
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const isOutOfStock = product?.inStock === false;

//   const handlePressIn = () => {
//     if (isOutOfStock) return;
//     Animated.spring(scaleAnim, {
//       toValue: 0.96,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     if (isOutOfStock) return;
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
//       ? require("../assets/images/product4.png")
//       : { uri: product.imageUrl };

//   const discountPercentage = Math.round(product.discountPercent || 0);
//   const actualPrice =
//     product.discountedPrice > 0 ? product.discountedPrice : product.price;
//   const mrp = product.price;
//   const showMRP =
//     product.discountedPrice > 0 && product.discountedPrice < product.price;

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

//   const ProductTag = ({ tagData }) => {
//     const tagText = useMemo(
//       () => (Array.isArray(tagData) && tagData.length > 0 ? tagData[0] : null),
//       [tagData]
//     );
//     if (!tagText) return null;

//     const getTagStyle = () => {
//       switch (tagText) {
//         case "Bestseller":
//           return styles.bestsellerTag;
//         case "Trending":
//           return styles.trendingTag;
//         case "Fasting":
//           return styles.fastingTag;
//         case "New Launched":
//           return styles.newLaunchTag;
//         case "Bought Earlier": 
//           return styles.boughtEarlierTag;
//         case "Gifting": 
//           return styles.giftingTag;
//         default:
//           return styles.defaultTag;
//       }
//     };
//     const dynamicTagStyle = getTagStyle();

//     return (
//       <View style={[styles.tagContainer, dynamicTagStyle]}>
//         <View style={styles.tagShimmerWrap}>
//           <TagShimmer width={100} height={24} borderRadius={6} />
//         </View>
//         <Text style={styles.tagText} numberOfLines={1}>
//           {tagText}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={isOutOfStock}>
//       <Animated.View style={[
//           styles.cardContainer,
//           { transform: [{ scale: scaleAnim }] },
//           isOutOfStock && styles.outOfStockCard,
//         ]}>
//         <View style={styles.card}>
//           <ProductTag tagData={product.title} />

//           <View>
//             <View style={styles.imageWrapper}>
//               <Image
//                 source={imageSource}
//                 style={styles.image}
//                 resizeMode="contain"
//                 onError={handleImageError}
//               />
//             </View>

//             <View style={styles.detailsContainer}>
//               <Text style={styles.name} numberOfLines={3}>
//                 {product.name || "Product Name"}
//               </Text>
//               <Text style={styles.weight}>{product.unit || "Unit"}</Text>

//               {discountPercentage > 0 && (
//                 <Text style={styles.discountText}>{`${discountPercentage}% OFF`}</Text>
//               )}

//               <View style={styles.priceContainer}>
//                 <Text style={styles.price}>₹{Number(actualPrice || 0).toFixed(2)}</Text>
//                 {showMRP && <Text style={styles.mrp}>₹{Number(mrp || 0).toFixed(2)}</Text>}
//               </View>
//             </View>
//           </View>

//           <View style={styles.actionsContainer} onStartShouldSetResponder={() => true}>
//             {isOutOfStock ? (
//               <View style={[styles.addButton, styles.outOfStockButton]}>
//                 <Text style={[styles.addButtonText, styles.outOfStockButtonText]}>Out of Stock</Text>
//               </View>
//             ) : quantity > 0 ? (
//               <View style={styles.quantityContainer}>
//                 <TouchableOpacity style={styles.quantityButton} onPress={handleRemoveFromCartPress}>
//                   <Text style={styles.quantityButtonText}>−</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.quantityValueText}>{quantity}</Text>
//                 <TouchableOpacity style={styles.quantityButton} onPress={handleAddToCartPress}>
//                   <Text style={styles.quantityButtonText}>+</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <TouchableOpacity style={styles.addButton} onPress={handleAddToCartPress}>
//                 <Text style={styles.addButtonText}>Add</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </Animated.View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   outOfStockCard: {
//     opacity: 0.6,
//   },
//   outOfStockTag: {
//     backgroundColor: '#B0B0B0',
//   },
//   outOfStockTagText: {
//     fontSize: RFValue(9),
//     fontWeight: "700",
//     color: "#FFFFFF",
//     textAlign: "center",
//   },
//   outOfStockButton: {
//     backgroundColor: '#E0E0E0',
//     borderColor: '#C0C0C0',
//   },
//   outOfStockButtonText: {
//     color: '#888888',
//     fontSize: RFValue(10),
//   },
//   cardContainer: {
//     width: wp("29.5%"),
//     marginHorizontal: wp("1%"),
//     marginBottom: hp("2%"),
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#F0F0F0",
//     height: hp("34%"),
//   },
//   card: {
//     padding: wp("2%"),
//     flex: 1,
//     flexDirection: "column",
//     justifyContent: "space-between",
//   },
//   tagContainer: {
//     position: "absolute",
//     top: hp("1.5%"), 
//     left: 0,
//     zIndex: 1, 
//     minWidth:  wp("20%"),
//     height: hp("2.5%"),
//     paddingHorizontal: 8,
//     borderTopRightRadius: 6,
//     borderBottomRightRadius: 6,
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   tagShimmerWrap: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   tagText: {
//     fontSize: RFValue(9),
//     fontWeight: "700",
//     color: "#444",
//     textAlign:"center",
//   },
//   bestsellerTag: {
//     backgroundColor: "#C5CAF4",
//   },
//   trendingTag: {
//     backgroundColor: "#F0BBD2",
//   },
//   fastingTag: {
//     backgroundColor: "#FBE9AE",
//   },
//   newLaunchTag: {
//     backgroundColor: "#B8EEB3", 
//   },
//   boughtEarlierTag: { 
//     backgroundColor: "#F4C09D",
//   },
//   giftingTag: { 
//     backgroundColor: "#FFCFD0",
//   },
//   defaultTag: {
//     backgroundColor: "#EDEDED",
//   },
//   imageWrapper: {
//     width: "100%",
//     height: hp("15%"),
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: -hp(".2%"),
//   },
//   image: {
//     width: "80%",
//     height: "80%",
//   },
//   detailsContainer: {
//     width: "100%",
//     alignItems: "flex-start",
//   },
//   name: {
//     fontSize: RFValue(11.5),
//     fontWeight: "700",
//     color: "#222",
//     minHeight: hp("4.5%"),
//   },
//   weight: {
//     fontSize: RFValue(10),
//     color: "#666",
//     marginBottom: hp("0.5%"),
//   },
//   discountText: {
//     fontSize: RFValue(9),
//     fontWeight: "bold",
//     color: "#3A86FF",
//     marginBottom: 4,
//   },
//   priceContainer: {
//     flexDirection: "row",
//     alignItems: "baseline",
//   },
//   price: {
//     fontSize: RFValue(11.5),
//     fontWeight: "bold",
//     color: "#222",
//     marginRight: wp("2%"),
//   },
//   mrp: {
//     fontSize: RFValue(9.5),
//     color: "#999",
//     textDecorationLine: "line-through",
//   },
//   actionsContainer: {
//     width: "100%",
//   },
//   addButton: {
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#0C5273",
//     borderRadius: 8,
//     paddingVertical: hp(".5%"),
//     width: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   addButtonText: {
//     color: "#0C5273",
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//     alignItems: "center",
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#0C5273",
//     borderRadius: 8,
//     justifyContent: "space-between",
//     paddingVertical: hp("0.5%"),
//     width: "100%",
//   },
//   quantityButton: {
//     width: "30%",
//     alignItems: "center",
//   },
//   quantityButtonText: {
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
//   quantityValueText: {
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
// });

// export default RangeCategoryCard;







// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Pressable, 
//   Animated,
//   I18nManager,
// } from "react-native";
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
//     const run = () => {
//       anim.setValue(0);
//       Animated.loop(
//         Animated.timing(anim, {
//           toValue: 1,
//           duration: 1800,
//           useNativeDriver: true,
//         })
//       ).start();
//     };
//     run();
//     return () => anim.stopAnimation();
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

// const RangeCategoryCard = ({ product, onPress, onAddToCart, onRemoveFromCart }) => {
//   const [imageError, setImageError] = useState(false);
//   const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart();
//   const quantity = getItemQuantity(product?.id);
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   // --- Logic for specified categories ---
//   const isOutOfStock =
//     product?.inStock === false ||
//     product?.category === "Pratham" ||
//     product?.category === "Cake & Muffins";

//   const handlePressIn = () => {
//     if (isOutOfStock) return;
//     Animated.spring(scaleAnim, {
//       toValue: 0.96,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     if (isOutOfStock) return;
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
//       ? require("../assets/images/product4.png")
//       : { uri: product.imageUrl };

//   const discountPercentage = Math.round(product.discountPercent || 0);
//   const actualPrice =
//     product.discountedPrice > 0 ? product.discountedPrice : product.price;
//   const mrp = product.price;
//   const showMRP =
//     product.discountedPrice > 0 && product.discountedPrice < product.price;

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

//   const ProductTag = ({ tagData }) => {
//     const tagText = useMemo(
//       () => (Array.isArray(tagData) && tagData.length > 0 ? tagData[0] : null),
//       [tagData]
//     );
//     if (!tagText) return null;

//     const getTagStyle = () => {
//       switch (tagText) {
//         case "Bestseller":
//           return styles.bestsellerTag;
//         case "Trending":
//           return styles.trendingTag;
//         case "Fasting":
//           return styles.fastingTag;
//         case "New Launched":
//           return styles.newLaunchTag;
//         case "Bought Earlier": 
//           return styles.boughtEarlierTag;
//         case "Gifting": 
//           return styles.giftingTag;
//         default:
//           return styles.defaultTag;
//       }
//     };
//     const dynamicTagStyle = getTagStyle();

//     return (
//       <View style={[styles.tagContainer, dynamicTagStyle]}>
//         <View style={styles.tagShimmerWrap}>
//           <TagShimmer width={100} height={24} borderRadius={6} />
//         </View>
//         <Text style={styles.tagText} numberOfLines={1}>
//           {tagText}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={isOutOfStock}>
//       <Animated.View style={[
//           styles.cardContainer,
//           { transform: [{ scale: scaleAnim }] },
//           isOutOfStock && styles.outOfStockCard,
//         ]}>
//         <View style={styles.card}>
//           <ProductTag tagData={product.title} />

//           <View>
//             <View style={styles.imageWrapper}>
//               <Image
//                 source={imageSource}
//                 style={styles.image}
//                 resizeMode="contain"
//                 onError={handleImageError}
//               />
//             </View>

//             <View style={styles.detailsContainer}>
//               <Text style={styles.name} numberOfLines={3}>
//                 {product.name || "Product Name"}
//               </Text>
//               <Text style={styles.weight}>{product.unit || "Unit"}</Text>

//               {discountPercentage > 0 && (
//                 <Text style={styles.discountText}>{`${discountPercentage}% OFF`}</Text>
//               )}

//               <View style={styles.priceContainer}>
//                 <Text style={styles.price}>₹{Number(actualPrice || 0).toFixed(2)}</Text>
//                 {showMRP && <Text style={styles.mrp}>₹{Number(mrp || 0).toFixed(2)}</Text>}
//               </View>
//             </View>
//           </View>

//           <View style={styles.actionsContainer} onStartShouldSetResponder={() => true}>
//             {isOutOfStock ? (
//               <View style={[styles.addButton, styles.outOfStockButton]}>
//                 <Text style={[styles.addButtonText, styles.outOfStockButtonText]}>Out of Stock</Text>
//               </View>
//             ) : quantity > 0 ? (
//               <View style={styles.quantityContainer}>
//                 <TouchableOpacity style={styles.quantityButton} onPress={handleRemoveFromCartPress}>
//                   <Text style={styles.quantityButtonText}>−</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.quantityValueText}>{quantity}</Text>
//                 <TouchableOpacity style={styles.quantityButton} onPress={handleAddToCartPress}>
//                   <Text style={styles.quantityButtonText}>+</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <TouchableOpacity style={styles.addButton} onPress={handleAddToCartPress}>
//                 <Text style={styles.addButtonText}>Add</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </Animated.View>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   outOfStockCard: {
//     opacity: 0.6,
//   },
//   outOfStockTag: {
//     backgroundColor: '#B0B0B0',
//   },
//   outOfStockTagText: {
//     fontSize: RFValue(9),
//     fontWeight: "700",
//     color: "#FFFFFF",
//     textAlign: "center",
//   },
//   outOfStockButton: {
//     backgroundColor: '#E0E0E0',
//     borderColor: '#C0C0C0',
//   },
//   outOfStockButtonText: {
//     color: '#888888',
//     fontSize: RFValue(10),
//   },
//   cardContainer: {
//     width: wp("29.5%"),
//     marginHorizontal: wp("1%"),
//     marginBottom: hp("2%"),
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#F0F0F0",
//     height: hp("34%"),
//   },
//   card: {
//     padding: wp("2%"),
//     flex: 1,
//     flexDirection: "column",
//     justifyContent: "space-between",
//   },
//   tagContainer: {
//     position: "absolute",
//     top: hp("1.5%"), 
//     left: 0,
//     zIndex: 1, 
//     minWidth:  wp("20%"),
//     height: hp("2.5%"),
//     paddingHorizontal: 8,
//     borderTopRightRadius: 6,
//     borderBottomRightRadius: 6,
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   tagShimmerWrap: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   tagText: {
//     fontSize: RFValue(9),
//     fontWeight: "700",
//     color: "#444",
//     textAlign:"center",
//   },
//   bestsellerTag: {
//     backgroundColor: "#C5CAF4",
//   },
//   trendingTag: {
//     backgroundColor: "#F0BBD2",
//   },
//   fastingTag: {
//     backgroundColor: "#FBE9AE",
//   },
//   newLaunchTag: {
//     backgroundColor: "#B8EEB3", 
//   },
//   boughtEarlierTag: { 
//     backgroundColor: "#F4C09D",
//   },
//   giftingTag: { 
//     backgroundColor: "#FFCFD0",
//   },
//   defaultTag: {
//     backgroundColor: "#EDEDED",
//   },
//   imageWrapper: {
//     width: "100%",
//     height: hp("15%"),
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: -hp(".2%"),
//   },
//   image: {
//     width: "80%",
//     height: "80%",
//   },
//   detailsContainer: {
//     width: "100%",
//     alignItems: "flex-start",
//   },
//   name: {
//     fontSize: RFValue(11.5),
//     fontWeight: "700",
//     color: "#222",
//     minHeight: hp("4.5%"),
//   },
//   weight: {
//     fontSize: RFValue(10),
//     color: "#666",
//     marginBottom: hp("0.5%"),
//   },
//   discountText: {
//     fontSize: RFValue(9),
//     fontWeight: "bold",
//     color: "#3A86FF",
//     marginBottom: 4,
//   },
//   priceContainer: {
//     flexDirection: "row",
//     alignItems: "baseline",
//   },
//   price: {
//     fontSize: RFValue(11.5),
//     fontWeight: "bold",
//     color: "#222",
//     marginRight: wp("2%"),
//   },
//   mrp: {
//     fontSize: RFValue(9.5),
//     color: "#999",
//     textDecorationLine: "line-through",
//   },
//   actionsContainer: {
//     width: "100%",
//   },
//   addButton: {
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#0C5273",
//     borderRadius: 8,
//     paddingVertical: hp(".5%"),
//     width: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   addButtonText: {
//     color: "#0C5273",
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//     alignItems: "center",
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#0C5273",
//     borderRadius: 8,
//     justifyContent: "space-between",
//     paddingVertical: hp("0.5%"),
//     width: "100%",
//   },
//   quantityButton: {
//     width: "30%",
//     alignItems: "center",
//   },
//   quantityButtonText: {
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
//   quantityValueText: {
//     fontSize: RFValue(12.5),
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
// });

// export default RangeCategoryCard;





















import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable, 
  Animated,
  I18nManager,
} from "react-native";
// 1. Import FastImage and remove the standard Image component
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useCart } from "../context/CartContext";

const TagShimmer = ({ width = 90, height = 22, borderRadius = 6 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      anim.setValue(0);
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        })
      ).start();
    };
    run();
    return () => anim.stopAnimation();
  }, [anim]);

  const isRTL = I18nManager.isRTL;
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: isRTL ? [width, -width] : [-width, width],
  });

  return (
    <View style={{ width, height, overflow: "hidden", borderRadius }}>
      <View style={{ ...StyleSheet.absoluteFillObject, opacity: 0.1, backgroundColor: "#fff" }} />
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: width * 0.8,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0.0)"]}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const RangeCategoryCard = ({ product, onPress, onAddToCart, onRemoveFromCart }) => {
  const [imageError, setImageError] = useState(false);
  const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product?.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isOutOfStock =
    product?.inStock === false ||
    product?.category === "Pratham" ||
    product?.category === "Cake & Muffins";

  const handlePressIn = () => {
    if (isOutOfStock) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isOutOfStock) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4, 
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (!product || typeof product !== "object") return null;

  const handleImageError = () => setImageError(true);

  // 2. Updated imageSource for FastImage with caching properties
  const imageSource =
    imageError || !product.imageUrl
      ? require("../assets/images/product4.png")
      : { 
          uri: product.imageUrl,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        };

  const discountPercentage = Math.round(product.discountPercent || 0);
  const actualPrice =
    product.discountedPrice > 0 ? product.discountedPrice : product.price;
  const mrp = product.price;
  const showMRP =
    product.discountedPrice > 0 && product.discountedPrice < product.price;

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

  const ProductTag = ({ tagData }) => {
    const tagText = useMemo(
      () => (Array.isArray(tagData) && tagData.length > 0 ? tagData[0] : null),
      [tagData]
    );
    if (!tagText) return null;

    const getTagStyle = () => {
      switch (tagText) {
        case "Bestseller":
          return styles.bestsellerTag;
        case "Trending":
          return styles.trendingTag;
        case "Fasting":
          return styles.fastingTag;
        case "New Launched":
          return styles.newLaunchTag;
        case "Bought Earlier": 
          return styles.boughtEarlierTag;
        case "Gifting": 
          return styles.giftingTag;
        default:
          return styles.defaultTag;
      }
    };
    const dynamicTagStyle = getTagStyle();

    return (
      <View style={[styles.tagContainer, dynamicTagStyle]}>
        <View style={styles.tagShimmerWrap}>
          <TagShimmer width={100} height={24} borderRadius={6} />
        </View>
        <Text style={styles.tagText} numberOfLines={1}>
          {tagText}
        </Text>
      </View>
    );
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={isOutOfStock}>
      <Animated.View style={[
          styles.cardContainer,
          { transform: [{ scale: scaleAnim }] },
          isOutOfStock && styles.outOfStockCard,
        ]}>
        <View style={styles.card}>
          <ProductTag tagData={product.title} />

          <View>
            <View style={styles.imageWrapper}>
              {/* 3. Replaced Image with FastImage */}
              <FastImage
                source={imageSource}
                style={styles.image}
                resizeMode={FastImage.resizeMode.contain}
                onError={handleImageError}
              />
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.name} numberOfLines={3}>
                {product.name || "Product Name"}
              </Text>
              <Text style={styles.weight}>{product.unit || "Unit"}</Text>

              {discountPercentage > 0 && (
                <Text style={styles.discountText}>{`${discountPercentage}% OFF`}</Text>
              )}

              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{Number(actualPrice || 0).toFixed(2)}</Text>
                {showMRP && <Text style={styles.mrp}>₹{Number(mrp || 0).toFixed(2)}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer} onStartShouldSetResponder={() => true}>
            {isOutOfStock ? (
              <View style={[styles.addButton, styles.outOfStockButton]}>
                <Text style={[styles.addButtonText, styles.outOfStockButtonText]}>Out of Stock</Text>
              </View>
            ) : quantity > 0 ? (
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton} onPress={handleRemoveFromCartPress}>
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValueText}>{quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={handleAddToCartPress}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={handleAddToCartPress}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outOfStockCard: {
    opacity: 0.6,
  },
  outOfStockTag: {
    backgroundColor: '#B0B0B0',
  },
  outOfStockTagText: {
    fontSize: RFValue(9),
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  outOfStockButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#C0C0C0',
  },
  outOfStockButtonText: {
    color: '#888888',
    fontSize: RFValue(10),
  },
  cardContainer: {
    width: wp("29.5%"),
    marginHorizontal: wp("1%"),
    marginBottom: hp("2%"),
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    height: hp("34%"),
  },
  card: {
    padding: wp("2%"),
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tagContainer: {
    position: "absolute",
    top: hp("1.5%"), 
    left: 0,
    zIndex: 1, 
    minWidth:  wp("20%"),
    height: hp("2.5%"),
    paddingHorizontal: 8,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    justifyContent: "center",
    overflow: "hidden",
  },
  tagShimmerWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  tagText: {
    fontSize: RFValue(9),
    fontWeight: "700",
    color: "#444",
    textAlign:"center",
  },
  bestsellerTag: {
    backgroundColor: "#C5CAF4",
  },
  trendingTag: {
    backgroundColor: "#F0BBD2",
  },
  fastingTag: {
    backgroundColor: "#FBE9AE",
  },
  newLaunchTag: {
    backgroundColor: "#B8EEB3", 
  },
  boughtEarlierTag: { 
    backgroundColor: "#F4C09D",
  },
  giftingTag: { 
    backgroundColor: "#FFCFD0",
  },
  defaultTag: {
    backgroundColor: "#EDEDED",
  },
  imageWrapper: {
    width: "100%",
    height: hp("15%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: -hp(".2%"),
  },
  image: {
    width: "80%",
    height: "80%",
  },
  detailsContainer: {
    width: "100%",
    alignItems: "flex-start",
  },
  name: {
    fontSize: RFValue(11.5),
    fontWeight: "700",
    color: "#222",
    minHeight: hp("4.5%"),
  },
  weight: {
    fontSize: RFValue(10),
    color: "#666",
    marginBottom: hp("0.5%"),
  },
  discountText: {
    fontSize: RFValue(9),
    fontWeight: "bold",
    color: "#3A86FF",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: RFValue(11.5),
    fontWeight: "bold",
    color: "#222",
    marginRight: wp("2%"),
  },
  mrp: {
    fontSize: RFValue(9.5),
    color: "#999",
    textDecorationLine: "line-through",
  },
  actionsContainer: {
    width: "100%",
  },
  addButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0C5273",
    borderRadius: 8,
    paddingVertical: hp(".5%"),
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#0C5273",
    fontSize: RFValue(12.5),
    fontWeight: "bold",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C5273",
    borderRadius: 8,
    justifyContent: "space-between",
    paddingVertical: hp("0.5%"),
    width: "100%",
  },
  quantityButton: {
    width: "30%",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: RFValue(12.5),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  quantityValueText: {
    fontSize: RFValue(12.5),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default RangeCategoryCard;