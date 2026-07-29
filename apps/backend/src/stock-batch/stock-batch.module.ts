import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockBatch, StockBatchSchema } from './stock-batch.schema';
import { PurchaseOrder, PurchaseOrderSchema } from './purchase-order.schema';
import { StockBatchService } from './stock-batch.service';
import { StockBatchResolver } from './stock-batch.resolver';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockBatch.name, schema: StockBatchSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
    ]),
    ProductModule, // provides InventoryService (exported from ProductModule)
  ],
  providers: [StockBatchService, StockBatchResolver],
  exports: [StockBatchService], // exported so PackingModule can inject it
})
export class StockBatchModule {}
