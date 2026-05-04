import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/backend/.env' });

async function run() {
  await mongoose.connect(process.env.DATABASE_URL || '');
  const db = mongoose.connection;
  const phone = '9873035006';
  const cleanPhone = phone.replace(/\D/g, '');
  const searchPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
  const regex = new RegExp(searchPhone, 'i');

  const orders = await db.collection('orders')
    .aggregate([
      {
        $lookup: {
          from: 'identities',
          localField: 'identityId',
          foreignField: '_id',
          as: 'identity',
        },
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'shippingAddressId',
          foreignField: '_id',
          as: 'address',
        },
      },
      {
        $match: {
          $or: [
            { 'placerContact.phone': regex },
            { 'recipientContact.phone': regex },
            { 'identity.phoneNumber': regex },
            { 'address.recipientPhone': regex },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
    ])
    .toArray();

  console.log(`Agg orders returned: ${orders.length}`);
  if (orders.length > 0) {
      console.log('Found orderId:', orders[0].orderId);
  }
  process.exit(0);
}
run().catch(console.error);
