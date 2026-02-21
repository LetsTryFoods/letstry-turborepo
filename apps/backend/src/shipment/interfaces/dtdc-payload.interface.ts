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
      city?: string;
      state?: string;
      city_name?: string;
      state_name?: string;
      country?: string;
      email?: string;
      latitude?: string;
      longitude?: string;
    };
    customer_reference_number: string;
    cod_collection_mode?: string;
    cod_amount?: string;
    commodity_id: string;
    is_risk_surcharge_applicable: boolean;
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
  status: string;
  data: {
    reference_number: string;
    customer_reference_number: string;
    label_url?: string;
    success: boolean;
    remarks?: string;
    message?: string;
    reason?: string;
  }[];
}

export interface DtdcCancelPayload {
  AWBNo: string[];
  customerCode: string;
}

export interface DtdcTrackingResponse {
  statusCode: number;
  statusFlag: boolean;
  status: string;
  errorDetails: { name: string; value: string }[] | null;
  trackHeader: {
    strShipmentNo: string;
    strRefNo: string;
    strCNType: string;
    strCNTypeCode: string;
    strCNTypeName: string;
    strCNProduct: string;
    strModeCode: string;
    strMode: string;
    strCNProdCODFOD: string;
    strOrigin: string;
    strOriginRemarks: string;
    strBookedDate: string;
    strBookedTime: string;
    strPieces: string;
    strWeightUnit: string;
    strWeight: string;
    strDestination: string;
    strStatus: string;
    strStatusTransOn: string;
    strStatusTransTime: string;
    strStatusRelCode: string;
    strStatusRelName: string;
    strRemarks: string;
    strNoOfAttempts: string;
    strRtoNumber: string;
    strExpectedDeliveryDate: string;
    strRevExpectedDeliveryDate: string;
  } | null;
  trackDetails: {
    strCode: string;
    strAction: string;
    strManifestNo: string;
    strOrigin: string;
    strDestination: string;
    strOriginCode: string;
    strDestinationCode: string;
    strActionDate: string;
    strActionTime: string;
    sTrRemarks: string;
    strLatitude: string;
    strLongitude: string;
    strNDCOTP: string;
    strSCDOTP?: string;
  }[] | null;
}
