import os
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .controllers.math_controller import router as math_router
from .db.database import init_db, close_db
from .utils.logger import configure_logging, get_logger

# Configure logging
configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    
    # Startup
    logger.info("Starting Math Microservice")

    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized successfully")

        yield

    finally:
        # Shutdown
        logger.info("Shutting down Math Microservice")
        await close_db()
        logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Math Microservice",
    description="""
    A production-ready microservice for mathematical operations.

    ## Features

    * **Power Operations**: Calculate base^exponent
    * **Fibonacci Numbers**: Calculate nth Fibonacci number (0-1000)
    * **Factorial**: Calculate n! (0-170)
    * **Request Persistence**: All requests are logged to database
    * **Caching**: Results are cached for improved performance
    * **Statistics**: View service usage statistics
    * **Request History**: View historical requests with filtering

    ## Operations

    The service supports three mathematical operations:

    1. **Power**: Calculate base raised to exponent
    2. **Fibonacci**: Calculate the nth number in Fibonacci sequence
    3. **Factorial**: Calculate factorial of a number

    All operations are cached for improved performance and all requests
    are persisted to the database for monitoring and analytics.
    """,
    version="1.0.0",
    contact={
        "name": "Math Microservice Team",
        "email": "support@mathservice.example.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Add processing time header to all responses.
    """
    import time
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all incoming requests.
    """
    start_time = datetime.utcnow()

    # Log request
    logger.info(
        "Incoming request",
        method=request.method,
        url=str(request.url),
        client_ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", ""),
        timestamp=start_time.isoformat()
    )

    response = await call_next(request)

    # Log response
    end_time = datetime.utcnow()
    duration = (end_time - start_time).total_seconds() * 1000

    logger.info(
        "Request completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        duration_ms=round(duration, 2)
    )

    return response


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """
    Custom 404 handler.
    """
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": f"The endpoint {request.url.path} was not found.",
            "timestamp": datetime.utcnow().isoformat(),
            "available_endpoints": [
                "/docs",
                "/health",
                "/operations",
                "/math/power",
                "/math/fibonacci",
                "/math/factorial",
                "/history",
                "/stats"
            ]
        }
    )


@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    """
    Custom validation error handler.
    """
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "Request validation failed",
            "details": exc.detail if hasattr(exc, 'detail') else str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc: Exception):
    """
    Custom 500 error handler.
    """
    logger.error(
        "Internal server error",
        error=str(exc),
        path=request.url.path,
        method=request.method
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# Include routers
app.include_router(math_router, tags=["Mathematical Operations"])


@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "service": "Math Microservice",
        "version": "1.0.0",
        "description": "Production-ready API for mathematical operations",
        "endpoints": {
            "documentation": "/docs",
            "health": "/health",
            "operations": "/operations",
            "power": "/math/power",
            "fibonacci": "/math/fibonacci",
            "factorial": "/math/factorial",
            "history": "/history",
            "statistics": "/stats",
            "cache": "/cache"
        },
        "features": [
            "Request persistence",
            "Result caching",
            "Comprehensive logging",
            "Error handling",
            "Input validation",
            "Performance monitoring"
        ],
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn

    # Development server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )