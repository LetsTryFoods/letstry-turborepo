"use client"

import { useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { useCart } from "../context/CartContext"

const ProductCard = ({ product, onPress, layout = "grid" }) => {
  const [imageError, setImageError] = useState(false)
  const { addItemToCart, removeItemFromCart, getItemQuantity } = useCart()

  const quantity = getItemQuantity(product.id)

  // Validate product object
  if (!product || typeof product !== "object") {
    console.error("Invalid product passed to ProductCard:", product)
    return null
  }

  // Handle image loading errors
  const handleImageError = () => {
    console.log("Image loading error for product:", product.name || "Unknown product")
    setImageError(true)
  }

  // Use fallback image if imageUrl is not available or fails to load
  const imageSource =
    imageError || !product.imageUrl ? require("../assets/images/product4.png") : { uri: product.imageUrl }

  const handleAddToCartPress = (e) => {
    e.stopPropagation() // Prevent triggering the parent's onPress
    addItemToCart(product)
  }

  const handleRemoveFromCartPress = (e) => {
    e.stopPropagation() // Prevent triggering the parent's onPress
    removeItemFromCart(product.id)
  }

  // Calculate discount percentage
  const discountPercentage =
    product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0

  // Home screen layout (grid)
  if (layout === "grid") {
    return (
      <TouchableOpacity style={styles.gridContainer} onPress={onPress} activeOpacity={0.7}>
        <Image source={imageSource} style={styles.gridImage} resizeMode="contain" onError={handleImageError} />

        {/* Add button or quantity selector */}
        {quantity > 0 ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={handleRemoveFromCartPress}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.quantityValue}>
              <Text style={styles.quantityValueText}>{quantity}</Text>
            </View>
            <TouchableOpacity style={styles.quantityButton} onPress={handleAddToCartPress}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCartPress}>
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name || "Product Name"}
          </Text>
          <Text style={styles.weight}>{product.unit}</Text>

          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
            </View>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price ? product.price.toFixed(2) : "0.00"}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrp}>MRP ₹{product.mrp.toFixed(2)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Category screen layout (list)
  return (
    <TouchableOpacity style={styles.listContainer} onPress={onPress} activeOpacity={0.7}>
      <Image source={imageSource} style={styles.listImage} resizeMode="contain" onError={handleImageError} />

      <View style={styles.listInfoContainer}>
        <Text style={styles.listName} numberOfLines={2}>
          {product.name || "Product Name"}
        </Text>
        <Text style={styles.listWeight}>200 Grams</Text>

        {discountPercentage > 0 && (
          <View style={styles.listDiscountBadge}>
            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
          </View>
        )}

        <Text style={styles.listPrice}>₹{product.price ? product.price.toFixed(2) : "0.00"}</Text>
        {product.mrp && product.mrp > product.price && (
          <Text style={styles.listMrp}>MRP ₹{product.mrp.toFixed(2)}</Text>
        )}
      </View>

      {/* Add button or quantity selector */}
      {quantity > 0 ? (
        <View style={styles.listQuantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={handleRemoveFromCartPress}>
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <View style={styles.quantityValue}>
            <Text style={styles.quantityValueText}>{quantity}</Text>
          </View>
          <TouchableOpacity style={styles.quantityButton} onPress={handleAddToCartPress}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.listAddButton} onPress={handleAddToCartPress}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Grid layout styles (Home screen)
  gridContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: 140,
    marginBottom: 8,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  weight: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: "#3366FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  discountText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    color: "#333",
  },
  mrp: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#004D40",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    zIndex: 1,
    minWidth: 60, // Added for consistent width
    minHeight: 32, // Added for consistent height
    justifyContent: "center", // Center content vertically
  },
  addButtonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 12,
  },
  quantityContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "#004D40", // Match addButton color
    borderRadius: 20,
    minWidth: 60, // Same as addButton
    minHeight: 32, // Same as addButton
    justifyContent: "center",
    paddingHorizontal: 4, // Add some horizontal padding
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent", // Transparent to show parent bg
    borderRadius: 14,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  quantityValue: {
    width: 30,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValueText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white", // Make quantity text white for contrast
  },

  // List layout styles (Categories screen)
  listContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  listImage: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  listInfoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  listName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  listWeight: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  listDiscountBadge: {
    backgroundColor: "#3366FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  listPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  listMrp: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  listAddButton: {
    backgroundColor: "#004D40",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  listQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
})

export default ProductCard
