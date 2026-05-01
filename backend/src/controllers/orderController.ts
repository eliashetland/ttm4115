import { drones, orders, WAREHOUSE_LOCATION } from "../db/db.js";
import type { IOrder, IOrderHistory, IOrderInsert, IOrderLocation } from "../models/orderModel.js";
import { deliveryQueueService } from "../services/deliveryQueueService.js";
import { calculateDeliveryTime } from "../services/deliveryTimeService.js";
import {
    calculateMaxRangeKm,
    distanceFromWarehouseKm,
    isOrderDroneDeliverable,
} from "../services/droneCapacityService.js";

const CAR_AVERAGE_SPEED_KMH = 50;
// Surface a structured outcome alongside the new order so the API can show a notice
// (e.g. "Out of drone range — will be delivered by car") on the create-order screen.
export interface CreateOrderResult {
    order: IOrder;
    deliveryMethod: "drone" | "car";
    notice?: string | undefined;
}

export const createOrder = (order: IOrderInsert): CreateOrderResult => {

    validateOrderData(order);

    const deliveryTime = calculateDeliveryTime(order.target.latitude, order.target.longitude);
    const distanceKm = distanceFromWarehouseKm(order.target);

    // Best (longest-range) drone capable of carrying this weight at full battery —
    // used purely to explain the limit to the user when no drone fits.
    const bestRangeKm = drones.length
        ? Math.max(...drones.map((d) => calculateMaxRangeKm(d, order.weight, 100)))
        : 0;

    const droneDeliverable = isOrderDroneDeliverable(drones, { ...order } as IOrder);
    const deliveryMethod: "drone" | "car" = droneDeliverable ? "drone" : "car";

    let deliveryNotice: string | undefined;
    if (!droneDeliverable) {
        deliveryNotice =
            `Destination is ${distanceKm.toFixed(1)} km from the warehouse, ` +
            `but no drone can fulfill a ${order.weight} kg payload over that distance ` +
            `(longest reach: ${bestRangeKm.toFixed(1)} km). ` +
            `Order will be delivered by car instead.`;
    }

    // For car deliveries, override the upfront drone-time estimate with a road-time estimate.
    const carDeliveryTime = Math.ceil((distanceKm / CAR_AVERAGE_SPEED_KMH) * 60);
    const finalDeliveryTime = droneDeliverable ? deliveryTime : carDeliveryTime;

    const newOrder: IOrder = {
        id: orders.length > 0 ? orders[orders.length - 1]!.id + 1 : 1, //TODO: Assumes orders never deleted, so should be fixed

        history: [
            {
                createdAt: new Date(),
                status: "Created",
                location: {
                    latitude: WAREHOUSE_LOCATION.latitude,
                    longitude: WAREHOUSE_LOCATION.longitude,
                    description: WAREHOUSE_LOCATION.description,
                },
                type: "status",
                message: droneDeliverable
                    ? "Order created and ready for processing"
                    : `Order created — ${deliveryNotice}`,
            },
        ],

        ...order,
        deliveryTime: finalDeliveryTime,
        deliveryMethod,
        deliveryNotice,
    };

    orders.push(newOrder);
    console.log(orders);

    if (droneDeliverable) {
        // Add to delivery queue for processing
        deliveryQueueService.addToQueue(newOrder);
    } else {
        console.warn(
            `Order ${newOrder.id} dispatched to car: ${deliveryNotice}`,
        );
    }

    return {
        order: newOrder,
        deliveryMethod,
        notice: deliveryNotice,
    };
};



export const getAllOrders = () => {
    return orders;
};

export const getOrderById = (orderId: number) => {
    const order = orders.find(order => order.id === orderId);
    return order || null;
}

export const updateOrderStatus = (orderId: number, status: string, location: IOrderLocation, message: string) => {
    const order = orders.find(order => order.id === orderId);

    validateUpdateOrderStatusData(status, location, message);

    if (!order) {
        throw new Error("Order not found");
    }
    const newHistoryEntry: IOrderHistory = {
        createdAt: new Date(),
        status,
        location,
        message,
        type: "status"
    };
    order.history.unshift(newHistoryEntry);
    return order;
}


const validateUpdateOrderStatusData = (status: string, location: IOrderLocation, message: string) => {
    if (!status || !location || !message) {
        throw new Error("Status, location, and message are required");
    }
    if (location.description.trim() === "" || message.trim() === "" || status.trim() === "") {
        throw new Error("Location, message, and status cannot be empty");
    }
    if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
        throw new Error("Invalid location coordinates");
    }
};


const validateOrderData = (order: IOrderInsert) => {
    if (!order.firstName || !order.lastName || !order.address || !order.zip || !order.city || !order.length || !order.width || !order.height) {
        throw new Error("Missing required order data");
    }

    if (typeof order.length !== "number" || typeof order.width !== "number" || typeof order.height !== "number") {
        throw new Error("Invalid order dimensions");
    }

    if (order.length <= 0 || order.width <= 0 || order.height <= 0) {
        throw new Error("Order dimensions must be greater than zero");
    }
    if (typeof order.weight !== "number" || order.weight <= 0) {
        throw new Error("Invalid order weight");
    }

    if (!order.sender) {
        throw new Error("Missing sender information");

    }
};
