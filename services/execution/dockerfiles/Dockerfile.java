# Multi-language Dockerfile supporting both Python and Java
FROM ubuntu:24.04

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Python dependencies
    python3 \
    python3-pip \
    python3-venv \
    # Java dependencies
    openjdk-17-jdk \
    # JSON library for Java
    libjavax-json-java \
    # General utilities
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Download and install javax.json implementation if not available via apt
RUN mkdir -p /usr/share/java && \
    curl -L -o /usr/share/java/javax.json-api.jar \
    https://repo1.maven.org/maven2/javax/json/javax.json-api/1.1.4/javax.json-api-1.1.4.jar && \
    curl -L -o /usr/share/java/javax.json.jar \
    https://repo1.maven.org/maven2/org/glassfish/javax.json/1.1.4/javax.json-1.1.4.jar

# Install uv for Python package management
RUN pip3 install --no-cache-dir uv

# Copy requirements first to leverage Docker cache
COPY pyproject.toml ./

# Copy the rest of the application
COPY . .

# Create a virtual environment and install Python dependencies
RUN python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir -e .

# Add virtual environment to PATH
ENV PATH="/venv/bin:$PATH"

# Verify installations
RUN python3 --version && java -version && javac -version

# Start the Celery worker
CMD ["celery", "-A", "src.rceiver.celery", "worker", "--loglevel=info"]
