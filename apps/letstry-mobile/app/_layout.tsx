import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useSegments } from 'expo-router';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { client as apolloClient } from '../src/lib/apollo-client';
import CartModal from '../src/features/cart/components/CartModal';
import ViewCartBar from '../src/features/cart/components/ViewCartBar';
import { startNetworkLogging } from 'react-native-network-logger';
import { GuestService } from '../src/features/auth/services/guest.service';
import { useAuthStore } from '../src/store/auth-store';

// Initialize network logger
startNetworkLogging({
  maxRequests: 50,
  ignoredHosts: ['localhost', '127.0.0.1'],
});

// Temporary instance for anything tanstack-related
const queryClient = new QueryClient();

export default function RootLayout() {
  const segments = useSegments();
  const { isInitialized, setInitialized } = useAuthStore();
  
  useEffect(() => {
    const init = async () => {
      await GuestService.ensureGuestSession();
      setInitialized(true);
    };
    init().catch(console.error);
  }, []);

  if (!isInitialized) {
    return null; // Or a splash screen
  }

  const isHomeRoute = segments[0] === '(tabs)' && (segments.length === 1 || (segments[1] as string) === 'index');
  const isProductRoute = segments[0] === 'product';
  const shouldShowCartBar = isHomeRoute || isProductRoute;

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <CartModal />
          {shouldShowCartBar && <ViewCartBar />}
        </SafeAreaProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
}
