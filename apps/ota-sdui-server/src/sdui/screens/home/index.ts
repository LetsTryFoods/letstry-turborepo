import { SDUIScreen } from '../../types';

export const homeScreen: SDUIScreen = {
  screen: 'HomeScreen',
  components: [
    {
      type: 'Header',
      props: {
        title: 'Welcome to LetsTry',
        subtitle: 'Discover new foods today',
      },
    },
    {
      type: 'Banner',
      props: {
        imageUrl: 'https://placehold.co/600x400/orange/white?text=Special+Offers',
        action: 'DISCOUNT_VOUCHER',
      },
    },
    {
      type: 'Grid',
      props: {
        columns: 2,
        items: [
          { id: '1', title: 'Pizza', icon: 'pizza-slice' },
          { id: '2', title: 'Burgers', icon: 'hamburger' },
          { id: '3', title: 'Sushi', icon: 'fish' },
          { id: '4', title: 'Deserts', icon: 'ice-cream' },
        ],
      },
    },
  ],
};
