import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useRef,
  useCallback, // Import useCallback
} from "react";
import {
  PermissionsAndroid,
  Platform,
  Linking,
  AppState,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import LocationPermissionPopup from "../components/EnableLocation";

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

const GOOGLE_API_KEY = "AIzaSyA44Ri5mmnDX-wE8folHq69LjEy1u8NLF0";

// Approximate Delhi polygon (longitude, latitude)
const DELHI_DELIVERY_POLYGON = [
  [76.9981, 28.8784],
  [77.3126, 28.8784],
  [77.35, 28.6505],
  [77.3242, 28.4774],
  [77.1878, 28.4126],
  [76.9947, 28.4089],
  [76.9276, 28.5744],
  [76.9981, 28.8784],
];

const fetchAddress = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return "";
  } catch (e) {
    console.error("Failed to fetch address:", e);
    return "";
  }
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [isInDeliveryArea, setIsInDeliveryArea] = useState(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  const isRequestingLocation = useRef(false);

  const handleOpenSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:Privacy&path=LOCATION");
    } else {
      Linking.openSettings();
    }
  };

  // Wrap requestLocation in useCallback for stable function reference
  const requestLocation = useCallback(async () => {
    if (isRequestingLocation.current) return;
    isRequestingLocation.current = true;
    setLoading(true);

    try {
      let hasPermission = false;
      if (Platform.OS === "ios") {
        // On iOS, permission is requested by the function call itself
        const status = await Geolocation.requestAuthorization("whenInUse");
        if (status === 'granted') {
          hasPermission = true;
        }
      } else { // Android
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          hasPermission = true;
        }
      }

      if (!hasPermission) {
        setShowPermissionPopup(true);
        setLoading(false);
        isRequestingLocation.current = false;
        return;
      }
      
      // If we are here, permission is granted. Now get position.
      setShowPermissionPopup(false); // Hide popup if it was previously shown

      Geolocation.getCurrentPosition(
        async (position) => {
          setLocation(position.coords);

          const userPoint = point([
            position.coords.longitude,
            position.coords.latitude,
          ]);
          const deliveryPolygon = polygon([DELHI_DELIVERY_POLYGON]);
          const inside = booleanPointInPolygon(userPoint, deliveryPolygon);
          setIsInDeliveryArea(inside);

          const humanAddress = await fetchAddress(
            position.coords.latitude,
            position.coords.longitude
          );
          setAddress(humanAddress);
          setLoading(false);
          isRequestingLocation.current = false;
        },
        (error) => {
          // *** FIX: ONLY SHOW POPUP FOR PERMISSION ERRORS ***
          console.warn("Geolocation Error:", error.code, error.message);
          // 1 = PERMISSION_DENIED
          if (error.code === 1) {
            setShowPermissionPopup(true);
          }
          // For other errors (2: POSITION_UNAVAILABLE, 3: TIMEOUT),
          // we simply stop loading but don't show the permission popup.
          setLoading(false);
          setIsInDeliveryArea(false);
          isRequestingLocation.current = false;
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error("Location request failed:", error);
      setShowPermissionPopup(true);
      setLoading(false);
      setIsInDeliveryArea(false);
      isRequestingLocation.current = false;
    }
  }, []); // Empty dependency array because it has no external dependencies

  // Initial request on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Re-check when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active" && (!location || showPermissionPopup)) {
          setTimeout(() => {
            requestLocation();
          }, 500); 
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
    // requestLocation is now a stable dependency from useCallback
  }, [location, showPermissionPopup, requestLocation]);

  return (
    <LocationContext.Provider
      value={{ location, address, loading, isInDeliveryArea }}
    >
      {children}
      {showPermissionPopup && (
        <LocationPermissionPopup onEnable={handleOpenSettings} />
      )}
    </LocationContext.Provider>
  );
};