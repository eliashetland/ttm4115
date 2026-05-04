import { MOCK_ORDERS } from "../constants.js";
import { drones, orders } from "../db/db.js";
import type { IOrder, IOrderHistory, IOrderInsert, IOrderLocation } from "../models/orderModel.js";
import { deliveryQueueService } from "../services/deliveryQueueService.js";
import { timeFromWarehouse } from "../services/deliveryTimeService.js";

export const createOrder = (order: IOrderInsert) => {
    validateOrderData(order);

    const newOrder: IOrder = {
        id: orders.length > 0 ? orders[orders.length - 1]!.id + 1 : 1,
        status: "Created",
        history: [{
            createdAt: new Date(),
            status: "Created",
            location: { latitude: 63.415777440500655, longitude: 10.406715511683895, description: "Warehouse" },
            type: "status",
            message: "Order created and ready for processing"
        }],
        deliveryTime: timeFromWarehouse(order.target.latitude, order.target.longitude),
        ...order,
    };

    orders.push(newOrder);
    deliveryQueueService.addToQueue(newOrder);
    return newOrder;
};

export const createMockOrders = () => {
    for (const order of MOCK_ORDERS) {
        createOrder(order);
    }
};

export const getAllOrders = () => orders;

export const getOrderById = (orderId: number) => orders.find(o => o.id === orderId) ?? null;

export const updateOrderStatus = (orderId: number, status: string, location: IOrderLocation, message: string) => {
    validateUpdateOrderStatusData(status, location, message);
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");
    const entry: IOrderHistory = { createdAt: new Date(), status, location, message, type: "status" };
    order.history.push(entry);
    return order;
};

const validateUpdateOrderStatusData = (status: string, location: IOrderLocation, message: string) => {
    if (!status || !location || !message) throw new Error("Status, location, and message are required");
    if (location.description.trim() === "" || message.trim() === "" || status.trim() === "") throw new Error("Location, message, and status cannot be empty");
    if (typeof location.latitude !== "number" || typeof location.longitude !== "number") throw new Error("Invalid location coordinates");
};

const validateOrderData = (order: IOrderInsert) => {
    const maxWeight = Math.max(...drones.map(d => d.maxCapacity.weight));
    const maxDim = Math.max(...drones.map(d => Math.max(d.maxCapacity.length, d.maxCapacity.width, d.maxCapacity.height)));

    if (!order.sender?.trim()) throw new Error("Missing sender information");
    if (!order.firstName?.trim() || !order.lastName?.trim()) throw new Error("First and last name are required");
    if (!order.address?.trim() || !order.zip?.trim() || !order.city?.trim()) throw new Error("Address, zip, and city are required");
    if (!order.target || typeof order.target.latitude !== "number" || typeof order.target.longitude !== "number") throw new Error("Valid delivery coordinates are required");

    for (const dim of ["length", "width", "height"] as const) {
        const val = order[dim];
        if (typeof val !== "number" || isNaN(val) || val <= 0) throw new Error(`Invalid ${dim}: must be a positive number (cm)`);
        if (val > maxDim) throw new Error(`${dim} of ${val} cm exceeds the maximum of ${maxDim} cm`);
    }

    if (typeof order.weight !== "number" || isNaN(order.weight) || order.weight <= 0) throw new Error("Invalid weight: must be a positive number (kg)");
    if (order.weight > maxWeight) throw new Error(`Weight of ${order.weight} kg exceeds the maximum of ${maxWeight} kg`);
};
