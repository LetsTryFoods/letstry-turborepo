
// import React, { useState, useEffect, useRef, useCallback, memo } from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     StatusBar,
//     FlatList,
//     Image,
//     ActivityIndicator,
//     ImageBackground,
//     Animated,
//     AppState,
// } from "react-native";
// import { useQuery } from "@tanstack/react-query";
// import crashlytics from "@react-native-firebase/crashlytics";
// import SearchBar from "../components/SearchBar";
// import HomeProductCard from "../components/HomeProductCard";
// import FloatingCartButton from "../components/FloatingCartButton";
// import PromoModal from "../components/PromoModal";
// import { useNavigation } from "@react-navigation/native";
// import { fetchFoodList, fetchNewLaunches } from "../services/FoodService";
// import { fetchBestsellers } from "../services/RecommendationService";
// import { fetchActiveEvents } from "../services/EventService";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useLocation } from "../context/LocationContext";
// import { useAuth } from "../context/AuthContext";
// import { useAddress } from "../context/AddressContext";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//     widthPercentageToDP as wp,
//     heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { RFPercentage as rf } from "react-native-responsive-fontsize";
// import InTransitBanner from "../components/InTransitBanner";
// import { useInTransit } from "../context/InTransitContext";
// import HomeScreenShimmer from "../components/HomeScreenShimmer";
// import HamperCard from "../components/HamperCard";

// // Constants
// const CARD_GAP = wp('2%');
// const CARD_WIDTH = (wp('100%') - wp('10%')) / 4;
// const RANGE_IMAGE_WIDTH = (wp('100%') - wp('8%') - (11 * CARD_GAP)) / 2;
// const RANGE_IMAGE_HEIGHT = hp('20%');
// const EVENTS_SECTION_HEIGHT = hp('57%');
// // New constant for the banner
// const IMAGE_BANNER_SOURCE = require("../assets/image.gif"); // Assuming image.gif is in the assets folder

// const CATEGORIES = [
//     "Purani Delhi", "Fasting Special", "Cake & Muffins", "Indian Sweets",
//     "Healthy Snacks", "Bhujia", "Cookies", "Rusk", "Munchies", "Pratham",
//     "Chips n Crisps", "South Range",
// ];

// const categories = [
//     { id: "1", name: "Purani Delhi", image: require("../assets/categories/purani_delhi.png") },
//     { id: "2", name: "Indian Sweets", image: require("../assets/categories/indian_sweets.png") },
//     { id: "3", name: "Healthy Snacks", image: require("../assets/categories/makhana.png") },
//     { id: "4", name: "Bhujia", image: require("../assets/categories/bhujia.png") },
//     { id: "5", name: "Cookies", image: require("../assets/categories/cookies.png") },
//     { id: "6", name: "Munchies", image: require("../assets/categories/munchies.png") },
//     { id: "7", name: "Fasting Special", image: require("../assets/categories/fasting_special.png") },
//     { id: "8", name: "Pratham", image: require("../assets/categories/pratham.png") },
//     { id: "9", name: "Chips n Crisps", image: require("../assets/categories/chips_crisps.png") },
//     { id: "10", name: "South Range", image: require("../assets/categories/south_range.png") },
//     { id: "11", name: "Cake & Muffins", image: require("../assets/categories/cakes.png") },
//     { id: "12", name: "Rusk", image: require("../assets/categories/rusk.png") },
// ];

// const ranges = [
//     { id: "1", name: "No Maida Range", image: require("../assets/range/no_maida_range.png") },
//     { id: "2", name: "Goodness of Wheat", image: require("../assets/range/wheat_range.png") },
//     { id: "3", name: "No Palm Oil Range", image: require("../assets/range/no_palm_oil.png") },
//     { id: "4", name: "Muffins & Cakes", image: require("../assets/range/muffin_range.png") },
//     { id: "5", name: "Puff Range", image: require("../assets/range/puff_range.png") },
//     { id: "6", name: "Wafers Range", image: require("../assets/range/wafers_range.png") },
//     { id: "7", name: "South Range", image: require("../assets/range/south_range.png") },
//     { id: "8", name: "Roasted Range", image: require("../assets/range/roasted_range.png") },
//     { id: "9", name: "Namkeen Range", image: require("../assets/range/namkeen_range.png") },
// ];

// const fetchHampers = async () => {
//     try {
//         const response = await fetch("https://api.letstryfoods.com/api/giftboxes");
//         if (!response.ok) {
//             throw new Error("Network response was not ok for hampers");
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         crashlytics().recordError(new Error(`Failed to fetch hampers: ${error.message}`));
//         console.error("Failed to fetch hampers:", error);
//         return []; 
//     }
// };

// const StickyHeader = ({
//     scrollY,
//     searchText,
//     setSearchText,
//     selectedAddress,
//     addressLoading,
//     address,
//     user,
//     navigation
// }) => {
//     const insets = useSafeAreaInsets();
//     const headerOpacity = scrollY.interpolate({
//         inputRange: [0, EVENTS_SECTION_HEIGHT - hp(25)],
//         outputRange: [0, 1],
//         extrapolate: 'clamp'
//     });
//     const headerShadowOpacity = scrollY.interpolate({
//         inputRange: [0, EVENTS_SECTION_HEIGHT - hp(21), EVENTS_SECTION_HEIGHT],
//         outputRange: [0, 0.3, 0.9],
//         extrapolate: 'clamp'
//     });

//     return (
//         <View
//             style={[styles.stickyHeaderContainer, { paddingTop: insets.top + hp(0.7) }]}
//             pointerEvents="box-none"
//         >
//             <Animated.View
//                 style={[StyleSheet.absoluteFill, {
//                     backgroundColor: "#FFF7E8",
//                     opacity: headerOpacity,
//                     shadowOpacity: headerShadowOpacity
//                 }]}
//             />
//             <View style={styles.locationBarContainer}>
//                 <Ionicons
//                     name="location-sharp"
//                     size={rf(2.8)}
//                     color="#000"
//                     style={styles.icon}
//                 />
//                 <TouchableOpacity
//                     style={{ flex: 1 }}
//                     onPress={() => user ? navigation.navigate("AddressBook") : navigation.navigate("Login")}
//                     activeOpacity={0.7}
//                 >
//                     <View style={styles.locationRow}>
//                         <Text
//                             allowFontScaling={false}
//                             adjustsFontSizeToFit
//                             style={styles.locationtext}
//                         >
//                             Delivering at
//                         </Text>
//                         {user && selectedAddress && selectedAddress.label ? (
//                             <>
//                                 <Text
//                                     allowFontScaling={false}
//                                     adjustsFontSizeToFit
//                                     style={styles.label}
//                                 >
//                                     {selectedAddress.label}
//                                 </Text>
//                                 <Ionicons
//                                     name="chevron-down"
//                                     size={rf(2)}
//                                     color="#000"
//                                     style={styles.chevron}
//                                 />
//                             </>
//                         ) : null}
//                     </View>
//                     {addressLoading ? (
//                         <ActivityIndicator
//                             size="small"
//                             color="#000"
//                             style={{ marginTop: hp('0.2%') }}
//                         />
//                     ) : (
//                         <Text
//                             allowFontScaling={false}
//                             adjustsFontSizeToFit
//                             style={styles.location}
//                         >
//                             {user && selectedAddress?.addressId ?
//                                 `${selectedAddress.buildingName}, ${selectedAddress.street}` :
//                                 !user && address ? address.split(",").slice(0, 3).join(",") :
//                                 user ? "Select Address" : "Select Location"
//                             }
//                         </Text>
//                     )}
//                 </TouchableOpacity>
//             </View>
//             <View style={styles.headerSearchWrapper}>
//                 <SearchBar
//                     searchText={searchText}
//                     setSearchText={setSearchText}
//                     placeholder="Search products"
//                 />
//             </View>
//         </View>
//     );
// };

// const EventsSection = memo(({ eventsData, handleEventSelect }) => (
//     <ImageBackground
//         source={eventsData?.backgroundImageUrl ? { uri: eventsData.backgroundImageUrl } : require("../assets/images/bg-image.png")}
//         style={styles.eventsHeroSection}
//         resizeMode="cover"
//     >
//         <View style={styles.eventGrid}>
//             {eventsData.events.slice(0, 8).map((event, index) => (
//                 <TouchableOpacity
//                     key={`event-${event.priority}-${event.name}-${index}`}
//                     style={styles.squareCard}
//                     onPress={() => handleEventSelect(event)}
//                 >
//                     <View style={styles.eventTextContainer}>
//                         <Text
//                             allowFontScaling={false}
//                             adjustsFontSizeToFit
//                             numberOfLines={2}
//                             style={styles.eventNameText}
//                         >
//                             {event.name}
//                         </Text>
//                     </View>
//                     <Image
//                         source={{ uri: event.imageUrl || "https://via.placeholder.com/150" }}
//                         style={styles.eventImage}
//                     />
//                 </TouchableOpacity>
//             ))}
//         </View>
//     </ImageBackground>
// ));

// const HorizontalProductList = memo(({ title, products, seeAllScreen, seeAllParams }) => {
//     const navigation = useNavigation();
//     return (
//         <>
//             <View style={styles.sectionHeader}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
//                     {title}
//                 </Text>
//                 {seeAllScreen && (
//                     <TouchableOpacity onPress={() => navigation.navigate(seeAllScreen, seeAllParams)}>
//                         <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.seeAll}>
//                             See all
//                         </Text>
//                     </TouchableOpacity>
//                 )}
//             </View>
//             {products.length > 0 ? (
//                 <FlatList
//                     data={products}
//                     keyExtractor={(item) => item.id.toString()}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={[styles.horizontalList, { paddingHorizontal: wp('2%') - CARD_GAP / 2 }]}
//                     renderItem={({ item }) => (
//                         <View style={[styles.horizontalCardContainer, { marginHorizontal: CARD_GAP / 2 }]}>
//                             <HomeProductCard
//                                 product={item}
//                                 // Navigate to the dedicated screen for regular products
//                                 onPress={() => navigation.navigate("ProductDetails", { 
//                                     productId: item.id,
//                                 })}
//                             />
//                         </View>
//                     )}
//                 />
//             ) : (
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.noProducts}>
//                     No products available
//                 </Text>
//             )}
//         </>
//     );
// });

// const CategoriesSection = memo(() => {
//     const navigation = useNavigation();
//     return (
//         <>
//             <View style={styles.sectionHeader}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
//                     Shop By Categories
//                 </Text>
//                 <TouchableOpacity onPress={() => navigation.navigate("Categories", { selectedCategory: "All Products" })}>
//                     <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.seeAll}>
//                         See all
//                     </Text>
//                 </TouchableOpacity>
//             </View>
//             <View style={styles.categoryGrid}>
//                 {categories.map((category) => (
//                     <TouchableOpacity
//                         key={category.id}
//                         style={styles.categoryItem}
//                         onPress={() => navigation.navigate("Categories", { selectedCategory: category.name })}
//                     >
//                         <Image
//                             source={category.image}
//                             style={styles.categoryImage}
//                             resizeMode="contain"
//                         />
//                         <Text
//                             allowFontScaling={false}
//                             adjustsFontSizeToFit
//                             style={styles.categoryName}
//                             numberOfLines={2}
//                         >
//                             {category.name}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//         </>
//     );
// });

// // New component for the image.gif banner
// const ImageBanner = memo(() => {
//     return (
//         <TouchableOpacity style={styles.imageBannerContainer} activeOpacity={0.8}>
//             <Image
//                 source={IMAGE_BANNER_SOURCE}
//                 style={styles.imageBannerImage}
//                 resizeMode="cover"
//             />
//         </TouchableOpacity>
//     );
// });


// const GifBanner = memo(({ hampers, isLoading }) => {
//     const navigation = useNavigation();

//     if (!isLoading && (!hampers || hampers.length === 0)) {
//         return null;
//     }

//     return (
//         <View style={styles.gifBannerContainer}>
//             <Image
//                 source={require("../assets/aab.gif")}
//                 style={styles.gifBannerImage}
//                 resizeMode="stretch"
//             />
//             <View style={styles.curatedHampersContainer}>
//                 <Image
//                     source={require("../assets/font.gif")}
//                     style={styles.curatedHampersImage}
//                     resizeMode="contain"
//                 />
//             </View>
//             {isLoading ? (
//                 <ActivityIndicator size="large" color="#0C5273" style={styles.hampersLoader} />
//             ) : (
//                 <View style={styles.hampersListContainer}>
//                     <FlatList
//                         data={hampers}
//                         keyExtractor={(item, index) => `${item.id}-${index}`}
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                         contentContainerStyle={styles.hampersListContent}
//                         renderItem={({ item }) => (
//                             <HamperCard
//                                 product={item}
//                                 // Navigate to the new, dedicated screen for hampers
//                                 onPress={() => navigation.navigate("HamperDetails", {
//                                     productId: item.id,
//                                 })}
//                             />
//                         )}
//                     />
//                 </View>
//             )}
//         </View>
//     );
// });

// const RangesSection = memo(({ flatListRef }) => {
//     const navigation = useNavigation();
//     return (
//         <View style={styles.rangesContainer}>
//             <View style={styles.sectionHeader}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
//                     Our Ranges
//                 </Text>
//             </View>
//             <View style={styles.rangeListContainer}>
//                 <FlatList
//                     ref={flatListRef}
//                     data={ranges}
//                     keyExtractor={(item) => item.id}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={styles.rangeListContent}
//                     snapToInterval={RANGE_IMAGE_WIDTH + CARD_GAP}
//                     snapToAlignment="start"
//                     decelerationRate="fast"
//                     getItemLayout={(data, index) => ({
//                         length: RANGE_IMAGE_WIDTH + CARD_GAP,
//                         offset: (RANGE_IMAGE_WIDTH + CARD_GAP) * index,
//                         index,
//                     })}
//                     renderItem={({ item }) => (
//                         <TouchableOpacity
//                             style={styles.rangeItem}
//                             onPress={() => navigation.navigate("RangeScreen", { name: item.name })}
//                         >
//                             <Image
//                                 source={item.image}
//                                 style={styles.rangeImage}
//                                 resizeMode="contain"
//                             />
//                         </TouchableOpacity>
//                     )}
//                 />
//             </View>
//         </View>
//     );
// });

// const LetsTryBanner = memo(() => (
//     <View style={styles.letsTryBannerContainer}>
//         <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.letsTryBannerText}>
//             Tasty, healthy snacks{'\n'}crafted with care. <Text style={styles.heart}>❤️</Text>
//         </Text>
//         <View style={styles.divider} />
//         <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.letsTryBrand}>
//             Let's Try
//         </Text>
//     </View>
// ));

// const HomeScreen = () => {
//     const [searchText, setSearchText] = useState("");
//     const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
//     const navigation = useNavigation();
//     const flatListRef = useRef(null);
//     const { address } = useLocation();
//     const { user } = useAuth();
//     const { selectedAddress, loading: addressLoading } = useAddress();
//     const { inTransit } = useInTransit();
//     const scrollY = useRef(new Animated.Value(0)).current;
//     const [isBannerVisible, setIsBannerVisible] = useState(false);
//     const [hasUserClosedBanner, setHasUserClosedBanner] = useState(false);
//     const appState = useRef(AppState.currentState);

//     const { data: eventsData = { events: [] }, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({ queryKey: ['activeEvents'], queryFn: fetchActiveEvents });
//     const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({ queryKey: ['products'], queryFn: fetchFoodList });
//     const { data: bestSellers = [], isLoading: bestSellersLoading, refetch: refetchBestsellers } = useQuery({ queryKey: ['bestsellers'], queryFn: fetchBestsellers });
//     const { data: newLaunches = [], isLoading: newLaunchesLoading, refetch: refetchNewLaunches } = useQuery({ queryKey: ['newLaunches'], queryFn: fetchNewLaunches });
//     const { data: hampers = [], isLoading: hampersLoading, refetch: refetchHampers } = useQuery({
//         queryKey: ['hampers'],
//         queryFn: fetchHampers
//     });
    
//     const isInitialLoading = eventsLoading || productsLoading || bestSellersLoading || newLaunchesLoading || hampersLoading;
//     const [isRefreshing, setIsRefreshing] = useState(false);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setIsPromoModalVisible(true);
//         }, 1500);
//         return () => clearTimeout(timer);
//     }, []);

//     const onRefresh = useCallback(async () => {
//         crashlytics().log("HomeScreen pull to refresh triggered");
//         setIsRefreshing(true);
//         try {
//             await Promise.all([
//                 refetchEvents(),
//                 refetchProducts(),
//                 refetchBestsellers(),
//                 refetchNewLaunches(),
//                 refetchHampers()
//             ]);
//         } catch (error) {
//             crashlytics().recordError(error);
//         } finally {
//             setIsRefreshing(false);
//         }
//     }, [refetchEvents, refetchProducts, refetchBestsellers, refetchNewLaunches, refetchHampers]);

//     const handleCloseBanner = useCallback(() => {
//         setIsBannerVisible(false);
//         setHasUserClosedBanner(true);
//     }, []);

//     const handleEventSelect = useCallback((event) => {
//         crashlytics().log(`User selected event: ${event.name}`);
//         navigation.navigate("EventProducts", {
//             eventData: eventsData,
//             initialEvent: event
//         });
//     }, [navigation, eventsData]);

//     useEffect(() => {
//         const subscription = AppState.addEventListener('change', nextAppState => {
//             if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
//                 if (!hasUserClosedBanner) {
//                     setIsBannerVisible(true);
//                 }
//             }
//             appState.current = nextAppState;
//         });
//         return () => subscription.remove();
//     }, [hasUserClosedBanner]);

//     const productsByCategory = React.useMemo(() => {
//         return CATEGORIES.reduce((acc, category) => {
//             acc[category] = products.filter(product => product.category?.toLowerCase() === category.toLowerCase());
//             return acc;
//         }, {});
//     }, [products]);

//     const renderItem = useCallback(({ item }) => {
//         switch (item.type) {
//             case 'events':
//                 return <EventsSection eventsData={eventsData} handleEventSelect={handleEventSelect} />;
//             case 'bestSellers':
//                 return <HorizontalProductList title="Best Sellers" products={bestSellers} />;
//             case 'categories':
//                 return <CategoriesSection />;
//             case 'imageBanner': // New case for the banner
//                 return <ImageBanner />;
//             case 'gifBanner':
//                 return <GifBanner hampers={hampers} isLoading={hampersLoading} />;
//             case 'ranges':
//                 return <RangesSection flatListRef={flatListRef} />;
//             case 'newLaunches':
//                 return <HorizontalProductList title="New Launches" products={newLaunches} />;
//             case 'categorySection':
//                 return (
//                     <View style={styles.categorySection}>
//                         <HorizontalProductList
//                             title={item.category}
//                             products={productsByCategory[item.category] || []}
//                             seeAllScreen="Categories"
//                             seeAllParams={{ selectedCategory: item.category }}
//                         />
//                     </View>
//                 );
//             case 'letsTryBanner':
//                 return <LetsTryBanner />;
//             default:
//                 return null;
//         }
//     }, [eventsData, handleEventSelect, bestSellers, newLaunches, productsByCategory, hampers, hampersLoading]);

//     const data = [
//         { type: 'events' },
//         { type: 'gifBanner' },
//         { type: 'bestSellers' },
//         { type: 'categories' },
//         { type: 'imageBanner' }, // Placed between 'categories' and 'ranges'
//         { type: 'ranges' },
//         { type: 'newLaunches' },
//         ...CATEGORIES.map(category => ({ type: 'categorySection', category })),
//         { type: 'letsTryBanner' }
//     ];

//     if (isInitialLoading) {
//         return <HomeScreenShimmer />;
//     }

//     return (
//         <View style={styles.container}>
//             <PromoModal
//                 visible={isPromoModalVisible}
//                 onClose={() => setIsPromoModalVisible(false)}
//             />
//             <StatusBar
//                 barStyle="dark-content"
//                 backgroundColor="transparent"
//                 translucent
//             />
//             <StickyHeader
//                 scrollY={scrollY}
//                 searchText={searchText}
//                 setSearchText={setSearchText}
//                 selectedAddress={selectedAddress}
//                 addressLoading={addressLoading}
//                 address={address}
//                 user={user}
//                 navigation={navigation}
//             />
//             <Animated.FlatList
//                 data={data}
//                 renderItem={renderItem}
//                 keyExtractor={(item, index) => `${item.type}-${index}`}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//                 onScroll={Animated.event(
//                     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//                     { useNativeDriver: false } 
//                 )}
//                 scrollEventThrottle={16}
//                 ListFooterComponent={<View style={{ height: hp('10%') }} />}
//                 onRefresh={onRefresh}
//                 refreshing={isRefreshing}
//                 bounces={true}
//             />
//             <View style={styles.bottomRow}>
//                 {inTransit && isBannerVisible ? (
//                     <InTransitBanner
//                         onViewPress={() => navigation.navigate("MyOrdersScreen", { initialTab: "inTransit" })}
//                         onClosePress={handleCloseBanner}
//                         style={styles.inTransitBanner}
//                     />
//                 ) : (
//                     <FloatingCartButton
//                         onPress={() => navigation.navigate("Cart")}
//                         customStyle={styles.floatingCartButtonCustom}
//                     />
//                 )}
//             </View>
//         </View>
//     );
// };

// // Styles
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#FFFFFF"
//     },
//     stickyHeaderContainer: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         zIndex: 500,
//         paddingBottom: hp('1%')
//     },
//     locationBarContainer: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: wp('5%')
//     },
//     icon: {
//         marginRight: wp('2%'),
//         alignSelf: "center"
//     },
//     locationtext: {
//         fontSize: rf(1.7),
//         color: "#222",
//         fontWeight: "bold"
//     },
//     label: {
//         fontSize: rf(2.2),
//         color: "#222",
//         fontWeight: "bold",
//         marginLeft: wp('0.1%'),
//         textTransform: "capitalize",
//         minWidth: wp(14)
//     },
//     locationRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         marginBottom: hp('0.1%')
//     },
//     location: {
//         fontSize: rf(1.8),
//         color: "#222",
//         fontWeight: "400",
//         marginTop: 0
//     },
//     chevron: {
//         marginTop: hp('0.1%')
//     },
//     headerSearchWrapper: {
//         paddingHorizontal: wp('5%')
//     },
//     scrollContent: {
//         paddingBottom: hp('3%')
//     },
//     eventsHeroSection: {
//         height: EVENTS_SECTION_HEIGHT,
//         marginBottom: hp('2%'),
//         flex: 1,
//         paddingBottom: hp('1%')
//     },
//     eventGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//         paddingHorizontal: wp('4%'),
//         marginTop: hp('30%'),
//         marginBottom: hp('2%')
//     },
//     squareCard: {
//         width: CARD_WIDTH - 3,
//         aspectRatio: 0.85,
//         marginBottom: hp('1.5%'),
//         backgroundColor: '#fff',
//         borderRadius: wp('3%'),
//         alignItems: 'center',
//         justifyContent: 'flex-start',
//         paddingTop: hp('0.5%'),
//         overflow: 'hidden'
//     },
//     eventTextContainer: {
//         height: hp('4%'),
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     eventImage: {
//         width: '90%',
//         height: '60%',
//         resizeMode: 'contain'
//     },
//     eventNameText: {
//         fontSize: rf(1.4),
//         color: '#0c5273',
//         fontWeight: 'bold',
//         textAlign: 'center',
//         textTransform: 'capitalize',
//         paddingHorizontal: wp('1%'),
//         maxWidth: '100%'
//     },
//     sectionHeader: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingHorizontal: wp('4.6%'),
//         marginTop: hp('0.23%'),
//         marginBottom: hp('2.1%')
//     },
//     sectionTitle: {
//         fontSize: rf(2.2),
//         fontWeight: "bold",
//         color: "#222",
//         minWidth: wp(50),
//         marginTop: hp('1%'),
//         marginBottom: hp('1%')
//     },
//     seeAll: {
//         color: "#0C5273",
//         fontWeight: "bold",
//         fontSize: rf(1.8),
//         paddingEnd: wp('2.5%')
//     },
//     horizontalList: {
//         paddingVertical: hp('0.5%'),
//         marginBottom: hp('0.5%')
//     },
//     horizontalCardContainer: {},
//     categoryGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//         paddingHorizontal: wp('3.5%'),
//         marginBottom: hp('1.%')
//     },
//     categoryItem: {
//         width: wp('23%'),
//         marginBottom: hp('1.5%'),
//         alignItems: 'center'
//     },
//     categoryImage: {
//         width: wp('21.5%'),
//         height: wp('21.5%'),
//         marginBottom: hp('0.5%')
//     },
//     categoryName: {
//         fontSize: rf(1.3),
//         fontWeight: '700',
//         color: '#222',
//         textAlign: 'center',
//         paddingHorizontal: wp('1%')
//     },
//     // New styles for ImageBanner
//     imageBannerContainer: {
//         width: wp('92%'),
//         height: hp('25%'), // Adjust height as needed
//         alignSelf: 'center',
//         marginVertical: hp('2%'),
//         borderRadius: wp('2%'),
//         overflow: 'hidden',
//         marginBottom: hp('3%')
//     },
//     imageBannerImage: {
//         width: '100%',
//         height: '100%',
//     },
//     gifBannerContainer: {
//         marginVertical: hp('1%'),
//         marginBottom: hp('4%'),
//         position: 'relative',
//     },
//     gifBannerImage: {
//         width: '100%',
//         height: hp('55%'),
//         borderRadius: wp('2%'),
//     },
//     curatedHampersContainer: {
//         position: 'absolute',
//         top: -hp('0.5%'),
//         left: 0,
//         right: 0,
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 1,
//     },
//     curatedHampersImage: {
//         width: wp('80%'),
//         height: hp('22%'),
//     },
//     hampersListContainer: {
//         position: 'absolute',
//         top: hp('13%'),
//         left: '1%',
//         right: 0,
//     },
//     hampersListContent: {
//         paddingHorizontal: wp('2%'),
//     },
//     hampersLoader: {
//         position: 'absolute',
//         top: hp('30%'),
//         alignSelf: 'center',
//     },
//     rangesContainer: {
//         marginBottom: hp('2.5%'),
//         marginTop: -hp('2%')
//     },
//     rangeListContainer: {
//         position: 'relative',
//         height: RANGE_IMAGE_HEIGHT
//     },
//     rangeListContent: {
//         paddingHorizontal: wp('4.4%')
//     },
//     rangeItem: {
//         width: RANGE_IMAGE_WIDTH,
//         marginRight: CARD_GAP
//     },
//     rangeImage: {
//         width: '100%',
//         height: RANGE_IMAGE_HEIGHT,
//         borderRadius: wp('2%')
//     },
//     categorySection: {
//         marginBottom: hp('1%'),
//         paddingHorizontal: wp('1%')
//     },
//     noProducts: {
//         paddingHorizontal: wp('5%'),
//         color: '#666',
//         fontStyle: 'italic',
//         fontSize: rf(1.8)
//     },
//     letsTryBannerContainer: {
//         alignItems: 'flex-start',
//         justifyContent: 'center',
//         marginVertical: 30,
//         paddingHorizontal: wp('4%'),
//         backgroundColor: '#fffff',
//         borderRadius: 14,
//         width: '92%',
//         alignSelf: 'center'
//     },
//     letsTryBannerText: {
//         fontSize: rf(3.5),
//         fontWeight: 'bold',
//         color: '#bfc2c7',
//         lineHeight: rf(5.5)
//     },
//     heart: {
//         color: '#ff5a5f',
//         fontSize: rf(3)
//     },
//     letsTryBrand: {
//         fontSize: rf(2),
//         color: '#bfc2c7',
//         marginTop: 35,
//         fontWeight: 'bold',
//         letterSpacing: 1
//     },
//     divider: {
//         height: 1,
//         width: '100%',
//         backgroundColor: '#bfc2c7',
//         marginTop: 25,
//         marginBottom: 5
//     },
//     bottomRow: {
//         position: "absolute",
//         left: 0,
//         right: 0,
//         bottom: 0,
//         paddingHorizontal: wp(0),
//         paddingBottom: hp(1.5),
//         backgroundColor: "transparent",
//         zIndex: 1000,
//         alignItems: "center"
//     },
//     inTransitBanner: {
//         width: "100%",
//         bottom: -hp(1.7)
//     },
//     floatingCartButtonCustom: {},
// });

// export default HomeScreen;



// import React, { useState, useEffect, useRef, useCallback, memo } from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     StatusBar,
//     FlatList,
//     Image,
//     ActivityIndicator,
//     ImageBackground,
//     Animated,
//     AppState,
// } from "react-native";
// import { useQuery } from "@tanstack/react-query";
// import crashlytics from "@react-native-firebase/crashlytics";
// import SearchBar from "../components/SearchBar";
// import HomeProductCard from "../components/HomeProductCard";
// import FloatingCartButton from "../components/FloatingCartButton";
// import PromoModal from "../components/PromoModal";
// import { useNavigation } from "@react-navigation/native";
// import { fetchFoodList, fetchNewLaunches } from "../services/FoodService";
// import { fetchBestsellers } from "../services/RecommendationService";
// import { fetchActiveEvents } from "../services/EventService";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useLocation } from "../context/LocationContext";
// import { useAuth } from "../context/AuthContext";
// import { useAddress } from "../context/AddressContext";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//     widthPercentageToDP as wp,
//     heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { RFPercentage as rf } from "react-native-responsive-fontsize";
// import InTransitBanner from "../components/InTransitBanner";
// import { useInTransit } from "../context/InTransitContext";
// import HomeScreenShimmer from "../components/HomeScreenShimmer";
// import HamperCard from "../components/HamperCard";

// // Constants
// const CARD_GAP = wp('2%');
// const CARD_WIDTH = (wp('100%') - wp('10%')) / 4;
// const RANGE_IMAGE_WIDTH = (wp('100%') - wp('8%') - (11 * CARD_GAP)) / 2;
// const RANGE_IMAGE_HEIGHT = hp('20%');
// const EVENTS_SECTION_HEIGHT = hp('57%');

// const CATEGORIES = [
//     "Purani Delhi", "Fasting Special", "Cake & Muffins", "Indian Sweets",
//     "Healthy Snacks", "Bhujia", "Cookies", "Rusk", "Munchies", "Pratham",
//     "Chips n Crisps", "South Range",
// ];

// const categories = [
//     { id: "1", name: "Purani Delhi", image: require("../assets/categories/purani_delhi.png") },
//     { id: "2", name: "Indian Sweets", image: require("../assets/categories/indian_sweets.png") },
//     { id: "3", name: "Healthy Snacks", image: require("../assets/categories/makhana.png") },
//     { id: "4", name: "Bhujia", image: require("../assets/categories/bhujia.png") },
//     { id: "5", name: "Cookies", image: require("../assets/categories/cookies.png") },
//     { id: "6", name: "Munchies", image: require("../assets/categories/munchies.png") },
//     { id: "7", name: "Fasting Special", image: require("../assets/categories/fasting_special.png") },
//     { id: "8", name: "Pratham", image: require("../assets/categories/pratham.png") },
//     { id: "9", name: "Chips n Crisps", image: require("../assets/categories/chips_crisps.png") },
//     { id: "10", name: "South Range", image: require("../assets/categories/south_range.png") },
//     { id: "11", name: "Cake & Muffins", image: require("../assets/categories/cakes.png") },
//     { id: "12", name: "Rusk", image: require("../assets/categories/rusk.png") },
// ];

// const ranges = [
//     { id: "1", name: "No Maida Range", image: require("../assets/range/no_maida_range.png") },
//     { id: "2", name: "Goodness of Wheat", image: require("../assets/range/wheat_range.png") },
//     { id: "3", name: "No Palm Oil Range", image: require("../assets/range/no_palm_oil.png") },
//     { id: "4", name: "Muffins & Cakes", image: require("../assets/range/muffin_range.png") },
//     { id: "5", name: "Puff Range", image: require("../assets/range/puff_range.png") },
//     { id: "6", name: "Wafers Range", image: require("../assets/range/wafers_range.png") },
//     { id: "7", name: "South Range", image: require("../assets/range/south_range.png") },
//     { id: "8", name: "Roasted Range", image: require("../assets/range/roasted_range.png") },
//     { id: "9", name: "Namkeen Range", image: require("../assets/range/namkeen_range.png") },
// ];

// const fetchBanners = async () => {
//     try {
//         const response = await fetch("https://api.letstryfoods.com/api/banners");
//         if (!response.ok) {
//             throw new Error("Network response was not ok for banners");
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         crashlytics().recordError(new Error(`Failed to fetch banners: ${error.message}`));
//         console.error("Failed to fetch banners:", error);
//         return [];
//     }
// };


// const fetchHampers = async () => {
//     try {
//         const response = await fetch("https://api.letstryfoods.com/api/giftboxes");
//         if (!response.ok) {
//             throw new Error("Network response was not ok for hampers");
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         crashlytics().recordError(new Error(`Failed to fetch hampers: ${error.message}`));
//         console.error("Failed to fetch hampers:", error);
//         return [];
//     }
// };

// const fetchCombos = async () => {
//     try {
//         const response = await fetch("https://api.letstryfoods.com/api/combos");
//         if (!response.ok) {
//             throw new Error("Network response was not ok for combos");
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         crashlytics().recordError(new Error(`Failed to fetch combos: ${error.message}`));
//         console.error("Failed to fetch combos:", error);
//         return [];
//     }
// };

// const StickyHeader = ({ scrollY, searchText, setSearchText, selectedAddress, addressLoading, address, user, navigation, textColor, headerColor }) => {
//     const insets = useSafeAreaInsets();
//     const dynamicTextColor = textColor || "#000";
//     const dynamicHeaderBgColor = headerColor || "#FFF7E8";

//     const headerOpacity = scrollY.interpolate({
//         inputRange: [0, EVENTS_SECTION_HEIGHT - hp(25)],
//         outputRange: [0, 1],
//         extrapolate: 'clamp'
//     });
//     const headerShadowOpacity = scrollY.interpolate({
//         inputRange: [0, EVENTS_SECTION_HEIGHT - hp(21), EVENTS_SECTION_HEIGHT],
//         outputRange: [0, 0.3, 0.9],
//         extrapolate: 'clamp'
//     });

//     return (
//         <View style={[styles.stickyHeaderContainer, { paddingTop: insets.top + hp(0.7) }]} pointerEvents="box-none">
//             <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: dynamicHeaderBgColor, opacity: headerOpacity, shadowOpacity: headerShadowOpacity }]} />
//             <View style={styles.locationBarContainer}>
//                 <Ionicons name="location-sharp" size={rf(2.8)} color={dynamicTextColor} style={styles.icon} />
//                 <TouchableOpacity style={{ flex: 1 }} onPress={() => user ? navigation.navigate("AddressBook") : navigation.navigate("Login")} activeOpacity={0.7}>
//                     <View style={styles.locationRow}>
//                         <Text allowFontScaling={false} adjustsFontSizeToFit style={[styles.locationtext, { color: dynamicTextColor }]}>
//                             Delivering at
//                         </Text>
//                         {user && selectedAddress && selectedAddress.label ? (
//                             <>
//                                 <Text allowFontScaling={false} adjustsFontSizeToFit style={[styles.label, { color: dynamicTextColor }]}>
//                                     {selectedAddress.label}
//                                 </Text>
//                                 <Ionicons name="chevron-down" size={rf(2)} color={dynamicTextColor} style={styles.chevron} />
//                             </>
//                         ) : null}
//                     </View>
//                     {addressLoading ? (
//                         <ActivityIndicator size="small" color={dynamicTextColor} style={{ marginTop: hp('0.2%') }} />
//                     ) : (
//                         <Text allowFontScaling={false} adjustsFontSizeToFit style={[styles.location, { color: dynamicTextColor }]}>
//                             {user && selectedAddress?.addressId ? `${selectedAddress.buildingName}, ${selectedAddress.street}` : !user && address ? address.split(",").slice(0, 3).join(",") : user ? "Select Address" : "Select Location"}
//                         </Text>
//                     )}
//                 </TouchableOpacity>
//             </View>
//             <View style={styles.headerSearchWrapper}>
//                 <SearchBar searchText={searchText} setSearchText={setSearchText} placeholder="Search products" />
//             </View>
//         </View>
//     );
// };

// const EventsSection = memo(({ eventsData, handleEventSelect }) => (
//     <ImageBackground
//         source={eventsData?.backgroundImageUrl ? { uri: eventsData.backgroundImageUrl } : require("../assets/images/bg-image.png")}
//         style={styles.eventsHeroSection}
//         resizeMode="cover"
//     >
//         <View style={styles.eventGrid}>
//             {eventsData.events.slice(0, 8).map((event, index) => (
//                 <TouchableOpacity
//                     key={`event-${event.priority}-${event.name}-${index}`}
//                     style={styles.squareCard}
//                     onPress={() => handleEventSelect(event)}
//                 >
//                     <View style={styles.eventTextContainer}>
//                         <Text
//                             allowFontScaling={false}
//                             adjustsFontSizeToFit
//                             numberOfLines={2}
//                             style={styles.eventNameText}
//                         >
//                             {event.name}
//                         </Text>
//                     </View>
//                     <Image
//                         source={{ uri: event.imageUrl || "https://via.placeholder.com/150" }}
//                         style={styles.eventImage}
//                     />
//                 </TouchableOpacity>
//             ))}
//         </View>
//     </ImageBackground>
// ));

// const HorizontalProductList = memo(({ title, products, seeAllScreen, seeAllParams }) => {
//     const navigation = useNavigation();
//     return (
//         <>
//             <View style={styles.sectionHeader}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
//                     {title}
//                 </Text>
//                 {seeAllScreen && (
//                     <TouchableOpacity onPress={() => navigation.navigate(seeAllScreen, seeAllParams)}>
//                         <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.seeAll}>
//                             See all
//                         </Text>
//                     </TouchableOpacity>
//                 )}
//             </View>
//             {products.length > 0 ? (
//                 <FlatList
//                     data={products}
//                     keyExtractor={(item) => item.id.toString()}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={[styles.horizontalList, { paddingHorizontal: wp('2%') - CARD_GAP / 2 }]}
//                     renderItem={({ item }) => (
//                         <View style={[styles.horizontalCardContainer, { marginHorizontal: CARD_GAP / 2 }]}>
//                             <HomeProductCard
//                                 product={item}
//                                 onPress={() => navigation.navigate("ProductDetails", {
//                                     productId: item.id,
//                                 })}
//                             />
//                         </View>
//                     )}
//                 />
//             ) : (
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.noProducts}>
//                     No products available
//                 </Text>
//             )}
//         </>
//     );
// });

// const NonClickableProductList = memo(({ title, products }) => {
//     return (
//         <>
//             <View style={styles.sectionHeader}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
//                     {title}
//                 </Text>
//             </View>
//             {products?.length > 0 ? (
//                 <FlatList
//                     data={products}
//                     keyExtractor={(item) => item.id.toString()}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={[styles.horizontalList, { paddingHorizontal: wp('2%') - CARD_GAP / 2 }]}
//                     renderItem={({ item }) => (
//                         <View style={[styles.horizontalCardContainer, { marginHorizontal: CARD_GAP / 2 }]}>
//                             <HomeProductCard product={item} />
//                         </View>
//                     )}
//                 />
//             ) : (
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.noProducts}>
//                     No products available
//                 </Text>
//             )}
//         </>
//     );
// });

// const CategoriesSection = memo(() => {
//     const navigation = useNavigation();
//     return (
//         <>
//             <View style={styles.sectionHeader}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
//                     Shop By Categories
//                 </Text>
//                 <TouchableOpacity onPress={() => navigation.navigate("Categories", { selectedCategory: "All Products" })}>
//                     <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.seeAll}>
//                         See all
//                     </Text>
//                 </TouchableOpacity>
//             </View>
//             <View style={styles.categoryGrid}>
//                 {categories.map((category) => (
//                     <TouchableOpacity
//                         key={category.id}
//                         style={styles.categoryItem}
//                         onPress={() => navigation.navigate("Categories", { selectedCategory: category.name })}
//                     >
//                         <Image
//                             source={category.image}
//                             style={styles.categoryImage}
//                             resizeMode="contain"
//                         />
//                         <Text
//                             allowFontScaling={false}
//                             adjustsFontSizeToFit
//                             style={styles.categoryName}
//                             numberOfLines={2}
//                         >
//                             {category.name}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//         </>
//     );
// });

// // --- UPDATED COMPONENT --- Logic for auto-scroll and dots added
// const APIBanner = memo(({ banners, isLoading }) => {
//     const flatListRef = useRef(null);
//     const [currentIndex, setCurrentIndex] = useState(0);

//     // --- UPDATED --- Auto-scroll logic is now more robust
//     useEffect(() => {
//         if (!isLoading && banners && banners.length > 1) {
//             const interval = setInterval(() => {
//                 setCurrentIndex(prevIndex => {
//                     const nextIndex = (prevIndex + 1) % banners.length;
//                     flatListRef.current?.scrollToIndex({
//                         animated: true,
//                         index: nextIndex,
//                     });
//                     return nextIndex;
//                 });
//             }, 3000); // 3-second delay

//             return () => clearInterval(interval); // Cleanup on unmount
//         }
//     }, [banners, isLoading]);


//     // Update current index when user scrolls manually
//     const onViewableItemsChanged = useRef(({ viewableItems }) => {
//         if (viewableItems.length > 0) {
//             setCurrentIndex(viewableItems[0].index);
//         }
//     }).current;

//     if (isLoading) {
//         return (
//             <View style={[styles.imageBannerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
//                 <ActivityIndicator size="large" color="#0C5273" />
//             </View>
//         );
//     }

//     if (!banners || banners.length === 0) {
//         return null;
//     }

//     return (
//         <View style={styles.imageBannerContainer}>
//             <FlatList
//                 ref={flatListRef}
//                 data={banners}
//                 keyExtractor={(item) => item._id}
//                 horizontal
//                 pagingEnabled
//                 showsHorizontalScrollIndicator={false}
//                 onViewableItemsChanged={onViewableItemsChanged}
//                 viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
//                 renderItem={({ item }) => (
//                     <TouchableOpacity style={styles.apiBannerItem} activeOpacity={0.8}>
//                         <Image
//                             source={{ uri: item.imageUrl }}
//                             style={styles.imageBannerImage}
//                             resizeMode="cover"
//                         />
//                     </TouchableOpacity>
//                 )}
//             />
//             {/* --- NEW --- Indicator Dots */}
//             <View style={styles.dotContainer}>
//                 {banners.map((_, index) => (
//                     <View
//                         key={index}
//                         style={[
//                             styles.dotStyle,
//                             currentIndex === index && styles.activeDotStyle,
//                         ]}
//                     />
//                 ))}
//             </View>
//         </View>
//     );
// });


// const GifBanner = memo(({ hampers, isLoading }) => {
//     const navigation = useNavigation();

//     if (!isLoading && (!hampers || hampers.length === 0)) {
//         return null;
//     }

//     return (
//         <View style={styles.gifBannerContainer}>
//             <Image
//                 source={require("../assets/aab.gif")}
//                 style={styles.gifBannerImage}
//                 resizeMode="stretch"
//             />
//             <View style={styles.curatedHampersContainer}>
//                 <Image
//                     source={require("../assets/font.gif")}
//                     style={styles.curatedHampersImage}
//                     resizeMode="contain"
//                 />
//             </View>
//             {isLoading ? (
//                 <ActivityIndicator size="large" color="#0C5273" style={styles.hampersLoader} />
//             ) : (
//                 <View style={styles.hampersListContainer}>
//                     <FlatList
//                         data={hampers}
//                         keyExtractor={(item, index) => `${item.id}-${index}`}
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                         contentContainerStyle={styles.hampersListContent}
//                         renderItem={({ item }) => (
//                             <HamperCard
//                                 product={item}
//                                 onPress={() => navigation.navigate("HamperDetails", {
//                                     productId: item.id,
//                                 })}
//                             />
//                         )}
//                     />
//                 </View>
//             )}
//         </View>
//     );
// });

// const RangesSection = memo(({ flatListRef }) => {
//     const navigation = useNavigation();
//     return (
//         <View style={styles.rangesContainer}>
//             <View style={styles.sectionHeader}>
//                 <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
//                     Our Ranges
//                 </Text>
//             </View>
//             <View style={styles.rangeListContainer}>
//                 <FlatList
//                     ref={flatListRef}
//                     data={ranges}
//                     keyExtractor={(item) => item.id}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={styles.rangeListContent}
//                     snapToInterval={RANGE_IMAGE_WIDTH + CARD_GAP}
//                     snapToAlignment="start"
//                     decelerationRate="fast"
//                     getItemLayout={(data, index) => ({
//                         length: RANGE_IMAGE_WIDTH + CARD_GAP,
//                         offset: (RANGE_IMAGE_WIDTH + CARD_GAP) * index,
//                         index,
//                     })}
//                     renderItem={({ item }) => (
//                         <TouchableOpacity
//                             style={styles.rangeItem}
//                             onPress={() => navigation.navigate("RangeScreen", { name: item.name })}
//                         >
//                             <Image
//                                 source={item.image}
//                                 style={styles.rangeImage}
//                                 resizeMode="contain"
//                             />
//                         </TouchableOpacity>
//                     )}
//                 />
//             </View>
//         </View>
//     );
// });

// const LetsTryBanner = memo(() => (
//     <View style={styles.letsTryBannerContainer}>
//         <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.letsTryBannerText}>
//             Tasty, healthy snacks{'\n'}crafted with care. <Text style={styles.heart}>❤️</Text>
//         </Text>
//         <View style={styles.divider} />
//         <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.letsTryBrand}>
//             Let's Try
//         </Text>
//     </View>
// ));

// const HomeScreen = () => {
//     const [searchText, setSearchText] = useState("");
//     const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
//     const navigation = useNavigation();
//     const flatListRef = useRef(null);
//     const { address } = useLocation();
//     const { user } = useAuth();
//     const { selectedAddress, loading: addressLoading } = useAddress();
//     const { inTransit } = useInTransit();
//     const scrollY = useRef(new Animated.Value(0)).current;
//     const [isBannerVisible, setIsBannerVisible] = useState(false);
//     const [hasUserClosedBanner, setHasUserClosedBanner] = useState(false);
//     const appState = useRef(AppState.currentState);

//     const { data: eventsData = { events: [] }, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({ queryKey: ['activeEvents'], queryFn: fetchActiveEvents });
//     const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({ queryKey: ['products'], queryFn: fetchFoodList });
//     const { data: bestSellers = [], isLoading: bestSellersLoading, refetch: refetchBestsellers } = useQuery({ queryKey: ['bestsellers'], queryFn: fetchBestsellers });
//     const { data: newLaunches = [], isLoading: newLaunchesLoading, refetch: refetchNewLaunches } = useQuery({ queryKey: ['newLaunches'], queryFn: fetchNewLaunches });
//     const { data: hampers = [], isLoading: hampersLoading, refetch: refetchHampers } = useQuery({ queryKey: ['hampers'], queryFn: fetchHampers });
//     const { data: combos = [], isLoading: combosLoading, refetch: refetchCombos } = useQuery({
//         queryKey: ['combos'],
//         queryFn: fetchCombos
//     });
//     const { data: banners = [], isLoading: bannersLoading, refetch: refetchBanners } = useQuery({
//         queryKey: ['banners'],
//         queryFn: fetchBanners,
//     });


//     const getStatusBarStyle = () => {
//         const textColor = eventsData?.textColor;
//         if (!textColor) return 'dark-content';
//         const hexColor = textColor.replace('#', '');
//         const r = parseInt(hexColor.substr(0, 2), 16);
//         const g = parseInt(hexColor.substr(2, 2), 16);
//         const b = parseInt(hexColor.substr(4, 2), 16);
//         const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
//         return brightness > 125 ? 'dark-content' : 'light-content';
//     };

//     const isInitialLoading = eventsLoading || productsLoading || bestSellersLoading || newLaunchesLoading || hampersLoading || combosLoading;
//     const [isRefreshing, setIsRefreshing] = useState(false);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setIsPromoModalVisible(true);
//         }, 1500);
//         return () => clearTimeout(timer);
//     }, []);

//     const onRefresh = useCallback(async () => {
//         crashlytics().log("HomeScreen pull to refresh triggered");
//         setIsRefreshing(true);
//         try {
//             await Promise.all([
//                 refetchEvents(),
//                 refetchProducts(),
//                 refetchBestsellers(),
//                 refetchNewLaunches(),
//                 refetchHampers(),
//                 refetchCombos(),
//                 refetchBanners()
//             ]);
//         } catch (error) {
//             crashlytics().recordError(error);
//         } finally {
//             setIsRefreshing(false);
//         }
//     }, [refetchEvents, refetchProducts, refetchBestsellers, refetchNewLaunches, refetchHampers, refetchCombos, refetchBanners]);


//     const handleCloseBanner = useCallback(() => {
//         setIsBannerVisible(false);
//         setHasUserClosedBanner(true);
//     }, []);

//     const handleEventSelect = useCallback((event) => {
//         crashlytics().log(`User selected event: ${event.name}`);
//         navigation.navigate("EventProducts", {
//             eventData: eventsData,
//             initialEvent: event
//         });
//     }, [navigation, eventsData]);

//     useEffect(() => {
//         const subscription = AppState.addEventListener('change', nextAppState => {
//             if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
//                 if (!hasUserClosedBanner) {
//                     setIsBannerVisible(true);
//                 }
//             }
//             appState.current = nextAppState;
//         });
//         return () => subscription.remove();
//     }, [hasUserClosedBanner]);

//     const productsByCategory = React.useMemo(() => {
//         return CATEGORIES.reduce((acc, category) => {
//             acc[category] = products.filter(product => product.category?.toLowerCase() === category.toLowerCase());
//             return acc;
//         }, {});
//     }, [products]);

//     const renderItem = useCallback(({ item }) => {
//         switch (item.type) {
//             case 'events':
//                 return <EventsSection eventsData={eventsData} handleEventSelect={handleEventSelect} />;
//             case 'bestSellers':
//                 return <HorizontalProductList title="Best Sellers" products={bestSellers} />;
//             case 'categories':
//                 return <CategoriesSection />;
//             case 'apiBanner':
//                 return <APIBanner banners={banners} isLoading={bannersLoading} />;
//             case 'gifBanner':
//                 return <GifBanner hampers={hampers} isLoading={hampersLoading} />;
//             case 'ranges':
//                 return <RangesSection flatListRef={flatListRef} />;
//             case 'newLaunches':
//                 return <HorizontalProductList title="New Launches" products={newLaunches} />;
//             case 'combos':
//                 return <NonClickableProductList title="Popular Combos" products={combos} />;
//             case 'categorySection':
//                 return (
//                     <View style={styles.categorySection}>
//                         <HorizontalProductList
//                             title={item.category}
//                             products={productsByCategory[item.category] || []}
//                             seeAllScreen="Categories"
//                             seeAllParams={{ selectedCategory: item.category }}
//                         />
//                     </View>
//                 );
//             case 'letsTryBanner':
//                 return <LetsTryBanner />;
//             default:
//                 return null;
//         }
//     }, [eventsData, handleEventSelect, bestSellers, newLaunches, productsByCategory, hampers, hampersLoading, combos, banners, bannersLoading]);

//     const data = [
//         { type: 'events' },
//         { type: 'gifBanner' },
//         { type: 'bestSellers' },
//         { type: 'categories' },
//         { type: 'apiBanner' },
//         { type: 'ranges' },
//         { type: 'newLaunches' },
//         { type: 'combos' },
//         ...CATEGORIES.map(category => ({ type: 'categorySection', category })),
//         { type: 'letsTryBanner' }
//     ];

//     if (isInitialLoading) {
//         return <HomeScreenShimmer />;
//     }

//     return (
//         <View style={styles.container}>
//             <PromoModal
//                 visible={isPromoModalVisible}
//                 onClose={() => setIsPromoModalVisible(false)}
//             />
//             <StatusBar
//                 barStyle={getStatusBarStyle()}
//                 backgroundColor="transparent"
//                 translucent
//             />
//             <StickyHeader
//                 scrollY={scrollY}
//                 searchText={searchText}
//                 setSearchText={setSearchText}
//                 selectedAddress={selectedAddress}
//                 addressLoading={addressLoading}
//                 address={address}
//                 user={user}
//                 navigation={navigation}
//                 textColor={eventsData?.textColor}
//                 headerColor={eventsData?.headerColor}
//             />
//             <Animated.FlatList
//                 data={data}
//                 renderItem={renderItem}
//                 keyExtractor={(item, index) => `${item.type}-${index}`}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//                 onScroll={Animated.event(
//                     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//                     { useNativeDriver: false }
//                 )}
//                 scrollEventThrottle={16}
//                 ListFooterComponent={<View style={{ height: hp('10%') }} />}
//                 onRefresh={onRefresh}
//                 refreshing={isRefreshing}
//                 bounces={false}
//             />
//             <View style={styles.bottomRow}>
//                 {inTransit && isBannerVisible ? (
//                     <InTransitBanner
//                         onViewPress={() => navigation.navigate("MyOrdersScreen", { initialTab: "inTransit" })}
//                         onClosePress={handleCloseBanner}
//                         style={styles.inTransitBanner}
//                     />
//                 ) : (
//                     <FloatingCartButton
//                         onPress={() => navigation.navigate("Cart")}
//                         customStyle={styles.floatingCartButtonCustom}
//                     />
//                 )}
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#FFFFFF"
//     },
//     stickyHeaderContainer: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         zIndex: 500,
//         paddingBottom: hp('1%')
//     },
//     locationBarContainer: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: wp('5%')
//     },
//     icon: {
//         marginRight: wp('2%'),
//         alignSelf: "center"
//     },
//     locationtext: {
//         fontSize: rf(1.7),
//         fontWeight: "bold"
//     },
//     label: {
//         fontSize: rf(2.2),
//         fontWeight: "bold",
//         marginLeft: wp('0.1%'),
//         textTransform: "capitalize",
//         minWidth: wp(14)
//     },
//     locationRow: {
//         flexDirection: "row",
//         alignItems: "center",
//         marginBottom: hp('0.1%')
//     },
//     location: {
//         fontSize: rf(1.8),
//         fontWeight: "400",
//         marginTop: 0
//     },
//     chevron: {
//         marginTop: hp('0.1%')
//     },
//     headerSearchWrapper: {
//         paddingHorizontal: wp('5%')
//     },
//     scrollContent: {
//         paddingBottom: hp('3%')
//     },
//     eventsHeroSection: {
//         height: EVENTS_SECTION_HEIGHT,
//         marginBottom: hp('2%'),
//         flex: 1,
//         paddingBottom: hp('1%')
//     },
//     eventGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//         paddingHorizontal: wp('4%'),
//         marginTop: hp('30%'),
//         marginBottom: hp('2%')
//     },
//     squareCard: {
//         width: CARD_WIDTH - 3,
//         aspectRatio: 0.85,
//         marginBottom: hp('1.5%'),
//         backgroundColor: '#fff',
//         borderRadius: wp('3%'),
//         alignItems: 'center',
//         justifyContent: 'flex-start',
//         paddingTop: hp('0.5%'),
//         overflow: 'hidden'
//     },
//     eventTextContainer: {
//         height: hp('4%'),
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     eventImage: {
//         width: '90%',
//         height: '60%',
//         resizeMode: 'contain'
//     },
//     eventNameText: {
//         fontSize: rf(1.4),
//         color: '#0c5273',
//         fontWeight: 'bold',
//         textAlign: 'center',
//         textTransform: 'capitalize',
//         paddingHorizontal: wp('1%'),
//         maxWidth: '100%'
//     },
//     sectionHeader: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingHorizontal: wp('4.6%'),
//         marginTop: hp('0.23%'),
//         marginBottom: hp('2.1%')
//     },
//     sectionTitle: {
//         fontSize: rf(2.2),
//         fontWeight: "bold",
//         color: "#222",
//         minWidth: wp(50),
//         marginTop: hp('1%'),
//         marginBottom: hp('1%')
//     },
//     seeAll: {
//         color: "#0C5273",
//         fontWeight: "bold",
//         fontSize: rf(1.8),
//         paddingEnd: wp('2.5%')
//     },
//     horizontalList: {
//         paddingVertical: hp('0.5%'),
//         marginBottom: hp('0.5%')
//     },
//     horizontalCardContainer: {},
//     categoryGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//         paddingHorizontal: wp('3.5%'),
//         marginBottom: hp('1.%')
//     },
//     categoryItem: {
//         width: wp('23%'),
//         marginBottom: hp('1.5%'),
//         alignItems: 'center'
//     },
//     categoryImage: {
//         width: wp('21.5%'),
//         height: wp('21.5%'),
//         marginBottom: hp('0.5%')
//     },
//     categoryName: {
//         fontSize: rf(1.3),
//         fontWeight: '700',
//         color: '#222',
//         textAlign: 'center',
//         paddingHorizontal: wp('1%')
//     },
//     imageBannerContainer: {
//         width: wp('92%'),
//         height: hp('25%'),
//         alignSelf: 'center',
//         marginVertical: hp('2%'),
//         borderRadius: wp('2%'),
//         overflow: 'hidden',
//         marginBottom: hp('3%')
//     },
//     imageBannerImage: {
//         width: '100%',
//         height: '100%',
//     },
//     apiBannerItem: {
//         width: wp('92%'),
//         height: '100%',
//     },
//     gifBannerContainer: {
//         marginVertical: hp('1%'),
//         marginBottom: hp('4%'),
//         position: 'relative',
//     },
//     gifBannerImage: {
//         width: '100%',
//         height: hp('55%'),
//         borderRadius: wp('2%'),
//     },
//     curatedHampersContainer: {
//         position: 'absolute',
//         top: -hp('0.5%'),
//         left: 0,
//         right: 0,
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 1,
//     },
//     curatedHampersImage: {
//         width: wp('80%'),
//         height: hp('22%'),
//     },
//     hampersListContainer: {
//         position: 'absolute',
//         top: hp('13%'),
//         left: '1%',
//         right: 0,
//     },
//     hampersListContent: {
//         paddingHorizontal: wp('2%'),
//     },
//     hampersLoader: {
//         position: 'absolute',
//         top: hp('30%'),
//         alignSelf: 'center',
//     },
//     rangesContainer: {
//         marginBottom: hp('2.5%'),
//         marginTop: -hp('2%')
//     },
//     rangeListContainer: {
//         position: 'relative',
//         height: RANGE_IMAGE_HEIGHT
//     },
//     rangeListContent: {
//         paddingHorizontal: wp('4.4%')
//     },
//     rangeItem: {
//         width: RANGE_IMAGE_WIDTH,
//         marginRight: CARD_GAP
//     },
//     rangeImage: {
//         width: '100%',
//         height: RANGE_IMAGE_HEIGHT,
//         borderRadius: wp('2%')
//     },
//     categorySection: {
//         marginBottom: hp('1%'),
//         paddingHorizontal: wp('1%')
//     },
//     noProducts: {
//         paddingHorizontal: wp('5%'),
//         color: '#666',
//         fontStyle: 'italic',
//         fontSize: rf(1.8)
//     },
//     letsTryBannerContainer: {
//         alignItems: 'flex-start',
//         justifyContent: 'center',
//         marginVertical: 30,
//         paddingHorizontal: wp('4%'),
//         backgroundColor: '#fffff',
//         borderRadius: 14,
//         width: '92%',
//         alignSelf: 'center'
//     },
//     letsTryBannerText: {
//         fontSize: rf(3.5),
//         fontWeight: 'bold',
//         color: '#bfc2c7',
//         lineHeight: rf(5.5)
//     },
//     heart: {
//         color: '#ff5a5f',
//         fontSize: rf(3)
//     },
//     letsTryBrand: {
//         fontSize: rf(2),
//         color: '#bfc2c7',
//         marginTop: 35,
//         fontWeight: 'bold',
//         letterSpacing: 1
//     },
//     divider: {
//         height: 1,
//         width: '100%',
//         backgroundColor: '#bfc2c7',
//         marginTop: 25,
//         marginBottom: 5
//     },
//     bottomRow: {
//         position: "absolute",
//         left: 0,
//         right: 0,
//         bottom: 0,
//         paddingHorizontal: wp(0),
//         paddingBottom: hp(1.5),
//         backgroundColor: "transparent",
//         zIndex: 1000,
//         alignItems: "center"
//     },
//     inTransitBanner: {
//         width: "100%",
//         bottom: -hp(1.7)
//     },
//     floatingCartButtonCustom: {},
//     // --- NEW STYLES --- For the indicator dots
//     dotContainer: {
//         flexDirection: 'row',
//         position: 'absolute',
//         bottom: hp('1.5%'),
//         alignSelf: 'center',
//     },
//     dotStyle: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         backgroundColor: 'rgba(255, 255, 255, 0.6)',
//         marginHorizontal: 4,
//     },
//     activeDotStyle: {
//         backgroundColor: '#FFFFFF',
//         width: 10,
//         height: 10,
//         borderRadius: 5,
//     },
// });

// export default HomeScreen;
















import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Image,
    ActivityIndicator,
    ImageBackground,
    Animated,
    AppState,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import crashlytics from "@react-native-firebase/crashlytics";
import SearchBar from "../components/SearchBar";
import HomeProductCard from "../components/HomeProductCard";
import FloatingCartButton from "../components/FloatingCartButton";
import PromoModal from "../components/PromoModal";
import { useNavigation } from "@react-navigation/native";
import { fetchFoodList, fetchNewLaunches } from "../services/FoodService";
import { fetchBestsellers } from "../services/RecommendationService";
import { fetchActiveEvents } from "../services/EventService";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useLocation } from "../context/LocationContext";
import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFPercentage as rf } from "react-native-responsive-fontsize";
import InTransitBanner from "../components/InTransitBanner";
import { useInTransit } from "../context/InTransitContext";
import HomeScreenShimmer from "../components/HomeScreenShimmer";
import HamperCard from "../components/HamperCard";

// Constants
const CARD_GAP = wp('2%');
const CARD_WIDTH = (wp('100%') - wp('10%')) / 4;
const RANGE_IMAGE_WIDTH = (wp('100%') - wp('8%') - (11 * CARD_GAP)) / 2;
const RANGE_IMAGE_HEIGHT = hp('20%');
const EVENTS_SECTION_HEIGHT = hp('57%');

const CATEGORIES = [
    "Purani Delhi", "Fasting Special", "Cake & Muffins", "Indian Sweets",
    "Healthy Snacks", "Bhujia", "Cookies", "Rusk", "Munchies", "Pratham",
    "Chips n Crisps", "South Range",
];

const categories = [
    { id: "1", name: "Purani Delhi", image: require("../assets/categories/purani_delhi.png") },
    { id: "2", name: "Indian Sweets", image: require("../assets/categories/indian_sweets.png") },
    { id: "3", name: "Healthy Snacks", image: require("../assets/categories/makhana.png") },
    { id: "4", name: "Bhujia", image: require("../assets/categories/bhujia.png") },
    { id: "5", name: "Cookies", image: require("../assets/categories/cookies.png") },
    { id: "6", name: "Munchies", image: require("../assets/categories/munchies.png") },
    { id: "7", name: "Fasting Special", image: require("../assets/categories/fasting_special.png") },
    { id: "8", name: "Pratham", image: require("../assets/categories/pratham.png") },
    { id: "9", name: "Chips n Crisps", image: require("../assets/categories/chips_crisps.png") },
    { id: "10", name: "South Range", image: require("../assets/categories/south_range.png") },
    { id: "11", name: "Cake & Muffins", image: require("../assets/categories/cakes.png") },
    { id: "12", name: "Rusk", image: require("../assets/categories/rusk.png") },
];

const ranges = [
    { id: "1", name: "No Maida Range", image: require("../assets/range/no_maida_range.png") },
    { id: "2", name: "Goodness of Wheat", image: require("../assets/range/wheat_range.png") },
    { id: "3", name: "No Palm Oil Range", image: require("../assets/range/no_palm_oil.png") },
    { id: "4", name: "Muffins & Cakes", image: require("../assets/range/muffin_range.png") },
    { id: "5", name: "Puff Range", image: require("../assets/range/puff_range.png") },
    { id: "6", name: "Wafers Range", image: require("../assets/range/wafers_range.png") },
    { id: "7", name: "South Range", image: require("../assets/range/south_range.png") },
    { id: "8", name: "Roasted Range", image: require("../assets/range/roasted_range.png") },
    { id: "9", name: "Namkeen Range", image: require("../assets/range/namkeen_range.png") },
];

const fetchBanners = async () => {
    try {
        const response = await fetch("https://api.letstryfoods.com/api/banners");
        if (!response.ok) {
            throw new Error("Network response was not ok for banners");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        crashlytics().recordError(new Error(`Failed to fetch banners: ${error.message}`));
        console.error("Failed to fetch banners:", error);
        return [];
    }
};


const fetchHampers = async () => {
    try {
        const response = await fetch("https://api.letstryfoods.com/api/giftboxes");
        if (!response.ok) {
            throw new Error("Network response was not ok for hampers");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        crashlytics().recordError(new Error(`Failed to fetch hampers: ${error.message}`));
        console.error("Failed to fetch hampers:", error);
        return [];
    }
};

const fetchCombos = async () => {
    try {
        const response = await fetch("https://api.letstryfoods.com/api/combos");
        if (!response.ok) {
            throw new Error("Network response was not ok for combos");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        crashlytics().recordError(new Error(`Failed to fetch combos: ${error.message}`));
        console.error("Failed to fetch combos:", error);
        return [];
    }
};

const StickyHeader = ({ scrollY, searchText, setSearchText, selectedAddress, addressLoading, address, user, navigation, textColor, headerColor }) => {
    const insets = useSafeAreaInsets();
    const dynamicTextColor = textColor || "#000";
    const dynamicHeaderBgColor = headerColor || "#FFF7E8";

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, EVENTS_SECTION_HEIGHT - hp(25)],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });
    const headerShadowOpacity = scrollY.interpolate({
        inputRange: [0, EVENTS_SECTION_HEIGHT - hp(21), EVENTS_SECTION_HEIGHT],
        outputRange: [0, 0.3, 0.9],
        extrapolate: 'clamp'
    });

    return (
        <View style={[styles.stickyHeaderContainer, { paddingTop: insets.top + hp(0.7) }]} pointerEvents="box-none">
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: dynamicHeaderBgColor, opacity: headerOpacity, shadowOpacity: headerShadowOpacity }]} />
            <View style={styles.locationBarContainer}>
                <Ionicons name="location-sharp" size={rf(2.8)} color={dynamicTextColor} style={styles.icon} />
                <TouchableOpacity style={{ flex: 1 }} onPress={() => user ? navigation.navigate("AddressBook") : navigation.navigate("Login")} activeOpacity={0.7}>
                    <View style={styles.locationRow}>
                        <Text allowFontScaling={false} adjustsFontSizeToFit style={[styles.locationtext, { color: dynamicTextColor }]}>
                            Delivering at
                        </Text>
                        {user && selectedAddress && selectedAddress.label ? (
                            <>
                                <Text allowFontScaling={false} adjustsFontSizeToFit style={[styles.label, { color: dynamicTextColor }]}>
                                    {selectedAddress.label}
                                </Text>
                                <Ionicons name="chevron-down" size={rf(2)} color={dynamicTextColor} style={styles.chevron} />
                            </>
                        ) : null}
                    </View>
                    {addressLoading ? (
                        <ActivityIndicator size="small" color={dynamicTextColor} style={{ marginTop: hp('0.2%') }} />
                    ) : (
                        <Text allowFontScaling={false} adjustsFontSizeToFit style={[styles.location, { color: dynamicTextColor }]}>
                            {user && selectedAddress?.addressId ? `${selectedAddress.buildingName}, ${selectedAddress.street}` : !user && address ? address.split(",").slice(0, 3).join(",") : user ? "Select Address" : "Select Location"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.headerSearchWrapper}>
                <SearchBar searchText={searchText} setSearchText={setSearchText} placeholder="Search products" />
            </View>
        </View>
    );
};

const EventsSection = memo(({ eventsData, handleEventSelect }) => (
    <ImageBackground
        source={eventsData?.backgroundImageUrl ? { uri: eventsData.backgroundImageUrl } : require("../assets/images/bg-image.png")}
        style={styles.eventsHeroSection}
        resizeMode="cover"
    >
        <View style={styles.eventGrid}>
            {eventsData.events.slice(0, 8).map((event, index) => (
                <TouchableOpacity
                    key={`event-${event.priority}-${event.name}-${index}`}
                    style={styles.squareCard}
                    onPress={() => handleEventSelect(event)}
                >
                    <View style={styles.eventTextContainer}>
                        <Text
                            allowFontScaling={false}
                            adjustsFontSizeToFit
                            numberOfLines={2}
                            style={styles.eventNameText}
                        >
                            {event.name}
                        </Text>
                    </View>
                    <Image
                        source={{ uri: event.imageUrl || "https://via.placeholder.com/150" }}
                        style={styles.eventImage}
                    />
                </TouchableOpacity>
            ))}
        </View>
    </ImageBackground>
));

const HorizontalProductList = memo(({ title, products, seeAllScreen, seeAllParams }) => {
    const navigation = useNavigation();
    return (
        <>
            <View style={styles.sectionHeader}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
                    {title}
                </Text>
                {seeAllScreen && (
                    <TouchableOpacity onPress={() => navigation.navigate(seeAllScreen, seeAllParams)}>
                        <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.seeAll}>
                            See all
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {products.length > 0 ? (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.horizontalList, { paddingHorizontal: wp('2%') - CARD_GAP / 2 }]}
                    renderItem={({ item }) => (
                        <View style={[styles.horizontalCardContainer, { marginHorizontal: CARD_GAP / 2 }]}>
                            <HomeProductCard
                                product={item}
                                onPress={() => navigation.navigate("ProductDetails", {
                                    productId: item.id,
                                })}
                            />
                        </View>
                    )}
                />
            ) : (
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.noProducts}>
                    No products available
                </Text>
            )}
        </>
    );
});

const NonClickableProductList = memo(({ title, products }) => {
    return (
        <>
            <View style={styles.sectionHeader}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
                    {title}
                </Text>
            </View>
            {products?.length > 0 ? (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.horizontalList, { paddingHorizontal: wp('2%') - CARD_GAP / 2 }]}
                    renderItem={({ item }) => (
                        <View style={[styles.horizontalCardContainer, { marginHorizontal: CARD_GAP / 2 }]}>
                            <HomeProductCard product={item} />
                        </View>
                    )}
                />
            ) : (
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.noProducts}>
                    No products available
                </Text>
            )}
        </>
    );
});

const CategoriesSection = memo(() => {
    const navigation = useNavigation();
    return (
        <>
            <View style={styles.sectionHeader}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
                    Shop By Categories
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Categories", { selectedCategory: "All Products" })}>
                    <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.seeAll}>
                        See all
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.categoryGrid}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.categoryItem}
                        onPress={() => navigation.navigate("Categories", { selectedCategory: category.name })}
                    >
                        <Image
                            source={category.image}
                            style={styles.categoryImage}
                            resizeMode="contain"
                        />
                        <Text
                            allowFontScaling={false}
                            adjustsFontSizeToFit
                            style={styles.categoryName}
                            numberOfLines={2}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
});

// --- UPDATED COMPONENT --- Logic for auto-scroll and dots added
const APIBanner = memo(({ banners, isLoading }) => {
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- UPDATED --- Auto-scroll logic is now more robust
    useEffect(() => {
        if (!isLoading && banners && banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => {
                    const nextIndex = (prevIndex + 1) % banners.length;
                    flatListRef.current?.scrollToIndex({
                        animated: true,
                        index: nextIndex,
                    });
                    return nextIndex;
                });
            }, 3000); // 3-second delay

            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [banners, isLoading]);


    // Update current index when user scrolls manually
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    if (isLoading) {
        return (
            <View style={[styles.imageBannerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0C5273" />
            </View>
        );
    }

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <View style={styles.imageBannerContainer}>
            <FlatList
                ref={flatListRef}
                data={banners}
                keyExtractor={(item) => item._id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.apiBannerItem} activeOpacity={0.8}>
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.imageBannerImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
            />
            {/* --- NEW --- Indicator Dots */}
            <View style={styles.dotContainer}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dotStyle,
                            currentIndex === index && styles.activeDotStyle,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
});


/*
// --- REMOVED: Curated Hampers Section (GifBanner) ---
const GifBanner = memo(({ hampers, isLoading }) => {
    const navigation = useNavigation();

    if (!isLoading && (!hampers || hampers.length === 0)) {
        return null;
    }

    return (
        <View style={styles.gifBannerContainer}>
            <Image
                source={require("../assets/aab.gif")}
                style={styles.gifBannerImage}
                resizeMode="stretch"
            />
            <View style={styles.curatedHampersContainer}>
                <Image
                    source={require("../assets/font.gif")}
                    style={styles.curatedHampersImage}
                    resizeMode="contain"
                />
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#0C5273" style={styles.hampersLoader} />
            ) : (
                <View style={styles.hampersListContainer}>
                    <FlatList
                        data={hampers}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.hampersListContent}
                        renderItem={({ item }) => (
                            <HamperCard
                                product={item}
                                onPress={() => navigation.navigate("HamperDetails", {
                                    productId: item.id,
                                })}
                            />
                        )}
                    />
                </View>
            )}
        </View>
    );
});
*/

const RangesSection = memo(({ flatListRef }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.rangesContainer}>
            <View style={styles.sectionHeader}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.sectionTitle}>
                    Our Ranges
                </Text>
            </View>
            <View style={styles.rangeListContainer}>
                <FlatList
                    ref={flatListRef}
                    data={ranges}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.rangeListContent}
                    snapToInterval={RANGE_IMAGE_WIDTH + CARD_GAP}
                    snapToAlignment="start"
                    decelerationRate="fast"
                    getItemLayout={(data, index) => ({
                        length: RANGE_IMAGE_WIDTH + CARD_GAP,
                        offset: (RANGE_IMAGE_WIDTH + CARD_GAP) * index,
                        index,
                    })}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.rangeItem}
                            onPress={() => navigation.navigate("RangeScreen", { name: item.name })}
                        >
                            <Image
                                source={item.image}
                                style={styles.rangeImage}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
});

const LetsTryBanner = memo(() => (
    <View style={styles.letsTryBannerContainer}>
        <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.letsTryBannerText}>
            Tasty, healthy snacks{'\n'}crafted with care. <Text style={styles.heart}>❤️</Text>
        </Text>
        <View style={styles.divider} />
        <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.letsTryBrand}>
            Let's Try
        </Text>
    </View>
));

const HomeScreen = () => {
    const [searchText, setSearchText] = useState("");
    const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
    const navigation = useNavigation();
    const flatListRef = useRef(null);
    const { address } = useLocation();
    const { user } = useAuth();
    const { selectedAddress, loading: addressLoading } = useAddress();
    const { inTransit } = useInTransit();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [isBannerVisible, setIsBannerVisible] = useState(false);
    const [hasUserClosedBanner, setHasUserClosedBanner] = useState(false);
    const appState = useRef(AppState.currentState);

    const { data: eventsData = { events: [] }, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({ queryKey: ['activeEvents'], queryFn: fetchActiveEvents });
    const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({ queryKey: ['products'], queryFn: fetchFoodList });
    const { data: bestSellers = [], isLoading: bestSellersLoading, refetch: refetchBestsellers } = useQuery({ queryKey: ['bestsellers'], queryFn: fetchBestsellers });
    const { data: newLaunches = [], isLoading: newLaunchesLoading, refetch: refetchNewLaunches } = useQuery({ queryKey: ['newLaunches'], queryFn: fetchNewLaunches });
    const { data: hampers = [], isLoading: hampersLoading, refetch: refetchHampers } = useQuery({ queryKey: ['hampers'], queryFn: fetchHampers });
    const { data: combos = [], isLoading: combosLoading, refetch: refetchCombos } = useQuery({
        queryKey: ['combos'],
        queryFn: fetchCombos
    });
    const { data: banners = [], isLoading: bannersLoading, refetch: refetchBanners } = useQuery({
        queryKey: ['banners'],
        queryFn: fetchBanners,
    });


    const getStatusBarStyle = () => {
        const textColor = eventsData?.textColor;
        if (!textColor) return 'dark-content';
        const hexColor = textColor.replace('#', '');
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 125 ? 'dark-content' : 'light-content';
    };

    const isInitialLoading = eventsLoading || productsLoading || bestSellersLoading || newLaunchesLoading || hampersLoading || combosLoading;
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPromoModalVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const onRefresh = useCallback(async () => {
        crashlytics().log("HomeScreen pull to refresh triggered");
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetchEvents(),
                refetchProducts(),
                refetchBestsellers(),
                refetchNewLaunches(),
                refetchHampers(),
                refetchCombos(),
                refetchBanners()
            ]);
        } catch (error) {
            crashlytics().recordError(error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchEvents, refetchProducts, refetchBestsellers, refetchNewLaunches, refetchHampers, refetchCombos, refetchBanners]);


    const handleCloseBanner = useCallback(() => {
        setIsBannerVisible(false);
        setHasUserClosedBanner(true);
    }, []);

    const handleEventSelect = useCallback((event) => {
        crashlytics().log(`User selected event: ${event.name}`);
        navigation.navigate("EventProducts", {
            eventData: eventsData,
            initialEvent: event
        });
    }, [navigation, eventsData]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (!hasUserClosedBanner) {
                    setIsBannerVisible(true);
                }
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, [hasUserClosedBanner]);

    const productsByCategory = React.useMemo(() => {
        return CATEGORIES.reduce((acc, category) => {
            acc[category] = products.filter(product => product.category?.toLowerCase() === category.toLowerCase());
            return acc;
        }, {});
    }, [products]);

    const renderItem = useCallback(({ item }) => {
        switch (item.type) {
            case 'events':
                return <EventsSection eventsData={eventsData} handleEventSelect={handleEventSelect} />;
            case 'bestSellers':
                return <HorizontalProductList title="Best Sellers" products={bestSellers} />;
            case 'categories':
                return <CategoriesSection />;
            case 'apiBanner':
                return <APIBanner banners={banners} isLoading={bannersLoading} />;
            // case 'gifBanner': // REMOVED the case for GifBanner
            //     return <GifBanner hampers={hampers} isLoading={hampersLoading} />;
            case 'ranges':
                return <RangesSection flatListRef={flatListRef} />;
            case 'newLaunches':
                return <HorizontalProductList title="New Launches" products={newLaunches} />;
            case 'combos':
                return <NonClickableProductList title="Popular Combos" products={combos} />;
            case 'categorySection':
                return (
                    <View style={styles.categorySection}>
                        <HorizontalProductList
                            title={item.category}
                            products={productsByCategory[item.category] || []}
                            seeAllScreen="Categories"
                            seeAllParams={{ selectedCategory: item.category }}
                        />
                    </View>
                );
            case 'letsTryBanner':
                return <LetsTryBanner />;
            default:
                return null;
        }
    }, [eventsData, handleEventSelect, bestSellers, newLaunches, productsByCategory, hampers, hampersLoading, combos, banners, bannersLoading]);

    const data = [
        { type: 'events' },
        // { type: 'gifBanner' }, // REMOVED this entry
        { type: 'bestSellers' },
        { type: 'categories' },
        { type: 'apiBanner' },
        { type: 'ranges' },
        { type: 'newLaunches' },
        { type: 'combos' },
        ...CATEGORIES.map(category => ({ type: 'categorySection', category })),
        { type: 'letsTryBanner' }
    ];

    if (isInitialLoading) {
        return <HomeScreenShimmer />;
    }

    return (
        <View style={styles.container}>
            <PromoModal
                visible={isPromoModalVisible}
                onClose={() => setIsPromoModalVisible(false)}
            />
            <StatusBar
                barStyle={getStatusBarStyle()}
                backgroundColor="transparent"
                translucent
            />
            <StickyHeader
                scrollY={scrollY}
                searchText={searchText}
                setSearchText={setSearchText}
                selectedAddress={selectedAddress}
                addressLoading={addressLoading}
                address={address}
                user={user}
                navigation={navigation}
                textColor={eventsData?.textColor}
                headerColor={eventsData?.headerColor}
            />
            <Animated.FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.type}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                ListFooterComponent={<View style={{ height: hp('10%') }} />}
                onRefresh={onRefresh}
                refreshing={isRefreshing}
                bounces={false}
            />
            <View style={styles.bottomRow}>
                {inTransit && isBannerVisible ? (
                    <InTransitBanner
                        onViewPress={() => navigation.navigate("MyOrdersScreen", { initialTab: "inTransit" })}
                        onClosePress={handleCloseBanner}
                        style={styles.inTransitBanner}
                    />
                ) : (
                    <FloatingCartButton
                        onPress={() => navigation.navigate("Cart")}
                        customStyle={styles.floatingCartButtonCustom}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF"
    },
    stickyHeaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        paddingBottom: hp('1%')
    },
    locationBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp('5%')
    },
    icon: {
        marginRight: wp('2%'),
        alignSelf: "center"
    },
    locationtext: {
        fontSize: rf(1.7),
        fontWeight: "bold"
    },
    label: {
        fontSize: rf(2.2),
        fontWeight: "bold",
        marginLeft: wp('0.1%'),
        textTransform: "capitalize",
        minWidth: wp(14)
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp('0.1%')
    },
    location: {
        fontSize: rf(1.8),
        fontWeight: "400",
        marginTop: 0
    },
    chevron: {
        marginTop: hp('0.1%')
    },
    headerSearchWrapper: {
        paddingHorizontal: wp('5%')
    },
    scrollContent: {
        paddingBottom: hp('3%')
    },
    eventsHeroSection: {
        height: EVENTS_SECTION_HEIGHT,
        marginBottom: hp('2%'),
        flex: 1,
        paddingBottom: hp('1%')
    },
    eventGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: wp('4%'),
        marginTop: hp('30%'),
        marginBottom: hp('2%')
    },
    squareCard: {
        width: CARD_WIDTH - 3,
        aspectRatio: 0.85,
        marginBottom: hp('1.5%'),
        backgroundColor: '#fff',
        borderRadius: wp('3%'),
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: hp('0.5%'),
        overflow: 'hidden'
    },
    eventTextContainer: {
        height: hp('4%'),
        justifyContent: 'center',
        alignItems: 'center'
    },
    eventImage: {
        width: '90%',
        height: '60%',
        resizeMode: 'contain'
    },
    eventNameText: {
        fontSize: rf(1.4),
        color: '#0c5273',
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'capitalize',
        paddingHorizontal: wp('1%'),
        maxWidth: '100%'
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wp('4.6%'),
        marginTop: hp('0.23%'),
        marginBottom: hp('2.1%')
    },
    sectionTitle: {
        fontSize: rf(2.2),
        fontWeight: "bold",
        color: "#222",
        minWidth: wp(50),
        marginTop: hp('1%'),
        marginBottom: hp('1%')
    },
    seeAll: {
        color: "#0C5273",
        fontWeight: "bold",
        fontSize: rf(1.8),
        paddingEnd: wp('2.5%')
    },
    horizontalList: {
        paddingVertical: hp('0.5%'),
        marginBottom: hp('0.5%')
    },
    horizontalCardContainer: {},
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: wp('3.5%'),
        marginBottom: hp('1.%')
    },
    categoryItem: {
        width: wp('23%'),
        marginBottom: hp('1.5%'),
        alignItems: 'center'
    },
    categoryImage: {
        width: wp('21.5%'),
        height: wp('21.5%'),
        marginBottom: hp('0.5%')
    },
    categoryName: {
        fontSize: rf(1.3),
        fontWeight: '700',
        color: '#222',
        textAlign: 'center',
        paddingHorizontal: wp('1%')
    },
    imageBannerContainer: {
        width: wp('92%'),
        height: hp('25%'),
        alignSelf: 'center',
        marginVertical: hp('2%'),
        borderRadius: wp('2%'),
        overflow: 'hidden',
        marginBottom: hp('3%')
    },
    imageBannerImage: {
        width: '100%',
        height: '100%',
    },
    apiBannerItem: {
        width: wp('92%'),
        height: '100%',
    },
    /*
    gifBannerContainer: {
        marginVertical: hp('1%'),
        marginBottom: hp('4%'),
        position: 'relative',
    },
    gifBannerImage: {
        width: '100%',
        height: hp('55%'),
        borderRadius: wp('2%'),
    },
    curatedHampersContainer: {
        position: 'absolute',
        top: -hp('0.5%'),
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    curatedHampersImage: {
        width: wp('80%'),
        height: hp('22%'),
    },
    hampersListContainer: {
        position: 'absolute',
        top: hp('13%'),
        left: '1%',
        right: 0,
    },
    hampersListContent: {
        paddingHorizontal: wp('2%'),
    },
    hampersLoader: {
        position: 'absolute',
        top: hp('30%'),
        alignSelf: 'center',
    },
    */
    rangesContainer: {
        marginBottom: hp('2.5%'),
        marginTop: -hp('2%')
    },
    rangeListContainer: {
        position: 'relative',
        height: RANGE_IMAGE_HEIGHT
    },
    rangeListContent: {
        paddingHorizontal: wp('4.4%')
    },
    rangeItem: {
        width: RANGE_IMAGE_WIDTH,
        marginRight: CARD_GAP
    },
    rangeImage: {
        width: '100%',
        height: RANGE_IMAGE_HEIGHT,
        borderRadius: wp('2%')
    },
    categorySection: {
        marginBottom: hp('1%'),
        paddingHorizontal: wp('1%')
    },
    noProducts: {
        paddingHorizontal: wp('5%'),
        color: '#666',
        fontStyle: 'italic',
        fontSize: rf(1.8)
    },
    letsTryBannerContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginVertical: 30,
        paddingHorizontal: wp('4%'),
        backgroundColor: '#fffff',
        borderRadius: 14,
        width: '92%',
        alignSelf: 'center'
    },
    letsTryBannerText: {
        fontSize: rf(3.5),
        fontWeight: 'bold',
        color: '#bfc2c7',
        lineHeight: rf(5.5)
    },
    heart: {
        color: '#ff5a5f',
        fontSize: rf(3)
    },
    letsTryBrand: {
        fontSize: rf(2),
        color: '#bfc2c7',
        marginTop: 35,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#bfc2c7',
        marginTop: 25,
        marginBottom: 5
    },
    bottomRow: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: wp(0),
        paddingBottom: hp(1.5),
        backgroundColor: "transparent",
        zIndex: 1000,
        alignItems: "center"
    },
    inTransitBanner: {
        width: "100%",
        bottom: -hp(1.7)
    },
    floatingCartButtonCustom: {},
    // --- NEW STYLES --- For the indicator dots
    dotContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: hp('1.5%'),
        alignSelf: 'center',
    },
    dotStyle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        marginHorizontal: 4,
    },
    activeDotStyle: {
        backgroundColor: '#FFFFFF',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});

export default HomeScreen;