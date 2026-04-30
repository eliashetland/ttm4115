import { drones } from "../db/db.js"
import type { IDrone, IDroneInsert } from "../models/droneModel.js";


export const getDrone = () => {
    return drones.sort((a, b) => a.batteryLevel - b.batteryLevel);
};

export const getDroneById = (droneId: number) => {
    const drone = drones.find(drone => drone.droneId === droneId);
    return drone;
};

// droneData can contain droneId if the type IDrone is used. This overwrites the newly given droneId
// Fix implemented at the moment is setting the droneId after the droneData sets the Id
export const createDrone = (droneData: IDroneInsert) => {
    const newDrone: IDrone = {
        droneId: drones.length + 1,
        batteryLevel: droneData.batteryLevel ?? 100,
        status: droneData.status ?? "idle",
        ...droneData
    }
    newDrone.droneId = drones.length + 1;
    drones.push(newDrone);
    return newDrone;
};

export const updateDroneBatteryLevel = (droneId: number, batteryLevel: number) => {
    const drone = drones.find(drone => drone.droneId === droneId);
    if (!drone) {
        return null;
    }

    drone.batteryLevel = batteryLevel;
    return drone;
};
