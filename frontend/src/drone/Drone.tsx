import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../api/ApiClient";
import type { IDrone } from "../api/models/IDrone";
import { useParams } from "react-router-dom";
import { DroneMap } from "../operator/DroneMap";
import type { IDronePosition } from "../api/models/IDronePosition";
import styles from "./Drone.module.css";
export const Drone = () => {
  const { droneId } = useParams();

  const { data: drone } = useQuery({
    queryKey: ["drone", droneId],
    queryFn: () => ApiClient.get<IDrone>(`/drone/${droneId}`),
  });

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
