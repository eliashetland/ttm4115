import type { IDronePosition } from "./IDronePosition";

export interface IDrone {
    droneId: number;
    name: string;
    model: string;
    manufacturer: string;
    position: IDronePosition;
    batteryLevel: number;
    maxCapacity: IDroneCapacity;
    status: DroneStatus;
}

export interface IDroneInsert extends Omit<IDrone, "droneId"> { }

export type DroneStatus = "idle" | "in-flight" | "charging";
export interface IDroneCapacity {
    length: number;
    width: number;
    height: number;
    weight: number;
}