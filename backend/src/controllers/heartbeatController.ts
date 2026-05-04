import { drones, orders } from "../db/db.js";
import type { IDronePosition } from "../models/dronePositionModel.js";
import type { DroneStatus } from "../models/droneModel.js";

export const updateDroneFromHeartbeat = (
    droneId: number,
    batteryLevel: number,
    dronePosition: IDronePosition,
    state: DroneStatus,
    orderId?: number
) => {
    if (!validateHeartbeatData(droneId, batteryLevel, dronePosition)) return null;

    if (droneId === 4) return;

    console.log(droneId);

    let drone = drones.find(d => d.droneId === droneId);
    if(!drone) return null;
    if (!drone) {
        drone =
        {
            droneId,
            batteryLevel,
            position: dronePosition,
            status: state,
            name: `Drone ${droneId}`,
            manufacturer: "DJI",
            model: "Mavic 4 Pro",
            maxCapacity: { weight: 25, length: 200, width: 200, height: 200 },

        }
        drones.push(drone);
        console.log("added drone");

    };

    // console.log(drone);


    drone.batteryLevel = batteryLevel;
    drone.position = dronePosition;
    drone.status = state;
    drone.orderId = orderId ?? null;


    if (state === "charging" || state === "waiting_for_job" || state === "on_the_way_back") {
        drone.orderId = null;
    }


    if (state === "drop_off" && drone.orderId) {
        const order = orders.find(o => o.id === drone.orderId);
        if (order) {
            order.status = "Delivered";
            order.history.push({
                createdAt: new Date(dronePosition.timestamp),
                status: "Delivered",
                location: { latitude: dronePosition.latitude, longitude: dronePosition.longitude, description: order.target.description },
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
                status: "In Transit",
                location: { latitude: dronePosition.latitude, longitude: dronePosition.longitude, description: "In transit" },
                type: "drone",
                message: `Drone ${drone.name} is in-flight with the order`
            });
        }
    }
    return drone;
};

const validateHeartbeatData = (droneId: number, batteryLevel: number, dronePosition: IDronePosition) => {
    if (!droneId || batteryLevel < 0 || batteryLevel > 100) return false;
    if (typeof dronePosition.latitude !== "number" || typeof dronePosition.longitude !== "number" || typeof dronePosition.altitude !== "number") return false;
    return true;
};
