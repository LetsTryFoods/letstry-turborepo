
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native'; // <-- Special hook import

import ProductDetailsShimmer from "../components/ProductDetailsShimmer";
import FloatingCartButton from "../components/FloatingCartButton";
import SimilarProductSheet from "../components/SimilarProductSheet";
import RangeCategoryCard from "../components/RangeCategoryCard";
import { useCart } from "../context/CartContext";
import { fetchHamperDetails } from "../services/HamperService";
import { fetchSimilarProducts } from "../services/RecommendationService";

const HamperDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showAllSimilar, setShowAllSimilar] = useState(false);
  const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart();
  const [rotateAnimation] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();
  
  // Animation state, initial is false
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // This hook runs every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Show the animation
      setShowSuccessAnimation(true);

      const timer = setTimeout(() => {
        // Hide the animation after 3 seconds
        setShowSuccessAnimation(false);
      }, 3000); // Adjust duration as needed (3000ms = 3s)

      // Cleanup function when you navigate away from the screen
      return () => {
        clearTimeout(timer);
      };
    }, [])
  );

  // Fetch Hamper Details
  useEffect(() => {
    const loadHamperDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchHamperDetails(productId);
        if (data) {
          setProduct(data);
        } else {
          setError("Hamper not found");
        }
      } catch (err) {
        setError("Failed to load hamper details");
      } finally {
        setLoading(false);
      }
    };
    loadHamperDetails();
  }, [productId]);

  // Fetch Similar Products
  useEffect(() => {
    if (product && product.id) {
      fetchSimilarProducts(product.id)
        .then(setSimilarProducts)
        .catch(err => console.error("Error fetching similar products:", err));
    }
  }, [product]);

  // Rotate animation for product details arrow
  useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: showProductDetails ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showProductDetails]);

  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  if (loading) {
    return <ProductDetailsShimmer />;
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Hamper not found."}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addItemToCart(product);
  };
  
  const handleRemoveFromCart = () => removeItemFromCart(product);
  const toggleProductDetails = () => setShowProductDetails(!showProductDetails);
  const handleCategoryPress = () => {
    if (product.category) {
        navigation.navigate("MainApp", {
            screen: "Categories",
            params: { selectedCategory: product.category },
        });
    }
  };

  const quantity = getItemQuantity(product.id);
  const isInCart = quantity > 0;
  const sellingPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = product.discountPercent || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={RFValue(20)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate("Search")}>
          <Ionicons name="search" size={RFValue(18)} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl }}
            defaultSource={require("../assets/images/product4.png")}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productWeight}>{product.unit}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{sellingPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.mrp}>MRP ₹{originalPrice.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                </View>
              </>
            )}
            <Text style={styles.taxText}>Inclusive of all taxes</Text>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          <TouchableOpacity style={styles.viewDetailsToggle} onPress={toggleProductDetails}>
            <Text style={styles.viewDetailsText}>View product details</Text>
            <Animated.Text style={[styles.arrowIcon, animatedStyle]}>▼</Animated.Text>
          </TouchableOpacity>

          {showProductDetails && (
            <View style={styles.collapsibleDetails}>
              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>Product Info</Text>
                <View style={styles.infoTable}>
                  {product.unit && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Unit</Text>
                      <Text style={styles.infoValue}>{product.unit}</Text>
                    </View>
                  )}
                  {product.shelfLife && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Shelf Life</Text>
                      <Text style={styles.infoValue}>{product.shelfLife}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {product.category && (
            <TouchableOpacity style={styles.brandSection} onPress={handleCategoryPress}>
              <Image source={require("../assets/images/product4.png")} style={styles.brandLogo} resizeMode="contain" />
              <View style={styles.brandInfo}>
                <Text style={styles.brandName}>{product.category}</Text>
                <Text style={styles.brandExplore}>Explore all products</Text>
              </View>
              <Text style={styles.brandArrow}>›</Text>
            </TouchableOpacity>
          )}

          {similarProducts && similarProducts.length > 0 && (
            <View style={styles.similarProductsSection}>
              <Text style={styles.similarProductsTitle}>Similar products</Text>
              <View style={styles.similarProductsGrid}>
                {similarProducts.slice(0, 6).map((item) => (
                  <View key={item.id} style={styles.similarProductCard}>
                    <RangeCategoryCard
                      product={item}
                      onPress={() => navigation.push("ProductDetails", { productId: item.id })}
                    />
                  </View>
                ))}
              </View>

              {similarProducts.length > 6 && (
                <TouchableOpacity style={[styles.seeAllButton, styles.seeAllButtonWithBorder]} onPress={() => setShowAllSimilar(true)}>
                    <Text style={styles.seeAllText}>See all products</Text>
                    <Ionicons name="chevron-forward" size={RFValue(14)} color="#0C5273" />
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={{ height: hp(15) }} />
        </View>
      </ScrollView>

      <FloatingCartButton onPress={() => navigation.navigate("MainApp", { screen: "Cart" })} customStyle={[styles.floatingCartButtonCustom, { bottom: insets.bottom + hp(10) }]} />
      
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <View style={styles.weightPriceContainer}>
          <Text style={styles.bottomWeight}>{product.unit}</Text>
          <View style={styles.bottomPriceContainer}>
            <Text style={styles.bottomPrice}>₹{sellingPrice.toFixed(2)}</Text>
            {hasDiscount && <Text style={styles.bottomMrp}>MRP ₹{originalPrice.toFixed(2)}</Text>}
          </View>
        </View>
        {!isInCart ? (
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControl}>
            <TouchableOpacity style={styles.quantityButton} onPress={handleRemoveFromCart}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={handleAddToCart}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <SimilarProductSheet
        visible={showAllSimilar}
        onClose={() => setShowAllSimilar(false)}
        products={similarProducts}
        onProductPress={(item) => {
          setShowAllSimilar(false);
          navigation.push("ProductDetails", { productId: item.id });
        }}
      />

      {showSuccessAnimation && (
        <View style={styles.lottieOverlay}>
          <LottieView
            source={require("../assets/lottie/fire.json")}

            autoPlay
            loop={false}
            style={styles.lottieAnimation}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  lottieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    // Background color removed for a transparent background
  },
  lottieAnimation: {
    width: wp(150),
    height: wp(150),
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5),
  },
  errorText: {
    fontSize: RFValue(14),
    color: "#E53935",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#0C5273",
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.25),
    borderRadius: 8,
    marginTop: hp(2),
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: RFValue(14),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: RFValue(14),
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: wp(2),
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: hp(30),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(2),
   
  },
  productImage: {
    width: "80%",
    height: "100%",
     borderRadius: 8,
    
  },
  productInfo: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  productName: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: "#212121",
  },
  productWeight: {
    fontSize: RFValue(14),
    color: "#757575",
    marginTop: hp(0.5),
    marginBottom: hp(1.5),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: hp(2),
  },
  price: {
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "#212121",
    marginRight: wp(2),
  },
  mrp: {
    fontSize: RFValue(14),
    color: "#757575",
    textDecorationLine: "line-through",
    marginRight: wp(2),
  },
  discountBadge: {
    backgroundColor: "rgba(12, 82, 115, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: RFValue(12),
    color: "#0C5273",
    fontWeight: "600",
  },
  taxText: {
    fontSize: RFValue(10),
    color: "#BDBDBD",
    width: '100%',
    marginTop: hp(0.5),
  },
  viewDetailsToggle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    marginVertical: hp(1.5),
  },
  viewDetailsText: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#0C5273",
    marginRight: wp(1.5),
  },
  arrowIcon: {
    fontSize: RFValue(13),
    color: "#0C5273",
  },
  collapsibleDetails: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: wp(3),
    marginBottom: hp(1.5),
  },
  detailsSection: {
    marginVertical: hp(1),
  },
  detailsTitle: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#212121",
    marginBottom: hp(1),
  },
  descriptionText: {
    fontSize: RFValue(13),
    color: "#616161",
    lineHeight: RFValue(20),
  },
  infoTable: {},
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  infoLabel: {
    fontSize: RFValue(13),
    color: "#616161",
    fontWeight: "600",
    width: '40%',
  },
  infoValue: {
    fontSize: RFValue(13),
    color: "#212121",
    fontWeight: "500",
    width: '60%',
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "#F0F0F0",
    marginVertical: hp(1.5),
  },
  brandLogo: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: wp(3),
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  brandExplore: {
    fontSize: RFValue(12),
    color: "#757575",
  },
  brandArrow: {
    fontSize: RFValue(20),
    color: "#757575",
  },
  similarProductsSection: {
    marginVertical: hp(2),
  },
  similarProductsTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    marginBottom: hp(1.5),
  },
  similarProductsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  similarProductCard: {
    width: "32%",
    marginBottom: hp(1.5),
  },
  seeAllButton: {
    flexDirection: 'row',
    paddingVertical: hp(1.5),
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginTop: hp(1),
  },
  seeAllButtonWithBorder: {
    borderWidth: 1,
    borderColor: 'rgba(12, 82, 115, 0.11)',
  },
  seeAllText: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#0C5273",
    marginRight: 5,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    elevation: 8,
  },
  weightPriceContainer: {
    flex: 1.2,
  },
  bottomWeight: {
    fontSize: RFValue(12),
    color: "#757575",
  },
  bottomPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomPrice: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    color: "#212121",
    marginRight: wp(2),
  },
  bottomMrp: {
    fontSize: RFValue(12),
    color: "#757575",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#0C5273",
    paddingVertical: hp(1.5),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quantityControl: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C5273",
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  quantityButton: {
    padding: wp(3),
  },
  quantityButtonText: {
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  quantityText: {
    fontSize: RFValue(14),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  floatingCartButtonCustom: {
  },
});

export default HamperDetailsScreen;





