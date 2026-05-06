export const SHIPROCKET_STATUS_MAP: Record<number, string> = {
  6:  'ITM',   // SHIPPED → In Transit
  7:  'DLV',   // DELIVERED
  8:  'CAN',   // CANCELED
  9:  'RTO',   // RTO INITIATED
  10: 'RTO',   // RTO DELIVERED
  13: 'NONDLV',// PICKUP ERROR
  17: 'OFD',   // OUT FOR DELIVERY
  18: 'ITM',   // IN TRANSIT
  19: 'PUP',   // OUT FOR PICKUP
  20: 'NONDLV',// PICKUP EXCEPTION
  21: 'NONDLV',// UNDELIVERED
  42: 'PUP',   // PICKED UP
};
