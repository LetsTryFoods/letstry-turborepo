export enum ShipmentStatusCode {
  BKD = 'BKD',
  PUP = 'PUP',
  ITM = 'ITM',
  OFD = 'OFD',
  DLV = 'DLV',
  NONDLV = 'NONDLV',
  RTO = 'RTO',
  CAN = 'CAN',
  HLD = 'HLD',
}

export enum ServiceType {
  STANDARD = 'STANDARD',
  LITE = 'LITE',
  B2C_PRIORITY = 'B2C PRIORITY',
  B2C_SMART = 'B2C SMART',
  B2C_SMART_EXPRESS = 'B2C SMART EXPRESS',
  EXPRESS = 'EXPRESS',
  GROUND_EXPRESS = 'GROUND EXPRESS',
}

export enum LoadType {
  DOCUMENT = 'DOCUMENT',
  NON_DOCUMENT = 'NON-DOCUMENT',
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit: string
}

export interface AddressDetails {
  name: string
  phone: string
  alternatePhone?: string
  addressLine1: string
  addressLine2?: string
  pincode: string
  city: string
  state: string
  latitude?: string
  longitude?: string
}

export interface PieceDetail {
  description: string
  declaredValue: number
  weight: number
  height: number
  length: number
  width: number
}

export interface Shipment {
  id: string
  orderId?: string
  dtdcAwbNumber: string
  dtdcReferenceNumber?: string
  customerCode: string
  serviceType: string
  loadType: string
  originCity: string
  destinationCity?: string
  weight: number
  declaredValue?: number
  bookedOn: Date | string
  expectedDeliveryDate?: Date | string
  revisedExpectedDeliveryDate?: Date | string
  rtoNumber?: string
  currentStatusCode?: string
  currentStatusDescription?: string
  currentLocation?: string
  isDelivered: boolean
  deliveredAt?: Date | string
  isRto: boolean
  isCancelled: boolean
  cancelledAt?: Date | string
  labelUrl?: string
  codAmount?: number
  codCollectionMode?: string
  dimensions?: Dimensions
  originDetails?: AddressDetails
  destinationDetails?: AddressDetails
  invoiceNumber?: string
  invoiceDate?: Date | string
  ewayBill?: string
  commodityId?: string
  numPieces: number
  piecesDetail?: PieceDetail[]
  webhookLastReceivedAt?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  trackingLink?: string
}

export interface TrackingHistory {
  id: string
  shipmentId: string
  statusCode: string
  statusDescription: string
  location?: string
  manifestNumber?: string
  actionDate: Date | string
  actionTime: string
  actionDatetime: Date | string
  remarks?: string
  latitude?: number
  longitude?: number
  scdOtp?: boolean
  ndcOtp?: boolean
  createdAt: Date | string
}

export interface ShipmentWithTracking extends Shipment {
  trackingHistory: TrackingHistory[]
}

export interface ShipmentFilters {
  orderId?: string
  customerCode?: string
  statusCode?: string
  isDelivered?: boolean
  isCancelled?: boolean
  awbNumber?: string
  referenceNumber?: string
  bookedFrom?: Date | string
  bookedTo?: Date | string
}

export interface ShipmentSummary {
  totalShipments: number
  inTransit: number
  deliveredToday: number
  pending: number
  rtoCount: number
  cancelled: number
}

export interface ShipmentListData {
  listShipments: {
    success: boolean
    shipments: Shipment[]
    total: number
  }
}

export interface ShipmentByIdData {
  getShipmentById: Shipment
}

export interface ShipmentByAwbData {
  getShipmentByAwb: Shipment
}

export interface ShipmentWithTrackingData {
  getShipmentWithTracking: ShipmentWithTracking
}

export interface CancelShipmentData {
  cancelShipment: Shipment
}

export interface CancelShipmentInput {
  awbNumber: string
}
