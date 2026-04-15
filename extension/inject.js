(function() {
    // Avoid injecting multiple times
    if (window.speedReadInjected) return;
    window.speedReadInjected = true;

    // Load Inter font if it doesn't exist
    if (!document.getElementById('speedread-font')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'speedread-font';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
        document.head.appendChild(fontLink);
    }

    // Colors from styles.css
    const colors = {
        primary: '#eae0cc',
        secondary: '#79745C',
        tertiary: '#704E2E',
        quaternary: '#143642'
    };

    // Create overlay container
    const container = document.createElement('div');
    container.id = 'speedread-extension-overlay';
    container.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(234, 224, 204, 0.98); /* matching --primary-color */
        color: ${colors.quaternary};
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', sans-serif;
    `;

    // Create display elements
    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Paste your text here...';
    // Pre-fill with any highlighted text
    textInput.value = window.getSelection().toString().trim();
    textInput.style.cssText = `
        width: 80%; max-width: 800px; height: 300px; padding: 15px;
        font-size: 1.2rem; border-radius: 4px;
        border: 1px solid ${colors.tertiary}; 
        margin-bottom: 20px; 
        background: ${colors.primary};
        color: ${colors.quaternary}; 
        resize: vertical; box-sizing: border-box;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    `;

    // Outline on focus helper
    textInput.addEventListener('focus', () => textInput.style.borderColor = colors.secondary);
    textInput.addEventListener('blur', () => textInput.style.borderColor = colors.tertiary);

    const wordDisplay = document.createElement('h1');
    wordDisplay.style.cssText = `
        font-size: 5rem; margin-bottom: 20px; text-align: center; 
        font-weight: 600; display: none; color: ${colors.tertiary};
        letter-spacing: 0.02em; line-height: 1.2;
    `;
    wordDisplay.textContent = 'SpeedRead';

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 15px; align-items: flex-end; margin-top: 30px; flex-wrap: wrap; justify-content: center;';

    const baseBtnStyle = `
        padding: 10px 20px; font-size: 2em; font-family: 'Inter', sans-serif;
        cursor: pointer; border: none; border-radius: 4px; 
        transition: background-color 0.2s ease;
    `;
    const primaryBtnStyle = baseBtnStyle + `background: ${colors.tertiary}; color: ${colors.primary};`;
    const outlineBtnStyle = baseBtnStyle + `background: transparent; color: ${colors.secondary}; border: 1px solid ${colors.secondary};`;

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start';
    startBtn.style.cssText = primaryBtnStyle;

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop';
    stopBtn.style.cssText = outlineBtnStyle + 'display: none;';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.cssText = outlineBtnStyle + 'display: none;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = outlineBtnStyle;
    closeBtn.style.borderColor = 'transparent'; // make close button subtle

    // hover states via event listeners since inline CSS doesn't support pseudo-classes
    [startBtn].forEach(btn => {
        btn.addEventListener('mouseover', () => btn.style.backgroundColor = colors.secondary);
        btn.addEventListener('mouseout', () => btn.style.backgroundColor = colors.tertiary);
    });
    [stopBtn, resetBtn].forEach(btn => {
        btn.addEventListener('mouseover', () => { btn.style.backgroundColor = colors.secondary; btn.style.color = colors.primary; });
        btn.addEventListener('mouseout', () => { btn.style.backgroundColor = 'transparent'; btn.style.color = colors.secondary; });
    });

    const speedContainer = document.createElement('div');
    speedContainer.style.cssText = 'display: flex; flex-direction: column; gap: 4px; align-items: flex-start; margin-left: 10px;';

    const speedLabel = document.createElement('label');
    speedLabel.textContent = 'Speed (WPM)';
    speedLabel.style.cssText = `font-size: 1.8em; font-weight: 500; color: ${colors.secondary};`;

    const speedInput = document.createElement('input');
    speedInput.type = 'number';
    speedInput.value = '300';
    speedInput.min = '50';
    speedInput.max = '1000';
    speedInput.style.cssText = `
        padding: 8px 10px; font-size: 2em; width: 180px; 
        border-radius: 4px; border: 1px solid ${colors.tertiary}; 
        background: ${colors.primary}; color: ${colors.quaternary};
        font-family: 'Inter', sans-serif;
    `;
    speedInput.addEventListener('focus', () => speedInput.style.borderColor = colors.secondary);
    speedInput.addEventListener('blur', () => speedInput.style.borderColor = colors.tertiary);

    speedContainer.append(speedLabel, speedInput);

    const progress = document.createElement('p');
    progress.style.cssText = `margin-top: 10px; font-size: 0.9em; color: ${colors.secondary}; min-height: 1.4em;`;

    controls.append(startBtn, stopBtn, resetBtn, speedContainer, closeBtn);
    container.append(textInput, wordDisplay, progress, controls);
    document.body.appendChild(container);

    let reader = null;
    let index = 0;
    let words = [];

    function stopReading() {
        if (reader) clearInterval(reader);
        reader = null;
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        startBtn.textContent = index > 0 && index < words.length ? 'Resume' : 'Start';
    }

    function resetReading() {
        stopReading();
        index = 0;
        words = [];
        wordDisplay.style.display = 'none';
        textInput.style.display = 'block';
        resetBtn.style.display = 'none';
        progress.textContent = '';
        startBtn.textContent = 'Start';
    }

    startBtn.addEventListener('click', () => {
        if (!words.length) {
            let textToRead = textInput.value.trim();
            words = textToRead.split(/\s+/).filter(w => w.trim().length > 0);
        }
        if (words.length === 0) {
            alert('Please paste some text first!');
            return;
        }

        // Hide text input, show word display
        textInput.style.display = 'none';
        wordDisplay.style.display = 'block';
        resetBtn.style.display = 'block';

        if (index >= words.length) index = 0;

        const speed = parseInt(speedInput.value, 10) || 300;
        const interval = 60000 / speed;

        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';

        reader = setInterval(() => {
            if (index < words.length) {
                wordDisplay.textContent = words[index];
                progress.textContent = `Word ${index + 1} of ${words.length}`;
                index++;
            } else {
                stopReading();
                wordDisplay.textContent = 'Done!';
            }
        }, interval);
    });

    stopBtn.addEventListener('click', stopReading);
    resetBtn.addEventListener('click', resetReading);

    closeBtn.addEventListener('click', () => {
        stopReading();
        container.remove();
        window.speedReadInjected = false;
    });

})();