import { drones, orders } from "../db/db.js";
import type { IDrone, IDroneInsert } from "../models/droneModel.js";
import { timeBetweenPoints } from "../services/deliveryTimeService.js";

export const getDrone = () => {
    return drones.map(drone => {
        let timeLeft: number | undefined;
        if ((drone.status === "on_the_way") && drone.orderId) {
            const order = orders.find(o => o.id === drone.orderId);
            if (order) {
                timeLeft = timeBetweenPoints(
                    drone.position.latitude, drone.position.longitude,
                    order.target.latitude, order.target.longitude
                );
            }
        }
        return { ...drone, timeLeft };
    }).sort((a, b) => a.batteryLevel - b.batteryLevel);
};

export const getDroneById = (droneId: number) => {
    return drones.find(drone => drone.droneId === droneId);
};

export const createDrone = (droneData: IDroneInsert) => {
    const newDrone: IDrone = {
        ...droneData,
        droneId: drones.length + 1,
        name: `Drone ${drones.length + 1}`,
        batteryLevel: droneData.batteryLevel ?? 100,
        status: droneData.status ?? "waiting_for_job",
    };
    newDrone.droneId = drones.length + 1;
    drones.push(newDrone);
    return newDrone;
};

export const updateDroneBatteryLevel = (droneId: number, batteryLevel: number) => {
    const drone = drones.find(drone => drone.droneId === droneId);
    if (!drone) return null;
    drone.batteryLevel = batteryLevel;
    return drone;
};
