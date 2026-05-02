import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { SDUIService } from '../../src/features/home/services/sdui.service';
import { SDUIRenderer } from '../../src/lib/sdui/SDUIRenderer';

// Default fallback layout if the server is unreachable
const FALLBACK_COMPONENTS = [
  { type: 'ProfileHeader', props: {} },
  { type: 'AuthCard', props: {} },
  {
    type: 'LinkSection',
    props: {
      title: 'Account',
      links: [
        { id: 'my_orders', label: 'My Orders', icon: 'receipt-outline', requiresAuth: true, action: { type: 'NAVIGATE', destination: '/orders' } },
        { id: 'my_addresses', label: 'My Addresses', icon: 'location-outline', requiresAuth: true, action: { type: 'NAVIGATE', destination: '/checkout/location' } },
      ]
    }
  },
  {
    type: 'LinkSection',
    props: {
      title: 'Support & Queries',
      links: [
        { id: 'track_order', label: 'Track Order', icon: 'bus-outline', action: { type: 'NAVIGATE', destination: '/orders/track' } },
        { id: 'contact_queries', label: 'Contact Queries', icon: 'help-circle-outline', action: { type: 'NAVIGATE', destination: '/support/contact' } },
      ]
    }
  },
  { type: 'LogoutButton', props: {} }
];

export default function ProfileScreen() {
  const { data: sduiData } = useQuery({
    queryKey: ['sdui', 'profile_screen'],
    queryFn: () => SDUIService.getScreenConfig('profile_screen'),
    staleTime: 1000 * 60 * 5,
  });

  const components = sduiData?.components || FALLBACK_COMPONENTS;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SDUIRenderer components={components} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  scroll: { paddingVertical: 8, paddingBottom: 40 },
});
