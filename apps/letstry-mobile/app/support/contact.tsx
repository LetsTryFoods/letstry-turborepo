import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@apollo/client";
import { SUBMIT_CONTACT_MESSAGE } from "../../src/lib/graphql/support";
import { RFValue, wp, hp } from "../../src/lib/utils/ui-utils";
import * as Haptics from "expo-haptics";

const QUERY_TYPES = [
  { label: "General Inquiry", value: "GENERAL" },
  { label: "Order Issue", value: "ORDER_ISSUE" },
  { label: "Product Inquiry", value: "PRODUCT_INQUIRY" },
  { label: "Complaint", value: "COMPLAINT" },
  { label: "Feedback", value: "FEEDBACK" },
  { label: "Return Request", value: "RETURN_REQUEST" },
];

export default function ContactUsScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    queryType: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    orderId: "",
    queryType: "",
    name: "",
    message: "",
  });

  const [submitContact, { loading }] = useMutation(SUBMIT_CONTACT_MESSAGE);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone.replace(/\s/g, ""));
  };

  const validateOrderId = (orderId: string) => {
    // Standard format: ORD_digits_hex (matching letstryfoods.com)
    return /^ORD_\d+_[a-f0-9]+$/i.test(orderId.trim());
  };

  const handleSubmit = async () => {
    let hasError = false;
    const newErrors = {
      email: "",
      phone: "",
      orderId: "",
      queryType: "",
      name: "",
      message: "",
    };

    if (!form.name.trim()) {
      newErrors.name = "Full Name is required.";
      hasError = true;
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required.";
      hasError = true;
    }

    if (!form.queryType) {
      newErrors.queryType = "Please select a query type.";
      hasError = true;
    }

    if (!form.email) {
      newErrors.email = "Email Address is required.";
      hasError = true;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }

    if (!form.phone) {
      newErrors.phone = "Phone Number is required.";
      hasError = true;
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
      hasError = true;
    }

    if (!form.orderId) {
      newErrors.orderId = "Order ID is required.";
      hasError = true;
    } else if (!validateOrderId(form.orderId)) {
      newErrors.orderId = "Invalid format. e.g. ORD_123456789_abc123";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Validation Error",
        "Please correct the errors in the form before submitting.",
      );
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { data } = await submitContact({
        variables: {
          input: {
            name: form.name,
            email: form.email || undefined,
            phone: form.phone,
            orderId: form.orderId || undefined,
            queryType: form.queryType || undefined,
            message: form.message,
          },
        },
      });

      if (data?.submitContactMessage?.success) {
        Alert.alert(
          "Success",
          "Your query has been submitted successfully. We will get back to you shortly.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      } else {
        Alert.alert(
          "Error",
          data?.submitContactMessage?.message || "Failed to submit query.",
        );
      }
    } catch (error) {
      console.error("Submit Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Support</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>How can we help?</Text>
            <Text style={styles.introSub}>
              Please fill out the form below and our team will get back to you
              within 24 hours.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Ex. John Doe"
                value={form.name}
                onChangeText={(text) => {
                  setForm({ ...form, name: text });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
              />
              {errors.name ? (
                <Text style={styles.errorLabel}>{errors.name}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="Ex. 9876543210"
                keyboardType="phone-pad"
                value={form.phone}
                maxLength={10}
                onChangeText={(text) => {
                  setForm({ ...form, phone: text });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
              />
              {errors.phone ? (
                <Text style={styles.errorLabel}>{errors.phone}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Ex. john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => {
                  setForm({ ...form, email: text });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
              {errors.email ? (
                <Text style={styles.errorLabel}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Order ID *</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.orderId ? styles.inputError : null,
                ]}
                placeholder="Ex. ORD_123456789_abc123"
                value={form.orderId}
                autoCapitalize="none"
                onChangeText={(text) => {
                  setForm({ ...form, orderId: text });
                  if (errors.orderId) setErrors({ ...errors, orderId: "" });
                }}
              />
              {errors.orderId ? (
                <Text style={styles.errorLabel}>{errors.orderId}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Query Type *</Text>
              <View style={styles.chipsContainer}>
                {QUERY_TYPES.map((type) => {
                  const isSelected = form.queryType === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                        errors.queryType ? styles.inputError : null,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setForm({ ...form, queryType: type.value });
                        if (errors.queryType)
                          setErrors({ ...errors, queryType: "" });
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.queryType ? (
                <Text style={styles.errorLabel}>{errors.queryType}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.message ? styles.inputError : null,
                ]}
                placeholder="Tell us more about your query..."
                multiline
                numberOfLines={4}
                value={form.message}
                onChangeText={(text) => {
                  setForm({ ...form, message: text });
                  if (errors.message) setErrors({ ...errors, message: "" });
                }}
                textAlignVertical="top"
              />
              {errors.message ? (
                <Text style={styles.errorLabel}>{errors.message}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Query</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#333",
    marginLeft: 12,
  },
  scrollContent: { padding: wp("5%"), paddingBottom: 40 },
  introSection: { marginBottom: 24 },
  introTitle: {
    fontSize: RFValue(20),
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  introSub: { fontSize: RFValue(13), color: "#666", lineHeight: 20 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: RFValue(13), fontWeight: "700", color: "#444" },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 14,
    fontSize: RFValue(14),
    borderWidth: 1,
    borderColor: "#E9ECEF",
    color: "#333",
  },
  inputError: {
    borderColor: "#E53935",
    backgroundColor: "#FFF8F8",
  },
  errorLabel: {
    fontSize: RFValue(11),
    color: "#E53935",
    fontWeight: "600",
    marginTop: 2,
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  chipSelected: {
    backgroundColor: "#0C5273",
    borderColor: "#0C5273",
  },
  chipText: {
    fontSize: RFValue(12),
    color: "#666",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFF",
  },
  submitBtn: {
    backgroundColor: "#0C5273",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0C5273",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: "#FFF", fontSize: RFValue(15), fontWeight: "800" },
});
