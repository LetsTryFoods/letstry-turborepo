import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WhatsAppOrchestrator } from './whatsapp/services/whatsapp-orchestrator.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  console.log('Bootstrapping NestJS application context...');
  // Only load application context without starting HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('NestJS application context created.');

  // Get our orchestrator service and Order model directly from Nest's DI
  const orchestrator = app.get(WhatsAppOrchestrator);
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

    console.log(`Sending WhatsApp to ${phone} for order ${orderId}...`);
    
    // Call the exact same function the backend uses
    try {
      const result = await orchestrator.sendOrderPackedNotification(phone, orderId, '', '', name);
      if (result && result.success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (e) {
      console.error(`Error sending to ${phone}:`, e.message);
      failCount++;
    }
    
    // 200ms delay to respect rate limits
    await new Promise(res => setTimeout(res, 200));
  }

  console.log('\n--- Finished ---');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);

  await app.close();
  process.exit(0);
}

bootstrap();
