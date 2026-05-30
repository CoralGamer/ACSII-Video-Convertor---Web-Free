/*
 * ASCII Converter Engine
 * Handles real-time video-to-ASCII processing and local recording/exporting using HTML5 Canvas & MediaRecorder API.
 */

class ASCIIConverter {
    constructor(videoElement, outputContainer, outputCanvas) {
        this.video = videoElement;
        this.container = outputContainer;
        this.canvas = outputCanvas; // Visible/Offscreen canvas for high-perf render
        this.ctx = this.canvas.getContext('2d');

        // Processing canvas (hidden, downsampled)
        this.procCanvas = document.createElement('canvas');
        this.procCtx = this.procCanvas.getContext('2d', { willReadFrequently: true });

        // Configuration state
        this.cols = 100;
        this.charPaletteName = 'standard';
        this.colorMode = 'monochrome'; // 'monochrome', 'amber', 'green', 'colorized'
        this.contrast = 0; // -100 to 100
        this.brightness = 0; // -100 to 100
        this.invert = false;
        
        // Palettes
        this.palettes = {
            standard: '@#W$9876543210?!abc;:+=-,. ',
            extended: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
            blocks: '█▓▒░ ',
            binary: '01 '
        };

        // Animation and state
        this.animationId = null;
        this.isProcessing = false;
        
        // Export state
        this.mediaRecorder = null;
        this.recordedBlobs = [];
        this.isRecording = false;
    }

    setOptions(options) {
        if (options.cols !== undefined) this.cols = parseInt(options.cols);
        if (options.charPalette !== undefined) this.charPaletteName = options.charPalette;
        if (options.colorMode !== undefined) this.colorMode = options.colorMode;
        if (options.contrast !== undefined) this.contrast = parseInt(options.contrast);
        if (options.brightness !== undefined) this.brightness = parseInt(options.brightness);
        if (options.invert !== undefined) this.invert = !!options.invert;
    }

    start() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.renderLoop();
    }

    stop() {
        this.isProcessing = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    renderLoop() {
        if (!this.isProcessing) return;

        if (this.video.readyState >= 2 && !this.video.paused && !this.video.ended) {
            this.processFrame();
        }
        
        this.animationId = requestAnimationFrame(() => this.renderLoop());
    }

    // Main frame processor
    processFrame() {
        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;
        
        if (videoWidth === 0 || videoHeight === 0) return;

        // Calculate aspect ratio-adjusted height for character proportions
        // Monospace characters are usually taller than they are wide (ratio approx 0.55)
        const charAspectRatio = 0.55; 
        const rows = Math.round(this.cols * (videoHeight / videoWidth) * charAspectRatio);

        // Resize the downsampling canvas
        this.procCanvas.width = this.cols;
        this.procCanvas.height = rows;

        // Draw current video frame to processing canvas
        this.procCtx.drawImage(this.video, 0, 0, this.cols, rows);

        // Extract pixel data
        const imgData = this.procCtx.getImageData(0, 0, this.cols, rows);
        const pixels = imgData.data;

        // Apply filters & convert to ASCII
        const palette = this.palettes[this.charPaletteName] || this.palettes.standard;
        const paletteLen = palette.length;

        // Prep canvas dimensions for rendering text
        const fontSize = 10;
        this.canvas.width = this.cols * 6; // ~6px width per monospace character
        this.canvas.height = rows * 10;    // 10px line-height

        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Configure font style
        this.ctx.font = `${fontSize}px 'Fira Code', monospace`;
        this.ctx.textBaseline = 'top';

        // Variables for contrast/brightness formulas
        const factor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));
        const brightVal = this.brightness;

        // HTML Pre element fallback string
        let textBuffer = '';

        for (let y = 0; y < rows; y++) {
            let rowText = '';
            for (let x = 0; x < this.cols; x++) {
                const idx = (y * this.cols + x) * 4;
                let r = pixels[idx];
                let g = pixels[idx + 1];
                let b = pixels[idx + 2];

                // Brightness adjustment
                if (brightVal !== 0) {
                    r = Math.min(255, Math.max(0, r + brightVal));
                    g = Math.min(255, Math.max(0, g + brightVal));
                    b = Math.min(255, Math.max(0, b + brightVal));
                }

                // Contrast adjustment
                if (this.contrast !== 0) {
                    r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
                    g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
                    b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
                }

                // Gray value
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;

                if (this.invert) {
                    gray = 255 - gray;
                    r = 255 - r;
                    g = 255 - g;
                    b = 255 - b;
                }

                // Map gray value to palette
                const charIdx = Math.floor((gray / 255.0) * (paletteLen - 1));
                const char = palette[charIdx];

                rowText += char;

                // Colorize canvas drawing
                const charX = x * 6;
                const charY = y * 10;

                if (this.colorMode === 'colorized') {
                    this.ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                } else if (this.colorMode === 'green') {
                    // CRT Green glow based on pixel intensity
                    const intensity = Math.round(50 + (gray / 255.0) * 205);
                    this.ctx.fillStyle = `rgb(0, ${intensity}, 0)`;
                } else if (this.colorMode === 'amber') {
                    // CRT Amber glow
                    const intensity = Math.round(50 + (gray / 255.0) * 205);
                    this.ctx.fillStyle = `rgb(${intensity}, ${Math.round(intensity * 0.6)}, 0)`;
                } else {
                    // Classic white monochrome
                    this.ctx.fillStyle = '#ffffff';
                }

                this.ctx.fillText(char, charX, charY);
            }
            textBuffer += rowText + '\n';
        }

        // Keep DOM Text updated in parallel for responsiveness, but if colorized, we rely mostly on Canvas
        if (this.colorMode === 'monochrome') {
            this.container.className = 'ascii-output';
            this.container.textContent = textBuffer;
        } else if (this.colorMode === 'green') {
            this.container.className = 'ascii-output green';
            this.container.textContent = textBuffer;
        } else if (this.colorMode === 'amber') {
            this.container.className = 'ascii-output amber';
            this.container.textContent = textBuffer;
        } else {
            // In colorized mode, the text fallback is monochrome but visually we see the gorgeous canvas.
            this.container.className = 'ascii-output colorized';
            this.container.textContent = textBuffer;
        }
    }

    // Fully client-side exporter using MediaRecorder
    startRecording(onProgress, onComplete) {
        if (this.isRecording) return;
        this.isRecording = true;
        this.recordedBlobs = [];

        // Save original playing states
        const wasPaused = this.video.paused;
        this.video.pause();
        this.video.currentTime = 0;

        // Hide video element and show recording loader
        onProgress(0, "Preparando pistas de vídeo y audio...");

        setTimeout(() => {
            // Set up stream from canvas
            // We capture the stream at the frame rate of the converter (e.g. 24fps)
            const fps = 24;
            const canvasStream = this.canvas.captureStream(fps);
            const tracks = [...canvasStream.getVideoTracks()];

            // Attach original audio track if it exists
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.video.captureStream ? this.video.captureStream() : null;
            
            if (source && source.getAudioTracks().length > 0) {
                const audioTrack = source.getAudioTracks()[0];
                tracks.push(audioTrack);
            }

            const combinedStream = new MediaStream(tracks);

            // Configure MediaRecorder options
            let options = { mimeType: 'video/webm;codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm;codecs=vp8' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: '' }; // Fallback to browser default
            }

            try {
                this.mediaRecorder = new MediaRecorder(combinedStream, options);
            } catch (e) {
                console.error('Exception while creating MediaRecorder:', e);
                onComplete(null, 'Error al iniciar el grabador de medios del navegador.');
                this.isRecording = false;
                return;
            }

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedBlobs.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm' });
                const videoURL = window.URL.createObjectURL(superBuffer);
                this.isRecording = false;
                onComplete(videoURL);
            };

            // Start recording
            this.mediaRecorder.start();

            // Play video to record in real-time
            this.video.play();
            this.start();

            // Track progress during real-time capture
            const checkProgress = setInterval(() => {
                if (!this.isRecording) {
                    clearInterval(checkProgress);
                    return;
                }

                const progress = Math.min(99, Math.round((this.video.currentTime / this.video.duration) * 100));
                onProgress(progress, `Procesando y grabando... ${progress}%`);

                if (this.video.ended) {
                    clearInterval(checkProgress);
                    this.stopRecording();
                }
            }, 100);

        }, 500);
    }

    stopRecording() {
        if (!this.isRecording) return;
        this.video.pause();
        this.stop();
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }
}
