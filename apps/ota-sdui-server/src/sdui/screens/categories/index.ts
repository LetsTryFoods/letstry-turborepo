import { SDUIScreen } from '../../types';

export const categoriesScreen: SDUIScreen = {
  screen: 'CategoriesScreen',
  components: [
    {
      type: 'CategoriesHeader',
      props: {
        showSearch: true,
        styleConfig: {
          backgroundColor: '#FFFFFF',
          textColor: '#333333',
          iconColor: '#333333',
          borderBottomColor: '#F0F0F0',
          borderBottomWidth: 1
        }
      }
    },
    // {
    //   type: 'BannerCarousel',
    //   props: {
    //     height: 140,
    //     fullWidth: true,
    //     isSticky: false,
    //     items: [
    //       {
    //         imageUrl: 'https://placehold.co/1000x400/0C5273/white?text=CATEGORY+OFFERS',
    //         action: { type: 'NAVIGATE', payload: { screen: 'home' } }
    //       },
    //       {
    //         imageUrl: 'https://placehold.co/1000x400/D4AF37/white?text=NEW+ARRIVALS',
    //         action: { type: 'NAVIGATE', payload: { screen: 'loyalty' } }
    //       }
    //     ]
    //   }
    // },
    {
      type: 'CategoriesSplitView',
      props: {
        styleConfig: {
          sidebarActiveBg: '#FFF9EB',
          sidebarActiveText: '#23211eff',
          sidebarInactiveText: '#666666',
          sidebarInactiveBg: '#FFFFFF',
          gridBackgroundColor: '#FFFFFF'
        }
      }
    }
  ]
};
