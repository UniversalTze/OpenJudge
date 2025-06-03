#!/bin/bash
set -e  # stop on error

# Run DB init
python -m app_cough.models.initdb

# Start app
uvicorn problems.main:app --host 0.0.0.0 --port 6400