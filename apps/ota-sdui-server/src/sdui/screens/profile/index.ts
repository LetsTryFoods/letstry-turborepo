import { SDUIScreen } from '../../types';

export const profileScreen: SDUIScreen = {
  screen: 'ProfileScreen',
  components: [
    {
      type: 'ProfileHeader',
      props: {
        title: 'Profile',
        textColor: '#1A1A1A'
      }
    },
    {
      type: 'AuthCard',
      props: {
        accentColor: '#E8A020',
        cardBackgroundColor: '#FFFFFF'
      }
    },
    {
      type: 'LinkSection',
      props: {
        title: 'Account',
        iconColor: '#E8A020',
        labelFontSize: 18,
        sectionTitleFontSize: 14,
        links: [
          {
            id: 'my_orders',
            label: 'My Orders',
            icon: 'receipt-outline',
            action: {
              type: 'NAVIGATE',
              destination: '/orders'
            }
          },
          {
            id: 'my_addresses',
            label: 'My Addresses',
            icon: 'location-outline',
            requiresAuth: true,
            action: {
              type: 'NAVIGATE',
              destination: '/checkout/location'
            }
          }
        ]
      }
    },
    {
      type: 'LinkSection',
      props: {
        title: 'Support & Queries',
        iconColor: '#E8A020',
        labelFontSize: 18,
        sectionTitleFontSize: 14,
        links: [
          {
            id: 'track_order',
            label: 'Track Order',
            icon: 'bus-outline',
            action: {
              type: 'NAVIGATE',
              destination: '/orders/track'
            }
          },
          {
            id: 'contact_queries',
            label: 'Contact Queries',
            icon: 'help-circle-outline',
            action: {
              type: 'NAVIGATE',
              destination: '/support/contact'
            }
          }
        ]
      }
    },
    // ✅ EXAMPLE: Add a NEW section and screen entirely from the server.
    // The NAVIGATE action points to a screenId that the generic [screenId].tsx
    // handler picks up. Then create "referral" in the screen registry
    // and a new screen appears with zero app code changes!
    // {
    //   type: 'LinkSection',
    //   props: {
    //     title: 'Rewards',
    //     iconColor: '#E8A020',
    //     links: [
    //       {
    //         id: 'referral_program',
    //         label: 'Refer & Earn',
    //         icon: 'gift-outline',
    //         action: { type: 'NAVIGATE', destination: '/(tabs)/referral' }
    //       }
    //     ]
    //   }
    // },
    {
      type: 'LogoutButton',
      props: {
        label: 'Logout',
        textColor: '#FF3B30',
        iconColor: '#FF3B30'
      }
    }
  ]
};
