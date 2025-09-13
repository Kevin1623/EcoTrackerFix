import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Cpu, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Info,
  Bell
} from "lucide-react";
import { SensorCharts } from "@/components/charts/sensor-charts";
import { useSensorData } from "@/hooks/useSensorData";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { latestReading, devices, isLoading: sensorsLoading } = useSensorData();
  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts', devices?.[0]?.id],
    enabled: !!devices?.[0]?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useWebSocket();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const device = devices?.[0];
  const temp = latestReading?.temperature ?? 0;
  const humidity = latestReading?.humidity ?? 0;
  const airQuality = latestReading?.airQuality ?? 0;

  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 100) return { status: 'Good', color: 'bg-green-500' };
    if (aqi <= 150) return { status: 'Moderate', color: 'bg-yellow-500' };
    if (aqi <= 200) return { status: 'Unhealthy', color: 'bg-orange-500' };
    return { status: 'Very Unhealthy', color: 'bg-red-500' };
  };

  const airQualityInfo = getAirQualityStatus(airQuality);

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">Environmental Dashboard</h2>
            <p className="text-muted-foreground text-sm">Real-time monitoring and analysis</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${device?.isOnline ? 'bg-primary animate-pulse' : 'bg-destructive'}`}></div>
              <span className="text-muted-foreground">
                ESP8266 {device?.isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
            
            <div className="relative">
              <Button variant="ghost" size="sm" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              {alerts && alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Temperature Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Thermometer className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-muted-foreground text-sm">Temperature</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="text-temperature">
                      {temp.toFixed(1)}°C
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm">
                    {temp > 25 ? (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-blue-500 mr-1" />
                    )}
                    <span className={temp > 25 ? "text-red-600" : "text-blue-600"}>
                      {temp > 25 ? '+' : '-'}0.5°
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs 1h ago</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((temp / 40) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Humidity Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-muted-foreground text-sm">Humidity</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="text-humidity">
                      {humidity.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm">
                    {humidity > 70 ? (
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-orange-500 mr-1" />
                    )}
                    <span className={humidity > 70 ? "text-blue-600" : "text-orange-600"}>
                      {humidity > 70 ? '+' : '-'}2%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs 1h ago</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${humidity}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Air Quality Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${airQualityInfo.color.replace('bg-', 'bg-').replace('-500', '-100')} dark:${airQualityInfo.color.replace('bg-', 'bg-').replace('-500', '-900/20')}`}>
                    <Wind className={`h-5 w-5 ${airQualityInfo.color.replace('bg-', 'text-').replace('-500', '-600')} dark:${airQualityInfo.color.replace('bg-', 'text-').replace('-500', '-400')}`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-muted-foreground text-sm">Air Quality</p>
                    <p className="text-2xl font-bold text-card-foreground" data-testid="text-airquality">
                      {airQualityInfo.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${airQualityInfo.color.replace('bg-', 'text-').replace('-500', '-600')}`}>
                    {airQuality} AQI
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {airQualityInfo.status}
                  </p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`${airQualityInfo.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((airQuality / 300) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* ESP8266 Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-muted-foreground text-sm">ESP8266</p>
                    <p className="text-lg font-bold text-primary" data-testid="text-device-status">
                      {device?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-sm">Signal: 85%</span>
                  <p className="text-xs text-muted-foreground">
                    Last: {device?.lastSeen ? '2s ago' : 'Never'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                <span>Uptime: 2d 14h</span>
                <span className={`${device?.isOnline ? 'text-primary' : 'text-destructive'}`}>●</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SensorCharts deviceId={device?.id} />
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sensorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : alerts && alerts.length > 0 ? (
                alerts.map((alert: any) => (
                  <div 
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      alert.severity === 'critical' 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                        : alert.severity === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center">
                      {alert.severity === 'critical' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                      )}
                      <div>
                        <p className="font-medium text-card-foreground">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent alerts</p>
                  <p className="text-sm">All systems operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
