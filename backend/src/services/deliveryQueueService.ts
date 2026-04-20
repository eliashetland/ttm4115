import { IOrder } from "../models/orderModel.js";

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
        // Start processing the queue every 30 seconds
        this.startProcessing();
    }

    // Add an order to the queue
    addToQueue(order: IOrder, priority: number = 1): IQueuedDelivery {
        const queuedDelivery: IQueuedDelivery = {
            id: `queue_${Date.now()}_${order.id}`,
            order,
            queuedAt: new Date(),
            priority,
            status: 'queued'
        };

        // Insert in priority order (higher priority first)
        const insertIndex = this.queue.findIndex(item => item.priority < priority);
        if (insertIndex === -1) {
            this.queue.push(queuedDelivery);
        } else {
            this.queue.splice(insertIndex, 0, queuedDelivery);
        }

        console.log(`Order ${order.id} added to delivery queue. Queue size: ${this.queue.length}`);
        return queuedDelivery;
    }

    // Get current queue status
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

    // Remove from queue (e.g., when delivered or cancelled)
    removeFromQueue(queueId: string): boolean {
        const index = this.queue.findIndex(item => item.id === queueId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            return true;
        }
        return false;
    }

    // Process the queue (check for available drones and assign deliveries)
    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            // Get queued items that are ready for processing
            const queuedItems = this.queue.filter(item => item.status === 'queued');
            
            for (const queuedItem of queuedItems) {
                // Here you would check if a drone is available
                const availableDrone = await this.findAvailableDroneForOrder(queuedItem.order);
                
                if (availableDrone) {
                    // Assign drone to delivery
                    queuedItem.status = 'processing';
                    queuedItem.assignedDroneId = availableDrone.droneId;
                    
                    console.log(`Assigning order ${queuedItem.order.id} to drone ${availableDrone.droneId}`);
                    
                    // Trigger the delivery process
                    await this.startDelivery(queuedItem, availableDrone);
                    
                    // Remove from queue after successful assignment
                    this.removeFromQueue(queuedItem.id);
                }
            }
        } catch (error) {
            console.error('Error processing delivery queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    // Find an available drone for the order
    private async findAvailableDroneForOrder(order: IOrder) {
        // Import dynamically to avoid circular dependencies
        const { getDrone } = await import("../controllers/droneController.js");
        const { canDroneCarryOrder } = await import("../services/droneCapacityService.js");
        
        const drones = getDrone();
        
        // Find a drone that:
        // 1. Has enough battery (e.g., > 20%)
        // 2. Has enough capacity for the order
        // 3. Is not already assigned to a critical task (you might need to track drone availability)
        
        const availableDrones = drones.filter(drone => 
            drone.batteryLevel > 20 && // Minimum battery threshold
            drone.status === 'idle' &&
            canDroneCarryOrder(drone, order)
        );
        
        // For now, just return the first available drone
        // You could implement more sophisticated selection (closest, most efficient, etc.)
        return availableDrones[0] || null;
    }

    // Start the actual delivery process
    private async startDelivery(queuedDelivery: IQueuedDelivery, drone: any) {
        // Here you would integrate with your existing delivery logic
        // This might involve updating order status, drone position, etc.
        
        const { updateOrderStatus } = await import("../controllers/orderController.js");
        const { assignOrderToDrone } = await import("../services/droneCapacityService.js");
        
        // Assign the order to the drone (update capacity and status)
        assignOrderToDrone(drone, queuedDelivery.order);
        
        // Update order status to indicate it's being processed
        updateOrderStatus(
            queuedDelivery.order.id,
            "Assigned to Drone",
            {
                latitude: drone.position.latitude,
                longitude: drone.position.longitude,
                description: `Assigned to drone ${drone.name}`
            },
            `Order assigned to drone ${drone.name} from queue`
        );
        
        // Trigger the actual delivery process (you might have a separate service for this)
        // This could call your existing delivery logic or trigger a WebSocket event
    }

    // Start the queue processor
    startProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }
        
        this.processingInterval = setInterval(() => {
            this.processQueue();
        }, 30000); // Process every 30 seconds
    }

    // Stop the queue processor (useful for testing/cleanup)
    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }
}

// Export a singleton instance
export const deliveryQueueService = new DeliveryQueueService();