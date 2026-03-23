import { useParams } from "react-router-dom";
import { useDronePosition } from "./useDronePosition";

export const DronePosition = () => {
  const { droneId } = useParams();
  const { query } = useDronePosition(droneId);
  const dronePosition = query.data;

  return (
    <div>
      <h1>Drone Position</h1>
      <p>Here you can see the current position of the drone.</p>
      {dronePosition && (
        <div key={dronePosition?.timestamp}>
          <p>Latitude: {dronePosition?.latitude}</p>
          <p>Longitude: {dronePosition?.longitude}</p>
          <p>Altitude: {dronePosition?.altitude}</p>
          <p>Timestamp: {dronePosition?.timestamp}</p>
        </div>
      )}
    </div>
  );
};
