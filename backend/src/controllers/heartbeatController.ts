import { drones, orders } from "../db/db.js";
import type { IDronePosition } from "../models/dronePositionModel.js";
import type { DroneStatus } from "../models/droneModel.js";

function mapDroneState(state: string): DroneStatus {
    switch (state) {
        case "delivering":
        case "drop_of":
        case "returning":
            return "in-flight";
        case "charging":
            return "charging";
        default:
            return "idle";
    }
}

export const updateDroneFromHeartbeat = (droneId: number, batteryLevel: number, dronePosition: IDronePosition, state: string) => {

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
                status: "In-Flight",
                location: {
                    latitude: dronePosition.latitude,
                    longitude: dronePosition.longitude,
                    description: "In transit"
                },
                type: "drone",
                message: `Drone ${drone.name} is in-flight with the order`
            });
        }
    }

    drone.batteryLevel = batteryLevel;
    drone.position = dronePosition;
    drone.status = mapDroneState(state);
    

    return drone;


}

const validateHeartbeatData = (droneId: number, batteryLevel: number, dronePosition: IDronePosition) => {
    if (!droneId || batteryLevel < 0 || batteryLevel > 100) {
        return false;
    }

    if (typeof dronePosition.latitude !== "number" || typeof dronePosition.longitude !== "number" || typeof dronePosition.altitude !== "number") {
        return false;
    }

    return true;
};
