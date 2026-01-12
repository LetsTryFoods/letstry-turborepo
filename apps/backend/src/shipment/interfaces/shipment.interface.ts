export interface ShipmentFilters {
  orderId?: string;
  customerCode?: string;
  statusCode?: string;
  isDelivered?: boolean;
  isCancelled?: boolean;
  bookedFrom?: Date;
  bookedTo?: Date;
  awbNumber?: string;
  referenceNumber?: string;
}

export interface CreateShipmentData {
  orderId?: string;
  serviceType: string;
  loadType: string;
  weight: number;
  declaredValue: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  originDetails: {
    name: string;
    phone: string;
    alternatePhone?: string;
    addressLine1: string;
    addressLine2?: string;
    pincode: string;
    city: string;
    state: string;
    latitude?: string;
    longitude?: string;
  };
  destinationDetails: {
    name: string;
    phone: string;
    alternatePhone?: string;
    addressLine1: string;
    addressLine2?: string;
    pincode: string;
    city: string;
    state: string;
    latitude?: string;
    longitude?: string;
  };
  codAmount?: number;
  codCollectionMode?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  ewayBill?: string;
  commodityId: string;
  description?: string;
  numPieces?: number;
  piecesDetail?: {
    description: string;
    declaredValue: number;
    weight: number;
    height: number;
    length: number;
    width: number;
  }[];
}
