// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import { fetchFoodDetails } from "../services/FoodService";
// import { trackOrder } from "../services/OrderService";
// import { shipmentStageMap } from "../constants/shipmentStatusMap";

// const statusIcons = {
//   "Delivered": require("../assets/icons/delivered.png"),
//   "In Transit": require("../assets/icons/in_transit.png"),
//   "Processing": require("../assets/icons/in_transit.png"),
//   "Cancelled": require("../assets/icons/cancelled.png"),
//   "Order Placed": require("../assets/icons/in_transit.png"),
//   "Out for Delivery": require("../assets/icons/in_transit.png"),
//   "Return in Progress": require("../assets/icons/in_transit.png"),
//   "Returned": require("../assets/icons/delivered.png"),
// };

// const MAX_IMAGES_SHOWN = 5;
// const getUserFriendlyStatus = (code) => shipmentStageMap[code] || "Processing";

// const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const OrderCard = ({ order, idToken, onViewDetails, onTrackOrder }) => {
//   const [productImages, setProductImages] = useState([]);
//   const [loadingImages, setLoadingImages] = useState(true);
//   const [statusCode, setStatusCode] = useState(null);
//   const [deliveredDate, setDeliveredDate] = useState(null);
//   const [loadingTracking, setLoadingTracking] = useState(true);

//   useEffect(() => {
//     loadProductImages();
//     loadTrackingStatus();
//   }, [order]);

//   const loadProductImages = async () => {
//     try {
//       setLoadingImages(true);
//       const promises = (order.items || []).map((item) =>
//         item.foodId ? fetchFoodDetails(item.foodId) : Promise.resolve(null)
//       );
//       const details = await Promise.all(promises);
//       setProductImages(details.filter((d) => d?.imageUrl).map((d) => d.imageUrl));
//     } catch {
//       setProductImages([]);
//     } finally {
//       setLoadingImages(false);
//     }
//   };

//   const loadTrackingStatus = async () => {
//     try {
//       setLoadingTracking(true);
//       const trackingData = await trackOrder(order.orderId, idToken);
//       const status = trackingData?.tracking_data?.shipment_status || null;
//       const delivered =
//         trackingData?.tracking_data?.shipment_track?.[0]?.delivered_date ||
//         order.deliveryDate ||
//         null;
//       setStatusCode(status);
//       setDeliveredDate(delivered);
//     } catch {
//       setStatusCode(null);
//       setDeliveredDate(null);
//     } finally {
//       setLoadingTracking(false);
//     }
//   };

//   const extraCount =
//     productImages.length > MAX_IMAGES_SHOWN
//       ? productImages.length - MAX_IMAGES_SHOWN
//       : 0;

//   let statusText = getUserFriendlyStatus(statusCode);
//   const statusIcon = statusIcons[statusText] || null;

//   if (statusText === "Delivered" && deliveredDate) {
//     statusText = `Arrived on ${formatDate(deliveredDate)}`;
//   }

//   // Which statuses should show Track Order
//   const trackingStatuses = [
//     "In Transit",
//     "Processing",
//     "Order Placed",
//     "Out for Delivery",
//     "Return in Progress",
//   ];
//   const showTrackOrder = trackingStatuses.includes(
//     getUserFriendlyStatus(statusCode)
//   );

//   return (
//     <View style={styles.card}>
//       {/* Header Row */}
//       <View style={styles.headerRow}>
//         <View style={styles.headerLeft}>
//           {loadingTracking ? (
//             <ActivityIndicator size="small" color="#AAA" />
//           ) : (
//             <>
//               {statusIcon && (
//                 <Image source={statusIcon} style={styles.statusIcon} />
//               )}
//               <View style={styles.headerText}>
//                 <Text style={styles.statusText}>{statusText}</Text>
//                 <Text style={styles.amountText}>₹{order.totalAmount}</Text>
//               </View>
//             </>
//           )}
//         </View>
//         <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
//       </View>

//       {/* Divider */}
//       <View style={styles.divider} />

//       {/* Product images */}
//       <View style={styles.imagesRow}>
//         {loadingImages ? (
//           <ActivityIndicator size="small" color="#AAA" />
//         ) : (
//           <>
//             {productImages.slice(0, MAX_IMAGES_SHOWN).map((img, idx) => (
//               <View style={styles.imageBox} key={idx}>
//                 <Image
//                   source={{ uri: img }}
//                   style={styles.productImage}
//                   resizeMode="contain"
//                 />
//               </View>
//             ))}
//             {extraCount > 0 && (
//               <View style={styles.imageBox}>
//                 <Text style={styles.extraText}>+{extraCount}</Text>
//               </View>
//             )}
//           </>
//         )}
//       </View>

//       {/* Divider */}
//       <View style={styles.divider} />

//       {/* Actions */}
//       <View style={styles.actionsContainer}>
//         {showTrackOrder && (
//           <>
//             <TouchableOpacity
//               onPress={() => onTrackOrder(order)}
//               style={styles.actionItem}
//             >
//               <Text style={styles.actionText}>Track Order</Text>
//             </TouchableOpacity>
//             <View style={styles.verticalDivider} />
//           </>
//         )}
//         <TouchableOpacity
//           onPress={() => onViewDetails(order)}
//           style={styles.actionItem}
//         >
//           <Text style={styles.actionText}>View Details</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     marginBottom: 1,
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     paddingRight: 8,
//   },
//   statusIcon: { width: 30, height: 30, marginRight: 8 },
//   headerText: { flexDirection: "column" },
//   statusText: {
//     fontWeight: "700",
//     fontSize: 16,
//     marginBottom: 2,
//     color: "#000",
//   },
//   amountText: { fontSize: 13, color: "#6B7280" },
//   dateText: { fontSize: 12, color: "#6B7280", justifyContent: "center" },
//   divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
//   imagesRow: { flexDirection: "row", alignItems: "center" },
//   imageBox: {
//     width: 52,
//     height: 52,
//     borderRadius: 10,
//     marginRight: 8,
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   productImage: { width: 46, height: 46, borderRadius: 8 },
//   extraText: { fontWeight: "700", fontSize: 11, color: "#6B7280" },
//   actionsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 2,
//   },
//   actionItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//   },
//   verticalDivider: {
//     width: 1,
//     backgroundColor: "#E5E7EB",
//     height: "100%",
//     alignSelf: "center",
//   },
//   actionText: {
//     color: "#0C5273",
//     fontSize: 13.5,
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });

// export default OrderCard;









// import React from "react";
// import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
// import { shipmentStageMap } from "../constants/shipmentStatusMap";

// const statusIcons = {
//   "Delivered": require("../assets/icons/delivered.png"),
//   "In Transit": require("../assets/icons/in_transit.png"),
//   "Processing": require("../assets/icons/in_transit.png"),
//   "Cancelled": require("../assets/icons/cancelled.png"),
//   "Order Placed": require("../assets/icons/in_transit.png"),
//   "Out for Delivery": require("../assets/icons/in_transit.png"),
//   "Return in Progress": require("../assets/icons/in_transit.png"),
//   "Returned": require("../assets/icons/delivered.png"),
// };

// const MAX_IMAGES_SHOWN = 5;
// const getUserFriendlyStatus = (code) => shipmentStageMap[code] || "Order Placed";

// const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const OrderCard = ({
//   order,
//   onViewDetails,
//   onTrackOrder,
// }) => {
//   const { productImages = [], statusCode, deliveredDate } = order;

//   let statusText = getUserFriendlyStatus(statusCode);
//   const statusIcon = statusIcons[statusText] || null;

//   if (statusText === "Delivered" && deliveredDate) {
//     statusText = `Arrived on ${formatDate(deliveredDate)}`;
//   }

//   // Show “Track Order” button only for these statuses
//   const trackingStatuses = [
//     "In Transit",
//     "Processing",
//     "Order Placed",
//     "Out for Delivery",
//     "Return in Progress",
//   ];
//   const showTrackOrder = trackingStatuses.includes(getUserFriendlyStatus(statusCode));

//   const extraCount = productImages.length > MAX_IMAGES_SHOWN
//     ? productImages.length - MAX_IMAGES_SHOWN
//     : 0;

//   return (
//     <View style={styles.card}>
//       <View style={styles.headerRow}>
//         <View style={styles.headerLeft}>
//           {statusIcon && (
//             <Image source={statusIcon} style={styles.statusIcon} />
//           )}
//           <View style={styles.headerText}>
//             <Text style={styles.statusText}>{statusText}</Text>
//             <Text style={styles.amountText}>₹{order.totalAmount}</Text>
//           </View>
//         </View>
//         <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.imagesRow}>
//         {productImages.slice(0, MAX_IMAGES_SHOWN).map((img, idx) => (
//           <View style={styles.imageBox} key={idx}>
//             <Image
//               source={{ uri: img }}
//               style={styles.productImage}
//               resizeMode="contain"
//             />
//           </View>
//         ))}
//         {extraCount > 0 && (
//           <View style={styles.imageBox}>
//             <Text style={styles.extraText}>+{extraCount}</Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.actionsContainer}>
//         {showTrackOrder && (
//           <>
//             <TouchableOpacity onPress={() => onTrackOrder(order)} style={styles.actionItem}>
//               <Text style={styles.actionText}>Track Order</Text>
//             </TouchableOpacity>
//             <View style={styles.verticalDivider} />
//           </>
//         )}
//         <TouchableOpacity onPress={() => onViewDetails(order)} style={styles.actionItem}>
//           <Text style={styles.actionText}>View Details</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     marginBottom: 1,
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     paddingRight: 8,
//   },
//   statusIcon: { width: 30, height: 30, marginRight: 8 },
//   headerText: { flexDirection: "column" },
//   statusText: {
//     fontWeight: "700",
//     fontSize: 16,
//     marginBottom: 2,
//     color: "#000",
//   },
//   amountText: { fontSize: 13, color: "#6B7280" },
//   dateText: { fontSize: 12, color: "#6B7280", justifyContent: "center" },
//   divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
//   imagesRow: { flexDirection: "row", alignItems: "center" },
//   imageBox: {
//     width: 52,
//     height: 52,
//     borderRadius: 10,
//     marginRight: 8,
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   productImage: { width: 46, height: 46, borderRadius: 8 },
//   extraText: { fontWeight: "700", fontSize: 11, color: "#6B7280" },
//   actionsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 2,
//   },
//   actionItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//   },
//   verticalDivider: {
//     width: 1,
//     backgroundColor: "#E5E7EB",
//     height: "100%",
//     alignSelf: "center",
//   },
//   actionText: {
//     color: "#0C5273",
//     fontSize: 13.5,
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });

// export default OrderCard;








import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { shipmentStageMap } from "../constants/shipmentStatusMap";

const statusIcons = {
  "Delivered": require("../assets/icons/delivered.png"),
  "In Transit": require("../assets/icons/in_transit.png"),
  "Processing": require("../assets/icons/in_transit.png"),
  "Cancelled": require("../assets/icons/cancelled.png"),
  "Order Placed": require("../assets/icons/in_transit.png"),
  "Out for Delivery": require("../assets/icons/in_transit.png"),
  "Return in Progress": require("../assets/icons/in_transit.png"),
  "Returned": require("../assets/icons/delivered.png"),
};

const getUserFriendlyStatus = (code) => shipmentStageMap[code] || "Order Placed";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const OrderCard = ({ order, onViewDetails, onTrackOrder }) => {
  const { productImages = [], statusCode, deliveredDate } = order;

  let statusText = getUserFriendlyStatus(statusCode);
  const statusIcon = statusIcons[statusText] || null;

  if (statusText === "Delivered" && deliveredDate) {
    statusText = `Arrived on ${formatDate(deliveredDate)}`;
  }

  const trackingStatuses = [
    "In Transit",
    "Processing",
    "Order Placed",
    "Out for Delivery",
    "Return in Progress",
  ];
  const showTrackOrder = trackingStatuses.includes(getUserFriendlyStatus(statusCode));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {statusIcon && (
            <Image source={statusIcon} style={styles.statusIcon} />
          )}
          <View style={styles.headerText}>
            <Text
              style={styles.statusText}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              {statusText}
            </Text>
            <Text
              style={styles.amountText}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              ₹{order.totalAmount}
            </Text>
          </View>
        </View>
        <Text
          style={styles.dateText}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.8}
        >
          {formatDate(order.createdAt)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Product Images */}
      <View style={styles.imagesRow}>
        {productImages.slice(0, 4).map((img, idx) => (
          <View style={styles.imageBox} key={idx}>
            <Image
              source={{ uri: img }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>
        ))}

        {productImages.length > 4 && (
          <View style={styles.imageBox}>
            <Text
              style={styles.extraText}
              adjustsFontSizeToFit
              numberOfLines={1}
              minimumFontScale={0.8}
            >
              +{productImages.length - 4}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {showTrackOrder && (
          <>
            <TouchableOpacity
              onPress={() => onTrackOrder(order)}
              style={styles.actionItem}
            >
              <Text
                style={styles.actionText}
                adjustsFontSizeToFit
                numberOfLines={1}
                minimumFontScale={0.8}
              >
                Track Order
              </Text>
            </TouchableOpacity>
            <View style={styles.verticalDivider} />
          </>
        )}
        <TouchableOpacity
          onPress={() => onViewDetails(order)}
          style={styles.actionItem}
        >
          <Text
            style={styles.actionText}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.8}
          >
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  statusIcon: { width: 30, height: 30, marginRight: 8 },
  headerText: { flexDirection: "column" },
  statusText: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 2,
    color: "#000",
  },
  amountText: { fontSize: 13, color: "#6B7280" },
  dateText: { fontSize: 12, color: "#6B7280", justifyContent: "center" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  imagesRow: { flexDirection: "row", alignItems: "center" },
  imageBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productImage: { width: 46, height: 46, borderRadius: 8 },
  extraText: { fontWeight: "700", fontSize: 11, color: "#6B7280" },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    height: "100%",
    alignSelf: "center",
  },
  actionText: {
    color: "#0C5273",
    fontSize: 13.5,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default OrderCard;
