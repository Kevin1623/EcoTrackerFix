import { type InsertAlert } from "@shared/schema";
import { z } from "zod";

// ESP8266 sensor data validation schema
const espSensorDataSchema = z.object({
  temperature: z.number().min(-40).max(80),
  humidity: z.number().min(0).max(100),
  airQuality: z.number().min(0).max(1000),
  timestamp: z.number().optional(),
});

export type ESPSensorData = z.infer<typeof espSensorDataSchema>;

// Validate incoming sensor data from ESP8266
export function validateSensorData(data: unknown): ESPSensorData {
  return espSensorDataSchema.parse(data);
}

// Threshold configurations
const THRESHOLDS = {
  temperature: {
    min: 18,
    max: 28,
    critical: 35,
  },
  humidity: {
    min: 40,
    max: 80,
    critical: 90,
  },
  airQuality: {
    good: 100,
    moderate: 150,
    unhealthy: 200,
  },
};

// Check sensor values against thresholds and generate alerts
export async function checkThresholds(
  deviceId: string,
  data: ESPSensorData
): Promise<InsertAlert[]> {
  const alerts: InsertAlert[] = [];

  // Temperature alerts
  if (data.temperature < THRESHOLDS.temperature.min) {
    alerts.push({
      deviceId,
      type: 'temperature',
      severity: 'warning',
      title: 'Low Temperature Alert',
      message: `Temperature dropped to ${data.temperature}°C, below minimum threshold of ${THRESHOLDS.temperature.min}°C`,
      value: data.temperature,
      threshold: THRESHOLDS.temperature.min,
    });
  } else if (data.temperature > THRESHOLDS.temperature.critical) {
    alerts.push({
      deviceId,
      type: 'temperature',
      severity: 'critical',
      title: 'Critical Temperature Alert',
      message: `Temperature reached ${data.temperature}°C, exceeding critical threshold of ${THRESHOLDS.temperature.critical}°C`,
      value: data.temperature,
      threshold: THRESHOLDS.temperature.critical,
    });
  } else if (data.temperature > THRESHOLDS.temperature.max) {
    alerts.push({
      deviceId,
      type: 'temperature',
      severity: 'warning',
      title: 'High Temperature Alert',
      message: `Temperature reached ${data.temperature}°C, above maximum threshold of ${THRESHOLDS.temperature.max}°C`,
      value: data.temperature,
      threshold: THRESHOLDS.temperature.max,
    });
  }

  // Humidity alerts
  if (data.humidity < THRESHOLDS.humidity.min) {
    alerts.push({
      deviceId,
      type: 'humidity',
      severity: 'info',
      title: 'Low Humidity Alert',
      message: `Humidity dropped to ${data.humidity}%, below minimum threshold of ${THRESHOLDS.humidity.min}%`,
      value: data.humidity,
      threshold: THRESHOLDS.humidity.min,
    });
  } else if (data.humidity > THRESHOLDS.humidity.critical) {
    alerts.push({
      deviceId,
      type: 'humidity',
      severity: 'critical',
      title: 'Critical Humidity Alert',
      message: `Humidity reached ${data.humidity}%, exceeding critical threshold of ${THRESHOLDS.humidity.critical}%`,
      value: data.humidity,
      threshold: THRESHOLDS.humidity.critical,
    });
  } else if (data.humidity > THRESHOLDS.humidity.max) {
    alerts.push({
      deviceId,
      type: 'humidity',
      severity: 'warning',
      title: 'High Humidity Alert',
      message: `Humidity reached ${data.humidity}%, above maximum threshold of ${THRESHOLDS.humidity.max}%`,
      value: data.humidity,
      threshold: THRESHOLDS.humidity.max,
    });
  }

  // Air quality alerts
  if (data.airQuality > THRESHOLDS.airQuality.unhealthy) {
    alerts.push({
      deviceId,
      type: 'air_quality',
      severity: 'critical',
      title: 'Unhealthy Air Quality',
      message: `Air quality index reached ${data.airQuality}, indicating unhealthy air conditions`,
      value: data.airQuality,
      threshold: THRESHOLDS.airQuality.unhealthy,
    });
  } else if (data.airQuality > THRESHOLDS.airQuality.moderate) {
    alerts.push({
      deviceId,
      type: 'air_quality',
      severity: 'warning',
      title: 'Moderate Air Quality',
      message: `Air quality index is ${data.airQuality}, indicating moderate air quality`,
      value: data.airQuality,
      threshold: THRESHOLDS.airQuality.moderate,
    });
  }

  return alerts;
}

// Convert air quality index to human-readable status
export function getAirQualityStatus(aqi: number): string {
  if (aqi <= THRESHOLDS.airQuality.good) return 'Good';
  if (aqi <= THRESHOLDS.airQuality.moderate) return 'Moderate';
  if (aqi <= THRESHOLDS.airQuality.unhealthy) return 'Unhealthy for Sensitive Groups';
  return 'Unhealthy';
}

// Get air quality color for UI
export function getAirQualityColor(aqi: number): string {
  if (aqi <= THRESHOLDS.airQuality.good) return 'green';
  if (aqi <= THRESHOLDS.airQuality.moderate) return 'yellow';
  if (aqi <= THRESHOLDS.airQuality.unhealthy) return 'orange';
  return 'red';
}
