
// import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   Platform,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Ionicons from "react-native-vector-icons/Ionicons";
// // ✅ FIX: Isko import karna zaroori hai
// import { useSafeAreaInsets } from "react-native-safe-area-context"; 
// import { fetchFoodList } from "../services/FoodService";
// import CategoryItem from "../components/CategoryItem";
// import EventProductCard from "../components/EventProductCard";
// import FloatingCartButton from "../components/FloatingCartButton";
// import { useCart } from "../context/CartContext";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { useQuery } from "@tanstack/react-query";
// import CategoryScreenShimmer from "../components/CategoryScreenShimmer";

// const CATEGORIES = [
//   "All Products",
//   "Purani Delhi",
//   "Fasting Special",
//   "Cake & Muffins",
//   "Indian Sweets",
//   "Healthy Snacks",
//   "Bhujia",
//   "Cookies",
//   "Rusk",
//   "Munchies",
//   "Pratham",
//   "Chips n Crisps",
//   "South Range",
// ];

// // ✅ FIX: Header ko robust banaya hai. Gradient alag, content alag.
// const GradientHeader = ({ title = "Categories", onBack, onSearch, insets }) => (
//   <LinearGradient
//     colors={["#F2D377", "#F5F5F5"]}
//     start={{ x: 0, y: 0 }}
//     end={{ x: 0, y: 1 }}
//     style={headerStyles.gradient} // Gradient pe koi vertical padding nahi
//   >
//     {/* Saara content is View ke andar hai, jisko upar se padding milegi */}
//     <View style={{ paddingTop: insets.top }}>
//       <View style={headerStyles.headerContent}>
//         {onBack ? (
//           <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
//             <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
//           </TouchableOpacity>
//         ) : (
//           <View style={headerStyles.iconPlaceholder} />
//         )}
//         <Text
//           style={headerStyles.title}
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//         >
//           {title}
//         </Text>
//         <TouchableOpacity onPress={onSearch} style={headerStyles.iconButton}>
//           <Ionicons name="search" size={RFValue(20)} color="#222" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   </LinearGradient>
// );

// const CategoriesScreen = ({ navigation, route }) => {
//   const { selectedCategory: initialCategory } = route.params || {};
//   const [selectedCategory, setSelectedCategory] = useState(
//     initialCategory || CATEGORIES[0]
//   );
//   const { cartCount } = useCart();
//   const insets = useSafeAreaInsets(); // Hook se safe area ki values li

//   const scrollY = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);
//   const categoryFlatListRef = useRef(null);

//   const [contentHeight, setContentHeight] = useState(1);
//   const [scrollViewHeight, setScrollViewHeight] = useState(0);

//   const {
//     data: products = [],
//     isLoading,
//     isError,
//     refetch,
//   } = useQuery({
//     queryKey: ['products'],
//     queryFn: fetchFoodList,
//   });

//   const filteredProducts = useMemo(() => {
//     if (selectedCategory === "All Products") return products;
//     return products.filter(
//       (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
//     );
//   }, [selectedCategory, products]);

//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     await refetch();
//     setIsRefreshing(false);
//   }, [refetch]);

//   useEffect(() => {
//     if (route.params?.selectedCategory) {
//       const newCategory = route.params.selectedCategory;
//       setSelectedCategory(newCategory);
//       const index = CATEGORIES.indexOf(newCategory);
//       if (index > -1 && categoryFlatListRef.current) {
//         categoryFlatListRef.current.scrollToIndex({ index, animated: true });
//       }
//     }
//   }, [route.params]);

//   const FIXED_THUMB_HEIGHT = hp(5);
//   const CATEGORY_ITEM_HEIGHT = hp(6.5);
//   const maxThumbTranslateY = scrollViewHeight - FIXED_THUMB_HEIGHT;

//   const translateY = scrollY.interpolate({
//     inputRange: [0, Math.max(contentHeight - scrollViewHeight, 1)],
//     outputRange: [0, maxThumbTranslateY],
//     extrapolate: "clamp",
//   });

//   const renderItem = ({ item }) => (
//     <View style={styles.productCardContainer}>
//       <EventProductCard
//         product={item}
//         onPress={() =>
//           navigation.navigate("ProductDetails", { productId: item.id })
//         }
//       />
//     </View>
//   );

//   const renderCategoryItem = ({ item }) => {
//     const isSelected = item === selectedCategory;
//     return (
//       <View style={styles.categoryItemContainer}>
//         <CategoryItem
//           category={item}
//           isSelected={isSelected}
//           onSelect={setSelectedCategory}
//         />
//         {isSelected && <View style={styles.selectedIndicator} />}
//       </View>
//     );
//   };

//   return (
//     // ✅ FIX: Root component normal View hai, SafeAreaView nahi
//     <View style={styles.container}> 
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="dark-content"
//       />

//       <GradientHeader
//         title="Categories"
//         insets={insets}
//         onBack={() =>
//           navigation.reset({
//             index: 0,
//             routes: [{ name: "MainApp" }],
//           })
//         }
//         onSearch={() => navigation.navigate("Search")}
//       />

//       {isLoading ? (
//         <CategoryScreenShimmer />
//       ) : (
//         <View style={styles.content}>
//           <View style={styles.categoriesContainer}>
//             <FlatList
//               ref={categoryFlatListRef}
//               data={CATEGORIES}
//               renderItem={renderCategoryItem}
//               keyExtractor={(item) => `category-${item}`}
//               showsVerticalScrollIndicator={false}
//               initialScrollIndex={CATEGORIES.indexOf(selectedCategory)}
//               getItemLayout={(data, index) => ({
//                 length: CATEGORY_ITEM_HEIGHT,
//                 offset: CATEGORY_ITEM_HEIGHT * index,
//                 index,
//               })}
//             />
//           </View>

//           <View
//             style={styles.productsContainer}
//             onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
//           >
//             {filteredProducts.length === 0 ? (
//               <Text style={styles.noProductsText}>No products found</Text>
//             ) : (
//               <>
//                 <Animated.FlatList
//                   ref={flatListRef}
//                   data={filteredProducts}
//                   renderItem={renderItem}
//                   keyExtractor={(item, index) => `product-${item.id || index}`}
//                   showsVerticalScrollIndicator={false}
//                   contentContainerStyle={styles.productsList}
//                   numColumns={2}
//                   columnWrapperStyle={styles.row}
//                   onScroll={Animated.event(
//                     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//                     { useNativeDriver: false }
//                   )}
//                   scrollEventThrottle={16}
//                   onContentSizeChange={(w, h) => setContentHeight(h)}
//                   onRefresh={onRefresh}
//                   refreshing={isRefreshing}
//                 />

//                 {contentHeight > scrollViewHeight && (
//                   <View style={styles.customScrollbarTrack}>
//                     <Animated.View
//                       style={[
//                         styles.customScrollbarThumb,
//                         {
//                           height: FIXED_THUMB_HEIGHT,
//                           transform: [{ translateY }],
//                         },
//                       ]}
//                     />
//                   </View>
//                 )}
//               </>
//             )}
//           </View>
//         </View>
//       )}

//       {cartCount > 0 && (
//         <FloatingCartButton onPress={() => navigation.navigate("Cart")} />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   content: {
//     flex: 1,
//     flexDirection: "row",
//   },
//   categoriesContainer: {
//     width: wp("25%"),
//     padding: wp(1.5),
//     borderRightWidth: 1,
//     borderRightColor: "#E0E0E0",
//     marginTop: hp(1),
//     position: "relative",
//   },
//   productsContainer: {
//     flex: 1,
//     padding: wp(2),
//     position: "relative",
//   },
//   productsList: {
//     paddingBottom: hp(3),
//   },
//   row: {
//     justifyContent: "space-between",
//   },
//   productCardContainer: {
//     width: "48.5%",
//     marginBottom: hp(2),
//   },
//   errorText: {
//     textAlign: "center",
//     color: "red",
//     marginTop: hp(2.5),
//     fontSize: RFValue(14),
//   },
//   noProductsText: {
//     textAlign: "center",
//     marginTop: hp(2.5),
//     color: "#666",
//     fontSize: RFValue(14),
//   },
//   customScrollbarTrack: {
//     position: "absolute",
//     top: 0,
//     right: 2,
//     width: wp(1.5),
//     height: "100%",
//     backgroundColor: "transparent",
//     borderRadius: wp(1),
//   },
//   customScrollbarThumb: {
//     width: wp(1),
//     backgroundColor: "#0C5273",
//     borderRadius: wp(1),
//   },
//   categoryItemContainer: {
//     position: "relative",
//   },
//   selectedIndicator: {
//     position: "absolute",
//     right: -wp(1.5),
//     top: 0,
//     bottom: 0,
//     width: wp(1),
//     backgroundColor: "#0C5273",
//     borderTopLeftRadius: wp(0.5),
//     borderBottomLeftRadius: wp(0.5),
//   },
// });

// const headerStyles = StyleSheet.create({
//   // ✅ FIX: Styles ko aasan aur aalag kar diya hai
//   gradient: {
//     // Gradient ko sirf neeche se padding di hai
//     paddingBottom: hp(1.5),
//   },
//   headerContent: {
//     // Asli content ko yahan se horizontal padding mil rahi hai
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: wp(4),
//   },
//   iconButton: {
//     padding: wp(2),
//   },
//   iconPlaceholder: {
//     width: wp(8),
//     height: wp(8),
//   },
//   title: {
//     flex: 1,
//     color: "#222",
//     fontSize: RFValue(14),
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });

// export default CategoriesScreen;














// import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   Platform,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useSafeAreaInsets } from "react-native-safe-area-context"; 
// import { fetchFoodList } from "../services/FoodService";
// import CategoryItem from "../components/CategoryItem";
// import EventProductCard from "../components/EventProductCard";
// import FloatingCartButton from "../components/FloatingCartButton";
// import { useCart } from "../context/CartContext";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { useQuery } from "@tanstack/react-query";
// import CategoryScreenShimmer from "../components/CategoryScreenShimmer";

// const CATEGORIES = [
//   "All Products",
//   "Purani Delhi",
//   "Fasting Special",
//   "Cake & Muffins",
//   "Indian Sweets",
//   "Healthy Snacks",
//   "Bhujia",
//   "Cookies",
//   "Rusk",
//   "Munchies",
//   "Pratham",
//   "Chips n Crisps",
//   "South Range",
// ];

// // ✅ FIX: Isko import karna zaroori hai
// // import { useSafeAreaInsets } from "react-native-safe-area-context"; 
// // moved up.

// // ✅ FIX: Header ko robust banaya hai. Gradient alag, content alag.
// const GradientHeader = ({ title = "Categories", onBack, onSearch, insets }) => (
//   <LinearGradient
//     colors={["#F2D377", "#F5F5F5"]}
//     start={{ x: 0, y: 0 }}
//     end={{ x: 0, y: 1 }}
//     style={headerStyles.gradient} // Gradient pe koi vertical padding nahi
//   >
//     {/* Saara content is View ke andar hai, jisko upar se padding milegi */}
//     <View style={{ paddingTop: insets.top }}>
//       <View style={headerStyles.headerContent}>
//         {onBack ? (
//           <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
//             <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
//           </TouchableOpacity>
//         ) : (
//           <View style={headerStyles.iconPlaceholder} />
//         )}
//         <Text
//           style={headerStyles.title}
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//         >
//           {title}
//         </Text>
//         <TouchableOpacity onPress={onSearch} style={headerStyles.iconButton}>
//           <Ionicons name="search" size={RFValue(20)} color="#222" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   </LinearGradient>
// );

// const CategoriesScreen = ({ navigation, route }) => {
//   const { selectedCategory: initialCategory } = route.params || {};
//   const [selectedCategory, setSelectedCategory] = useState(
//     initialCategory || CATEGORIES[0]
//   );
//   const { cartCount } = useCart();
//   const insets = useSafeAreaInsets(); // Hook se safe area ki values li

//   const scrollY = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);
//   const categoryFlatListRef = useRef(null);

//   const [contentHeight, setContentHeight] = useState(1);
//   const [scrollViewHeight, setScrollViewHeight] = useState(0);

//   const {
//     data: products = [],
//     isLoading,
//     isError,
//     refetch,
//   } = useQuery({
//     queryKey: ['products'],
//     queryFn: fetchFoodList,
//   });

//   // 👇 The change is here
//   const filteredProducts = useMemo(() => {
//     if (selectedCategory === "All Products") return products;
//     return products.filter(
//       (p) => p.category?.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase())
//     );
//   }, [selectedCategory, products]);

//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const onRefresh = useCallback(async () => {
//     setIsRefreshing(true);
//     await refetch();
//     setIsRefreshing(false);
//   }, [refetch]);

//   useEffect(() => {
//     if (route.params?.selectedCategory) {
//       const newCategory = route.params.selectedCategory;
//       setSelectedCategory(newCategory);
//       const index = CATEGORIES.indexOf(newCategory);
//       if (index > -1 && categoryFlatListRef.current) {
//         categoryFlatListRef.current.scrollToIndex({ index, animated: true });
//       }
//     }
//   }, [route.params]);

//   const FIXED_THUMB_HEIGHT = hp(5);
//   const CATEGORY_ITEM_HEIGHT = hp(6.5);
//   const maxThumbTranslateY = scrollViewHeight - FIXED_THUMB_HEIGHT;

//   const translateY = scrollY.interpolate({
//     inputRange: [0, Math.max(contentHeight - scrollViewHeight, 1)],
//     outputRange: [0, maxThumbTranslateY],
//     extrapolate: "clamp",
//   });

//   const renderItem = ({ item }) => (
//     <View style={styles.productCardContainer}>
//       <EventProductCard
//         product={item}
//         onPress={() =>
//           navigation.navigate("ProductDetails", { productId: item.id })
//         }
//       />
//     </View>
//   );

//   const renderCategoryItem = ({ item }) => {
//     const isSelected = item === selectedCategory;
//     return (
//       <View style={styles.categoryItemContainer}>
//         <CategoryItem
//           category={item}
//           isSelected={isSelected}
//           onSelect={setSelectedCategory}
//         />
//         {isSelected && <View style={styles.selectedIndicator} />}
//       </View>
//     );
//   };

//   return (
//     // ✅ FIX: Root component normal View hai, SafeAreaView nahi
//     <View style={styles.container}> 
//       <StatusBar
//         translucent
//         backgroundColor="transparent"
//         barStyle="dark-content"
//       />

//       <GradientHeader
//         title="Categories"
//         insets={insets}
//         onBack={() =>
//           navigation.reset({
//             index: 0,
//             routes: [{ name: "MainApp" }],
//           })
//         }
//         onSearch={() => navigation.navigate("Search")}
//       />

//       {isLoading ? (
//         <CategoryScreenShimmer />
//       ) : (
//         <View style={styles.content}>
//           <View style={styles.categoriesContainer}>
//             <FlatList
//               ref={categoryFlatListRef}
//               data={CATEGORIES}
//               renderItem={renderCategoryItem}
//               keyExtractor={(item) => `category-${item}`}
//               showsVerticalScrollIndicator={false}
//               initialScrollIndex={CATEGORIES.indexOf(selectedCategory)}
//               getItemLayout={(data, index) => ({
//                 length: CATEGORY_ITEM_HEIGHT,
//                 offset: CATEGORY_ITEM_HEIGHT * index,
//                 index,
//               })}
//             />
//           </View>

//           <View
//             style={styles.productsContainer}
//             onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
//           >
//             {filteredProducts.length === 0 ? (
//               <Text style={styles.noProductsText}>No products found</Text>
//             ) : (
//               <>
//                 <Animated.FlatList
//                   ref={flatListRef}
//                   data={filteredProducts}
//                   renderItem={renderItem}
//                   keyExtractor={(item, index) => `product-${item.id || index}`}
//                   showsVerticalScrollIndicator={false}
//                   contentContainerStyle={styles.productsList}
//                   numColumns={2}
//                   columnWrapperStyle={styles.row}
//                   onScroll={Animated.event(
//                     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//                     { useNativeDriver: false }
//                   )}
//                   scrollEventThrottle={16}
//                   onContentSizeChange={(w, h) => setContentHeight(h)}
//                   onRefresh={onRefresh}
//                   refreshing={isRefreshing}
//                 />

//                 {contentHeight > scrollViewHeight && (
//                   <View style={styles.customScrollbarTrack}>
//                     <Animated.View
//                       style={[
//                         styles.customScrollbarThumb,
//                         {
//                           height: FIXED_THUMB_HEIGHT,
//                           transform: [{ translateY }],
//                         },
//                       ]}
//                     />
//                   </View>
//                 )}
//               </>
//             )}
//           </View>
//         </View>
//       )}

//       {cartCount > 0 && (
//         <FloatingCartButton onPress={() => navigation.navigate("Cart")} />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   content: {
//     flex: 1,
//     flexDirection: "row",
//   },
//   categoriesContainer: {
//     width: wp("25%"),
//     padding: wp(1.5),
//     borderRightWidth: 1,
//     borderRightColor: "#E0E0E0",
//     marginTop: hp(1),
//     position: "relative",
//   },
//   productsContainer: {
//     flex: 1,
//     padding: wp(2),
//     position: "relative",
//   },
//   productsList: {
//     paddingBottom: hp(3),
//   },
//   row: {
//     justifyContent: "space-between",
//   },
//   productCardContainer: {
//     width: "48.5%",
//     marginBottom: hp(2),
//   },
//   errorText: {
//     textAlign: "center",
//     color: "red",
//     marginTop: hp(2.5),
//     fontSize: RFValue(14),
//   },
//   noProductsText: {
//     textAlign: "center",
//     marginTop: hp(2.5),
//     color: "#666",
//     fontSize: RFValue(14),
//   },
//   customScrollbarTrack: {
//     position: "absolute",
//     top: 0,
//     right: 2,
//     width: wp(1.5),
//     height: "100%",
//     backgroundColor: "transparent",
//     borderRadius: wp(1),
//   },
//   customScrollbarThumb: {
//     width: wp(1),
//     backgroundColor: "#0C5273",
//     borderRadius: wp(1),
//   },
//   categoryItemContainer: {
//     position: "relative",
//   },
//   selectedIndicator: {
//     position: "absolute",
//     right: -wp(1.5),
//     top: 0,
//     bottom: 0,
//     width: wp(1),
//     backgroundColor: "#0C5273",
//     borderTopLeftRadius: wp(0.5),
//     borderBottomLeftRadius: wp(0.5),
//   },
// });

// const headerStyles = StyleSheet.create({
//   // ✅ FIX: Styles ko aasan aur aalag kar diya hai
//   gradient: {
//     // Gradient ko sirf neeche se padding di hai
//     paddingBottom: hp(1.5),
//   },
//   headerContent: {
//     // Asli content ko yahan se horizontal padding mil rahi hai
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: wp(4),
//   },
//   iconButton: {
//     padding: wp(2),
//   },
//   iconPlaceholder: {
//     width: wp(8),
//     height: wp(8),
//   },
//   title: {
//     flex: 1,
//     color: "#222",
//     fontSize: RFValue(14),
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });

// export default CategoriesScreen;














import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 
import { fetchFoodList } from "../services/FoodService";
import CategoryItem from "../components/CategoryItem";
import EventProductCard from "../components/EventProductCard";
import FloatingCartButton from "../components/FloatingCartButton";
import { useCart } from "../context/CartContext";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useQuery } from "@tanstack/react-query";
import CategoryScreenShimmer from "../components/CategoryScreenShimmer";

const CATEGORIES = [
  "All Products",
  "Purani Delhi",
  "Fasting Special",
  "Cake & Muffins",
  "Indian Sweets",
  "Healthy Snacks",
  "Bhujia",
  "Cookies",
  "Rusk",
  "Munchies",
  "Pratham",
  "Chips n Crisps",
  "South Range",
];

const GradientHeader = ({ title = "Categories", onBack, onSearch, insets }) => (
  <LinearGradient
    colors={["#F2D377", "#F5F5F5"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={headerStyles.gradient}
  >
    <View style={{ paddingTop: insets.top }}>
      <View style={headerStyles.headerContent}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
            <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
          </TouchableOpacity>
        ) : (
          <View style={headerStyles.iconPlaceholder} />
        )}
        <Text
          style={headerStyles.title}
          allowFontScaling={false}
          adjustsFontSizeToFit
        >
          {title}
        </Text>
        <TouchableOpacity onPress={onSearch} style={headerStyles.iconButton}>
          <Ionicons name="search" size={RFValue(20)} color="#222" />
        </TouchableOpacity>
      </View>
    </View>
  </LinearGradient>
);

const CategoriesScreen = ({ navigation, route }) => {
  const { selectedCategory: initialCategory } = route.params || {};
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || CATEGORIES[0]
  );
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const categoryFlatListRef = useRef(null);

  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchFoodList,
  });

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All Products") return products;
    return products.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, products]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (route.params?.selectedCategory) {
      const newCategory = route.params.selectedCategory;
      setSelectedCategory(newCategory);
      const index = CATEGORIES.indexOf(newCategory);
      if (index > -1 && categoryFlatListRef.current) {
        categoryFlatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [route.params]);

  const FIXED_THUMB_HEIGHT = hp(5);
  const CATEGORY_ITEM_HEIGHT = hp(6.5);
  const maxThumbTranslateY = scrollViewHeight - FIXED_THUMB_HEIGHT;

  const translateY = scrollY.interpolate({
    inputRange: [0, Math.max(contentHeight - scrollViewHeight, 1)],
    outputRange: [0, maxThumbTranslateY],
    extrapolate: "clamp",
  });

  const renderItem = ({ item }) => (
    <View style={styles.productCardContainer}>
      <EventProductCard
        product={item}
        onPress={() =>
          navigation.navigate("ProductDetails", { productId: item.id })
        }
      />
    </View>
  );

  const renderCategoryItem = ({ item }) => {
    const isSelected = item === selectedCategory;
    return (
      <View style={styles.categoryItemContainer}>
        <CategoryItem
          category={item}
          isSelected={isSelected}
          onSelect={setSelectedCategory}
        />
        {isSelected && <View style={styles.selectedIndicator} />}
      </View>
    );
  };

  return (
    <View style={styles.container}> 
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <GradientHeader
        title="Categories"
        insets={insets}
        onBack={() => navigation.goBack()} // ✅ FIX: This is the corrected line.
        onSearch={() => navigation.navigate("Search")}
      />

      {isLoading ? (
        <CategoryScreenShimmer />
      ) : (
        <View style={styles.content}>
          <View style={styles.categoriesContainer}>
            <FlatList
              ref={categoryFlatListRef}
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => `category-${item}`}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={CATEGORIES.indexOf(selectedCategory)}
              getItemLayout={(data, index) => ({
                length: CATEGORY_ITEM_HEIGHT,
                offset: CATEGORY_ITEM_HEIGHT * index,
                index,
              })}
            />
          </View>

          <View
            style={styles.productsContainer}
            onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
          >
            {filteredProducts.length === 0 ? (
              <Text style={styles.noProductsText}>No products found</Text>
            ) : (
              <>
                <Animated.FlatList
                  ref={flatListRef}
                  data={filteredProducts}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => `product-${item.id || index}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.productsList}
                  numColumns={2}
                  columnWrapperStyle={styles.row}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                  onContentSizeChange={(w, h) => setContentHeight(h)}
                  onRefresh={onRefresh}
                  refreshing={isRefreshing}
                />

                {contentHeight > scrollViewHeight && (
                  <View style={styles.customScrollbarTrack}>
                    <Animated.View
                      style={[
                        styles.customScrollbarThumb,
                        {
                          height: FIXED_THUMB_HEIGHT,
                          transform: [{ translateY }],
                        },
                      ]}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {cartCount > 0 && (
        <FloatingCartButton onPress={() => navigation.navigate("Cart")} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  categoriesContainer: {
    width: wp("25%"),
    padding: wp(1.5),
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    marginTop: hp(1),
    position: "relative",
  },
  productsContainer: {
    flex: 1,
    padding: wp(2),
    position: "relative",
  },
  productsList: {
    paddingBottom: hp(3),
  },
  row: {
    justifyContent: "space-between",
  },
  productCardContainer: {
    width: "48.5%",
    marginBottom: hp(2),
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: hp(2.5),
    fontSize: RFValue(14),
  },
  noProductsText: {
    textAlign: "center",
    marginTop: hp(2.5),
    color: "#666",
    fontSize: RFValue(14),
  },
  customScrollbarTrack: {
    position: "absolute",
    top: 0,
    right: 2,
    width: wp(1.5),
    height: "100%",
    backgroundColor: "transparent",
    borderRadius: wp(1),
  },
  customScrollbarThumb: {
    width: wp(1),
    backgroundColor: "#0C5273",
    borderRadius: wp(1),
  },
  categoryItemContainer: {
    position: "relative",
  },
  selectedIndicator: {
    position: "absolute",
    right: -wp(1.5),
    top: 0,
    bottom: 0,
    width: wp(1),
    backgroundColor: "#0C5273",
    borderTopLeftRadius: wp(0.5),
    borderBottomLeftRadius: wp(0.5),
  },
});

const headerStyles = StyleSheet.create({
  gradient: {
    paddingBottom: hp(1.5),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
  },
  iconButton: {
    padding: wp(2),
  },
  iconPlaceholder: {
    width: wp(8),
    height: wp(8),
  },
  title: {
    flex: 1,
    color: "#222",
    fontSize: RFValue(14),
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CategoriesScreen;