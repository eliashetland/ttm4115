import type { IDronePosition } from "../models/dronePositionModel.js";

const dronePositions: { [key: number]: IDronePosition } = {
    1: {
        droneId: 1,
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 100,
        timestamp: new Date().toISOString()
    },
    2: {
        droneId: 2,
        latitude: 34.0522,
        longitude: -118.2437,
        altitude: 150,
        timestamp: new Date().toISOString()
    },
    3: {
        droneId: 3,
        latitude: 40.7128,
        longitude: -74.0060,
        altitude: 200,
        timestamp: new Date().toISOString()
    }
};

export const getDronePositionById = (droneId: number) => {
    return dronePositions[droneId] || null;
}