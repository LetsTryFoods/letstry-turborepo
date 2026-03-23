
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useAddress } from "../context/AddressContext";
import RangeCategoryCard from "../components/RangeCategoryCard";
import RecommendationsSheet from "../components/RecommendationSheet";
import { fetchFBTRecommendations } from "../services/RecommendationService";
import AddressBookModal from "../components/AddressBookModal";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import LoadingComponent from '../components/SheetShimmer';
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useQuery } from "@tanstack/react-query";

// --- ✅ NAYE IMPORTS ---
import { useIsFocused } from '@react-navigation/native';
import analytics from '@react-native-firebase/analytics';
// --- END ---

const { height } = Dimensions.get("window");

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

const CardSection = ({ children, style }) => (
  <View style={[styles.cardSection, style]}>{children}</View>
);

const CartItem = React.memo(({ item, onAddItem, onRemoveItem, onNavigate }) => (
    <View style={styles.cartItem}>
      <View
        style={styles.productContainer}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            defaultSource={require("../assets/images/product4.png")}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.productInfo}>
          <Text allowFontScaling={false} numberOfLines={2} style={styles.productName}>{item.name}</Text>
          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.productWeight}>{item.unit}</Text>

          <View>
            {item.discountPercent && item.discountPercent > 0 && (
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.discountPercent}>
                {item.discountPercent}% OFF
              </Text>
            )}
          </View>

          <View style={styles.priceRow}>
            {item.discountPercent && item.discountPercent > 0 ? (
              <>
                <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.originalPrice}>₹{item.price}</Text>
                <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.discountedPrice}>₹{item.discountedPrice || item.price}</Text>
              </>
            ) : (
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.productPrice}>₹{item.price}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.quantityAndActions}>
        {!item.isFreeGift ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onRemoveItem(item)}
              activeOpacity={0.7}
            >
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.quantityValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => onAddItem(item)}
              activeOpacity={0.7}
            >
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.freeGiftTag}>
            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.freeGiftTagText}>FREE GIFT</Text>
          </View>
        )}
      </View>
    </View>
));


const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    cartItems,
    cartTotal,
    loading,
    error,
    addItemToCart,
    removeItemFromCart,
    refreshCart,
    appliedCoupon,
    removeCoupon,
    calculateGrandTotal,
    calculateSavings,
    getCartTotalWithCoupon,
    getGstAmount,
    calculateDeliveryCharge,
    calculateHandlingCharge,
    // ✅ getEffectivePrice ko context se le rahe hain
    getEffectivePrice, 
  } = useCart();

  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { selectedAddress, selectAddress } = useAddress();

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [showAllFBT, setShowAllFBT] = useState(false);
  const [billDetailsExpanded, setBillDetailsExpanded] = useState(false);
  const [isGstInfoVisible, setIsGstInfoVisible] = useState(false);

  const isFbtAction = useRef(false);

  // --- ✅ NAYE HOOKS ---
  const isFocused = useIsFocused();
  const hasLoggedViewCart = useRef(false);
  // --- END ---

  const cartSignature = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return null;
    return cartItems
      .map(item => `${item.ean_code || item.eanCode || item.id}:${item.quantity}`)
      .sort()
      .join("|");
  }, [cartItems]);

  const [fbtQuerySignature, setFbtQuerySignature] = useState(cartSignature);

  useEffect(() => {
    if (!isFbtAction.current) {
      setFbtQuerySignature(cartSignature);
    }
    isFbtAction.current = false;
  }, [cartSignature]);

  const { data: cartFBTRecommendations = [], isLoading: loadingFBT } = useQuery({
    queryKey: ['fbtRecommendations', fbtQuerySignature],
    queryFn: () => {
        if (!fbtQuerySignature) return [];
        const cartItemsForApi = {};
        cartItems.forEach(item => {
            const ean = item.ean_code || item.eanCode || item.id;
            if (ean) {
                cartItemsForApi[String(ean)] = item.quantity;
            }
        });
        return fetchFBTRecommendations(cartItemsForApi);
    },
    enabled: !!fbtQuerySignature,
    placeholderData: (previousData) => previousData,
  });

  // --- ✅ NAYA useEffect `view_cart` EVENT KE LIYE ---
  useEffect(() => {
    // Yeh check karta hai ki user abhi is screen par hai ya nahi
    if (isFocused) {
      // Agar screen focused hai
      if (!loading && !hasLoggedViewCart.current) {
        // Aur cart loading nahi ho raha hai, aur humne is focus ke liye log nahi kiya hai
        
        // 1. Analytics ke liye items array taiyaar karo
        const itemsForAnalytics = cartItems.map(item => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category && item.category.length > 0 ? item.category[0] : 'N/A',
          price: getEffectivePrice(item),
          quantity: item.quantity
        }));

        // 2. Event log karo
        analytics().logViewCart({
          currency: 'INR',
          value: cartTotal,
          items: itemsForAnalytics
        });
        
        // 3. Mark karo ki humne log kar diya hai (taaki refresh karne par dobara na ho)
        hasLoggedViewCart.current = true;
      }
    } else {
      // Jab user screen se hat jaayega, toh ref ko reset kardo
      // Taaki agli baar waapas aane par event firse log ho sake
      hasLoggedViewCart.current = false;
    }
    // Yeh dependencies important hain
  }, [isFocused, loading, cartItems, cartTotal, getEffectivePrice]); 
  // --- END `view_cart` EVENT ---


  const handleFbtAddToCart = useCallback((product) => {
    isFbtAction.current = true;
    addItemToCart(product);
  }, [addItemToCart]);

  const handleFbtRemoveFromCart = useCallback((product) => {
    isFbtAction.current = true;
    removeItemFromCart(product);
  }, [removeItemFromCart]);

  const handleCartItemAdd = useCallback((item) => {
    addItemToCart(item);
  }, [addItemToCart]);

  const handleCartItemRemove = useCallback((item) => {
    removeItemFromCart(item);
  }, [removeItemFromCart]);
 
  const handleProductPress = useCallback((productId) => {
    navigation.navigate("ProductDetails", { productId });
  }, [navigation]);

  const slideAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    if (showAllFBT) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 7 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }).start();
    }
  }, [showAllFBT, slideAnim]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      refreshCart();
    });
    return unsubscribe;
  }, [navigation, refreshCart]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  }, [refreshCart]);

  const toggleBillDetails = () => setBillDetailsExpanded(prev => !prev);

  const memoizedFBTRecommendations = useMemo(() => {
    if (loadingFBT && !cartFBTRecommendations.length) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingComponent
            visible={true}
            message="Loading products..."
            size={800}
          />
        </View>
      )
    }
    if (!cartFBTRecommendations || cartFBTRecommendations.length === 0) return null;

    const displayProducts = cartFBTRecommendations.slice(0, 6);
    return (
      <View style={styles.recommendationsContainer}>
        <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.recommendationsTitle}>Crave for More !</Text>
        <View style={styles.recommendationsGrid}>
          {displayProducts.map(product => (
            <View key={product.ean_code || product.id} style={styles.recommendationCardContainer}>
              <RangeCategoryCard
                product={product}
                onPress={() => navigation.navigate("ProductDetails", { productId: product.id })}
                onAddToCart={() => handleFbtAddToCart(product)}
                onRemoveFromCart={() => handleFbtRemoveFromCart(product)}
              />
            </View>
          ))}
        </View>
        {cartFBTRecommendations.length > 6 && (
          <TouchableOpacity
            style={[styles.seeAllButton, styles.seeAllButtonWithBorder]}
            onPress={() => setShowAllFBT(true)}
          >
            <View style={styles.seeAllButtonContent}>
              <View style={styles.productImagesContainer}>
                {cartFBTRecommendations.slice(0, 3).map((product, index) => (
                  <View
                    key={`preview-${product.id || index}`}
                    style={[
                      styles.imageWrapper,
                      {
                        zIndex: 10 - index,
                        marginLeft: index === 0 ? 0 : wp(-2.5),
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: product.imageUrl }}
                      defaultSource={require("../assets/images/product4.png")}
                      style={styles.productPreviewImage}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </View>
              <Text allowFontScaling={false} style={styles.seeAllText}>
                See all products
              </Text>
              <Image
                source={require("../assets/images/right.png")}
                style={styles.rightImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        )}
        <RecommendationsSheet
          visible={showAllFBT}
          onClose={() => setShowAllFBT(false)}
          products={cartFBTRecommendations}
          onProductPress={(product) => {
            setShowAllFBT(false);
            navigation.navigate("ProductDetails", { productId: product.id });
          }}
          addItemToCart={handleFbtAddToCart}
          removeItemFromCart={handleFbtRemoveFromCart}
        />
      </View>
    );
  }, [loadingFBT, cartFBTRecommendations, showAllFBT, navigation, handleFbtAddToCart, handleFbtRemoveFromCart]);

  const memoizedCouponSection = useMemo(() => {
    if (appliedCoupon) {
      return (
      <TouchableOpacity
      onPress={() => navigation.navigate("CouponScreen")}
      >
        <View style={styles.appliedCouponContainer}>
          <View style={styles.appliedCouponLeft}>
            <Icon name="local-offer" size={16} color="#4A90E2" style={styles.appliedCouponIcon} />
            <View>
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.appliedCouponCode}>Coupon Applied: {appliedCoupon.code}</Text>
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.appliedCouponMessage}>{appliedCoupon.message}</Text>
            </View>
          </View>
          <View style={styles.appliedCouponRight}>
            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.appliedCouponDiscount}>-₹{appliedCoupon.discount.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => removeCoupon(false)} style={styles.removeCouponButton}>
              <Icon name="delete" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.couponSection}
        onPress={() => navigation.navigate("CouponScreen")}
      >
        <View style={styles.couponLeft}>
          <View style={styles.couponIcon}>
            <Icon name="local-offer" size={16} color="#666" style={styles.billItemIcon} />
          </View>
          <View>
            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.couponText}>Coupons</Text>
            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.couponSubtext}>Best coupons for you</Text>
          </View>
        </View>
        <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.couponArrow}>›</Text>
      </TouchableOpacity>
    );
  }, [appliedCoupon, navigation, removeCoupon]);

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.emptyCartText}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.continueShopping}
        onPress={() => navigation.navigate("MainApp", { screen: "Categories" })}
      >
        <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.continueShoppingText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );

 const memoizedAddressBar = useMemo(() => {
    if (user && selectedAddress) {
      let iconSource;
      const lower = (selectedAddress.label || "").toLowerCase();

      if (lower.includes("home")) {
        iconSource = require("../assets/icons/home.png");
      } else if (lower.includes("office") || lower.includes("work")) {
        iconSource = require("../assets/icons/office.png");
      } else if (lower.includes("flat")) {
        iconSource = require("../assets/icons/flat.png");
      } else {
        iconSource = require("../assets/icons/other.png");
      }

      return (
        <View style={styles.addressBar}>
          <View style={styles.addressInfo}>
            <View style={styles.iconBox}>
              <Image source={iconSource} style={styles.iconImage} />
            </View>
            <View>
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.addressLabel}>
                Delivering to <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={{ fontWeight: "bold" }}>{selectedAddress.label || "Home"}</Text>
              </Text>
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.addressText}>{selectedAddress && selectedAddress.addressId
                ? `${selectedAddress.buildingName}, ${selectedAddress.street}`
                : "Select Address"}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  }, [user, selectedAddress]);

  // --- ✅ `begin_checkout` EVENT YAHAN HAI ---
  const handleCheckout = () => {
    if (!user) {
      navigation.navigate("Login", { fromCheckout: true });
      return;
    }
    if (!selectedAddress) {
      setAddressModalVisible(true);
      return;
    }

    // 1. Analytics ke liye items array taiyaar karo
    const itemsForAnalytics = cartItems.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category && item.category.length > 0 ? item.category[0] : 'N/A',
      price: getEffectivePrice(item),
      quantity: item.quantity
    }));
    
    // 2. Event log karo
    try {
      analytics().logBeginCheckout({
        currency: 'INR',
        value: cartTotal, // Yeh subtotal hai (coupon se pehle)
        coupon: appliedCoupon ? appliedCoupon.code : undefined,
        items: itemsForAnalytics
      });
    } catch (analyticsError) {
      console.error("Analytics Error (logBeginCheckout):", analyticsError);
    }
    // --- END ---

    navigation.navigate('PaymentScreen');
  };
  // --- END `begin_checkout` ---

  const handleAddressSelect = (address) => {
    selectAddress(address);
    setAddressModalVisible(false);
  };

  const handleNavigateToAddAddress = () => {
    setAddressModalVisible(false);
    setTimeout(() => {
        navigation.navigate("AddAddressScreen");
    }, 150);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <GradientHeader
        title="Checkout"
        onBack={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "MainApp" }],
          })
        }
        onSearch={() => navigation.navigate("Search")}
        insets={insets}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidView}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <LoadingComponent
              visible={loading}
              message="Loading products..."
              size={160}
            />
          </View>
        ) : error && !error.includes("Coupon removed") ? (
          <View style={styles.errorContainer}>
            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshCart}>
              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
              {cartItems.length === 0 ? (
                renderEmptyCart()
              ) : (
                <CardSection>
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id || item.ean_code}
                      item={item}
                      onAddItem={handleCartItemAdd}
                      onRemoveItem={handleCartItemRemove}
                      onNavigate={handleProductPress}
                    />
                  ))}
                </CardSection>
              )}
              {cartItems.length > 0 && (
                <CardSection>
                  {memoizedFBTRecommendations}
                </CardSection>
              )}
              {cartItems.length > 0 && (
                <CardSection>
                  {memoizedCouponSection}
                </CardSection>
              )}
              {cartItems.length > 0 && (
                <CardSection>
                  <TouchableOpacity style={styles.billDetailsHeader} onPress={toggleBillDetails}>
                    <View style={styles.billDetailsLeft}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billTitle}>Bill details</Text>
                    </View>
                    <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.billArrow, billDetailsExpanded && styles.billArrowExpanded]}>›</Text>
                  </TouchableOpacity>
                  {billDetailsExpanded && (
                    <View style={styles.billDetails}>
                      <View style={styles.billRow}>
                        <View style={styles.billItem}>
                          <Icon name="receipt" size={16} color="#666" style={styles.billItemIcon} />
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemText}>Items total</Text>
                        </View>
                        <View style={styles.billPriceContainer}>
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemPrice}>₹{cartTotal.toFixed(2)}</Text>
                        </View>
                      </View>
                      {appliedCoupon && (
                        <View style={styles.billRow}>
                          <View style={styles.billItem}>
                            <Icon name="local-offer" size={16} color="#4A90E2" style={styles.billItemIcon} />
                            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemText}>Coupon Discount ({appliedCoupon.code})</Text>
                          </View>
                          <View style={styles.billPriceContainer}>
                            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemDiscountPrice}>-₹{appliedCoupon.discount}</Text>
                          </View>
                        </View>
                      )}
                      <View style={styles.billRow}>
                        <View style={styles.billItem}>
                          <Icon name="receipt" size={16} color="#666" style={styles.billItemIcon} />
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemText}>Subtotal</Text>
                        </View>
                        <View style={styles.billPriceContainer}>
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemPrice}>₹{getCartTotalWithCoupon().toFixed(2)}</Text>
                        </View>
                      </View>
                      <View style={styles.billRow}>
                        <View style={styles.billItem}>
                          <Icon name="local-shipping" size={16} color="#666" style={styles.billItemIcon} />
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemText}>Delivery Charge</Text>
                        </View>
                        <View style={styles.billPriceContainer}>
                          {calculateDeliveryCharge() === 0 && cartTotal > 0 ? (
                            <>
                              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemMrp}>₹40.00</Text>
                              <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemPrice}>FREE</Text>
                            </>
                          ) : (
                            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemPrice}>₹{calculateDeliveryCharge().toFixed(2)}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.billRow}>
                        <View style={styles.billItem}>
                          <Icon name="work" size={16} color="#666" style={styles.billItemIcon} />
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemText}>Handling Charge</Text>
                        </View>
                        <View style={styles.billPriceContainer}>
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemPrice}>₹{calculateHandlingCharge().toFixed(2)}</Text>
                        </View>
                      </View>
                      <View>
                        <View style={styles.billRow}>
                          <View style={styles.billItem}>
                            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemText}>Taxes & Charges</Text>
                            <TouchableOpacity
                              onPress={() => setIsGstInfoVisible(!isGstInfoVisible)}
                              style={styles.infoButton}
                            >
                              <Icon name="info-outline" size={16} color="#4A90E2" />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.billPriceContainer}>
                            <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.billItemPrice}>
                              ₹{getGstAmount().toFixed(2)}
                            </Text>
                          </View>
                        </View>
                        {isGstInfoVisible && (
                          <View style={styles.gstInfoBox}>
                            <View style={styles.infoBoxRow}>
                              <Text allowFontScaling={false} adjustsFontSizeToFit={true}  style={styles.infoBoxText}>
                                  Includes GST on delivery & handling.
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  <View style={styles.grandTotalContainer}>
                    <View style={styles.grandTotalLeft}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.grandTotalText}>Grand Total</Text>
                      {calculateSavings() > 0 && (
                        <View style={styles.savingsTag}>
                          <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.savingsTagText}>You Save ₹{calculateSavings().toFixed(0)}</Text>
                        </View>
                      )}
                      <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.taxesText}>Including taxes & charges</Text>
                    </View>
                    <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.grandTotalPrice}>₹{calculateGrandTotal().toFixed(2)}</Text>
                  </View>
                </CardSection>
              )}
            </ScrollView>
            {memoizedAddressBar}
            {cartItems.length > 0 && (
              <View style={styles.fixedCheckoutContainer}>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                  <View style={styles.checkoutLeft}>
                    <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.checkoutTotal}>₹{calculateGrandTotal().toFixed(2)}</Text>
                    <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.checkoutSubtext}>Total</Text>
                  </View>
                  <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={styles.checkoutButtonText}>Place Order</Text>
                </TouchableOpacity>
              </View>
            )}
            <Modal
              visible={addressModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setAddressModalVisible(false)}
            >
              <View style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}>
                <View style={{
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  minHeight: hp(70),
                  maxHeight: hp(70),
                  paddingBottom: 0,
                }}>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: wp(4),
                    paddingTop: hp(1.5),
                    paddingBottom: hp(1.5),
                    borderTopWidth: 2,
                    borderTopColor: "#E0E0E0",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    backgroundColor: "#F6F7FB",
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    position: "relative",
                    zIndex: 500,
                  }}>
                    <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={{
                      fontSize: RFValue(13.5),
                      fontWeight: "bold",
                      color: "#222",
                    }}>
                      Select delivery location
                    </Text>
                    <TouchableOpacity
                      onPress={() => setAddressModalVisible(false)}
                      style={{
                        borderRadius: 16,
                        backgroundColor: "#f6f7fb",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text allowFontScaling={false} adjustsFontSizeToFit={true} numberOfLines={1} style={{ fontSize: 20, color: "#0C5273", fontWeight: "bold" }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <AddressBookModal 
                    onSelect={handleAddressSelect} 
                    onCloseRequest={handleNavigateToAddAddress} 
                  />
                </View>
              </View>
            </Modal>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

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

const styles = StyleSheet.create({
    cardSection: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginHorizontal: 8,
        marginTop: 16,
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    keyboardAvoidView: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: hp(7),
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: "red",
        marginBottom: 20,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: "#004D40",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    emptyCartContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp(30),
    },
    emptyCartText: {
        fontSize: RFValue(14),
        color: "#666",
        marginBottom: hp(2),
    },
    continueShopping: {
        backgroundColor: "#0C5273",
        paddingHorizontal: wp(8),
        paddingVertical: hp(1.5),
        borderRadius: hp(1),
    },
    continueShoppingText: {
        color: "white",
        fontWeight: "bold",
    },
    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        borderRadius: 5,
        marginBottom: hp(0.5),
    },
    productContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    imageContainer: {
        width: wp(20),
        height: hp(8),
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    productImage: {
        width: '80%',
        height: '80%',
        borderRadius: 6,
    },
    productInfo: {
        flex: 1,
        justifyContent: "space-between",
        paddingRight: wp(2),
    },
    productName: {
        fontSize: RFValue(12.5),
        fontWeight: "600",
        color: "#333",
        marginBottom: hp(0.3),
        lineHeight: hp(2),
    },
    productWeight: {
        fontSize: RFValue(10),
        color: "#666",
        marginBottom: hp(0.5),
    },
    productPrice: {
        fontSize: RFValue(13),
        fontWeight: "700",
        color: "#222",
    },
    quantityAndActions: {
        alignItems: "center",
        justifyContent: "center",
        minHeight: hp(7),
        marginLeft: wp(2),
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0C5273",
        borderColor: "#0C5273",
        borderWidth: 1,
        borderRadius: 7,
        justifyContent: "center",
        height: hp(4),
        width: wp(24),
        paddingHorizontal: wp(1),
    },
    quantityButton: {
        width: wp(6),
        height: hp(4),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    quantityButtonText: {
        fontSize: RFValue(14),
        fontWeight: "bold",
        color: "white",
    },
    quantityValue: {
        fontSize: RFValue(12),
        fontWeight: "bold",
        color: "white",
        marginHorizontal: wp(2),
        textAlign: "center",
        backgroundColor: "transparent",
        minWidth: wp(6),
    },
    freeGiftTag: {
        backgroundColor: "#E8F5E8",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    freeGiftTagText: {
        fontSize: 12,
        color: "#2E7D32",
        fontWeight: "600",
    },
    removeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        left: 15,
    },
    removeButtonText: {
        fontSize: 14,
        color: "#FF5722",
        fontWeight: "500",
    },
    recommendationsContainer: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(6),
        backgroundColor: "#fff",
        marginTop: hp(1),
        borderRadius: 5,
    },
    recommendationsTitle: {
        fontSize: RFValue(14),
        fontWeight: "bold",
        color: "#333",
        marginBottom: hp(3),
        textAlign: "left",
        right: wp(2)
    },
    recommendationsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    recommendationCardContainer: {
        width: "23%",
        marginBottom: hp(2),
        marginHorizontal: wp(1),
        alignItems: "center",

    },
    billDetailsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    billDetailsLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    billTitle: {
        fontSize: RFValue(14),
        fontWeight: "600",
        color: "#333",
    },
    billArrow: {
        fontSize: RFValue(18),
        color: "#666",
    },
    billArrowExpanded: {
        transform: [{ rotate: "90deg" }],
    },
    billDetails: {
        padding: hp(2),
        backgroundColor: "#F9F9F9",
    },
    billRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(1),
    },
    billItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    billItemIcon: {
        fontSize: RFValue(12),
        marginRight: wp(2),
    },
    billItemText: {
        fontSize: RFValue(12),
        color: "#333",
    },
    billPriceContainer: {
        alignItems: "flex-end",
    },
    billItemMrp: {
        fontSize: RFValue(12),
        color: "#999",
        textDecorationLine: "line-through",
    },
    billItemPrice: {
        fontSize: RFValue(12),
        fontWeight: "400",
        color: "#333",
    },
    billItemDiscountPrice: {
        fontSize: RFValue(12),
        fontWeight: "600",
        color: "#4A90E2",
    },
    grandTotalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: hp(1.5),
        marginHorizontal: wp(1),
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
    },
    grandTotalLeft: {
        flex: 1,
    },
    grandTotalText: {
        fontSize: RFValue(14),
        fontWeight: "600",
        color: "#333",
        marginBottom: hp(0.4),
    },
    savingsTag: {
        backgroundColor: "#4A90E2",
        paddingHorizontal: wp(1.8),
        paddingVertical: hp(0.5),
        borderRadius: 4,
        alignSelf: "flex-start",
        marginBottom: hp(0.4),
    },
    savingsTagText: {
        fontSize: RFValue(10),
        color: "white",
        fontWeight: "500",
    },
    taxesText: {
        fontSize: RFValue(9),
        color: "#666",
    },
    grandTotalPrice: {
        fontSize: RFValue(14),
        fontWeight: "600",
        color: "#333",
    },
    addressBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8E8E8",
        padding: hp(1),
        justifyContent: "space-between",
    },
    addressInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    addressIcon: {
        fontSize: RFValue(14),
        marginRight: wp(3),
        marginLeft: wp(2)
    },
    addressLabel: {
        fontSize: RFValue(11),
        color: "#333",
        fontWeight: "600",
        marginBottom: hp(0.3),
    },
    addressText: {
        fontSize: RFValue(10),
        color: "#666",
        flexWrap: "wrap",
        maxWidth: 200,
    },
    changeText: {
        color: "#0C5273",
        fontWeight: "600",
        fontSize: RFValue(11),
    },
    fixedCheckoutContainer: {
        backgroundColor: "#0C5273",
        padding: hp(1.5),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: hp(0.5),
        borderColor: "#ffffff",
        borderRadius: 10,
        marginHorizontal: wp(2),
    },
    checkoutButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flex: 1,
    },
    checkoutLeft: {
        alignItems: "flex-start",
    },
    checkoutTotal: {
        color: "white",
        fontSize: RFValue(14),
        fontWeight: "600",
    },
    checkoutSubtext: {
        color: "white",
        fontSize: RFValue(11),
        opacity: 0.8,
    },
    checkoutButtonText: {
        color: "white",
        fontSize: RFValue(12.5),
        fontWeight: "600",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.8),
        borderRadius: 8,
    },
    checkoutSpacer: {
        height: hp(10),
    },
    couponSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: hp(1.5),
        backgroundColor: "white",
        borderRadius: 5,
    },
    couponLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    couponIcon: {
        marginRight: wp(2),
    },
    couponIconText: {
        fontSize: RFValue(18),
    },
    couponText: {
        fontSize: RFValue(13),
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
    },
    couponSubtext: {
        fontSize: RFValue(10.5),
        color: "#666",
    },
    couponArrow: {
        fontSize: RFValue(16),
        color: "#666",
        fontWeight: "500",
    },
    appliedCouponContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: hp(1.5),
        backgroundColor: "#E8F5E8",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        borderLeftWidth: 4,
        borderLeftColor: "#4A90E2",
        borderRadius: 5,
    },
    appliedCouponLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    appliedCouponIcon: {
        marginRight: wp(2.5),
    },
    appliedCouponCode: {
        fontSize: RFValue(12),
        fontWeight: "600",
        color: "#2E7D32",
        marginBottom: hp(0.4),
    },
    appliedCouponMessage: {
        fontSize: RFValue(10),
        color: "#666",
    },
    appliedCouponRight: {
        alignItems: "flex-end",
    },
    appliedCouponDiscount: {
        fontSize: RFValue(13),
        fontWeight: "700",
        color: "#333",
        marginBottom: hp(0.5),
    },
    removeCouponButton: {
        paddingHorizontal: wp(1),
        paddingVertical: hp(0.5),
    },
    removeCouponText: {
        fontSize: RFValue(11),
        color: "#FF5722",
        fontWeight: "500",
    },
    couponWarning: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF3E0",
        padding: hp(2),
        borderLeftWidth: 4,
        borderLeftColor: "#FF9800",
        marginHorizontal: 0,
        marginBottom: 0,
    },
    couponWarningText: {
        fontSize: RFValue(11),
        color: "#F57C00",
        marginLeft: 8,
        fontWeight: "500",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginTop: hp(0.5),
    },
    originalPrice: {
        fontSize: RFValue(12),
        color: "#999",
        textDecorationLine: "line-through",
        marginRight: wp(2),
    },
    discountPercent: {
        fontSize: RFValue(11),
        color: "#2E5BFF",
        marginBottom: hp(0.5),
    },
    discountedPrice: {
        fontSize: RFValue(13),
        fontWeight: "700",
        color: "#222",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoButton: {
        marginLeft: wp(2),
        padding: hp(0.5),
    },
    gstInfoBox: {
        backgroundColor: '#F0F8FF',
        borderRadius: 6,
        height: hp(3),
        width: wp(60),
        paddingHorizontal: wp(2),
        marginTop: hp(0.3),
        borderWidth: 1,
        borderColor: '#D1E7FD',
        flex: 1,
        textAlign: 'left'
    },
    infoBoxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 2,
        textAlign: 'left'
    },
    infoBoxText: {
        fontSize: RFValue(9),
        color: '#555',
        fontWeight: '700',
    },
    iconBox: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(2),
        backgroundColor: "#f6f7fb",
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp(0.2),
        marginRight: wp(2),
    },
    iconImage: {
        width: 24,
        height: 24,
        resizeMode: "contain",
    },
    seeAllButton: {
        paddingVertical: hp(1.2),
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: wp(1.5),
        marginTop: hp(0.8),
    },
    seeAllButtonWithBorder: {
        borderWidth: 1,
        borderColor: 'rgba(12, 82, 115, 0.11)',
    },
    seeAllButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    productImagesContainer: {
        flexDirection: 'row',
        marginRight: wp(1.5),
    },
    imageWrapper: {
        width: wp(6.5),
        height: wp(6.5),
        borderRadius: wp(3.5),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(12, 82, 115, 0.1)',
        overflow: 'hidden',
    },
    productPreviewImage: {
        width: '75%',
        height: '75%',
    },
    seeAllText: {
        fontSize: RFValue(12.5),
        fontWeight: "600",
        color: "#0C5273",
        marginHorizontal: wp(1.5),
    },
    rightImage: {
        width: wp(2.5),
        height: wp(2.5),
        marginLeft: wp(1.5),
    },
});

export default CartScreen;