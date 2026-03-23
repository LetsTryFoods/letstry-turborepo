

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CartService from "../services/CartService";
import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";
import auth from "@react-native-firebase/auth";
import CouponService from "../services/CouponService";
import { chargesService } from "../services/ChargesService";
import analytics from '@react-native-firebase/analytics';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // State
  const [cartItems, setCartItems] = useState([]);
  const [rawBackendCart, setRawBackendCart] = useState({}); // { id: qty }
  const [loading, setLoading] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Data
  const [productMap, setProductMap] = useState(new Map());
  
  // Hooks
  const { user } = useAuth();
  const { selectedAddress } = useAddress();

  // Logic State
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
  
  // Sync
  const [pendingCartOps, setPendingCartOps] = useState({});
  const pendingCartOpsRef = useRef({});
  const cartUpdateTimer = useRef(null);
  const isSyncingRef = useRef(false);

  // Sync ref
  useEffect(() => {
    pendingCartOpsRef.current = pendingCartOps;
  }, [pendingCartOps]);

  // ==========================================
  // 1. INITIAL SETUP: Products
  // ==========================================
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        if (productMap.size > 0) return;
        
        console.log("Fetching all products...");
        const [foods, giftboxes, combos] = await Promise.all([
            fetch('https://apiv2.letstryfoods.com/api/foods').then(res => res.json()),
            fetch('https://apiv2.letstryfoods.com/api/giftboxes').then(res => res.json()),
            fetch('https://apiv2.letstryfoods.com/api/combos').then(res => res.json())
        ]);
        
        const allProducts = [
          ...(Array.isArray(foods) ? foods : []),
          ...(Array.isArray(giftboxes) ? giftboxes : []),
          ...(Array.isArray(combos) ? combos : [])
        ];
        
        const newMap = new Map(allProducts.map(p => [p.id, p]));
        setProductMap(newMap);
        setProductsLoaded(true);
        console.log(`✅ Product catalog loaded: ${newMap.size} items.`);
      } catch (err) {
        console.error("Failed to fetch product catalog:", err);
        setProductsLoaded(true); // Proceed anyway to avoid locking app
      }
    };
    fetchAllProducts();
  }, []);

  // ==========================================
  // 2. MASTER LOGIC: Guest vs User Merge
  // ==========================================
  useEffect(() => {
    if (!productsLoaded) return; // Wait for products

    const initializeCart = async () => {
      setLoading(true);
      if (user) {
        await handleUserLogin();
      } else {
        await loadGuestCart();
      }
      setLoading(false);
    };

    initializeCart();
  }, [user, productsLoaded]);

  const loadGuestCart = async () => {
    try {
      const stored = await AsyncStorage.getItem("guestCart");
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error("Guest load error", e);
    }
  };

  const handleUserLogin = async () => {
    try {
      // 1. Check if guest items exist
      const guestCartJson = await AsyncStorage.getItem("guestCart");
      const guestCart = guestCartJson ? JSON.parse(guestCartJson) : [];

      if (guestCart.length > 0) {
        // Prepare items for API { id: qty }
        const itemsToMerge = guestCart.reduce((acc, item) => {
          acc[item.id] = item.quantity;
          return acc;
        }, {});

        const currentUser = auth().currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken();
          // 2. Attempt Merge API - If this throws, we catch it and DO NOT delete guestCart
          await CartService.addMultipleFoods(itemsToMerge, token);
          // 3. Success -> Clear local guest cart
          await AsyncStorage.removeItem("guestCart");
        }
      }
      // 4. Fetch authoritative server cart
      await fetchCartDataFromBackend();
    } catch (err) {
      console.error("Merge failed:", err);
      setError("Sync failed. Please check internet.");
      // Fallback: If merge fails, we still try to load backend cart so user sees something
      await fetchCartDataFromBackend();
    }
  };

  const fetchCartDataFromBackend = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const data = await CartService.getCartData(token);
      
      if (data && data.items) {
        setRawBackendCart(data.items);
      } else {
        setRawBackendCart({});
      }
    } catch (e) {
      console.error("Fetch backend cart error:", e);
    }
  };

  // ==========================================
  // 3. BUILD UI ITEMS (Raw Data + Products)
  // ==========================================
  useEffect(() => {
    if (user && productsLoaded) {
      const foodIds = Object.keys(rawBackendCart);
      const builtItems = foodIds.map(id => {
        const details = productMap.get(id);
        const qty = rawBackendCart[id];
        if (details) return { ...details, quantity: qty };
        // Fallback for unknown items
        return { id, name: "Unknown Item", price: 0, quantity: qty };
      });
      setCartItems(builtItems);
    }
  }, [rawBackendCart, productMap, user, productsLoaded]);

  // ==========================================
  // 4. GUEST SAVING (Strict Logic)
  // ==========================================
  useEffect(() => {
    // Only save to storage if NO USER. 
    // This prevents overwriting guestCart with server data.
    if (!user && productsLoaded) {
      AsyncStorage.setItem("guestCart", JSON.stringify(cartItems));
    }
  }, [cartItems, user, productsLoaded]);


  // ==========================================
  // 5. BILLING & TOTALS (Preserved Logic)
  // ==========================================
  
  // Helper
  const getEffectivePrice = (product) =>
    product.discountPercent && product.discountPercent > 0
      ? product.discountedPrice || product.price
      : product.price;

  const getOriginalPrice = (product) => product.price;

  // Calculate Totals & Free Gifts
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

  const checkFreeGiftEligibility = async (regularTotal) => {
    try {
      const eligibilityData = await CartService.getFreeGiftEligibility(regularTotal);
      if (eligibilityData && eligibilityData.products) {
        setFreeGiftOptions(eligibilityData.products);
        setEligibleGiftCount(eligibilityData.eligibleGiftCount || 0);
        
        // Remove excess gifts if threshold dropped
        if (freeGifts.length > eligibilityData.eligibleGiftCount) {
          const giftsToRemove = freeGifts.slice(eligibilityData.eligibleGiftCount);
          for (const gift of giftsToRemove) {
            // We use the simpler remove logic here since gifts aren't usually async synced the same way
             removeItemFromCart(gift);
          }
        }
      }
    } catch (error) {
      console.error("Error checking free gift eligibility:", error);
    }
  };

  // Billing API
  useEffect(() => {
    const updateBillingDetails = async () => {
      if (user && selectedAddress?.state && selectedAddress?.pincode && cartTotal > 0) {
        try {
          const quote = await chargesService.getBillCharges(
            cartTotal,
            selectedAddress.state,
            selectedAddress.pincode
          );
          setBillingQuote({
            delivery_charge: quote.deliveryCharge || 0,
            handling_charge: quote.handlingCharge || 0,
            gst_total: quote.gstAmount || 0,
            message: quote.message || null,
          });
        } catch (err) {
          setBillingQuote({ delivery_charge: 0, handling_charge: 0, gst_total: 0, message: null });
        }
      } else {
        setBillingQuote({ delivery_charge: 0, handling_charge: 0, gst_total: 0, message: null });
      }
    };
    updateBillingDetails();
  }, [cartTotal, selectedAddress, user]);


  // ==========================================
  // 6. SYNC QUEUE (Debounced)
  // ==========================================
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
      setPendingCartOps({});
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
      else if (change < 0) subtracts[id] = Math.abs(change);
    });

    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        if (Object.keys(adds).length > 0) await CartService.addMultipleFoods(adds, token);
        if (Object.keys(subtracts).length > 0) await CartService.subtractMultipleFoods(subtracts, token);
      }
    } catch (err) {
      console.error("Sync failed", err);
      // Logic to retry could go here
    } finally {
      isSyncingRef.current = false;
    }
  };


  // ==========================================
  // 7. ACTIONS (Add/Remove) - Optimistic
  // ==========================================

  const addItemToCart = useCallback((product) => {
    setError(null);
    if (!product || !product.id) return;
    const pId = String(product.id);
    const productDetails = productMap.get(pId) || product;

    // --- Analytics ---
    try {
      analytics().logEvent('add_to_cart', {
        currency: 'INR',
        value: getEffectivePrice(productDetails),
        items: [{
          item_id: productDetails.id,
          item_name: productDetails.name,
          item_category: productDetails.category ? productDetails.category[0] : 'N/A',
          price: getEffectivePrice(productDetails),
          quantity: 1 
        }]
      });
    } catch (e) { console.log(e) }
    // -----------------

    // Optimistic UI
    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.id) === pId);
      if (existing) {
        return prev.map((item) => String(item.id) === pId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [ ...prev, { ...productDetails, quantity: 1 } ];
    });

    // Queue Server Op
    if (user) {
      setPendingCartOps((ops) => ({ ...ops, [pId]: (ops[pId] || 0) + 1 }));
      debounceScheduleCartSync();
    }
  }, [user, productMap]);

  const removeItemFromCart = useCallback((product) => {
    setError(null);
    if (!product || !product.id) return;
    const pId = String(product.id);
    const productDetails = productMap.get(pId) || product;

    // --- Analytics ---
    try {
      if(productDetails) {
        analytics().logEvent('remove_from_cart', {
          currency: 'INR',
          value: getEffectivePrice(productDetails),
          items: [{
            item_id: productDetails.id,
            item_name: productDetails.name,
            item_category: productDetails.category ? productDetails.category[0] : 'N/A',
            price: getEffectivePrice(productDetails),
            quantity: 1 
          }]
        });
      }
    } catch (e) { console.log(e) }
    // -----------------

    // Optimistic UI
    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.id) === pId);
      if (existing?.quantity > 1) {
          return prev.map((item) => String(item.id) === pId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter((item) => String(item.id) !== pId);
    });

    // Queue Server Op
    if (user) {
      setPendingCartOps((ops) => ({ ...ops, [pId]: (ops[pId] || 0) - 1 }));
      debounceScheduleCartSync();
    }
  }, [user, productMap]);

  const getItemQuantity = (productId) => cartItems.find((item) => item.id === productId)?.quantity || 0;

  const clearCart = async () => {
    setCartItems([]);
    setRawBackendCart({});
    setAppliedCoupon(null);
    setCurrentDiscountAmount(0);
    await AsyncStorage.removeItem("appliedCoupon");
    if (!user) await AsyncStorage.removeItem("guestCart");
  };


  // ==========================================
  // 8. COUPONS & HELPERS
  // ==========================================
  
  // Coupon Effects
  useEffect(() => {
    if (appliedCoupon && cartTotal > 0) {
      updateCouponDiscount(cartTotal);
    } else if (!appliedCoupon) {
      setCurrentDiscountAmount(0);
    }
  }, [cartTotal, appliedCoupon?.code]);

  useEffect(() => {
    const loadAppliedCoupon = async () => {
      try {
        const storedCoupon = await AsyncStorage.getItem("appliedCoupon");
        if (storedCoupon) {
          const coupon = JSON.parse(storedCoupon);
          setAppliedCoupon(coupon);
          setCurrentDiscountAmount(coupon.discount || 0);
        }
      } catch {}
    };
    loadAppliedCoupon();
  }, []);

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
    } catch {}
  };

  const removeCoupon = (isAutoRemoval = false) => {
    if (isAutoRemoval && appliedCoupon) {
      setError(`Coupon removed: No longer valid`);
      setTimeout(() => setError(null), 5000);
    }
    setAppliedCoupon(null);
    setCurrentDiscountAmount(0);
    AsyncStorage.removeItem("appliedCoupon");
  };

  const getCartTotalWithCoupon = () => Math.max(0, cartTotal - (currentDiscountAmount || 0));
  const getCurrentDiscountAmount = () => currentDiscountAmount || 0;

  const calculateDeliveryCharge = () => billingQuote.delivery_charge || 0;
  const calculateHandlingCharge = () => billingQuote.handling_charge || 0;
  const getGstAmount = () => billingQuote.gst_total || 0;

  const calculateGrandTotal = () => {
    return getCartTotalWithCoupon() + calculateDeliveryCharge() + calculateHandlingCharge() + getGstAmount();
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

  return (
    <CartContext.Provider
      value={{
        cartItems, cartCount, cartTotal, 
        loading: loading || !productsLoaded, 
        error, 
        addItemToCart, removeItemFromCart, getItemQuantity,
        clearCart, 
        refreshCart: user ? fetchCartDataFromBackend : loadGuestCart,
        regularItemsTotal, getEffectivePrice, getOriginalPrice,
        calculateDeliveryCharge, calculateHandlingCharge, calculateGrandTotal, calculateSavings, getGstAmount,
        billingQuote,
        appliedCoupon, removeCoupon,
        applyCoupon: async (couponData) => {
          const couponWithMinimum = {...couponData, minOrderValue: couponData.minOrderValue || 0};
          setAppliedCoupon(couponWithMinimum);
          setCurrentDiscountAmount(couponData.discount || 0);
          AsyncStorage.setItem("appliedCoupon", JSON.stringify(couponWithMinimum));
          setError(null);
        },
        getCartTotalWithCoupon, getCurrentDiscountAmount, 
        clearError: () => setError(null),
        freeGifts, freeGiftOptions, eligibleGiftCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};