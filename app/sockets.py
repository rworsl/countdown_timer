from flask_socketio import emit, join_room
from app import socketio
from app.routes import timers

@socketio.on('join')
def on_join(data):
    """User joins a timer room"""
    timer_id = data.get('timer_id')
    if timer_id and timer_id in timers:
        join_room(timer_id)
        emit('timer_status', timers[timer_id], to=timer_id)

@socketio.on('start_timer')
def start_timer(data):
    """Start the timer"""
    timer_id = data.get('timer_id')
    if timer_id and timer_id in timers:
        timers[timer_id]['active'] = True
        timers[timer_id]['paused'] = False
        emit('timer_control', {'action': 'start'}, to=timer_id)

@socketio.on('pause_timer')
def pause_timer(data):
    """Pause the timer"""
    timer_id = data.get('timer_id')
    if timer_id and timer_id in timers:
        timers[timer_id]['paused'] = True
        emit('timer_control', {'action': 'pause'}, to=timer_id)

@socketio.on('resume_timer')
def resume_timer(data):
    """Resume the timer"""
    timer_id = data.get('timer_id')
    if timer_id and timer_id in timers:
        timers[timer_id]['paused'] = False
        emit('timer_control', {'action': 'resume'}, to=timer_id)

@socketio.on('reset_timer')
def reset_timer(data):
    """Reset the timer"""
    timer_id = data.get('timer_id')
    if timer_id and timer_id in timers:
        emit('timer_control', {'action': 'reset'}, to=timer_id)

@socketio.on('set_duration')
def set_duration(data):
    """Set timer duration"""
    timer_id = data.get('timer_id')
    duration = data.get('duration')
    
    if timer_id and timer_id in timers and duration is not None:
        try:
            duration = int(duration)
            if duration > 0:
                timers[timer_id]['duration'] = duration
                emit('timer_control', {
                    'action': 'set_duration',
                    'duration': duration
                }, to=timer_id)
        except ValueError:
            pass  # Invalid duration format

@socketio.on('sync_time')
def sync_time(data):
    """Sync remaining time from main timer to all clients"""
    timer_id = data.get('timer_id')
    remaining = data.get('remaining')
    
    if timer_id and remaining is not None:
        emit('sync_time', {'remaining': remaining}, to=timer_id, include_self=False)