import sys
import os

# Add your application directory to path
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

# Import your app
from run import app as application

# This allows WSGI servers to access the application object
if __name__ == '__main__':
    application.run()