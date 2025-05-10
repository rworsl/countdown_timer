// DOM Elements
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const durationInput = document.getElementById('timer-duration');
const setDurationBtn = document.getElementById('set-duration-btn');
const remoteUrlInput = document.getElementById('remote-url');
const copyBtn = document.getElementById('copy-btn');
const qrCodeElement = document.getElementById('qr-code');

// Timer state
let countdown = null;
let timeRemaining = parseInt(durationInput.value) || 300; // Default to 5 minutes
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
    
    // Sync time with server periodically
    socket.emit('sync_time', {
        timer_id: TIMER_ID,
        remaining: timeRemaining
    });
}

// Start the countdown
function startTimer() {
    if (!isActive) {
        isActive = true;
        isPaused = false;
        
        updateButtonStates();
        
        countdown = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplay();
                
                if (timeRemaining === 0) {
                    completeTimer();
                }
            }
        }, 1000);
    }
}

// Pause the countdown
function pauseTimer() {
    if (isActive && !isPaused) {
        isPaused = true;
        clearInterval(countdown);
        updateButtonStates();
    }
}

// Resume the countdown
function resumeTimer() {
    if (isActive && isPaused) {
        isPaused = false;
        updateButtonStates();
        
        countdown = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateDisplay();
                
                if (timeRemaining === 0) {
                    completeTimer();
                }
            }
        }, 1000);
    }
}

// Reset the countdown
function resetTimer() {
    clearInterval(countdown);
    isActive = false;
    isPaused = false;
    timeRemaining = parseInt(durationInput.value) || 300;
    updateDisplay();
    updateButtonStates();
}

// Timer completion
function completeTimer() {
    clearInterval(countdown);
    isActive = false;
    isPaused = false;
    
    // Visual feedback for timer completion
    document.querySelector('.timer-display').classList.add('timer-complete');
    setTimeout(() => {
        document.querySelector('.timer-display').classList.remove('timer-complete');
    }, 1500);
    
    updateButtonStates();
}

// Set new duration
function setDuration() {
    const newDuration = parseInt(durationInput.value);
    
    if (newDuration && newDuration > 0) {
        timeRemaining = newDuration;
        updateDisplay();
        
        // Emit event to server
        socket.emit('set_duration', {
            timer_id: TIMER_ID,
            duration: newDuration
        });
    }
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

// Copy remote URL to clipboard
function copyRemoteUrl() {
    remoteUrlInput.select();
    document.execCommand('copy');
    
    // Visual feedback
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
    }, 2000);
}

// Initialize QR code
function initQRCode() {
    new QRCode(qrCodeElement, {
        text: REMOTE_URL,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!isActive) {
        socket.emit('start_timer', { timer_id: TIMER_ID });
        startTimer();
    }
});

pauseBtn.addEventListener('click', () => {
    if (isActive) {
        if (isPaused) {
            socket.emit('resume_timer', { timer_id: TIMER_ID });
            resumeTimer();
        } else {
            socket.emit('pause_timer', { timer_id: TIMER_ID });
            pauseTimer();
        }
    }
});

resetBtn.addEventListener('click', () => {
    socket.emit('reset_timer', { timer_id: TIMER_ID });
    resetTimer();
});

setDurationBtn.addEventListener('click', setDuration);

copyBtn.addEventListener('click', copyRemoteUrl);

// Socket event listeners
socket.on('timer_control', (data) => {
    switch (data.action) {
        case 'start':
            startTimer();
            break;
        case 'pause':
            pauseTimer();
            break;
        case 'resume':
            resumeTimer();
            break;
        case 'reset':
            resetTimer();
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
    if (data.remaining !== undefined && isActive && !isPaused) {
        timeRemaining = data.remaining;
        updateDisplay();
    }
});

// Initialize
updateDisplay();
updateButtonStates();
initQRCode();