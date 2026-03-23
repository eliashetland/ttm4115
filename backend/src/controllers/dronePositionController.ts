import { drones } from "../db/db.js";
import type { IDronePositionInsert } from "../models/dronePositionModel.js";

export const getDronePositionById = (droneId: number) => {
    const position = drones.find(drone => drone.droneId === droneId)?.position;

    return position || null;
};

export const updateDronePosition = (droneId: number, position: IDronePositionInsert) => {
    const droneIndex = drones.findIndex(drone => drone.droneId === droneId);

    if (droneIndex === -1) {
        return null;
    }

    const updatedPosition = { ...position, timestamp: new Date().toISOString() };

    drones[droneIndex]!.position = updatedPosition;
    return updatedPosition;
};