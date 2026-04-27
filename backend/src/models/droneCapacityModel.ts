export interface IDroneCapacity {
    maxWeight: number;      // kg
    maxVolume: number;      // cubic centimeters
    currentLoad: number;    // kg
    currentOrders: number[];

    weight: number;         // kg
    length: number;         // cm
    width: number;          // cm
    height: number;         // cm
}