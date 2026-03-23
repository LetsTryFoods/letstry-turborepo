

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable, // ✅ CHANGE: Imported Pressable for double-tap
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { ProfileService } from "../services/ProfileService";
import { useAuth } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Header component remains the same (no edit button)
const GradientHeader = ({ title, onBack, insets }) => (
  <LinearGradient
    colors={["#F2D377", "#F5F5F5"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={headerStyles.gradient}
  >
    <View style={{ paddingTop: insets.top }}>
      <View style={headerStyles.headerContent}>
        <TouchableOpacity onPress={onBack} style={headerStyles.iconButton}>
          <Ionicons name="chevron-back" size={RFValue(20)} color="#222" />
        </TouchableOpacity>
        <Text allowFontScaling={false} adjustsFontSizeToFit style={[headerStyles.title, { color: "#000" }]}>
          {title}
        </Text>
        <View style={headerStyles.iconPlaceholder} />
      </View>
    </View>
  </LinearGradient>
);

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { idToken } = useAuth();
  const insets = useSafeAreaInsets();

  // State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", dob: "", general: "" });

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    dob: false,
  });

  // ✅ CHANGE: State to handle double-tap logic
  const [lastTapInfo, setLastTapInfo] = useState({ time: null, field: null });


  const fetchProfile = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const data = await ProfileService.getProfile(idToken);
      setFullName(data.name || "");
      setEmail(data.email || "");
      setDob(data.dob || "");
      setPhoneNumber(data.phoneNumber || "");
    } catch (error) {
      setFieldErrors({ ...fieldErrors, general: "Failed to load profile details." });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const clearFieldError = (fieldName) => {
    setFieldErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleSave = async () => {
    // This function's core logic remains unchanged
    let payload = {};
    let errors = { name: "", email: "", dob: "", general: "" };
    let hasError = false;

    if (fullName.trim()) payload.name = fullName.trim();
    if (email.trim()) {
      if (!isValidEmail(email.trim())) {
        errors.email = "Please enter a valid email address."; hasError = true;
      } else {
        payload.email = email.trim();
      }
    }
    if (dob.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
        errors.dob = "Please enter DOB in YYYY-MM-DD format."; hasError = true;
      } else {
        payload.dob = dob.trim();
      }
    }
    if (Object.keys(payload).length === 0) {
      errors.general = "Please enter some information to update."; hasError = true;
    }

    setFieldErrors(errors);
    if (hasError) return;

    setUpdating(true);
    try {
      await ProfileService.updateProfile(payload, idToken);
      setIsEditing({ name: false, email: false, dob: false });
      await fetchProfile();
      setFieldErrors({ name: "", email: "", dob: "", general: "" });
    } catch (error) {
      setFieldErrors({ general: error?.message || "Could not update profile. Try again." });
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ CHANGE: New double-tap handler to toggle edit mode for a field
  const handleDoubleTap = (field) => {
    const now = Date.now();
    // If the same field is tapped again within 300ms, it's a double-tap
    if (lastTapInfo.time && lastTapInfo.field === field && now - lastTapInfo.time < 300) {
      setIsEditing(prev => ({ ...prev, [field]: !prev[field] })); // Toggle edit state
      setLastTapInfo({ time: null, field: null }); // Reset tap info
    } else {
      // Otherwise, it's the first tap
      setLastTapInfo({ time: now, field: field });
    }
  };

  // ✅ CHANGE: New handler for DOB input to auto-add hyphens
  const handleDobChange = (text) => {
    // Remove all non-digit characters
    let formatted = text.replace(/[^\d]/g, '');

    // Add hyphen after year (YYYY)
    if (formatted.length > 4) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
    }
    // Add second hyphen after month (YYYY-MM)
    if (formatted.length > 7) {
      formatted = formatted.slice(0, 7) + '-' + formatted.slice(7, 9); // Limit day to 2 digits
    }

    setDob(formatted);
    clearFieldError("dob");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <GradientHeader
        title="Profile"
        onBack={() => navigation.goBack()}
        insets={insets}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color="#0C5273" style={{ marginTop: hp("20%") }} />
          ) : (
            <View style={styles.form}>
              {fieldErrors.general && <Text style={styles.fieldError}>{fieldErrors.general}</Text>}
              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full name</Text>
                <Pressable onPress={() => handleDoubleTap('name')}>
                  <View style={styles.inputRow} pointerEvents={isEditing.name ? 'auto' : 'none'}>
                    <TextInput
                      style={[styles.input, { color: isEditing.name ? '#222' : '#888' }]}
                      value={fullName}
                      onChangeText={t => { setFullName(t); clearFieldError("name"); }}
                      placeholder="Full name"
                      placeholderTextColor="#bbb"
                      autoCapitalize="words"
                      editable={isEditing.name && !updating}
                      allowFontScaling={false}
                      autoFocus={isEditing.name}
                    />
                  </View>
                </Pressable>
                {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}
              </View>
              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <Pressable onPress={() => handleDoubleTap('email')}>
                  <View style={styles.inputRow} pointerEvents={isEditing.email ? 'auto' : 'none'}>
                    <TextInput
                      style={[styles.input, { color: isEditing.email ? '#222' : '#888' }]}
                      value={email}
                      onChangeText={t => { setEmail(t); clearFieldError("email"); }}
                      placeholder="Email"
                      placeholderTextColor="#bbb"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={isEditing.email && !updating}
                      allowFontScaling={false}
                      autoFocus={isEditing.email}
                    />
                  </View>
                </Pressable>
                {fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}
              </View>
              {/* DOB */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                 <Pressable onPress={() => handleDoubleTap('dob')}>
                    <View style={styles.inputRow} pointerEvents={isEditing.dob ? 'auto' : 'none'}>
                      <TextInput
                        style={[styles.input, { color: isEditing.dob ? '#222' : '#888' }]}
                        value={dob}
                        // ✅ CHANGE: Using the new auto-formatting handler
                        onChangeText={handleDobChange}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#bbb"
                        editable={isEditing.dob && !updating}
                        keyboardType="numeric"
                        maxLength={10} // YYYY-MM-DD is 10 chars
                        allowFontScaling={false}
                        autoFocus={isEditing.dob}
                      />
                    </View>
                </Pressable>
                {fieldErrors.dob && <Text style={styles.fieldError}>{fieldErrors.dob}</Text>}
              </View>
              {/* Phone Number (Not Editable) */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Phone number</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, { color: "#888" }]}
                    value={phoneNumber}
                    editable={false}
                    placeholder="Phone number not provided"
                    placeholderTextColor="#bbb"
                    allowFontScaling={false}
                  />
                </View>
              </View>
              {/* Save button appears if any field is being edited */}
              {(isEditing.name || isEditing.email || isEditing.dob) && (
                <TouchableOpacity
                  style={[styles.submitButton, updating && styles.submitButtonDisabled]}
                  activeOpacity={0.8}
                  onPress={handleSave}
                  disabled={updating}
                >
                  <Text style={styles.submitButtonText}>{updating ? "Saving..." : "Save"}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

// Styles (Header)
const headerStyles = StyleSheet.create({
  gradient: { paddingBottom: hp("2.5%") },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: wp("4%") },
  iconButton: { padding: wp("2%") },
  iconPlaceholder: { width: wp("10%"), height: hp("4%"), justifyContent: "center", alignItems: "center" },
  title: { flex: 1, fontWeight: "bold", fontSize: RFValue(14), color: "#000", textAlign: "center" },
});

// Styles (Main)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingHorizontal: wp("6%") },
  form: { marginTop: hp("2%") },
  inputWrapper: { marginBottom: hp("2.5%") },
  inputLabel: { fontSize: RFValue(13), color: "#555", marginBottom: hp("0.5%"), marginLeft: wp("1%") },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: wp("3%"), borderWidth: 1, borderColor: "#eee" },
  input: { flex: 1, height: hp("5.5%"), fontSize: RFValue(12), backgroundColor: "transparent" },
  fieldError: { color: "#d32f2f", fontSize: RFValue(10), marginTop: 4, marginLeft: wp("1%"), fontWeight: "500" },
  submitButton: { backgroundColor: "#0C5273", borderRadius: 6, paddingVertical: hp("1.2%"), alignItems: "center", marginTop: hp("3%") },
  submitButtonDisabled: { backgroundColor: "#ccc" },
  submitButtonText: { color: "#fff", fontSize: RFValue(14), fontWeight: "bold", letterSpacing: 0.5, textAlign: "center" },
});

export default ProfileScreen;