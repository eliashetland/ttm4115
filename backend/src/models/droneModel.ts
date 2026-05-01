import type { IDronePosition } from "./dronePositionModel.js";
import type { IDroneCapacity, IDroneLoad } from "./droneCapacityModel.js";

export interface IDrone {
    droneId: number;
    name: string;
    model: string;
    manufacturer: string;
    batteryLevel: number;
    position: IDronePosition;
    capacity: IDroneCapacity;
    load: IDroneLoad;
    specs: IDroneSpecs;
    status: DroneStatus;
    orderId?: number;
}

export interface IDroneInsert
    extends Omit<IDrone, "droneId" | "batteryLevel" | "status" | "load"> {
    batteryLevel?: number;
    status?: DroneStatus;
    load?: IDroneLoad;
}

export type DroneStatus = "idle" | "in-flight" | "charging";

export interface IDroneSpecs {
    batteryCapacityWh: number;        // total battery energy capacity (Wh)
    cruiseSpeedKmh: number;           // cruise speed in km/h
    basePowerConsumptionW: number;    // power draw at cruise speed with no payload (W)
    payloadPowerCoefficient: number;  // additional power per kg of payload (W/kg)
}
