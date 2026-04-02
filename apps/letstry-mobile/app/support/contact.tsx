import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';
import { SUBMIT_CONTACT_MESSAGE } from '../../src/lib/graphql/support';
import { RFValue, wp, hp } from '../../src/lib/utils/ui-utils';
import * as Haptics from 'expo-haptics';

export default function ContactUsScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });

  const [submitContact, { loading }] = useMutation(SUBMIT_CONTACT_MESSAGE);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Email, Message).');
      return;
    }

    let hasError = false;
    const newErrors = { email: '', phone: '' };

    if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
      hasError = true;
    }

    if (form.phone && !validatePhone(form.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { data } = await submitContact({
        variables: {
          input: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            subject: form.subject || 'LTS Mobile Inquiry',
            message: form.message,
          }
        }
      });

      if (data?.submitContactMessage?.success) {
        Alert.alert(
          'Success',
          'Your query has been submitted successfully. We will get back to you shortly.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', data?.submitContactMessage?.message || 'Failed to submit query.');
      }
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
            <Text style={styles.introSub}>Please fill out the form below and our team will get back to you within 24 hours.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. John Doe"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
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
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
              />
              {errors.email ? <Text style={styles.errorLabel}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="Ex. 9876543210"
                keyboardType="phone-pad"
                value={form.phone}
                maxLength={10}
                onChangeText={(text) => {
                  setForm({ ...form, phone: text });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
              />
              {errors.phone ? <Text style={styles.errorLabel}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. Delivery Query"
                value={form.subject}
                onChangeText={(text) => setForm({ ...form, subject: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us more about your query..."
                multiline
                numberOfLines={4}
                value={form.message}
                onChangeText={(text) => setForm({ ...form, message: text })}
                textAlignVertical="top"
              />
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
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  scrollContent: { padding: wp('5%'), paddingBottom: 40 },
  introSection: { marginBottom: 24 },
  introTitle: { fontSize: RFValue(20), fontWeight: '800', color: '#333', marginBottom: 8 },
  introSub: { fontSize: RFValue(13), color: '#666', lineHeight: 20 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: RFValue(13), fontWeight: '700', color: '#444' },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    fontSize: RFValue(14),
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#333',
  },
  inputError: {
    borderColor: '#E53935',
    backgroundColor: '#FFF8F8',
  },
  errorLabel: {
    fontSize: RFValue(11),
    color: '#E53935',
    fontWeight: '600',
    marginTop: 2,
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  submitBtn: {
    backgroundColor: '#0C5273',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0C5273',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#FFF', fontSize: RFValue(15), fontWeight: '800' },
});
