import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  real,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ESP8266 devices table
export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  ipAddress: varchar("ip_address"),
  macAddress: varchar("mac_address"),
  firmware: varchar("firmware"),
  isOnline: integer("is_online").default(0), // 0 = offline, 1 = online
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sensor readings table
export const sensorReadings = pgTable("sensor_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  temperature: real("temperature"),
  humidity: real("humidity"),
  airQuality: integer("air_quality"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  type: varchar("type").notNull(), // 'temperature', 'humidity', 'air_quality'
  severity: varchar("severity").notNull(), // 'info', 'warning', 'critical'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  value: real("value"),
  threshold: real("threshold"),
  isRead: integer("is_read").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ML predictions table
export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  predictionType: varchar("prediction_type").notNull(), // 'air_quality', 'temperature', 'humidity'
  predictedValue: real("predicted_value").notNull(),
  confidence: real("confidence"),
  predictionFor: timestamp("prediction_for").notNull(),
  modelVersion: varchar("model_version"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
  sensorReadings: many(sensorReadings),
  alerts: many(alerts),
  predictions: many(predictions),
}));

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  device: one(devices, {
    fields: [sensorReadings.deviceId],
    references: [devices.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id],
  }),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  device: one(devices, {
    fields: [predictions.deviceId],
    references: [devices.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertDevice = typeof devices.$inferInsert;
export type Device = typeof devices.$inferSelect;

export type InsertSensorReading = typeof sensorReadings.$inferInsert;
export type SensorReading = typeof sensorReadings.$inferSelect;

export type InsertAlert = typeof alerts.$inferInsert;
export type Alert = typeof alerts.$inferSelect;

export type InsertPrediction = typeof predictions.$inferInsert;
export type Prediction = typeof predictions.$inferSelect;

// Zod schemas
export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadings).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});
