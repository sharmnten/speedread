getElementById('startBtn').addEventListener('click', function() {
    const text = document.getElementById('textInput').value;
    const speed = parseInt(document.getElementById('speedInput').value, 10);

    if (!text) {
        alert('Please enter some text to scroll.');
        return;
    }
    
    const teleprompter = document.getElementById('teleprompter');
    teleprompter.innerText = text;
    teleprompter.style.animationDuration = `${text.length / speed}s`;
    teleprompter.classList.add('scrolling');

    document.getElementById('controls').style.display = 'none';
    document.getElementById('teleprompterContainer').style.display = 'block';
});