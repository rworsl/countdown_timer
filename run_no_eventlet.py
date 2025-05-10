from flask import Flask
from flask_socketio import SocketIO
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize Socket.IO with threading mode
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Import routes and socket handlers after initialization
from app.routes import main_bp
app.register_blueprint(main_bp)

# Import socket events
import app.sockets as sockets

# Manually re-register socket events
@socketio.on('join')
def on_join(data):
    sockets.on_join(data)

@socketio.on('start_timer')
def start_timer(data):
    sockets.start_timer(data)

@socketio.on('pause_timer')
def pause_timer(data):
    sockets.pause_timer(data)

@socketio.on('resume_timer')
def resume_timer(data):
    sockets.resume_timer(data)

@socketio.on('reset_timer')
def reset_timer(data):
    sockets.reset_timer(data)

@socketio.on('set_duration')
def set_duration(data):
    sockets.set_duration(data)

@socketio.on('sync_time')
def sync_time(data):
    sockets.sync_time(data)

if __name__ == '__main__':
    # Run with threading mode instead of eventlet
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)