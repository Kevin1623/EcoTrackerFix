import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorChartsProps {
  deviceId?: string;
}

export function SensorCharts({ deviceId }: SensorChartsProps) {
  const { data: sensorHistory, isLoading } = useQuery({
    queryKey: ['/api/sensors', deviceId, 'history'],
    enabled: !!deviceId,
    refetchInterval: 60000, // Refetch every minute
  });

  if (!deviceId) {
    return (
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>No device connected</p>
              <p className="text-sm">Connect an ESP8266 device to view charts</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const readings = sensorHistory || [];
  
  // Prepare data for charts
  const labels = readings.slice(0, 24).reverse().map((reading: any) => {
    const date = new Date(reading.timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  const temperatureData = readings.slice(0, 24).reverse().map((reading: any) => reading.temperature || 0);
  const humidityData = readings.slice(0, 24).reverse().map((reading: any) => reading.humidity || 0);
  const airQualityData = readings.slice(0, 24).reverse().map((reading: any) => reading.airQuality || 0);

  const tempHumidityChartData = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatureData,
        borderColor: 'hsl(0, 84%, 60%)',
        backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
        yAxisID: 'y',
        fill: true,
      },
      {
        label: 'Humidity (%)',
        data: humidityData,
        borderColor: 'hsl(217, 91%, 59%)',
        backgroundColor: 'hsla(217, 91%, 59%, 0.1)',
        yAxisID: 'y1',
        fill: true,
      },
    ],
  };

  const airQualityChartData = {
    labels,
    datasets: [
      {
        label: 'Air Quality Index',
        data: airQualityData,
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Humidity (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const airQualityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Air Quality Index',
        },
      },
    },
  };

  return (
    <>
      {/* Temperature & Humidity Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Temperature & Humidity</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="bg-primary/10 text-primary">
                24H
              </Button>
              <Button variant="outline" size="sm" className="text-muted-foreground hover:bg-muted">
                7D
              </Button>
              <Button variant="outline" size="sm" className="text-muted-foreground hover:bg-muted">
                30D
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={tempHumidityChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Air Quality Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Air Quality Index</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Good Quality</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={airQualityChartData} options={airQualityOptions} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
