db.orders.insertOne({
  orderId: "ORD-MANUAL-" + Date.now(),
  orderStatus: "CONFIRMED",
  totalAmount: "500.00",
  currency: "INR",
  recipientContact: {
    phone: "+919999999999",
    email: "test@example.com"
  },
  items: [
    { variantId: new ObjectId(), quantity: 1 },
    { variantId: new ObjectId(), quantity: 2 }
  ],
  paymentOrderId: new ObjectId(),
  cartId: new ObjectId(),
  metadata: { source: "manual_verification" },
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
});
print("Manual order created!");
