import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useSensorData() {
  const { isAuthenticated } = useAuth();

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/devices'],
    enabled: isAuthenticated,
  });

  const deviceId = devices?.[0]?.id;

  const { data: latestReading, isLoading: readingLoading } = useQuery({
    queryKey: ['/api/sensors', deviceId, 'latest'],
    enabled: !!deviceId,
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });

  return {
    devices,
    latestReading,
    isLoading: devicesLoading || readingLoading,
  };
}
