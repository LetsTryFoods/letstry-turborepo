import React from 'react';
import NetworkLogger from 'react-native-network-logger';
import { Stack, useRouter } from 'expo-router';
import { theme } from '../src/styles/theme';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NetworkLogsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Network Logs',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text.primary,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ionicons
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      {/* @ts-ignore - NetworkLogger type mismatch with modern React */}
      <NetworkLogger theme="light" />
    </>
  );
}
