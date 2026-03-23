import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Dimensions,
  Image
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

const { height } = Dimensions.get("window");

const AddressDetailsForm = ({ onSave, onClose, userPhone = "" }) => {
  const [addressType, setAddressType] = useState("home");
  const [orderingFor, setOrderingFor] = useState("myself");
  const [houseNumber, sethouseNumber] = useState("");
  const [streetAddress, setstreetAddress] = useState("");
  const [floor, setFloor] = useState("");
  const [landmark, setLandmark] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState(userPhone);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (orderingFor === "myself") {
      setContactPhone(userPhone || "");
    } else {
      setContactPhone("");
      setContactName("");
    }
  }, [orderingFor, userPhone]);

  const handlePhoneChange = (text) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    setContactPhone(numericOnly.slice(0, 10));
  };

  const handleSave = async () => {
    if (isSaving) return;

    let newErrors = {};

    if (!houseNumber.trim()) {
      newErrors.houseNumber = "House/Flat/Office is required";
    }
    if (!streetAddress.trim()) {
      newErrors.streetAddress = "Apartment/Road/Area is required";
    }
    if (!contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }
    if (orderingFor === "someone") {
      if (!contactPhone.trim()) {
        newErrors.contactPhone = "Contact phone is required";
      } else if (contactPhone.length !== 10) {
        newErrors.contactPhone = "Phone number must be exactly 10 digits";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const addressDetails = {
      label: addressType,
      floor,
      street: streetAddress,
      buildingName: houseNumber,
      landmark,
      // pincode removed - handled in MapScreen
      recipientPhoneNumber: contactPhone,
      recipientName: contactName,
    };

    setIsSaving(true);
    try {
      await onSave(addressDetails);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <Text allowFontScaling={false} style={styles.title}>Address Details</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text allowFontScaling={false} style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.formScroll} 
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Complete address would assist better us in serving you.
        </Text>

        {/* Ordering for selection */}
        <Text style={styles.sectionTitle}>Who you are ordering for?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addressTypeScroll} contentContainerStyle={styles.horizontalButtonRow}>
          <TouchableOpacity
            style={[styles.rectButton, orderingFor === "myself" && styles.rectButtonSelected]}
            onPress={() => setOrderingFor("myself")}
          >
            <Text style={[styles.rectButtonText, orderingFor === "myself" && styles.rectButtonTextSelected]}>Myself</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rectButton, orderingFor === "someone" && styles.rectButtonSelected]}
            onPress={() => setOrderingFor("someone")}
          >
            <Text style={[styles.rectButtonText, orderingFor === "someone" && styles.rectButtonTextSelected]}>Someone else</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Address type selection */}
        <Text style={styles.sectionTitle}>
          Select address type <Text style={styles.requiredStar}>*</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.addressTypeContainer}>
            {["home", "work", "flat", "other"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.addressTypeButton, addressType === type && styles.addressTypeSelected]}
                onPress={() => setAddressType(type)}
              >
                <Image
                  source={
                    type === "home"
                      ? require('../assets/icons/home.png')
                      : type === "work"
                      ? require('../assets/icons/office.png')
                      : type === "flat"
                      ? require('../assets/icons/flat.png')
                      : require('../assets/icons/other.png')
                  }
                  style={[styles.addressTypeIcon, addressType === type && styles.addressTypeIconSelected]}
                />
                <Text style={[styles.addressTypeText, addressType === type && styles.addressTypeTextSelected]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Address fields */}
        <Text style={styles.inputLabel}>
          HOUSE / FLAT / OFFICE <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={houseNumber}
          onChangeText={sethouseNumber}
          placeholder="HOUSE / FLAT / OFFICE"
          placeholderTextColor="#aaa"
        />
        {errors.houseNumber && <Text style={styles.error}>{errors.houseNumber}</Text>}

        <Text style={styles.inputLabel}>
          APARTMENT / ROAD / AREA <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={streetAddress}
          onChangeText={setstreetAddress}
          placeholder="APARTMENT / ROAD / AREA"
          placeholderTextColor="#aaa"
        />
        {errors.streetAddress && <Text style={styles.error}>{errors.streetAddress}</Text>}

        <Text style={styles.inputLabel}>FLOOR (optional)</Text>
        <TextInput
          style={styles.input}
          value={floor}
          onChangeText={setFloor}
          placeholder="FLOOR"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.inputLabel}>LANDMARK (optional)</Text>
        <TextInput
          style={styles.input}
          value={landmark}
          onChangeText={setLandmark}
          placeholder="LANDMARK"
          placeholderTextColor="#aaa"
        />

        {/* Contact name always visible */}
        <Text style={styles.inputLabel}>
          Contact Name <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder="Enter contact name"
          placeholderTextColor="#aaa"
        />
        {errors.contactName && <Text style={styles.error}>{errors.contactName}</Text>}

        {orderingFor === "someone" && (
          <>
            <Text style={styles.inputLabel}>
              Contact Phone <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={handlePhoneChange}
              placeholder="Enter contact phone"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
              maxLength={10}
            />
            {errors.contactPhone && <Text style={styles.error}>{errors.contactPhone}</Text>}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving" : "Save address"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    justifyContent: "space-between",
    padding: hp(0.3),
  },
  title: {
    fontSize: RFValue(13), // was 15
    fontWeight: "bold",
    color: "#222",
    marginBottom: hp(0.05),
  },
  closeButton: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: "#f6f7fb",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#0C5273",
    fontSize: RFValue(13), // was 15
    fontWeight: "bold",
  },
  formScroll: {
    maxHeight: hp(36), // slightly less height
  },
  subtitle: {
    color: "#888",
    fontSize: RFValue(10), // was 11
    marginBottom: hp(1),
    marginTop: hp(0.2),
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#222",
    fontSize: RFValue(11), // was 12.5
    marginBottom: hp(0.8),
    marginTop: hp(0.2),
  },
  requiredStar: {
    color: "#d11a2a",
  },
  addressTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: hp(1),
    gap: wp(1.2), // was 1.5
  },
  addressTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: wp(1),
    paddingVertical: hp(0.8), // was 1
    paddingHorizontal: wp(3), // was 4
    marginRight: wp(2),
    marginBottom: hp(0.8),
    backgroundColor: "#f6f7fb",
    minWidth: wp(14), // was 16
    justifyContent: "center",
  },
  addressTypeSelected: {
    backgroundColor: 'rgba(12,82,115,0.1)',
    borderColor: "#0C5273",
  },
  addressTypeIcon: {
    height: hp(2.6), // smaller
    width: wp(5.2), // smaller
    marginRight: wp(1.2),
    color: "#444",
  },
  addressTypeIconSelected: {
    color: "#0C5273",
  },
  addressTypeText: {
    fontSize: RFValue(11), // was 12.5
    color: "#222",
    fontWeight: "bold",
  },
  addressTypeTextSelected: {
    color: "#0C5273",
  },
  inputLabel: {
    fontSize: RFValue(10.5), // was 11.5
    color: "#666",
    marginBottom: hp(0.4),
    marginTop: hp(0.7),
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: wp(1.5),
    padding: wp(1.6), // smaller padding
    fontSize: RFValue(11.5), // was 12.5
    marginBottom: hp(0.4),
    backgroundColor: "#f6f7fb",
    color: "#222",
  },
  error: {
    color: "#d11a2a",
    marginBottom: hp(0.15),
    fontSize: RFValue(10), // was 11
  },
  saveButton: {
    backgroundColor: "#0C5273",
    paddingVertical: hp(1.1), // was 1.3
    borderRadius: wp(1.5),
    alignItems: "center",
    marginTop: hp(0.6),
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: RFValue(12.5), // was 13.5
    letterSpacing: 0.2,
  },
  addressTypeScroll: {
    marginBottom: hp(1.2),
    marginRight: -wp(3),
  },
  horizontalButtonRow: {
    flexDirection: "row",
    gap: wp(1.5), // was 2
    paddingBottom: hp(0.15),
  },
  rectButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: wp(1),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    marginRight: wp(2),
    backgroundColor: "#f6f7fb",
    minWidth: wp(18), // was 20
    justifyContent: "center",
  },
  rectButtonSelected: {
    backgroundColor: "rgba(12,82,115,0.1)",
    borderColor: "#0C5273",
  },
  rectButtonText: {
    fontSize: RFValue(11), // was 12.5
    color: "#222",
    fontWeight: "bold",
  },
  rectButtonTextSelected: {
    color: "#0C5273",
  },
});


export default AddressDetailsForm;