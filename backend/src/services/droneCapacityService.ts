import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";

export const canDroneCarryOrder = (drone: IDrone, order: IOrder): boolean => {
    const orderVolume = order.length * order.width * order.height; // Assuming cm³
    const availableWeight = drone.maxCapacity.maxWeight - drone.maxCapacity.currentLoad;
    const availableVolume = drone.maxCapacity.maxVolume; // Assuming currentVolume not tracked, or add if needed

    return order.weight <= availableWeight && orderVolume <= availableVolume;
};

export const assignOrderToDrone = (drone: IDrone, order: IOrder): void => {
    drone.maxCapacity.currentLoad += order.weight;
    drone.maxCapacity.currentOrders.push(order.id);
    drone.status = "in-flight";
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