import { drones } from "../db/db.js";
import type { IDrone } from "../models/droneModel.js";

const DRONE_SPEED_KMH = 50; // Assume 50 km/h


// function to calculate distance between two coordinates using Haversine formula

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the closest drone to the target location
function findClosestDrone(targetLat: number, targetLng: number): IDrone | null {
  if (drones.length === 0) return null;
  let closestDrone = drones[0]!;
  let minDistance = haversineDistance(closestDrone.position.latitude, closestDrone.position.longitude, targetLat, targetLng);

  for (const drone of drones) {
    const distance = haversineDistance(drone.position.latitude, drone.position.longitude, targetLat, targetLng);
    if (distance < minDistance) {
      minDistance = distance;
      closestDrone = drone;
    }
  }

  return closestDrone;
}
// Main function to calculate delivery time
export const calculateDeliveryTime = (targetLat: number, targetLng: number): number => {
  const closestDrone = findClosestDrone(targetLat, targetLng);
  if (!closestDrone) return 0; // No drones available
  const distance = haversineDistance(closestDrone.position.latitude, closestDrone.position.longitude, targetLat, targetLng);
  const timeHours = distance / DRONE_SPEED_KMH;
  return Math.ceil(timeHours * 60); // Return in minutes, rounded up
};