# Multi-stage build for Java execution environment
FROM python:3.12-slim AS python-base

# Install uv
RUN pip install --no-cache-dir uv

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY pyproject.toml uv.lock ./

# Create a virtual environment and install dependencies
RUN python -m venv /venv && \
    /venv/bin/pip install --no-cache-dir -e .

# Final stage with Java added
FROM python:3.12-slim

# Install Java and required dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Download and install javax.json implementation
RUN mkdir -p /usr/share/java && \
    curl -L -o /usr/share/java/javax.json-api.jar \
    https://repo1.maven.org/maven2/javax/json/javax.json-api/1.1.4/javax.json-api-1.1.4.jar && \
    curl -L -o /usr/share/java/javax.json.jar \
    https://repo1.maven.org/maven2/org/glassfish/javax.json/1.1.4/javax.json-1.1.4.jar

# Set working directory
WORKDIR /app

# Copy the virtual environment from the python-base stage
COPY --from=python-base /venv /venv

# Copy the application code
COPY ./src ./src

# Add virtual environment to PATH
ENV PATH="/venv/bin:$PATH"

# Verify installations
RUN python --version && java -version && javac -version

# Start the Celery worker
CMD ["celery", "-A", "src.receiver.celery", "worker", "--loglevel=info"]
