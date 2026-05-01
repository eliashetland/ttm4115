const DRONE_SPEED_KMH = 50;
const WAREHOUSE_LAT = 63.415777440500655;
const WAREHOUSE_LON = 10.406715511683895;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const calculateDeliveryTime = (targetLat: number, targetLon: number): number => {
  const distanceKm = haversineDistance(WAREHOUSE_LAT, WAREHOUSE_LON, targetLat, targetLon);
  return Math.ceil((distanceKm / DRONE_SPEED_KMH) * 60);
};
