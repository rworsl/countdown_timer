@echo off
REM Script to install dependencies and run the countdown timer application on Windows

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Starting the countdown timer application...
python run.py

IF %ERRORLEVEL% NEQ 0 (
    echo First attempt failed. Trying alternative version without eventlet...
    python run_no_eventlet.py
)

echo Deactivating virtual environment...
deactivate