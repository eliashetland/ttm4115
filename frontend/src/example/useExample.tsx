import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../api/ApiClient";
import type { IExample } from "../api/models/IExample";

export const useExample = () => {
  const query = useQuery({
    queryKey: ["example"],
    queryFn: () => ApiClient.get<IExample[]>("/example"),
  });

  return { query };
};
