

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image
} from "react-native";
import { useAddress } from "../context/AddressContext";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

const SCALE = 0.85;

const AddressBookModal = ({ onSelect, onCloseRequest }) => {
  const {
    addresses,
    selectedAddress,
    loading,
    selectAddress,
    deleteAddress,
    refreshAddresses,
  } = useAddress();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [menuVisibleId, setMenuVisibleId] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // ✅ FIX: Navigation logic removed from here.
  // The parent component will handle closing the modal and navigating.
  const handleAdd = () => {
    if (onCloseRequest) {
      onCloseRequest();
    }
  };

  const confirmDelete = (address) => {
    setAddressToDelete(address);
    setDeleteModalVisible(true);
    setMenuVisibleId(null);
  };

  const handleSelect = (address) => {
    selectAddress(address);
    if (onSelect) onSelect(address);
  };

  const getDetailsString = (item) => {
    let details = [];
    if (item.buildingName) details.push(item.buildingName);
    if (item.street) details.push(item.street);
    if (item.floor) details.push("Floor: " + item.floor);
    if (item.landmark) details.push("Landmark: " + item.landmark);
    if (item.recipientName) details.push("Name: " + item.recipientName);
    if (item.recipientPhoneNumber) details.push("Phone: " + item.recipientPhoneNumber);
    return details.join(", ");
  };

  const handleDeleteConfirm = async () => {
    if (addressToDelete) {
      await deleteAddress(addressToDelete.addressId);
      setDeleteModalVisible(false);
      setAddressToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setAddressToDelete(null);
  };

  return (
    <View style={[styles.container,{paddingBottom: insets.bottom}]}>
      <TouchableOpacity style={styles.actionRow} onPress={handleAdd} activeOpacity={0.8}>
        <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.addIcon}>＋</Text>
        <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.actionText}>Add new address</Text>
      </TouchableOpacity>

      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.savedHeader}>Your saved addresses</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#194D33" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.addressId?.toString()}
          renderItem={({ item }) => {
            const isSelected = selectedAddress && selectedAddress.addressId === item.addressId;
            let iconSource;
            const lower = (item.label || "").toLowerCase();
            if (lower.includes("home")) {
              iconSource = require('../assets/icons/home.png');
            } else if (lower.includes("office") || lower.includes("work")) {
              iconSource = require('../assets/icons/office.png');
            } else if (lower.includes("flat")) {
              iconSource = require('../assets/icons/flat.png');
            } else {
              iconSource = require('../assets/icons/other.png');
            }
            return (
              <TouchableOpacity
                style={[
                  styles.addressRow,
                  isSelected && styles.selectedCard,
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.95}
              >
                <View style={styles.addressLeft}>
                  <View style={styles.iconBox}>
                    <Image
                      source={iconSource}
                      style={styles.iconImage}
                    />
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text
                        allowFontScaling={false}
                        adjustsFontSizeToFit
                        style={[
                          styles.label,
                          isSelected && { color: "#0C5273" },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.selectedTag}>
                          <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.selectedTagText}>CURRENTLY SELECTED</Text>
                        </View>
                      )}
                    </View>
                    {getDetailsString(item).length > 0 && (
                      <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.details}>{getDetailsString(item)}</Text>
                    )}
                    <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.address}>{item.address}</Text>
                  </View>
                </View>
                <View style={{ position: "relative" }}>
                  <TouchableOpacity
                    style={styles.dotsMenu}
                    onPress={() => setMenuVisibleId(menuVisibleId === item.addressId ? null : item.addressId)}
                  >
                    <Text allowFontScaling={false} adjustsFontSizeToFit style={{ fontSize: 18, color: "#888" }}>⋮</Text>
                  </TouchableOpacity>
                  {menuVisibleId === item.addressId && (
                    <View style={styles.menu}>
                      <TouchableOpacity
                        onPress={() => confirmDelete(item)}
                        style={styles.menuItem}
                      >
                        <Text allowFontScaling={false} adjustsFontSizeToFit style={{ color: "#d11a2a", fontWeight: "bold" }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text allowFontScaling={false} adjustsFontSizeToFit style={styles.empty}>No addresses found.</Text>}
          refreshing={loading}
          onRefresh={refreshAddresses}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalTitle}>Delete Address</Text>
            <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalMessage}>
              Are you sure you want to delete this address?
            </Text>
            {addressToDelete && (
              <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.modalAddressInfo}>
                {addressToDelete.label} - {addressToDelete.buildingName}
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleDeleteCancel}
              >
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.cancelButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteConfirm}
              >
                <Text allowFontScaling={false} adjustsFontSizeToFit style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
    paddingHorizontal: 0,
    paddingTop: hp(2.5 * SCALE),
  },
  headerTitle: {
    fontSize: RFValue(16 * SCALE),
    fontWeight: "bold",
    marginTop: hp(2.2 * SCALE),
    marginBottom: hp(1 * SCALE),
    marginLeft: wp(4 * SCALE),
    color: "#222",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: wp(4 * SCALE),
    borderRadius: wp(2.5 * SCALE),
    paddingVertical: hp(2 * SCALE),
    paddingLeft: wp(3.5 * SCALE),
    marginBottom: hp(1.3 * SCALE),
    marginTop: hp(0.2 * SCALE),
    borderWidth: 1,
    borderColor: "#e6e6e6",
    elevation: 1,
  },
  addIcon: {
    fontSize: RFValue(19 * SCALE),
    color: "#0C5273",
    marginRight: wp(2 * SCALE),
    marginTop: -hp(0.2 * SCALE),
  },
  actionText: {
    color: "#0C5273",
    fontWeight: "bold",
    fontSize: RFValue(15 * SCALE),
  },
  savedHeader: {
    fontSize: RFValue(13 * SCALE),
    color: "#888",
    fontWeight: "500",
    marginBottom: hp(1.2 * SCALE),
    marginLeft: wp(4.5 * SCALE),
    marginTop: hp(0.2 * SCALE),
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    marginHorizontal: wp(4 * SCALE),
    marginBottom: hp(1.7 * SCALE),
    borderRadius: wp(3 * SCALE),
    paddingVertical: hp(1.7 * SCALE),
    paddingHorizontal: wp(3.5 * SCALE),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    justifyContent: "space-between",
    height: hp(12 * SCALE),
  },
  selectedCard: {
    borderColor: "#0C5273",
    borderWidth: 1.2,
    shadowOpacity: 0.12,
    elevation: 2,
  },
  addressLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    flexShrink: 1,
  },
  iconBox: {
    width: wp(9 * SCALE),
    height: wp(9 * SCALE),
    borderRadius: wp(2.5 * SCALE),
    backgroundColor: "#f6f7fb",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(0.2 * SCALE),
    marginRight: wp(1 * SCALE),
  },
  icon: {
    fontSize: RFValue(20 * SCALE),
  },
  label: {
    fontSize: RFValue(15 * SCALE),
    fontWeight: "bold",
    color: "#222",
    flexGrow: 1,
  },
  selectedTag: {
    backgroundColor: "#0C5273",
    borderRadius: wp(2 * SCALE),
    paddingHorizontal: wp(2 * SCALE),
    paddingVertical: hp(0.3 * SCALE),
    alignSelf: "center",
  },
  selectedTagText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: RFValue(11 * SCALE),
    letterSpacing: 0.5,
  },
  details: {
    fontSize: RFValue(13 * SCALE),
    color: "#555",
    marginTop: hp(0.2 * SCALE),
    marginBottom: hp(0.2 * SCALE),
    maxWidth: "98%",
  },
  address: {
    fontSize: RFValue(13 * SCALE),
    color: "#666",
    marginTop: hp(0.2 * SCALE),
    maxWidth: "98%",
  },
  dotsMenu: {
    padding: wp(2 * SCALE),
    marginLeft: wp(1.5 * SCALE),
    alignSelf: "flex-start",
  },
  menu: {
    position: "absolute",
    top: hp(4.5 * SCALE),       
    right: wp(2 * SCALE),     
    backgroundColor: "#fff",
    borderRadius: wp(2 * SCALE),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    width: wp(22 * SCALE),    
    alignItems: 'center',     
  },
  menuItem: {
    paddingVertical: hp(1 * SCALE),
    width: '100%',                    
    alignItems: 'center',
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: hp(3.5 * SCALE),
    fontSize: RFValue(13 * SCALE),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: wp(3 * SCALE),
    padding: wp(5 * SCALE),
    marginHorizontal: wp(5 * SCALE),
    minWidth: wp(70 * SCALE),
    maxWidth: wp(90 * SCALE),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: RFValue(18 * SCALE),
    fontWeight: "bold",
    color: "#222",
    marginBottom: hp(1.2 * SCALE),
    textAlign: "center",
  },
  modalMessage: {
    fontSize: RFValue(14 * SCALE),
    color: "#666",
    textAlign: "center",
    marginBottom: hp(1.2 * SCALE),
  },
  modalAddressInfo: {
    fontSize: RFValue(13 * SCALE),
    color: "#0C5273",
    textAlign: "center",
    marginBottom: hp(2.5 * SCALE),
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.5 * SCALE),
    borderRadius: wp(2 * SCALE),
    marginHorizontal: wp(1 * SCALE),
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  deleteButton: {
    backgroundColor: "#0C5273",
  },
  cancelButtonText: {
    color: "#0C5273",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: RFValue(14 * SCALE),
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: RFValue(14 * SCALE),
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default AddressBookModal;