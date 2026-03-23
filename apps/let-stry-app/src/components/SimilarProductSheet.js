// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from "react-native";
// import EventProductCard from "./EventProductCard";
// import RangeCategoryCard from "./RangeCategoryCard";

// const { height } = Dimensions.get("window");

// const SimilarProductSheet = ({ visible, onClose, products = [], onProductPress }) => {
//   // Defensive: log products received
//   console.log("Modal products:", products);

//   if (!visible) return null;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <View style={styles.header}>
//             <View style={styles.handleBar} />
//             <Text style={styles.title} allowFontScaling={false}>Similar Products</Text>
//             <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//               <Text style={styles.closeButtonText} allowFontScaling={false}>✕</Text>
//             </TouchableOpacity>
//           </View>
//           <ScrollView contentContainerStyle={styles.productsGrid}>
//             {products && products.length > 0 ? (
//               products.map((product, idx) => (
//                 <View
//                   key={product.ean_code || product.eanCode || product.id || idx}
//                   style={styles.productCardContainer}
//                 >
//                   <RangeCategoryCard
//                     product={product}
//                     onPress={() => onProductPress(product)}
//                   />
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.emptyText} allowFontScaling={false}>No recommendations available.</Text>
//             )}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   container: {
//     backgroundColor: "white",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: height * 0.7,
//     minHeight: height * 0.3,
//     overflow: "hidden",
//   },
//   header: {
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//     position: "relative",
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#E0E0E0",
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//     alignContent: "center",
//     width: "100%",
//     textAlign: "left",
//   },
//   closeButton: {
//     position: "absolute",
//     right: 16,
//     top: 16,
//     width: 30,
//     height: 30,
//     backgroundColor: "#F0F0F0",
//     borderRadius: 15,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   closeButtonText: {
//     fontSize: 16,
//     color: "#0C5273",
//     fontWeight:900,
//   },
//   productsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "flex-start",
//     paddingTop: 15,
//     paddingHorizontal: 10,
//   },
//   productCardContainer: {
//     width: "25%",
//     marginBottom: 12,
//     marginHorizontal: 16,
//     right: 17,
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#888",
//     marginTop: 32,
//     width: "100%",
//     fontSize: 16,
//   },
// });

// export default SimilarProductSheet;









import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions } from "react-native";
import RangeCategoryCard from "./RangeCategoryCard"; // Assuming this component is correctly imported

const { height } = Dimensions.get("window");

const SimilarProductSheet = ({ visible, onClose, products = [], onProductPress }) => {
  // Defensive: log products received
  console.log("Modal products:", products);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.handleBar} />
            <Text style={styles.title} allowFontScaling={false}>Similar Products</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText} allowFontScaling={false}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.productsGrid}>
            {products && products.length > 0 ? (
              products.map((product, idx) => (
                <View
                  key={product.ean_code || product.eanCode || product.id || idx}
                  style={styles.productCardContainer} // This style is now corrected
                >
                  <RangeCategoryCard
                    product={product}
                    onPress={() => onProductPress(product)}
                  />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText} allowFontScaling={false}>No recommendations available.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// --- CORRECTED STYLES START HERE ---

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
    maxHeight: height * 0.7,
    minHeight: height * 0.3,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    position: "relative",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    alignContent: "center",
    width: "100%",
    textAlign: "left",
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
    color: "#0C5273",
    fontWeight: "900",
  },
  // --- This is the section that has been fixed ---
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 8, // Changed from 10
    paddingTop: 15,
  },
  productCardContainer: {
    width: "33.33%", // Changed from 25% to fit 3 in a row
    paddingHorizontal: 8, // Using padding for spacing instead of margin
    marginBottom: 16,     // Spacing between rows
    // Removed the old 'marginHorizontal' and 'right' properties
  },
  // --- End of fixed section ---
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 32,
    width: "100%",
    fontSize: 16,
  },
});

export default SimilarProductSheet;