import React, { useState, useRef, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions, 
  ScrollView, 
  Image,
  FlatList
} from "react-native"

const { width, height } = Dimensions.get("window")

const FreeGiftSelector = ({ visible, onClose, products, onSelectGift, maxSelections = 1 }) => {
  const [selectedProducts, setSelectedProducts] = useState([])
  const slideAnim = useRef(new Animated.Value(height)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start()
      // Reset selection when closing
      setSelectedProducts([])
    }
  }, [visible, slideAnim])

  const toggleProductSelection = (product) => {
    if (selectedProducts.some(p => p.id === product.id)) {
      // If already selected, remove it
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id))
    } else {
      // If not selected and we haven't reached max selections, add it
      if (selectedProducts.length < maxSelections) {
        setSelectedProducts([...selectedProducts, product])
      } else if (maxSelections === 1) {
        // If max is 1, replace the current selection
        setSelectedProducts([product])
      }
    }
  }

  const handleConfirm = () => {
    if (selectedProducts.length > 0) {
      // If multiple selections are allowed, add them all
      selectedProducts.forEach(product => {
        onSelectGift(product)
      })
      onClose()
    }
  }

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.productItem, 
        selectedProducts.some(p => p.id === item.id) && styles.selectedProductItem
      ]}
      onPress={() => toggleProductSelection(item)}
    >
      <View style={styles.productContent}>
        <Image
          source={{ uri: item.imageUrl }}
          defaultSource={require("../assets/images/product4.png")}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productWeight}>{item.weight || "200 ml"}</Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>₹0</Text>
            </View>
            <Text style={styles.originalPrice}>₹{item.price}</Text>
          </View>
        </View>
        <View style={styles.radioContainer}>
          <View style={[
            styles.radioOuter, 
            selectedProducts.some(p => p.id === item.id) && styles.radioOuterSelected
          ]}>
            {selectedProducts.some(p => p.id === item.id) && <View style={styles.radioInner} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <View style={styles.handleBar} />
            <Text style={styles.title}>
              {maxSelections > 1 
                ? `Pick any ${maxSelections} FREE gifts` 
                : "Pick any one FREE gift"}
            </Text>
            <Text style={styles.subtitle}>
              {selectedProducts.length}/{maxSelections} selected
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            style={styles.scrollView}
          />

          <TouchableOpacity
            style={[styles.confirmButton, selectedProducts.length === 0 && styles.confirmButtonDisabled]}
            disabled={selectedProducts.length === 0}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  header: {
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    position: "relative",
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 2.5,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 30,
    height: 30,
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#333",
  },
  scrollView: {
    maxHeight: height * 0.6,
  },
  productItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    padding: 16,
  },
  selectedProductItem: {
    backgroundColor: "#F9F9FF",
  },
  productContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceTag: {
    backgroundColor: "#FFEB3B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },
  radioContainer: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#4CAF50",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  confirmButton: {
    backgroundColor: "#E91E63",
    padding: 16,
    alignItems: "center",
    margin: 16,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default FreeGiftSelector