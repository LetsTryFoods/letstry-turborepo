// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import RecentSearches from "../components/RecentSearch";
// import RangeCategoryCard from "../components/RangeCategoryCard";
// import AutocompleteSuggestions from "../components/AutocompleteSuggestion";
// import ProductCardPlaceholder from "../components/ProductCardPlaceholder"; // Import the placeholder
// import { saveRecentSearch, getRecentSearches } from "../utils/SearchUtil";
// import {
//   fetchFoodList,
//   searchFoods,
//   fetchAutocompleteSuggestions,
// } from "../services/FoodService";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import debounce from "lodash.debounce";

// const numColumns = 3;
// const ITEM_GAP = wp(2);
// const ITEM_WIDTH = (wp(100) - (numColumns + 1) * ITEM_GAP) / numColumns;

// const SearchScreen = ({ route, navigation }) => {
//   const { initialQuery = "" } = route.params || {};
//   const [searchQuery, setSearchQuery] = useState(initialQuery);
//   const [products, setProducts] = useState([]);
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const insets = useSafeAreaInsets();

//   useEffect(() => {
//     (async () => {
//       const recent = await getRecentSearches();
//       setRecentSearches(recent);
//     })();
//   }, []);

//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setLoading(true);
//       fetchFoodList()
//         .then((data) => {
//           setProducts(data);
//           setSearchResults(data);
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [searchQuery]);

//   const debouncedSearchFoods = useCallback(
//     debounce((query) => {
//       if (query.trim().length >= 2) {
//         setLoading(true);
//         searchFoods(query)
//           .then((data) => setSearchResults(data))
//           .finally(() => setLoading(false));
//       }
//     }, 500),
//     []
//   );

//   const debouncedAutocomplete = useCallback(
//     debounce((query) => {
//       if (query.trim().length >= 2) {
//         fetchAutocompleteSuggestions(query)
//           .then((suggestions) => {
//             setAutocompleteSuggestions(suggestions);
//             setShowSuggestions(true);
//           })
//           .catch(() => setShowSuggestions(false));
//       } else {
//         setShowSuggestions(false);
//       }
//     }, 500),
//     []
//   );

//   useEffect(() => {
//     return () => {
//       debouncedSearchFoods.cancel();
//       debouncedAutocomplete.cancel();
//     };
//   }, [debouncedSearchFoods, debouncedAutocomplete]);

//   const handleInputChange = (text) => {
//     setSearchQuery(text);
//     debouncedSearchFoods(text);
//     debouncedAutocomplete(text);
//   };

//   const handleSearchSubmit = async (event) => {
//     const query = event.nativeEvent.text.trim();
//     if (query) {
//       setSearchQuery(query);
//       await saveRecentSearch(query);
//       const recent = await getRecentSearches();
//       setRecentSearches(recent);
//     }
//     setShowSuggestions(false);
//   };

//   const handleRecentSearchSelect = async (term) => {
//     setSearchQuery(term);
//     debouncedSearchFoods(term);
//     debouncedAutocomplete(term);
//     await saveRecentSearch(term);
//     const recent = await getRecentSearches();
//     setRecentSearches(recent);
//     setShowSuggestions(false);
//   };

//   const handleClearRecentSearches = async () => {
//     await AsyncStorage.removeItem("@MyApp_recent_searches");
//     setRecentSearches([]);
//   };

//   const renderProductItem = ({ item, index }) => (
//     <View
//       style={[
//         styles.productCardContainer,
//         { marginLeft: index % numColumns === 0 ? 0 : ITEM_GAP },
//       ]}
//     >
//       <RangeCategoryCard
//         product={item}
//         onPress={() =>
//           navigation.navigate("ProductDetails", {
//             productId: item.id || item.ean_code || item.eanCode,
//           })
//         }
//       />
//     </View>
//   );

//   const renderPlaceholder = ({ index }) => (
//     <View
//       style={[
//         styles.productCardContainer,
//         { marginLeft: index % numColumns === 0 ? 0 : ITEM_GAP },
//       ]}
//     >
//       <ProductCardPlaceholder />
//     </View>
//   );

//   const ListHeaderComponent = (
//     <View>
//       {!searchQuery && recentSearches.length > 0 && (
//         <RecentSearches
//           onSelect={handleRecentSearchSelect}
//           onClear={handleClearRecentSearches}
//         />
//       )}
//     </View>
//   );

//   return (
//     <View style={[styles.container, { paddingBottom: insets.bottom }]}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="transparent"
//         translucent
//       />
//       <View style={[styles.searchHeader, { paddingTop: insets.top + 5 }]}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
//         </TouchableOpacity>
//         <View style={styles.searchBarWrapper}>
//           <View style={styles.searchInputContainer}>
//             <Ionicons
//               name="search"
//               size={RFValue(18)}
//               color="#666"
//               style={styles.searchIcon}
//             />
//             <TextInput
//               style={styles.searchInput}
//               value={searchQuery}
//               onChangeText={handleInputChange}
//               placeholder="Search products"
//               placeholderTextColor="#999"
//               allowFontScaling={false}
//               autoFocus
//               returnKeyType="search"
//               onSubmitEditing={handleSearchSubmit}
//             />
//             {searchQuery.length > 0 && (
//               <TouchableOpacity
//                 onPress={() => {
//                   setSearchQuery("");
//                   setSearchResults(products);
//                   setAutocompleteSuggestions([]);
//                   setShowSuggestions(false);
//                 }}
//                 style={styles.clearButton}
//               >
//                 <Ionicons
//                   name="close-circle"
//                   size={RFValue(18)}
//                   color="#666"
//                 />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </View>
//       {showSuggestions && autocompleteSuggestions.length > 0 && (
//         <AutocompleteSuggestions
//           suggestions={autocompleteSuggestions}
//           onSelectSuggestion={(suggestion) => {
//             if (suggestion.type === "product") {
//               navigation.navigate("ProductDetails", {
//                 productId:
//                   suggestion.id || suggestion.ean_code || suggestion.eanCode,
//               });
//               setShowSuggestions(false);
//             } else if (
//               suggestion.type === "category" ||
//               suggestion.type === "sub_category"
//             ) {
//               setSearchQuery(suggestion.name);
//               debouncedSearchFoods(suggestion.name);
//               setShowSuggestions(false);
//             }
//           }}
//           highlight={searchQuery}
//         />
//       )}

//       {loading ? (
//         <FlatList
//           data={Array.from({ length: 12 })} // Render 9 placeholders
//           renderItem={renderPlaceholder}
//           keyExtractor={(_, index) => index.toString()}
//           numColumns={numColumns}
//           contentContainerStyle={styles.resultsContainer}
//           columnWrapperStyle={{
//             justifyContent: "flex-start",
//             marginBottom: hp(5),
//           }}
//         />
//       ) : (
//         <FlatList
//           data={searchResults}
//           renderItem={renderProductItem}
//           keyExtractor={(item, index) =>
//             (item.ean_code || item.eanCode || index).toString()
//           }
//           numColumns={numColumns}
//           contentContainerStyle={styles.resultsContainer}
//           columnWrapperStyle={{
//             justifyContent: "flex-start",
//             marginBottom: ITEM_GAP,
//           }}
//           showsVerticalScrollIndicator={false}
//           keyboardDismissMode="on-drag"
//           keyboardShouldPersistTaps="handled"
//           ListHeaderComponent={ListHeaderComponent}
//           ListEmptyComponent={
//             <View style={styles.noResultsContainer}>
//               <Text
//                 allowFontScaling={false}
//                 adjustsFontSizeToFit
//                 style={styles.noResultsText}
//               >
//                 No products found for "{searchQuery}"
//               </Text>
//             </View>
//           }
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   searchHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: wp(2),
//     paddingVertical: hp(1.5),
//     backgroundColor: "#FFF7E8",
//   },
//   backButton: { padding: wp(1), marginRight: wp(1.5) },
//   searchBarWrapper: { flex: 1, marginHorizontal: wp(2) },
//   searchInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: wp(2),
//     paddingHorizontal: wp(3),
//     paddingVertical: hp(1),
//   },
//   searchIcon: { marginRight: wp(2) },
//   searchInput: {
//     flex: 1,
//     fontSize: RFValue(13.5),
//     color: "#333",
//     paddingVertical: 0,
//   },
//   clearButton: { marginLeft: wp(2), padding: wp(0.5) },
//   noResultsContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: hp(5),
//   },
//   noResultsText: { fontSize: RFValue(14), color: "#888" },
//   resultsContainer: { padding: ITEM_GAP },
//   productCardContainer: {
//     width: ITEM_WIDTH,
//     marginBottom: ITEM_GAP - 25,
//     backgroundColor: "#fff",
//     borderRadius: wp(2),
//     overflow: "hidden",
//   },
// });

// export default SearchScreen;









// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Voice from "@react-native-voice/voice"; // --- ADDED ---
// import RecentSearches from "../components/RecentSearch";
// import RangeCategoryCard from "../components/RangeCategoryCard";
// import AutocompleteSuggestions from "../components/AutocompleteSuggestion";
// import ProductCardPlaceholder from "../components/ProductCardPlaceholder";
// import { saveRecentSearch, getRecentSearches } from "../utils/SearchUtil";
// import {
//   fetchFoodList,
//   searchFoods,
//   fetchAutocompleteSuggestions,
// } from "../services/FoodService";
// import { RFValue } from "react-native-responsive-fontsize";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import debounce from "lodash.debounce";

// // ... (Your styles and constants are fine) ...
// const numColumns = 3;
// const ITEM_GAP = wp(2);
// const ITEM_WIDTH = (wp(100) - (numColumns + 1) * ITEM_GAP) / numColumns;

// const SearchScreen = ({ route, navigation }) => {
//   const { initialQuery = "" } = route.params || {};
//   const [searchQuery, setSearchQuery] = useState(initialQuery);
//   const [products, setProducts] = useState([]);
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const [isListening, setIsListening] = useState(false); // --- ADDED ---
//   const [voiceError, setVoiceError] = useState(""); // --- ADDED ---
//   const insets = useSafeAreaInsets();

//   // --- ADDED: Voice Recognition Logic ---
//   useEffect(() => {
//     // Define event handlers
//     const onSpeechStart = (e) => {
//       console.log("onSpeechStart: ", e);
//       setIsListening(true);
//       setVoiceError("");
//     };

//     const onSpeechEnd = (e) => {
//       console.log("onSpeechEnd: ", e);
//       setIsListening(false);
//     };

//     const onSpeechError = (e) => {
//       console.log("onSpeechError: ", e);
//       setVoiceError(e.error?.message || "Something went wrong");
//       setIsListening(false);
//     };

//     const onSpeechResults = (e) => {
//       console.log("onSpeechResults: ", e);
//       if (e.value && e.value.length > 0) {
//         const spokenText = e.value[0];
//         setSearchQuery(spokenText); // Update the text input
//         handleInputChange(spokenText); // Trigger your existing debounced search
//       }
//     };

//     // Add listeners
//     Voice.onSpeechStart = onSpeechStart;
//     Voice.onSpeechEnd = onSpeechEnd;
//     Voice.onSpeechError = onSpeechError;
//     Voice.onSpeechResults = onSpeechResults;

//     // Cleanup function
//     return () => {
//       // Destroy the voice instance and remove all listeners
//       Voice.destroy().then(Voice.removeAllListeners);
//     };
//   }, [handleInputChange]); // Add handleInputChange as dependency

//   // --- ADDED: Functions to control voice ---
//   const startListening = async () => {
//     try {
//       await Voice.start("en-US"); // You can change the locale
//       setIsListening(true);
//       setVoiceError("");
//     } catch (e) {
//       console.error(e);
//       setVoiceError(e.message);
//     }
//   };

//   const stopListening = async () => {
//     try {
//       await Voice.stop();
//       setIsListening(false);
//     } catch (e) {
//       console.error(e);
//       setVoiceError(e.message);
//     }
//   };

//   // This function will be called by the mic button
//   const toggleListening = () => {
//     if (isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };
//   // --- END of Voice Logic ---

//   useEffect(() => {
//     (async () => {
//       const recent = await getRecentSearches();
//       setRecentSearches(recent);
//     })();
//   }, []);

//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setLoading(true);
//       fetchFoodList()
//         .then((data) => {
//           setProducts(data);
//           setSearchResults(data);
//         })
//         .finally(() => setLoading(false));
//     }
//   }, [searchQuery]);

//   const debouncedSearchFoods = useCallback(
//     debounce((query) => {
//       if (query.trim().length >= 2) {
//         setLoading(true);
//         searchFoods(query)
//           .then((data) => setSearchResults(data))
//           .finally(() => setLoading(false));
//       }
//     }, 500),
//     []
//   );

//   const debouncedAutocomplete = useCallback(
//     debounce((query) => {
//       if (query.trim().length >= 2) {
//         fetchAutocompleteSuggestions(query)
//           .then((suggestions) => {
//             setAutocompleteSuggestions(suggestions);
//             setShowSuggestions(true);
//           })
//           .catch(() => setShowSuggestions(false));
//       } else {
//         setShowSuggestions(false);
//       }
//     }, 500),
//     []
//   );

//   useEffect(() => {
//     return () => {
//       debouncedSearchFoods.cancel();
//       debouncedAutocomplete.cancel();
//     };
//   }, [debouncedSearchFoods, debouncedAutocomplete]);

//   const handleInputChange = useCallback( // --- MODIFIED: Wrapped in useCallback ---
//     (text) => {
//       setSearchQuery(text);
//       debouncedSearchFoods(text);
//       debouncedAutocomplete(text);
//     },
//     [debouncedSearchFoods, debouncedAutocomplete] // Dependencies for useCallback
//   );

//   const handleSearchSubmit = async (event) => {
//     const query = event.nativeEvent.text.trim();
//     if (query) {
//       setSearchQuery(query);
//       await saveRecentSearch(query);
//       const recent = await getRecentSearches();
//       setRecentSearches(recent);
//     }
//     setShowSuggestions(false);
//   };

//   // ... (Your other handlers are fine) ...
//   const handleRecentSearchSelect = async (term) => {
//     setSearchQuery(term);
//     debouncedSearchFoods(term);
//     debouncedAutocomplete(term);
//     await saveRecentSearch(term);
//     const recent = await getRecentSearches();
//     setRecentSearches(recent);
//     setShowSuggestions(false);
//   };

//   const handleClearRecentSearches = async () => {
//     await AsyncStorage.removeItem("@MyApp_recent_searches");
//     setRecentSearches([]);
//   };

//   // ... (Your render functions are fine) ...
//   const renderProductItem = ({ item, index }) => (
//     <View
//       style={[
//         styles.productCardContainer,
//         { marginLeft: index % numColumns === 0 ? 0 : ITEM_GAP },
//       ]}
//     >
//       <RangeCategoryCard
//         product={item}
//         onPress={() =>
//           navigation.navigate("ProductDetails", {
//             productId: item.id || item.ean_code || item.eanCode,
//           })
//         }
//       />
//     </View>
//   );

//   const renderPlaceholder = ({ index }) => (
//     <View
//       style={[
//         styles.productCardContainer,
//         { marginLeft: index % numColumns === 0 ? 0 : ITEM_GAP },
//       ]}
//     >
//       <ProductCardPlaceholder />
//     </View>
//   );

//   const ListHeaderComponent = (
//     <View>
//       {!searchQuery && recentSearches.length > 0 && (
//         <RecentSearches
//           onSelect={handleRecentSearchSelect}
//           onClear={handleClearRecentSearches}
//         />
//       )}
//     </View>
//   );

//   return (
//     <View style={[styles.container, { paddingBottom: insets.bottom }]}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="transparent"
//         translucent
//       />
//       <View style={[styles.searchHeader, { paddingTop: insets.top + 5 }]}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
//         </TouchableOpacity>
//         <View style={styles.searchBarWrapper}>
//           <View style={styles.searchInputContainer}>
//             <Ionicons
//               name="search"
//               size={RFValue(18)}
//               color="#666"
//               style={styles.searchIcon}
//             />
//             <TextInput
//               style={styles.searchInput}
//               value={searchQuery}
//               onChangeText={handleInputChange}
//               placeholder={isListening ? "Listening..." : "Search products"} // --- MODIFIED ---
//               placeholderTextColor="#999"
//               allowFontScaling={false}
//               autoFocus
//               returnKeyType="search"
//               onSubmitEditing={handleSearchSubmit}
//             />
//             {searchQuery.length > 0 && !isListening && ( // --- MODIFIED ---
//               <TouchableOpacity
//                 onPress={() => {
//                   setSearchQuery("");
//                   setSearchResults(products);
//                   setAutocompleteSuggestions([]);
//                   setShowSuggestions(false);
//                 }}
//                 style={styles.clearButton}
//               >
//                 <Ionicons
//                   name="close-circle"
//                   size={RFValue(18)}
//                   color="#666"
//                 />
//               </TouchableOpacity>
//             )}
            
//             {/* --- ADDED: Voice Search Button --- */}
//             <TouchableOpacity
//               onPress={toggleListening}
//               style={styles.micButton}
//             >
//               <Ionicons
//                 name={isListening ? "mic-off" : "mic"}
//                 size={RFValue(20)}
//                 color={isListening ? "#FF6347" : "#666"} // Change color when listening
//               />
//             </TouchableOpacity>
//             {/* --- END of Voice Button --- */}

//           </View>
//         </View>
//       </View>
      
//       {/* --- ADDED: Display voice error --- */}
//       {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}

//       {/* ... (Rest of your JSX is fine) ... */}
//       {showSuggestions && autocompleteSuggestions.length > 0 && (
//         <AutocompleteSuggestions
//           suggestions={autocompleteSuggestions}
//           onSelectSuggestion={(suggestion) => {
//             if (suggestion.type === "product") {
//               navigation.navigate("ProductDetails", {
//                 productId:
//                   suggestion.id || suggestion.ean_code || suggestion.eanCode,
//               });
//               setShowSuggestions(false);
//             } else if (
//               suggestion.type === "category" ||
//               suggestion.type === "sub_category"
//             ) {
//               setSearchQuery(suggestion.name);
//               debouncedSearchFoods(suggestion.name);
//               setShowSuggestions(false);
//             }
//           }}
//           highlight={searchQuery}
//         />
//       )}
      
//       {/* ... (Rest of your FlatList / loading logic is fine) ... */}
//       {loading ? (
//         <FlatList
//           data={Array.from({ length: 12 })}
//           renderItem={renderPlaceholder}
//           keyExtractor={(_, index) => index.toString()}
//           numColumns={numColumns}
//           contentContainerStyle={styles.resultsContainer}
//           columnWrapperStyle={{
//             justifyContent: "flex-start",
//             marginBottom: hp(5),
//           }}
//         />
//       ) : (
//         <FlatList
//           data={searchResults}
//           renderItem={renderProductItem}
//           keyExtractor={(item, index) =>
//             (item.ean_code || item.eanCode || index).toString()
//           }
//           numColumns={numColumns}
//           contentContainerStyle={styles.resultsContainer}
//           columnWrapperStyle={{
//             justifyContent: "flex-start",
//             marginBottom: ITEM_GAP,
//           }}
//           showsVerticalScrollIndicator={false}
//           keyboardDismissMode="on-drag"
//           keyboardShouldPersistTaps="handled"
//           ListHeaderComponent={ListHeaderComponent}
//           ListEmptyComponent={
//             <View style={styles.noResultsContainer}>
//               <Text
//                 allowFontScaling={false}
//                 adjustsFontSizeToFit
//                 style={styles.noResultsText}
//               >
//                 No products found for "{searchQuery}"
//               </Text>
//             </View>
//           }
//         />
//       )}
//     </View>
//   );
// };

// // --- ADDED: New/Modified Styles ---
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   searchHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: wp(2),
//     paddingVertical: hp(1.5),
//     backgroundColor: "#FFF7E8",
//   },
//   backButton: { padding: wp(1), marginRight: wp(1.5) },
//   searchBarWrapper: { flex: 1, marginHorizontal: wp(2) },
//   searchInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: wp(2),
//     paddingHorizontal: wp(3),
//     paddingVertical: hp(1),
//   },
//   searchIcon: { marginRight: wp(2) },
//   searchInput: {
//     flex: 1,
//     fontSize: RFValue(13.5),
//     color: "#333",
//     paddingVertical: 0,
//   },
//   clearButton: { marginLeft: wp(2), padding: wp(0.5) },
//   micButton: { marginLeft: wp(2), padding: wp(0.5) }, // --- ADDED ---
//   errorText: { // --- ADDED ---
//     color: 'red',
//     textAlign: 'center',
//     marginTop: hp(1),
//     marginHorizontal: wp(4),
//     fontSize: RFValue(12),
//   },
//   noResultsContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: hp(5),
//   },
//   noResultsText: { fontSize: RFValue(14), color: "#888" },
//   resultsContainer: { padding: ITEM_GAP },
//   productCardContainer: {
//     width: ITEM_WIDTH,
//     marginBottom: ITEM_GAP - 25,
//     backgroundColor: "#fff",
//     borderRadius: wp(2),
//     overflow: "hidden",
//   },
// });

// export default SearchScreen;




















import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Voice from "@react-native-voice/voice";
import RecentSearches from "../components/RecentSearch";
import RangeCategoryCard from "../components/RangeCategoryCard";
import AutocompleteSuggestions from "../components/AutocompleteSuggestion";
import ProductCardPlaceholder from "../components/ProductCardPlaceholder";
import { saveRecentSearch, getRecentSearches } from "../utils/SearchUtil";
import {
  fetchFoodList,
  searchFoods,
  fetchAutocompleteSuggestions,
} from "../services/FoodService";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "lodash.debounce";

const numColumns = 3;
const ITEM_GAP = wp(2);
const ITEM_WIDTH = (wp(100) - (numColumns + 1) * ITEM_GAP) / numColumns;

const SearchScreen = ({ route, navigation }) => {
  const { initialQuery = "" } = route.params || {};
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const insets = useSafeAreaInsets();

  // --- MODIFIED: Voice Recognition Logic ---
  useEffect(() => {
    // Define event handlers
    const onSpeechStart = (e) => {
      console.log("onSpeechStart: ", e);
      setIsListening(true);
      setVoiceError("");
    };

    const onSpeechEnd = (e) => {
      console.log("onSpeechEnd: ", e);
      setIsListening(false);
    };

    const onSpeechError = (e) => {
      console.log("onSpeechError: ", e);
      // --- MODIFIED: Handle 1107 error gracefully ---
      if (e.error?.code === 'recognition_fail' && e.error?.message.includes('1107')) {
        setVoiceError("No speech detected. Try again.");
      } else {
        setVoiceError(e.error?.message || "Something went wrong");
      }
      setIsListening(false);
    };

    const onSpeechResults = (e) => {
      console.log("onSpeechResults: ", e);
      if (e.value && e.value.length > 0) {
        const spokenText = e.value[0];
        setSearchQuery(spokenText); // Update the text input
        handleInputChange(spokenText); // Trigger your existing debounced search
      }
    };

    // Add listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    // --- MODIFIED: Added robust cleanup function ---
    // This runs when the component unmounts
    return () => {
      // Stop, destroy, and remove all listeners
      Voice.stop();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [handleInputChange]); // Add handleInputChange as dependency

  // --- MODIFIED: Functions to control voice ---
  const startListening = async () => {
    // --- MODIFIED: Add a stop() call before start() ---
    // First, kill any lingering session to prevent 1107 errors
    try {
      await Voice.stop();
    } catch (e) {
      // It's okay if this fails, it just means it wasn't listening
      console.log("Minor error stopping voice: ", e);
    }
    // --- End of new code ---

    try {
      await Voice.start("en-US"); // You can change the locale
      setIsListening(true);
      setVoiceError("");
    } catch (e) {
      console.error("Error starting voice: ", e);
      setVoiceError(e.message);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error("Error stopping voice: ", e);
      setVoiceError(e.message);
    }
  };

  // --- MODIFIED: This function is now async ---
  const toggleListening = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };
  // --- END of Voice Logic ---

  useEffect(() => {
    (async () => {
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    })();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLoading(true);
      fetchFoodList()
        .then((data) => {
          setProducts(data);
          setSearchResults(data);
        })
        .finally(() => setLoading(false));
    }
  }, [searchQuery]);

  const debouncedSearchFoods = useCallback(
    debounce((query) => {
      if (query.trim().length >= 2) {
        setLoading(true);
        searchFoods(query)
          .then((data) => setSearchResults(data))
          .finally(() => setLoading(false));
      }
    }, 500),
    []
  );

  const debouncedAutocomplete = useCallback(
    debounce((query) => {
      if (query.trim().length >= 2) {
        fetchAutocompleteSuggestions(query)
          .then((suggestions) => {
            setAutocompleteSuggestions(suggestions);
            setShowSuggestions(true);
          })
          .catch(() => setShowSuggestions(false));
      } else {
        setShowSuggestions(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearchFoods.cancel();
      debouncedAutocomplete.cancel();
    };
  }, [debouncedSearchFoods, debouncedAutocomplete]);

  const handleInputChange = useCallback(
    (text) => {
      setSearchQuery(text);
      debouncedSearchFoods(text);
      debouncedAutocomplete(text);
    },
    [debouncedSearchFoods, debouncedAutocomplete]
  );

  const handleSearchSubmit = async (event) => {
    const query = event.nativeEvent.text.trim();
    if (query) {
      setSearchQuery(query);
      await saveRecentSearch(query);
      const recent = await getRecentSearches();
      setRecentSearches(recent);
    }
    setShowSuggestions(false);
  };

  const handleRecentSearchSelect = async (term) => {
    setSearchQuery(term);
    debouncedSearchFoods(term);
    debouncedAutocomplete(term);
    await saveRecentSearch(term);
    const recent = await getRecentSearches();
    setRecentSearches(recent);
    setShowSuggestions(false);
  };

  const handleClearRecentSearches = async () => {
    await AsyncStorage.removeItem("@MyApp_recent_searches");
    setRecentSearches([]);
  };

  const renderProductItem = ({ item, index }) => (
    <View
      style={[
        styles.productCardContainer,
        { marginLeft: index % numColumns === 0 ? 0 : ITEM_GAP },
      ]}
    >
      <RangeCategoryCard
        product={item}
        onPress={() =>
          navigation.navigate("ProductDetails", {
            productId: item.id || item.ean_code || item.eanCode,
          })
        }
      />
    </View>
  );

  const renderPlaceholder = ({ index }) => (
    <View
      style={[
        styles.productCardContainer,
        { marginLeft: index % numColumns === 0 ? 0 : ITEM_GAP },
      ]}
    >
      <ProductCardPlaceholder />
    </View>
  );

  const ListHeaderComponent = (
    <View>
      {!searchQuery && recentSearches.length > 0 && (
        <RecentSearches
          onSelect={handleRecentSearchSelect}
          onClear={handleClearRecentSearches}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={[styles.searchHeader, { paddingTop: insets.top + 5 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={RFValue(22)} color="#222" />
        </TouchableOpacity>
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={RFValue(18)}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleInputChange}
              placeholder={isListening ? "Listening..." : "Search products"}
              placeholderTextColor="#999"
              allowFontScaling={false}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />
            {searchQuery.length > 0 && !isListening && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchResults(products);
                  setAutocompleteSuggestions([]);
                  setShowSuggestions(false);
                }}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={RFValue(18)}
                  color="#666"
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={toggleListening} // --- MODIFIED: Now calls the async toggle ---
              style={styles.micButton}
            >
              <Ionicons
                name={isListening ? "mic-off" : "mic"}
                size={RFValue(20)}
                color={isListening ? "#FF6347" : "#666"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {voiceError ? <Text style={styles.errorText}>{voiceError}</Text> : null}

      {showSuggestions && autocompleteSuggestions.length > 0 && (
        <AutocompleteSuggestions
          suggestions={autocompleteSuggestions}
          onSelectSuggestion={(suggestion) => {
            if (suggestion.type === "product") {
              navigation.navigate("ProductDetails", {
                productId:
                  suggestion.id || suggestion.ean_code || suggestion.eanCode,
              });
              setShowSuggestions(false);
            } else if (
              suggestion.type === "category" ||
              suggestion.type === "sub_category"
            ) {
              setSearchQuery(suggestion.name);
              debouncedSearchFoods(suggestion.name);
              setShowSuggestions(false);
            }
          }}
          highlight={searchQuery}
        />
      )}

      {loading ? (
        <FlatList
          data={Array.from({ length: 12 })}
          renderItem={renderPlaceholder}
          keyExtractor={(_, index) => index.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.resultsContainer}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            marginBottom: hp(5),
          }}
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProductItem}
          keyExtractor={(item, index) =>
            (item.ean_code || item.eanCode || index).toString()
          }
          numColumns={numColumns}
          contentContainerStyle={styles.resultsContainer}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            marginBottom: ITEM_GAP,
          }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={
            <View style={styles.noResultsContainer}>
              <Text
                allowFontScaling={false}
                adjustsFontSizeToFit
                style={styles.noResultsText}
              >
                No products found for "{searchQuery}"
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
    backgroundColor: "#FFF7E8",
  },
  backButton: { padding: wp(1), marginRight: wp(1.5) },
  searchBarWrapper: { flex: 1, marginHorizontal: wp(2) },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
  },
  searchIcon: { marginRight: wp(2) },
  searchInput: {
    flex: 1,
    fontSize: RFValue(13.5),
    color: "#333",
    paddingVertical: 0,
  },
  clearButton: { marginLeft: wp(2), padding: wp(0.5) },
  micButton: { marginLeft: wp(2), padding: wp(0.5) },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: hp(1),
    marginHorizontal: wp(4),
    fontSize: RFValue(12),
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(5),
  },
  noResultsText: { fontSize: RFValue(14), color: "#888" },
  resultsContainer: { padding: ITEM_GAP },
  productCardContainer: {
    width: ITEM_WIDTH,
    marginBottom: ITEM_GAP - 25,
    backgroundColor: "#fff",
    borderRadius: wp(2),
    overflow: "hidden",
  },
});

export default SearchScreen;