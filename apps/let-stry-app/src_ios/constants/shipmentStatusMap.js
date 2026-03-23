// export const shipmentStageMap = {
//   // ---- Order Placed group ----
//   1: "Order Placed", "awb assigned": "Order Placed",
//   2: "Order Placed", "label generated": "Order Placed",
//   3: "Order Placed", "pickup scheduled/generated": "Order Placed",
//   4: "Order Placed", "pickup queued": "Order Placed",
//   5: "Order Placed", "manifest generated": "Order Placed",
//   15: "Order Placed", "pickup rescheduled": "Order Placed",
//   19: "Order Placed", "out for pickup": "Order Placed",
//   42: "Order Placed", "picked up": "Order Placed",
//   51: "Order Placed", "handover to courier": "Order Placed",
//   52: "Order Placed", "shipment booked": "Order Placed",
//   59: "Order Placed", "box packing": "Order Placed",

//   // ---- In Transit ----
//   6: "In Transit", "shipped": "In Transit",
//   18: "In Transit", "in transit": "In Transit",
//   38: "In Transit", "reached at destination": "In Transit",
//   39: "In Transit", "misrouted": "In Transit",
//   46: "In Transit", "rto in transit": "In Transit",
//   54: "In Transit", "in transit overseas": "In Transit",
//   55: "In Transit", "connection aligned": "In Transit",
//   56: "In Transit", "reached overseas warehouse": "In Transit",
//   50: "In Transit", "in flight": "In Transit",

//   // ---- Out for Delivery ----
//   17: "Out for Delivery", "out for delivery": "Out for Delivery",
//   41: "Out for Delivery", "rto ofd": "Out for Delivery",

//   // ---- Delivered ----
//   7: "Delivered", "delivered": "Delivered",
//   26: "Delivered", "fulfilled": "Delivered",
//   23: "Delivered", "partial delivered": "Delivered",

//   // ---- Cancelled ----
//   8: "Cancelled", "cancelled": "Cancelled",
//   16: "Cancelled", "cancellation requested": "Cancelled",
//   45: "Cancelled", "cancelled before dispatched": "Cancelled",

//   // ---- Return in Progress ----
//   9: "Return in Progress", "rto initiated": "Return in Progress",
//   14: "Return in Progress", "rto acknowledged": "Return in Progress",
//   40: "Return in Progress", "rto ndr": "Return in Progress",

//   // ---- Returned ----
//   10: "Returned", "rto delivered": "Returned",

//   // ---- Customs Clearance ----
//   49: "Customs Clearance", "customs cleared": "Customs Clearance",
//   57: "Customs Clearance", "customs cleared overseas": "Customs Clearance",

//   // ---- At Warehouse ----
//   48: "At Warehouse", "reached warehouse": "At Warehouse",
// };

// // normalizer function
// export const getUserFriendlyStatus = (codeOrLabel) => {
//   if (!codeOrLabel) return "Processing";
//   if (typeof codeOrLabel === "string") {
//     return shipmentStageMap[codeOrLabel.trim().toLowerCase()] || "Processing";
//   }
//   return shipmentStageMap[codeOrLabel] || "Processing";
// };














export const shipmentStageMap = {
  // ---- Order Placed group ----
  1: "Order Placed", "awb assigned": "Order Placed",
  2: "Order Placed", "label generated": "Order Placed",
  3: "Order Placed", "pickup scheduled/generated": "Order Placed",
  4: "Order Placed", "pickup queued": "Order Placed",
  5: "Order Placed", "manifest generated": "Order Placed",
  15: "Order Placed", "pickup rescheduled": "Order Placed",
  19: "Order Placed", "out for pickup": "Order Placed",
  42: "Order Placed", "picked up": "Order Placed",
  51: "Order Placed", "handover to courier": "Order Placed",
  52: "Order Placed", "shipment booked": "Order Placed",
  59: "Order Placed", "box packing": "Order Placed",


  // ---- In Transit ----
  6: "In Transit", "shipped": "In Transit",
  18: "In Transit", "in transit": "In Transit",
  38: "In Transit", "reached at destination": "In Transit",
  39: "In Transit", "misrouted": "In Transit",
  46: "In Transit", "rto in transit": "In Transit",
  54: "In Transit", "in transit overseas": "In Transit",
  55: "In Transit", "connection aligned": "In Transit",
  56: "In Transit", "reached overseas warehouse": "In Transit",
  50: "In Transit", "in flight": "In Transit",

  // ---- Out for Delivery ----
  17: "Out for Delivery", "out for delivery": "Out for Delivery",
  41: "Out for Delivery", "rto ofd": "Out for Delivery",

  // ---- Delivered ----
  7: "Delivered", "delivered": "Delivered",
  26: "Delivered", "fulfilled": "Delivered",
  23: "Delivered", "partial delivered": "Delivered",

  // ---- Cancelled ----
  8: "Cancelled", "cancelled": "Cancelled",
  16: "Cancelled", "cancellation requested": "Cancelled",
  45: "Cancelled", "cancelled before dispatched": "Cancelled",

  // ---- Return in Progress ----
  9: "Return in Progress", "rto initiated": "Return in Progress",
  14: "Return in Progress", "rto acknowledged": "Return in Progress",
  40: "Return in Progress", "rto ndr": "Return in Progress",

  // ---- Returned ----
  10: "Returned", "rto delivered": "Returned",

  // ---- Customs Clearance ----
  49: "Customs Clearance", "customs cleared": "Customs Clearance",
  57: "Customs Clearance", "customs cleared overseas": "Customs Clearance",

  
  48: "Order Placed", "reached warehouse": "Order Placed",
};

// normalizer function
export const getUserFriendlyStatus = (codeOrLabel) => {
  if (!codeOrLabel) return "Order Placed";
  if (typeof codeOrLabel === "string") {
    return shipmentStageMap[codeOrLabel.trim().toLowerCase()] || "Order Placed";
  }
  return shipmentStageMap[codeOrLabel] || "Order Placed";
};



