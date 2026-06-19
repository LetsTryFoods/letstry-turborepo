const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./src/app.module');
const { PackingService } = require('./src/packing/services/packing.service');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const packingService = app.get(PackingService);
  
  // Try to fetch for packerId: "6a2a700abd1faf29655967c8"
  const history = await packingService.getPackerHistory("6a2a700abd1faf29655967c8");
  console.log("HISTORY COUNT:", history.length);
  if (history.length > 0) {
    console.log("SAMPLE HISTORY ITEM:", JSON.stringify({
      orderId: history[0].orderId,
      boxId: history[0].boxId,
      region: history[0].region
    }, null, 2));
  }

  const assigned = await packingService.getPackerAssignedOrders("6a2a700abd1faf29655967c8");
  console.log("ASSIGNED COUNT:", assigned.length);
  if (assigned.length > 0) {
    console.log("SAMPLE ASSIGNED ITEM:", JSON.stringify({
      orderId: assigned[0].orderId,
      boxId: assigned[0].boxId,
      region: assigned[0].region
    }, null, 2));
  }

  await app.close();
  process.exit(0);
}
bootstrap();
