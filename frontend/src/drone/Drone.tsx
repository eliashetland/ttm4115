import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../api/ApiClient";
import type { IDrone } from "../api/models/IDrone";
import { useParams } from "react-router-dom";
import { DroneMap } from "../operator/DroneMap";
import type { IDronePosition } from "../api/models/IDronePosition";
import styles from "./Drone.module.css";

const BATTERY_SAFETY_FACTOR = 0.85;

const maxRangeKm = (drone: IDrone, payloadKg: number, batteryPercent: number) => {
  const usableEnergyWh = drone.specs.batteryCapacityWh * (batteryPercent / 100) * BATTERY_SAFETY_FACTOR;
  const outboundPower = drone.specs.basePowerConsumptionW + drone.specs.payloadPowerCoefficient * payloadKg;
  const returnPower = drone.specs.basePowerConsumptionW;
  const whPerKm = (outboundPower + returnPower) / drone.specs.cruiseSpeedKmh;
  if (whPerKm <= 0) return 0;
  return usableEnergyWh / whPerKm;
};

export const Drone = () => {
  const { droneId } = useParams();

  const { data: drone } = useQuery({
    queryKey: ["drone", droneId],
    queryFn: () => ApiClient.get<IDrone>(`/drone/${droneId}`),
  });

  const maxPayloadRange = drone ? maxRangeKm(drone, drone.capacity.maxWeightKg, 100) : 0;
  const currentBatteryRange = drone ? maxRangeKm(drone, drone.capacity.maxWeightKg, drone.batteryLevel) : 0;

  return (
    <div>
      <h1>Drone: {drone?.name}</h1>
      <div className={styles.container}>
        <section>
          <h2 className={styles.header}>Details</h2>
          <div className={styles.field}>
            <span>Model</span>
            <p>{drone?.model}</p>
          </div>

          <div className={styles.field}>
            <span>Manufacturer</span>
            <p>{drone?.manufacturer}</p>
          </div>

          <div className={styles.field}>
            <span>Battery Level</span>
            <p
              className={
                drone?.batteryLevel && drone.batteryLevel > 50
                  ? styles.green
                  : drone?.batteryLevel && drone.batteryLevel > 20
                    ? styles.orange
                    : styles.red
              }
            >
              {drone?.batteryLevel}%
            </p>
          </div>

          <div className={styles.field}>
            <span>Status</span>
            <p>{drone?.status}</p>
          </div>
        </section>

        <section>
          <h2 className={styles.header}>Specs</h2>

          <div className={styles.field}>
            <span>Battery capacity</span>
            <p>{drone?.specs.batteryCapacityWh} Wh</p>
          </div>

          <div className={styles.field}>
            <span>Cruise speed</span>
            <p>{drone?.specs.cruiseSpeedKmh} km/h</p>
          </div>

          <div className={styles.field}>
            <span>Base power draw</span>
            <p>{drone?.specs.basePowerConsumptionW} W</p>
          </div>

          <div className={styles.field}>
            <span>Payload power coefficient</span>
            <p>{drone?.specs.payloadPowerCoefficient} W/kg</p>
          </div>

          <div className={styles.field}>
            <span>Max payload</span>
            <p>{drone?.capacity.maxWeightKg} kg</p>
          </div>

          <div className={styles.field}>
            <span>Max range (full battery, max payload)</span>
            <p>{maxPayloadRange.toFixed(1)} km</p>
          </div>

          <div className={styles.field}>
            <span>Range now (current battery, max payload)</span>
            <p>{currentBatteryRange.toFixed(1)} km</p>
          </div>
        </section>

        <section>
          <h2 className={styles.header}>Position</h2>

          <div className={styles.field}>
            <span>Latitude</span>
            <p>{drone?.position.latitude}</p>
          </div>

          <div className={styles.field}>
            <span>Longitude</span>
            <p>{drone?.position.longitude}</p>
          </div>

          <div className={styles.field}>
            <span>Altitude</span>
            <p>{drone?.position.altitude}</p>
          </div>

          <div className={styles.field}>
            <span>Timestamp</span>
            <p>{drone?.position.timestamp}</p>
          </div>
        </section>
      </div>

      <div className={styles.map}>
        <DroneMap
          position={[
            {
              ...drone?.position,
              droneId: drone?.droneId,
            } as IDronePosition,
          ]}
        />
      </div>
    </div>
  );
};
