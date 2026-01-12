export const DTDC_STATUS_CODES = {
  BKD: 'Booked',
  PUP: 'Picked Up',
  ITM: 'In Transit',
  OFD: 'Out for Delivery',
  DLV: 'Delivered',
  NONDLV: 'Not Delivered',
  RTO: 'Return to Origin',
  CAN: 'Cancelled',
  HLD: 'Held',
  ARD: 'Arrived at Destination',
  UD: 'Undelivered',
  RD: 'Re-Delivery',
  PPD: 'Partially Picked Up',
  PND: 'Pending',
  SHP: 'Shipped',
  DEX: 'Delivery Exception',
  RTD: 'Return Delivered',
  PKD: 'Packed',
  ODA: 'Out for Delivery Again',
  RTS: 'Return to Sender',
  LID: 'Lost in Delivery',
  DMG: 'Damaged',
  MIS: 'Misrouted',
  CNF: 'Confirmed',
  NFI: 'No Further Information',
  CUS: 'Customs Clearance',
  DLF: 'Delivery Failed',
  RTU: 'Return',
  STO: 'Storage',
  AWB: 'AWB Generated',
} as const;

export const DTDC_NON_DELIVERY_REASONS = {
  PRF: 'Receiver Refused Delivery',
  NAV: 'Address Not Available',
  NPR: 'No Person Available to Receive',
  CLS: 'Premises Closed',
  POD: 'Payment on Delivery Issue',
  WTH: 'Weather Conditions',
  VEH: 'Vehicle Breakdown',
  OTH: 'Other Reason',
  INC: 'Incomplete Address',
  REL: 'Relocated',
  CIR: 'Customer Initiated Return',
  DND: 'Do Not Deliver',
} as const;

export const DELIVERY_STATUS_CODES = ['DLV', 'RTD'];
export const FAILED_DELIVERY_CODES = ['NONDLV', 'DLF', 'UD'];
export const RTO_STATUS_CODES = ['RTO', 'RTS', 'RTU'];
export const IN_TRANSIT_CODES = ['ITM', 'SHP', 'ARD', 'OFD', 'ODA'];
export const CANCELLED_CODES = ['CAN'];
