import {
  UserDocument,
  DeviceDocument,
  SensorReadingDocument,
  AlertDocument,
  PredictionDocument,
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
  generateId,
  COLLECTIONS,
} from "@shared/schema";
import { getDatabase } from "./db";
import { Collection, Db } from "mongodb";

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

export class MongoStorage implements IStorage {
  private db: Db | null = null;

  private async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await getDatabase();
      await this.ensureIndexes();
    }
    return this.db;
  }

  private async ensureIndexes(): Promise<void> {
    try {
      const db = this.db!;
      
      // Create unique index on users.id for data integrity
      await db.collection(COLLECTIONS.USERS).createIndex(
        { id: 1 }, 
        { 
          unique: true, 
          background: true,
          name: 'idx_users_id_unique'
        }
      );

      // Create useful indexes for better query performance
      await db.collection(COLLECTIONS.DEVICES).createIndex(
        { userId: 1 }, 
        { background: true, name: 'idx_devices_userId' }
      );

      await db.collection(COLLECTIONS.DEVICES).createIndex(
        { macAddress: 1 }, 
        { unique: true, sparse: true, background: true, name: 'idx_devices_macAddress_unique' }
      );

      await db.collection(COLLECTIONS.SENSOR_READINGS).createIndex(
        { deviceId: 1, timestamp: -1 }, 
        { background: true, name: 'idx_sensor_readings_device_timestamp' }
      );

      await db.collection(COLLECTIONS.ALERTS).createIndex(
        { deviceId: 1, isRead: 1, createdAt: -1 }, 
        { background: true, name: 'idx_alerts_device_read_created' }
      );

      await db.collection(COLLECTIONS.PREDICTIONS).createIndex(
        { deviceId: 1, predictionType: 1, createdAt: -1 }, 
        { background: true, name: 'idx_predictions_device_type_created' }
      );

      console.log('Database indexes created successfully');
    } catch (error) {
      // Log error but don't fail - indexes might already exist
      console.warn('Index creation warning (this is normal if indexes exist):', error);
    }
  }

  private async getCollection<T extends Document>(name: string): Promise<Collection<T>> {
    const db = await this.getDb();
    return db.collection<T>(name);
  }

  // User operations (IMPORTANT) mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const collection = await this.getCollection<UserDocument>(COLLECTIONS.USERS);
    const user = await collection.findOne({ id });
    
    if (!user) return undefined;
    
    // Convert MongoDB document to our expected format
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const collection = await this.getCollection<UserDocument>(COLLECTIONS.USERS);
      const now = new Date();
      
      const userDoc: UserDocument = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      const { value } = await collection.findOneAndUpdate(
        { id: userData.id },
        { 
          $set: { ...userData, updatedAt: now },
          $setOnInsert: { createdAt: now }
        },
        { 
          upsert: true, 
          returnDocument: 'after' 
        }
      );

      if (!value) {
        throw new Error(`Failed to upsert user with id: ${userData.id}`);
      }

      return {
        id: value.id,
        email: value.email,
        firstName: value.firstName,
        lastName: value.lastName,
        profileImageUrl: value.profileImageUrl,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
      };
    } catch (error: any) {
      console.error('Error upserting user:', error);
      if (error.code === 11000) {
        throw new Error(`User with id ${userData.id} already exists with different data`);
      }
      throw new Error(`Failed to upsert user: ${error.message}`);
    }
  }

  // Device operations
  async createDevice(device: InsertDevice): Promise<Device> {
    try {
      const collection = await this.getCollection<DeviceDocument>(COLLECTIONS.DEVICES);
      const now = new Date();
      
      const deviceDoc: DeviceDocument = {
        id: generateId(),
        ...device,
        createdAt: now,
        updatedAt: now,
      };

      await collection.insertOne(deviceDoc);
      
      return {
        id: deviceDoc.id,
        userId: deviceDoc.userId,
        name: deviceDoc.name,
        ipAddress: deviceDoc.ipAddress,
        macAddress: deviceDoc.macAddress,
        firmware: deviceDoc.firmware,
        isOnline: deviceDoc.isOnline,
        lastSeen: deviceDoc.lastSeen,
        createdAt: deviceDoc.createdAt,
      };
    } catch (error: any) {
      console.error('Error creating device:', error);
      if (error.code === 11000) {
        throw new Error(`Device with MAC address ${device.macAddress} already exists`);
      }
      throw new Error(`Failed to create device: ${error.message}`);
    }
  }

  async getDevicesByUserId(userId: string): Promise<Device[]> {
    const collection = await this.getCollection<DeviceDocument>(COLLECTIONS.DEVICES);
    const devices = await collection.find({ userId }).toArray();
    
    return devices.map(device => ({
      id: device.id,
      userId: device.userId,
      name: device.name,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      firmware: device.firmware,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen,
      createdAt: device.createdAt,
    }));
  }

  async updateDeviceStatus(deviceId: string, isOnline: boolean): Promise<void> {
    try {
      const collection = await this.getCollection<DeviceDocument>(COLLECTIONS.DEVICES);
      const result = await collection.updateOne(
        { id: deviceId },
        { 
          $set: { 
            isOnline, 
            lastSeen: new Date(),
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error(`Device with id ${deviceId} not found`);
      }
    } catch (error: any) {
      console.error('Error updating device status:', error);
      throw new Error(`Failed to update device status: ${error.message}`);
    }
  }

  async getDeviceByMacAddress(macAddress: string): Promise<Device | undefined> {
    const collection = await this.getCollection<DeviceDocument>(COLLECTIONS.DEVICES);
    const device = await collection.findOne({ macAddress });
    
    if (!device) return undefined;
    
    return {
      id: device.id,
      userId: device.userId,
      name: device.name,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      firmware: device.firmware,
      isOnline: device.isOnline,
      lastSeen: device.lastSeen,
      createdAt: device.createdAt,
    };
  }

  // Sensor readings operations
  async createSensorReading(reading: InsertSensorReading): Promise<SensorReading> {
    const collection = await this.getCollection<SensorReadingDocument>(COLLECTIONS.SENSOR_READINGS);
    const now = new Date();
    
    const readingDoc: SensorReadingDocument = {
      id: generateId(),
      ...reading,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(readingDoc);
    
    return {
      id: readingDoc.id,
      deviceId: readingDoc.deviceId,
      temperature: readingDoc.temperature,
      humidity: readingDoc.humidity,
      airQuality: readingDoc.airQuality,
      timestamp: readingDoc.timestamp,
    };
  }

  async getLatestReadingsByDeviceId(deviceId: string): Promise<SensorReading | undefined> {
    const collection = await this.getCollection<SensorReadingDocument>(COLLECTIONS.SENSOR_READINGS);
    const reading = await collection
      .findOne(
        { deviceId },
        { sort: { timestamp: -1 } }
      );
    
    if (!reading) return undefined;
    
    return {
      id: reading.id,
      deviceId: reading.deviceId,
      temperature: reading.temperature,
      humidity: reading.humidity,
      airQuality: reading.airQuality,
      timestamp: reading.timestamp,
    };
  }

  async getSensorReadingsInRange(
    deviceId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<SensorReading[]> {
    const collection = await this.getCollection<SensorReadingDocument>(COLLECTIONS.SENSOR_READINGS);
    const readings = await collection
      .find({
        deviceId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ timestamp: -1 })
      .toArray();
    
    return readings.map(reading => ({
      id: reading.id,
      deviceId: reading.deviceId,
      temperature: reading.temperature,
      humidity: reading.humidity,
      airQuality: reading.airQuality,
      timestamp: reading.timestamp,
    }));
  }

  // Alerts operations
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const collection = await this.getCollection<AlertDocument>(COLLECTIONS.ALERTS);
    const now = new Date();
    
    const alertDoc: AlertDocument = {
      id: generateId(),
      ...alert,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(alertDoc);
    
    return {
      id: alertDoc.id,
      deviceId: alertDoc.deviceId,
      type: alertDoc.type,
      severity: alertDoc.severity,
      title: alertDoc.title,
      message: alertDoc.message,
      value: alertDoc.value,
      threshold: alertDoc.threshold,
      isRead: alertDoc.isRead,
      createdAt: alertDoc.createdAt,
    };
  }

  async getUnreadAlerts(deviceId: string): Promise<Alert[]> {
    const collection = await this.getCollection<AlertDocument>(COLLECTIONS.ALERTS);
    const alerts = await collection
      .find({
        deviceId,
        isRead: false
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    return alerts.map(alert => ({
      id: alert.id,
      deviceId: alert.deviceId,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      value: alert.value,
      threshold: alert.threshold,
      isRead: alert.isRead,
      createdAt: alert.createdAt,
    }));
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    const collection = await this.getCollection<AlertDocument>(COLLECTIONS.ALERTS);
    await collection.updateOne(
      { id: alertId },
      { 
        $set: { 
          isRead: true,
          updatedAt: new Date()
        } 
      }
    );
  }

  // Predictions operations
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const collection = await this.getCollection<PredictionDocument>(COLLECTIONS.PREDICTIONS);
    const now = new Date();
    
    const predictionDoc: PredictionDocument = {
      id: generateId(),
      ...prediction,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(predictionDoc);
    
    return {
      id: predictionDoc.id,
      deviceId: predictionDoc.deviceId,
      predictionType: predictionDoc.predictionType,
      predictedValue: predictionDoc.predictedValue,
      confidence: predictionDoc.confidence,
      predictionFor: predictionDoc.predictionFor,
      modelVersion: predictionDoc.modelVersion,
      createdAt: predictionDoc.createdAt,
    };
  }

  async getLatestPredictions(deviceId: string, type: string): Promise<Prediction[]> {
    const collection = await this.getCollection<PredictionDocument>(COLLECTIONS.PREDICTIONS);
    const predictions = await collection
      .find({
        deviceId,
        predictionType: type
      })
      .sort({ createdAt: -1 })
      .limit(24) // Last 24 predictions (hours)
      .toArray();
    
    return predictions.map(prediction => ({
      id: prediction.id,
      deviceId: prediction.deviceId,
      predictionType: prediction.predictionType,
      predictedValue: prediction.predictedValue,
      confidence: prediction.confidence,
      predictionFor: prediction.predictionFor,
      modelVersion: prediction.modelVersion,
      createdAt: prediction.createdAt,
    }));
  }
}

export const storage = new MongoStorage();