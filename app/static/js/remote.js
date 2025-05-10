// DOM Elements
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const durationInput = document.getElementById('timer-duration');
const setDurationBtn = document.getElementById('set-duration-btn');

// Timer state
let timeRemaining = 300; // Default to 5 minutes
let isActive = false;
let isPaused = false;

// Socket connection
const socket = io();

// Join the room for this timer
socket.emit('join', { timer_id: TIMER_ID });

// Format time display (add leading zeros)
function formatTimeDisplay(time) {
    return time < 10 ? `0${time}` : time;
}

// Update the timer display
function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    minutesElement.textContent = formatTimeDisplay(minutes);
    secondsElement.textContent = formatTimeDisplay(seconds);
}

// Update button states based on timer status
function updateButtonStates() {
    if (isActive) {
        startBtn.disabled = true;
        
        if (isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            pauseBtn.disabled = false;
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            pauseBtn.disabled = false;
        }
    } else {
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

// Set new duration
function setDuration() {
    const newDuration = parseInt(durationInput.value);
    
    if (newDuration && newDuration > 0) {
        socket.emit('set_duration', {
            timer_id: TIMER_ID,
            duration: newDuration
        });
    }
}

// Event listeners
startBtn.addEventListener('click', () => {
    socket.emit('start_timer', { timer_id: TIMER_ID });
});

pauseBtn.addEventListener('click', () => {
    if (isActive) {
        if (isPaused) {
            socket.emit('resume_timer', { timer_id: TIMER_ID });
        } else {
            socket.emit('pause_timer', { timer_id: TIMER_ID });
        }
    }
});

resetBtn.addEventListener('click', () => {
    socket.emit('reset_timer', { timer_id: TIMER_ID });
});

setDurationBtn.addEventListener('click', setDuration);

// Socket event listeners
socket.on('timer_control', (data) => {
    switch (data.action) {
        case 'start':
            isActive = true;
            isPaused = false;
            updateButtonStates();
            break;
        case 'pause':
            isPaused = true;
            updateButtonStates();
            break;
        case 'resume':
            isPaused = false;
            updateButtonStates();
            break;
        case 'reset':
            isActive = false;
            isPaused = false;
            updateButtonStates();
            break;
        case 'set_duration':
            durationInput.value = data.duration;
            if (!isActive) {
                timeRemaining = data.duration;
                updateDisplay();
            }
            break;
    }
});

socket.on('sync_time', (data) => {
    if (data.remaining !== undefined) {
        timeRemaining = data.remaining;
        updateDisplay();
    }
});

socket.on('timer_status', (data) => {
    isActive = data.active;
    isPaused = data.paused;
    timeRemaining = data.duration;
    durationInput.value = data.duration;
    updateDisplay();
    updateButtonStates();
});

// Initialize the display
updateDisplay();
updateButtonStates();