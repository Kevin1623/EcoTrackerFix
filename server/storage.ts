import {
  users,
  devices,
  sensorReadings,
  alerts,
  predictions,
  type User,
  type UpsertUser,
  type Device,
  type InsertDevice,
  type SensorReading,
  type InsertSensorReading,
  type Alert,
  type InsertAlert,
  type Prediction,
  type InsertPrediction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Device operations
  createDevice(device: InsertDevice): Promise<Device>;
  getDevicesByUserId(userId: string): Promise<Device[]>;
  updateDeviceStatus(deviceId: string, isOnline: boolean): Promise<void>;
  getDeviceByMacAddress(macAddress: string): Promise<Device | undefined>;
  
  // Sensor readings operations
  createSensorReading(reading: InsertSensorReading): Promise<SensorReading>;
  getLatestReadingsByDeviceId(deviceId: string): Promise<SensorReading | undefined>;
  getSensorReadingsInRange(deviceId: string, startDate: Date, endDate: Date): Promise<SensorReading[]>;
  
  // Alerts operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getUnreadAlerts(deviceId: string): Promise<Alert[]>;
  markAlertAsRead(alertId: string): Promise<void>;
  
  // Predictions operations
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getLatestPredictions(deviceId: string, type: string): Promise<Prediction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Device operations
  async createDevice(device: InsertDevice): Promise<Device> {
    const [newDevice] = await db.insert(devices).values(device).returning();
    return newDevice;
  }

  async getDevicesByUserId(userId: string): Promise<Device[]> {
    return await db.select().from(devices).where(eq(devices.userId, userId));
  }

  async updateDeviceStatus(deviceId: string, isOnline: boolean): Promise<void> {
    await db
      .update(devices)
      .set({ 
        isOnline: isOnline ? 1 : 0, 
        lastSeen: new Date() 
      })
      .where(eq(devices.id, deviceId));
  }

  async getDeviceByMacAddress(macAddress: string): Promise<Device | undefined> {
    const [device] = await db
      .select()
      .from(devices)
      .where(eq(devices.macAddress, macAddress));
    return device;
  }

  // Sensor readings operations
  async createSensorReading(reading: InsertSensorReading): Promise<SensorReading> {
    const [newReading] = await db
      .insert(sensorReadings)
      .values(reading)
      .returning();
    return newReading;
  }

  async getLatestReadingsByDeviceId(deviceId: string): Promise<SensorReading | undefined> {
    const [reading] = await db
      .select()
      .from(sensorReadings)
      .where(eq(sensorReadings.deviceId, deviceId))
      .orderBy(desc(sensorReadings.timestamp))
      .limit(1);
    return reading;
  }

  async getSensorReadingsInRange(
    deviceId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<SensorReading[]> {
    return await db
      .select()
      .from(sensorReadings)
      .where(
        and(
          eq(sensorReadings.deviceId, deviceId),
          gte(sensorReadings.timestamp, startDate),
          lte(sensorReadings.timestamp, endDate)
        )
      )
      .orderBy(desc(sensorReadings.timestamp));
  }

  // Alerts operations
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async getUnreadAlerts(deviceId: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.deviceId, deviceId),
          eq(alerts.isRead, 0)
        )
      )
      .orderBy(desc(alerts.createdAt))
      .limit(10);
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await db
      .update(alerts)
      .set({ isRead: 1 })
      .where(eq(alerts.id, alertId));
  }

  // Predictions operations
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db
      .insert(predictions)
      .values(prediction)
      .returning();
    return newPrediction;
  }

  async getLatestPredictions(deviceId: string, type: string): Promise<Prediction[]> {
    return await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.deviceId, deviceId),
          eq(predictions.predictionType, type)
        )
      )
      .orderBy(desc(predictions.createdAt))
      .limit(24); // Last 24 predictions (hours)
  }
}

export const storage = new DatabaseStorage();
