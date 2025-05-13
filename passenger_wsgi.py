import sys
import os

# Add current directory to path
INTERP = os.path.expanduser("~/path/to/your/venv/bin/python")
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Add your application directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import Flask application
from app import create_app
application = create_app()

# Webserver import
from wsgi import application as application