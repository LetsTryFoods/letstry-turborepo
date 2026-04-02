import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client';
import { theme } from '../../src/styles/theme';
import { RFValue, wp } from '../../src/lib/utils/ui-utils';
import { SEND_OTP, VERIFY_WHATSAPP_OTP, ME_QUERY } from '../../src/lib/graphql/auth';
import { useAuthStore } from '../../src/store/auth-store';
import { client as apolloClient } from '../../src/lib/apollo-client';

type AuthStep = 'phone' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth, sessionId } = useAuthStore();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const otpInputRef = useRef<TextInput>(null);

  const [sendOtpMutation] = useMutation(SEND_OTP);
  const [verifyOtpMutation] = useMutation(VERIFY_WHATSAPP_OTP);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      await sendOtpMutation({ variables: { phoneNumber: formattedPhone } });
      setStep('otp');
      setTimer(30);
      // Focus OTP input after a short delay
      setTimeout(() => otpInputRef.current?.focus(), 500);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code = otp) => {
    if (code.length < 6) return;

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      console.log('[VerifyOtp] Attempting verification for:', formattedPhone);
      
      const { data } = await verifyOtpMutation({
        variables: {
          phoneNumber: formattedPhone,
          otp: code,
          // sessionId: sessionId // Removed as it might not be in the mutation definition
        }
      });

      if (data?.verifyWhatsAppOtp) {
        const token = data.verifyWhatsAppOtp;
        console.log('[VerifyOtp] Success! Token received.');
        console.log('[VerifyOtp] Exact Token Value:', token);
        console.log('[VerifyOtp] Token Length:', token.length);
        
        // Manual set in store immediately. 
        // We set sessionId to null so the backend doesn't reject us for having a guest ID + user Token.
        useAuthStore.setState({ accessToken: token, isAuthenticated: true, sessionId: null });
        
        const storeState = useAuthStore.getState();
        console.log('[VerifyOtp] Token Set in Store:', storeState.accessToken);
        console.log('[VerifyOtp] IsAuthenticated:', storeState.isAuthenticated);
        console.log('[VerifyOtp] SessionId in Store:', storeState.sessionId);

        // WAIT 100ms for Zustand + AsyncStorage internal state loops to fully settle
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('[VerifyOtp] Fetching user profile...');
        // Now fetch user details. authLink will now correctly read the exact token from state.
        const { data: meData, error: meError } = await apolloClient.query({
          query: ME_QUERY,
          fetchPolicy: 'network-only'
        });

        if (meError) {
          console.error('[VerifyOtp] Profile Fetch Error:', meError);
          throw new Error(`Profile sync failed: ${meError.message}`);
        }

        if (meData?.me) {
          console.log('[VerifyOtp] Profile synced:', meData.me.firstName);
          await setAuth(meData.me, token);
          router.replace('/(tabs)/profile');
        } else {
          console.error('[VerifyOtp] Profile query returned no data');
          throw new Error('User profile not found. Please contact support.');
        }
      } else {
        throw new Error('Invalid response from server. Please try again.');
      }
    } catch (error: any) {
      console.error('[VerifyOtp] Critical failure:', error);
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message || 'Invalid OTP';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Simple auto-verify when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleVerifyOtp(otp);
    }
  }, [otp, step]);

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const digit = otp[i] || '';
      const isFocused = otp.length === i;
      boxes.push(
        <View 
          key={i} 
          style={[
            styles.otpBox, 
            isFocused && styles.otpBoxFocused,
            digit !== '' && styles.otpBoxFilled
          ]}
        >
          <Text style={styles.otpBoxText}>{digit}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => step === 'otp' ? setStep('phone') : router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>
            {step === 'phone' ? 'Welcome to LetsTry' : 'Verify Phone'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone' 
              ? 'Enter your mobile number to continue' 
              : `Enter the 6-digit code sent to +91 ${phone}`}
          </Text>

          {step === 'phone' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
              />
            </View>
          ) : (
            <View style={styles.otpContainer}>
              <TouchableOpacity 
                style={styles.otpGrid} 
                activeOpacity={1} 
                onPress={() => otpInputRef.current?.focus()}
              >
                {renderOtpBoxes()}
              </TouchableOpacity>
              
              <TextInput
                ref={otpInputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                textContentType="oneTimeCode"
                autoFocus
              />

              <View style={styles.otpStatus}>
                {timer > 0 ? (
                  <Text style={styles.timer}>Resend OTP in <Text style={{ fontWeight: 'bold' }}>{timer}s</Text></Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, (loading || (step === 'phone' && phone.length < 10) || (step === 'otp' && otp.length < 6)) && styles.buttonDisabled]}
            onPress={step === 'phone' ? handleSendOtp : () => handleVerifyOtp()}
            disabled={loading || (step === 'phone' && phone.length < 10) || (step === 'otp' && otp.length < 6)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {step === 'phone' ? 'Get OTP' : 'Verify & Continue'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our {' '}
              <Text style={styles.linkText}>Terms of Service</Text> and {' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 24 },
  backButton: {
    marginTop: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: RFValue(26),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: theme.colors.text.muted,
    lineHeight: 20,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
  },
  prefix: {
    fontSize: RFValue(16),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: RFValue(16),
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  otpContainer: {
    marginBottom: 40,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: wp('12%'),
    height: wp('14%'),
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  otpBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#fff',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
  },
  otpBoxText: {
    fontSize: RFValue(20),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpStatus: {
    alignItems: 'center',
  },
  timer: {
    fontSize: RFValue(13),
    color: theme.colors.text.muted,
  },
  resendText: {
    fontSize: RFValue(13),
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: RFValue(16),
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  footerText: {
    fontSize: RFValue(12),
    color: theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  }
});
