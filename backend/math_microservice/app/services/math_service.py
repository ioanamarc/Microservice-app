import hashlib
import json
import time
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..models.request_model import CacheEntry
from ..utils.logger import LoggerMixin


class MathOperationBase(ABC, LoggerMixin):

    @abstractmethod
    async def execute(self, **kwargs) -> Union[int, float]:
        """Execute the mathematical operation."""
        pass

    @abstractmethod
    def get_operation_name(self) -> str:
        """Get the name of the operation."""
        pass

    def validate_input(self, **kwargs) -> bool:
        """Validate input parameters. Override in subclasses if needed."""
        return True


class PowerOperation(MathOperationBase):
    """Power operation implementation."""

    async def execute(self, base: Union[int, float], exponent: Union[int, float]) -> Union[int, float]:
        """Calculate base^exponent."""
        try:
            result = pow(base, exponent)
            if isinstance(result, complex):
                raise ValueError("Complex results are not supported")
            return result
        except OverflowError:
            raise ValueError("Result too large to compute")

    def get_operation_name(self) -> str:
        return "power"


class FibonacciOperation(MathOperationBase):
    """Fibonacci operation implementation with memoization."""

    def __init__(self):
        self._memo = {0: 0, 1: 1}

    async def execute(self, n: int) -> int:
        """Calculate the nth Fibonacci number."""
        return self._fibonacci_memo(n)

    def _fibonacci_memo(self, n: int) -> int:
        """Memoized Fibonacci calculation."""
        if n in self._memo:
            return self._memo[n]

        if n < 2:
            return n

        # Calculate iteratively to avoid stack overflow
        a, b = 0, 1
        for i in range(2, n + 1):
            if i not in self._memo:
                a, b = b, a + b
                self._memo[i] = b
            else:
                a, b = self._memo[i-1], self._memo[i]

        return self._memo[n]

    def get_operation_name(self) -> str:
        return "fibonacci"


class FactorialOperation(MathOperationBase):
    """Factorial operation implementation."""

    async def execute(self, n: int) -> int:

        if n == 0 or n == 1:
            return 1

        result = 1
        for i in range(2, n + 1):
            result *= i
            # Check for reasonable limits to prevent excessive computation
            if result > 10**300:  # Practical limit
                raise ValueError("Factorial result too large")

        return result

    def get_operation_name(self) -> str:
        return "factorial"


class CacheManager(LoggerMixin):


    def __init__(self, default_ttl_hours: int = 24):
        self.default_ttl_hours = default_ttl_hours

    def _generate_cache_key(self, operation: str, parameters: dict) -> str:

        key_data = f"{operation}:{json.dumps(parameters, sort_keys=True)}"
        return hashlib.sha256(key_data.encode()).hexdigest()

    async def get(self, db: AsyncSession, operation: str, parameters: dict) -> Optional[Any]:

        cache_key = self._generate_cache_key(operation, parameters)

        try:
            stmt = select(CacheEntry).where(
                CacheEntry.cache_key == cache_key,
                CacheEntry.expires_at > datetime.utcnow()
            )
            result = await db.execute(stmt)
            cache_entry = result.scalar_one_or_none()

            if cache_entry:
                # Update hit count
                cache_entry.hit_count += 1
                await db.commit()

                self.logger.info(
                    "Cache hit",
                    cache_key=cache_key,
                    operation=operation,
                    hit_count=cache_entry.hit_count
                )

                return json.loads(cache_entry.result)

        except Exception as e:
            self.logger.error("Cache retrieval error", error=str(e))

        return None

    async def set(
        self,
        db: AsyncSession,
        operation: str,
        parameters: dict,
        result: Any,
        ttl_hours: Optional[int] = None
    ) -> None:

        cache_key = self._generate_cache_key(operation, parameters)
        ttl = ttl_hours or self.default_ttl_hours
        expires_at = datetime.utcnow() + timedelta(hours=ttl)

        try:
            # Check if entry already exists
            stmt = select(CacheEntry).where(CacheEntry.cache_key == cache_key)
            existing = await db.execute(stmt)
            cache_entry = existing.scalar_one_or_none()

            if cache_entry:
                # Update existing entry
                cache_entry.result = json.dumps(result)
                cache_entry.expires_at = expires_at
                cache_entry.parameters = json.dumps(parameters)  # Update parameters too
            else:
                # Create new entry
                cache_entry = CacheEntry(
                    operation=operation,
                    parameters=json.dumps(parameters),
                    cache_key=cache_key,
                    result=json.dumps(result),
                    expires_at=expires_at
                )
                db.add(cache_entry)

            await db.commit()

            self.logger.info(
                "Result cached",
                operation=operation,
                parameters=parameters,
                cache_key=cache_key,
                expires_at=expires_at.isoformat()
            )

        except Exception as e:
            self.logger.error("Cache storage error", error=str(e))
            await db.rollback()


class MathService(LoggerMixin):


    def __init__(self):
        self.operations: Dict[str, MathOperationBase] = {
            "power": PowerOperation(),
            "fibonacci": FibonacciOperation(),
            "factorial": FactorialOperation()
        }
        self.cache_manager = CacheManager()

    def register_operation(self, operation: MathOperationBase) -> None:

        name = operation.get_operation_name()
        self.operations[name] = operation
        self.logger.info(f"Registered new operation: {name}")

    async def execute_operation(
        self,
        db: AsyncSession,
        operation_name: str,
        parameters: dict,
        use_cache: bool = True
    ) -> tuple[Any, float, bool]:

        if operation_name not in self.operations:
            raise ValueError(f"Unsupported operation: {operation_name}")

        operation = self.operations[operation_name]

        # Check cache first
        cached_result = None
        if use_cache:
            cached_result = await self.cache_manager.get(db, operation_name, parameters)
            if cached_result is not None:
                return cached_result, 0.0, True

        # Execute operation
        start_time = time.perf_counter()

        try:
            result = await operation.execute(**parameters)
            execution_time = (time.perf_counter() - start_time) * 1000  # Convert to ms

            # Cache the result
            if use_cache and result is not None:
                await self.cache_manager.set(db, operation_name, parameters, result)

            return result, execution_time, False

        except Exception as e:
            execution_time = (time.perf_counter() - start_time) * 1000
            self.logger.error(
                "Operation execution failed",
                operation=operation_name,
                parameters=parameters,
                error=str(e),
                execution_time_ms=execution_time
            )
            raise ValueError(f"Operation failed: {str(e)}")

    def get_available_operations(self) -> list[str]:

        return list(self.operations.keys())