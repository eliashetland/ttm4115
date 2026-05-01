import { useQuery } from "@tanstack/react-query";
import styles from "./Operator.module.css";
import { ApiClient } from "../api/ApiClient";
import type { IDrone } from "../api/models/IDrone";
import { DateUtils } from "../utils/DateUtils";
import { DroneMap } from "./DroneMap";
import type { IDronePosition } from "../api/models/IDronePosition";
import { useState } from "react";

export const Operator = () => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { data: drones } = useQuery({
    queryKey: ["drones"],
    queryFn: () => ApiClient.get<IDrone[]>("/drone"),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  return (
    <div className={styles.container}>
      <h1>Drones</h1>
      <div className={styles.autoRefresh}>
        <input
          type="checkbox"
          id="auto-refresh"
          name="auto-refresh"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
        />
        <label htmlFor="auto-refresh">Auto-refresh</label>
      </div>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>battery</th>
              <th>name</th>
              <th>model</th>
              <th>manufacturer</th>
              <th>position</th>
              <th>last update</th>
              <th>max (cm)</th>
              <th>max (kg)</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {drones?.map((drone) => (
              <tr key={drone.droneId}>
                <td>
                  <a href={`/drone/${drone.droneId}`}>{drone.droneId}</a>
                </td>
                <td
                  className={`${
                    drone.batteryLevel > 50
                      ? styles.green
                      : drone.batteryLevel > 20
                        ? styles.yellow
                        : styles.red
                  } ${styles.batteryLevel}`}
                >
                  {drone.batteryLevel}%
                </td>
                <td>{drone.name}</td>
                <td>{drone.model}</td>
                <td>{drone.manufacturer}</td>
                <td>
                  {drone.position.latitude}, {drone.position.longitude}
                </td>
                <td>
                  {DateUtils.format(drone.position.timestamp, "HH:mm:ss")}
                </td>

                <td>
                  {drone.capacity.maxVolumeCm3.toLocaleString()}
                </td>
                <td>{drone.capacity.maxWeightKg}</td>
                <td>{drone.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.map}>
        <DroneMap
          position={
            drones?.map(
              (drone) =>
                ({
                  ...drone.position,
                  droneId: drone.droneId,
                }) as IDronePosition,
            ) || []
          }
        />
      </div>
    </div>
  );
};
