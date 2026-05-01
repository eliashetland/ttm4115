import { WAREHOUSE_LOCATION } from "../db/db.js";
import type { IDrone } from "../models/droneModel.js";
import type { IOrder } from "../models/orderModel.js";
import { haversineDistanceKm } from "./geoService.js";

// Reserve a fraction of the battery as safety margin (return-trip wind, hover, landing, etc.).
export const BATTERY_SAFETY_FACTOR = 0.85;

// Time (minutes) added to a flight estimate to account for loading, take-off, landing, drop-off.
const HANDLING_OVERHEAD_MIN = 4;

// ── Order helpers ────────────────────────────────────────────────────────────
// All physical inputs (weight + volume) come from the order itself, never from
// stale fields on the drone. The drone only contributes its capacity *limits*.

const orderVolumeCm3 = (order: Pick<IOrder, "length" | "width" | "height">): number =>
    order.length * order.width * order.height;

const orderWeightKg = (order: Pick<IOrder, "weight">): number => order.weight;

// ── Capacity check ───────────────────────────────────────────────────────────

export const canDroneCarryOrder = (drone: IDrone, order: IOrder): boolean => {
    const availableWeight = drone.capacity.maxWeightKg - drone.load.currentWeightKg;
    return (
        orderWeightKg(order) <= availableWeight &&
        orderVolumeCm3(order) <= drone.capacity.maxVolumeCm3
    );
};

// ── Energy / range model ─────────────────────────────────────────────────────
// Round-trip energy: drone flies `distanceKm` carrying `payloadKg`, then returns empty.
// energy = (distance / speed) * (basePower + coef * payload)   [outbound, loaded]
//        + (distance / speed) * basePower                       [return, empty]

export const energyForRoundTripWh = (
    drone: IDrone,
    distanceKm: number,
    payloadKg: number,
): number => {
    const { cruiseSpeedKmh, basePowerConsumptionW, payloadPowerCoefficient } = drone.specs;
    const hoursOneWay = distanceKm / cruiseSpeedKmh;
    const outboundPower = basePowerConsumptionW + payloadPowerCoefficient * payloadKg;
    const returnPower = basePowerConsumptionW;
    return hoursOneWay * (outboundPower + returnPower);
};

// Maximum one-way distance the drone can fly with `payloadKg` AND return safely
// at the given battery percentage (defaults to current battery level).
export const calculateMaxRangeKm = (
    drone: IDrone,
    payloadKg: number,
    batteryPercent: number = drone.batteryLevel,
): number => {
    const { specs } = drone;
    const usableEnergyWh =
        specs.batteryCapacityWh * (batteryPercent / 100) * BATTERY_SAFETY_FACTOR;
    const outboundPower = specs.basePowerConsumptionW + specs.payloadPowerCoefficient * payloadKg;
    const returnPower = specs.basePowerConsumptionW;
    const whPerKm = (outboundPower + returnPower) / specs.cruiseSpeedKmh;
    if (whPerKm <= 0) return 0;
    return usableEnergyWh / whPerKm;
};

// ── Distance / reachability ──────────────────────────────────────────────────

export const distanceFromWarehouseKm = (
    target: Pick<IOrder["target"], "latitude" | "longitude">,
): number =>
    haversineDistanceKm(
        WAREHOUSE_LOCATION.latitude,
        WAREHOUSE_LOCATION.longitude,
        target.latitude,
        target.longitude,
    );

// True if THIS specific drone (current battery, current load) can carry + reach + return.
export const canDroneFulfillOrder = (drone: IDrone, order: IOrder): boolean => {
    if (!canDroneCarryOrder(drone, order)) return false;
    const distance = distanceFromWarehouseKm(order.target);
    return calculateMaxRangeKm(drone, orderWeightKg(order)) >= distance;
};

// True if ANY drone in the fleet, evaluated at full battery and empty cargo, is
// theoretically capable of fulfilling the order. Used at order-creation time to
// decide drone-vs-car.
export const isOrderDroneDeliverable = (drones: IDrone[], order: IOrder): boolean => {
    const distance = distanceFromWarehouseKm(order.target);
    const weight = orderWeightKg(order);
    const volume = orderVolumeCm3(order);
    return drones.some(
        (d) =>
            weight <= d.capacity.maxWeightKg &&
            volume <= d.capacity.maxVolumeCm3 &&
            calculateMaxRangeKm(d, weight, 100) >= distance,
    );
};

// Longest possible reach across the fleet at full battery for the given payload —
// surfaced to the user in the "out of range" notice.
export const bestFleetRangeKm = (drones: IDrone[], payloadKg: number): number => {
    if (!drones.length) return 0;
    return Math.max(...drones.map((d) => calculateMaxRangeKm(d, payloadKg, 100)));
};

// ── Time estimate ────────────────────────────────────────────────────────────

// Estimated time (minutes) for `drone` to fly to the order target, drop off, and return.
export const estimateExecutionTimeMin = (drone: IDrone, order: IOrder): number => {
    const distance = distanceFromWarehouseKm(order.target);
    const flightHours = (2 * distance) / drone.specs.cruiseSpeedKmh;
    return Math.ceil(flightHours * 60 + HANDLING_OVERHEAD_MIN);
};

// ── Mutating helpers ─────────────────────────────────────────────────────────

export const assignOrderToDrone = (drone: IDrone, order: IOrder): void => {
    drone.load.currentWeightKg += orderWeightKg(order);
    drone.load.currentOrderIds.push(order.id);
    drone.status = "in-flight";
};

export const releaseOrderFromDrone = (drone: IDrone, order: IOrder): void => {
    const idx = drone.load.currentOrderIds.indexOf(order.id);
    if (idx !== -1) {
        drone.load.currentWeightKg -= orderWeightKg(order);
        drone.load.currentOrderIds.splice(idx, 1);
    }
    if (drone.load.currentOrderIds.length === 0) {
        drone.status = "idle";
    }
};
