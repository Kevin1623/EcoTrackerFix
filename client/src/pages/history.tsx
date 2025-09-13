import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search } from "lucide-react";
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
} from "chart.js";
import { useSensorData } from "@/hooks/useSensorData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function History() {
  const [timeRange, setTimeRange] = useState("24h");
  const [searchTerm, setSearchTerm] = useState("");
  const { devices } = useSensorData();
  const deviceId = devices?.[0]?.id;

  // Calculate date range based on selection
  const getDateRange = () => {
    const end = new Date();
    let start = new Date();
    
    switch (timeRange) {
      case "24h":
        start.setHours(start.getHours() - 24);
        break;
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      default:
        start.setHours(start.getHours() - 24);
    }
    
    return { start, end };
  };

  const { start, end } = getDateRange();

  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['/api/sensors', deviceId, 'history', { 
      startDate: start.toISOString(), 
      endDate: end.toISOString() 
    }],
    enabled: !!deviceId,
  });

  const readings = historicalData || [];

  // Calculate summary statistics
  const calculateStats = () => {
    if (readings.length === 0) return null;

    const temps = readings.map((r: any) => r.temperature || 0);
    const humidity = readings.map((r: any) => r.humidity || 0);
    const airQuality = readings.map((r: any) => r.airQuality || 0);

    return {
      temperature: {
        avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
        min: Math.min(...temps).toFixed(1),
        max: Math.max(...temps).toFixed(1),
      },
      humidity: {
        avg: Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length),
        min: Math.round(Math.min(...humidity)),
        max: Math.round(Math.max(...humidity)),
      },
      airQuality: {
        avg: Math.round(airQuality.reduce((a, b) => a + b, 0) / airQuality.length),
        min: Math.round(Math.min(...airQuality)),
        max: Math.round(Math.max(...airQuality)),
      },
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const chartLabels = readings.slice(0, 50).reverse().map((reading: any) => {
    const date = new Date(reading.timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: readings.slice(0, 50).reverse().map((r: any) => r.temperature || 0),
        borderColor: 'hsl(0, 84%, 60%)',
        backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
        hidden: false,
      },
      {
        label: 'Humidity (%)',
        data: readings.slice(0, 50).reverse().map((r: any) => r.humidity || 0),
        borderColor: 'hsl(217, 91%, 59%)',
        backgroundColor: 'hsla(217, 91%, 59%, 0.1)',
        hidden: false,
      },
      {
        label: 'Air Quality',
        data: readings.slice(0, 50).reverse().map((r: any) => r.airQuality || 0),
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
        hidden: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        display: true,
        title: {
          display: true,
          text: 'Values',
        },
      },
    },
  };

  const handleExport = () => {
    if (!readings.length) return;

    const csv = [
      ['Timestamp', 'Temperature (°C)', 'Humidity (%)', 'Air Quality'],
      ...readings.map((reading: any) => [
        new Date(reading.timestamp).toISOString(),
        reading.temperature || '',
        reading.humidity || '',
        reading.airQuality || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecotracker-data-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (reading: any) => {
    const temp = reading.temperature || 0;
    const humidity = reading.humidity || 0;
    const aqi = reading.airQuality || 0;

    if (temp > 30 || humidity > 85 || aqi > 200) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (temp > 28 || humidity > 80 || aqi > 150) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Warning</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Normal</Badge>;
  };

  // Filter readings based on search term
  const filteredReadings = readings.filter((reading: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const timestamp = new Date(reading.timestamp).toLocaleString().toLowerCase();
    return timestamp.includes(searchLower);
  });

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Data History</h2>
          <p className="text-muted-foreground text-sm">Historical data analysis and export</p>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Time Range Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Time Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant={timeRange === "24h" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setTimeRange("24h")}
                  data-testid="button-24h"
                >
                  Last 24 Hours
                </Button>
                <Button
                  variant={timeRange === "7d" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setTimeRange("7d")}
                  data-testid="button-7d"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={timeRange === "30d" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setTimeRange("30d")}
                  data-testid="button-30d"
                >
                  Last 30 Days
                </Button>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <Label className="text-sm font-medium mb-2 block">Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="w-full mt-3" 
                  variant="secondary"
                  onClick={handleExport}
                  disabled={!readings.length}
                  data-testid="button-export"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics ({timeRange})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-card-foreground mb-1" data-testid="stats-temp-avg">
                        {stats.temperature.avg}°C
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">Avg Temperature</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: {stats.temperature.min}°C</span>
                        <span>Max: {stats.temperature.max}°C</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-card-foreground mb-1" data-testid="stats-humidity-avg">
                        {stats.humidity.avg}%
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">Avg Humidity</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: {stats.humidity.min}%</span>
                        <span>Max: {stats.humidity.max}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-card-foreground mb-1" data-testid="stats-aqi-avg">
                        {stats.airQuality.avg}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">Avg AQI</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: {stats.airQuality.min}</span>
                        <span>Max: {stats.airQuality.max}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No data available for the selected time range</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Historical Chart */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historical Data</CardTitle>
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  Temperature
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  Humidity
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  Air Quality
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : readings.length > 0 ? (
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>No historical data available</p>
                  <p className="text-sm">Connect your ESP8266 device to start collecting data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Readings</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search readings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                    data-testid="input-search"
                  />
                </div>
                <Button variant="outline" size="sm" data-testid="button-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Timestamp</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Temperature</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Humidity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Air Quality</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-card-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReadings.length > 0 ? (
                      filteredReadings.slice(0, 20).map((reading: any, index: number) => (
                        <tr key={reading.id || index} data-testid={`row-reading-${index}`}>
                          <td className="px-4 py-3 text-sm text-card-foreground">
                            {new Date(reading.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-card-foreground">
                            {reading.temperature?.toFixed(1) || 'N/A'}°C
                          </td>
                          <td className="px-4 py-3 text-sm text-card-foreground">
                            {reading.humidity?.toFixed(0) || 'N/A'}%
                          </td>
                          <td className="px-4 py-3 text-sm text-card-foreground">
                            {reading.airQuality || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(reading)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          {searchTerm ? 'No readings match your search' : 'No data available'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
