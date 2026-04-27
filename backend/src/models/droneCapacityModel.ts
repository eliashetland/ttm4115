export interface IDroneCapacity {
    maxWeight: number;      // kg
    maxVolume: number;      // cubic centimeters
    currentLoad: number;    // kg
    currentOrders: number[];
}