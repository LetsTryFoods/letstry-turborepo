
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NoInternetScreen = () => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    NetInfo.fetch().then(state => {
      // Add logic to refresh network state if needed
      setRetrying(false);
    });
  };

  return (
    <View style={styles.container}>
      {/* ✅ LOCAL IMAGE WORKS OFFLINE */}
      <Image
        source={require('../assets/images/no.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title} allowFontScaling={false} adjustsFontSizeToFit>No Connection</Text>
      <Text style={styles.message} allowFontScaling={false} adjustsFontSizeToFit>
        No internet connection found. Please check your connection.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRetry}
        disabled={retrying}>
        {retrying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText} allowFontScaling={false} adjustsFontSizeToFit>TRY AGAIN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d4a400',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1e3a56',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoInternetScreen;