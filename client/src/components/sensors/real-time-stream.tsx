import { useEffect, useState } from "react";
import { useSensorData } from "@/hooks/useSensorData";

interface RealTimeStreamProps {
  deviceId?: string;
}

interface StreamEntry {
  timestamp: string;
  message: string;
  type: 'success' | 'warning' | 'error';
}

export function RealTimeStream({ deviceId }: RealTimeStreamProps) {
  const [streamData, setStreamData] = useState<StreamEntry[]>([]);
  const { latestReading } = useSensorData();

  useEffect(() => {
    if (!latestReading) return;

    const now = new Date().toLocaleString();
    const temp = latestReading.temperature?.toFixed(1) || 'N/A';
    const humidity = latestReading.humidity?.toFixed(0) || 'N/A';
    const airQuality = latestReading.airQuality || 'N/A';

    const newEntry: StreamEntry = {
      timestamp: now,
      message: `Temperature: ${temp}°C, Humidity: ${humidity}%, Air Quality: ${airQuality}`,
      type: 'success',
    };

    setStreamData(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
  }, [latestReading]);

  const getEntryClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!deviceId) {
    return (
      <div className="bg-muted rounded-lg p-4 font-mono text-sm h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No device connected for streaming</p>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto" data-testid="real-time-stream">
      {streamData.length > 0 ? (
        streamData.map((entry, index) => (
          <div key={index} className={getEntryClass(entry.type)}>
            {entry.timestamp} - {entry.message}
          </div>
        ))
      ) : (
        <div className="text-muted-foreground">
          Waiting for sensor data...
        </div>
      )}
    </div>
  );
}
