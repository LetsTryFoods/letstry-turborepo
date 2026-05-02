import { SDUIScreen } from '../../types';

export const homeScreen: SDUIScreen = {
  screen: 'HomeScreen',
  components: [
    {
      type: 'EventsHero',
      props: {
        // marginTop: -25,
        marginBottom: 4,
      },
    },
    // {
    //   type: 'BannerCarousel',
    //   props: {
    //     height: 200,
    //     borderRadius: 12,
    //     autoplayInterval: 6000,
    //     items: [
    //       {
    //         id: 'banner_1',
    //         imageUrl: 'https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev/44f70fa5794dd60f105a5e5d18679690.webp',
    //         action: { type: 'NAVIGATE', destination: '/categories' }
    //       },
    //       {
    //         id: 'banner_2',
    //         imageUrl: 'https://placehold.co/1000x100/805AD5/white?text=SUPER+SALE+50%25+OFF',
    //         action: { type: 'NAVIGATE', destination: '/orders' }
    //       }
    //     ]
    //   },
    // },
    {
      type: 'Combos',
      props: {
        title: 'Bestselling Combos',
        cardStyles: {
          // borderColor: '#F44336',
          borderWidth: 1.5,
          borderRadius: 8,
        }
      },
    },

    // {
    //   type: 'TopBanner',
    //   props: {
    //     visible: true,
    //     imageUrl: 'https://placehold.co/1000x100/0C5273/white?text=FREE+DELIVERY+ON+ORDERS+ABOVE+RS+499',
    //     aspectRatio: 10,
    //   },
    // },
    {
      type: 'Categories',
      props: {
        title: 'Explore Categories',
        numColumns: 4,
        showSeeAll: true,
      },
    },
    {
      type: 'HeroCarousel',
      props: {},
    },
    {
      type: 'Bestsellers',
      props: {
        title: 'Best Sellers',
        cardStyles: {
          // borderColor: '#4CAF50',
          borderWidth: 2,
          borderRadius: 16,
        }
      },
    },
    {
      type: 'HomeFooter',
      props: {
        mainText: "Tasty, healthy snacks crafted with care. ❤️",
        brandText: "Let's Try",
      },
    },
  ],
  config: {
    homeEventsHeroTopMargin: -10,
  },
};
