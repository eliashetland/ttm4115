import { drones, orders } from "../db/db.js";

const WAREHOUSE = { latitude: 63.415777440500655, longitude: 10.406715511683895, altitude: 100 };
const DRONE_SPEED_KMH = 50;
const STEP_INTERVAL_MS = 2000;                     // position update every 2 s
const CHARGE_INTERVAL_MS = 30 * 1000;              // charge tick every 30 s
const CHARGE_RATE_PCT = 1;                         // % added per charge tick
const BATTERY_DRAIN_INTERVAL_MS = 2 * 60 * 1000;  // 2 minutes real time
const BATTERY_DRAIN_PCT = 1;                       // % drained per interval (in-flight only)

const activeTimers   = new Map<number, NodeJS.Timeout>(); // in-flight / return timers
const chargingTimers = new Map<number, NodeJS.Timeout>(); // per-drone charge timers
const needsFullCharge = new Set<number>();                // drones that arrived < 50% and must reach 100% before dispatch

// ─── Haversine ────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (d: number) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function stepsForTrip(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const distKm    = haversineKm(lat1, lon1, lat2, lon2);
    const travelSec = (distKm / DRONE_SPEED_KMH) * 3600;
    return Math.max(5, Math.ceil(travelSec / (STEP_INTERVAL_MS / 1000)));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Start moving a drone to its assigned destination. Pulls it off the charger first. */
export const startDroneDelivery = (droneId: number): void => {
    const drone = drones.find(d => d.droneId === droneId);
    if (!drone?.destination || !drone.orderId) {
        console.error(`startDroneDelivery: drone ${droneId} missing destination/orderId`);
        return;
    }

    stopCharging(droneId);  // pull off charger if currently charging
    cancelTimer(droneId);

    const orderId  = drone.orderId;
    const destLat  = drone.destination.latitude;
    const destLon  = drone.destination.longitude;
    const startLat = drone.position.latitude;
    const startLon = drone.position.longitude;
    const steps    = stepsForTrip(startLat, startLon, destLat, destLon);

    console.log(`Drone ${droneId} → order ${orderId}  ${haversineKm(startLat, startLon, destLat, destLon).toFixed(2)} km  ${steps} steps`);

    // Single status entry marking the start of flight
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.history.push({
            createdAt: new Date(),
            status:    "In-Flight",
            type:      "status",
            location:  { latitude: startLat, longitude: startLon, description: "Departed warehouse" },
            message:   `Drone ${drone.name} departed for delivery`,
        });
    }

    let step = 0;
    const timer = setInterval(() => {
        step++;
        const d = drones.find(x => x.droneId === droneId);
        if (!d) { cancelTimer(droneId); return; }

        const t = Math.min(1, step / steps);
        d.position = {
            latitude:  startLat + (destLat - startLat) * t,
            longitude: startLon + (destLon - startLon) * t,
            altitude:  100,
            timestamp: new Date().toISOString(),
        };

        // Drone-type entries for map trail (not shown in status list)
        const o = orders.find(o => o.id === orderId);
        if (o) {
            o.history.push({
                createdAt: new Date(),
                status:    "In-Flight",
                type:      "drone",
                location:  { latitude: d.position.latitude, longitude: d.position.longitude, description: "In transit" },
                message:   `Drone ${d.name} en route`,
            });
        }

        if (t >= 1) {
            cancelTimer(droneId);
            completeDelivery(droneId, orderId);
        }
    }, STEP_INTERVAL_MS);

    activeTimers.set(droneId, timer);
};

export const isDroneMoving = (droneId: number): boolean => activeTimers.has(droneId);

/** True while a drone must charge to 100% before dispatch (arrived with < 50%). */
export const isDroneChargingToFull = (droneId: number): boolean => needsFullCharge.has(droneId);

/**
 * Ensure every warehouse drone is charging.
 * Covers both "idle" drones and "charging" drones whose timer was never started
 * (e.g. arrived at 100%, later drained slightly with no active timer).
 */
export const chargeIdleDronesAtWarehouse = (): void => {
    for (const drone of drones) {
        const atWarehouse = drone.status === "idle" || drone.status === "charging";
        if (atWarehouse && !chargingTimers.has(drone.droneId) && drone.batteryLevel < 100) {
            drone.status = "charging";
            startCharging(drone);
            console.log(`Drone ${drone.droneId} plugged in at ${drone.batteryLevel}%`);
        }
    }
};

/**
 * Called once on startup: charge any drone not already in-flight.
 */
export const resumeChargingDrones = (): void => {
    for (const drone of drones) {
        if (drone.status !== "in-flight" && !chargingTimers.has(drone.droneId)) {
            drone.status = "charging";
            console.log(`Drone ${drone.droneId} → charging on startup (${drone.batteryLevel}%)`);
            startCharging(drone);
        }
    }
};

/**
 * Global drain timer: -1% every 2 minutes for in-flight drones only.
 */
export const startBatteryDrainTimer = (): void => {
    setInterval(() => {
        for (const drone of drones) {
            if (drone.status !== "in-flight") continue;
            drone.batteryLevel = Math.max(0, parseFloat((drone.batteryLevel - BATTERY_DRAIN_PCT).toFixed(1)));
            console.log(`[drain] Drone ${drone.droneId} (in-flight) → ${drone.batteryLevel}%`);
        }
    }, BATTERY_DRAIN_INTERVAL_MS);
    console.log(`Battery drain timer started: -${BATTERY_DRAIN_PCT}% / ${BATTERY_DRAIN_INTERVAL_MS / 60000} min (in-flight only)`);
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function completeDelivery(droneId: number, orderId: number): void {
    const drone = drones.find(d => d.droneId === droneId);
    if (!drone) return;

    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.history.push({
            createdAt: new Date(),
            status:    "Order delivered",
            type:      "status",
            location:  { latitude: drone.position.latitude, longitude: drone.position.longitude, description: "Delivery complete" },
            message:   `Order delivered by drone ${drone.name}`,
        });
    }

    delete drone.orderId;
    delete drone.destination;
    delete drone.departureTime;
    drone.maxCapacity.currentOrders = drone.maxCapacity.currentOrders.filter(id => id !== orderId);
    drone.maxCapacity.currentLoad   = Math.max(0, drone.maxCapacity.currentLoad - (order?.weight ?? 0));
    drone.status = "returning";

    console.log(`Drone ${droneId} delivered order ${orderId}. Returning to base…`);
    returnToBase(droneId);
}

function returnToBase(droneId: number): void {
    const drone = drones.find(d => d.droneId === droneId);
    if (!drone) return;

    const fromLat = drone.position.latitude;
    const fromLon = drone.position.longitude;
    const steps   = stepsForTrip(fromLat, fromLon, WAREHOUSE.latitude, WAREHOUSE.longitude);
    let step = 0;

    const timer = setInterval(() => {
        step++;
        const d = drones.find(x => x.droneId === droneId);
        if (!d) { cancelTimer(droneId); return; }

        const t = Math.min(1, step / steps);
        d.position = {
            latitude:  fromLat + (WAREHOUSE.latitude  - fromLat) * t,
            longitude: fromLon + (WAREHOUSE.longitude - fromLon) * t,
            altitude:  100,
            timestamp: new Date().toISOString(),
        };

        if (t >= 1) {
            cancelTimer(droneId);
            d.position = { ...WAREHOUSE, timestamp: new Date().toISOString() };
            d.status = "charging";
            console.log(`Drone ${droneId} back at base (${d.batteryLevel}%). Charging…`);
            startCharging(d);
        }
    }, STEP_INTERVAL_MS);

    activeTimers.set(droneId, timer);
}

/**
 * Plugs a drone in at the warehouse. Always charges to 100% at 1%/30 s.
 * If the drone arrived with < 50%, it is also added to needsFullCharge so
 * the queue won't dispatch it until it reaches 100%.
 */
function startCharging(drone: any): void {
    if (chargingTimers.has(drone.droneId)) return;

    drone.status = "charging";

    if (drone.batteryLevel < 50) {
        needsFullCharge.add(drone.droneId);
        console.log(`Drone ${drone.droneId} at ${drone.batteryLevel}% — must charge to 100% before next order`);
    } else {
        console.log(`Drone ${drone.droneId} at ${drone.batteryLevel}% — charging, available for dispatch`);
    }

    if (drone.batteryLevel >= 100) {
        // Already full — nothing to increment
        return;
    }

    const interval = setInterval(async () => {
        drone.batteryLevel = Math.min(100, parseFloat((drone.batteryLevel + CHARGE_RATE_PCT).toFixed(1)));
        console.log(`[charge] Drone ${drone.droneId} → ${drone.batteryLevel}%`);
        if (drone.batteryLevel >= 100) {
            clearInterval(interval);
            chargingTimers.delete(drone.droneId);
            needsFullCharge.delete(drone.droneId);
            drone.status = "charging";
            console.log(`Drone ${drone.droneId} fully charged — standing by`);
            const { deliveryQueueService } = await import("./deliveryQueueService.js");
            deliveryQueueService.processQueue();
        }
    }, CHARGE_INTERVAL_MS);

    chargingTimers.set(drone.droneId, interval);
}

function stopCharging(droneId: number): void {
    const t = chargingTimers.get(droneId);
    if (t) { clearInterval(t); chargingTimers.delete(droneId); }
    needsFullCharge.delete(droneId);
}

function cancelTimer(droneId: number): void {
    const t = activeTimers.get(droneId);
    if (t) { clearInterval(t); activeTimers.delete(droneId); }
}
