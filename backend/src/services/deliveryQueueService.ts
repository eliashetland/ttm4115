import type { IOrder } from "../models/orderModel.js";


export interface IQueuedDelivery {
    id: string;
    order: IOrder;
    queuedAt: Date;
    priority: number; // Higher number = higher priority
    status: 'queued' | 'processing' | 'completed' | 'failed';
    assignedDroneId?: number;
}

class DeliveryQueueService {
    private queue: IQueuedDelivery[] = [];
    private processingInterval: NodeJS.Timeout | null = null;
    private isProcessing = false;

    constructor() {
        this.startProcessing();
    }

    addToQueue(order: IOrder, priority: number = 1): IQueuedDelivery {
        const queuedDelivery: IQueuedDelivery = {
            id: `queue_${Date.now()}_${order.id}`,
            order,
            queuedAt: new Date(),
            priority,
            status: 'queued'
        };

        const insertIndex = this.queue.findIndex(item => item.priority < priority);
        if (insertIndex === -1) {
            this.queue.push(queuedDelivery);
        } else {
            this.queue.splice(insertIndex, 0, queuedDelivery);
        }

        order.history.push({
            createdAt: new Date(),
            status: "Order in queue",
            type: "status",
            location: order.history[0]?.location ?? { latitude: 63.415777440500655, longitude: 10.406715511683895, description: "Warehouse" },
            message: "Order is waiting in the delivery queue"
        });

        console.log(`Order ${order.id} added to delivery queue. Queue size: ${this.queue.length}`);
        this.processQueue();
        return queuedDelivery;
    }

    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            queuedItems: this.queue.filter(item => item.status === 'queued').map(item => ({
                id: item.id,
                orderId: item.order.id,
                queuedAt: item.queuedAt,
                priority: item.priority
            })),
            processingItems: this.queue.filter(item => item.status === 'processing')
        };
    }

    removeFromQueue(queueId: string): boolean {
        const index = this.queue.findIndex(item => item.id === queueId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            return true;
        }
        return false;
    }

    public async processQueue() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        try {
            const queuedItems = this.queue.filter(item => item.status === 'queued');

            for (const queuedItem of queuedItems) {
                const availableDrone = await this.findAvailableDroneForOrder(queuedItem.order);
                if (availableDrone) {
                    queuedItem.status = 'processing';
                    queuedItem.assignedDroneId = availableDrone.droneId;
                    console.log(`Assigning order ${queuedItem.order.id} to drone ${availableDrone.droneId}`);
                    await this.startDelivery(queuedItem, availableDrone);
                    this.removeFromQueue(queuedItem.id);
                }
            }

            const pendingOrders = this.queue.filter(item => item.status === 'queued').length;
            if (pendingOrders === 0) {
                const { chargeIdleDronesAtWarehouse } = await import("../services/droneMovementService.js");
                chargeIdleDronesAtWarehouse();
            }
        } catch (error) {
            console.error('Error processing delivery queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    private async findAvailableDroneForOrder(order: IOrder) {
        const { getDrone } = await import("../controllers/droneController.js");
        const { canDroneCarryOrder } = await import("../services/droneCapacityService.js");
        const { isDroneChargingToFull } = await import("../services/droneMovementService.js");

        const drones = getDrone();

        const availableDrones = drones.filter(drone =>
            drone.batteryLevel > 20 &&
            (drone.status === 'idle' || drone.status === 'charging') &&
            !isDroneChargingToFull(drone.droneId) &&
            canDroneCarryOrder(drone, order)
        );

        return availableDrones[0] || null;
    }

    private async startDelivery(queuedDelivery: IQueuedDelivery, drone: any) {
        const { updateOrderStatus } = await import("../controllers/orderController.js");
        const { assignOrderToDrone } = await import("../services/droneCapacityService.js");

        assignOrderToDrone(drone, queuedDelivery.order);

        updateOrderStatus(
            queuedDelivery.order.id,
            "Drone assigned",
            {
                latitude: drone.position.latitude,
                longitude: drone.position.longitude,
                description: `Assigned to drone ${drone.name}`
            },
            `Order assigned to drone ${drone.name}`
        );

        const { startDroneDelivery } = await import("./droneMovementService.js");
        startDroneDelivery(drone.droneId);
    }

    startProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }
        this.processingInterval = setInterval(() => {
            this.processQueue();
        }, 30000);
    }

    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }
}

export const deliveryQueueService = new DeliveryQueueService();
