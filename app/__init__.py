from flask import Flask
from flask_socketio import SocketIO
from config import Config

# Initialize Socket.IO without specifying async_mode yet
socketio = SocketIO()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize Flask extensions
    socketio.init_app(app, 
                     cors_allowed_origins="*",
                     ping_timeout=60,
                     ping_interval=25)
    
    # Register blueprints
    from app.routes import main_bp
    app.register_blueprint(main_bp)
    
    # Import and register socket events
    from app import sockets
    
    return app