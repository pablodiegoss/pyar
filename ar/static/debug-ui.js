const controls = {
    warpSize: document.getElementById('ctrl-warp-size'),
    borderSize: document.getElementById('ctrl-border-size'),
    epsilonCoeff: document.getElementById('ctrl-epsilon-coeff'),
    minArea: document.getElementById('ctrl-min-area'),
    blackBorderThreshold: document.getElementById('ctrl-black-border-threshold'),
    binaryThreshold: document.getElementById('ctrl-binary-threshold'),
    useOtsu: document.getElementById('ctrl-use-otsu'),
    maxSideRatio: document.getElementById('ctrl-max-side-ratio'),
    temporalConfirmFrames: document.getElementById('ctrl-temporal-confirm-frames'),
    trackStaleFrames: document.getElementById('ctrl-track-stale-frames'),
    centroidGrid: document.getElementById('ctrl-centroid-grid'),
    processEveryNFrames: document.getElementById('ctrl-process-every-n-frames'),
};

const values = {
    warpSize: document.getElementById('val-warp-size'),
    borderSize: document.getElementById('val-border-size'),
    epsilonCoeff: document.getElementById('val-epsilon-coeff'),
    minArea: document.getElementById('val-min-area'),
    blackBorderThreshold: document.getElementById('val-black-border-threshold'),
    binaryThreshold: document.getElementById('val-binary-threshold'),
    maxSideRatio: document.getElementById('val-max-side-ratio'),
    temporalConfirmFrames: document.getElementById('val-temporal-confirm-frames'),
    trackStaleFrames: document.getElementById('val-track-stale-frames'),
    centroidGrid: document.getElementById('val-centroid-grid'),
    processEveryNFrames: document.getElementById('val-process-every-n-frames'),
};

function clampInt(value, min, max) {
    return Math.max(min, Math.min(max, Math.round(value)));
}

function clampFloat(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


function syncControls() {
    controls.warpSize.value = String(config.warpSize);
    controls.borderSize.value = String(config.borderSize);
    controls.epsilonCoeff.value = String(config.epsilonCoeff);
    controls.minArea.value = String(config.minArea);
    controls.blackBorderThreshold.value = String(config.blackBorderThreshold);
    controls.binaryThreshold.value = String(config.binaryThreshold);
    controls.useOtsu.checked = config.useOtsu;
    controls.maxSideRatio.value = String(config.maxSideRatio);
    controls.temporalConfirmFrames.value = String(config.temporalConfirmFrames);
    controls.trackStaleFrames.value = String(config.trackStaleFrames);
    controls.centroidGrid.value = String(config.centroidGrid);
    controls.processEveryNFrames.value = String(config.processEveryNFrames);

    values.warpSize.textContent = String(config.warpSize);
    values.borderSize.textContent = String(config.borderSize);
    values.epsilonCoeff.textContent = config.epsilonCoeff.toFixed(3);
    values.minArea.textContent = String(config.minArea);
    values.blackBorderThreshold.textContent = config.blackBorderThreshold.toFixed(2);
    values.binaryThreshold.textContent = String(config.binaryThreshold);
    values.maxSideRatio.textContent = config.maxSideRatio.toFixed(2);
    values.temporalConfirmFrames.textContent = String(config.temporalConfirmFrames);
    values.trackStaleFrames.textContent = String(config.trackStaleFrames);
    values.centroidGrid.textContent = String(config.centroidGrid);
    values.processEveryNFrames.textContent = String(config.processEveryNFrames);

    controls.binaryThreshold.disabled = config.useOtsu;
}

function bindControls() {
    controls.warpSize.addEventListener('input', (event) => {
        config.warpSize = clampInt(Number(event.target.value), 64, 256);
        syncControls();
    });

    controls.borderSize.addEventListener('input', (event) => {
        config.borderSize = clampInt(Number(event.target.value), 4, 64);
        syncControls();
    });


    controls.epsilonCoeff.addEventListener('input', (event) => {
        config.epsilonCoeff = clampFloat(Number(event.target.value), 0.01, 0.05);
        syncControls();
    });

    controls.minArea.addEventListener('input', (event) => {
        config.minArea = clampInt(Number(event.target.value), 200, 2000);
        syncControls();
    });

    controls.blackBorderThreshold.addEventListener('input', (event) => {
        config.blackBorderThreshold = clampFloat(Number(event.target.value), 0.5, 0.95);
        syncControls();
    });

    controls.binaryThreshold.addEventListener('input', (event) => {
        config.binaryThreshold = clampInt(Number(event.target.value), 0, 255);
        syncControls();
    });

    controls.useOtsu.addEventListener('change', (event) => {
        config.useOtsu = Boolean(event.target.checked);
        syncControls();
    });

    controls.maxSideRatio.addEventListener('input', (event) => {
        config.maxSideRatio = clampFloat(Number(event.target.value), 1.0, 10.0);
        syncControls();
    });

    controls.temporalConfirmFrames.addEventListener('input', (event) => {
        config.temporalConfirmFrames = clampInt(Number(event.target.value), 1, 8);
        syncControls();
    });

    controls.trackStaleFrames.addEventListener('input', (event) => {
        config.trackStaleFrames = clampInt(Number(event.target.value), 2, 12);
        syncControls();
    });

    controls.centroidGrid.addEventListener('input', (event) => {
        config.centroidGrid = clampInt(Number(event.target.value), 4, 32);
        syncControls();
    });

    controls.processEveryNFrames.addEventListener('input', (event) => {
        config.processEveryNFrames = clampInt(Number(event.target.value), 1, 4);
        syncControls();
    });
}

function addDebugWarp(colorWarpMat) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = config.warpSize;
    tempCanvas.height = config.warpSize;
    cv.imshow(tempCanvas, colorWarpMat);
    debugWarps.push(tempCanvas);
    if (debugWarps.length > DEBUG_GRID_SIZE * DEBUG_GRID_SIZE) {
        debugWarps.shift();
    }
}

function drawDebugGrid() {
    if (!DEBUG_MODE) return;
    if (debugWarps.length === 0) {
        debugCanvasEl.style.display = 'none';
        debugCtx.clearRect(0, 0, debugCanvasEl.width, debugCanvasEl.height);
        return;
    }

    debugCanvasEl.style.display = 'block';
    const cols = DEBUG_GRID_SIZE;
    const rows = Math.ceil(debugWarps.length / cols);
    const spacing = 4;
    debugCanvasEl.width = cols * DEBUG_DISPLAY_SIZE + (cols - 1) * spacing;
    debugCanvasEl.height = rows * DEBUG_DISPLAY_SIZE + (rows - 1) * spacing;
    debugCtx.fillStyle = '#000';
    debugCtx.fillRect(0, 0, debugCanvasEl.width, debugCanvasEl.height);

    const scale = DEBUG_DISPLAY_SIZE / config.warpSize;
    const borderPx = config.borderSize * scale;

    for (let idx = 0; idx < debugWarps.length; ++idx) {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * (DEBUG_DISPLAY_SIZE + spacing);
        const y = row * (DEBUG_DISPLAY_SIZE + spacing);

        debugCtx.drawImage(debugWarps[idx], x, y, DEBUG_DISPLAY_SIZE, DEBUG_DISPLAY_SIZE);


        const centroidX = x + DEBUG_DISPLAY_SIZE / 2;
        const centroidY = y + DEBUG_DISPLAY_SIZE / 2;
        debugCtx.fillStyle = '#ffffff';
        debugCtx.beginPath();
        debugCtx.arc(centroidX, centroidY, 4, 0, 2 * Math.PI);
        debugCtx.fill();
    }
}