import { SDUIScreen } from '../../types';

export const homeScreen: SDUIScreen = {
  screen: 'HomeScreen',
  components: [
    {
      type: 'EventsHero',
      props: {},
    },
    {
      type: 'TopBanner',
      props: {
        visible: true,
        imageUrl: 'https://placehold.co/1000x100/0C5273/white?text=FREE+DELIVERY+ON+ORDERS+ABOVE+RS+499',
        aspectRatio: 10,
      },
    },
    {
      type: 'Bestsellers',
      props: {
        title: 'Best Sellers',
      },
    },
    {
      type: 'TopBanner',
      props: {
        visible: true,
        imageUrl: 'https://placehold.co/1000x100/0C5273/white?text=FREE+DELIVERY+ON+ORDERS+ABOVE+RS+499',
        aspectRatio: 10,
      },
    },
    {
      type: 'Categories',
      props: {},
    },
    {
      type: 'HeroCarousel',
      props: {},
    },
    {
      type: 'Combos',
      props: {
        title: 'Bestselling Combos',
      },
    },
  ],
  config: {
    homeEventsHeroTopMargin: -10,
  },
};
