export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  variant?: string;
}

export interface ShippingAddress {
  recipientName: string;
  recipientPhoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface LegacyOrder {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  address: {
    recipientName: string;
    recipientPhoneNumber: string;
    street: string;
    buildingName: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    floor?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
  pickupLocation?: string;
  createdAt: { $date: string } | string;
}

export interface PunchResult {
  success: boolean;
  awbNumber?: string;
  labelUrl?: string;
  error?: string;
}
