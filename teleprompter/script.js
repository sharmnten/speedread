document.addEventListener('DOMContentLoaded', function () {
    const textInput = document.getElementById('textInput');
    const speedInput = document.getElementById('speedInput');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const startBtn = document.getElementById('startBtn');
    const controls = document.getElementById('controls');
    const container = document.getElementById('teleprompterContainer');
    const scroller = document.getElementById('textScroller');
    const textEl = document.getElementById('teleprompterText');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const liveSpeed = document.getElementById('liveSpeed');
    const liveSpeedVal = document.getElementById('liveSpeedVal');

    let rafId = null;
    let paused = false;
    let scrollPos = 0;
    let lastTimestamp = null;
    let pxPerSec = 0;
    let maxScroll = 0;
    let wordCount = 0;

    function calcPxPerSec(wpm) {
        if (wpm <= 0 || wordCount <= 0 || maxScroll <= 0) return 0;
        const readingTimeSec = (wordCount / wpm) * 60;
        return maxScroll / readingTimeSec;
    }

    function animate(timestamp) {
        if (lastTimestamp === null) lastTimestamp = timestamp;
        const elapsed = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        if (!paused) {
            scrollPos += pxPerSec * (elapsed / 1000);
            if (scrollPos >= maxScroll) {
                scrollPos = maxScroll;
                scroller.scrollTop = scrollPos;
                rafId = null;
                return;
            }
            scroller.scrollTop = scrollPos;
        }

        rafId = requestAnimationFrame(animate);
    }

    startBtn.addEventListener('click', function () {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text.');
            return;
        }

        const fontSize = parseInt(fontSizeInput.value, 10) || 48;
        const wpm = parseInt(speedInput.value, 10) || 150;

        wordCount = text.split(/\s+/).filter(Boolean).length;

        textEl.textContent = text;
        textEl.style.fontSize = fontSize + 'px';
        liveSpeed.value = wpm;
        liveSpeedVal.textContent = wpm + ' WPM';

        controls.style.display = 'none';
        container.style.display = 'flex';
        scrollPos = 0;
        scroller.scrollTop = 0;
        paused = false;
        pauseBtn.textContent = 'Pause';
        lastTimestamp = null;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        // Measure layout after render, then start
        requestAnimationFrame(function () {
            maxScroll = scroller.scrollHeight - scroller.clientHeight;
            pxPerSec = calcPxPerSec(wpm);
            rafId = requestAnimationFrame(animate);
        });
    });

    pauseBtn.addEventListener('click', function () {
        paused = !paused;
        pauseBtn.textContent = paused ? 'Resume' : 'Pause';
        if (!paused) {
            lastTimestamp = null;
        }
    });

    stopBtn.addEventListener('click', function () {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        container.style.display = 'none';
        controls.style.display = 'block';
        scroller.scrollTop = 0;
        scrollPos = 0;
        paused = false;
        pauseBtn.textContent = 'Pause';
    });

    liveSpeed.addEventListener('input', function () {
        const wpm = parseInt(liveSpeed.value, 10);
        liveSpeedVal.textContent = wpm + ' WPM';
        pxPerSec = calcPxPerSec(wpm);
    });
});
