// import { createContext, useState, useContext, useEffect, useRef } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as CartService from "../services/CartService";
// import { fetchFoodDetails } from "../services/FoodService";
// import { useAuth } from "../context/AuthContext";
// import auth from "@react-native-firebase/auth";
// import CouponService from "../services/CouponService";
// import { chargesService } from "../services/ChargesService";

// const CartContext = createContext();
// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   // --- States for cart UI and billing ---
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [cartCount, setCartCount] = useState(0);
//   const [cartTotal, setCartTotal] = useState(0);
//   const { user } = useAuth();
//   const [regularItemsTotal, setRegularItemsTotal] = useState(0);
//   const [freeGifts, setFreeGifts] = useState([]);
//   const [freeGiftOptions, setFreeGiftOptions] = useState([]);
//   const [eligibleGiftCount, setEligibleGiftCount] = useState(0);

//   const [billCharges, setBillCharges] = useState({});

//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [currentDiscountAmount, setCurrentDiscountAmount] = useState(0);
//   const [gstAmount, setGstAmount] = useState(0);

//   // --- For batching and debouncing cart quantity changes ---
//   const [pendingCartOps, setPendingCartOps] = useState({}); // { productId: netChange }
//   const pendingCartOpsRef = useRef({});
//   const cartUpdateTimer = useRef(null);
//   const isSyncingRef = useRef(false);

//   // Keep pendingCartOpsRef in sync with pendingCartOps state
//   useEffect(() => {
//     pendingCartOpsRef.current = pendingCartOps;
//   }, [pendingCartOps]);

//   // Fetch billing charges once on mount
//   useEffect(() => {
//     const fetchBillCharges = async () => {
//       try {
//         const charges = await chargesService.getBillCharges();
//         if (charges) {
//           setBillCharges({
//             deliveryCharge: charges.deliveryCharge,
//             handlingCharge: charges.handlingCharge,
//             gstPercentage: charges.gstPercentage,
//             freeDeliveryThreshold: charges.freeDeliveryThreshold,
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch bill charges:", err);
//       }
//     };
//     fetchBillCharges();
//   }, []);

//   // Helpers for pricing
//   const getEffectivePrice = (product) =>
//     product.discountPercent && product.discountPercent > 0
//       ? product.discountedPrice || product.price
//       : product.price;

//   const getOriginalPrice = (product) => product.price;

//   // Coupon update logic
//   const updateCouponDiscount = async (newCartTotal) => {
//     if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//       return;
//     }
//     try {
//       const result = await CouponService.applyCoupon(appliedCoupon.code, newCartTotal);
//       if (result.success && result.valid) {
//         setCurrentDiscountAmount(result.discountAmount);
//         const updatedCoupon = { ...appliedCoupon, discount: result.discountAmount };
//         setAppliedCoupon(updatedCoupon);
//         AsyncStorage.setItem("appliedCoupon", JSON.stringify(updatedCoupon));
//       } else {
//         removeCoupon(true);
//       }
//     } catch {
//       // silently fail coupon update if API fails
//     }
//   };

//   const getCartTotalWithCoupon = () => Math.max(0, cartTotal - (currentDiscountAmount || 0));
//   const getCurrentDiscountAmount = () => currentDiscountAmount || 0;

//   // Load applied coupon on mount
//   useEffect(() => {
//     const loadAppliedCoupon = async () => {
//       try {
//         const storedCoupon = await AsyncStorage.getItem("appliedCoupon");
//         if (storedCoupon) {
//           const coupon = JSON.parse(storedCoupon);
//           setAppliedCoupon(coupon);
//           setCurrentDiscountAmount(coupon.discount || 0);
//         }
//       } catch {
//         // ignore
//       }
//     };
//     loadAppliedCoupon();
//   }, []);

//   // When cartItems change, update counts, totals & check free gifts
//   useEffect(() => {
//     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//     setCartCount(totalItems);
//     const regularItems = cartItems.filter((item) => !item.isFreeGift);
//     const gifts = cartItems.filter((item) => item.isFreeGift);
//     setFreeGifts(gifts);

//     const regularTotal = regularItems.reduce(
//       (sum, item) => sum + getEffectivePrice(item) * item.quantity,
//       0
//     );
//     setRegularItemsTotal(regularTotal);

//     const total = cartItems.reduce(
//       (sum, item) => sum + (item.isFreeGift ? 0 : getEffectivePrice(item)) * item.quantity,
//       0
//     );
//     setCartTotal(total);

//     checkFreeGiftEligibility(regularTotal);
//   }, [cartItems]);

//   // Update coupon discount when cart total or coupon changes
//   useEffect(() => {
//     if (appliedCoupon && cartTotal > 0) {
//       updateCouponDiscount(cartTotal);
//     } else if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//     }
//   }, [cartTotal, appliedCoupon?.code]);

//   // Calculate GST on handling charge only
//   useEffect(() => {
//     const handlingCharge = billCharges.handlingCharge;
//     const deliveryCharge = calculateDeliveryCharge();
//     const gstRate = billCharges.gstPercentage / 100;
//     setGstAmount(handlingCharge * gstRate + deliveryCharge * gstRate);
//   }, [billCharges.handlingCharge, billCharges.gstPercentage]);


//   const checkFreeGiftEligibility = async (regularTotal) => {
//     try {
//       const eligibilityData = await CartService.getFreeGiftEligibility(regularTotal);
//       if (eligibilityData && eligibilityData.products) {
//         setFreeGiftOptions(eligibilityData.products);
//         setEligibleGiftCount(eligibilityData.eligibleGiftCount || 0);

//         // Remove excess free gifts if user has more than eligible count
//         if (freeGifts.length > eligibilityData.eligibleGiftCount) {
//           const giftsToRemove = freeGifts.slice(eligibilityData.eligibleGiftCount);
//           for (const gift of giftsToRemove) {
//             await removeLocalFreeGift(gift.id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error checking free gift eligibility:", error);
//       // Optional: You may set error state here if needed
//     }
//   };


//   // Persist guest cart to AsyncStorage whenever it changes
//   useEffect(() => {
//     if (!user) {
//       AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//     }
//   }, [cartItems, user]);

//   // ------------------------------------------
//   // Debounced, batched backend syncing logic
//   // ------------------------------------------

//   // Schedule the batch sync with debounce
//   const debounceScheduleCartSync = () => {
//     if (cartUpdateTimer.current) clearTimeout(cartUpdateTimer.current);
//     cartUpdateTimer.current = setTimeout(() => {
//       if (!isSyncingRef.current) {
//         processPendingCartOps();
//       } else {
//         // If syncing ongoing, reschedule after current sync ends
//         debounceScheduleCartSync();
//       }
//     }, 400);
//   };

//   // Process batched net adds and subtracts
//   const processPendingCartOps = async () => {
//     if (!user) {
//       await AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//       setPendingCartOps({});
//       pendingCartOpsRef.current = {};
//       return;
//     }

//     const opsToSend = { ...pendingCartOpsRef.current };
//     if (!Object.keys(opsToSend).length) return;

//     // Immediately clear ops state & ref to avoid duplicate sending
//     setPendingCartOps({});
//     pendingCartOpsRef.current = {};

//     isSyncingRef.current = true;

//     const adds = {};
//     const subtracts = {};

//     Object.entries(opsToSend).forEach(([id, change]) => {
//       if (change > 0) adds[id] = change;
//       else if (change < 0) subtracts[id] = -change;
//     });

//     try {
//       const token = await auth().currentUser.getIdToken();

//       if (Object.keys(adds).length > 0) {
//         console.log("Adding multiple foods to cart:", adds);
//         await CartService.addMultipleFoods(adds, token);
//       }

//       if (Object.keys(subtracts).length > 0) {
//         console.log("Subtracting multiple foods from cart:", subtracts);
//         await CartService.subtractMultipleFoods(subtracts, token);
//       }
//     } catch (err) {
//       setError("Cart sync failed, retrying...");

//       // Merge back ops to retry later (no loss)
//       setPendingCartOps((prev) => {
//         const merged = { ...prev };
//         Object.entries(opsToSend).forEach(([id, change]) => {
//           merged[id] = (merged[id] || 0) + change;
//           if (merged[id] === 0) delete merged[id];
//         });
//         return merged;
//       });

//       debounceScheduleCartSync();
//     } finally {
//       isSyncingRef.current = false;
//     }
//   };

//   // ------------------------------------------
//   // Cart manipulation functions (instant UI updates + batched syncing)
//   // ------------------------------------------

//   const addItemToCart = (product) => {
//     setError(null);
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === product.id);
//       if (existing) {
//         return prev.map((item) =>
//           item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       } else {
//         const effectivePrice = getEffectivePrice(product);
//         return [
//           ...prev,
//           {
//             ...product,
//             quantity: 1,
//             effectivePrice,
//             displayPrice: effectivePrice,
//           },
//         ];
//       }
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [product.id]: (ops[product.id] || 0) + 1,
//     }));

//     debounceScheduleCartSync();
//   };

//   const removeItemFromCart = (product) => {
//     setError(null);
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === product.id);
//       if (existing) {
//         if (existing.quantity > 1) {
//           return prev.map((item) =>
//             item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
//           );
//         } else {
//           return prev.filter((item) => item.id !== product.id);
//         }
//       }
//       return prev;
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [product.id]: (ops[product.id] || 0) - 1,
//     }));

//     debounceScheduleCartSync();
//   };

//   // ------------------------------------------
//   // Fetch cart data from backend or local guest storage
//   // ------------------------------------------

//   const fetchCartDataFromBackend = async () => {
//     // Avoid overwriting local changes waiting to sync
//     if (Object.keys(pendingCartOps).length > 0) return;

//     try {
//       setError(null);
//       setLoading(true);
//       const currentUser = auth().currentUser;
//       if (!currentUser) {
//         setCartItems([]);
//         setLoading(false);
//         return;
//       }
//       const token = await currentUser.getIdToken();
//       const cartData = await CartService.getCartData(token);

//       if (cartData && cartData.items) {
//         const itemsArray = [];
//         const foodIds = Object.keys(cartData.items);

//         for (const foodId of foodIds) {
//           const quantity = cartData.items[foodId];
//           let productDetails = null;

//           try {
//             productDetails = await fetchFoodDetails(foodId);
//           } catch {
//             // fallback: null productDetails
//           }

//           let isFreeGift = false;
//           let originalPrice = productDetails ? productDetails.price : 100;
//           let effectivePrice = productDetails ? getEffectivePrice(productDetails) : 100;

//           try {
//             const isFreeGiftStr = await AsyncStorage.getItem(`freeGift_${foodId}`);
//             isFreeGift = isFreeGiftStr === "true";

//             if (isFreeGift) {
//               const originalPriceStr = await AsyncStorage.getItem(`freeGiftOriginalPrice_${foodId}`);
//               if (originalPriceStr) {
//                 originalPrice = Number.parseFloat(originalPriceStr);
//               }
//               effectivePrice = 0;
//             }
//           } catch {}

//           if (productDetails) {
//             itemsArray.push({
//               ...productDetails,
//               quantity,
//               isFreeGift,
//               originalPrice,
//               effectivePrice,
//               displayPrice: isFreeGift ? 0 : effectivePrice,
//             });
//           } else {
//             itemsArray.push({
//               id: foodId,
//               name: `Product ${foodId.substring(0, 8)}...`,
//               price: originalPrice,
//               effectivePrice,
//               displayPrice: isFreeGift ? 0 : effectivePrice,
//               quantity,
//               imageUrl: null,
//               isFreeGift,
//               originalPrice,
//             });
//           }
//         }
//         setCartItems(itemsArray);
//       } else {
//         setCartItems([]);
//       }
//     } catch {
//       setError("Failed to load cart data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCartDataFromStorage = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await AsyncStorage.getItem("guestCart");
//       const guestCartItems = data ? JSON.parse(data) : [];
//       const updatedGuestItems = guestCartItems.map((item) => ({
//         ...item,
//         effectivePrice: getEffectivePrice(item),
//         displayPrice: item.isFreeGift ? 0 : getEffectivePrice(item),
//       }));
//       setCartItems(updatedGuestItems);
//     } catch {
//       setError("Failed to load cart data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Merge guest cart items to backend on login once
//   const mergeGuestCartWithBackend = async () => {
//     try {
//       const guestCartData = await AsyncStorage.getItem("guestCart");
//       if (!guestCartData) return;

//       const guestCart = JSON.parse(guestCartData);
//       if (!guestCart.length) return;

//       const currentUser = auth().currentUser;
//       if (!currentUser) return;

//       const token = await currentUser.getIdToken();

//       // Add all guest cart items to backend sequentially
//       for (const item of guestCart) {
//         // Optionally batch all at once if API supports
//         await CartService.addToCart(item.id, token);
//       }

//       await AsyncStorage.removeItem("guestCart");
//     } catch (err) {
//       // Ignore merge errors here
//       console.warn("Failed to merge guest cart with backend", err);
//     }
//   };

//   // --- Free gift management (unchanged, but kept for completeness) ---
//   const addFreeGift = async (product) => {
//     try {
//       setLoading(true);
//       setError(null);
//       await AsyncStorage.setItem(`freeGift_${product.id}`, "true");
//       await AsyncStorage.setItem(`freeGiftOriginalPrice_${product.id}`, getOriginalPrice(product).toString());

//       const currentUser = auth().currentUser;
//       if (!currentUser) throw new Error("User not authenticated");

//       const token = await currentUser.getIdToken();
//       await CartService.addToCart(product.id, token);

//       const existingIdx = cartItems.findIndex((item) => item.id === product.id);
//       if (existingIdx >= 0) {
//         const updatedItems = [...cartItems];
//         updatedItems[existingIdx].isFreeGift = true;
//         updatedItems[existingIdx].originalPrice = getOriginalPrice(updatedItems[existingIdx]);
//         updatedItems[existingIdx].effectivePrice = 0;
//         updatedItems[existingIdx].displayPrice = 0;
//         setCartItems(updatedItems);
//       } else {
//         setCartItems([
//           ...cartItems,
//           {
//             ...product,
//             quantity: 1,
//             isFreeGift: true,
//             originalPrice: getOriginalPrice(product),
//             effectivePrice: 0,
//             displayPrice: 0,
//           },
//         ]);
//       }

//       await fetchCartDataFromBackend();
//     } catch {
//       setError("Failed to add free gift");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeFreeGift = async (productId) => {
//     try {
//       setLoading(true);
//       setError(null);
//       await AsyncStorage.removeItem(`freeGift_${productId}`);
//       await AsyncStorage.removeItem(`freeGiftOriginalPrice_${productId}`);

//       const currentUser = auth().currentUser;
//       if (!currentUser) throw new Error("User not authenticated");

//       const token = await currentUser.getIdToken();
//       await CartService.removeQtyFromCart(productId, token);
//       await removeLocalFreeGift(productId);

//       await fetchCartDataFromBackend();
//     } catch {
//       setError("Failed to remove free gift");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeLocalFreeGift = async (productId) => {
//     const idx = cartItems.findIndex((item) => item.id === productId && item.isFreeGift);
//     if (idx >= 0) {
//       await AsyncStorage.removeItem(`freeGift_${productId}`);
//       await AsyncStorage.removeItem(`freeGiftOriginalPrice_${productId}`);
//       const updatedItems = [...cartItems];
//       updatedItems.splice(idx, 1);
//       setCartItems(updatedItems);
//     }
//   };

//   // Other helpers
//   const getItemQuantity = (productId) => {
//     const item = cartItems.find((item) => item.id === productId);
//     return item ? item.quantity : 0;
//   };

//   const clearCart = async () => {
//     setCartItems([]);
//     setAppliedCoupon(null);
//     setCurrentDiscountAmount(0);
//     await AsyncStorage.removeItem("appliedCoupon");
//     if (!user) {
//       await AsyncStorage.removeItem("guestCart");
//     }
//   };

//   const calculateDeliveryCharge = () =>
//     cartTotal >= billCharges.freeDeliveryThreshold ? 0 : billCharges.deliveryCharge;

//   const calculateHandlingCharge = () => billCharges.handlingCharge;

//   const calculateGrandTotal = () => {
//     const deliveryCharge = calculateDeliveryCharge();
//     const handlingCharge = calculateHandlingCharge();
//     return getCartTotalWithCoupon() + deliveryCharge + handlingCharge + gstAmount;
//   };

//   const calculateSavings = () => {
//     const deliveryCharge = calculateDeliveryCharge();
//     const originalDeliveryCharge = billCharges.deliveryCharge;
//     const couponDiscount = getCurrentDiscountAmount();

//     const productSavings = cartItems.reduce((total, item) => {
//       if (!item.isFreeGift && item.discountPercent && item.discountPercent > 0) {
//         const originalPrice = item.price * item.quantity;
//         const discountedPrice = (item.discountedPrice || item.price) * item.quantity;
//         return total + (originalPrice - discountedPrice);
//       }
//       return total;
//     }, 0);

//     return productSavings + (originalDeliveryCharge - deliveryCharge) + couponDiscount;
//   };

//   // Initial cart loading depending on user state
//   useEffect(() => {
//     if (user) {
//       mergeGuestCartWithBackend();
//       fetchCartDataFromBackend();
//     } else {
//       fetchCartDataFromStorage();
//     }
//   }, [user]);

//   // Public API of the cart context
//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         cartCount,
//         cartTotal,
//         loading,
//         error,
//         addItemToCart,
//         removeItemFromCart,
//         getItemQuantity,
//         clearCart,
//         refreshCart: user ? fetchCartDataFromBackend : fetchCartDataFromStorage,
//         addFreeGift,
//         removeFreeGift,
//         freeGifts,
//         freeGiftOptions,
//         eligibleGiftCount,
//         regularItemsTotal,
//         getEffectivePrice,
//         getOriginalPrice,
//         calculateDeliveryCharge,
//         calculateHandlingCharge,
//         calculateGrandTotal,
//         calculateSavings,
//         appliedCoupon,
//         applyCoupon: async (couponData) => {
//           const couponWithMinimum = {
//             ...couponData,
//             minOrderValue: couponData.minOrderValue || 0,
//           };
//           setAppliedCoupon(couponWithMinimum);
//           setCurrentDiscountAmount(couponData.discount || 0);
//           AsyncStorage.setItem("appliedCoupon", JSON.stringify(couponWithMinimum));
//           setError(null);
//         },
//         removeCoupon: (isAutoRemoval = false) => {
//           if (isAutoRemoval && appliedCoupon) {
//             setError(`Coupon removed: No longer valid for current cart`);
//             setTimeout(() => setError(null), 5000);
//           }
//           setAppliedCoupon(null);
//           setCurrentDiscountAmount(0);
//           AsyncStorage.removeItem("appliedCoupon");
//         },
//         getCartTotalWithCoupon,
//         getCurrentDiscountAmount,
//         clearError: () => setError(null),
//         billCharges,
//         gstAmount,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };














// import { createContext, useState, useContext, useEffect, useRef } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as CartService from "../services/CartService";
// // ✅ We only need fetchFoodList now!
// import { fetchFoodList } from "../services/FoodService"; 
// import { useAuth } from "../context/AuthContext";
// import auth from "@react-native-firebase/auth";
// import CouponService from "../services/CouponService";
// import { chargesService } from "../services/ChargesService";

// const CartContext = createContext();
// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   // --- States for cart UI and billing ---
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   // ✅ NEW: State to hold all product data for fast lookups
//   const [productMap, setProductMap] = useState(new Map());

//   const { user } = useAuth();
  
//   // ... (all your other states like cartCount, cartTotal, coupons, etc., remain the same) ...
//   const [cartCount, setCartCount] = useState(0);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [regularItemsTotal, setRegularItemsTotal] = useState(0);
//   const [freeGifts, setFreeGifts] = useState([]);
//   const [freeGiftOptions, setFreeGiftOptions] = useState([]);
//   const [eligibleGiftCount, setEligibleGiftCount] = useState(0);
//   const [billCharges, setBillCharges] = useState({});
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [currentDiscountAmount, setCurrentDiscountAmount] = useState(0);
//   const [gstAmount, setGstAmount] = useState(0);
//   const [pendingCartOps, setPendingCartOps] = useState({});
//   const pendingCartOpsRef = useRef({});
//   const cartUpdateTimer = useRef(null);
//   const isSyncingRef = useRef(false);

//   // ✅ --- STEP 1 & 2: Fetch all products once and create the Map ---
//   useEffect(() => {
//     const fetchAllProducts = async () => {
//       try {
//         console.log("Fetching full product catalog once...");
//         const allProducts = await fetchFoodList();
//         // Create a Map for instant ID-based lookups
//         const newProductMap = new Map(allProducts.map(p => [p.id, p]));
//         setProductMap(newProductMap);
//         console.log(`Product catalog loaded into memory with ${newProductMap.size} items.`);
//       } catch (err) {
//         console.error("Failed to fetch the full product catalog:", err);
//         setError("Could not load product data. Please restart the app.");
//       }
//     };
//     fetchAllProducts();
//   }, []);

//   // ... (all your other useEffects and helper functions like getEffectivePrice, updateCouponDiscount, etc. remain the same) ...
//   // Keep pendingCartOpsRef in sync with pendingCartOps state
//   useEffect(() => {
//     pendingCartOpsRef.current = pendingCartOps;
//   }, [pendingCartOps]);

//   // Fetch billing charges once on mount
//   useEffect(() => {
//     const fetchBillCharges = async () => {
//       try {
//         const charges = await chargesService.getBillCharges();
//         if (charges) {
//           setBillCharges({
//             deliveryCharge: charges.deliveryCharge,
//             handlingCharge: charges.handlingCharge,
//             gstPercentage: charges.gstPercentage,
//             freeDeliveryThreshold: charges.freeDeliveryThreshold,
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch bill charges:", err);
//       }
//     };
//     fetchBillCharges();
//   }, []);
//   const getEffectivePrice = (product) =>
//     product.discountPercent && product.discountPercent > 0
//       ? product.discountedPrice || product.price
//       : product.price;

//   const getOriginalPrice = (product) => product.price;
//   const updateCouponDiscount = async (newCartTotal) => {
//     if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//       return;
//     }
//     try {
//       const result = await CouponService.applyCoupon(appliedCoupon.code, newCartTotal);
//       if (result.success && result.valid) {
//         setCurrentDiscountAmount(result.discountAmount);
//         const updatedCoupon = { ...appliedCoupon, discount: result.discountAmount };
//         setAppliedCoupon(updatedCoupon);
//         AsyncStorage.setItem("appliedCoupon", JSON.stringify(updatedCoupon));
//       } else {
//         removeCoupon(true);
//       }
//     } catch {
//       // silently fail coupon update if API fails
//     }
//   };

//   const getCartTotalWithCoupon = () => Math.max(0, cartTotal - (currentDiscountAmount || 0));
//   const getCurrentDiscountAmount = () => currentDiscountAmount || 0;
//   useEffect(() => {
//     const loadAppliedCoupon = async () => {
//       try {
//         const storedCoupon = await AsyncStorage.getItem("appliedCoupon");
//         if (storedCoupon) {
//           const coupon = JSON.parse(storedCoupon);
//           setAppliedCoupon(coupon);
//           setCurrentDiscountAmount(coupon.discount || 0);
//         }
//       } catch {
//         // ignore
//       }
//     };
//     loadAppliedCoupon();
//   }, []);
//   useEffect(() => {
//     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//     setCartCount(totalItems);
//     const regularItems = cartItems.filter((item) => !item.isFreeGift);
//     const gifts = cartItems.filter((item) => item.isFreeGift);
//     setFreeGifts(gifts);

//     const regularTotal = regularItems.reduce(
//       (sum, item) => sum + getEffectivePrice(item) * item.quantity,
//       0
//     );
//     setRegularItemsTotal(regularTotal);

//     const total = cartItems.reduce(
//       (sum, item) => sum + (item.isFreeGift ? 0 : getEffectivePrice(item)) * item.quantity,
//       0
//     );
//     setCartTotal(total);

//     checkFreeGiftEligibility(regularTotal);
//   }, [cartItems]);
//   useEffect(() => {
//     if (appliedCoupon && cartTotal > 0) {
//       updateCouponDiscount(cartTotal);
//     } else if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//     }
//   }, [cartTotal, appliedCoupon?.code]);
//   useEffect(() => {
//     const handlingCharge = billCharges.handlingCharge || 0;
//     const deliveryCharge = calculateDeliveryCharge();
//     const gstRate = (billCharges.gstPercentage || 0) / 100;
//     setGstAmount(handlingCharge * gstRate + deliveryCharge * gstRate);
//   }, [billCharges.handlingCharge, billCharges.gstPercentage, cartTotal]);
//   const checkFreeGiftEligibility = async (regularTotal) => {
//     try {
//       const eligibilityData = await CartService.getFreeGiftEligibility(regularTotal);
//       if (eligibilityData && eligibilityData.products) {
//         setFreeGiftOptions(eligibilityData.products);
//         setEligibleGiftCount(eligibilityData.eligibleGiftCount || 0);
//         if (freeGifts.length > eligibilityData.eligibleGiftCount) {
//           const giftsToRemove = freeGifts.slice(eligibilityData.eligibleGiftCount);
//           for (const gift of giftsToRemove) {
//             await removeLocalFreeGift(gift.id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error checking free gift eligibility:", error);
//     }
//   };
//   useEffect(() => {
//     if (!user) {
//       AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//     }
//   }, [cartItems, user]);


//   // ✅ --- REPLACED: The new super-fast fetch function ---
//   const fetchCartDataFromBackend = async () => {
//     // If we don't have the product catalog yet, wait.
//     if (productMap.size === 0) {
//         console.log("Product map not ready yet, delaying cart fetch...");
//         setTimeout(fetchCartDataFromBackend, 500); // Retry after a short delay
//         return;
//     }
//     if (Object.keys(pendingCartOps).length > 0) return;

//     try {
//       setError(null);
//       setLoading(true);
//       const currentUser = auth().currentUser;
//       if (!currentUser) return setLoading(false);
      
//       // STEP 3: Get the simple cart data (IDs & Quantities)
//       const token = await currentUser.getIdToken();
//       const cartData = await CartService.getCartData(token);

//       if (cartData && cartData.items && Object.keys(cartData.items).length > 0) {
//         const foodIds = Object.keys(cartData.items);
        
//         // STEP 4: Combine locally. NO MORE NETWORK CALLS HERE!
//         const itemsArray = foodIds.map(foodId => {
//           const productDetails = productMap.get(foodId); // Instant lookup from memory
//           const quantity = cartData.items[foodId];

//           if (productDetails) {
//             return {
//               ...productDetails,
//               quantity,
//             };
//           }
//           // Fallback for a product in cart that might not be in the main list
//           return { id: foodId, name: `Product ${foodId.substring(0, 8)}...`, price: 0, quantity, imageUrl: null };
//         });

//         setCartItems(itemsArray);
//       } else {
//         setCartItems([]);
//       }
//     } catch (e) {
//       setError("Failed to load cart data");
//       console.error("Failed to load cart data:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ... (the rest of your CartContext code: addItemToCart, removeItemFromCart, etc., can remain exactly the same) ...

//     const debounceScheduleCartSync = () => {
//     if (cartUpdateTimer.current) clearTimeout(cartUpdateTimer.current);
//     cartUpdateTimer.current = setTimeout(() => {
//       if (!isSyncingRef.current) {
//         processPendingCartOps();
//       } else {
//         debounceScheduleCartSync();
//       }
//     }, 400);
//   };
//   const processPendingCartOps = async () => {
//     if (!user) {
//       await AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//       setPendingCartOps({});
//       pendingCartOpsRef.current = {};
//       return;
//     }

//     const opsToSend = { ...pendingCartOpsRef.current };
//     if (!Object.keys(opsToSend).length) return;
//     setPendingCartOps({});
//     pendingCartOpsRef.current = {};
//     isSyncingRef.current = true;
//     const adds = {};
//     const subtracts = {};

//     Object.entries(opsToSend).forEach(([id, change]) => {
//       if (change > 0) adds[id] = change;
//       else if (change < 0) subtracts[id] = -change;
//     });

//     try {
//       const token = await auth().currentUser.getIdToken();
//       if (Object.keys(adds).length > 0) {
//         console.log("Adding multiple foods to cart:", adds);
//         await CartService.addMultipleFoods(adds, token);
//       }
//       if (Object.keys(subtracts).length > 0) {
//         console.log("Subtracting multiple foods from cart:", subtracts);
//         await CartService.subtractMultipleFoods(subtracts, token);
//       }
//     } catch (err) {
//       setError("Cart sync failed, retrying...");
//       setPendingCartOps((prev) => {
//         const merged = { ...prev };
//         Object.entries(opsToSend).forEach(([id, change]) => {
//           merged[id] = (merged[id] || 0) + change;
//           if (merged[id] === 0) delete merged[id];
//         });
//         return merged;
//       });
//       debounceScheduleCartSync();
//     } finally {
//       isSyncingRef.current = false;
//     }
//   };
//   const addItemToCart = (product) => {
//     setError(null);
//     if (!product || !product.id) {
//         console.error("Attempted to add an invalid product to cart:", product);
//         return;
//     }
//     const productDetails = productMap.get(product.id) || product;
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === productDetails.id);
//       if (existing) {
//         return prev.map((item) =>
//           item.id === productDetails.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       }
//       return [ ...prev, { ...productDetails, quantity: 1 } ];
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [productDetails.id]: (ops[productDetails.id] || 0) + 1,
//     }));
//     debounceScheduleCartSync();
//   };
//   const removeItemFromCart = (product) => {
//     setError(null);
//     if (!product || !product.id) {
//         console.error("Attempted to remove an invalid product from cart:", product);
//         return;
//     }
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === product.id);
//       if (existing?.quantity > 1) {
//           return prev.map((item) =>
//             item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
//           );
//       }
//       return prev.filter((item) => item.id !== product.id);
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [product.id]: (ops[product.id] || 0) - 1,
//     }));
//     debounceScheduleCartSync();
//   };
//   const fetchCartDataFromStorage = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await AsyncStorage.getItem("guestCart");
//       setCartItems(data ? JSON.parse(data) : []);
//     } catch {
//       setError("Failed to load cart data");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const mergeGuestCartWithBackend = async () => {
//     try {
//       const guestCartData = await AsyncStorage.getItem("guestCart");
//       if (!guestCartData) return;
//       const guestCart = JSON.parse(guestCartData);
//       if (!guestCart.length) return;

//       const currentUser = auth().currentUser;
//       if (!currentUser) return;
//       const token = await currentUser.getIdToken();
//       const itemsToAdd = guestCart.reduce((acc, item) => {
//           acc[item.id] = item.quantity;
//           return acc;
//       }, {});

//       if(Object.keys(itemsToAdd).length > 0) {
//         await CartService.addMultipleFoods(itemsToAdd, token);
//       }
//       await AsyncStorage.removeItem("guestCart");
//     } catch (err) {
//       console.warn("Failed to merge guest cart with backend", err);
//     }
//   };
//   const getItemQuantity = (productId) => cartItems.find((item) => item.id === productId)?.quantity || 0;
//   const clearCart = async () => {
//     setCartItems([]);
//     setAppliedCoupon(null);
//     setCurrentDiscountAmount(0);
//     await AsyncStorage.removeItem("appliedCoupon");
//     if (user) {
//         // You might want a backend call to clear the cart here
//     } else {
//       await AsyncStorage.removeItem("guestCart");
//     }
//   };
//   const calculateDeliveryCharge = () => (cartTotal >= (billCharges.freeDeliveryThreshold || Infinity)) ? 0 : (billCharges.deliveryCharge || 0);
//   const calculateHandlingCharge = () => billCharges.handlingCharge || 0;
//   const calculateGrandTotal = () => {
//     const deliveryCharge = calculateDeliveryCharge();
//     const handlingCharge = calculateHandlingCharge();
//     return getCartTotalWithCoupon() + deliveryCharge + handlingCharge + gstAmount;
//   };
//   const calculateSavings = () => {
//     const deliveryCharge = calculateDeliveryCharge();
//     const originalDeliveryCharge = billCharges.deliveryCharge || 0;
//     const couponDiscount = getCurrentDiscountAmount();
//     const productSavings = cartItems.reduce((total, item) => {
//       if (!item.isFreeGift && item.discountPercent > 0) {
//         return total + ((item.price - (item.discountedPrice || item.price)) * item.quantity);
//       }
//       return total;
//     }, 0);
//     return productSavings + (originalDeliveryCharge - deliveryCharge) + couponDiscount;
//   };
//   useEffect(() => {
//     if (user) {
//       (async () => {
//           await mergeGuestCartWithBackend();
//           await fetchCartDataFromBackend();
//       })();
//     } else {
//       fetchCartDataFromStorage();
//     }
//   }, [user, productMap]); // Re-fetch cart when user logs in OR when product map is ready
//   return (
//     <CartContext.Provider
//       value={{
//         // Your entire value object remains here
//         cartItems, cartCount, cartTotal, loading, error, addItemToCart, removeItemFromCart, getItemQuantity,
//         clearCart, refreshCart: user ? fetchCartDataFromBackend : fetchCartDataFromStorage,
//         // ... all other values
//         regularItemsTotal, getEffectivePrice, getOriginalPrice, calculateDeliveryCharge, calculateHandlingCharge,
//         calculateGrandTotal, calculateSavings, appliedCoupon, removeCoupon: (isAutoRemoval = false) => {
//           if (isAutoRemoval && appliedCoupon) {
//             setError(`Coupon removed: No longer valid for current cart`);
//             setTimeout(() => setError(null), 5000);
//           }
//           setAppliedCoupon(null);
//           setCurrentDiscountAmount(0);
//           AsyncStorage.removeItem("appliedCoupon");
//         },
//         applyCoupon: async (couponData) => {
//           const couponWithMinimum = {...couponData, minOrderValue: couponData.minOrderValue || 0};
//           setAppliedCoupon(couponWithMinimum);
//           setCurrentDiscountAmount(couponData.discount || 0);
//           AsyncStorage.setItem("appliedCoupon", JSON.stringify(couponWithMinimum));
//           setError(null);
//         }, getCartTotalWithCoupon,
//         getCurrentDiscountAmount, clearError: () => setError(null), billCharges, gstAmount, freeGifts,
//         freeGiftOptions, eligibleGiftCount
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };











// import { createContext, useState, useContext, useEffect, useRef } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as CartService from "../services/CartService";
// // ✅ NO LONGER importing from ProductService
// import { useAuth } from "../context/AuthContext";
// import auth from "@react-native-firebase/auth";
// import CouponService from "../services/CouponService";
// import { chargesService } from "../services/ChargesService";

// const CartContext = createContext();
// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [productMap, setProductMap] = useState(new Map());
//   const { user } = useAuth();
//   const [cartCount, setCartCount] = useState(0);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [regularItemsTotal, setRegularItemsTotal] = useState(0);
//   const [freeGifts, setFreeGifts] = useState([]);
//   const [freeGiftOptions, setFreeGiftOptions] = useState([]);
//   const [eligibleGiftCount, setEligibleGiftCount] = useState(0);
//   const [billCharges, setBillCharges] = useState({});
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [currentDiscountAmount, setCurrentDiscountAmount] = useState(0);
//   const [gstAmount, setGstAmount] = useState(0);
//   const [pendingCartOps, setPendingCartOps] = useState({});
//   const pendingCartOpsRef = useRef({});
//   const cartUpdateTimer = useRef(null);
//   const isSyncingRef = useRef(false);

//   // ✅ --- MODIFIED: API calls are now directly inside this useEffect ---
//   useEffect(() => {
//     const fetchAllProducts = async () => {
//       try {
//         console.log("Fetching all products directly inside CartContext...");

//         // Define the fetch requests
//         const fetchFoods = fetch('https://api.letstryfoods.com/api/foods').then(res => res.json());
//         const fetchGiftboxes = fetch('https://api.letstryfoods.com/api/giftboxes').then(res => res.json());
//         const fetchCombos = fetch('https://api.letstryfoods.com/api/combos').then(res => res.json());

//         // Run all requests in parallel and wait for them to complete
//         const [foodProducts, giftingProducts, comboProducts] = await Promise.all([
//             fetchFoods,
//             fetchGiftboxes,
//             fetchCombos
//         ]);

//         // Combine results into one array, ensuring they are valid arrays first
//         const allProducts = [
//           ...(Array.isArray(foodProducts) ? foodProducts : []),
//           ...(Array.isArray(giftingProducts) ? giftingProducts : []),
//           ...(Array.isArray(comboProducts) ? comboProducts : [])
//         ];

//         // Create the product map from the master list
//         const newProductMap = new Map(allProducts.map(p => [p.id, p]));
//         setProductMap(newProductMap);
//         console.log(`✅ Product catalog loaded with ${newProductMap.size} total items.`);

//       } catch (err) {
//         console.error("Failed to fetch the full product catalog:", err);
//         setError("Could not load product data. Please restart the app.");
//       }
//     };
//     fetchAllProducts();
//   }, []);
  
//   // --- NO OTHER CHANGES ARE NEEDED BELOW THIS LINE ---

//   useEffect(() => {
//     pendingCartOpsRef.current = pendingCartOps;
//   }, [pendingCartOps]);

//   useEffect(() => {
//     const fetchBillCharges = async () => {
//       try {
//         const charges = await chargesService.getBillCharges();
//         if (charges) {
//           setBillCharges({
//             deliveryCharge: charges.deliveryCharge,
//             handlingCharge: charges.handlingCharge,
//             gstPercentage: charges.gstPercentage,
//             freeDeliveryThreshold: charges.freeDeliveryThreshold,
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch bill charges:", err);
//       }
//     };
//     fetchBillCharges();
//   }, []);

//   const getEffectivePrice = (product) =>
//     product.discountPercent && product.discountPercent > 0
//       ? product.discountedPrice || product.price
//       : product.price;

//   const getOriginalPrice = (product) => product.price;

//   const updateCouponDiscount = async (newCartTotal) => {
//     if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//       return;
//     }
//     try {
//       const result = await CouponService.applyCoupon(appliedCoupon.code, newCartTotal);
//       if (result.success && result.valid) {
//         setCurrentDiscountAmount(result.discountAmount);
//         const updatedCoupon = { ...appliedCoupon, discount: result.discountAmount };
//         setAppliedCoupon(updatedCoupon);
//         AsyncStorage.setItem("appliedCoupon", JSON.stringify(updatedCoupon));
//       } else {
//         removeCoupon(true);
//       }
//     } catch {
//       // silently fail coupon update if API fails
//     }
//   };

//   const getCartTotalWithCoupon = () => Math.max(0, cartTotal - (currentDiscountAmount || 0));
//   const getCurrentDiscountAmount = () => currentDiscountAmount || 0;

//   useEffect(() => {
//     const loadAppliedCoupon = async () => {
//       try {
//         const storedCoupon = await AsyncStorage.getItem("appliedCoupon");
//         if (storedCoupon) {
//           const coupon = JSON.parse(storedCoupon);
//           setAppliedCoupon(coupon);
//           setCurrentDiscountAmount(coupon.discount || 0);
//         }
//       } catch {
//         // ignore
//       }
//     };
//     loadAppliedCoupon();
//   }, []);

//   useEffect(() => {
//     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//     setCartCount(totalItems);
//     const regularItems = cartItems.filter((item) => !item.isFreeGift);
//     const gifts = cartItems.filter((item) => item.isFreeGift);
//     setFreeGifts(gifts);

//     const regularTotal = regularItems.reduce(
//       (sum, item) => sum + getEffectivePrice(item) * item.quantity,
//       0
//     );
//     setRegularItemsTotal(regularTotal);

//     const total = cartItems.reduce(
//       (sum, item) => sum + (item.isFreeGift ? 0 : getEffectivePrice(item)) * item.quantity,
//       0
//     );
//     setCartTotal(total);

//     checkFreeGiftEligibility(regularTotal);
//   }, [cartItems]);

//   useEffect(() => {
//     if (appliedCoupon && cartTotal > 0) {
//       updateCouponDiscount(cartTotal);
//     } else if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//     }
//   }, [cartTotal, appliedCoupon?.code]);

//   useEffect(() => {
//     const handlingCharge = billCharges.handlingCharge || 0;
//     const deliveryCharge = calculateDeliveryCharge();
//     const gstRate = (billCharges.gstPercentage || 0) / 100;
//     setGstAmount(handlingCharge * gstRate + deliveryCharge * gstRate);
//   }, [billCharges.handlingCharge, billCharges.gstPercentage, cartTotal]);

//   const checkFreeGiftEligibility = async (regularTotal) => {
//     try {
//       const eligibilityData = await CartService.getFreeGiftEligibility(regularTotal);
//       if (eligibilityData && eligibilityData.products) {
//         setFreeGiftOptions(eligibilityData.products);
//         setEligibleGiftCount(eligibilityData.eligibleGiftCount || 0);
//         if (freeGifts.length > eligibilityData.eligibleGiftCount) {
//           const giftsToRemove = freeGifts.slice(eligibilityData.eligibleGiftCount);
//           for (const gift of giftsToRemove) {
//             await removeLocalFreeGift(gift.id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error checking free gift eligibility:", error);
//     }
//   };

//   useEffect(() => {
//     if (!user) {
//       AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//     }
//   }, [cartItems, user]);

//   const fetchCartDataFromBackend = async () => {
//     if (productMap.size === 0) {
//         console.log("Product map not ready yet, delaying cart fetch...");
//         setTimeout(fetchCartDataFromBackend, 500);
//         return;
//     }
//     if (Object.keys(pendingCartOps).length > 0) return;

//     try {
//       setError(null);
//       setLoading(true);
//       const currentUser = auth().currentUser;
//       if (!currentUser) return setLoading(false);
      
//       const token = await currentUser.getIdToken();
//       const cartData = await CartService.getCartData(token);

//       if (cartData && cartData.items && Object.keys(cartData.items).length > 0) {
//         const foodIds = Object.keys(cartData.items);
        
//         const itemsArray = foodIds.map(foodId => {
//           const productDetails = productMap.get(foodId);
//           const quantity = cartData.items[foodId];

//           if (productDetails) {
//             return {
//               ...productDetails,
//               quantity,
//             };
//           }
//           return { id: foodId, name: `Product ${foodId.substring(0, 8)}...`, price: 0, quantity, imageUrl: null };
//         }).filter(Boolean);

//         setCartItems(itemsArray);
//       } else {
//         setCartItems([]);
//       }
//     } catch (e) {
//       setError("Failed to load cart data");
//       console.error("Failed to load cart data:", e);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const debounceScheduleCartSync = () => {
//     if (cartUpdateTimer.current) clearTimeout(cartUpdateTimer.current);
//     cartUpdateTimer.current = setTimeout(() => {
//       if (!isSyncingRef.current) {
//         processPendingCartOps();
//       } else {
//         debounceScheduleCartSync();
//       }
//     }, 400);
//   };

//   const processPendingCartOps = async () => {
//     if (!user) {
//       await AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//       setPendingCartOps({});
//       pendingCartOpsRef.current = {};
//       return;
//     }

//     const opsToSend = { ...pendingCartOpsRef.current };
//     if (!Object.keys(opsToSend).length) return;
//     setPendingCartOps({});
//     pendingCartOpsRef.current = {};
//     isSyncingRef.current = true;
//     const adds = {};
//     const subtracts = {};

//     Object.entries(opsToSend).forEach(([id, change]) => {
//       if (change > 0) adds[id] = change;
//       else if (change < 0) subtracts[id] = -change;
//     });

//     try {
//       const token = await auth().currentUser.getIdToken();
//       if (Object.keys(adds).length > 0) {
//         await CartService.addMultipleFoods(adds, token);
//       }
//       if (Object.keys(subtracts).length > 0) {
//         await CartService.subtractMultipleFoods(subtracts, token);
//       }
//     } catch (err) {
//       setError("Cart sync failed, retrying...");
//       setPendingCartOps((prev) => {
//         const merged = { ...prev };
//         Object.entries(opsToSend).forEach(([id, change]) => {
//           merged[id] = (merged[id] || 0) + change;
//           if (merged[id] === 0) delete merged[id];
//         });
//         return merged;
//       });
//       debounceScheduleCartSync();
//     } finally {
//       isSyncingRef.current = false;
//     }
//   };

//   const addItemToCart = (product) => {
//     setError(null);
//     if (!product || !product.id) {
//         console.error("Attempted to add an invalid product to cart:", product);
//         return;
//     }
//     const productDetails = productMap.get(product.id) || product;
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === productDetails.id);
//       if (existing) {
//         return prev.map((item) =>
//           item.id === productDetails.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       }
//       return [ ...prev, { ...productDetails, quantity: 1 } ];
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [productDetails.id]: (ops[productDetails.id] || 0) + 1,
//     }));
//     debounceScheduleCartSync();
//   };

//   const removeItemFromCart = (product) => {
//     setError(null);
//     if (!product || !product.id) {
//         console.error("Attempted to remove an invalid product from cart:", product);
//         return;
//     }
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === product.id);
//       if (existing?.quantity > 1) {
//           return prev.map((item) =>
//             item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
//           );
//       }
//       return prev.filter((item) => item.id !== product.id);
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [product.id]: (ops[product.id] || 0) - 1,
//     }));
//     debounceScheduleCartSync();
//   };

//   const fetchCartDataFromStorage = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await AsyncStorage.getItem("guestCart");
//       setCartItems(data ? JSON.parse(data) : []);
//     } catch {
//       setError("Failed to load cart data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const mergeGuestCartWithBackend = async () => {
//     try {
//       const guestCartData = await AsyncStorage.getItem("guestCart");
//       if (!guestCartData) return;
//       const guestCart = JSON.parse(guestCartData);
//       if (!guestCart.length) return;

//       const currentUser = auth().currentUser;
//       if (!currentUser) return;
//       const token = await currentUser.getIdToken();
//       const itemsToAdd = guestCart.reduce((acc, item) => {
//           acc[item.id] = item.quantity;
//           return acc;
//       }, {});

//       if(Object.keys(itemsToAdd).length > 0) {
//         await CartService.addMultipleFoods(itemsToAdd, token);
//       }
//       await AsyncStorage.removeItem("guestCart");
//     } catch (err) {
//       console.warn("Failed to merge guest cart with backend", err);
//     }
//   };

//   const getItemQuantity = (productId) => cartItems.find((item) => item.id === productId)?.quantity || 0;

//   const clearCart = async () => {
//     setCartItems([]);
//     setAppliedCoupon(null);
//     setCurrentDiscountAmount(0);
//     await AsyncStorage.removeItem("appliedCoupon");
//     if (user) {
//         // You might want a backend call to clear the cart here
//     } else {
//       await AsyncStorage.removeItem("guestCart");
//     }
//   };

//   const calculateDeliveryCharge = () => (cartTotal >= (billCharges.freeDeliveryThreshold || Infinity)) ? 0 : (billCharges.deliveryCharge || 0);
//   const calculateHandlingCharge = () => billCharges.handlingCharge || 0;
//   const calculateGrandTotal = () => {
//     const deliveryCharge = calculateDeliveryCharge();
//     const handlingCharge = calculateHandlingCharge();
//     return getCartTotalWithCoupon() + deliveryCharge + handlingCharge + gstAmount;
//   };

//   const calculateSavings = () => {
//     const deliveryCharge = calculateDeliveryCharge();
//     const originalDeliveryCharge = billCharges.deliveryCharge || 0;
//     const couponDiscount = getCurrentDiscountAmount();
//     const productSavings = cartItems.reduce((total, item) => {
//       if (!item.isFreeGift && item.discountPercent > 0) {
//         return total + ((item.price - (item.discountedPrice || item.price)) * item.quantity);
//       }
//       return total;
//     }, 0);
//     return productSavings + (originalDeliveryCharge - deliveryCharge) + couponDiscount;
//   };

//   useEffect(() => {
//     if (user) {
//       (async () => {
//           await mergeGuestCartWithBackend();
//           await fetchCartDataFromBackend();
//       })();
//     } else {
//       fetchCartDataFromStorage();
//     }
//   }, [user, productMap]);

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems, cartCount, cartTotal, loading, error, addItemToCart, removeItemFromCart, getItemQuantity,
//         clearCart, refreshCart: user ? fetchCartDataFromBackend : fetchCartDataFromStorage,
//         regularItemsTotal, getEffectivePrice, getOriginalPrice, calculateDeliveryCharge, calculateHandlingCharge,
//         calculateGrandTotal, calculateSavings, appliedCoupon, removeCoupon: (isAutoRemoval = false) => {
//           if (isAutoRemoval && appliedCoupon) {
//             setError(`Coupon removed: No longer valid for current cart`);
//             setTimeout(() => setError(null), 5000);
//           }
//           setAppliedCoupon(null);
//           setCurrentDiscountAmount(0);
//           AsyncStorage.removeItem("appliedCoupon");
//         },
//         applyCoupon: async (couponData) => {
//           const couponWithMinimum = {...couponData, minOrderValue: couponData.minOrderValue || 0};
//           setAppliedCoupon(couponWithMinimum);
//           setCurrentDiscountAmount(couponData.discount || 0);
//           AsyncStorage.setItem("appliedCoupon", JSON.stringify(couponWithMinimum));
//           setError(null);
//         }, getCartTotalWithCoupon,
//         getCurrentDiscountAmount, clearError: () => setError(null), billCharges, gstAmount, freeGifts,
//         freeGiftOptions, eligibleGiftCount
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };



// import { createContext, useState, useContext, useEffect, useRef } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as CartService from "../services/CartService";
// import { useAuth } from "../context/AuthContext";
// import { useAddress } from "../context/AddressContext";
// import auth from "@react-native-firebase/auth";
// import CouponService from "../services/CouponService";
// import { chargesService } from "../services/ChargesService";

// const CartContext = createContext();
// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [productMap, setProductMap] = useState(new Map());
//   const { user } = useAuth();
//   const { selectedAddress } = useAddress();
//   const [cartCount, setCartCount] = useState(0);
//   const [cartTotal, setCartTotal] = useState(0);
//   const [regularItemsTotal, setRegularItemsTotal] = useState(0);
//   const [freeGifts, setFreeGifts] = useState([]);
//   const [freeGiftOptions, setFreeGiftOptions] = useState([]);
//   const [eligibleGiftCount, setEligibleGiftCount] = useState(0);
//   const [billingQuote, setBillingQuote] = useState({
//     delivery_charge: 0,
//     handling_charge: 0,
//     gst_total: 0,
//     message: null,
//   });
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [currentDiscountAmount, setCurrentDiscountAmount] = useState(0);
//   const [pendingCartOps, setPendingCartOps] = useState({});
//   const pendingCartOpsRef = useRef({});
//   const cartUpdateTimer = useRef(null);
//   const isSyncingRef = useRef(false);

//   useEffect(() => {
//     const fetchAllProducts = async () => {
//       try {
//         console.log("Fetching all products directly inside CartContext...");
//         const fetchFoods = fetch('https://api.letstryfoods.com/api/foods').then(res => res.json());
//         const fetchGiftboxes = fetch('https://api.letstryfoods.com/api/giftboxes').then(res => res.json());
//         const fetchCombos = fetch('https://api.letstryfoods.com/api/combos').then(res => res.json());
//         const [foodProducts, giftingProducts, comboProducts] = await Promise.all([
//             fetchFoods,
//             fetchGiftboxes,
//             fetchCombos
//         ]);
//         const allProducts = [
//           ...(Array.isArray(foodProducts) ? foodProducts : []),
//           ...(Array.isArray(giftingProducts) ? giftingProducts : []),
//           ...(Array.isArray(comboProducts) ? comboProducts : [])
//         ];
//         const newProductMap = new Map(allProducts.map(p => [p.id, p]));
//         setProductMap(newProductMap);
//         console.log(`✅ Product catalog loaded with ${newProductMap.size} total items.`);
//       } catch (err) {
//         console.error("Failed to fetch the full product catalog:", err);
//         setError("Could not load product data. Please restart the app.");
//       }
//     };
//     fetchAllProducts();
//   }, []);

//   useEffect(() => {
//     pendingCartOpsRef.current = pendingCartOps;
//   }, [pendingCartOps]);

//   useEffect(() => {
//     const updateBillingDetails = async () => {
//       // ✅ --- LOG 1: Check if the conditions are met before the API call ---
//       console.log("DEBUG: Checking conditions for billing API call:", {
//         isUserLoggedIn: !!user,
//         isAddressSelected: !!selectedAddress,
//         address: selectedAddress,
//         cartTotal: cartTotal,
//       });

//       if (user && selectedAddress && selectedAddress.state && selectedAddress.pincode && cartTotal > 0) {
//         try {
//           const quote = await chargesService.getBillCharges(
//             cartTotal,
//             selectedAddress.state,
//             selectedAddress.pincode
//           );
          
//           // ✅ --- LOG 2: See exactly what the backend API returned ---
//         //   console.log("DEBUG: API call successful, received quote:", quote);
//           // AFTER
// console.log(
//   "DEBUG: API call successful, received quote:",
//   JSON.stringify(quote, null, 2) // This will print the full object
// );

// // AFTER
// setBillingQuote({
//   delivery_charge: quote.deliveryCharge || 0,
//   handling_charge: quote.handlingCharge || 0,
//   gst_total: quote.gstAmount || 0,
//   message: quote.message || null,
// });
//         } catch (err) {
//           // ✅ --- LOG 3: See the error if the API call failed ---
//           console.error("DEBUG: Failed to update billing details:", err);
          
//           setBillingQuote({
//             delivery_charge: 0,
//             handling_charge: 0,
//             gst_total: 0,
//             message: "Could not calculate charges.",
//           });
//         }
//       } else {
//         // This part runs if conditions are NOT met, resetting charges to 0.
//         setBillingQuote({
//             delivery_charge: 0,
//             handling_charge: 0,
//             gst_total: 0,
//             message: null,
//         });
//       }
//     };

//     updateBillingDetails();
//   }, [cartTotal, selectedAddress, user]);

//   const getEffectivePrice = (product) =>
//     product.discountPercent && product.discountPercent > 0
//       ? product.discountedPrice || product.price
//       : product.price;

//   const getOriginalPrice = (product) => product.price;

//   const updateCouponDiscount = async (newCartTotal) => {
//     if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//       return;
//     }
//     try {
//       const result = await CouponService.applyCoupon(appliedCoupon.code, newCartTotal);
//       if (result.success && result.valid) {
//         setCurrentDiscountAmount(result.discountAmount);
//         const updatedCoupon = { ...appliedCoupon, discount: result.discountAmount };
//         setAppliedCoupon(updatedCoupon);
//         AsyncStorage.setItem("appliedCoupon", JSON.stringify(updatedCoupon));
//       } else {
//         removeCoupon(true);
//       }
//     } catch {
//       // silently fail coupon update if API fails
//     }
//   };

//   const getCartTotalWithCoupon = () => Math.max(0, cartTotal - (currentDiscountAmount || 0));
//   const getCurrentDiscountAmount = () => currentDiscountAmount || 0;

//   useEffect(() => {
//     const loadAppliedCoupon = async () => {
//       try {
//         const storedCoupon = await AsyncStorage.getItem("appliedCoupon");
//         if (storedCoupon) {
//           const coupon = JSON.parse(storedCoupon);
//           setAppliedCoupon(coupon);
//           setCurrentDiscountAmount(coupon.discount || 0);
//         }
//       } catch {
//         // ignore
//       }
//     };
//     loadAppliedCoupon();
//   }, []);

//   useEffect(() => {
//     const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//     setCartCount(totalItems);
//     const regularItems = cartItems.filter((item) => !item.isFreeGift);
//     const gifts = cartItems.filter((item) => item.isFreeGift);
//     setFreeGifts(gifts);

//     const regularTotal = regularItems.reduce(
//       (sum, item) => sum + getEffectivePrice(item) * item.quantity,
//       0
//     );
//     setRegularItemsTotal(regularTotal);

//     const total = cartItems.reduce(
//       (sum, item) => sum + (item.isFreeGift ? 0 : getEffectivePrice(item)) * item.quantity,
//       0
//     );
//     setCartTotal(total);

//     checkFreeGiftEligibility(regularTotal);
//   }, [cartItems]);

//   useEffect(() => {
//     if (appliedCoupon && cartTotal > 0) {
//       updateCouponDiscount(cartTotal);
//     } else if (!appliedCoupon) {
//       setCurrentDiscountAmount(0);
//     }
//   }, [cartTotal, appliedCoupon?.code]);

//   const checkFreeGiftEligibility = async (regularTotal) => {
//     try {
//       const eligibilityData = await CartService.getFreeGiftEligibility(regularTotal);
//       if (eligibilityData && eligibilityData.products) {
//         setFreeGiftOptions(eligibilityData.products);
//         setEligibleGiftCount(eligibilityData.eligibleGiftCount || 0);
//         if (freeGifts.length > eligibilityData.eligibleGiftCount) {
//           const giftsToRemove = freeGifts.slice(eligibilityData.eligibleGiftCount);
//           for (const gift of giftsToRemove) {
//             await removeLocalFreeGift(gift.id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error checking free gift eligibility:", error);
//     }
//   };

//   useEffect(() => {
//     if (!user) {
//       AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//     }
//   }, [cartItems, user]);

//   const fetchCartDataFromBackend = async () => {
//     if (productMap.size === 0) {
//         console.log("Product map not ready yet, delaying cart fetch...");
//         setTimeout(fetchCartDataFromBackend, 500);
//         return;
//     }
//     if (Object.keys(pendingCartOps).length > 0) return;

//     try {
//       setError(null);
//       setLoading(true);
//       const currentUser = auth().currentUser;
//       if (!currentUser) return setLoading(false);
      
//       const token = await currentUser.getIdToken();
//       const cartData = await CartService.getCartData(token);

//       if (cartData && cartData.items && Object.keys(cartData.items).length > 0) {
//         const foodIds = Object.keys(cartData.items);
        
//         const itemsArray = foodIds.map(foodId => {
//           const productDetails = productMap.get(foodId);
//           const quantity = cartData.items[foodId];

//           if (productDetails) {
//             return {
//               ...productDetails,
//               quantity,
//             };
//           }
//           return { id: foodId, name: `Product ${foodId.substring(0, 8)}...`, price: 0, quantity, imageUrl: null };
//         }).filter(Boolean);

//         setCartItems(itemsArray);
//       } else {
//         setCartItems([]);
//       }
//     } catch (e) {
//       setError("Failed to load cart data");
//       console.error("Failed to load cart data:", e);
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   const debounceScheduleCartSync = () => {
//     if (cartUpdateTimer.current) clearTimeout(cartUpdateTimer.current);
//     cartUpdateTimer.current = setTimeout(() => {
//       if (!isSyncingRef.current) {
//         processPendingCartOps();
//       } else {
//         debounceScheduleCartSync();
//       }
//     }, 400);
//   };

//   const processPendingCartOps = async () => {
//     if (!user) {
//       await AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
//       setPendingCartOps({});
//       pendingCartOpsRef.current = {};
//       return;
//     }

//     const opsToSend = { ...pendingCartOpsRef.current };
//     if (!Object.keys(opsToSend).length) return;
//     setPendingCartOps({});
//     pendingCartOpsRef.current = {};
//     isSyncingRef.current = true;
//     const adds = {};
//     const subtracts = {};

//     Object.entries(opsToSend).forEach(([id, change]) => {
//       if (change > 0) adds[id] = change;
//       else if (change < 0) subtracts[id] = -change;
//     });

//     try {
//       const token = await auth().currentUser.getIdToken();
//       if (Object.keys(adds).length > 0) {
//         await CartService.addMultipleFoods(adds, token);
//       }
//       if (Object.keys(subtracts).length > 0) {
//         await CartService.subtractMultipleFoods(subtracts, token);
//       }
//     } catch (err) {
//       setError("Cart sync failed, retrying...");
//       setPendingCartOps((prev) => {
//         const merged = { ...prev };
//         Object.entries(opsToSend).forEach(([id, change]) => {
//           merged[id] = (merged[id] || 0) + change;
//           if (merged[id] === 0) delete merged[id];
//         });
//         return merged;
//       });
//       debounceScheduleCartSync();
//     } finally {
//       isSyncingRef.current = false;
//     }
//   };

//   const addItemToCart = (product) => {
//     setError(null);
//     if (!product || !product.id) {
//         console.error("Attempted to add an invalid product to cart:", product);
//         return;
//     }
//     const productDetails = productMap.get(product.id) || product;
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === productDetails.id);
//       if (existing) {
//         return prev.map((item) =>
//           item.id === productDetails.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       }
//       return [ ...prev, { ...productDetails, quantity: 1 } ];
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [productDetails.id]: (ops[productDetails.id] || 0) + 1,
//     }));
//     debounceScheduleCartSync();
//   };

//   const removeItemFromCart = (product) => {
//     setError(null);
//     if (!product || !product.id) {
//         console.error("Attempted to remove an invalid product from cart:", product);
//         return;
//     }
//     setCartItems((prev) => {
//       const existing = prev.find((item) => item.id === product.id);
//       if (existing?.quantity > 1) {
//           return prev.map((item) =>
//             item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
//           );
//       }
//       return prev.filter((item) => item.id !== product.id);
//     });

//     setPendingCartOps((ops) => ({
//       ...ops,
//       [product.id]: (ops[product.id] || 0) - 1,
//     }));
//     debounceScheduleCartSync();
//   };

//   const fetchCartDataFromStorage = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await AsyncStorage.getItem("guestCart");
//       setCartItems(data ? JSON.parse(data) : []);
//     } catch {
//       setError("Failed to load cart data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const mergeGuestCartWithBackend = async () => {
//     try {
//       const guestCartData = await AsyncStorage.getItem("guestCart");
//       if (!guestCartData) return;
//       const guestCart = JSON.parse(guestCartData);
//       if (!guestCart.length) return;

//       const currentUser = auth().currentUser;
//       if (!currentUser) return;
//       const token = await currentUser.getIdToken();
//       const itemsToAdd = guestCart.reduce((acc, item) => {
//           acc[item.id] = item.quantity;
//           return acc;
//       }, {});

//       if(Object.keys(itemsToAdd).length > 0) {
//         await CartService.addMultipleFoods(itemsToAdd, token);
//       }
//       await AsyncStorage.removeItem("guestCart");
//     } catch (err) {
//       console.warn("Failed to merge guest cart with backend", err);
//     }
//   };

//   const getItemQuantity = (productId) => cartItems.find((item) => item.id === productId)?.quantity || 0;

//   const clearCart = async () => {
//     setCartItems([]);
//     setAppliedCoupon(null);
//     setCurrentDiscountAmount(0);
//     await AsyncStorage.removeItem("appliedCoupon");
//     if (user) {
//         // You might want a backend call to clear the cart here
//     } else {
//       await AsyncStorage.removeItem("guestCart");
//     }
//   };

//   const calculateDeliveryCharge = () => billingQuote.delivery_charge || 0;
//   const calculateHandlingCharge = () => billingQuote.handling_charge || 0;
//   const getGstAmount = () => billingQuote.gst_total || 0;

//   const calculateGrandTotal = () => {
//     const subtotalWithCoupon = getCartTotalWithCoupon();
//     const delivery = calculateDeliveryCharge();
//     const handling = calculateHandlingCharge();
//     const gst = getGstAmount();
//     return subtotalWithCoupon + delivery + handling + gst;
//   };

//   const calculateSavings = () => {
//     const STANDARD_DELIVERY_CHARGE = 40.0;
//     const currentDeliveryCharge = calculateDeliveryCharge();
//     const deliverySavings = (currentDeliveryCharge === 0 && cartTotal > 0) ? STANDARD_DELIVERY_CHARGE : 0;

//     const couponDiscount = getCurrentDiscountAmount();
//     const productSavings = cartItems.reduce((total, item) => {
//       if (!item.isFreeGift && item.discountPercent > 0) {
//         return total + ((item.price - (item.discountedPrice || item.price)) * item.quantity);
//       }
//       return total;
//     }, 0);
//     return productSavings + deliverySavings + couponDiscount;
//   };

//   useEffect(() => {
//     if (user) {
//       (async () => {
//           await mergeGuestCartWithBackend();
//           await fetchCartDataFromBackend();
//       })();
//     } else {
//       fetchCartDataFromStorage();
//     }
//   }, [user, productMap]);

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems, cartCount, cartTotal, loading, error, addItemToCart, removeItemFromCart, getItemQuantity,
//         clearCart, refreshCart: user ? fetchCartDataFromBackend : fetchCartDataFromStorage,
//         regularItemsTotal, getEffectivePrice, getOriginalPrice,
//         calculateDeliveryCharge,
//         calculateHandlingCharge,
//         calculateGrandTotal,
//         calculateSavings,
//         getGstAmount,
//         billingQuote,
//         appliedCoupon, removeCoupon: (isAutoRemoval = false) => {
//           if (isAutoRemoval && appliedCoupon) {
//             setError(`Coupon removed: No longer valid for current cart`);
//             setTimeout(() => setError(null), 5000);
//           }
//           setAppliedCoupon(null);
//           setCurrentDiscountAmount(0);
//           AsyncStorage.removeItem("appliedCoupon");
//         },
//         applyCoupon: async (couponData) => {
//           const couponWithMinimum = {...couponData, minOrderValue: couponData.minOrderValue || 0};
//           setAppliedCoupon(couponWithMinimum);
//           setCurrentDiscountAmount(couponData.discount || 0);
//           AsyncStorage.setItem("appliedCoupon", JSON.stringify(couponWithMinimum));
//           setError(null);
//         },
//         getCartTotalWithCoupon,
//         getCurrentDiscountAmount, clearError: () => setError(null),
//         freeGifts,
//         freeGiftOptions, eligibleGiftCount
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };





import { createContext, useState, useContext, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CartService from "../services/CartService";
import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";
import auth from "@react-native-firebase/auth";
import CouponService from "../services/CouponService";
import { chargesService } from "../services/ChargesService";

// --- ✅ NAYA IMPORT ---
import analytics from '@react-native-firebase/analytics';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productMap, setProductMap] = useState(new Map());
  const { user } = useAuth();
  const { selectedAddress } = useAddress();
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [regularItemsTotal, setRegularItemsTotal] = useState(0);
  const [freeGifts, setFreeGifts] = useState([]);
  const [freeGiftOptions, setFreeGiftOptions] = useState([]);
  const [eligibleGiftCount, setEligibleGiftCount] = useState(0);
  const [billingQuote, setBillingQuote] = useState({
    delivery_charge: 0,
    handling_charge: 0,
    gst_total: 0,
    message: null,
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [currentDiscountAmount, setCurrentDiscountAmount] = useState(0);
  const [pendingCartOps, setPendingCartOps] = useState({});
  const pendingCartOpsRef = useRef({});
  const cartUpdateTimer = useRef(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        console.log("Fetching all products directly inside CartContext...");
        const fetchFoods = fetch('https://api.letstryfoods.com/api/foods').then(res => res.json());
        const fetchGiftboxes = fetch('https://api.letstryfoods.com/api/giftboxes').then(res => res.json());
        const fetchCombos = fetch('https://api.letstryfoods.com/api/combos').then(res => res.json());
        const [foodProducts, giftingProducts, comboProducts] = await Promise.all([
            fetchFoods,
            fetchGiftboxes,
            fetchCombos
        ]);
        const allProducts = [
          ...(Array.isArray(foodProducts) ? foodProducts : []),
          ...(Array.isArray(giftingProducts) ? giftingProducts : []),
          ...(Array.isArray(comboProducts) ? comboProducts : [])
        ];
        const newProductMap = new Map(allProducts.map(p => [p.id, p]));
        setProductMap(newProductMap);
        console.log(`✅ Product catalog loaded with ${newProductMap.size} total items.`);
      } catch (err) {
        console.error("Failed to fetch the full product catalog:", err);
        setError("Could not load product data. Please restart the app.");
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    pendingCartOpsRef.current = pendingCartOps;
  }, [pendingCartOps]);

  useEffect(() => {
    const updateBillingDetails = async () => {
      console.log("DEBUG: Checking conditions for billing API call:", {
        isUserLoggedIn: !!user,
        isAddressSelected: !!selectedAddress,
        address: selectedAddress,
        cartTotal: cartTotal,
      });

      if (user && selectedAddress && selectedAddress.state && selectedAddress.pincode && cartTotal > 0) {
        try {
          const quote = await chargesService.getBillCharges(
            cartTotal,
            selectedAddress.state,
            selectedAddress.pincode
          );
          
          console.log(
            "DEBUG: API call successful, received quote:",
            JSON.stringify(quote, null, 2) 
          );

          setBillingQuote({
            delivery_charge: quote.deliveryCharge || 0,
            handling_charge: quote.handlingCharge || 0,
            gst_total: quote.gstAmount || 0,
            message: quote.message || null,
          });
        } catch (err) {
          console.error("DEBUG: Failed to update billing details:", err);
          
          setBillingQuote({
            delivery_charge: 0,
            handling_charge: 0,
            gst_total: 0,
            message: "Could not calculate charges.",
          });
        }
      } else {
        setBillingQuote({
            delivery_charge: 0,
            handling_charge: 0,
            gst_total: 0,
            message: null,
        });
      }
    };

    updateBillingDetails();
  }, [cartTotal, selectedAddress, user]);

  const getEffectivePrice = (product) =>
    product.discountPercent && product.discountPercent > 0
      ? product.discountedPrice || product.price
      : product.price;

  const getOriginalPrice = (product) => product.price;

  const updateCouponDiscount = async (newCartTotal) => {
    if (!appliedCoupon) {
      setCurrentDiscountAmount(0);
      return;
    }
    try {
      const result = await CouponService.applyCoupon(appliedCoupon.code, newCartTotal);
      if (result.success && result.valid) {
        setCurrentDiscountAmount(result.discountAmount);
        const updatedCoupon = { ...appliedCoupon, discount: result.discountAmount };
        setAppliedCoupon(updatedCoupon);
        AsyncStorage.setItem("appliedCoupon", JSON.stringify(updatedCoupon));
      } else {
        removeCoupon(true);
      }
    } catch {
      // silently fail coupon update if API fails
    }
  };

  const getCartTotalWithCoupon = () => Math.max(0, cartTotal - (currentDiscountAmount || 0));
  const getCurrentDiscountAmount = () => currentDiscountAmount || 0;

  useEffect(() => {
    const loadAppliedCoupon = async () => {
      try {
        const storedCoupon = await AsyncStorage.getItem("appliedCoupon");
        if (storedCoupon) {
          const coupon = JSON.parse(storedCoupon);
          setAppliedCoupon(coupon);
          setCurrentDiscountAmount(coupon.discount || 0);
        }
      } catch {
        // ignore
      }
    };
    loadAppliedCoupon();
  }, []);

  useEffect(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalItems);
    const regularItems = cartItems.filter((item) => !item.isFreeGift);
    const gifts = cartItems.filter((item) => item.isFreeGift);
    setFreeGifts(gifts);

    const regularTotal = regularItems.reduce(
      (sum, item) => sum + getEffectivePrice(item) * item.quantity,
      0
    );
    setRegularItemsTotal(regularTotal);

    const total = cartItems.reduce(
      (sum, item) => sum + (item.isFreeGift ? 0 : getEffectivePrice(item)) * item.quantity,
      0
    );
    setCartTotal(total);

    checkFreeGiftEligibility(regularTotal);
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon && cartTotal > 0) {
      updateCouponDiscount(cartTotal);
    } else if (!appliedCoupon) {
      setCurrentDiscountAmount(0);
    }
  }, [cartTotal, appliedCoupon?.code]);

  const checkFreeGiftEligibility = async (regularTotal) => {
    try {
      const eligibilityData = await CartService.getFreeGiftEligibility(regularTotal);
      if (eligibilityData && eligibilityData.products) {
        setFreeGiftOptions(eligibilityData.products);
        setEligibleGiftCount(eligibilityData.eligibleGiftCount || 0);
        if (freeGifts.length > eligibilityData.eligibleGiftCount) {
          const giftsToRemove = freeGifts.slice(eligibilityData.eligibleGiftCount);
          for (const gift of giftsToRemove) {
            await removeLocalFreeGift(gift.id);
          }
        }
      }
    } catch (error) {
      console.error("Error checking free gift eligibility:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const fetchCartDataFromBackend = async () => {
    if (productMap.size === 0) {
        console.log("Product map not ready yet, delaying cart fetch...");
        setTimeout(fetchCartDataFromBackend, 500);
        return;
    }
    if (Object.keys(pendingCartOps).length > 0) return;

    try {
      setError(null);
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) return setLoading(false);
      
      const token = await currentUser.getIdToken();
      const cartData = await CartService.getCartData(token);

      if (cartData && cartData.items && Object.keys(cartData.items).length > 0) {
        const foodIds = Object.keys(cartData.items);
        
        const itemsArray = foodIds.map(foodId => {
          const productDetails = productMap.get(foodId);
          const quantity = cartData.items[foodId];

          if (productDetails) {
            return {
              ...productDetails,
              quantity,
            };
          }
          return { id: foodId, name: `Product ${foodId.substring(0, 8)}...`, price: 0, quantity, imageUrl: null };
        }).filter(Boolean);

        setCartItems(itemsArray);
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setError("Failed to load cart data");
      console.error("Failed to load cart data:", e);
    } finally {
      setLoading(false);
    }
  };
 
  const debounceScheduleCartSync = () => {
    if (cartUpdateTimer.current) clearTimeout(cartUpdateTimer.current);
    cartUpdateTimer.current = setTimeout(() => {
      if (!isSyncingRef.current) {
        processPendingCartOps();
      } else {
        debounceScheduleCartSync();
      }
    }, 400);
  };

  const processPendingCartOps = async () => {
    if (!user) {
      await AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
      setPendingCartOps({});
      pendingCartOpsRef.current = {};
      return;
    }

    const opsToSend = { ...pendingCartOpsRef.current };
    if (!Object.keys(opsToSend).length) return;
    setPendingCartOps({});
    pendingCartOpsRef.current = {};
    isSyncingRef.current = true;
    const adds = {};
    const subtracts = {};

    Object.entries(opsToSend).forEach(([id, change]) => {
      if (change > 0) adds[id] = change;
      else if (change < 0) subtracts[id] = -change;
    });

    try {
      const token = await auth().currentUser.getIdToken();
      if (Object.keys(adds).length > 0) {
        await CartService.addMultipleFoods(adds, token);
      }
      if (Object.keys(subtracts).length > 0) {
        await CartService.subtractMultipleFoods(subtracts, token);
      }
    } catch (err) {
      setError("Cart sync failed, retrying...");
      setPendingCartOps((prev) => {
        const merged = { ...prev };
        Object.entries(opsToSend).forEach(([id, change]) => {
          merged[id] = (merged[id] || 0) + change;
          if (merged[id] === 0) delete merged[id];
        });
        return merged;
      });
      debounceScheduleCartSync();
    } finally {
      isSyncingRef.current = false;
    }
  };

  const addItemToCart = (product) => {
    setError(null);
    if (!product || !product.id) {
        console.error("Attempted to add an invalid product to cart:", product);
        return;
    }
    const productDetails = productMap.get(product.id) || product;

    // --- ✅ ADD TO CART EVENT (FIXED) ---
    try {
      analytics().logEvent('add_to_cart', { // <-- `logEvent` use kiya
        currency: 'INR',
        value: getEffectivePrice(productDetails),
        items: [
          {
            item_id: productDetails.id,
            item_name: productDetails.name,
            item_category: productDetails.category ? productDetails.category[0] : 'N/A', // Assuming category is an array
            price: getEffectivePrice(productDetails),
            quantity: 1 
          }
        ]
      });
    } catch (analyticsError) {
      console.error("Analytics Error (add_to_cart):", analyticsError);
    }
    // --- END ---

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productDetails.id);
      if (existing) {
        return prev.map((item) =>
          item.id === productDetails.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [ ...prev, { ...productDetails, quantity: 1 } ];
    });

    setPendingCartOps((ops) => ({
      ...ops,
      [productDetails.id]: (ops[productDetails.id] || 0) + 1,
    }));
    debounceScheduleCartSync();
  };

  const removeItemFromCart = (product) => {
    setError(null);
    if (!product || !product.id) {
        console.error("Attempted to remove an invalid product from cart:", product);
        return;
    }
    
    const productDetails = productMap.get(product.id) || product;
    if (!productDetails) return; 

    // --- ✅ REMOVE FROM CART EVENT (FIXED) ---
    try {
      analytics().logEvent('remove_from_cart', { // <-- `logEvent` use kiya
        currency: 'INR',
        value: getEffectivePrice(productDetails),
        items: [
          {
            item_id: productDetails.id,
            item_name: productDetails.name,
            item_category: productDetails.category ? productDetails.category[0] : 'N/A',
            price: getEffectivePrice(productDetails),
            quantity: 1 
          }
        ]
      });
    } catch (analyticsError) {
      console.error("Analytics Error (remove_from_cart):", analyticsError);
    }
    // --- END ---

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing?.quantity > 1) {
          return prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
          );
      }
      return prev.filter((item) => item.id !== product.id);
    });

    setPendingCartOps((ops) => ({
      ...ops,
      [product.id]: (ops[product.id] || 0) - 1,
    }));
    debounceScheduleCartSync();
  };

  const fetchCartDataFromStorage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AsyncStorage.getItem("guestCart");
      setCartItems(data ? JSON.parse(data) : []);
    } catch {
      setError("Failed to load cart data");
    } finally {
      setLoading(false);
    }
  };

  const mergeGuestCartWithBackend = async () => {
    try {
      const guestCartData = await AsyncStorage.getItem("guestCart");
      if (!guestCartData) return;
      const guestCart = JSON.parse(guestCartData);
      if (!guestCart.length) return;

      const currentUser = auth().currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const itemsToAdd = guestCart.reduce((acc, item) => {
          acc[item.id] = item.quantity;
          return acc;
      }, {});

      if(Object.keys(itemsToAdd).length > 0) {
        await CartService.addMultipleFoods(itemsToAdd, token);
      }
      await AsyncStorage.removeItem("guestCart");
    } catch (err) {
      console.warn("Failed to merge guest cart with backend", err);
    }
  };

  const getItemQuantity = (productId) => cartItems.find((item) => item.id === productId)?.quantity || 0;

  const clearCart = async () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCurrentDiscountAmount(0);
    await AsyncStorage.removeItem("appliedCoupon");
    if (user) {
        // You might want a backend call to clear the cart here
    } else {
      await AsyncStorage.removeItem("guestCart");
    }
  };

  const calculateDeliveryCharge = () => billingQuote.delivery_charge || 0;
  const calculateHandlingCharge = () => billingQuote.handling_charge || 0;
  const getGstAmount = () => billingQuote.gst_total || 0;

  const calculateGrandTotal = () => {
    const subtotalWithCoupon = getCartTotalWithCoupon();
    const delivery = calculateDeliveryCharge();
    const handling = calculateHandlingCharge();
    const gst = getGstAmount();
    return subtotalWithCoupon + delivery + handling + gst;
  };

  const calculateSavings = () => {
    const STANDARD_DELIVERY_CHARGE = 40.0;
    const currentDeliveryCharge = calculateDeliveryCharge();
    const deliverySavings = (currentDeliveryCharge === 0 && cartTotal > 0) ? STANDARD_DELIVERY_CHARGE : 0;

    const couponDiscount = getCurrentDiscountAmount();
    const productSavings = cartItems.reduce((total, item) => {
      if (!item.isFreeGift && item.discountPercent > 0) {
        return total + ((item.price - (item.discountedPrice || item.price)) * item.quantity);
      }
      return total;
    }, 0);
    return productSavings + deliverySavings + couponDiscount;
  };

  useEffect(() => {
    if (user) {
      (async () => {
          await mergeGuestCartWithBackend();
          await fetchCartDataFromBackend();
      })();
    } else {
      fetchCartDataFromStorage();
    }
  }, [user, productMap]);

  return (
    <CartContext.Provider
      value={{
        cartItems, cartCount, cartTotal, loading, error, addItemToCart, removeItemFromCart, getItemQuantity,
        clearCart, refreshCart: user ? fetchCartDataFromBackend : fetchCartDataFromStorage,
        regularItemsTotal, getEffectivePrice, getOriginalPrice,
        calculateDeliveryCharge,
        calculateHandlingCharge,
        calculateGrandTotal,
        calculateSavings,
        getGstAmount,
        billingQuote,
        appliedCoupon, removeCoupon: (isAutoRemoval = false) => {
          if (isAutoRemoval && appliedCoupon) {
            setError(`Coupon removed: No longer valid for current cart`);
            setTimeout(() => setError(null), 5000);
          }
          setAppliedCoupon(null);
          setCurrentDiscountAmount(0);
          AsyncStorage.removeItem("appliedCoupon");
        },
        applyCoupon: async (couponData) => {
          const couponWithMinimum = {...couponData, minOrderValue: couponData.minOrderValue || 0};
          setAppliedCoupon(couponWithMinimum);
          setCurrentDiscountAmount(couponData.discount || 0);
          AsyncStorage.setItem("appliedCoupon", JSON.stringify(couponWithMinimum));
          setError(null);
        },
        getCartTotalWithCoupon,
        getCurrentDiscountAmount, clearError: () => setError(null),
        freeGifts,
        freeGiftOptions, eligibleGiftCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};