import type { IDronePosition } from "./IDronePosition";

export interface IDrone {
    droneId: number;
    name: string;
    model: string;
    manufacturer: string;
    position: IDronePosition;
    batteryLevel: number;
    capacity: IDroneCapacity;
    load: IDroneLoad;
    specs: IDroneSpecs;
    status: DroneStatus;
    orderId?: number;
}

export interface IDroneInsert extends Omit<IDrone, "droneId"> { }

export type DroneStatus = "idle" | "in-flight" | "charging";
export interface IDroneCapacity {
    maxWeightKg: number;
    maxVolumeCm3: number;
}

export interface IDroneLoad {
    currentWeightKg: number;
    currentOrderIds: number[];
}

export interface IDroneSpecs {
    batteryCapacityWh: number;
    cruiseSpeedKmh: number;
    basePowerConsumptionW: number;
    payloadPowerCoefficient: number;
}
