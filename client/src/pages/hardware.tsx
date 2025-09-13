import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Hardware() {
  const { toast } = useToast();

  const handleCopyCode = async () => {
    const code = `#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <DHT.h>
#include <ArduinoJson.h>

// Pin definitions
#define DHT_PIN 2     // D4 on NodeMCU
#define DHT_TYPE DHT11
#define MQ135_PIN A0   // Analog pin

// WiFi credentials
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// Initialize sensors and servers
DHT dht(DHT_PIN, DHT_TYPE);
ESP8266WebServer server(80);
WebSocketsServer webSocket(81);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // Start HTTP server
  server.on("/data", HTTP_GET, handleData);
  server.begin();
}

void loop() {
  webSocket.loop();
  server.handleClient();
  
  // Read sensors every 5 seconds
  static unsigned long lastReading = 0;
  if (millis() - lastReading > 5000) {
    sendSensorData();
    lastReading = millis();
  }
}

void sendSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int airQuality = analogRead(MQ135_PIN);
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["airQuality"] = airQuality;
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  // Send via WebSocket
  webSocket.broadcastTXT(payload);
}`;

    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied!",
        description: "Arduino code has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Hardware Setup</h2>
          <p className="text-muted-foreground text-sm">ESP8266 wiring and configuration guide</p>
        </div>
      </header>

      <main className="p-6">
        {/* Wiring Diagram */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ESP8266 Wiring Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                {/* Wiring diagram placeholder */}
                <div className="bg-muted rounded-lg p-8 flex items-center justify-center h-64">
                  <div className="text-center">
                    <Cpu className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Wiring Diagram</p>
                    <p className="text-sm text-muted-foreground">ESP8266 + DHT11 + MQ135</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-card-foreground">Connection Guide</h4>
                
                {/* DHT11 Connections */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">DHT11 Temperature & Humidity Sensor</h5>
                  <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <div className="flex justify-between">
                      <span>VCC (Pin 1):</span>
                      <Badge variant="outline">3.3V</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Data (Pin 2):</span>
                      <Badge variant="outline">D4 (GPIO2)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>GND (Pin 4):</span>
                      <Badge variant="outline">GND</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Note: Add 10kΩ pull-up resistor between VCC and Data pin
                  </p>
                </div>

                {/* MQ135 Connections */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">MQ135 Air Quality Sensor</h5>
                  <div className="space-y-1 text-sm text-green-700 dark:text-green-400">
                    <div className="flex justify-between">
                      <span>VCC:</span>
                      <Badge variant="outline">5V</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>GND:</span>
                      <Badge variant="outline">GND</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Analog Out:</span>
                      <Badge variant="outline">A0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Digital Out:</span>
                      <Badge variant="outline">D2 (Optional)</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Note: Allow 24-48 hours for sensor calibration
                  </p>
                </div>

                {/* Power Supply */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Power Supply</h5>
                  <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                    <div className="flex justify-between">
                      <span>ESP8266:</span>
                      <span>3.3V (Internal regulator)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Input:</span>
                      <span>5V via USB or external</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arduino Code */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Arduino Code</CardTitle>
              <Button onClick={handleCopyCode} data-testid="button-copy-code">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 max-h-96 overflow-y-auto">
              <pre>
                <code>{`#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <DHT.h>
#include <ArduinoJson.h>

// Pin definitions
#define DHT_PIN 2     // D4 on NodeMCU
#define DHT_TYPE DHT11
#define MQ135_PIN A0   // Analog pin

// WiFi credentials
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// Initialize sensors and servers
DHT dht(DHT_PIN, DHT_TYPE);
ESP8266WebServer server(80);
WebSocketsServer webSocket(81);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  // Start HTTP server
  server.on("/data", HTTP_GET, handleData);
  server.begin();
}

void loop() {
  webSocket.loop();
  server.handleClient();
  
  // Read sensors every 5 seconds
  static unsigned long lastReading = 0;
  if (millis() - lastReading > 5000) {
    sendSensorData();
    lastReading = millis();
  }
}

void sendSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int airQuality = analogRead(MQ135_PIN);
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["airQuality"] = airQuality;
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  // Send via WebSocket
  webSocket.broadcastTXT(payload);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  // Handle WebSocket events
}

void handleData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int airQuality = analogRead(MQ135_PIN);
  
  String json = "{\\"temperature\\":" + String(temperature) + 
                ",\\"humidity\\":" + String(humidity) + 
                ",\\"airQuality\\":" + String(airQuality) + "}";
  
  server.send(200, "application/json", json);
}`}</code>
              </pre>
            </div>
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Setup Instructions</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li>Install required libraries: ESP8266WiFi, WebSocketsServer, DHT sensor library, ArduinoJson</li>
                <li>Update WiFi credentials in the code</li>
                <li>Upload code to ESP8266 using Arduino IDE</li>
                <li>Open Serial Monitor to get the device's IP address</li>
                <li>Update WebSocket URL in the web application</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* HTTP vs WebSocket */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>HTTP API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <code className="text-green-700 dark:text-green-400 font-mono text-sm">GET /data</code>
                    <Badge variant="outline">JSON</Badge>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">Get current sensor readings</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <code className="text-blue-700 dark:text-blue-400 font-mono text-sm">GET /status</code>
                    <Badge variant="outline">JSON</Badge>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Get device status and uptime</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <code className="text-purple-700 dark:text-purple-400 font-mono text-sm">POST /config</code>
                    <Badge variant="outline">JSON</Badge>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Update sensor configuration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>WebSocket Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">JavaScript Client Code</h4>
                  <div className="bg-gray-900 rounded p-3 text-sm font-mono text-green-400">
                    <pre>
                      <code>{`const socket = new WebSocket('ws://192.168.1.100:81');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};`}</code>
                    </pre>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Benefits</h5>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
                    <li>Real-time data streaming</li>
                    <li>Low latency updates</li>
                    <li>Persistent connection</li>
                    <li>Bi-directional communication</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
