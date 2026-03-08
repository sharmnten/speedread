document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const display = document.getElementById('speedReadDisplay');
    const progress = document.getElementById('speedReadProgress');

    let reader = null;

    function stopReading() {
        if (reader) {
            clearInterval(reader);
            reader = null;
        }
        stopBtn.style.display = 'none';
        startBtn.textContent = 'Start reading!';
    }

    startBtn.addEventListener('click', function () {
        const text = document.getElementById('inputText').value.trim();
        const speed = parseInt(document.getElementById('speed').value, 10);

        if (!text) {
            alert('Please enter some text to speed read.');
            return;
        }
        if (!speed || speed < 1) {
            alert('Please enter a valid speed (at least 1 WPM).');
            return;
        }

        stopReading();

        const words = text.split(/\s+/);
        const total = words.length;
        let index = 0;
        const interval = 60000 / speed;

        display.innerText = '';
        progress.innerText = '';
        stopBtn.style.display = 'inline-block';
        startBtn.textContent = 'Restart';

        reader = setInterval(() => {
            if (index < total) {
                display.innerText = words[index];
                progress.innerText = `Word ${index + 1} of ${total}`;
                index++;
            } else {
                progress.innerText = `Done — ${total} words`;
                stopReading();
            }
        }, interval);
    });

    stopBtn.addEventListener('click', function () {
        display.innerText = '';
        progress.innerText = '';
        stopReading();
    });
});
