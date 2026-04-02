import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { REVERSE_GEOCODE, GET_MY_ADDRESSES } from '../../src/lib/graphql/address';
import { wp, hp, RFValue } from '../../src/lib/utils/ui-utils';
import { theme } from '../../src/styles/theme';

const INITIAL_REGION = {
  latitude: 28.6139,
  longitude: 77.2090,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function LocationSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [address, setAddress] = useState<string>('Locating...');
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addressComponents, setAddressComponents] = useState({
    locality: '',
    region: '',
    country: '',
    postalCode: '',
  });

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const params = useLocalSearchParams<{ latitude?: string; longitude?: string; address?: string }>();

  // GraphQL Calls
  const { data: addressesData, loading: addressesLoading } = useQuery(GET_MY_ADDRESSES, {
    onCompleted: (data) => {
      if (!data?.myAddresses?.length) {
        setViewMode('map');
      }
    }
  });
  const savedAddresses = addressesData?.myAddresses || [];

  const [fetchReverseGeocode] = useLazyQuery(REVERSE_GEOCODE, {
    onCompleted: (data) => {
      if (data?.reverseGeocode) {
        const { formattedAddress, locality, region, country, postalCode } = data.reverseGeocode;
        setAddress(formattedAddress || 'Unknown Location');
        setAddressComponents({
          locality: locality || '',
          region: region || '',
          country: country || '',
          postalCode: postalCode || '',
        });
      }
      setIsFetchingAddress(false);
    },
    onError: () => {
      setAddress('Address not found');
      setIsFetchingAddress(false);
    }
  });

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      resolveAddress(newRegion.latitude, newRegion.longitude);
    } catch (error) {
      setErrorMsg('Error getting location');
    }
  };

  const resolveAddress = useCallback((lat: number, lng: number) => {
    setIsFetchingAddress(true);
    fetchReverseGeocode({
      variables: {
        input: { latitude: lat, longitude: lng }
      }
    });
  }, [fetchReverseGeocode]);

  useEffect(() => {
    if (params.latitude && params.longitude) {
      const newRegion = {
        latitude: parseFloat(params.latitude),
        longitude: parseFloat(params.longitude),
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      setViewMode('map');
      if (params.address) {
        setAddress(params.address);
      }
      setTimeout(() => {
        mapRef.current?.animateToRegion(newRegion, 1000);
      }, 500);
    } else {
      handleGetCurrentLocation();
    }
  }, [params.latitude, params.longitude]);

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    resolveAddress(newRegion.latitude, newRegion.longitude);
  };

  const handleConfirmLocation = () => {
    router.push({
      pathname: '/checkout/address',
      params: {
        latitude: region.latitude,
        longitude: region.longitude,
        address: address,
        ...addressComponents,
      }
    });
  };

  const handleSelectSavedAddress = (addressId: string) => {
    // Navigate to summary with the selected addressId
    router.push({
      pathname: '/checkout/summary',
      params: { addressId },
    });
  };

  if (addressesLoading && !savedAddresses.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (viewMode === 'list' && savedAddresses.length > 0 && !(params.latitude && params.longitude)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.listHeaderTitle}>Select Delivery Address</Text>
        </View>

        <ScrollView style={styles.listContent} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.listSectionTitle}>Saved Addresses</Text>
          {savedAddresses.map((item: any) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.fullAddressCard, isInitiatingPayment && styles.disabledCard]}
              onPress={() => !isInitiatingPayment && handleSelectSavedAddress(item._id)}
              disabled={isInitiatingPayment}
            >
              <View style={styles.fullAddressIcon}>
                <Ionicons
                  name={item.addressType === 'Home' ? 'home' : item.addressType === 'Work' ? 'briefcase' : 'location'}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.fullAddressInfo}>
                <Text style={styles.fullAddressLabel}>{item.addressType}</Text>
                <Text style={styles.fullAddressRecipient}>{item.recipientName}</Text>
                <Text style={styles.fullAddressSummary}>
                  {item.formattedAddress || `${item.buildingName}, ${item.streetArea}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addNewCard}
            onPress={() => setViewMode('map')}
          >
            <View style={[styles.fullAddressIcon, { backgroundColor: '#F0F7FF' }]}>
              <Ionicons name="add" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.addNewText}>Add New Delivery Address</Text>
          </TouchableOpacity>
        </ScrollView>

        {isInitiatingPayment && (
          <View style={styles.initiatingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.initiatingText}>Preparing Secure Payment...</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* Header with Back Button */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Location</Text>
      </SafeAreaView>

      {/* Search Bar Placeholder */}
      <TouchableOpacity
        style={[styles.searchBar, { top: insets.top + 60 }]}
        onPress={() => router.push('/checkout/search')}
      >
        <Ionicons name="search" size={20} color="#888" />
        <Text style={styles.searchBarText}>Search for your area/building...</Text>
      </TouchableOpacity>

      {/* Center Marker */}
      <View style={styles.markerFixed} pointerEvents="none">
        <View style={styles.markerContainer}>
          <View style={styles.addressBubble}>
            {isFetchingAddress ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.bubbleText} numberOfLines={1}>{address.split(',')[0]}</Text>
            )}
          </View>
          <Ionicons name="location" size={40} color="#FF4B2B" />
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={[styles.myLocationBtn, { bottom: hp('22%') }]}
        onPress={handleGetCurrentLocation}
      >
        <Ionicons name="locate" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Bottom Sheet Context */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.currentAddressContainer}>
          <Ionicons name="location-sharp" size={24} color={theme.colors.primary} />
          <View style={styles.addressTexts}>
            <Text style={styles.mainAddress} numberOfLines={1}>
              {address.split(',')[0]}
            </Text>
            <Text style={styles.subAddress} numberOfLines={2}>
              {address}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmLocation}
        >
          <Text style={styles.confirmBtnText}>Confirm Location & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    backgroundColor: 'rgba(255,255,255,0.9)',
    height: hp('12%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#222',
    marginLeft: 10,
  },
  searchBar: {
    position: 'absolute',
    left: wp('4%'),
    right: wp('4%'),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3.5%'),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  searchBarText: {
    fontSize: RFValue(13),
    color: '#888',
    marginLeft: 10,
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  markerContainer: {
    alignItems: 'center',
  },
  addressBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    minHeight: 30,
    justifyContent: 'center',
    maxWidth: wp('40%'),
  },
  bubbleText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: '#333',
  },
  myLocationBtn: {
    position: 'absolute',
    right: wp('5%'),
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  currentAddressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: wp('5%'),
  },
  addressTexts: {
    marginLeft: 12,
    flex: 1,
  },
  mainAddress: {
    fontSize: RFValue(15),
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  subAddress: {
    fontSize: RFValue(12),
    color: '#666',
  },
  confirmBtn: {
    backgroundColor: '#0C5273',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listHeaderTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#222',
    marginLeft: 12,
  },
  listContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: wp('4%'),
  },
  listSectionTitle: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  fullAddressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  fullAddressInfo: {
    flex: 1,
  },
  fullAddressLabel: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  fullAddressRecipient: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  fullAddressSummary: {
    fontSize: RFValue(11.5),
    color: '#666',
    lineHeight: 16,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
  },
  addNewText: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: theme.colors.primary,
  },
  initiatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  initiatingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: RFValue(15),
    fontWeight: '600',
  },
});
