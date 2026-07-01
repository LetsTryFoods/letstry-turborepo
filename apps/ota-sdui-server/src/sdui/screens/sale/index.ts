import { SDUIScreen } from "../../types";
import { graphqlRequest } from "../../../lib/graphql";

const SALE_PRODUCTS_QUERY = `
  query GetNearExpirySaleProducts {
    nearExpirySaleProducts {
      _id
      name
      slug
      brand
      defaultVariant {
        _id
        sku
        name
        price
        mrp
        discountPercent
        packageSize
        stockQuantity
        availabilityStatus
        thumbnailUrl
        isDefault
        isActive
        isSaleVariant
      }
      variants {
        _id
        sku
        name
        price
        mrp
        discountPercent
        packageSize
        stockQuantity
        availabilityStatus
        thumbnailUrl
        isDefault
        isActive
        isSaleVariant
      }
    }
  }
`;

export const getSaleScreen = async (): Promise<SDUIScreen> => {
  try {
    const data = await graphqlRequest<{ nearExpirySaleProducts: any[] }>(
      SALE_PRODUCTS_QUERY
    );
    const products = data.nearExpirySaleProducts || [];

    // Map products to the SDUI expected format for product grids/bestsellers.
    // Assuming SDUI expects basic card info. Usually, 'Combos' or 'Bestsellers' 
    // will just take a title and we can pass the data inside, or SDUI might 
    // expect the frontend to fetch the data. Wait, does SDUI pass product data 
    // down or just the component configuration?
    // Let's pass the fetched products to the component as 'products' prop.
    const mappedProducts = products.map((p) => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.defaultVariant?.thumbnailUrl || "",
      price: p.defaultVariant?.price || 0,
      mrp: p.defaultVariant?.mrp,
      badge: { label: "🔥 SALE", variant: "trending" },
    }));

    return {
      screen: "SaleScreen",
      components: [
        {
          type: "BannerCarousel",
          props: {
            height: 200,
            borderRadius: 0, // full width banner
            autoplayInterval: 0,
            items: [
              {
                id: "sale_banner",
                imageUrl: "https://letstryfoods.com/sale-banner.png",
                action: { type: "NAVIGATE", destination: "/sale" }
              }
            ]
          }
        },
        {
          type: "Bestsellers",
          props: {
            title: "Grab Before It's Gone",
            products: mappedProducts, // Pass fetched products if supported by mobile app
            cardStyles: {
              borderWidth: 1.5,
              borderRadius: 8,
            }
          }
        }
      ]
    };
  } catch (error) {
    console.error("Failed to fetch sale products for SDUI:", error);
    // Return a fallback screen on error
    return {
      screen: "SaleScreen",
      components: [
        {
          type: "EventsHero",
          props: {
            marginBottom: 20,
          },
        }
      ]
    };
  }
};
