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
}

export interface IDroneInsert extends Omit<IDrone, "droneId" | "batteryLevel"> {
    batteryLevel?: number;
}
