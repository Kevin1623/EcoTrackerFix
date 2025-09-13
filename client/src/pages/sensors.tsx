import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Thermometer, Wind, Cpu, Play, Download } from "lucide-react";
import { RealTimeStream } from "@/components/sensors/real-time-stream";
import { useSensorData } from "@/hooks/useSensorData";

export default function Sensors() {
  const { devices, latestReading } = useSensorData();
  const device = devices?.[0];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Sensor Management</h2>
          <p className="text-muted-foreground text-sm">Configure and monitor your sensors</p>
        </div>
      </header>

      <main className="p-6">
        {/* Sensor Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* DHT11 Sensor */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Thermometer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-card-foreground">DHT11</h3>
                    <p className="text-sm text-muted-foreground">Temperature & Humidity</p>
                  </div>
                </div>
                <Badge variant={device?.isOnline ? "default" : "secondary"} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${device?.isOnline ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                  {device?.isOnline ? 'Active' : 'Offline'}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pin:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">D4</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interval:</span>
                  <span className="text-card-foreground">5 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Reading:</span>
                  <span className="text-card-foreground">
                    {latestReading ? '2 sec ago' : 'No data'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MQ135 Sensor */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Wind className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-card-foreground">MQ135</h3>
                    <p className="text-sm text-muted-foreground">Air Quality</p>
                  </div>
                </div>
                <Badge variant={device?.isOnline ? "default" : "secondary"} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${device?.isOnline ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                  {device?.isOnline ? 'Active' : 'Offline'}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pin:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">A0</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calibration:</span>
                  <span className="text-primary">Calibrated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sensitivity:</span>
                  <span className="text-card-foreground">High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ESP8266 Controller */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-card-foreground">ESP8266</h3>
                    <p className="text-sm text-muted-foreground">WiFi Controller</p>
                  </div>
                </div>
                <Badge variant={device?.isOnline ? "default" : "secondary"} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${device?.isOnline ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                  {device?.isOnline ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {device?.ipAddress || '192.168.1.100'}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RSSI:</span>
                  <span className="text-card-foreground">-65 dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Firmware:</span>
                  <span className="text-card-foreground">
                    {device?.firmware || 'v2.7.4'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Data Stream */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Real-time Data Stream</CardTitle>
              <div className="flex items-center space-x-3">
                <Button data-testid="button-start-stream">
                  <Play className="h-4 w-4 mr-2" />
                  Start Stream
                </Button>
                <Button variant="secondary" data-testid="button-export-data">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RealTimeStream deviceId={device?.id} />
          </CardContent>
        </Card>

        {/* WebSocket Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websocket-url" className="text-sm font-medium mb-2 block">
                  WebSocket URL
                </Label>
                <Input
                  id="websocket-url"
                  type="text"
                  defaultValue={`ws://${device?.ipAddress || '192.168.1.100'}:8080/ws`}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="update-interval" className="text-sm font-medium mb-2 block">
                  Update Interval (ms)
                </Label>
                <Input
                  id="update-interval"
                  type="number"
                  defaultValue="5000"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
