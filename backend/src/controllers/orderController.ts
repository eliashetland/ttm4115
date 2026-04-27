import { orders } from "../db/db.js";
import type { IOrder, IOrderHistory, IOrderInsert, IOrderLocation } from "../models/orderModel.js";
import { deliveryQueueService } from "../services/deliveryQueueService.js";
import { calculateDeliveryTime } from "../services/deliveryTimeService.js";


export const createOrder = (order: IOrderInsert) => {

    validateOrderData(order);

    const deliveryTime = calculateDeliveryTime(order.target.latitude, order.target.longitude);

    const newOrder: IOrder = {
        id: orders.length > 0 ? orders[orders.length - 1]!.id + 1 : 1, //TODO: Assumes orders never deleted, so should be fixed

        history: [
            {
                createdAt: new Date(),
                status: "Created",
                location: {
                    latitude: 63.415808,
                    longitude: 10.406744,
                    description: "Warehouse"
                },
                type: "status",
                message: "Order created and ready for processing"
            },
        ],

        ...order,
        deliveryTime
    };

    orders.push(newOrder);
    console.log(orders);
    
    // Add to delivery queue for processing
    deliveryQueueService.addToQueue(newOrder);
    
    return newOrder;
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