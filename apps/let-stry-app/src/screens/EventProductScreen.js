// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   Platform,
//   Image,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import EventProductCard from "../components/EventProductCard";
// import FloatingCartButton from "../components/FloatingCartButton";
// import { useCart } from "../context/CartContext";
// import { fetchActiveEvents } from "../services/eventService";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const GradientHeader = ({ title = "Events", onBack, onSearch }) => (
//   <LinearGradient
//     colors={["#F2D377", "#F5F5F5"]}
//     start={{ x: 0, y: 0 }}
//     end={{ x: 0, y: 1 }}
//     style={headerStyles.header}
//   >
//     <View style={headerStyles.headerContent}>
//       {onBack ? (
//         <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
//           <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
//         </TouchableOpacity>
//       ) : (
//         <View style={headerStyles.iconPlaceholder} />
//       )}
//       <Text style={headerStyles.title} allowFontScaling={false} adjustsFontSizeToFit>
//         {title}
//       </Text>
//       <TouchableOpacity onPress={onSearch} style={headerStyles.iconButton}>
//         <Ionicons name="search" size={RFValue(20)} color="#222" />
//       </TouchableOpacity>
//     </View>
//   </LinearGradient>
// );

// const EventProductsScreen = ({ route, navigation }) => {
//   const [eventsData, setEventsData] = useState(route.params?.eventData || null);
//   const [selectedEvent, setSelectedEvent] = useState(route.params?.initialEvent || null);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(!route.params?.eventData);
//   const [error, setError] = useState(null);
//   const { cartCount } = useCart();
//   const insets = useSafeAreaInsets();

//   const scrollYCategory = useRef(new Animated.Value(0)).current;
//   const scrollYProducts = useRef(new Animated.Value(0)).current;
//   const categoryContentHeight = useRef(1);
//   const categoryScrollViewHeight = useRef(0);
//   const productsContentHeight = useRef(1);
//   const productsScrollViewHeight = useRef(0);

//   const FIXED_CATEGORY_THUMB_HEIGHT = hp(7);
//   const FIXED_PRODUCT_THUMB_HEIGHT = hp(7);

//   const [showProductScrollbar, setShowProductScrollbar] = useState(false);
//   const [showCategoryScrollbar, setShowCategoryScrollbar] = useState(false);

//   useEffect(() => {
//     const loadEvents = async () => {
//       if (!route.params?.eventData) {
//         try {
//           setLoading(true);
//           setError(null);
//           const data = await fetchActiveEvents();
//           setEventsData(data);
//           if (data?.events?.length > 0) setSelectedEvent(data.events[0]);
//         } catch (err) {
//           setError(err.message || "Failed to load events");
//         } finally {
//           setLoading(false);
//         }
//       }
//     };
//     loadEvents();
//   }, []);

//   useEffect(() => {
//     if (selectedEvent) {
//       setFilteredProducts(selectedEvent.products || []);
//     }
//   }, [selectedEvent]);

//   const maxCategoryTranslateY = categoryScrollViewHeight.current - FIXED_CATEGORY_THUMB_HEIGHT;
//   const categoryTranslateY = scrollYCategory.interpolate({
//     inputRange: [0, Math.max(categoryContentHeight.current - categoryScrollViewHeight.current, 1)],
//     outputRange: [0, maxCategoryTranslateY],
//     extrapolate: "clamp",
//   });

//   const maxProductTranslateY = productsScrollViewHeight.current - FIXED_PRODUCT_THUMB_HEIGHT;
//   const productTranslateY = scrollYProducts.interpolate({
//     inputRange: [0, Math.max(productsContentHeight.current - productsScrollViewHeight.current, 1)],
//     outputRange: [0, maxProductTranslateY],
//     extrapolate: "clamp",
//   });

//   const renderEventCategoryItem = ({ item }) => {
//     const isSelected = selectedEvent?.name === item.name;

//     return (
//       <TouchableOpacity
//         onPress={() => setSelectedEvent(item)}
//         style={styles.categoryItemWrapper}
//         activeOpacity={0.8}
//       >
//         <View style={[styles.imageContainer, isSelected && styles.selectedImageContainer]}>
//           <Image
//             source={{ uri: item.imageUrl || "https://via.placeholder.com/60" }}
//             style={styles.image}
//             resizeMode="contain"
//           />
//         </View>
//         <Text
//           allowFontScaling={false}
//           adjustsFontSizeToFit
//           style={[styles.categoryText, isSelected && styles.selectedCategoryText]}
//         >
//           {item.name}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderProductItem = ({ item }) => (
//     <View style={styles.productCardContainer}>
//       <EventProductCard
//         product={item}
//         onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
//       />
//     </View>
//   );

// if (loading) {
//   return <EventProductsShimmer />;
// }


//   if (error) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText} allowFontScaling={false} adjustsFontSizeToFit>
//             {error}
//           </Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={() => {
//               setError(null);
//               setLoading(true);
//               setTimeout(() => setLoading(false), 1000);
//             }}
//           >
//             <Text style={styles.retryButtonText} allowFontScaling={false} adjustsFontSizeToFit>
//               Retry
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!eventsData || !selectedEvent) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.errorText} allowFontScaling={false} adjustsFontSizeToFit>
//           No event data available
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <View style={[styles.container, { paddingBottom: insets.bottom }]}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
//       <GradientHeader
//         title={selectedEvent?.name || "Events"}
//         onBack={() => navigation.goBack()}
//         onSearch={() => navigation.navigate("Search")}
//       />
//       <View style={styles.content}>
//         <View
//           style={styles.categoriesContainer}
//           onLayout={(e) => (categoryScrollViewHeight.current = e.nativeEvent.layout.height)}
//         >
//           <Animated.FlatList
//             data={eventsData.events}
//             renderItem={renderEventCategoryItem}
//             keyExtractor={(item) => `event-${item.name}`}
//             showsVerticalScrollIndicator={false}
//             onScroll={Animated.event(
//               [{ nativeEvent: { contentOffset: { y: scrollYCategory } } }],
//               { useNativeDriver: false }
//             )}
//             scrollEventThrottle={16}
//             onContentSizeChange={(w, h) => {
//               categoryContentHeight.current = h;
//               setShowCategoryScrollbar(h > categoryScrollViewHeight.current);
//             }}
//           />
//           {/* {showCategoryScrollbar && (
//             <View style={styles.customScrollbarTrackCategories}>
//               <Animated.View
//                 style={[
//                   styles.customScrollbarThumbCategories,
//                   {
//                     height: FIXED_CATEGORY_THUMB_HEIGHT,
//                     transform: [{ translateY: categoryTranslateY }],
//                   },
//                 ]}
//               />
//             </View>
//           )} */}
//         </View>

//         <View
//           style={styles.productsContainer}
//           onLayout={(e) => (productsScrollViewHeight.current = e.nativeEvent.layout.height)}
//         >
//           {filteredProducts.length === 0 ? (
//             <Text style={styles.noProductsText} allowFontScaling={false} adjustsFontSizeToFit>
//               No products found in {selectedEvent?.name}
//             </Text>
//           ) : (
//             <>
//               <Animated.FlatList
//                 data={filteredProducts}
//                 renderItem={renderProductItem}
//                 keyExtractor={(item) => `event-product-${item.id}`}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.productsList}
//                 numColumns={2}
//                 columnWrapperStyle={styles.row}
//                 onScroll={Animated.event(
//                   [{ nativeEvent: { contentOffset: { y: scrollYProducts } } }],
//                   { useNativeDriver: false }
//                 )}
//                 scrollEventThrottle={16}
//                 onContentSizeChange={(w, h) => {
//                   productsContentHeight.current = h;
//                   setShowProductScrollbar(h > productsScrollViewHeight.current);
//                 }}
//               />
//               {showProductScrollbar && (
//                 <View style={styles.customScrollbarTrack}>
//                   <Animated.View
//                     style={[
//                       styles.customScrollbarThumb,
//                       {
//                         height: FIXED_PRODUCT_THUMB_HEIGHT,
//                         transform: [{ translateY: productTranslateY }],
//                       },
//                     ]}
//                   />
//                 </View>
//               )}
//             </>
//           )}
//         </View>
//       </View>

//       {cartCount > 0 && (
//         <View
//           style={{
//             position: "absolute",
//             left: 0,
//             right: 0,
//             bottom: insets.bottom,
//             alignItems: "center",
//           }}
//         >
//           <FloatingCartButton onPress={() => navigation.navigate("Cart")} />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "white" },
//   content: { flex: 1, flexDirection: "row" },
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
//     padding: wp(4),
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
//   noProductsText: {
//     textAlign: "center",
//     marginTop: hp(2.5),
//     color: "#666",
//     fontSize: RFValue(14),
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: hp(5),
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: wp(4),
//   },
//   errorText: {
//     textAlign: "center",
//     color: "red",
//     marginBottom: hp(2),
//     fontSize: RFValue(14),
//   },
//   retryButton: {
//     backgroundColor: "#FFD233",
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(1.5),
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: "#002855",
//     fontWeight: "bold",
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
//   customScrollbarTrackCategories: {
//     position: "absolute",
//     top: 0,
//     right: 2,
//     width: wp(1.5),
//     height: "100%",
//     backgroundColor: "transparent",
//     borderRadius: wp(1),
//   },
//   customScrollbarThumbCategories: {
//     width: wp(1),
//     backgroundColor: "#04565A",
//     borderRadius: wp(1),
//   },
//   categoryItemWrapper: {
//     alignItems: 'center',
//     marginVertical: hp(0.5),
//     paddingVertical: hp(1),
//     paddingHorizontal: wp(2),
//     borderRadius: 8,
//     width: '100%',
//   },
//   imageContainer: {
//     backgroundColor: 'rgba(182,209,211,0.73)',
//     borderRadius: 10,
//     padding: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   selectedImageContainer: {
//     backgroundColor: '#0C5273',
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   image: {
//     width: wp(16),
//     height: hp(7),
//     opacity: 1,
//   },
//   categoryText: {
//     marginTop: 4,
//     fontSize: RFValue(8),
//     fontWeight: '500',
//     color: '#444',
//     textAlign: 'center',
//   },
//   selectedCategoryText: {
//     fontWeight: '700',
//     color: '#345678',
//   },
// });

// const headerStyles = StyleSheet.create({
//   header: {
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : hp(3),
//     paddingHorizontal: wp(4),
//     paddingBottom: hp(1.5),
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   iconButton: {
//     padding: wp(1.5),
//   },
//   iconPlaceholder: {
//     width: RFValue(22) + wp(3),
//   },
//   title: {
//     fontSize: RFValue(14),
//     fontWeight: "700",
//     color: "#222",
//   },
// });

// export default EventProductsScreen;

















import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView, // This is only used for the error screen, which is fine.
  StatusBar,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import EventProductCard from "../components/EventProductCard";
import FloatingCartButton from "../components/FloatingCartButton";
import { useCart } from "../context/CartContext";
import { fetchActiveEvents } from "../services/eventService";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import EventProductsShimmer from '../components/EventProductsShimmer'; 

// ✅ FIX: Header ko insets prop accept karne ke liye update kiya
const GradientHeader = ({ title = "Events", onBack, onSearch, insets }) => (
  <LinearGradient
    colors={["#F2D377", "#F5F5F5"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    // ✅ FIX: Gradient alag, content alag. Gradient poori jagah lega.
    style={headerStyles.gradient} 
  >
    {/* ✅ FIX: Content ko insets.top se padding milegi */}
    <View style={{ paddingTop: insets.top }}>
      <View style={headerStyles.headerContent}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
            <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
          </TouchableOpacity>
        ) : (
          <View style={headerStyles.iconPlaceholder} />
        )}
        <Text style={headerStyles.title} allowFontScaling={false} adjustsFontSizeToFit>
          {title}
        </Text>
        <TouchableOpacity onPress={onSearch} style={headerStyles.iconButton}>
          <Ionicons name="search" size={RFValue(20)} color="#222" />
        </TouchableOpacity>
      </View>
    </View>
  </LinearGradient>
);

const EventProductsScreen = ({ route, navigation }) => {
  const [eventsData, setEventsData] = useState(route.params?.eventData || null);
  const [selectedEvent, setSelectedEvent] = useState(route.params?.initialEvent || null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(!route.params?.eventData);
  const [error, setError] = useState(null);
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets(); // Yeh pehle se hi tha, perfect!

  // ... (baaki ka component logic jaisa tha waisa hi hai)
  const scrollYCategory = useRef(new Animated.Value(0)).current;
  const scrollYProducts = useRef(new Animated.Value(0)).current;
  const categoryContentHeight = useRef(1);
  const categoryScrollViewHeight = useRef(0);
  const productsContentHeight = useRef(1);
  const productsScrollViewHeight = useRef(0);

  const FIXED_CATEGORY_THUMB_HEIGHT = hp(7);
  const FIXED_PRODUCT_THUMB_HEIGHT = hp(7);

  const [showProductScrollbar, setShowProductScrollbar] = useState(false);
  const [showCategoryScrollbar, setShowCategoryScrollbar] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      if (!route.params?.eventData) {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchActiveEvents();
          setEventsData(data);
          if (data?.events?.length > 0) setSelectedEvent(data.events[0]);
        } catch (err) {
          setError(err.message || "Failed to load events");
        } finally {
          setLoading(false);
        }
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setFilteredProducts(selectedEvent.products || []);
    }
  }, [selectedEvent]);

  const maxCategoryTranslateY = categoryScrollViewHeight.current - FIXED_CATEGORY_THUMB_HEIGHT;
  const categoryTranslateY = scrollYCategory.interpolate({
    inputRange: [0, Math.max(categoryContentHeight.current - categoryScrollViewHeight.current, 1)],
    outputRange: [0, maxCategoryTranslateY],
    extrapolate: "clamp",
  });

  const maxProductTranslateY = productsScrollViewHeight.current - FIXED_PRODUCT_THUMB_HEIGHT;
  const productTranslateY = scrollYProducts.interpolate({
    inputRange: [0, Math.max(productsContentHeight.current - productsScrollViewHeight.current, 1)],
    outputRange: [0, maxProductTranslateY],
    extrapolate: "clamp",
  });

  const renderEventCategoryItem = ({ item }) => {
    const isSelected = selectedEvent?.name === item.name;

    return (
      <TouchableOpacity
        onPress={() => setSelectedEvent(item)}
        style={styles.categoryItemWrapper}
        activeOpacity={0.8}
      >
        <View style={[styles.imageContainer, isSelected && styles.selectedImageContainer]}>
          <Image
            source={{ uri: item.imageUrl || "https://via.placeholder.com/60" }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text
          allowFontScaling={false}
          adjustsFontSizeToFit
          style={[styles.categoryText, isSelected && styles.selectedCategoryText]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCardContainer}>
      <EventProductCard
        product={item}
        onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
      />
    </View>
  );

  if (loading) {
    // return <EventProductsShimmer />;
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} allowFontScaling={false} adjustsFontSizeToFit>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            <Text style={styles.retryButtonText} allowFontScaling={false} adjustsFontSizeToFit>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!eventsData || !selectedEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText} allowFontScaling={false} adjustsFontSizeToFit>
          No event data available
        </Text>
      </SafeAreaView>
    );
  }

  return (
    // ✅ FIX: Root View ab insets.bottom use kar raha hai, jo sahi hai
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {/* ✅ FIX: Yahan naya wala header use kiya hai aur 'insets' pass kiya hai */}
      <GradientHeader
        title={selectedEvent?.name || "Events"}
        insets={insets}
        onBack={() => navigation.goBack()}
        onSearch={() => navigation.navigate("Search")}
      />
      <View style={styles.content}>
        <View
          style={styles.categoriesContainer}
          onLayout={(e) => (categoryScrollViewHeight.current = e.nativeEvent.layout.height)}
        >
          <Animated.FlatList
            data={eventsData.events}
            renderItem={renderEventCategoryItem}
            keyExtractor={(item) => `event-${item.name}`}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollYCategory } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            onContentSizeChange={(w, h) => {
              categoryContentHeight.current = h;
              setShowCategoryScrollbar(h > categoryScrollViewHeight.current);
            }}
          />
        </View>

        <View
          style={styles.productsContainer}
          onLayout={(e) => (productsScrollViewHeight.current = e.nativeEvent.layout.height)}
        >
          {filteredProducts.length === 0 ? (
            <Text style={styles.noProductsText} allowFontScaling={false} adjustsFontSizeToFit>
              No products found in {selectedEvent?.name}
            </Text>
          ) : (
            <>
              <Animated.FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => `event-product-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsList}
                numColumns={2}
                columnWrapperStyle={styles.row}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollYProducts } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                onContentSizeChange={(w, h) => {
                  productsContentHeight.current = h;
                  setShowProductScrollbar(h > productsScrollViewHeight.current);
                }}
              />
              {showProductScrollbar && (
                <View style={styles.customScrollbarTrack}>
                  <Animated.View
                    style={[
                      styles.customScrollbarThumb,
                      {
                        height: FIXED_PRODUCT_THUMB_HEIGHT,
                        transform: [{ translateY: productTranslateY }],
                      },
                    ]}
                  />
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {cartCount > 0 && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: insets.bottom,
            alignItems: "center",
          }}
        >
          <FloatingCartButton onPress={() => navigation.navigate("Cart")} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  content: { flex: 1, flexDirection: "row" },
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
    padding: wp(4),
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
  noProductsText: {
    textAlign: "center",
    marginTop: hp(2.5),
    color: "#666",
    fontSize: RFValue(14),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(5),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(4),
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginBottom: hp(2),
    fontSize: RFValue(14),
  },
  retryButton: {
    backgroundColor: "#FFD233",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#002855",
    fontWeight: "bold",
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
  customScrollbarTrackCategories: {
    position: "absolute",
    top: 0,
    right: 2,
    width: wp(1.5),
    height: "100%",
    backgroundColor: "transparent",
    borderRadius: wp(1),
  },
  customScrollbarThumbCategories: {
    width: wp(1),
    backgroundColor: "#04565A",
    borderRadius: wp(1),
  },
  categoryItemWrapper: {
    alignItems: 'center',
    marginVertical: hp(0.5),
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: 8,
    width: '100%',
  },
  imageContainer: {
    backgroundColor: '#E7E8E8',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedImageContainer: {
    backgroundColor: '#0C5273',
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  image: {
    width: wp(16),
    height: hp(7),
    opacity: 1,
  },
  categoryText: {
    marginTop: 4,
    fontSize: RFValue(8),
    fontWeight: '500',
    color: '#444',
    textAlign: 'center',
  },
  selectedCategoryText: {
    fontWeight: '700',
    color: '#345678',
  },
});

// ✅ FIX: Purane styles ko naye wale se replace kiya
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
    padding: wp(1.5),
  },
  iconPlaceholder: {
    width: RFValue(22) + wp(3),
  },
  title: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#222",
  },
});

export default EventProductsScreen;
