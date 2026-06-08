import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/auth-store";

interface AuthCardProps {
  accentColor?: string;
  cardBackgroundColor?: string;
  titleFontSize?: number;
  subtitleFontSize?: number;
}

/**
 * A "Smart" SDUI component that reads the auth store directly.
 * The server only controls cosmetic aspects (colors).
 */
const AuthCard: React.FC<AuthCardProps> = ({
  accentColor = "#E8A020",
  cardBackgroundColor = "#FFFFFF",
  titleFontSize = 15,
  subtitleFontSize = 12,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const handlePress = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.authCard, { backgroundColor: cardBackgroundColor }]}
      onPress={handlePress}
      activeOpacity={isAuthenticated ? 1 : 0.8}
    >
      <View style={[styles.authIconWrap, { backgroundColor: accentColor }]}>
        <Ionicons
          name={isAuthenticated ? "person" : "person-add"}
          size={24}
          color="#fff"
        />
      </View>
      <View style={styles.authInfo}>
        <Text style={[styles.authTitle, { fontSize: titleFontSize }]}>
          {isAuthenticated
            ? user?.firstName || "Welcome Back!"
            : "Login / Sign Up"}
        </Text>
        <Text style={[styles.authSubtitle, { fontSize: subtitleFontSize }]}>
          {isAuthenticated
            ? user?.phoneNumber || "Manage your account"
            : "Get personalized experience & track orders"}
        </Text>
      </View>
      {!isAuthenticated && (
        <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  authCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  authIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  authInfo: { flex: 1 },
  authTitle: {
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  authSubtitle: {
    color: "#888",
  },
});

export default AuthCard;
