import { drones, orders } from "../db/db.js";
import type { IDronePosition } from "../models/dronePositionModel.js";




export const updateDroneFromHeartbeat = (
    droneId: number,
    batteryLevel: number,
    dronePosition: IDronePosition,
    deliveryStatus: string
) => {

    if (!validateHeartbeatData(droneId, batteryLevel, dronePosition)) {
        return null;
    }

    const drone = drones.find(drone => drone.droneId === droneId);
    if (!drone) {
        return null;
    }

    if (drone.orderId) {
        const order = orders.find(order => order.id === drone.orderId);
        if (order) {
            order.history.push({
                createdAt: new Date(dronePosition.timestamp),
                status: deliveryStatus,
                location: {
                    latitude: dronePosition.latitude,
                    longitude: dronePosition.longitude,
                    description: "In transit"
                },
                type: "drone",
                message: `Drone ${drone.name} status: ${deliveryStatus}`
            });
        }
    }

    drone.batteryLevel = batteryLevel;
    drone.position = dronePosition;
    drone.deliveryStatus = deliveryStatus;

    return drone;
};


const validateHeartbeatData = (droneId: number, batteryLevel: number, dronePosition: IDronePosition) => {
    if (!droneId || batteryLevel < 0 || batteryLevel > 100) {
        return false;
    }

    if (typeof dronePosition.latitude !== "number" || typeof dronePosition.longitude !== "number" || typeof dronePosition.altitude !== "number") {
        return false;
    }

    return true;
};
