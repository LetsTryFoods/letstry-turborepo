import { Tabs, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SDUIService } from '../../src/features/home/services/sdui.service';
import { wp, hp } from '../../src/lib/utils/ui-utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const { data: navData } = useQuery({
    queryKey: ['sdui', 'navigation'],
    queryFn: () => SDUIService.getNavigationConfig(),
    staleTime: 1000 * 60 * 5,
  });

  const tabs = navData?.tabs || [
    { id: 'tab_home', name: 'index', label: 'Home', icon: 'home-outline', screenId: 'home' },
    { id: 'tab_categories', name: 'categories', label: 'Categories', icon: 'grid-outline', screenId: 'categories_screen' },
    { id: 'tab_profile', name: 'profile', label: 'Profile', icon: 'person-outline', screenId: 'profile_screen' },
  ];

  const activeColor = navData?.activeColor || '#E8A020';
  const inactiveColor = navData?.inactiveColor || '#9E9E9E';
  const labelFontSize = navData?.labelFontSize || 10;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => (
        <View style={[styles.tabBar, { paddingBottom: insets.bottom || 10 }]}>
          {tabs.map((tab: any) => {
            const isStaticRoute = tab.name === 'index' || tab.name === 'categories' || tab.name === 'profile';
            const targetPath = `/${tab.name === 'index' ? '' : (isStaticRoute ? tab.name : tab.screenId)}`;
            const isFocused = pathname === targetPath;
            
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => {
                  router.push(targetPath as any);
                }}
              >
                <Ionicons 
                  name={isFocused ? tab.icon.replace('-outline', '') : tab.icon} 
                  size={24} 
                  color={isFocused ? activeColor : inactiveColor} 
                />
                <Text style={[styles.tabLabel, { color: isFocused ? activeColor : inactiveColor, fontSize: labelFontSize }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="[screenId]" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  }
});
