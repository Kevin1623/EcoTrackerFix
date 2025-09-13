# Overview

EcoTracker is a real-time environmental monitoring system that combines IoT hardware (ESP8266) with web-based analytics and machine learning predictions. The system collects sensor data from DHT11 (temperature/humidity) and MQ135 (air quality) sensors, processes this data through a full-stack web application, and provides users with real-time monitoring, historical analysis, and predictive insights for environmental conditions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based UI built with React 18 and TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **Routing**: Wouter for lightweight client-side routing with authentication-aware route protection
- **State Management**: TanStack Query (React Query) for server state management with real-time data synchronization
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Charts**: Chart.js for data visualization and real-time sensor data displays
- **Real-time Updates**: WebSocket integration for live sensor data streaming

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **Authentication**: Replit Auth integration using OpenID Connect for secure user authentication
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **WebSocket Server**: Real-time bidirectional communication for live sensor updates
- **API Structure**: RESTful endpoints for devices, sensors, alerts, and predictions with authentication middleware

## Database Schema
- **Users Table**: Stores user profiles and authentication data (mandatory for Replit Auth)
- **Sessions Table**: Session storage for authentication (mandatory for Replit Auth)
- **Devices Table**: ESP8266 device registration and status tracking
- **Sensor Readings**: Time-series data for temperature, humidity, and air quality measurements
- **Alerts**: Threshold-based alert system for environmental conditions
- **Predictions**: Machine learning prediction results storage

## Machine Learning Pipeline
- **Linear Regression Model**: Simple predictive model for air quality forecasting
- **Feature Engineering**: Time-based features, sensor averages, and trend analysis
- **Real-time Prediction**: On-demand prediction generation based on historical sensor data
- **Model Performance Tracking**: Accuracy metrics and feature importance analysis

## Real-time Data Flow
- **ESP8266 Integration**: HTTP and WebSocket endpoints for sensor data ingestion
- **Data Validation**: Zod schema validation for incoming sensor data
- **Threshold Monitoring**: Automated alert generation based on configurable environmental thresholds
- **Live Updates**: WebSocket broadcasting of new sensor readings to connected clients

## Security and Authentication
- **OIDC Integration**: Secure authentication flow using Replit's OpenID Connect provider
- **Session-based Auth**: Persistent user sessions with PostgreSQL storage
- **Route Protection**: Authentication middleware for API endpoints and client-side route guards
- **Data Isolation**: User-scoped data access with proper authorization checks

## Development and Deployment
- **Development Stack**: Hot module replacement with Vite, TypeScript checking, and development error overlays
- **Database Migrations**: Drizzle Kit for schema management and database migrations
- **Build Process**: Separate client (Vite) and server (esbuild) build processes for optimized production deployment
- **Environment Configuration**: Environment variable management for database connections and authentication

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL database hosting with connection pooling
- **PostgreSQL**: Primary database for all application data storage

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider for user management
- **Passport.js**: Authentication middleware for Express.js integration

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide Icons**: Comprehensive icon library for UI elements

## Development Tools
- **Replit Platform**: Development environment with integrated database provisioning
- **TypeScript**: Static type checking for both client and server code
- **ESLint/Prettier**: Code formatting and linting (implied by project structure)

## Runtime Dependencies
- **Node.js**: Server runtime environment
- **WebSocket (ws)**: Real-time communication library
- **Chart.js**: Data visualization for sensor readings and predictions
- **Date-fns**: Date manipulation and formatting utilities