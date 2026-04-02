import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/styles/theme';
import { useAuthStore } from '../../src/store/auth-store';
import { RFValue, wp } from '../../src/lib/utils/ui-utils';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleAuthAction = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  };

  const handleOrdersPress = () => {
    if (isAuthenticated) {
      router.push('/orders');
    } else {
      Alert.alert(
        'Login Required',
        'To see your full order history, please log in. \n\nAlternatively, you can skip login and track a specific order if you have your Order ID, Phone Number, or AWB.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Track without Login', 
            onPress: () => router.push('/orders/track'),
          },
          { 
            text: 'Login Now', 
            onPress: () => router.push('/auth/login'),
            style: 'default'
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* Auth Card */}
          <TouchableOpacity 
            style={styles.authCard} 
            onPress={handleAuthAction}
            activeOpacity={isAuthenticated ? 1 : 0.8}
          >
            <View style={styles.authIconWrap}>
              <Ionicons 
                name={isAuthenticated ? "person" : "person-add"} 
                size={24} 
                color="#fff" 
              />
            </View>
            <View style={styles.authInfo}>
              <Text style={styles.authTitle}>
                {isAuthenticated ? (user?.firstName || 'Welcome Back!') : 'Login / Sign Up'}
              </Text>
              <Text style={styles.authSubtitle}>
                {isAuthenticated 
                  ? user?.phoneNumber || 'Manage your account' 
                  : 'Get personalized experience & track orders'}
              </Text>
            </View>
            {!isAuthenticated && (
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.colors.text.muted} 
              />
            )}
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity
              style={styles.item}
              onPress={handleOrdersPress}
            >
              <View style={styles.itemContent}>
                <Ionicons name="receipt" size={22} color={theme.colors.primary} />
                <Text style={styles.itemLabel}>My Orders</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push('/checkout/location')}
            >
              <View style={styles.itemContent}>
                <Ionicons name="location" size={22} color={theme.colors.primary} />
                <Text style={styles.itemLabel}>My Addresses</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Queries</Text>
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push('/orders/track')}
            >
              <View style={styles.itemContent}>
                <Ionicons name="bus" size={22} color={theme.colors.primary} />
                <Text style={styles.itemLabel}>Track Order</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push('/support/contact')}
            >
              <View style={styles.itemContent}>
                <Ionicons name="help-circle" size={22} color={theme.colors.primary} />
                <Text style={styles.itemLabel}>Contact Queries</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System</Text>
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push('/network-logs')}
            >
              <View style={styles.itemContent}>
                <Ionicons name="pulse" size={22} color={theme.colors.primary} />
                <Text style={styles.itemLabel}>View Network Logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>

          {isAuthenticated && (
            <TouchableOpacity 
              style={[styles.section, styles.logoutButton]} 
              onPress={() => logout()}
            >
              <View style={styles.itemContent}>
                <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                <Text style={[styles.itemLabel, { color: '#FF3B30' }]}>Logout</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, paddingHorizontal: wp('5%'), paddingTop: theme.spacing.md },
  header: { marginBottom: theme.spacing.lg },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  authCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  authIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  authInfo: {
    flex: 1,
  },
  authTitle: {
    fontSize: RFValue(15),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  authSubtitle: {
    fontSize: RFValue(11.5),
    color: theme.colors.text.muted,
  },
  section: { marginTop: theme.spacing.md, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 12, marginBottom: 16 },
  sectionTitle: {
    fontSize: RFValue(11),
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  itemContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  itemLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  logoutButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 0,
    marginBottom: 40,
  },
});
