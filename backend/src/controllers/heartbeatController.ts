import { drones, orders } from "../db/db.js";
import type { IDronePosition } from "../models/dronePositionModel.js";
import { deliveryQueueService } from "../services/deliveryQueueService.js";
import { isDroneMoving } from "../services/droneMovementService.js";

const WAREHOUSE_COORDS = {
    latitude: 63.415777440500655,
    longitude: 10.406715511683895,
    altitude: 100,
    timestamp: new Date().toISOString(),
};

export const updateDroneFromHeartbeat = (
    droneId: number,
    batteryLevel: number,
    dronePosition: IDronePosition,
    status?: string
) => {
    if (!validateHeartbeatData(droneId, batteryLevel, dronePosition)) {
        return null;
    }

    const drone = drones.find(drone => drone.droneId === droneId);
    if (!drone) {
        return null;
    }

    if (status === "delivered") {
        handleDeliveryComplete(drone, dronePosition);
    } else if (status === "arrived_at_base") {
        handleArrivedAtBase(drone, dronePosition);
    } else if (drone.orderId) {
        const order = orders.find(order => order.id === drone.orderId);
        if (order) {
            order.history.push({
                createdAt: new Date(dronePosition.timestamp),
                status: "In-Flight",
                location: { latitude: dronePosition.latitude, longitude: dronePosition.longitude, description: "In transit" },
                type: "drone",
                message: `Drone ${drone.name} is in-flight with the order`
            });
        }
    }

    // Don't let MQTT override values the simulation is managing
    const simulating = isDroneMoving(droneId) || drone.status === "charging";
    if (!simulating) {
        drone.batteryLevel = batteryLevel;
        drone.position = dronePosition;
    }
    return drone;
};

const handleDeliveryComplete = (drone: any, dronePosition: IDronePosition) => {
    if (drone.orderId) {
        const order = orders.find(order => order.id === drone.orderId);
        if (order) {
            order.history.push({
                createdAt: new Date(dronePosition.timestamp),
                status: "Delivered",
                location: { latitude: dronePosition.latitude, longitude: dronePosition.longitude, description: "Delivery complete" },
                type: "status",
                message: `Order delivered by drone ${drone.name}`
            });
        }
    }
    releaseDrone(drone.droneId);
};

const handleArrivedAtBase = (drone: any, dronePosition: IDronePosition) => {
    drone.position = { ...WAREHOUSE_COORDS, timestamp: new Date().toISOString() };
    if (drone.batteryLevel < 50) {
        startCharging(drone);
        console.log(`Drone ${drone.droneId} arrived with low battery (${drone.batteryLevel}%). Charging...`);
    } else {
        releaseDrone(drone.droneId);
        console.log(`Drone ${drone.droneId} arrived with battery ${drone.batteryLevel}%. Released.`);
    }
};

export const releaseDrone = (droneId: number) => {
    const drone = drones.find(drone => drone.droneId === droneId);
    if (!drone) return null;
    delete drone.orderId;
    delete drone.destination;
    delete drone.departureTime;
    drone.status = "idle";
    drone.position = { ...WAREHOUSE_COORDS, timestamp: new Date().toISOString() };
    console.log(`Drone ${droneId} released and now idle at warehouse`);
    deliveryQueueService.processQueue();
    return drone;
};

export const startCharging = (drone: any) => {
    drone.status = "charging";
    const interval = setInterval(() => {
        drone.batteryLevel = Math.min(100, drone.batteryLevel + 10);
        if (drone.batteryLevel >= 100) {
            clearInterval(interval);
            drone.status = "idle";
            console.log(`Drone ${drone.droneId} fully charged.`);
            deliveryQueueService.processQueue();
        }
    }, 1000);
};

const validateHeartbeatData = (droneId: number, batteryLevel: number, dronePosition: IDronePosition) => {
    if (!droneId || batteryLevel < 0 || batteryLevel > 100) return false;
    if (typeof dronePosition.latitude !== "number" || typeof dronePosition.longitude !== "number" || typeof dronePosition.altitude !== "number") return false;
    return true;
};
