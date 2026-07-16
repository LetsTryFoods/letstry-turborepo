import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bullmq';
import { Model } from 'mongoose';
import { Queue } from 'bullmq';
import { INestApplicationContext } from '@nestjs/common';
import { PackingOrder } from './packing/entities/packing-order.entity';
import { Address } from './address/address.schema';

async function bootstrap() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log('🚀 STARTING RESEND-PACKED SCRIPT');
  console.log('====================================================');
  console.log(`[${new Date().toISOString()}] Bootstrapping NestJS application context...`);

  let app: INestApplicationContext;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    console.log(`[${new Date().toISOString()}] NestJS application context successfully created.`);
  } catch (err) {
    console.error('❌ Failed to bootstrap NestJS application context:', err);
    process.exit(1);
  }

  // Get the Queue and Models from Nest's DI
  const whatsappQueue = app.get<Queue>(getQueueToken('whatsapp-notification-queue'));
  const packingOrderModel = app.get<Model<any>>(getModelToken(PackingOrder.name));
  const orderModel = app.get<Model<any>>(getModelToken('Order'));
  const addressModel = app.get<Model<any>>(getModelToken(Address.name));

  const isTestMode = process.argv.includes('--test');

  if (isTestMode) {
    // --- MANUAL TEST CASE ---
    console.log('\n🧪 Pushing manual test case to queue...');
    const testPayload = {
      phoneNumber: '918840330283', // Normalized to include 91
      orderId: 'ORD_TEST_12345',
      recipientName: 'krishna seth',
    };
    try {
      const job = await whatsappQueue.add('order-packed', testPayload);
      console.log(`🧪 Test case queued successfully! Job ID: ${job.id}`);
    } catch (testErr: any) {
      console.error(`❌ Failed to queue test case:`, testErr.message);
    }
    console.log('----------------------------------------------------\n');

    console.log('🧪 TEST MODE ONLY: Skipping normal DB fetch.');
    console.log('⏳ Waiting 3 seconds for active Redis connections to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await app.close();
    console.log('👋 Test case queued successfully. Exiting.');
    process.exit(0);
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  console.log(`\n🔍 Fetching completed packing orders from DB...`);
  console.log(`   - Status Filter: "completed"`);
  console.log(`   - Time Filter: >= ${startOfToday.toISOString()} (Today)`);

  let packedOrders: any[] = [];
  try {
    packedOrders = await packingOrderModel.find({
      status: 'completed',
      packingCompletedAt: { $gte: startOfToday }
    });
  } catch (dbErr) {
    console.error('❌ Database error while fetching packing orders:', dbErr);
    await app.close();
    process.exit(1);
  }

  console.log(`\n📦 DB Results: Found ${packedOrders.length} packed orders today.`);

  if (packedOrders.length === 0) {
    console.log('ℹ️ No orders need processing. Exiting.');
    await app.close();
    process.exit(0);
  }

  let successCount = 0;
  let failCount = 0;

  console.log('\n🔄 Processing orders and pushing to queue:');
  console.log('----------------------------------------------------');

  for (let i = 0; i < packedOrders.length; i++) {
    const packingOrder = packedOrders[i];
    const orderIdStr = packingOrder.orderId; // DB ID

    // Fetch the main order details
    const order = await orderModel.findById(orderIdStr);
    if (!order) {
      console.log(`[${i + 1}/${packedOrders.length}] ⚠️ Main order not found in DB for Packing Order ID: ${packingOrder.orderNumber}`);
      failCount++;
      continue;
    }

    // Fetch the shipping address to get recipient info
    const shippingAddress = order.shippingAddressId
      ? await addressModel.findById(order.shippingAddressId)
      : null;

    // Resolve phone number using backend logic
    const isValid = (p?: string) => p && p !== 'N/A';
    const rawPhone =
      (isValid(order?.recipientContact?.phone) && order.recipientContact.phone) ||
      (isValid(shippingAddress?.recipientPhone) && shippingAddress.recipientPhone) ||
      null;

    const name = shippingAddress?.recipientName || order.identity?.name || order.placerContact?.firstName || 'Customer';
    const orderNumber = order.orderId || packingOrder.orderNumber; // Display ID (like ORD_...)
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');

    // Tracking URL (mocked/resolved)
    const trackingUrl = `https://letstryfoods.com/track/`;

    console.log(`[${i + 1}/${packedOrders.length}] Processing Order Number: ${orderNumber}`);
    console.log(`    - Customer Name: ${name}`);
    console.log(`    - Phone Number : ${rawPhone || 'MISSING'}`);

    if (!rawPhone) {
      console.log(`    ⚠️ Skipping: No phone number found.`);
      failCount++;
      continue;
    }

    // Normalize phone number (ensure 91 prefix)
    const normalizedPhone = rawPhone.replace(/^\+/, '');
    const phone = normalizedPhone.length === 10 ? `91${normalizedPhone}` : normalizedPhone;

    const payload = {
      phoneNumber: phone,
      orderId: orderNumber,
      orderDate,
      trackingUrl,
      recipientName: name,
    };

    console.log(`    - Payload prepared:`, JSON.stringify(payload));
    console.log(`    - Pushing to queue "whatsapp-notification-queue"...`);

    // Add to Bull Queue
    try {
      const job = await whatsappQueue.add('order-packed', payload);
      console.log(`    ✅ Successfully queued! Job ID: ${job.id}`);
      successCount++;
    } catch (e) {
      console.error(`    ❌ Error queueing job:`, e.message);
      failCount++;
    }
  }

  console.log('----------------------------------------------------');
  console.log('\n🏁 --- Finished Queueing ---');
  console.log(`📊 Statistics:`);
  console.log(`   - Total Processed: ${packedOrders.length}`);
  console.log(`   - Successfully Queued: ${successCount}`);
  console.log(`   - Failed/Skipped: ${failCount}`);
  console.log(`⏳ Total Time Elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);

  console.log(`\n⏳ Waiting 3 seconds for active Redis connections to complete...`);
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    await app.close();
    console.log('🔌 NestJS application context closed successfully.');
  } catch (closeErr) {
    console.error('⚠️ Error closing NestJS context:', closeErr.message);
  }

  console.log('\n👋 Script completed. Exiting.');
  process.exit(0);
}

bootstrap();
