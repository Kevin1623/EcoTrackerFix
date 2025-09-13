import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSensorReadingSchema, insertDeviceSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";
import { generatePredictions } from "./services/mlPrediction";
import { validateSensorData, checkThresholds } from "./services/espCommunication";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Device routes
  app.get('/api/devices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await storage.getDevicesByUserId(userId);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.post('/api/devices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deviceData = insertDeviceSchema.parse({ ...req.body, userId });
      const device = await storage.createDevice(deviceData);
      res.json(device);
    } catch (error) {
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  // Sensor data routes
  app.get('/api/sensors/:deviceId/latest', isAuthenticated, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const reading = await storage.getLatestReadingsByDeviceId(deviceId);
      res.json(reading || null);
    } catch (error) {
      console.error("Error fetching latest reading:", error);
      res.status(500).json({ message: "Failed to fetch latest reading" });
    }
  });

  app.get('/api/sensors/:deviceId/history', isAuthenticated, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const readings = await storage.getSensorReadingsInRange(deviceId, start, end);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching sensor history:", error);
      res.status(500).json({ message: "Failed to fetch sensor history" });
    }
  });

  // ESP8266 data endpoint
  app.post('/api/esp/data', async (req, res) => {
    try {
      const macAddress = req.headers.macaddress || req.headers['mac-address'];
      const sensorData = validateSensorData(req.body);
      
      if (!macAddress) {
        return res.status(400).json({ message: "MAC address required" });
      }

      // Find device by MAC address
      const device = await storage.getDeviceByMacAddress(macAddress as string);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      // Update device status
      await storage.updateDeviceStatus(device.id, true);

      // Store sensor reading
      const reading = await storage.createSensorReading({
        deviceId: device.id,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        airQuality: sensorData.airQuality,
      });

      // Check for threshold alerts
      const alerts = await checkThresholds(device.id, sensorData);
      for (const alert of alerts) {
        await storage.createAlert(alert);
      }

      // Broadcast to WebSocket clients
      broadcastSensorData(device.id, { ...sensorData, timestamp: reading.timestamp });

      res.json({ success: true, reading });
    } catch (error) {
      console.error("Error processing ESP data:", error);
      res.status(500).json({ message: "Failed to process sensor data" });
    }
  });

  // Alerts routes
  app.get('/api/alerts/:deviceId', isAuthenticated, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const alerts = await storage.getUnreadAlerts(deviceId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.patch('/api/alerts/:alertId/read', isAuthenticated, async (req, res) => {
    try {
      const { alertId } = req.params;
      await storage.markAlertAsRead(alertId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // ML Predictions routes
  app.get('/api/predictions/:deviceId/:type', isAuthenticated, async (req, res) => {
    try {
      const { deviceId, type } = req.params;
      const predictions = await storage.getLatestPredictions(deviceId, type);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  app.post('/api/predictions/:deviceId/generate', isAuthenticated, async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { type = 'air_quality' } = req.body;
      
      // Get historical data for ML prediction
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const historicalData = await storage.getSensorReadingsInRange(deviceId, startDate, endDate);
      
      // Generate predictions
      const predictions = await generatePredictions(deviceId, type, historicalData);
      
      // Store predictions
      for (const prediction of predictions) {
        await storage.createPrediction(prediction);
      }
      
      res.json(predictions);
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        if (data.type === 'subscribe') {
          // Subscribe to device updates
          (ws as any).deviceId = data.deviceId;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Function to broadcast sensor data to connected clients
  function broadcastSensorData(deviceId: string, data: any) {
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client as any).deviceId === deviceId
      ) {
        client.send(JSON.stringify({
          type: 'sensorData',
          deviceId,
          data,
        }));
      }
    });
  }

  // Store broadcast function globally for use in ESP endpoint
  (global as any).broadcastSensorData = broadcastSensorData;

  return httpServer;
}
