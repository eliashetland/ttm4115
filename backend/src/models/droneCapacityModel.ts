// Static, hardware-defined capacity limits for a drone.
export interface IDroneCapacity {
    maxWeightKg: number;     // max payload weight
    maxVolumeCm3: number;    // max compartment volume
}

// Mutable state: what the drone is currently carrying.
export interface IDroneLoad {
    currentWeightKg: number;
    currentOrderIds: number[];
}
