import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkUpiStatus } from '../services/PaymentService';
import { useAuth } from '../context/AuthContext';

const WebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { htmlContent, returnUrl, orderId } = route.params;
  const { idToken } = useAuth();

  // Modern BackHandler usage with pop(2)
  useEffect(() => {
    const backAction = () => {
      navigation.pop(2); // Go back two screens to PaymentScreen
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [navigation]);

  // Recursive polling with setTimeout
  useEffect(() => {
    let cancelled = false;

    const pollStatus = async () => {
      if (cancelled) return;
      try {
        console.log(`Checking status for orderId: ${orderId}`);
        const result = await checkUpiStatus(orderId, idToken);
        console.log(`Status received: ${result.status}`);

        if (result.txnStatus === '0') {
          navigation.replace('PaymentSuccessScreen', { orderId });
        } else if (result.txnStatus === '1') {
          navigation.replace('PaymentFailedScreen', { orderId });
        } else {
          setTimeout(pollStatus, 3000);
        }
      } catch (err) {
        console.log('Polling error:', err.message);
        setTimeout(pollStatus, 3000);
      }
    };

    if (orderId) pollStatus();
    return () => { cancelled = true; };
  }, [orderId, navigation, idToken]);

  const handleNavigationStateChange = (navState) => {
    if (navState.url.includes(returnUrl)) {
      // Optionally handle return URL
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            color="#20546b"
            size="large"
            style={styles.loading}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
});

export default WebViewScreen;
