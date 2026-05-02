import React from 'react';
import { View, Text } from 'react-native';

// Import existing SDUI components
import Spacer from '../../features/home/components/Spacer';
import CartNotice from '../../features/cart/components/CartNotice';
import HomeFooter from '../../features/home/components/HomeFooter';
import TopBanner from '../../features/home/components/TopBanner';
import BannerCarousel from '../../features/home/components/BannerCarousel';
import SDUIForm from './components/SDUIForm';
import SDUITextInput from './components/SDUITextInput';
import SDUIButton from './components/SDUIButton';
import ProfileHeader from './components/ProfileHeader';
import AuthCard from './components/AuthCard';
import LinkSection from './components/LinkSection';
import LogoutButton from './components/LogoutButton';

// A simple Component Registry
const Registry: Record<string, React.FC<any>> = {
  Spacer,
  CartNotice,
  HomeFooter,
  TopBanner,
  BannerCarousel,
  SDUIForm,
  SDUITextInput,
  SDUIButton,
  ProfileHeader,
  AuthCard,
  LinkSection,
  LogoutButton,
  // Add more as needed. Note: components requiring complex global context (like HorizontalSection) 
  // are currently kept in index.tsx for safety, but simple ones can go here.
};

interface SDUIRendererProps {
  components: any[];
}

export const SDUIRenderer: React.FC<SDUIRendererProps> = ({ components }) => {
  return (
    <>
      {components.map((item, index) => {
        const Component = Registry[item.type];
        
        if (!Component) {
          return (
            <View key={`fallback-${index}`} style={{ padding: 10, backgroundColor: '#ffebee', margin: 10, borderRadius: 8 }}>
              <Text style={{ color: '#c62828' }}>[SDUI Error] Unknown Component: {item.type}</Text>
            </View>
          );
        }

        return <Component key={`${item.type}-${index}`} {...item.props} />;
      })}
    </>
  );
};
