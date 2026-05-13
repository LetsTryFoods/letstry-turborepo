require('dotenv').config({ path: 'apps/backend/.env.development' });
const mongoose = require('mongoose');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./apps/backend/src/app.module');

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const orderService = app.get('OrderService');
  const packingService = app.get('PackingService');

  const insights = await orderService.getShippingInsights();
  
  if (!insights.mostUsedBox) {
    insights.mostUsedBox = await packingService.getMostUsedRecommendedBox() ?? undefined;
  }

  if (insights.mostUsedBox && !insights.mostUsedBox.includes('(')) {
    const boxDetails = await packingService.getBoxByCode(insights.mostUsedBox);
    if (boxDetails?.internalDimensions) {
      const dims = boxDetails.internalDimensions;
      insights.mostUsedBox = `${insights.mostUsedBox} (${dims.l}x${dims.w}x${dims.h} cm)`;
    }
  }

  console.log('Final insights:', insights);
  await app.close();
  process.exit(0);
}
run().catch(console.error);
