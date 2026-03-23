
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