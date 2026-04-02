import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { wp, hp, RFValue, getImageUrl } from '../../lib/utils/ui-utils';
import { useCart } from '../../features/cart/hooks/use-cart';
import { useCartMutations } from '../../features/cart/hooks/use-cart-mutations';

// Note: useCart will be integrated once the CartProvider is implemented in the new app.
// For now, we'll use a placeholder or props.

interface ProductVariant {
  _id: string;
  sku: string;
  price: number;
  mrp: number;
  discountPercent: number;
  thumbnailUrl: string;
  packageSize: string;
  weight: number;
  weightUnit: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  tags?: string[];
  defaultVariant?: ProductVariant;
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  style?: any;
  imageStyle?: any;
  quantity?: number;
  onAddToCart?: (product: Product) => void;
  onRemoveFromCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress, 
  style,
  imageStyle,
  quantity: propQuantity,
  onAddToCart,
  onRemoveFromCart
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Real Global Cart Integration
  const { data: cartData } = useCart();
  const { addToCart, updateCartItem, removeFromCart, isAdding, isUpdating, isRemoving } = useCartMutations();
  
  const variant = product.defaultVariant;
  if (!variant) return null;

  // Sync quantity from global cart if not passed as prop
  const cartItems = (cartData as any)?.myCart?.items || [];
  const currentCartItem = cartItems.find((item: any) => item.productId === product._id);
  const cartQuantity = propQuantity !== undefined ? propQuantity : (currentCartItem?.quantity || 0);

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      if (cartQuantity === 0) {
        addToCart({
          variables: {
            input: {
              productId: variant._id, // Use variant ID as required by backend flow
              quantity: 1,
            }
          }
        });
      } else {
        updateCartItem({
          variables: {
            input: {
              productId: variant._id,
              quantity: cartQuantity + 1,
            }
          }
        });
      }
    }
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onRemoveFromCart) {
      onRemoveFromCart(product);
    } else {
      if (cartQuantity === 1) {
        removeFromCart({
          variables: {
            productId: variant._id
          }
        });
      } else {
        updateCartItem({
          variables: {
            input: {
              productId: variant._id,
              quantity: cartQuantity - 1,
            }
          }
        });
      }
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const isUpdatingCart = isAdding || isUpdating || isRemoving;
  const actualPrice = variant.price;
  const mrp = variant.mrp;
  const showMRP = mrp > actualPrice;
  const discountPercentage = Math.round(variant.discountPercent || 0);

  const primaryTag = product.tags?.[0];

  return (
    <Pressable 
      onPress={onPress} 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
          styles.cardContainer,
          { transform: [{ scale: scaleAnim }] },
          style
        ]}>
        <View style={styles.card}>
          {/* Tag */}
          {primaryTag && (
            <View style={[styles.tagContainer, getTagStyle(primaryTag)]}>
              <Text style={styles.tagText} numberOfLines={1}>
                {primaryTag}
              </Text>
            </View>
          )}

          <View>
            <View style={[styles.imageWrapper, imageStyle]}>
              <Image
                source={{ uri: getImageUrl(variant.thumbnailUrl) }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            </View>

            <View style={styles.detailsContainer}>
              <Text style={styles.name} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.weight}>
                {variant.weight}{variant.weightUnit} • {variant.packageSize}
              </Text>

              {discountPercentage > 0 && (
                <Text style={styles.discountText}>{`${discountPercentage}% OFF`}</Text>
              )}

              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{Number(actualPrice).toFixed(0)}</Text>
                {showMRP && <Text style={styles.mrp}>₹{Number(mrp).toFixed(0)}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            {isUpdatingCart ? (
              <View style={[styles.addButton, { borderColor: '#ddd' }]}>
                <ActivityIndicator size="small" color="#0C5273" />
              </View>
            ) : cartQuantity > 0 ? (
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton} onPress={handleRemove}>
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValueText}>{cartQuantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={handleAdd}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const getTagStyle = (tag: string) => {
    switch (tag) {
      case "Bestseller": return { backgroundColor: "#C5CAF4" };
      case "Trending": return { backgroundColor: "#F0BBD2" };
      case "Fasting": return { backgroundColor: "#FBE9AE" };
      case "New Launched": return { backgroundColor: "#B8EEB3" };
      default: return { backgroundColor: "#EDEDED" };
    }
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    // Adding shadow for premium feel matching legacy
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'visible', // Allow button to breathe
  },
  card: {
    padding: wp("2.5%"),
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tagContainer: {
    position: "absolute",
    top: hp("1%"),
    left: 0,
    zIndex: 1,
    minWidth: wp("18%"),
    height: hp("2.2%"),
    paddingHorizontal: 6,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: "center",
  },
  tagText: {
    fontSize: RFValue(8.5),
    fontWeight: "700",
    color: "#444",
    textAlign: "center",
  },
  imageWrapper: {
    width: "100%",
    height: hp("14%"),
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("0.5%"),
  },
  image: {
    width: "90%",
    height: "90%",
  },
  detailsContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: hp("0.5%"),
  },
  name: {
    fontSize: RFValue(11),
    fontWeight: "600",
    color: "#111",
    minHeight: hp("4.2%"),
    lineHeight: RFValue(13),
    marginBottom: 2,
  },
  weight: {
    fontSize: RFValue(10),
    color: "#777",
    marginBottom: hp("0.4%"),
  },
  discountText: {
    fontSize: RFValue(8.5),
    fontWeight: "700",
    color: "#0fa958",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  price: {
    fontSize: RFValue(12),
    fontWeight: "700",
    color: "#111",
    marginRight: wp("1%"),
  },
  mrp: {
    fontSize: RFValue(9.5),
    color: "#888",
    textDecorationLine: "line-through",
  },
  actionsContainer: {
    width: "100%",
    marginTop: hp("0.8%"),
  },
  addButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0C5273",
    borderRadius: 8,
    paddingVertical: hp("0.6%"),
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: hp("4%"),
  },
  addButtonText: {
    color: "#0C5273",
    fontSize: RFValue(13),
    fontWeight: "700",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C5273",
    borderRadius: 8,
    justifyContent: "space-between",
    paddingVertical: hp("0.6%"),
    width: "100%",
    minHeight: hp("4%"),
  },
  quantityButton: {
    width: "30%",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: RFValue(14),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  quantityValueText: {
    fontSize: RFValue(12.5),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default ProductCard;
