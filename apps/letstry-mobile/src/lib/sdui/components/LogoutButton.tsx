import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/auth-store";

interface LogoutButtonProps {
  label?: string;
  textColor?: string;
  iconColor?: string;
}

/**
 * A "Smart" SDUI component that only renders if the user is authenticated.
 * The server just includes it in the payload and the component handles
 * its own visibility logic internally.
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({
  label = "Logout",
  textColor = "#FF3B30",
  iconColor = "#FF3B30",
}) => {
  const { isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => logout()}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <Ionicons name="log-out-outline" size={22} color={iconColor} />
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 40,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default LogoutButton;
