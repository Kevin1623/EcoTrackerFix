import { z } from "zod";
import { ObjectId } from "mongodb";

// MongoDB Document Interfaces
export interface MongoDocument {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// User document interface
export interface UserDocument extends MongoDocument {
  id: string; // Keep string ID for compatibility with Replit Auth
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// Device document interface
export interface DeviceDocument extends MongoDocument {
  id: string;
  userId: string;
  name: string;
  ipAddress?: string;
  macAddress?: string;
  firmware?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

// Sensor reading document interface
export interface SensorReadingDocument extends MongoDocument {
  id: string;
  deviceId: string;
  temperature?: number;
  humidity?: number;
  airQuality?: number;
  timestamp: Date;
}

// Alert document interface
export interface AlertDocument extends MongoDocument {
  id: string;
  deviceId: string;
  type: string; // 'temperature', 'humidity', 'air_quality'
  severity: string; // 'info', 'warning', 'critical'
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  isRead: boolean;
}

// Prediction document interface
export interface PredictionDocument extends MongoDocument {
  id: string;
  deviceId: string;
  predictionType: string; // 'air_quality', 'temperature', 'humidity'
  predictedValue: number;
  confidence?: number;
  predictionFor: Date;
  modelVersion?: string;
}

// Session document interface (for MongoDB session store)
export interface SessionDocument extends MongoDocument {
  _id: string; // Session ID
  session: any; // Session data
  expires: Date;
}

// Type aliases for compatibility
export type User = UserDocument;
export type Device = DeviceDocument;
export type SensorReading = SensorReadingDocument;
export type Alert = AlertDocument;
export type Prediction = PredictionDocument;

// Insert types (omitting auto-generated fields)
export type UpsertUser = Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>;
export type InsertDevice = Omit<DeviceDocument, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type InsertSensorReading = Omit<SensorReadingDocument, '_id' | 'id' | 'timestamp' | 'createdAt' | 'updatedAt'>;
export type InsertAlert = Omit<AlertDocument, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type InsertPrediction = Omit<PredictionDocument, '_id' | 'id' | 'createdAt' | 'updatedAt'>;

// Zod schemas for validation
export const insertDeviceSchema = z.object({
  userId: z.string(),
  name: z.string(),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  firmware: z.string().optional(),
  isOnline: z.boolean().default(false),
  lastSeen: z.date().optional(),
});

export const insertSensorReadingSchema = z.object({
  deviceId: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  airQuality: z.number().optional(),
});

export const insertAlertSchema = z.object({
  deviceId: z.string(),
  type: z.string(),
  severity: z.string(),
  title: z.string(),
  message: z.string(),
  value: z.number().optional(),
  threshold: z.number().optional(),
  isRead: z.boolean().default(false),
});

export const insertPredictionSchema = z.object({
  deviceId: z.string(),
  predictionType: z.string(),
  predictedValue: z.number(),
  confidence: z.number().optional(),
  predictionFor: z.date(),
  modelVersion: z.string().optional(),
});

// Utility function to generate unique IDs
export function generateId(): string {
  return new ObjectId().toString();
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  DEVICES: 'devices',
  SENSOR_READINGS: 'sensorReadings',
  ALERTS: 'alerts',
  PREDICTIONS: 'predictions',
  SESSIONS: 'sessions',
} as const;