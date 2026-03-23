import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

const FreeGiftProgress = ({
  title,
  message,
  amountToAdd,
  progressPercentage,
  threshold,
  buttonDisabled = true,
  buttonText = "Unlock",
  onButtonPress,
  unlocked = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.giftImagesContainer}>
            <View style={styles.giftImage}>
              <Text style={styles.giftImageText}>🥤</Text>
            </View>
            <View style={styles.giftImage}>
              <Text style={styles.giftImageText}>🧃</Text>
            </View>
            <View style={styles.giftImage}>
              <Text style={styles.giftImageText}>🍹</Text>
            </View>
            <View style={styles.giftImage}>
              <Text style={styles.giftImageText}>+2</Text>
            </View>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>₹0</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, buttonDisabled ? styles.actionButtonDisabled : styles.actionButtonEnabled]}
            disabled={buttonDisabled}
            onPress={onButtonPress}
          >
            <Text
              style={[
                styles.actionButtonText,
                buttonDisabled ? styles.actionButtonTextDisabled : styles.actionButtonTextEnabled,
              ]}
            >
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          {unlocked ? (
            <Text style={styles.unlockedText}>Yay! Free gift unlocked!</Text>
          ) : (
            <>
              <Text style={styles.progressText}>Shop for ₹{amountToAdd.toFixed(0)} more to unlock special price</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8F8F8",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  giftImagesContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  giftImage: {
    width: 36,
    height: 36,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  giftImageText: {
    fontSize: 18,
  },
  messageContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  priceTag: {
    backgroundColor: "#FFEB3B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtonDisabled: {
    borderColor: "#CCCCCC",
    backgroundColor: "white",
  },
  actionButtonEnabled: {
    borderColor: "#E91E63",
    backgroundColor: "white",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButtonTextDisabled: {
    color: "#CCCCCC",
  },
  actionButtonTextEnabled: {
    color: "#E91E63",
  },
  progressContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#F9F9F9",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  unlockedText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF4081",
    borderRadius: 4,
  },
})

export default FreeGiftProgress