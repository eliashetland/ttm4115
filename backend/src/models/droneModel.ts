import type { IDronePosition } from "./dronePositionModel.js";

export interface IDrone {
    droneId: number;
    name: string;
    model: string;
    manufacturer: string;
    position: IDronePosition;
}

export interface IDroneInsert extends Omit<IDrone, "droneId"> { }