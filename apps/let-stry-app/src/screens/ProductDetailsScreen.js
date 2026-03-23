import React, { useState, useEffect, useRef } from "react"
import ProductDetailsShimmer from "../components/ProductDetailsShimmer";

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Share,
  Animated,
  useWindowDimensions // <--- 1. Import this for HTML width
} from "react-native"
import { fetchFoodDetails } from "../services/FoodService"
import { fetchSimilarProducts } from "../services/RecommendationService"
import { useCart } from "../context/CartContext"
import RangeCategoryCard from "../components/RangeCategoryCard"
import SimilarProductSheet from "../components/SimilarProductSheet"
import FloatingCartButton from "../components/FloatingCartButton"
import * as CartService from "../services/CartService"
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import analytics from '@react-native-firebase/analytics';

// --- 2. Import HTML Renderer ---
import RenderHtml from 'react-native-render-html';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(0)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [similarProducts, setSimilarProducts] = useState([])
  const [showAllSimilar, setShowAllSimilar] = useState(false)
  const { addItemToCart, removeItemFromCart, getItemQuantity, cartItems } = useCart()
  const [rotateAnimation] = useState(new Animated.Value(0))
  const insets = useSafeAreaInsets();
  
  // --- 3. Get Window Width for HTML ---
  const { width } = useWindowDimensions();

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true)
        const data = await fetchFoodDetails(productId)
        if (data) {
          setProduct(data)
          const cartQty = getItemQuantity(data.id)
          if (cartQty > 0) {
            setQuantity(cartQty)
          }
        } else {
          setError("Product not found")
        }
      } catch (err) {
        console.error("Error loading product details:", err)
        setError("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    loadProductDetails()
  }, [productId, getItemQuantity])

  useEffect(() => {
    if (product) {
      analytics().logScreenView({
        screen_name: 'ProductDetails',
        screen_class: 'ProductDetailsScreen',
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
      });

      if (product.eanCode) {
        fetchSimilarProducts(product.eanCode)
          .then((data) => {
            setSimilarProducts(data)
          })
          .catch((err) => {
            console.error("Error fetching similar products:", err)
          })
      }
    }
  }, [product])

  useEffect(() => {
    if (product) {
      const cartQty = getItemQuantity(product.id)
      setQuantity(cartQty)
    }
  }, [cartItems, product, getItemQuantity])

  useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: showProductDetails ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [showProductDetails, rotateAnimation])

  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  })

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  }

  const handleShare = async () => {
    if (product) {
      try {
        await Share.share({
          message: `Check out ${product.name} on our app!`,
        })
      } catch (error) {
        console.error("Error sharing product:", error)
      }
    }
  }

  const handleAddToCart = async () => {
    if (product) {
      try {
        addItemToCart(product)
      } catch (error) {
        console.error("Error adding to cart:", error)
      }
    }
  }

  const handleRemoveFromCart = async () => {
    if (product && quantity > 0) {
      try {
        removeItemFromCart(product)
      } catch (error) {
        console.error("Error removing from cart:", error)
      }
    }
  }

  const handleSearchPress = () => {
    navigation.navigate("Search")
  }

  const handleCategoryPress = () => {
    navigation.navigate("MainApp", {
      screen: "Categories",
      params: { selectedCategory: product.category },
    })
  }

  const toggleProductDetails = () => {
    setShowProductDetails(!showProductDetails)
  }

  // --- Helper Function to Extract Description Text/HTML ---
  const getDescriptionText = (desc) => {
    if (!desc) return "<p>No description available.</p>";
    
    // If it's an object with a 'description' key, extract the string
    if (typeof desc === 'object' && desc !== null) {
      return desc.description || "<p>No description available.</p>";
    }
    
    // If it's already a string, return it
    if (typeof desc === 'string') {
      return desc;
    }

    return "<p>No description available.</p>";
  };

  if (!product && loading) {
    return (
      <ProductDetailsShimmer />
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Product not found."}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const sellingPrice = product.discountedPrice > 0 ? product.discountedPrice : product.price;
  const mrp = product.price;
  const discountPercent = product.discountPercent || 0;

  const isInCart = quantity > 0;
  
  // Extract safe description HTML source
  const descriptionHtml = {
    html: getDescriptionText(product.description)
  };

  // --- 4. Custom Styles for HTML Tags ---
  const tagsStyles = {
    p: {
      fontSize: RFValue(11),
      color: "#666666",
      lineHeight: RFValue(18),
      marginBottom: 10,
    },
    h3: {
      fontSize: RFValue(13),
      color: "#333333",
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 5,
    },
    li: {
      fontSize: RFValue(11),
      color: "#666666",
      lineHeight: RFValue(18),
    },
    ul: {
        marginBottom: 10,
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={RFValue(20)} color="#222" />
        </TouchableOpacity>
        <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
            <Ionicons name="search" size={RFValue(18)} color="#222" />
          </TouchableOpacity>
        </View>
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
          <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.productName}>{product.name}</Text>
          <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.productWeight}>{product.unit}</Text>

          <View style={styles.priceContainer}>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.price}>₹{sellingPrice}</Text>
            {discountPercent > 0 && (
              <>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.mrp}>MRP ₹{mrp}</Text>
                <View style={styles.discountBadge}>
                  <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.discountText}>{discountPercent}% OFF</Text>
                </View>
              </>
            )}
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.taxText}>Inclusive of all taxes</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.detailsTitle}>Description</Text>
            
            {/* --- 5. RENDER HTML COMPONENT HERE --- */}
            <RenderHtml
                contentWidth={width}
                source={descriptionHtml}
                tagsStyles={tagsStyles}
                systemFonts={["System"]} // Uses default system fonts
            />
          </View>

          <TouchableOpacity style={styles.viewDetailsToggle} onPress={toggleProductDetails}>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.viewDetailsText}>View product details</Text>
            <Animated.Text style={[styles.arrowIcon, animatedStyle]}>▼</Animated.Text>
          </TouchableOpacity>

          {showProductDetails && (
            <View style={styles.collapsibleDetails}>
              <View style={styles.detailsSection}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.detailsTitle}>Ingredients</Text>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.ingredientsText}>
                  {typeof product.ingredients === 'object' && product.ingredients !== null
                    ? (product.ingredients.ingredients || "Ingredients information not available") 
                    : (product.ingredients || "Ingredients information not available")}
                </Text>
              </View>

              <View style={styles.detailsSection}>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.detailsTitle}>Product Info</Text>
                <View style={styles.infoTable}>
                  {product.unit && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>Unit</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.unit}</Text>
                    </View>
                  )}

                  {product.flavour && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>Flavour</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.flavour}</Text>
                    </View>
                  )}
                  
                  {product.nutritionIndex && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>Nutritional Index</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.nutritionIndex}</Text>
                    </View>
                  )}                  
                  {product.shelfLife && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>Shelf Life</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.shelfLife}</Text>
                    </View>
                  )}
                  {product.dietPreference && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>Diet Preference</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.dietPreference}</Text>
                    </View>
                  )}
                  {product.fssaiLicense && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>FSSAI License</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.fssaiLicense}</Text>
                    </View>
                  )}
                  {product.refundPolicy && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>Refund Policy</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.refundPolicy}</Text>
                    </View>
                  )}
                  {product.disclaimer && (
                    <View style={styles.infoRow}>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoLabel}>Disclaimer</Text>
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.infoValue}>{product.disclaimer}</Text>
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
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.brandName}>{product.category}</Text>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.brandExplore}>Explore all products</Text>
              </View>
              <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.brandArrow}>›</Text>
            </TouchableOpacity>
          )}

          {similarProducts && similarProducts.length > 0 && (
            <View style={styles.similarProductsSection}>
              <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.similarProductsTitle}>Similar products</Text>
              <View style={styles.similarProductsGrid}>
                {similarProducts.slice(0, 6).map((item, index) => (
                  <View key={item.id || `similar-${index}`} style={styles.similarProductCard}>
                    <RangeCategoryCard
                      product={item}
                      onPress={() => navigation.push("ProductDetails", { productId: item.id })}
                    />
                  </View>
                ))}
              </View>

              {similarProducts.length > 6 && (
                <TouchableOpacity 
                  style={[styles.seeAllButton, styles.seeAllButtonWithBorder]} 
                  onPress={() => setShowAllSimilar(true)}
                >
                  <View style={styles.seeAllButtonContent}>
                    <View style={styles.productImagesContainer}>
                      {similarProducts.slice(0, 3).map((product, index) => (
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
                    <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.seeAllText}>
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
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <FloatingCartButton onPress={() => navigation.navigate("MainApp", { screen: "Cart"})} customStyle={[styles.floatingCartButtonCustom,{bottom: insets.bottom}]} />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <View style={styles.weightPriceContainer}>
          <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.bottomWeight}>{product.unit}</Text>
          <View style={styles.bottomPriceContainer}>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.bottomPrice}>₹{sellingPrice}</Text>
            {discountPercent > 0 && (
              <>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.bottomMrp}>MRP ₹{mrp}</Text>
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.bottomDiscount}>{discountPercent}% OFF</Text>
              </>
            )}
          </View>
          <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.bottomTaxText}>Inclusive of all taxes</Text>
        </View>

        {!isInCart ? (
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.addToCartText}>Add to cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControl}>
            <TouchableOpacity style={styles.quantityButton} onPress={handleRemoveFromCart}>
              <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={handleAddToCart}>
              <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <SimilarProductSheet
        visible={showAllSimilar}
        onClose={() => setShowAllSimilar(false)}
        products={similarProducts}
        onProductPress={(product) => {
          setShowAllSimilar(false)
          navigation.push("ProductDetails", { productId: product.id })
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: hp(8.75),
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
    backgroundColor: "#FFFFFF",
    padding: wp(5),
  },
  errorText: {
    fontSize: RFValue(14),
    color: "#E53935",
    marginBottom: hp(2.5),
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#0C5273",
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.25),
    borderRadius: wp(2),
    marginTop: hp(1.25),
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
    marginTop: hp(.51),
  },
  headerButton: {
    width: wp(8),
    height: wp(8),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#333333",
    marginHorizontal: wp(2.5),
    textAlign: "center",
  },
  headerRightButtons: {
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    width: "100%",
    height: hp(25),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: hp(2),
  },
  productImage: {
    width: "80%",
    height: "100%",
  },
  productInfo: {
    padding: wp(3),
  },
  productName: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#333333",
    marginBottom: hp(0.5),
  },
  productWeight: {
    fontSize: RFValue(13),
    color: "#666666",
    marginBottom: hp(1.2),
  },
  priceContainer: {
    marginBottom: hp(1.5),
  },
  price: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#333",
    marginBottom: hp(0.4),
  },
  mrp: {
    fontSize: RFValue(11),
    color: "#333",
    textDecorationLine: "line-through",
    marginBottom: hp(0.4),
  },
  discountBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: wp(1.2),
    paddingVertical: hp(0.2),
    borderRadius: wp(0.8),
    alignSelf: "flex-start",
    marginBottom: hp(0.4),
  },
  discountText: {
    fontSize: RFValue(9),
    color: "#0C5273",
    fontWeight: "600",
    minWidth: wp(15)
  },
  taxText: {
    fontSize: RFValue(9),
    color: "#999999",
  },
  viewDetailsToggle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(1.2),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: hp(1.5),
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
    marginBottom: hp(1.5),
    backgroundColor: "#F9F9F9",
    borderRadius: wp(1.5),
    padding: wp(2.5),
  },
  detailsSection: {
    marginBottom: hp(1.5),
  },
  detailsTitle: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(0.8),
  },
  descriptionText: {
    // These specific text styles are handled by tagsStyles in RenderHtml now
    // but kept for fallback text
    fontSize: RFValue(11),
    color: "#666666",
    lineHeight: RFValue(19),
  },
  ingredientsText: {
    fontSize: RFValue(11),
    color: "#666666",
    lineHeight: RFValue(16),
  },
  infoTable: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    width: "40%",
    fontSize: RFValue(11),
    fontWeight: "600",
    color: "#333333",
  },
  infoValue: {
    width: "60%",
    fontSize: RFValue(11),
    color: "#666666",
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
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    marginRight: wp(2.5),
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#333333",
  },
  brandExplore: {
    fontSize: RFValue(11),
    color: "#666666",
  },
  brandArrow: {
    fontSize: RFValue(16),
    color: "#666666",
  },
  similarProductsSection: {
    marginBottom: hp(10),
  },
  similarProductsTitle: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#333333",
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
  bottomSpacer: {
    height: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weightPriceContainer: {
    flex: 1,
  },
  bottomWeight: {
    fontSize: RFValue(11),
    color: "#666666",
  },
  bottomPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(0.2),
  },
  bottomPrice: {
    fontSize: RFValue(13),
    fontWeight: "700",
    color: "#0C5273",
    minWidth: wp(15),
  },
  bottomMrp: {
    fontSize: RFValue(9),
    color: "#999999",
    textDecorationLine: "line-through",
    marginRight: wp(1.5),
  },
  bottomDiscount: {
    fontSize: RFValue(9),
    color: "#0C5273",
    fontWeight: "600",
  },
  bottomTaxText: {
    fontSize: RFValue(8),
    color: "#999999",
  },
  addToCartButton: {
    backgroundColor: "#0C5273",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.2),
    borderRadius: wp(1.5),
    minWidth: wp(30), 
  },
  addToCartText: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C5273",
    borderRadius: wp(1.5),
    overflow: "hidden",
  },
  quantityButton: {
    width: wp(8),
    height: wp(8),
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quantityText: {
    fontSize: RFValue(12),
    fontWeight: "600",
    color: "#FFFFFF",
    paddingHorizontal: wp(1),
  },
  floatingCartButtonCustom: {
    marginBottom: hp(9)
  },
})

export default ProductDetailsScreen