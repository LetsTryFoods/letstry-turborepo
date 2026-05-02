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
