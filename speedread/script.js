document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startBtn').addEventListener('click', function() {
        const text = document.getElementById('inputText').value;
        const speed = parseInt(document.getElementById('speed').value, 10);
        const words = text.split(/\s+/);
        let index = 0;
        const display = document.getElementById('speedReadDisplay');
        const interval = 60000 / speed; // milliseconds per word
        if (!text) {
            alert('Please enter some text to speed read.');
            return;
        }
        display.innerText = '';
        const reader = setInterval(() => {
            if (index < words.length) {
                display.innerText = words[index];
                index++;
            } else {
                clearInterval(reader);
            }   
        }, interval);
    });
});