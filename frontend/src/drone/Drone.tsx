import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../api/ApiClient";
import type { IDrone } from "../api/models/IDrone";
import { useParams } from "react-router-dom";

export const Drone = () => {
  const { droneId } = useParams();

  const { data: drone } = useQuery({
    queryKey: ["drone", droneId],
    queryFn: () => ApiClient.get<IDrone>(`/drone/${droneId}`),
  });

  return (
    <div>
      <h1>Drone: {drone?.name}</h1>
      <p>Model: {drone?.model}</p>
      <p>Manufacturer: {drone?.manufacturer}</p>
      <h2>Position:</h2>
      <p>Latitude: {drone?.position.latitude}</p>
      <p>Longitude: {drone?.position.longitude}</p>
      <p>Altitude: {drone?.position.altitude}</p>
      <p>Timestamp: {drone?.position.timestamp}</p>
    </div>
  );
};
