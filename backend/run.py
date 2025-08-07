#!/usr/bin/env python3
"""
Production entry point for the Math Microservice.
Run from project root directory.
"""

import os
import sys
import uvicorn
from pathlib import Path

# Ensure the project root is in Python path for imports
project_root = Path(__file__).parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from math_microservice.app.utils.logger import configure_logging, get_logger

# Configure logging early
configure_logging()
logger = get_logger(__name__)


def main():
    """
    Main entry point for the application.
    """
    # Environment configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    workers = int(os.getenv("WORKERS", 1))
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    reload = os.getenv("RELOAD", "false").lower() == "true"

    logger.info(
        "Starting Math Microservice",
        host=host,
        port=port,
        workers=workers,
        log_level=log_level,
        reload=reload
    )

    # Production configuration
    config = {
        "app": "math_microservice.app.main:app",
        "host": host,
        "port": port,
        "log_level": log_level,
        "access_log": True,
        "loop": "asyncio",
        "http": "h11",
    }

    # Add reload only in development
    if reload:
        config.update({
            "reload": True,
            "reload_dirs": [str(project_root / "app")],
        })
    else:
        # Production settings
        config.update({
            "workers": workers,
            "backlog": 2048,
            "max_requests": 1000,
            "max_requests_jitter": 100,
        })

    try:
        uvicorn.run(**config)
    except KeyboardInterrupt:
        logger.info("Shutting down Math Microservice")
    except Exception as e:
        logger.error("Failed to start Math Microservice", error=str(e))
        sys.exit(1)


if __name__ == "__main__":
    main()