import type { IDronePosition } from "./dronePositionModel.js";
import type { IDroneCapacity } from "./droneCapacityModel.js";
import type { IOrderLocation } from "./orderModel.js";

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
    destination?: IOrderLocation;
    departureTime?: number;
    timeLeft?: number;
    mqttPrefix?: string;   // set for real Pi drones, e.g. "09"
}

export interface IDroneInsert extends Omit<IDrone, "droneId" | "batteryLevel" | "status"> {
    batteryLevel?: number;
    status?: DroneStatus;
}

export type DroneStatus = "idle" | "in-flight" | "returning" | "charging";
