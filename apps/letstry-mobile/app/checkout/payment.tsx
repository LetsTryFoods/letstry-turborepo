import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { RFValue } from '../../src/lib/utils/ui-utils';

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ paymentUrl: string }>();
  const { paymentUrl } = params;
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  console.log('[Payment] Router Params Received:', JSON.stringify(params));

  // The callback URL we are watching for
  const CALLBACK_URL_PATTERN = 'letstryfoods.com/payment-callback';

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Check if we've reached the payment callback URL
    if (url.includes(CALLBACK_URL_PATTERN)) {
      console.log('[Payment] Intercepted callback URL:', url);
      
      // Parse query parameters
      const params = new URL(url).searchParams;
      const status = params.get('status');
      const orderId = params.get('orderId');
      const paymentOrderId = params.get('paymentOrderId');

      if (status === 'success') {
        router.replace({
          pathname: '/checkout/success',
          params: { orderId: orderId || '' }
        });
      } else {
        router.replace({
          pathname: '/checkout/failed',
          params: { 
            paymentOrderId: paymentOrderId || '',
            error: 'Payment was not successful'
          }
        });
      }
    }
  };

  if (!paymentUrl) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="link-outline" size={48} color={theme.colors.text.muted} />
        <Text style={styles.errorTitle}>Payment URL Missing</Text>
        <Text style={styles.errorSubtitle}>
          We couldn't initialize the secure payment gateway. Please go back and try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Attempt to decode the URL safely
  let finalUrl = paymentUrl;
  try {
    if (paymentUrl.includes('%')) {
      finalUrl = decodeURIComponent(paymentUrl);
    }
  } catch (e) {
    console.error('[Payment] Decode Error:', e);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Secure Payment',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: finalUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading Secure Gateway...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: RFValue(14),
    color: theme.colors.text.muted,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: RFValue(14),
    color: theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#fff',
  },
});
