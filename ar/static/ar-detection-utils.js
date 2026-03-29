
async function startCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoEl.srcObject = mediaStream;
        await videoEl.play();
        await waitForVideoMetadata(videoEl);
    } catch (error) {
        setStatus('Camera access failed. Please allow webcam permissions.');
        throw error;
    }
}

function orderPoints(approx) {
    const pts = [];
    for (let i = 0; i < 4; i++) {
        pts.push({ x: approx.data32S[i * 2], y: approx.data32S[i * 2 + 1] });
    }

    pts.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    const tl = pts[0];
    const br = pts[3];
    const mid = [pts[1], pts[2]];
    mid.sort((a, b) => (a.y - a.x) - (b.y - b.x));
    return [tl, mid[0], br, mid[1]];
}
function getSideRatio(approx) {
    const sides = [];
    for (let i = 0; i < 4; i++) {
        const x1 = approx.data32S[i * 2];
        const y1 = approx.data32S[i * 2 + 1];
        const x2 = approx.data32S[((i + 1) % 4) * 2];
        const y2 = approx.data32S[((i + 1) % 4) * 2 + 1];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        sides.push(dist);
    }
    const minSide = Math.min(...sides);
    const maxSide = Math.max(...sides);
    return minSide > 0 ? (maxSide / minSide) : Infinity;
}
function centroidKey(approx) {
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < 4; i++) {
        cx += approx.data32S[i * 2];
        cy += approx.data32S[i * 2 + 1];
    }
    cx /= 4;
    cy /= 4;
    const gx = Math.floor(cx / config.centroidGrid);
    const gy = Math.floor(cy / config.centroidGrid);
    return `${gx},${gy}`;
}
function waitForVideoMetadata(video) {
    if (video.readyState >= 1 && video.videoWidth > 0 && video.videoHeight > 0) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        video.addEventListener('loadedmetadata', () => resolve(), { once: true });
    });
}

async function initializePipeline() {
    if (started) {
        return;
    }

    started = true;
    setStatus('Starting camera...');

    await startCamera();

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    setStatus('Processing video with OpenCV.js');
    animationId = requestAnimationFrame(processFrame);
}

function onOpenCvReady() {
    if (!window.cv) {
        setStatus('OpenCV failed to load.');
        return;
    }

    if (typeof cv.getBuildInformation === 'function') {
        initializePipeline().catch((error) => {
            console.error(error);
        });
        return;
    }

    cv.onRuntimeInitialized = () => {
        initializePipeline().catch((error) => {
            console.error(error);
        });
    };
}