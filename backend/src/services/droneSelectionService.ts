import { getMqttClient } from "../controllers/mqttController.js";
import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";

export const canDroneCarryOrder = (drone: IDrone, order: IOrder): boolean => {
    if (order.weight > drone.maxCapacity.weight) return false;
    const orderDims = [order.length, order.width, order.height].sort((a, b) => a - b);
    const droneDims = [drone.maxCapacity.length, drone.maxCapacity.width, drone.maxCapacity.height].sort((a, b) => a - b);
    return orderDims.every((dim, i) => dim <= droneDims[i]!);
};

export const selectBestDrone = (drones: IDrone[], order: IOrder): IDrone | null => {
    const candidates = drones.filter(drone =>
        (drone.status === "waiting_for_job") &&
        !drone.orderId &&
        drone.batteryLevel > 50 &&
        canDroneCarryOrder(drone, order)
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, drone) => drone.batteryLevel > best.batteryLevel ? drone : best);
};

export const assignOrderToDrone = (drone: IDrone, order: IOrder): void => {
    const client = getMqttClient();

    client.publish(`09/give_job/${drone.droneId}`, JSON.stringify({ order_id: order.id, target: order.target }));

    console.log("assign order "+ order.id + " to " + drone.droneId);
    
    drone.orderId = order.id;
    drone.status = "order_received";
    drone.destination = order.target;
    drone.departureTime = Date.now();

};
