import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: "apps/backend/.env" });

async function run() {
  await mongoose.connect(process.env.DATABASE_URL || "");
  const db = mongoose.connection;
  const orderId = "ORD_1777813983716_512c3ef9";
  const phone = "9873035006";

  const order = await db.collection("orders").findOne({ orderId });
  console.log("Order found:", !!order);
  if (order) {
    console.log("ShippingAddressId:", order.shippingAddressId);
    if (order.shippingAddressId) {
      const address = await db
        .collection("addresses")
        .findOne({ _id: order.shippingAddressId });
      console.log("Address recipientPhone:", address?.recipientPhone);
    }
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const searchPhone =
    cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
  const regex = new RegExp(searchPhone, "i");

  const aggResult = await db
    .collection("orders")
    .aggregate([
      { $match: { orderId: orderId } },
      {
        $lookup: {
          from: "addresses",
          localField: "shippingAddressId",
          foreignField: "_id",
          as: "address",
        },
      },
    ])
    .toArray();

  console.log("Aggregation result with address:", aggResult[0]?.address);

  process.exit(0);
}
run().catch(console.error);
