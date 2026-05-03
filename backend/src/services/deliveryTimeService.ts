import { WAREHOUSE_COORDS, DRONE_SPEED_KMH } from "../constants.js";

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const timeBetweenPoints = (lat1: number, lon1: number, lat2: number, lon2: number): number =>
    Math.ceil(haversineDistance(lat1, lon1, lat2, lon2) / DRONE_SPEED_KMH * 60);

export const timeFromWarehouse = (targetLat: number, targetLng: number): number =>
    Math.ceil(haversineDistance(WAREHOUSE_COORDS.latitude, WAREHOUSE_COORDS.longitude, targetLat, targetLng) / DRONE_SPEED_KMH * 60);

export const calculateDeliveryTime = timeFromWarehouse;
