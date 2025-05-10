#!/bin/bash
# Script to install dependencies and run the countdown timer application

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Attempt to run the app
echo "Starting the countdown timer application..."
python run.py

# If the app fails to start, try the alternative version
if [ $? -ne 0 ]; then
    echo "First attempt failed. Trying alternative version without eventlet..."
    python run_no_eventlet.py
fi

# Deactivate virtual environment when done
deactivate