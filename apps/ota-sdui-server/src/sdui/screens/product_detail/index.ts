import { SDUIScreen } from "../../types";

export const productDetailScreen: SDUIScreen = {
  screen: "ProductDetailScreen",
  components: [
    {
      type: "ProductGallery",
      props: {},
    },
    {
      type: "ProductInfo",
      props: {},
    },
    // {
    //   type: 'FullWidthBanner',
    //   props: {
    //     height: 140,
    //     imageUrl: 'https://placehold.co/1000x400/0C5273/white?text=LIMITED+OFFER',
    //     action: { type: 'NAVIGATE', payload: { screen: 'home' } }
    //   }
    // },
    {
      type: "RelatedProducts",
      props: {
        title: "Similar Products",
      },
    },
  ],
};
