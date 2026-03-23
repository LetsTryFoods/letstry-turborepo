import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import NoInternetScreen from '../screens/NoInternetScreen';

const InternetCheckWrapper = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      // Make sure isConnected is boolean true/false
      setIsConnected(state.isConnected === true);
    });

    // Also fetch once on mount to get initial connection state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected === true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isConnected) {
    // Show no internet UI when disconnected
    return <NoInternetScreen />;
  }

  // Show app content when connected
  return <View style={styles.container}>{children}</View>;
};

export default InternetCheckWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});