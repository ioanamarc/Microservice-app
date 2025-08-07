# Math Microservice - Full Stack Application

## 🚀 Features

### 🔧 Backend (FastAPI)
- ** Mathematical Operations**: Power, Fibonacci, and Factorial calculations
- ** REST API**
- ** Database Persistence**
- ** Smart Caching**
- ** Request History**
- ** Service Statistics**: Real-time monitoring of usage and performance metrics
- ** Error Handling**: Comprehensive validation and structured error responses
- ** Health Monitoring**: Built-in health checks and service status endpoints

### 🎨 Frontend (React)
- ** Interactive Calculators**
- ** Real-time Results**
- ** Request History**
- ** Statistics Dashboard**
- ** Cache Viewer**
- ** Responsive Design**
- ** Error Boundaries**

## 📁 Project Structure

```
math-microservice/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── controllers/        # API endpoint controllers
│   │   │   └── math_controller.py
│   │   ├── services/           # Business logic layer
│   │   │   └── math_service.py
│   │   ├── models/             # Database models
│   │   │   └── request_model.py
│   │   ├── schemas/            # Pydantic schemas
│   │   │   └── math_schemas.py
│   │   ├── db/                 # Database configuration
│   │   │   └── database.py
│   │   ├── utils/              # Utility functions
│   │   │   └── logger.py
│   │   └── main.py             # Application entry point
│   ├── requirements.txt        # Python dependencies
│   └── README.md
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── operations/     # Calculator components
│   │   │   ├── monitoring/     # Monitoring dashboards
│   │   │   ├── layout/         # Layout components
│   │   │   └── common/         # Shared components
│   │   ├── services/           # API clients
│   │   │   └── api.js
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # CSS styles
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Tailwind configuration
├── README.md                   
└── .gitignore
```

## 📋 Prerequisites

Before running this application, make sure you have:

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **Git** for cloning the repository

## 🚦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/math-microservice.git
cd math-microservice
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information and available endpoints |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/docs` | Interactive API documentation (Swagger UI) |
| `POST` | `/math/power` | Calculate base^exponent |
| `POST` | `/math/fibonacci` | Calculate nth Fibonacci number |
| `POST` | `/math/factorial` | Calculate factorial |
| `GET` | `/history` | Get request history with filtering |
| `GET` | `/stats` | Get service statistics |
| `GET` | `/cache` | View cached results |


## 📦 Production Deployment

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```


