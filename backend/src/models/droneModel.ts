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
    orderId?: number | null;
    destination?: IOrderLocation;
    departureTime?: number;
    timeLeft?: number;
}

export interface IDroneInsert extends Omit<IDrone, "droneId" | "batteryLevel" | "status"> {
    batteryLevel?: number;
    status?: DroneStatus;
}

export type DroneStatus = "drop_off" | "on_the_way_back" | "charging" | "waiting_for_job" | "order_received" | "on_the_way";