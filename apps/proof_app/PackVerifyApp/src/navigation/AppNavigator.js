import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import { COLORS } from '../constants/theme';
import CameraScreen from '../screens/CameraScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen'; // <--- YE ADD KIYA
import OrderDetailsScreen from '../screens/OrderDetailsScreen';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login" // <--- YAHAN CHANGE KIYA (Dashboard se Login)
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.white },
        headerTintColor: COLORS.textDark,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Login Screen Add kiya */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} // Login pe header nahi dikhega
      />

      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: 'PackVerify Dashboard',
          headerLeft: null // Back button hata diya taaki wapas login pe na jaaye
        }}
      />
      <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen} 
        options={{ title: 'Packing Order' }}
      />
      <Stack.Screen 
        name="CameraVerification" 
        component={CameraScreen} 
        options={{ 
            title: 'Verification',
            headerStyle: { backgroundColor: COLORS.black },
            headerTintColor: COLORS.white,
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;