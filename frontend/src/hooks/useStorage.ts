import { useQuery } from "react-query";
import { storageApi } from "@/services/api";

export const useStorageInfo = () => {
  return useQuery(["storage"], () => storageApi.getStorageInfo(), {
    staleTime: 30 * 1000, // 30 seconds - storage info doesn't change frequently
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    refetchOnWindowFocus: false,
  });
};
