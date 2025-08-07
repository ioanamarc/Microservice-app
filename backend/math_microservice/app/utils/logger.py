"""
Logging configuration for the math microservice.
"""

import os
import sys
import logging
from typing import Any
import structlog
from structlog.stdlib import LoggerFactory


def configure_logging() -> None:
    """
    Configure structured logging for the application.
    """
    # Set log level from environment
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if os.getenv("LOG_FORMAT") == "json"
            else structlog.dev.ConsoleRenderer(colors=True)
        ],
        context_class=dict,
        logger_factory=LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level, logging.INFO)
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Get a structured logger instance.

    Args:
        name: Logger name (usually __name__)

    Returns:
        BoundLogger: Configured logger instance
    """
    return structlog.get_logger(name)


class LoggerMixin:
    """
    Mixin class to add logging capability to other classes.
    """

    @property
    def logger(self) -> structlog.stdlib.BoundLogger:
        """Get logger for this class."""
        return get_logger(self.__class__.__name__)


def log_request_info(
    operation: str,
    parameters: dict,
    result: Any = None,
    execution_time_ms: float = None,
    success: bool = True,
    error: str = None,
    client_ip: str = None
) -> None:
    """
    Log structured information about a request.

    Args:
        operation: The mathematical operation performed
        parameters: Request parameters
        result: Operation result
        execution_time_ms: Execution time in milliseconds
        success: Whether the operation was successful
        error: Error message if unsuccessful
        client_ip: Client IP address
    """
    logger = get_logger("request")

    log_data = {
        "operation": operation,
        "parameters": parameters,
        "execution_time_ms": execution_time_ms,
        "success": success,
        "client_ip": client_ip
    }

    if success and result is not None:
        log_data["result_type"] = type(result).__name__
        if isinstance(result, (int, float)) and abs(result) < 1000000:
            log_data["result"] = result

    if error:
        log_data["error"] = error
        logger.error("Math operation failed", **log_data)
    else:
        logger.info("Math operation completed", **log_data)