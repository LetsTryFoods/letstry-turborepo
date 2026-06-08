import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActionEngine, SDUIAction } from "../ActionEngine";
import { useAuthStore } from "../../../store/auth-store";

interface ProfileLink {
  id: string;
  label: string;
  icon: string; // Ionicons name
  action: SDUIAction;
  requiresAuth?: boolean; // If true, shows a login prompt if not authenticated
  iconColor?: string;
  chevronColor?: string;
}

interface LinkSectionProps {
  title?: string;
  links: ProfileLink[];
  iconColor?: string; // Default icon color for all links
  accentColor?: string;
  labelFontSize?: number;
  sectionTitleFontSize?: number;
}

/**
 * A dynamic menu section that renders a group of navigation links.
 * Each link's action (NAVIGATE, OPEN_URL, API_CALL) is executed via ActionEngine.
 * This is the core SDUI component for the Profile screen.
 *
 * NEW SCREEN FLOW:
 * If a link's action has destination = "/(tabs)/referral_program",
 * the generic [screenId].tsx handler will pick it up and fetch the SDUI layout
 * for "referral_program" automatically. No new code needed!
 */
const LinkSection: React.FC<LinkSectionProps> = ({
  title,
  links = [],
  iconColor = "#E8A020",
  accentColor,
  labelFontSize = 15,
  sectionTitleFontSize = 11,
}) => {
  const { isAuthenticated } = useAuthStore();

  const handlePress = (link: ProfileLink) => {
    if (link.requiresAuth && !isAuthenticated) {
      Alert.alert("Login Required", "Please log in to access this feature.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login Now",
          onPress: () =>
            ActionEngine.execute({
              type: "NAVIGATE",
              destination: "/auth/login",
            }),
        },
      ]);
      return;
    }
    ActionEngine.execute(link.action);
  };

  return (
    <View style={styles.section}>
      {title && (
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
          {title}
        </Text>
      )}
      {links.map((link, index) => (
        <TouchableOpacity
          key={link.id}
          style={[styles.item, index === links.length - 1 && styles.lastItem]}
          onPress={() => handlePress(link)}
          activeOpacity={0.7}
        >
          <View style={styles.itemContent}>
            <Ionicons
              name={link.icon as any}
              size={22}
              color={link.iconColor || iconColor}
            />
            <Text style={[styles.itemLabel, { fontSize: labelFontSize }]}>
              {link.label}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={link.chevronColor || "#CCCCCC"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#AAAAAA",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  itemLabel: {
    color: "#1A1A1A",
    fontWeight: "500",
  },
});

export default LinkSection;
