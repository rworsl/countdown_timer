from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session
import uuid
import logging
import time

logger = logging.getLogger(__name__)

main_bp = Blueprint('main', __name__)

# Store active timers
timers = {}

# Check if WebSockets are available
websockets_available = True
try:
    from flask_socketio import SocketIO
except ImportError:
    websockets_available = False
    logger.warning("Flask-SocketIO not available, falling back to AJAX polling")

@main_bp.route('/')
def index():
    """Main page with the countdown timer"""
    timer_id = request.args.get('id')
    
    # If no timer ID provided, create a new one
    if not timer_id or timer_id not in timers:
        timer_id = str(uuid.uuid4())
        timers[timer_id] = {
            'duration': 60 * 5,  # Default 5 minutes
            'active': False,
            'paused': False,
            'start_time': None,
            'elapsed_time': 0,
            'last_update': time.time()
        }
        return redirect(url_for('main.index', id=timer_id))
    
    remote_url = url_for('main.remote', id=timer_id, _external=True)
    return render_template('index.html', 
                         timer_id=timer_id, 
                         remote_url=remote_url,
                         websockets_available=websockets_available)

@main_bp.route('/remote/<id>')
def remote(id):
    """Remote control page for a specific timer"""
    if id not in timers:
        return redirect(url_for('main.index'))
    
    return render_template('remote.html', 
                         timer_id=id,
                         websockets_available=websockets_available)

# --- Fallback AJAX endpoints for when WebSockets aren't available ---

@main_bp.route('/api/timer/<id>/status', methods=['GET'])
def get_timer_status(id):
    """Get current timer status via AJAX"""
    if id not in timers:
        return jsonify({'error': 'Timer not found'}), 404
    
    timer = timers[id]
    
    # Calculate current time if timer is active
    current_time = timer['duration']
    if timer['active'] and not timer['paused']:
        elapsed = timer['elapsed_time']
        if timer['start_time']:
            elapsed += (time.time() - timer['start_time'])
        current_time = max(0, timer['duration'] - int(elapsed))
    
    return jsonify({
        'active': timer['active'],
        'paused': timer['paused'],
        'duration': timer['duration'],
        'remaining': current_time
    })

@main_bp.route('/api/timer/<id>/control', methods=['POST'])
def control_timer(id):
    """Control timer via AJAX"""
    if id not in timers:
        return jsonify({'error': 'Timer not found'}), 404
    
    data = request.json or {}
    action = data.get('action')
    timer = timers[id]
    
    if action == 'start':
        timer['active'] = True
        timer['paused'] = False
        timer['start_time'] = time.time()
        logger.info(f"Timer {id} started via AJAX")
    
    elif action == 'pause':
        if timer['active'] and not timer['paused']:
            timer['paused'] = True
            if timer['start_time']:
                timer['elapsed_time'] += (time.time() - timer['start_time'])
                timer['start_time'] = None
            logger.info(f"Timer {id} paused via AJAX")
    
    elif action == 'resume':
        if timer['active'] and timer['paused']:
            timer['paused'] = False
            timer['start_time'] = time.time()
            logger.info(f"Timer {id} resumed via AJAX")
    
    elif action == 'reset':
        timer['active'] = False
        timer['paused'] = False
        timer['start_time'] = None
        timer['elapsed_time'] = 0
        logger.info(f"Timer {id} reset via AJAX")
    
    elif action == 'set_duration':
        duration = data.get('duration')
        if duration is not None:
            try:
                duration = int(duration)
                if duration > 0:
                    timer['duration'] = duration
                    logger.info(f"Timer {id} duration set to {duration} via AJAX")
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid duration'}), 400
    
    return jsonify({'success': True, 'action': action})