# MediOps AI

AI-powered hospital operations intelligence and predictive analytics platform built using FastAPI, Next.js, TypeScript, and real-time simulation pipelines.

---

# Overview

MediOps AI is a futuristic healthcare operations platform designed to simulate and optimize real-time hospital workflows.

The system combines:
- Predictive forecasting
- Operational anomaly detection
- ICU/resource optimization
- Patient flow intelligence
- AI-driven decision recommendations
- Executive analytics dashboards

The platform simulates how modern hospitals can use AI to reduce bottlenecks, improve throughput, and enhance operational efficiency.

---

# Core Features

## Real-Time Hospital Monitoring
- Emergency admissions tracking
- Ambulance telemetry
- Staff allocation visibility
- Live triage queues

## AI Forecasting Engine
- Emergency admission forecasting
- XGBoost/LSTM simulation pipelines
- Confidence interval projections
- Resource load prediction

## Decision Intelligence Engine
- AI-generated operational recommendations
- ICU overflow mitigation
- Staff redistribution logic
- Risk score computation

## Anomaly Detection Center
- Billing anomaly detection
- ICU overload alerts
- Wait-time spike detection
- Operational risk scoring

## Resource Optimization
- ICU bed tracking
- Ventilator allocation
- Oxygen supply monitoring
- Emergency staff utilization

## Patient Flow Intelligence
- Department transition visualization
- Capacity bottleneck mapping
- Flow-network simulation

## AI Operations Assistant
- Natural language operational querying
- Executive summaries
- Real-time analytics responses

## Reporting Module
- Executive operation summaries
- Resource audit reports
- Printable compliance exports

---

# Tech Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS

## Backend
- FastAPI
- Python
- SQLite

## AI / Simulation
- Predictive forecasting engine
- Operational simulation models
- Rule-based anomaly detection

---

# Project Architecture

```text
Frontend (Next.js)
        ↓
FastAPI Backend APIs
        ↓
Operational Intelligence Engine
        ↓
Forecasting + Anomaly Pipelines
        ↓
SQLite Simulation Database
```

---

# Folder Structure

```text
MediOps/
│
├── backend/
│   ├── main.py
│   ├── forecasting.py
│   ├── anomaly_detector.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── seed.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/sadatsheikh78/mediops-ai.git
cd mediops-ai
```

---

# Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python seed.py

uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Future Enhancements

- Real WebSocket telemetry pipelines
- Multi-hospital distributed simulations
- ML-based anomaly classification
- Role-based authentication
- Cloud deployment pipeline
- Live operational database integration

---

# Screenshots

## Dashboard
(Add screenshots here)

## Monitoring System
(Add screenshots here)

## Forecasting Engine
(Add screenshots here)

---

# Author

Mohammad Sadat Sheikh

GitHub:
https://github.com/sadatsheikh78

---

# License

This project is developed for educational, research, and portfolio purposes.
