import { getSaleProducts, getSaleBanners } from "@/lib/sale/get-sale-data";
import { SaleSectionClient } from "./sale-section-client";

/**
 * Server component — fetches sale products and sale banners,
 * then renders nothing if there are no sale products.
 */
export const SaleSection = async () => {
  const [products, banners] = await Promise.all([
    getSaleProducts(),
    getSaleBanners(),
  ]);

  if (products.length === 0) {
    return null;
  }

  return <SaleSectionClient products={products} banners={banners} />;
};
