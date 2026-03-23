import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import {
  fetchAddress,
  addAddress as apiAddAddress,
  deleteAddress as apiDeleteAddress,
} from "../services/AddressService";

const AddressContext = createContext();
const SELECTED_ADDRESS_KEY = "selectedAddress";

export const useAddress = () => useContext(AddressContext);

// Utility functions for selected address in AsyncStorage
const saveSelectedAddressToStorage = async (address) => {
  try {
    await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(address));
  } catch (e) {
    console.error("Error saving selected address:", e);
  }
};

const getSelectedAddressFromStorage = async () => {
  try {
    const value = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error("Error loading selected address:", e);
    return null;
  }
};

export const AddressProvider = ({ children }) => {
  const { idToken } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load addresses and selected address on mount or when idToken changes
  useEffect(() => {
    if (idToken) {
      loadAddresses();
    } else {
      setAddresses([]);
      setSelectedAddress(null);
      setLoading(false);
    }
  }, [idToken]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await fetchAddress(idToken);
      setAddresses(data || []);
      // Find last selected address from AsyncStorage
      const storedSelected = await getSelectedAddressFromStorage();
      let found = null;
      if (storedSelected && data) {
        found = data.find(addr => addr.addressId === storedSelected.addressId);
      }
      // If found, set as selected; else default to first address or null
      setSelectedAddress(found || (data && data[0]) || null);
      // Also, if not found, update AsyncStorage to match
      if (!found && data && data.length > 0) {
        await saveSelectedAddressToStorage(data[0]);
      }
    } catch (e) {``
      setAddresses([]);
      setSelectedAddress(null);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address) => {
    setLoading(true);
    try {
      const newAddr = await apiAddAddress(idToken, address);
      await loadAddresses();
      // Auto-select the new address and save to AsyncStorage
      if (newAddr && newAddr.addressId) {
        setSelectedAddress(newAddr);
        await saveSelectedAddressToStorage(newAddr);
      }
      return newAddr;
    } catch (e) {
      console.error("Error adding address:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

    const deleteAddress = async (addressId) => {
    setLoading(true);
    try {
      await apiDeleteAddress(idToken, addressId);
      await loadAddresses();
      
      // If the deleted address was selected, handle selection
      if (selectedAddress && selectedAddress.addressId === addressId) {
        // Get updated addresses after deletion
        const updatedAddresses = addresses.filter(addr => addr.addressId !== addressId);
        if (updatedAddresses.length > 0) {
          // Select the first remaining address
          setSelectedAddress(updatedAddresses[0]);
          await saveSelectedAddressToStorage(updatedAddresses[0]);
        } else {
          // No addresses left, clear selection
          setSelectedAddress(null);
          await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
        }
      }
      return true;
    } catch (e) {
      console.error("Error deleting address:", e);
      return false;
    } finally {
      setLoading(false);
    }
  };


  const selectAddress = async (address) => {
    setSelectedAddress(address);
    await saveSelectedAddressToStorage(address);
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddress,
        loading,
        addAddress,
        deleteAddress,
        selectAddress,
        refreshAddresses: loadAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};
