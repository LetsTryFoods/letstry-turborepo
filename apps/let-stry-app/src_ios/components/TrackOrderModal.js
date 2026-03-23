// // import React from "react";
// // import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
// // import { RFValue } from "react-native-responsive-fontsize";
// // import { getUserFriendlyStatus } from "../constants/shipmentStatusMap";

// // const icons = {
// //   "Order Placed": require("../assets/icons/order_placed.png"),
// //   "In Transit": require("../assets/icons/in_transit.png"),
// //   "Out for Delivery": require("../assets/icons/out_for_delivery.png"),
// //   "Delivered": require("../assets/icons/delivered.png"),
// //   "Processing": require("../assets/icons/in_transit.png") // fallback
// // };

// // const TrackOrderModal = ({ visible, onClose, activities }) => {
// //   return (
// //     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
// //       <View style={styles.overlay}>
// //         <View style={styles.container}>
// //           {/* Header */}
// //           <View style={styles.header}>
// //             <Text style={styles.title}>Tracking Details</Text>
// //             <TouchableOpacity onPress={onClose}>
// //               <Text style={styles.close}>×</Text>
// //             </TouchableOpacity>
// //           </View>

// //           {/* Timeline */}
// //           <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
// //             {activities.length === 0 && (
// //               <Text style={styles.noActivityText}>No tracking activities found.</Text>
// //             )}
// //             {activities.map((act, idx) => {
// //               const statusKey = act["sr-status"] || act["sr-status-label"] || act.status;
// //               const stage = getUserFriendlyStatus(statusKey);
// //               const icon = icons[stage] || icons["Processing"];
// //               return (
// //                 <View key={idx} style={styles.stepRow}>
// //                   <Image source={icon} style={styles.stageIcon} />
// //                   <View style={styles.stepContent}>
// //                     <Text style={styles.stageText}>{stage}</Text>
// //                     <Text style={styles.activityText}>{act.activity}</Text>
// //                     <Text style={styles.dateText}>{act.date} | {act.location}</Text>
// //                   </View>
// //                   {/* Draw connector */}
// //                   {idx < activities.length - 1 && (
// //                     <View style={styles.connector} />
// //                   )}
// //                 </View>
// //               );
// //             })}
// //           </ScrollView>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.2)",
// //     justifyContent: "flex-end",
// //   },
// //   container: {
// //     backgroundColor: "#fff",
// //     borderTopLeftRadius: 18,
// //     borderTopRightRadius: 18,
// //     padding: 18,
// //     minHeight: 370,
// //     maxHeight: "69%",
// //     elevation: 8,
// //   },
// //   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
// //   title: { fontSize: RFValue(16), fontWeight: "700" },
// //   close: { fontSize: RFValue(25), color: "#999" },
// //   stepRow: {
// //     flexDirection: "row",
// //     alignItems: "flex-start",
// //     marginBottom: 20,
// //     position: "relative"
// //   },
// //   stageIcon: { width: 24, height: 24, marginRight: 12, alignSelf: "center" },
// //   stepContent: { flex: 1 },
// //   stageText: { fontSize: 14.5, fontWeight: "700", color: "#222" },
// //   activityText: { fontSize: 13, color: "#555", marginVertical: 2 },
// //   dateText: { fontSize: 12, color: "#888" },
// //   connector: {
// //     position: "absolute",
// //     left: 12,
// //     top: 27,
// //     width: 2,
// //     height: 30,
// //     backgroundColor: "#E5E7EB",
// //     zIndex: 2,
// //   },
// //   noActivityText: { textAlign: "center", marginTop: 24, fontSize: 15, color: "#999" },
// // });

// // export default TrackOrderModal;





// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   Modal,
// } from "react-native";
// import checkIcon from "../assets/icons/delivered.png"; // Your green check asset
// import { getUserFriendlyStatus } from "../constants/shipmentStatusMap";

// const CHECKPOINTS = ["Order Placed", "In Transit", "Out for Delivery", "Delivered"];

// const OrderTrackModal = ({ visible, onClose, activities }) => {
//   // Determine current step index based on max status from activities
//   const getCurrentStepIndex = () => {
//     if (!activities || activities.length === 0) return 0;

//     // Normalize statuses of activities using your map function
//     const statuses = activities.map(act => {
//       let status = act["sr-status-label"] || act["sr-status"] || act.status || "";
//       status = typeof status === "string" ? status.toUpperCase() : status.toString();
      
//       // Fallback: if status is "NA" or empty, treat as "ORDER PLACED"
//       if (status === "NA" || status.trim() === "") {
//         return "ORDER PLACED";
//       }

//       return getUserFriendlyStatus(status).toUpperCase();
//     });

//     // Find max progress index in CHECKPOINTS
//     let maxIndex = 0;
//     statuses.forEach(status => {
//       const idx = CHECKPOINTS.indexOf(status);
//       if (idx > maxIndex) maxIndex = idx;
//     });

//     return maxIndex;
//   };

//   const currentStepIndex = getCurrentStepIndex();

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalBackdrop}>
//         <View style={styles.modalContainer}>
//           <View style={styles.header}>
//             <Text style={styles.title}>Tracking Details</Text>
//             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//               <Text style={styles.close}>×</Text>
//             </TouchableOpacity>
//           </View>
//           <ScrollView
//             contentContainerStyle={styles.contentContainer}
//             showsVerticalScrollIndicator={false}
//           >
//             {CHECKPOINTS.map((step, idx) => {
//               const completed = idx <= currentStepIndex;
//               const isCurrent = idx === currentStepIndex;

//               return (
//                 <View
//                   key={step}
//                   style={[styles.stepContainer, isCurrent && styles.currentStep]}
//                 >
//                   <View style={styles.iconColumn}>
//                     {completed ? (
//                       <View style={styles.completedCircle}>
//                         <Image source={checkIcon} style={styles.checkIcon} />
//                       </View>
//                     ) : (
//                       <View style={styles.incompleteCircle} />
//                     )}
//                     {idx < CHECKPOINTS.length - 1 && <View style={styles.verticalLine} />}
//                   </View>

//                   <View style={styles.textColumn}>
//                     <Text
//                       style={[
//                         styles.stepText,
//                         completed ? styles.completedText : styles.incompleteText,
//                         isCurrent && styles.currentText,
//                       ]}
//                     >
//                       {step}
//                     </Text>
//                   </View>
//                 </View>
//               );
//             })}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalBackdrop: {
//     flex:1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     paddingHorizontal: 24,
//     paddingVertical: 20,
//     maxHeight: "70%",
//   },
//   contentContainer: {
//     paddingBottom: 40,
//   },
//   header: {
//     position: "relative",
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//     marginBottom: 24,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#000",
//     textAlign: "center",
//   },

//   closeButton: {
//     position: "absolute",
//     right: 0,
//     paddingHorizontal: 18,
//     paddingVertical: 4,
//   },
//     close: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#444",
//   },
//   stepContainer: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 24,
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     borderRadius: 12,
//   },
//   currentStep: {
//     backgroundColor: "#e6f9e8",
//   },
//   iconColumn: {
//     alignItems: "center",
//     width: 36,
//     position: "relative",
//   },
//   completedCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "#47e473",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   checkIcon: {
//     width: 30,
//     height: 30,
//   },
//   incompleteCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     borderWidth: 2,
//     borderColor: "#bbb",
//     backgroundColor: "#fff",
//   },
//   verticalLine: {
//     position: "absolute",
//     top: 34,
//     left: 13,
//     width: 2,
//     height: "100%",
//     backgroundColor: "#d4d4d4",
//   },
//   textColumn: {
//     flex: 1,
//     marginLeft: 16,
//     paddingTop: 2,
//   },
//   stepText: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   completedText: {
//     color: "#228b22",
//   },
//   incompleteText: {
//     color: "#999",
//   },
//   currentText: {
//     color: "#1e7013",
//     fontWeight: "700",
//   },
// });

// export default OrderTrackModal;












// OrderTrackModal.js - CORRECTED

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import checkIcon from "../assets/icons/delivered.png"; // Make sure this path is correct
import { getUserFriendlyStatus } from "../constants/shipmentStatusMap"; // Assuming this function exists

const CHECKPOINTS = ["Order Placed", "In Transit", "Out for Delivery", "Delivered"];

const OrderTrackModal = ({ visible, onClose, activities }) => {
  // Determine current step index based on max status from activities
  const getCurrentStepIndex = () => {
    if (!activities || activities.length === 0) return 0;

    // Normalize statuses of activities using your map function
    const statuses = activities.map(act => {
      let status = act["sr-status-label"] || act["sr-status"] || act.status || "";
      
      // The original `status` from the API is often uppercase, so we keep this conversion
      status = typeof status === "string" ? status.toUpperCase() : status.toString();
      
      // Fallback: if status is "NA" or empty, treat as "Order Placed"
      if (status === "NA" || status.trim() === "") {
        return "Order Placed";
      }

      // **THE FIX IS HERE:** We call getUserFriendlyStatus but do NOT convert its output to uppercase.
      // This assumes getUserFriendlyStatus returns a Title Case string that matches CHECKPOINTS.
      return getUserFriendlyStatus(status);
    });

    // Find max progress index in CHECKPOINTS
    let maxIndex = 0;
    statuses.forEach(status => {
      const idx = CHECKPOINTS.indexOf(status);
      if (idx > maxIndex) maxIndex = idx;
    });

    return maxIndex;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Tracking Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {CHECKPOINTS.map((step, idx) => {
              const completed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <View
                  key={step}
                  style={[styles.stepContainer, isCurrent && styles.currentStep]}
                >
                  <View style={styles.iconColumn}>
                    {completed ? (
                      <View style={styles.completedCircle}>
                        <Image source={checkIcon} style={styles.checkIcon} />
                      </View>
                    ) : (
                      <View style={styles.incompleteCircle} />
                    )}
                    {idx < CHECKPOINTS.length - 1 && <View style={styles.verticalLine} />}
                  </View>

                  <View style={styles.textColumn}>
                    <Text
                      style={[
                        styles.stepText,
                        completed ? styles.completedText : styles.incompleteText,
                        isCurrent && styles.currentText,
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex:1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxHeight: "70%",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    position: "relative",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },

  closeButton: {
    position: "absolute",
    right: 0,
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
    close: {
    fontSize: 28,
    fontWeight: "700",
    color: "#444",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  currentStep: {
    backgroundColor: "#e6f9e8",
  },
  iconColumn: {
    alignItems: "center",
    width: 36,
    position: "relative",
  },
  completedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#47e473",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 30,
    height: 30,
  },
  incompleteCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#bbb",
    backgroundColor: "#fff",
  },
  verticalLine: {
    position: "absolute",
    top: 34,
    left: 13,
    width: 2,
    height: "100%",
    backgroundColor: "#d4d4d4",
  },
  textColumn: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 2,
  },
  stepText: {
    fontSize: 16,
    fontWeight: "600",
  },
  completedText: {
    color: "#228b22",
  },
  incompleteText: {
    color: "#999",
  },
  currentText: {
    color: "#1e7013",
    fontWeight: "700",
  },
});

export default OrderTrackModal;