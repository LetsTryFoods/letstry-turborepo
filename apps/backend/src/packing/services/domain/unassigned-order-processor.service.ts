import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../../order/services/order.repository';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { PackingOrderCreatorService } from './packing-order-creator.service';
import { OrderStatus } from '../../../order/order.schema';
import { PackingLoggerService } from './packing-logger.service';
import { PackingStatus } from '../../../common/enums/packing-status.enum';

@Injectable()
export class UnassignedOrderProcessorService {
    constructor(
        private orderRepository: OrderRepository,
        private packingOrderCrud: PackingOrderCrudService,
        private packingOrderCreator: PackingOrderCreatorService,
        private packingLogger: PackingLoggerService,
    ) { }

    async findUnassignedOrders(): Promise<any[]> {
        const confirmedOrders = await this.orderRepository.findByStatus(
            OrderStatus.CONFIRMED,
        );

        const unassignedOrders: any[] = [];

        for (const order of confirmedOrders) {
            const packingOrder = await this.packingOrderCrud.findOne({
                orderId: order._id.toString(),
            });

            if (!packingOrder) {
                unassignedOrders.push(order);
            }
        }

        return unassignedOrders;
    }

    async findPendingPackingOrders(): Promise<any[]> {
        return this.packingOrderCrud.findAll({
            status: PackingStatus.PENDING,
        });
    }

    async processUnassignedOrders(
        isOrderInQueue: (orderId: string) => Promise<boolean>,
        addToQueue: (orderId: string) => Promise<void>,
    ): Promise<void> {
        const unassignedOrders = await this.findUnassignedOrders();
        const pendingPackingOrders = await this.findPendingPackingOrders();

        this.packingLogger.logUnassignedOrdersCheck(unassignedOrders.length);

        for (const order of unassignedOrders) {
            const orderId = order._id.toString();
            const alreadyInQueue = await isOrderInQueue(orderId);

            if (alreadyInQueue) {
                continue;
            }

            try {
                await this.packingOrderCreator.createFromOrder(order);
                await addToQueue(orderId);
            } catch (error) {
                this.packingLogger.logError(
                    'Failed to process unassigned order',
                    error,
                    { orderId },
                );
            }
        }

        for (const packingOrder of pendingPackingOrders) {
            const orderId = packingOrder.orderId;
            const alreadyInQueue = await isOrderInQueue(orderId);

            if (alreadyInQueue) {
                continue;
            }

            try {
                await addToQueue(orderId);
                this.packingLogger.logOrderEnqueued(orderId, packingOrder.priority);
            } catch (error) {
                this.packingLogger.logError(
                    'Failed to enqueue pending packing order',
                    error,
                    { orderId, packingOrderId: packingOrder._id.toString() },
                );
            }
        }
    }
}
