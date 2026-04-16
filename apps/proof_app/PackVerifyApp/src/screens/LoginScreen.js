

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/theme';

import { useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PACKER_LOGIN } from '../graphql/queries';

const LoginScreen = ({ navigation }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const [login, { loading }] = useMutation(PACKER_LOGIN, {
    onCompleted: async (data) => {
      const { accessToken, packer } = data.packerLogin;
      await AsyncStorage.setItem('userToken', accessToken);
      await AsyncStorage.setItem('packerId', packer.id);
      navigation.replace('Dashboard', { user: packer });
    },
    onError: (error) => {
      Alert.alert('Login Failed', error.message || 'Please check your ID and Password');
    }
  });

  const handleLogin = () => {
    if (!employeeId || !password) {
      Alert.alert("Error", "Please enter your Employee ID and Password");
      return;
    }

    login({
      variables: {
        input: {
          employeeId: employeeId,
          password: password,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.background}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
        
        {/* Header Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="cube" size={60} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>PackVerify</Text>
        <Text style={styles.subtitle}>Warehouse Logistics System</Text>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Employee ID</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Enter Employee ID"
              placeholderTextColor="#94a3b8"
              value={employeeId}
              onChangeText={setEmployeeId}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Enter password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin} 
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#94a3b8', '#cbd5e1'] : [COLORS.primary, COLORS.primaryLight]}
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Login to Dashboard</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Internal Use Only • v1.0.0</Text>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, height: '100%' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  iconContainer: {
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    width: 100, height: 100, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#e2e8f0', textAlign: 'center', marginBottom: 40 },
  
  card: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc',
    borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20, paddingHorizontal: 15, height: 55
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: COLORS.textDark },
  
  button: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 18 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: 30, fontSize: 12 },
});

export default LoginScreen;