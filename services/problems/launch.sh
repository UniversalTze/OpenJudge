#!/bin/bash
set -e  # stop on error

# Run DB init
python -m problems.src.models.initdb

# Start app
uvicorn problems.src.application.main:app --host 0.0.0.0 --port 6400