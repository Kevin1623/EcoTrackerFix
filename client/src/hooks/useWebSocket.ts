import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSensorData } from "./useSensorData";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { devices } = useSensorData();
  const deviceId = devices?.[0]?.id;

  useEffect(() => {
    if (!deviceId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const port = window.location.port || (window.location.protocol === "https:" ? "443" : "5000");
    const wsUrl = `${protocol}//${window.location.hostname}:${port}/ws`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to device updates
      ws.send(JSON.stringify({
        type: 'subscribe',
        deviceId: deviceId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'sensorData' && message.deviceId === deviceId) {
          console.log('Received sensor data:', message.data);
          
          // Invalidate and refetch sensor data queries
          queryClient.invalidateQueries({
            queryKey: ['/api/sensors', deviceId, 'latest']
          });
          
          // Optionally update the cache directly for immediate UI updates
          queryClient.setQueryData(['/api/sensors', deviceId, 'latest'], message.data);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [deviceId, queryClient]);

  return wsRef.current;
}
