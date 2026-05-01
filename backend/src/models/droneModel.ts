import type { IDronePosition } from "./dronePositionModel.js";
import type { IDroneCapacity } from "./droneCapacityModel.js";
export interface IDrone {
    droneId: number;
    name: string;
    model: string;
    manufacturer: string;
    batteryLevel: number;
    position: IDronePosition;
    maxCapacity: IDroneCapacity;
    status: DroneStatus;
    orderId?: number;
    timeLeft?: number; // in minutes
}

export interface IDroneInsert extends Omit<IDrone, "droneId" | "batteryLevel" | "status"> {
    batteryLevel?: number;
    status?: DroneStatus;
}

export type DroneStatus = "idle" | "in-flight" | "charging";