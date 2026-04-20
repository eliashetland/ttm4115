import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";

export const canDroneCarryOrder = (drone: IDrone, order: IOrder): boolean => {
    const orderVolume = order.length * order.width * order.height; // Assuming cm³
    const availableWeight = drone.capacity.maxWeight - drone.capacity.currentLoad;
    const availableVolume = drone.capacity.maxVolume; // Assuming currentVolume not tracked, or add if needed

    return order.weight <= availableWeight && orderVolume <= availableVolume;
};

export const assignOrderToDrone = (drone: IDrone, order: IOrder): void => {
    drone.capacity.currentLoad += order.weight;
    drone.capacity.currentOrders.push(order.id);
    drone.status = "busy";
};

export const releaseOrderFromDrone = (drone: IDrone, order: IOrder): void => {
    const orderIndex = drone.capacity.currentOrders.indexOf(order.id);
    if (orderIndex !== -1) {
        drone.capacity.currentLoad -= order.weight;
        drone.capacity.currentOrders.splice(orderIndex, 1);
    }
    if (drone.capacity.currentOrders.length === 0) {
        drone.status = "idle";
    }
};;