import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import MapView from "react-native-maps";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useLocation } from "../context/LocationContext";
import { useAddress } from "../context/AddressContext";
import { useAuth } from "../context/AuthContext";
import AddressDetailsForm from '../components/AddressDetailsForm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const SCALE = 0.9;
const { width, height } = Dimensions.get("window");
const GOOGLE_API_KEY = "AIzaSyA44Ri5mmnDX-wE8folHq69LjEy1u8NLF0";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function MapScreen({ navigation, route }) {
  const { location, loading: locationLoading } = useLocation();
  const { addAddress, selectAddress } = useAddress();
  const { user } = useAuth();
  const userPhone = user?.phoneNumber || "";

  const [address, setAddress] = useState("");
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [addressComponents, setAddressComponents] = useState({
    pincode: "",
    city: "",
    state: "",
    country: "",
  });

  const lastRegionRef = useRef(null);
  const mapRef = useRef(null);
  const addressCacheRef = useRef({});
  const fetchAbortControllerRef = useRef(null);
  const insets = useSafeAreaInsets();
  const debouncedRegion = useDebounce(currentRegion, 1000);

  const initialRegion = React.useMemo(() => {
    if (route?.params?.latitude && route?.params?.longitude) {
      return {
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else {
      return {
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
  }, [route?.params, location]);

  const fetchAddress = useCallback(async (lat, lng) => {
    const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
    if (addressCacheRef.current[cacheKey]) {
      setAddress(addressCacheRef.current[cacheKey]);
      return;
    }
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    fetchAbortControllerRef.current = abortController;
    setFetchingAddress(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
        { signal: abortController.signal }
      );
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      if (data.results?.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        if (formattedAddress && formattedAddress.trim() !== "") {
          setAddress(formattedAddress);
          addressCacheRef.current[cacheKey] = formattedAddress;
        }
        // Extract pincode, city, state, country
        const comps = data.results[0].address_components;
        let pincode = "", city = "", state = "", country = "";
        comps.forEach(comp => {
          if (comp.types.includes("postal_code")) pincode = comp.long_name;
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
          if (comp.types.includes("country")) country = comp.long_name;
        });
        setAddressComponents({ pincode, city, state, country });
      } else {
        setAddress("");
        setAddressComponents({ pincode: "", city: "", state: "", country: "" });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching address:', error);
        setAddress("");
      }
    } finally {
      setFetchingAddress(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedRegion) {
      fetchAddress(debouncedRegion.latitude, debouncedRegion.longitude);
      lastRegionRef.current = {
        latitude: debouncedRegion.latitude,
        longitude: debouncedRegion.longitude,
      };
    }
  }, [debouncedRegion, fetchAddress]);

  useEffect(() => {
    if (initialRegion) {
      setCurrentRegion({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
      });
    }
  }, [initialRegion]);

  useEffect(() => {
    if (route?.params?.latitude && route?.params?.longitude) {
      const { latitude, longitude, address: passedAddress } = route.params;
      const region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setTimeout(() => {
        mapRef.current?.animateToRegion(region, 350);
      }, 100);
      lastRegionRef.current = { latitude, longitude };
      setCurrentRegion({ latitude, longitude });
      if (passedAddress) {
        setAddress(passedAddress);
      }
    }
  }, [route?.params]);

  const onRegionChangeComplete = useCallback((newRegion) => {
    const lat = Number(newRegion.latitude.toFixed(6));
    const lng = Number(newRegion.longitude.toFixed(6));
    if (
      !lastRegionRef.current ||
      Math.abs(lat - lastRegionRef.current.latitude) > 0.00001 ||
      Math.abs(lng - lastRegionRef.current.longitude) > 0.00001
    ) {
      setCurrentRegion({ latitude: lat, longitude: lng });
    }
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    if (location) {
      const region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 350);
      lastRegionRef.current = { latitude: location.latitude, longitude: location.longitude };
      setCurrentRegion({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location]);

  const onConfirm = useCallback(() => {
    if (!lastRegionRef.current) return;
    setModalVisible(true);
  }, []);

  const handleSaveAddressDetails = useCallback(async (details) => {
    const newAddress = {
      label: details.label,
      floor: details.floor,
      street: details.street,
      buildingName: details.buildingName,
      landmark: details.landmark,
      pincode: addressComponents.pincode,
      city: addressComponents.city,
      state: addressComponents.state,
      country: addressComponents.country,
      latitude: lastRegionRef.current.latitude,
      longitude: lastRegionRef.current.longitude,
      recipientPhoneNumber: details.recipientPhoneNumber,
      recipientName: details.recipientName,
    };
    console.log("Submitting address:", newAddress);
    await addAddress(newAddress);
    await selectAddress(newAddress);
    setModalVisible(false);
    navigation.goBack();
  }, [addressComponents, addAddress, selectAddress, navigation]);

  useEffect(() => {
    return () => {
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort();
      }
    };
  }, []);

  if (locationLoading || !initialRegion) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Location</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Search Bar Overlay */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() =>
          navigation.navigate('MapSearchScreen', {
            onLocationSelected: (locationObj) => {
              if (locationObj) {
                const { latitude, longitude, address: foundAddress } = locationObj;
                const region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
                mapRef.current?.animateToRegion(region, 350);
                lastRegionRef.current = { latitude, longitude };
                setCurrentRegion({ latitude, longitude });
                if (foundAddress) {
                  setAddress(foundAddress); // instant update from search
                }
              }
            }
          })
        }
        activeOpacity={0.85}
      >
        <MaterialIcons name="search" size={20} color="#888" />
        <Text style={styles.searchBarText}>Search for area, street name...</Text>
      </TouchableOpacity>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      />

      {/* Center Pin */}
      <View pointerEvents="none" style={styles.centerMarkerContainer}>
        {address ? (
          <View style={styles.addressBubble}>
            <Text style={styles.addressBubbleText} numberOfLines={1}>{address.split(",")[0]}</Text>
          </View>
        ) : fetchingAddress ? (
          <View style={styles.addressBubble}>
            <ActivityIndicator size="small" color="#0C5273" />
          </View>
        ) : null}
        <MaterialIcons name="location-on" size={44} color="#fff" style={{ textShadowColor: "#222", textShadowRadius: 6 }} />
      </View>

      {/* Current Location button */}
      <TouchableOpacity style={styles.currentLocBtn} onPress={handleUseCurrentLocation}>
        <MaterialIcons name="my-location" size={22} color="#0C5273" />
      </TouchableOpacity>

      {/* Bottom Card */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 5 }]}>
        <Text style={styles.bottomCardLabel}>Delivering your order to</Text>
        <View style={styles.bottomCardRow}>
          <MaterialIcons name="location-pin" size={22} color="#0C5273" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bottomCardAddress} numberOfLines={1}>
              {address ? address.split(",")[0] : "Select location"}
            </Text>
            <Text style={styles.bottomCardSubtext} numberOfLines={1}>{address}</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn}         onPress={() =>
          navigation.navigate('MapSearchScreen', {
            onLocationSelected: (locationObj) => {
              if (locationObj) {
                const { latitude, longitude, address: foundAddress } = locationObj;
                const region = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
                mapRef.current?.animateToRegion(region, 350);
                lastRegionRef.current = { latitude, longitude };
                setCurrentRegion({ latitude, longitude });
                if (foundAddress) {
                  setAddress(foundAddress); // instant update from search
                }
              }
            }
          })
        }>
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addDetailsBtn} onPress={onConfirm}>
          <Text style={styles.addDetailsBtnText}>Add more address details &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Address Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheet}>
            <AddressDetailsForm
              initialValues={{ addressLine: address }}
              userPhone={userPhone}
              onSave={handleSaveAddressDetails}
              onClose={() => setModalVisible(false)}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Keep your existing styles - they remain the same
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    fontSize: RFValue(13 * SCALE),
    color: "#666",
    marginTop: hp(1 * SCALE),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: hp(6 * SCALE),
    paddingBottom: hp(1 * SCALE),
    paddingHorizontal: wp(2.5 * SCALE),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    color: "#222",
    fontSize: RFValue(16 * SCALE),
    marginLeft: wp(1 * SCALE),
  },
  searchBar: {
    position: "absolute",
    top: hp(12 * SCALE),
    left: wp(4 * SCALE),
    right: wp(4 * SCALE),
    zIndex: 30,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.7 * SCALE),
    paddingHorizontal: wp(4 * SCALE),
    borderRadius: wp(1.5 * SCALE),
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },
  searchBarText: {
    marginLeft: wp(2 * SCALE),
    color: "#888",
    fontSize: RFValue(13 * SCALE),
  },
  centerMarkerContainer: {
    position: "absolute",
    left: width / 2 - RFValue(22 * SCALE),
    top: height / 2 - RFValue(44 * SCALE),
    zIndex: 20,
    alignItems: "center",
    width: wp(25 * SCALE),
  },
  addressBubble: {
    backgroundColor: "#fff",
    paddingHorizontal: wp(3 * SCALE),
    paddingVertical: hp(0.7 * SCALE),
    borderRadius: wp(3.5 * SCALE),
    marginBottom: 0,
    alignSelf: "center",
    maxWidth: wp(40 * SCALE),
    minHeight: hp(3 * SCALE),
    justifyContent: "center",
  },
  addressBubbleText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: RFValue(12 * SCALE),
    maxWidth: wp(34 * SCALE),
  },
  currentLocBtn: {
    position: "absolute",
    top: hp(19 * SCALE),
    right: wp(4.5 * SCALE),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: hp(1 * SCALE),
    paddingHorizontal: wp(3 * SCALE),
    borderRadius: wp(5.5 * SCALE),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingTop: hp(2 * SCALE),
    paddingBottom: hp(2.2 * SCALE),
    paddingHorizontal: wp(4 * SCALE),
    borderTopLeftRadius: wp(5 * SCALE),
    borderTopRightRadius: wp(5 * SCALE),
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomCardLabel: {
    fontSize: RFValue(11 * SCALE),
    color: "#888",
    fontWeight: "600",
    marginBottom: hp(0.7 * SCALE),
    marginLeft: wp(0.5 * SCALE),
  },
  bottomCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.2 * SCALE),
    backgroundColor: 'rgba(217, 217, 217,0.7)',
    paddingHorizontal: wp(0.5 * SCALE),
    paddingVertical: hp(0.5 * SCALE),
    borderRadius: wp(1.2 * SCALE),
  },
  bottomCardAddress: {
    fontWeight: "bold",
    color: "#222",
    fontSize: RFValue(13 * SCALE),
    marginLeft: wp(1 * SCALE),
    marginBottom: hp(0.2 * SCALE),
    maxWidth: wp(44 * SCALE),
  },
  bottomCardSubtext: {
    color: "#888",
    fontSize: RFValue(10 * SCALE),
    marginLeft: wp(1 * SCALE),
    maxWidth: wp(44 * SCALE),
  },
  changeBtn: {
    backgroundColor: "#f6f7fb",
    borderRadius: wp(2 * SCALE),
    paddingHorizontal: wp(3 * SCALE),
    paddingVertical: hp(0.8 * SCALE),
    marginRight: wp(1.5 * SCALE),
  },
  changeBtnText: {
    color: "#0C5273",
    fontWeight: "bold",
    fontSize: RFValue(11 * SCALE),
  },
  addDetailsBtn: {
    marginTop: hp(0.7 * SCALE),
    backgroundColor: "#0C5273",
    borderRadius: wp(2.2 * SCALE),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.5 * SCALE),
  },
  addDetailsBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: RFValue(13 * SCALE),
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheetContainer: {
    justifyContent: "flex-end",
    margin: 0,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(5 * SCALE),
    borderTopRightRadius: wp(5 * SCALE),
    padding: wp(6 * SCALE),
    minHeight: hp(40 * SCALE),
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
  },
});
