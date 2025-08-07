"""
SQLAlchemy models for persisting API requests and responses.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func

from ..db.database import Base


class MathRequest(Base):
    """
    Model to store mathematical operation requests and their results.
    """
    __tablename__ = "math_requests"

    id = Column(Integer, primary_key=True, index=True)
    operation = Column(String(50), nullable=False, index=True)
    parameters = Column(Text, nullable=False)  # JSON string of parameters
    result = Column(Text, nullable=True)  # JSON string of result
    execution_time_ms = Column(Float, nullable=True)
    success = Column(Boolean, default=True, nullable=False)
    error_message = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    client_ip = Column(String(45), nullable=True)  # IPv6 support
    user_agent = Column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<MathRequest(id={self.id}, operation='{self.operation}', success={self.success})>"


class CacheEntry(Base):
    """
    Model to store cached computation results.
    """
    __tablename__ = "cache_entries"

    id = Column(Integer, primary_key=True, index=True)
    operation = Column(String(50), nullable=False, index=True)  # Operation name (fibonacci, power, etc.)
    parameters = Column(Text, nullable=False)  # JSON string of parameters for easy reading
    cache_key = Column(String(255), unique=True, nullable=False, index=True)
    result = Column(Text, nullable=False)  # JSON string of cached result
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    hit_count = Column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<CacheEntry(id={self.id}, operation='{self.operation}', hit_count={self.hit_count})>"