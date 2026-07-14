import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bull';
import { Model } from 'mongoose';
import { Queue } from 'bull';

async function bootstrap() {
  console.log('Bootstrapping NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('NestJS application context created.');

  // Get the Queue and Order model from Nest's DI
  const whatsappQueue = app.get<Queue>(getQueueToken('whatsapp-notification-queue'));
  const orderModel = app.get<Model<any>>(getModelToken('Order'));

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  console.log(`Searching for orders packed since ${startOfToday.toISOString()}`);
  
  const packedOrders = await orderModel.find({
    orderStatus: 'PACKED',
    updatedAt: { $gte: startOfToday }
  });

  console.log(`Found ${packedOrders.length} packed orders today.`);
  let successCount = 0;
  let failCount = 0;

  for (const order of packedOrders) {
    const phone = order.identity?.phoneNumber || order.placerContact?.phone;
    const name = order.identity?.name || order.placerContact?.firstName || 'Customer';
    const orderId = order.orderId || order._id.toString();

    if (!phone) {
      console.log(`Skipping order ${orderId} (No phone number)`);
      failCount++;
      continue;
    }

    console.log(`Queueing WhatsApp for ${phone} (Order ${orderId})...`);
    
    // Add to Bull Queue exactly like packing.service.ts does
    try {
      await whatsappQueue.add('order-packed', {
        orderId: order._id.toString(),
        orderDisplayId: order.orderId,
        phoneNumber: phone,
        recipientName: name,
      });
      successCount++;
    } catch (e) {
      console.error(`Error queueing for ${phone}:`, e.message);
      failCount++;
    }
  }

  console.log('\n--- Finished Queueing ---');
  console.log(`✅ Queued: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);

  // Allow a few seconds for Redis to process the queued jobs if workers are running locally
  await new Promise(resolve => setTimeout(resolve, 3000));
  await app.close();
  process.exit(0);
}

bootstrap();
