import { drones } from "../db/db.js";
import type { IOrder } from "../models/orderModel.js";
import { WAREHOUSE_COORDS } from "../constants.js";
import { selectBestDrone, assignOrderToDrone } from "./droneSelectionService.js";
// import { startDroneDelivery, isDroneChargingToFull } from "./droneMovementService.js";

const queue: IOrder[] = [];

const assignAndDispatch = (drone: any, order: IOrder): void => {
    assignOrderToDrone(drone, order);
    order.status = "In Transit";
    order.history.push({
        createdAt: new Date(),
        status: "In Transit",
        location: { latitude: WAREHOUSE_COORDS.latitude, longitude: WAREHOUSE_COORDS.longitude, description: "Departed warehouse" },
        type: "status",
        message: `Order assigned to ${drone.name}`
    });
    // startDroneDelivery(drone.droneId);
    // console.log(`Dispatched order ${order.id} to drone ${drone.name}`);
};

export const addToQueue = (order: IOrder): void => {
    if (order.status !== "Created") return;
    // const eligibleDrones = drones.filter(d => !isDroneChargingToFull(d.droneId));
    const availableDrones = drones.filter(d => (d.status === "waiting_for_job") && !d.orderId && d.batteryLevel > 50);
    const drone = selectBestDrone(availableDrones, order);
    if (drone) {
        assignAndDispatch(drone, order);
    } else {
        queue.push(order);
        console.log(`Queued order ${order.id}. Queue size: ${queue.length}`);
    }
};

export const tryAssignNext = (): void => {
    while (queue.length > 0) {
        const order = queue[0]!;
        if (order.status !== "Created") {
            queue.shift();
            continue;
        }
        const availableDrones = drones.filter(d => (d.status === "waiting_for_job") && !d.orderId && d.batteryLevel > 50);
        const drone = selectBestDrone(availableDrones, order);
        if (!drone) break;
        queue.shift();
        assignAndDispatch(drone, order);
        console.log(`Queue: assigned order ${order.id}. Remaining: ${queue.length}`);
    }
};

setInterval(tryAssignNext, 5000);

export const deliveryQueueService = { addToQueue, tryAssignNext };
