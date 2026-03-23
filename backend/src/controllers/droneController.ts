import { drones } from "../db/db.js"
import type { IDrone, IDroneInsert } from "../models/droneModel.js";


export const getDrone = () => {
    return drones;
};

export const getDroneById = (droneId: number) => {
    const drone = drones.find(drone => drone.droneId === droneId);
    return drone;
};

export const createDrone = (droneData: IDroneInsert) => {
    const newDrone: IDrone = {
        droneId: drones.length + 1,
        ...droneData
    }
    drones.push(newDrone);
    return newDrone;
};