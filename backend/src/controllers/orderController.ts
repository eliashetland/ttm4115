import { orders } from "../db/db.js";
import type { IOrder, IOrderInsert } from "../models/orderModel.js";


export const createOrder = (order: IOrderInsert) => {

    validateOrderData(order);

    const newOrder: IOrder = {
        id: orders.length > 0 ? orders[orders.length - 1]!.id + 1 : 1, //TODO: Assumes orders never deleted, so should be fixed
        ...order
    };

    orders.push(newOrder);
    return newOrder;
};



export const getAllOrders = () => {
    return orders;
};

export const getOrderById = (orderId: number) => {
    const order = orders.find(order => order.id === orderId);
    return order || null;
}


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
};