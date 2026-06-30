import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments } from "expo-router";
import { ApolloProvider, gql } from "@apollo/client";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { client as apolloClient } from "../src/lib/apollo-client";
import CartModal from "../src/features/cart/components/CartModal";
import ViewCartBar from "../src/features/cart/components/ViewCartBar";
import { startNetworkLogging } from "react-native-network-logger";
import { GuestService } from "../src/features/auth/services/guest.service";
import { useAuthStore } from "../src/store/auth-store";
import * as SplashScreen from "expo-splash-screen";
import SpInAppUpdates, { IAUUpdateKind } from "sp-react-native-in-app-updates";
import Constants from "expo-constants";
import { compareVersions } from "compare-versions";
import { Platform } from "react-native";

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

// Initialize network logger only in development
if (__DEV__) {
  startNetworkLogging({
    maxRequests: 100,
  });
}

// Temporary instance for anything tanstack-related
const queryClient = new QueryClient();

export default function RootLayout() {
  const segments = useSegments();
  const { isInitialized, setInitialized } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        await GuestService.ensureGuestSession();
        
        // Check for updates
        try {
          const { data } = await apolloClient.query({
            query: gql`
              query GetGlobalSettings {
                getGlobalSettings {
                  minAppVersionAndroid
                  minAppVersionIos
                }
              }
            `,
            fetchPolicy: 'network-only'
          });

          const minAndroid = data?.getGlobalSettings?.minAppVersionAndroid || '1.0.0';
          const minIos = data?.getGlobalSettings?.minAppVersionIos || '1.0.0';
          const currentVersion = Constants.expoConfig?.version || '1.0.0';
          const minRequired = Platform.OS === 'android' ? minAndroid : minIos;

          const inAppUpdates = new SpInAppUpdates(false);
          const updateResult = await inAppUpdates.checkNeedsUpdate();

          if (updateResult.shouldUpdate) {
            const isHardUpdate = compareVersions(currentVersion, minRequired) < 0;
            inAppUpdates.startUpdate({
              updateType: isHardUpdate ? IAUUpdateKind.IMMEDIATE : IAUUpdateKind.FLEXIBLE,
            });
          }
        } catch (updateError) {
          console.log('Failed to check for updates:', updateError);
        }

      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setInitialized(true);
        // Hide splash screen after initialization
        await SplashScreen.hideAsync().catch(() => {
          /* ignore */
        });
      }
    };
    init();
  }, []);

  if (!isInitialized) {
    return null;
  }

  const isHomeRoute =
    segments[0] === "(tabs)" &&
    (segments.length === 1 || (segments[1] as string) === "index");
  const isProductRoute = segments[0] === "product";
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
