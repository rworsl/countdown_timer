import os
import sys

# Apply monkey patch before any other imports
try:
    import eventlet
    eventlet.monkey_patch()
except ImportError:
    pass

from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    try:
        # Try running with eventlet
        socketio.run(app, debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"Error with eventlet: {e}")
        print("Falling back to Werkzeug (Flask default) server...")
        # Fallback to regular Flask server if eventlet fails
        app.run(debug=False, host='0.0.0.0', port=5000)