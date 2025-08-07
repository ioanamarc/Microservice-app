# Math Microservice
## Core Features

### Backend (FastAPI Microservice)
- **Mathematical Operations API**: Three core mathematical operations with input validation
  - Power calculations (base^exponent)
  - Fibonacci sequence generation (0-1000)
  - Factorial calculations (0-170)
- **REST API Architecture**: Clean, RESTful endpoints following HTTP standards
- **Database Persistence**: Complete request/response logging with SQLAlchemy async ORM
- **Smart Caching System**: Automatic result caching with configurable TTL and hit tracking
- **Request History**: Comprehensive audit trail with filtering and pagination
- **Service Statistics**: Real-time performance metrics and usage analytics  
- **Health Monitoring**: Built-in health checks and service status endpoints
- **Structured Error Handling**: Comprehensive validation with detailed error responses
- **Production Logging**: Structured logging with configurable output formats
- **Input Validation**: Pydantic schemas ensuring data integrity
- **Async Operations**: Full async/await implementation for optimal performance

### Frontend (React Application)
- **Interactive Calculators**
- **Real-time Results**
- **Request History Viewer**
- **Statistics Dashboard**
- **Cache Viewer**
- **Responsive Design**
- **Error Boundaries**

## Project Architecture

```
math-microservice/
├── backend/                    # FastAPI microservice
│   ├── app/
│   │   ├── controllers/        # API endpoint controllers (MVC Pattern)
│   │   │   └── math_controller.py
│   │   ├── services/           # Business logic layer
│   │   │   └── math_service.py
│   │   ├── models/             # SQLAlchemy database models
│   │   │   └── request_model.py
│   │   ├── schemas/            # Pydantic validation schemas
│   │   │   └── math_schemas.py
│   │   ├── db/                 # Database configuration & async setup
│   │   │   └── database.py
│   │   ├── utils/              # Utility functions & structured logging
│   │   │   └── logger.py
│   │   └── main.py             # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile             # Docker containerization
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── operations/     # Mathematical operation calculators
│   │   │   ├── monitoring/     # Statistics and history dashboards
│   │   │   ├── layout/         # Application layout components
│   │   │   └── common/         # Reusable UI components
│   │   ├── services/           # API client implementation
│   │   │   └── api.js
│   │   ├── hooks/              # Custom React hooks
│   │   │   └── useApi.js
│   │   ├── utils/              # Helper functions and formatters
│   │   │   └── formatters.js
│   │   └── styles/             # CSS and Tailwind configuration
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js          # Vite build configuration
│   └── tailwind.config.js      # Tailwind CSS configuration
├── docker-compose.yml          # Multi-container orchestration
└── README.md
```

## Technology Stack

### Backend Technologies
- **FastAPI**: Modern microframework with automatic API documentation
- **Pydantic**: Data validation and serialization with type hints
- **SQLAlchemy**: Async ORM for database operations
- **SQLite**: Database persistence with migration support
- **Uvicorn**: ASGI server for production deployment
- **Structlog**: Structured logging for observability

### Frontend Technologies
- **React**: Component-based UI library
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

## Prerequisites

Before running this application, ensure you have:
- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **Docker** (optional, for containerized deployment)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/math-microservice.git
cd math-microservice
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/` | API information and available endpoints | - |
| `GET` | `/health` | Health check endpoint | - |
| `GET` | `/docs` | Interactive API documentation (Swagger UI) | - |
| `GET` | `/operations` | List available mathematical operations | - |
| `POST` | `/math/power` | Calculate base^exponent | `{"base": number, "exponent": number}` |
| `POST` | `/math/fibonacci` | Calculate nth Fibonacci number (0-1000) | `{"n": integer}` |
| `POST` | `/math/factorial` | Calculate factorial (0-170) | `{"n": integer}` |
| `GET` | `/history` | Get request history with filtering | Query params: `limit`, `operation`, `success_only` |
| `GET` | `/stats` | Get comprehensive service statistics | - |
| `GET` | `/cache` | View cached results and hit rates | Query params: `limit`, `operation` |

## Key Implementation Details

### MVC Pattern Implementation
The backend follows a clean MVC architecture:
- **Models** (`models/`): SQLAlchemy database models for persistence
- **Views** (`controllers/`): FastAPI endpoints handling HTTP requests/responses  
- **Controllers** (`services/`): Business logic for mathematical operations

### Pydantic Integration
All API endpoints use Pydantic schemas for:
- Request validation with type checking
- Response serialization
- Automatic OpenAPI documentation generation
- Error handling with detailed validation messages

### Database Architecture
- **Async SQLAlchemy**: Non-blocking database operations
- **Request Logging**: Every API call is persisted with parameters, results, and metadata
- **Caching System**: Computed results are cached with automatic expiration and hit tracking
- **Migration Support**: Database schema versioning capabilities

### Performance Features
- **Async Operations**: Full async/await implementation throughout the stack
- **Result Caching**: Intelligent caching reduces computation time for repeated requests
- **Connection Pooling**: Efficient database connection management
- **Request Monitoring**: Performance metrics tracking and analysis

## Docker Deployment

### Using Docker Compose
```bash
# Build and run the complete stack
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### Manual Docker Build
```bash
# Backend only
cd backend
docker build -t math-microservice-backend .
docker run -p 8000:8000 math-microservice-backend

# Frontend only  
cd frontend
docker build -t math-microservice-frontend .
docker run -p 3000:3000 math-microservice-frontend
```

## Production Configuration

### Environment Variables
```bash
# Backend configuration
DATABASE_URL=postgresql://user:password@localhost/mathservice
LOG_LEVEL=INFO
LOG_FORMAT=json
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Frontend configuration
REACT_APP_API_URL=http://localhost:8000
```

### Performance Monitoring
The application includes comprehensive monitoring:
- Request/response logging with execution times
- Cache hit rates and efficiency metrics
- Error rate tracking and alerting
- Database query performance analysis
