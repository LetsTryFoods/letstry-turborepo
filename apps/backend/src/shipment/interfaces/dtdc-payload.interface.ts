export interface DtdcWebhookPayload {
  shipment: {
    strRefNo: string;
    strOrigin: string;
    strWeight: string;
    strBookedOn: string;
    strCNProduct: string;
    strRtoNumber: string;
    strCNTypeCode: string;
    strShipmentNo: string;
    strExpectedDeliveryDate: string;
    strRevExpectedDeliveryDate: string;
  };
  shipmentStatus: {
    strAction: string;
    strNDCOTP?: string;
    strSCDOTP?: string;
    strOrigin: string;
    strRemarks: string;
    strLatitude: string;
    strLongitude: string;
    strActionDate: string;
    strActionDesc: string;
    strActionTime: string;
    strManifestNo: string;
  }[];
}

export interface DtdcBookingPayload {
  consignments: {
    customer_code: string;
    service_type_id: string;
    load_type: string;
    consignment_type: string;
    dimension_unit: string;
    length: string;
    width: string;
    height: string;
    weight_unit: string;
    weight: string;
    declared_value: string;
    eway_bill?: string;
    invoice_number?: string;
    invoice_date?: string;
    num_pieces: string;
    origin_details: {
      name: string;
      phone: string;
      alternate_phone?: string;
      address_line_1: string;
      address_line_2?: string;
      pincode: string;
      city: string;
      state: string;
      latitude?: string;
      longitude?: string;
    };
    destination_details: {
      name: string;
      phone: string;
      alternate_phone?: string;
      address_line_1: string;
      address_line_2?: string;
      pincode: string;
      city: string;
      state: string;
      latitude?: string;
      longitude?: string;
    };
    return_details?: {
      name: string;
      phone: string;
      alternate_phone?: string;
      address_line_1: string;
      address_line_2?: string;
      pincode: string;
      city: string;
      state: string;
      country: string;
      email?: string;
    };
    customer_reference_number: string;
    cod_collection_mode?: string;
    cod_amount?: string;
    commodity_id: string;
    description?: string;
    reference_number?: string;
    pieces_detail?: {
      description: string;
      declared_value: string;
      weight: string;
      height: string;
      length: string;
      width: string;
    }[];
  }[];
}

export interface DtdcBookingResponse {
  success: boolean;
  consignments: {
    reference_number: string;
    customer_reference_number: string;
    label_url?: string;
    success: boolean;
    remarks?: string;
  }[];
}

export interface DtdcCancelPayload {
  AWBNo: string[];
  customerCode: string;
}

export interface DtdcTrackingResponse {
  trkType: string;
  strcnno: string;
  addtnlDtl: string;
  trackingDetails: {
    cnNo: string;
    statusCode: string;
    statusDescription: string;
    location: string;
    date: string;
    time: string;
  }[];
}
