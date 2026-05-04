import { drones, orders } from "../db/db.js";
import type { IDronePosition } from "../models/dronePositionModel.js";
import type { DroneStatus } from "../models/droneModel.js";
import { isDroneMoving } from "../services/droneMovementService.js";

function mapDroneState(state: string): DroneStatus {
    switch (state) {
        case "delivering":
        case "on_the_way":
        case "order_received":
        case "drop_of":
        case "drop_off":
            return "in-flight";
        case "returning":
        case "on_the_way_back":
            return "returning";
        case "charging":
            return "charging";
        default:                    // "idle", "waiting_for_job", etc.
            return "idle";
    }
}

export const updateDroneFromHeartbeat = (
    droneId: number,
    batteryLevel: number,
    dronePosition: IDronePosition,
    state: string
) => {
    if (!validateHeartbeatData(droneId, batteryLevel, dronePosition)) return null;

    const drone = drones.find(d => d.droneId === droneId);
    if (!drone) return null;

    if ((state === "drop_of" || state === "drop_off") && drone.orderId) {
        const order = orders.find(o => o.id === drone.orderId);
        if (order) {
            order.history.push({
                createdAt: new Date(dronePosition.timestamp),
                status: "Order delivered",
                location: {
                    latitude: dronePosition.latitude,
                    longitude: dronePosition.longitude,
                    description: order.target.description
                },
                type: "status",
                message: `Package delivered by drone ${drone.name}`
            });
        }
        delete drone.orderId;
        delete drone.destination;
        delete drone.departureTime;
    } else if (drone.orderId) {
        const order = orders.find(o => o.id === drone.orderId);
        if (order) {
            order.history.push({
                createdAt: new Date(dronePosition.timestamp),
                status: "In-Flight",
                location: {
                    latitude: dronePosition.latitude,
                    longitude: dronePosition.longitude,
                    description: "In transit"
                },
                type: "drone",
                message: `Drone ${drone.name} is en route`
            });
        }
    }

    // Don't override position/battery/status while the simulation is managing this drone
    if (!isDroneMoving(droneId)) {
        drone.batteryLevel = batteryLevel;
        drone.position = dronePosition;
        drone.status = mapDroneState(state);
    }

    return drone;
};

const validateHeartbeatData = (droneId: number, batteryLevel: number, dronePosition: IDronePosition) => {
    if (!droneId || batteryLevel < 0 || batteryLevel > 100) return false;
    if (typeof dronePosition.latitude !== "number" || typeof dronePosition.longitude !== "number" || typeof dronePosition.altitude !== "number") return false;
    return true;
};
