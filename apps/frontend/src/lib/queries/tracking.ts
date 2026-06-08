import { getBackendApiUrl } from "@/lib/utils/api";

export interface TrackingLookupResult {
  awbNumber: string | null;
  orderId: string | null;
  hasAwb: boolean;
  order: {
    orderId: string;
    orderStatus: string;
    totalAmount: string;
    currency: string;
    items: Array<{
      name: string;
      quantity: number;
      price: string;
      totalPrice: string;
      variant: string | null;
      image: string | null;
    }>;
    recipientContact: { phone: string; email?: string } | null;
    createdAt: string;
    shippingAddressId?: {
      buildingName: string;
      floor?: string;
      streetArea?: string;
      landmark?: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    } | null;
  } | null;
}

export const fetchTrackingLookup = async (
  query: string,
): Promise<TrackingLookupResult> => {
  const baseUrl = getBackendApiUrl();
  const response = await fetch(
    `${baseUrl}/shipments/lookup?q=${encodeURIComponent(query.trim())}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No order found for the provided details.");
    } else {
      throw new Error("Something went wrong. Please try again.");
    }
  }

  const data = await response.json();
  if (!data.awbNumber && !data.orderId) {
    throw new Error("Invalid response from tracking service.");
  }
  return data as TrackingLookupResult;
};

// Legacy alias kept for backward compatibility
export const fetchTrackingAwb = fetchTrackingLookup;
