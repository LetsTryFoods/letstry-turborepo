import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { SDUIService } from "../../src/features/home/services/sdui.service";
import { SDUIRenderer } from "../../src/lib/sdui/SDUIRenderer";

// Default fallback layout if the server is unreachable
const FALLBACK_COMPONENTS = [
  { type: "ProfileHeader", props: {} },
  { type: "AuthCard", props: {} },
  {
    type: "LinkSection",
    props: {
      title: "Account",
      links: [
        {
          id: "my_orders",
          label: "My Orders",
          icon: "receipt-outline",
          action: { type: "NAVIGATE", destination: "/orders" },
        },
        {
          id: "my_addresses",
          label: "My Addresses",
          icon: "location-outline",
          requiresAuth: true,
          action: { type: "NAVIGATE", destination: "/checkout/location" },
        },
      ],
    },
  },
  {
    type: "LinkSection",
    props: {
      title: "Support & Queries",
      links: [
        {
          id: "track_order",
          label: "Track Order",
          icon: "bus-outline",
          action: { type: "NAVIGATE", destination: "/orders/track" },
        },
        {
          id: "contact_queries",
          label: "Contact Queries",
          icon: "help-circle-outline",
          action: { type: "NAVIGATE", destination: "/support/contact" },
        },
      ],
    },
  },
  { type: "LogoutButton", props: {} },
];

export default function ProfileScreen() {
  const { data: sduiData } = useQuery({
    queryKey: ["sdui", "profile_screen"],
    queryFn: () => SDUIService.getScreenConfig("profile_screen"),
    staleTime: 1000 * 60 * 5,
  });

  const components = [...(sduiData?.components || FALLBACK_COMPONENTS)];

  // Ensure Network Logs is only available for local debugging
  if (__DEV__) {
    const hasNetworkLogs = components.some(c =>
      c.type === 'LinkSection' &&
      c.props?.links?.some((l: any) => l.id === 'network_logs')
    );

    if (!hasNetworkLogs) {
      const debugSection = {
        type: 'LinkSection',
        props: {
          title: 'Debug',
          links: [
            { id: 'network_logs', label: 'Network Logs', icon: 'pulse-outline', action: { type: 'NAVIGATE', destination: '/network-logs' } },
          ]
        }
      };

      const logoutIndex = components.findIndex(c => c.type === 'LogoutButton');
      if (logoutIndex !== -1) {
        components.splice(logoutIndex, 0, debugSection);
      } else {
        components.push(debugSection);
      }
    }
  } else {
    // If we're in production, strip it out if it accidentally came from the server
    components.forEach((c) => {
      if (c.type === 'LinkSection' && c.props?.links) {
        c.props.links = c.props.links.filter((l: any) => l.id !== 'network_logs');
      }
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SDUIRenderer components={components} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F9FB" },
  scroll: { paddingVertical: 8, paddingBottom: 40 },
});
