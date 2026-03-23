import { useQuery } from "@tanstack/react-query";
import type { IDrone } from "../api/models/IDrone";
import { ApiClient } from "../api/ApiClient";
import { Link } from "react-router-dom";

export const AllDrones = () => {
  const { data: drones } = useQuery({
    queryKey: ["drone"],
    queryFn: () => ApiClient.get<IDrone[]>("/drone"),
  });

  return (
    <div>
      <h1>All Drones</h1>
      {drones && (
        <ul>
          {drones.map((drone) => (
            <li key={drone.droneId}>
              <Link to={`/drone/${drone.droneId}`}>
                <strong>{drone.name}</strong> - {drone.model}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
