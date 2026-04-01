# SmartShelf OS: Futuristic AI Industrial Dashboard

SmartShelf OS is a high-fidelity, AI-powered monitoring system designed for real-time tracking of temperature-sensitive industrial assets. It transforms raw telemetry into actionable strategic intelligence through a premium, glassmorphic "Command Center" interface.

## 🚀 Key Features

- **Neural Intelligence Matrix**: AI-driven shelf-life predictions and tactical directives for mission-critical decision making.
- **Deep-Space Design System**: A sophisticated dark-themed UI featuring high-end glassmorphism (`backdrop-blur`), neon signal logic, and tactile micro-interactions.
- **Mission-Critical Alerts**: Visual emerald (Safe), amber (Warning), and crimson (Critical Pulse) status matrix for immediate anomaly detection.
- **Strategic Reporting**: Integrated `jspdf` engine for professional-grade PDF telemetry export and offline intelligence audits.
- **Real-Time Telemetry**: Dynamic tracking of global asset coordinates, thermal sensor arrays, and system resilience via interactive Chart.js visualizations.
- **Simulation Core**: Interactive thermal stress control panel to model environmental risk scenarios and system response.

## 🛠️ Technical Architecture

- **Frontend**: React (Vite), Chart.js, jspdf (CDN Integration), CSS3 (Glassmorphism & Advanced Shadows).
- **Backend**: FastAPI (Python), MongoDB (Persistent Telemetry).
- **Security**: Mock-Auth portal for secure operator initialization.

## 🏁 Setup Instructions

### 1. Database Initialization
Ensure MongoDB is running locally on the default port (`27017`).

### 2. Backend Environment
```bash
cd backend
# Create and activate virtual environment
./venv/bin/uvicorn app:app --reload --port 8001
```

### 3. Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### 4. Access
Navigate to `http://localhost:5173` to initialize the SmartShelf OS Command Center.

## 🛡️ License
Proprietary Intellectual Property of the SmartShelf OS Development Team.
