# Use slim base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN groupadd -r mathservice && useradd -r -g mathservice mathservice
RUN chown -R mathservice:mathservice /app
USER mathservice

# Set environment
ENV PYTHONPATH=/app
ENV LOG_LEVEL=INFO
ENV DATABASE_URL=sqlite+aiosqlite:///./math_service.db

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
