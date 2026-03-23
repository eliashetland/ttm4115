import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../api/ApiClient";
import type { IDronePosition } from "../api/models/IDronePosition";

export const useDronePosition = (droneId: string | undefined) => {
  if (!droneId) {
    throw new Error("Drone ID is required to fetch drone position.");
  }
  const query = useQuery({
    queryKey: ["dronePosition", droneId],
    queryFn: () => ApiClient.get<IDronePosition>(`/drone-position/${droneId}`),
  });

  return { query };
};
