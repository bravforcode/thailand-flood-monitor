# Thailand Flood Monitor

> Real-time flood monitoring system with IoT sensors, ML predictions, and citizen reporting.

## Overview

Thailand Flood Monitor is a comprehensive disaster management platform that combines real-time IoT sensor data, machine learning predictions, and citizen reporting to provide actionable flood intelligence.

## Architecture

```
┌─────────────────────────────────────────────┐
│  React Frontend + Mobile (Capacitor)        │
├─────────────────────────────────────────────┤
│  TensorFlow.js (Client-side ML)             │
├─────────────────────────────────────────────┤
│  Leaflet Maps + D3 Visualizations           │
├─────────────────────────────────────────────┤
│  Real-time Data Pipeline                    │
├─────────────────────────────────────────────┤
│  IoT Sensors + Citizen Reports              │
└─────────────────────────────────────────────┘
```

## Key Features

### Real-Time Monitoring
- **9 sensor types:** Water level, rainfall, temperature, humidity, pressure, wind, flow, quality, seismic
- Live map visualization with Leaflet
- Anomaly detection with TensorFlow.js
- Battery and signal strength monitoring

### Machine Learning
- **TensorFlow.js** for client-side predictions
- Real-time flood risk assessment
- Historical data analysis
- Predictive modeling

### Citizen Reporting
- Real-time citizen status tracking
- Emergency contact management
- Evacuation plan coordination
- Special needs tracking

### Supply Chain Management
- Food, water, medicine, equipment tracking
- Multi-modal transport (truck, boat, helicopter, train)
- Real-time location tracking
- Priority-based allocation

### Volunteer Management
- Skill-based assignment
- Availability tracking
- Hours worked and rating system
- Certification verification

## Data Models

### Sensor Data
```typescript
interface SensorData {
  id: string;
  type: 'water' | 'rainfall' | 'temperature' | 'humidity' | 'pressure' | 'wind' | 'flow' | 'quality' | 'seismic';
  value: number;
  status: 'online' | 'offline' | 'warning' | 'critical';
  coordinates: [number, number];
  predictions: number[];
  anomalyDetected: boolean;
}
```

### Medical Facility
```typescript
interface MedicalFacility {
  type: 'hospital' | 'clinic' | 'field_hospital' | 'pharmacy';
  capacity: number;
  availableBeds: number;
  emergencyRoom: boolean;
  bloodBank: boolean;
}
```

## Quick Start

```bash
# Clone
git clone https://github.com/bravforcode/thailand-flood-monitor.git
cd thailand-flood-monitor

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Recharts, D3.js
- **Maps:** Leaflet + React-Leaflet
- **ML:** TensorFlow.js
- **3D:** Three.js
- **Mobile:** Capacitor
- **Testing:** Jest, React Testing Library

## Visualizations

- **Real-time charts:** Line, Area, Bar, Pie, Radar, Composed
- **Interactive maps:** CircleMarker, Polyline, Polygon
- **3D terrain:** Three.js integration
- **Sankey diagrams:** Supply chain flow
- **Treemap:** Resource allocation

## License

MIT
