from datetime import datetime
from typing import Optional, Union, Any
from pydantic import BaseModel, Field, validator


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str = "healthy"
    timestamp: datetime
    version: str = "1.0.0"


class MathOperationRequest(BaseModel):
    """Base schema for mathematical operation requests."""
    pass


class PowerRequest(MathOperationRequest):
    """Schema for power operation request."""
    base: Union[int, float] = Field(..., description="The base number")
    exponent: Union[int, float] = Field(..., description="The exponent")

    @validator('base', 'exponent')
    def validate_numbers(cls, v):
        if not isinstance(v, (int, float)):
            raise ValueError('Must be a number')
        return v


class FibonacciRequest(MathOperationRequest):
    """Schema for Fibonacci operation request."""
    n: int = Field(..., ge=0, le=1000, description="The position in Fibonacci sequence (0-1000)")

    @validator('n')
    def validate_fibonacci_input(cls, v):
        if v < 0:
            raise ValueError('Fibonacci position must be non-negative')
        if v > 1000:
            raise ValueError('Fibonacci position must not exceed 1000 for performance reasons')
        return v


class FactorialRequest(MathOperationRequest):
    """Schema for factorial operation request."""
    n: int = Field(..., ge=0, le=170, description="The number to calculate factorial (0-170)")

    @validator('n')
    def validate_factorial_input(cls, v):
        if v < 0:
            raise ValueError('Factorial input must be non-negative')
        if v > 170:
            raise ValueError('Factorial input must not exceed 170 to prevent overflow')
        return v


class MathOperationResponse(BaseModel):
    """Base schema for mathematical operation responses."""
    operation: str
    parameters: dict
    result: Union[int, float, str]
    execution_time_ms: float
    timestamp: datetime
    cached: bool = False


class PowerResponse(MathOperationResponse):
    """Schema for power operation response."""
    operation: str = "power"


class FibonacciResponse(MathOperationResponse):
    """Schema for Fibonacci operation response."""
    operation: str = "fibonacci"


class FactorialResponse(MathOperationResponse):
    """Schema for factorial operation response."""
    operation: str = "factorial"


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str
    message: str
    timestamp: datetime
    request_id: Optional[str] = None


class MathRequestHistory(BaseModel):
    """Schema for request history."""
    id: int
    operation: str
    parameters: dict
    result: Optional[Any]
    execution_time_ms: Optional[float]
    success: bool
    error_message: Optional[str]
    timestamp: datetime
    client_ip: Optional[str]

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    """Schema for service statistics."""
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_execution_time_ms: float
    operations_count: dict
    cache_hit_rate: float
    cache_entries_by_operation: dict


class CacheEntryInfo(BaseModel):
    """Schema for cache entry information."""
    id: int
    operation: str
    parameters: dict
    result: Any
    created_at: datetime
    expires_at: Optional[datetime]
    hit_count: int

    class Config:
        from_attributes = True