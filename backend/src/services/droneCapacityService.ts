import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";

export const canDroneCarryOrder = (drone: IDrone, order: IOrder): boolean => {
    const availableWeight = drone.maxCapacity.maxWeight - drone.maxCapacity.currentLoad;
    if (order.weight > availableWeight) return false;

    // Sort both dimension arrays so we check best-fit orientation automatically
    const droneDims = [drone.maxCapacity.length, drone.maxCapacity.width, drone.maxCapacity.height]
        .sort((a, b) => a - b);
    const orderDims = [order.length, order.width, order.height]
        .sort((a, b) => a - b);

    return orderDims[0] <= droneDims[0] && orderDims[1] <= droneDims[1] && orderDims[2] <= droneDims[2];
};

export const assignOrderToDrone = (drone: IDrone, order: IOrder): void => {
    drone.maxCapacity.currentLoad += order.weight;
    drone.maxCapacity.currentOrders.push(order.id);
    drone.status = "in-flight";
    drone.orderId = order.id;
    drone.destination = order.target;
    drone.departureTime = Date.now();
};

export const releaseOrderFromDrone = (drone: IDrone, order: IOrder): void => {
    const orderIndex = drone.maxCapacity.currentOrders.indexOf(order.id);
    if (orderIndex !== -1) {
        drone.maxCapacity.currentLoad -= order.weight;
        drone.maxCapacity.currentOrders.splice(orderIndex, 1);
    }
    if (drone.maxCapacity.currentOrders.length === 0) {
        drone.status = "idle";
    }
};;