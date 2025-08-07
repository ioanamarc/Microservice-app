import json
import time
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from ..db.database import get_db
from ..models.request_model import MathRequest, CacheEntry
from ..schemas.math_schemas import (
    PowerRequest, PowerResponse,
    FibonacciRequest, FibonacciResponse,
    FactorialRequest, FactorialResponse,
    ErrorResponse, MathRequestHistory, StatsResponse,
    HealthResponse, CacheEntryInfo
)
from ..services.math_service import MathService
from ..utils.logger import get_logger, log_request_info

# Initialize router and services
router = APIRouter()
math_service = MathService()
logger = get_logger(__name__)


def get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def log_and_persist_request(
    db: AsyncSession,
    request: Request,
    operation: str,
    parameters: dict,
    result: any = None,
    execution_time_ms: float = None,
    success: bool = True,
    error_message: str = None
) -> MathRequest:
    """
    Log and persist request information to database.
    """
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "")

    # Log the request
    log_request_info(
        operation=operation,
        parameters=parameters,
        result=result,
        execution_time_ms=execution_time_ms,
        success=success,
        error=error_message,
        client_ip=client_ip
    )

    # Persist to database
    try:
        db_request = MathRequest(
            operation=operation,
            parameters=json.dumps(parameters),
            result=json.dumps(result) if result is not None else None,
            execution_time_ms=execution_time_ms,
            success=success,
            error_message=error_message,
            client_ip=client_ip,
            user_agent=user_agent
        )

        db.add(db_request)
        await db.commit()
        await db.refresh(db_request)

        return db_request

    except Exception as e:
        logger.error("Failed to persist request", error=str(e))
        await db.rollback()
        raise


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0"
    )


@router.get("/operations")
async def get_available_operations():
    """
    Get list of available mathematical operations.
    """
    operations = math_service.get_available_operations()
    return {
        "operations": operations,
        "total": len(operations),
        "timestamp": datetime.utcnow()
    }


@router.post("/math/power", response_model=PowerResponse)
async def calculate_power(
    request_data: PowerRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate base^exponent.

    - **base**: The base number
    - **exponent**: The exponent
    """
    start_time = time.perf_counter()
    operation = "power"
    parameters = {"base": request_data.base, "exponent": request_data.exponent}

    try:
        result, execution_time_ms, cached = await math_service.execute_operation(
            db, operation, parameters
        )

        # Log and persist request
        await log_and_persist_request(
            db, request, operation, parameters, result, execution_time_ms, True
        )

        return PowerResponse(
            operation=operation,
            parameters=parameters,
            result=result,
            execution_time_ms=execution_time_ms,
            timestamp=datetime.utcnow(),
            cached=cached
        )

    except ValueError as e:
        error_msg = str(e)
        execution_time_ms = (time.perf_counter() - start_time) * 1000

        await log_and_persist_request(
            db, request, operation, parameters, None, execution_time_ms, False, error_msg
        )

        raise HTTPException(status_code=400, detail=error_msg)

    except Exception as e:
        error_msg = f"Internal server error: {str(e)}"
        execution_time_ms = (time.perf_counter() - start_time) * 1000

        await log_and_persist_request(
            db, request, operation, parameters, None, execution_time_ms, False, error_msg
        )

        logger.error("Unexpected error in power calculation", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/math/fibonacci", response_model=FibonacciResponse)
async def calculate_fibonacci(
    request_data: FibonacciRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate the nth Fibonacci number.

    - **n**: Position in Fibonacci sequence (0-1000)
    """
    start_time = time.perf_counter()
    operation = "fibonacci"
    parameters = {"n": request_data.n}

    try:
        result, execution_time_ms, cached = await math_service.execute_operation(
            db, operation, parameters
        )

        await log_and_persist_request(
            db, request, operation, parameters, result, execution_time_ms, True
        )

        return FibonacciResponse(
            operation=operation,
            parameters=parameters,
            result=result,
            execution_time_ms=execution_time_ms,
            timestamp=datetime.utcnow(),
            cached=cached
        )

    except ValueError as e:
        error_msg = str(e)
        execution_time_ms = (time.perf_counter() - start_time) * 1000

        await log_and_persist_request(
            db, request, operation, parameters, None, execution_time_ms, False, error_msg
        )

        raise HTTPException(status_code=400, detail=error_msg)

    except Exception as e:
        error_msg = f"Internal server error: {str(e)}"
        execution_time_ms = (time.perf_counter() - start_time) * 1000

        await log_and_persist_request(
            db, request, operation, parameters, None, execution_time_ms, False, error_msg
        )

        logger.error("Unexpected error in fibonacci calculation", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/math/factorial", response_model=FactorialResponse)
async def calculate_factorial(
    request_data: FactorialRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculate n! (factorial).

    - **n**: Number to calculate factorial (0-170)
    """
    start_time = time.perf_counter()
    operation = "factorial"
    parameters = {"n": request_data.n}

    try:
        result, execution_time_ms, cached = await math_service.execute_operation(
            db, operation, parameters
        )

        await log_and_persist_request(
            db, request, operation, parameters, result, execution_time_ms, True
        )

        return FactorialResponse(
            operation=operation,
            parameters=parameters,
            result=result,
            execution_time_ms=execution_time_ms,
            timestamp=datetime.utcnow(),
            cached=cached
        )

    except ValueError as e:
        error_msg = str(e)
        execution_time_ms = (time.perf_counter() - start_time) * 1000

        await log_and_persist_request(
            db, request, operation, parameters, None, execution_time_ms, False, error_msg
        )

        raise HTTPException(status_code=400, detail=error_msg)

    except Exception as e:
        error_msg = f"Internal server error: {str(e)}"
        execution_time_ms = (time.perf_counter() - start_time) * 1000

        await log_and_persist_request(
            db, request, operation, parameters, None, execution_time_ms, False, error_msg
        )

        logger.error("Unexpected error in factorial calculation", error=str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/history", response_model=List[MathRequestHistory])
async def get_request_history(
    limit: int = Query(default=50, le=1000, description="Number of records to return"),
    operation: Optional[str] = Query(default=None, description="Filter by operation type"),
    success_only: bool = Query(default=False, description="Show only successful requests"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get request history with optional filtering.
    """
    try:
        query = select(MathRequest).order_by(desc(MathRequest.timestamp))

        if operation:
            query = query.where(MathRequest.operation == operation)

        if success_only:
            query = query.where(MathRequest.success == True)

        query = query.limit(limit)

        result = await db.execute(query)
        requests = result.scalars().all()

        # Convert to response format
        history = []
        for req in requests:
            history.append(MathRequestHistory(
                id=req.id,
                operation=req.operation,
                parameters=json.loads(req.parameters),
                result=json.loads(req.result) if req.result else None,
                execution_time_ms=req.execution_time_ms,
                success=req.success,
                error_message=req.error_message,
                timestamp=req.timestamp,
                client_ip=req.client_ip
            ))

        return history

    except Exception as e:
        logger.error("Failed to retrieve request history", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve history")


@router.get("/stats", response_model=StatsResponse)
async def get_service_statistics(db: AsyncSession = Depends(get_db)):
    """
    Get service usage statistics.
    """
    try:
        # Total requests
        total_result = await db.execute(select(func.count(MathRequest.id)))
        total_requests = total_result.scalar() or 0

        # Successful requests
        success_result = await db.execute(
            select(func.count(MathRequest.id)).where(MathRequest.success == True)
        )
        successful_requests = success_result.scalar() or 0

        failed_requests = total_requests - successful_requests

        # Average execution time
        avg_time_result = await db.execute(
            select(func.avg(MathRequest.execution_time_ms)).where(
                MathRequest.success == True,
                MathRequest.execution_time_ms.isnot(None)
            )
        )
        avg_execution_time = avg_time_result.scalar() or 0.0

        # Operations count
        ops_result = await db.execute(
            select(MathRequest.operation, func.count(MathRequest.id))
            .group_by(MathRequest.operation)
        )
        operations_count = dict(ops_result.all())

        # Simple cache hit rate calculation (cached operations have 0 execution time)
        cached_result = await db.execute(
            select(func.count(MathRequest.id)).where(
                MathRequest.execution_time_ms == 0,
                MathRequest.success == True
            )
        )
        cached_requests = cached_result.scalar() or 0
        cache_hit_rate = (cached_requests / successful_requests * 100) if successful_requests > 0 else 0.0

        # Cache entries by operation
        cache_ops_result = await db.execute(
            select(CacheEntry.operation, func.count(CacheEntry.id))
            .group_by(CacheEntry.operation)
        )
        cache_entries_by_operation = dict(cache_ops_result.all())

        return StatsResponse(
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            average_execution_time_ms=round(avg_execution_time, 2),
            operations_count=operations_count,
            cache_hit_rate=round(cache_hit_rate, 2),
            cache_entries_by_operation=cache_entries_by_operation
        )

    except Exception as e:
        logger.error("Failed to retrieve service statistics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


@router.get("/cache", response_model=List[CacheEntryInfo])
async def get_cache_entries(
    limit: int = Query(default=50, le=1000, description="Number of cache entries to return"),
    operation: Optional[str] = Query(default=None, description="Filter by operation type"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get cached entries with optional filtering.
    """
    try:
        query = select(CacheEntry).order_by(desc(CacheEntry.created_at))

        if operation:
            query = query.where(CacheEntry.operation == operation)

        query = query.limit(limit)

        result = await db.execute(query)
        cache_entries = result.scalars().all()

        # Convert to response format
        entries = []
        for entry in cache_entries:
            entries.append(CacheEntryInfo(
                id=entry.id,
                operation=entry.operation,
                parameters=json.loads(entry.parameters),
                result=json.loads(entry.result),
                created_at=entry.created_at,
                expires_at=entry.expires_at,
                hit_count=entry.hit_count
            ))

        return entries

    except Exception as e:
        logger.error("Failed to retrieve cache entries", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve cache entries")