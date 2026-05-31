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
        this.charPaletteName = 'blocks';
        this.colorMode = 'monochrome'; // 'monochrome', 'amber', 'green', 'colorized', 'cyberpunk', 'vaporwave', 'matrix-glow'
        this.contrast = 0; // -100 to 100
        this.brightness = 0; // -100 to 100
        this.gamma = 1.0; // 0.4 to 2.4 (Grayscale midtones correction)
        this.dither = false; // Floyd-Steinberg error diffusion
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
        if (options.gamma !== undefined) this.gamma = parseFloat(options.gamma);
        if (options.dither !== undefined) this.dither = !!options.dither;
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
        const gammaExponent = 1.0 / this.gamma;

        // Grayscale & adjusted color buffers
        const grayBuffer = new Float32Array(this.cols * rows);
        const colorBuffer = new Uint8ClampedArray(this.cols * rows * 3);

        for (let i = 0; i < this.cols * rows; i++) {
            const idx = i * 4;
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

            // High-fidelity BT.709 Grayscale conversion
            let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // Gamma Correction
            if (this.gamma !== 1.0) {
                gray = Math.pow(gray / 255.0, gammaExponent) * 255.0;
            }

            if (this.invert) {
                gray = 255 - gray;
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }

            grayBuffer[i] = gray;
            colorBuffer[i * 3] = r;
            colorBuffer[i * 3 + 1] = g;
            colorBuffer[i * 3 + 2] = b;
        }

        // Apply Floyd-Steinberg error-diffusion dithering for ultimate mid-tones texture
        const ditheredBuffer = new Uint8ClampedArray(this.cols * rows);
        if (this.dither) {
            const tempBuffer = new Float32Array(grayBuffer);
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    const idx = y * this.cols + x;
                    let oldVal = tempBuffer[idx];
                    
                    oldVal = Math.min(255, Math.max(0, oldVal));
                    
                    // Match character palette index
                    const charIdx = Math.round((oldVal / 255.0) * (paletteLen - 1));
                    ditheredBuffer[idx] = charIdx;
                    
                    const newVal = (charIdx / (paletteLen - 1)) * 255;
                    const error = oldVal - newVal;
                    
                    // Error diffusion coefficients (FS grid)
                    if (x + 1 < this.cols) {
                        tempBuffer[idx + 1] += error * (7 / 16);
                    }
                    if (y + 1 < rows) {
                        const nextRowIdx = idx + this.cols;
                        if (x - 1 >= 0) {
                            tempBuffer[nextRowIdx - 1] += error * (3 / 16);
                        }
                        tempBuffer[nextRowIdx] += error * (5 / 16);
                        if (x + 1 < this.cols) {
                            tempBuffer[nextRowIdx + 1] += error * (1 / 16);
                        }
                    }
                }
            }
        } else {
            // Direct mapping
            for (let i = 0; i < this.cols * rows; i++) {
                ditheredBuffer[i] = Math.min(paletteLen - 1, Math.max(0, Math.floor((grayBuffer[i] / 255.0) * paletteLen)));
            }
        }

        // HTML Pre element fallback string
        let textBuffer = '';

        for (let y = 0; y < rows; y++) {
            let rowText = '';
            for (let x = 0; x < this.cols; x++) {
                const idx = y * this.cols + x;
                const charIdx = ditheredBuffer[idx];
                const char = palette[charIdx];
                rowText += char;

                const r = colorBuffer[idx * 3];
                const g = colorBuffer[idx * 3 + 1];
                const b = colorBuffer[idx * 3 + 2];
                const gray = grayBuffer[idx];

                // Drawing coordinates
                const charX = x * 6;
                const charY = y * 10;

                // Colorize canvas drawing with expanded cyber color systems
                if (this.colorMode === 'colorized') {
                    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                } else if (this.colorMode === 'green') {
                    const intensity = Math.round(50 + (gray / 255.0) * 205);
                    this.ctx.fillStyle = `rgb(0, ${intensity}, 0)`;
                } else if (this.colorMode === 'amber') {
                    const intensity = Math.round(50 + (gray / 255.0) * 205);
                    this.ctx.fillStyle = `rgb(${intensity}, ${Math.round(intensity * 0.6)}, 0)`;
                } else if (this.colorMode === 'cyberpunk') {
                    // Cyberpunk Neon Cyan-to-Magenta gradient map
                    const ratio = (x / this.cols) * 0.5 + (y / rows) * 0.5;
                    const finalR = Math.round((1 - ratio) * 0 + ratio * 217);
                    const finalG = Math.round((1 - ratio) * 242 + ratio * 70);
                    const finalB = Math.round((1 - ratio) * 254 + ratio * 239);
                    const brightnessMod = 0.3 + (gray / 255.0) * 0.7;
                    this.ctx.fillStyle = `rgb(${Math.round(finalR * brightnessMod)}, ${Math.round(finalG * brightnessMod)}, ${Math.round(finalB * brightnessMod)})`;
                } else if (this.colorMode === 'vaporwave') {
                    // Vaporwave Sunset Teal-to-Pink gradient
                    const ratio = Math.sin((x / this.cols) * Math.PI) * 0.5 + (y / rows) * 0.5;
                    const finalR = Math.round((1 - ratio) * 111 + ratio * 219);
                    const finalG = Math.round((1 - ratio) * 207 + ratio * 112);
                    const finalB = Math.round((1 - ratio) * 235 + ratio * 147);
                    const brightnessMod = 0.4 + (gray / 255.0) * 0.6;
                    this.ctx.fillStyle = `rgb(${Math.round(finalR * brightnessMod)}, ${Math.round(finalG * brightnessMod)}, ${Math.round(finalB * brightnessMod)})`;
                } else if (this.colorMode === 'matrix-glow') {
                    // glowing emerald highlights
                    if (gray > 215) {
                        this.ctx.fillStyle = '#ffffff'; // glowing matrix head
                    } else {
                        const intensity = Math.round(45 + (gray / 255.0) * 210);
                        this.ctx.fillStyle = `rgb(16, ${intensity}, 129)`;
                    }
                } else {
                    // Classic white monochrome
                    this.ctx.fillStyle = '#ffffff';
                }

                this.ctx.fillText(char, charX, charY);
            }
            textBuffer += rowText + '\n';
        }

        // Keep DOM Text updated in parallel for responsiveness
        if (this.colorMode === 'monochrome') {
            this.container.className = 'ascii-output';
            this.container.textContent = textBuffer;
        } else if (this.colorMode === 'green') {
            this.container.className = 'ascii-output green';
            this.container.textContent = textBuffer;
        } else if (this.colorMode === 'amber') {
            this.container.className = 'ascii-output amber';
            this.container.textContent = textBuffer;
        } else if (this.colorMode === 'cyberpunk') {
            this.container.className = 'ascii-output cyberpunk';
            this.container.textContent = textBuffer;
        } else if (this.colorMode === 'vaporwave') {
            this.container.className = 'ascii-output vaporwave';
            this.container.textContent = textBuffer;
        } else if (this.colorMode === 'matrix-glow') {
            this.container.className = 'ascii-output matrix-glow';
            this.container.textContent = textBuffer;
        } else {
            this.container.className = 'ascii-output colorized';
            this.container.textContent = textBuffer;
        }
    }

    // Fully client-side exporter using MediaRecorder with dynamic format selection
    startRecording(format, onProgress, onComplete) {
        if (this.isRecording) return;
        this.isRecording = true;

        if (format === 'gif') {
            this.recordedBlobs = [];
            this.wasLooping = this.video.loop;
            this.video.loop = false;
            this.video.pause();
            this.video.currentTime = 0;

            onProgress(0, "Preparando captura de fotogramas GIF...");

            setTimeout(() => {
                const frames = [];
                const maxFrames = 25; // 2.5 seconds loop at 10 FPS
                const frameDelay = 100; // Capture every 100ms
                
                this.video.play();
                this.start();

                let frameCounter = 0;
                this.checkProgressInterval = setInterval(() => {
                    if (!this.isRecording) {
                        clearInterval(this.checkProgressInterval);
                        return;
                    }

                    // Extract high-contrast JPEG data-url from main canvas
                    frames.push(this.canvas.toDataURL('image/jpeg', 0.8));
                    frameCounter++;

                    const progress = Math.round((frameCounter / maxFrames) * 100);
                    // Stage 1: Frame capture takes up 0-40% of progress bar
                    onProgress(Math.min(40, Math.round(progress * 0.4)), `Capturando fotogramas... ${frameCounter}/${maxFrames}`);

                    const duration = this.video.duration;
                    const isNearEnd = duration && !isNaN(duration) && duration !== Infinity && this.video.currentTime >= duration - 0.1;

                    if (frameCounter >= maxFrames || this.video.ended || isNearEnd) {
                        clearInterval(this.checkProgressInterval);
                        this.video.pause();
                        this.stop();

                        // Stage 2: Web Workers compilation
                        onProgress(45, "Compilando GIF en Workers locales (hilos en segundo plano)...");

                        if (typeof gifshot !== 'undefined') {
                            gifshot.createGIF({
                                images: frames,
                                gifWidth: this.canvas.width / 2, // Downsample for fast local rendering & file economy
                                gifHeight: this.canvas.height / 2,
                                interval: 0.1,
                                numWorkers: 2
                            }, (obj) => {
                                this.isRecording = false;

                                // Restore loop state
                                if (this.wasLooping !== undefined) {
                                    this.video.loop = this.wasLooping;
                                }

                                if (!obj.error) {
                                    onProgress(100, "¡GIF compilado exitosamente!");
                                    onComplete(obj.image);
                                } else {
                                    onComplete(null, "Error al codificar el GIF en el cliente.");
                                }
                            });
                        } else {
                            this.isRecording = false;
                            if (this.wasLooping !== undefined) {
                                this.video.loop = this.wasLooping;
                            }
                            onComplete(null, "Librería de codificación GIF (gifshot) no está cargada.");
                        }
                    }
                }, frameDelay);

            }, 500);
            return;
        }

        this.recordedBlobs = [];

        // Save original playing states
        const wasPaused = this.video.paused;
        this.wasLooping = this.video.loop; // Store original loop state
        this.video.loop = false; // Disable looping during recording
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
            try {
                const source = this.video.captureStream ? this.video.captureStream() : (this.video.mozCaptureStream ? this.video.mozCaptureStream() : null);
                if (source && source.getAudioTracks().length > 0) {
                    const audioTrack = source.getAudioTracks()[0];
                    tracks.push(audioTrack);
                }
            } catch (e) {
                console.warn("Failed to capture video audio track:", e);
            }

            const combinedStream = new MediaStream(tracks);

            // Configure MediaRecorder options
            let options = {};
            let actualMimeType = '';

            if (format === 'mp4') {
                const mp4Types = [
                    'video/mp4;codecs=h264',
                    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                    'video/mp4'
                ];
                let foundMp4 = false;
                for (const type of mp4Types) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        options = { mimeType: type };
                        actualMimeType = type;
                        foundMp4 = true;
                        break;
                    }
                }
                
                if (!foundMp4) {
                    console.warn("video/mp4 is not natively supported by this browser. Falling back to video/webm.");
                    const webmTypes = [
                        'video/webm;codecs=vp9',
                        'video/webm;codecs=vp8',
                        'video/webm'
                    ];
                    for (const type of webmTypes) {
                        if (MediaRecorder.isTypeSupported(type)) {
                            options = { mimeType: type };
                            actualMimeType = type;
                            break;
                        }
                    }
                }
            } else if (format === 'mkv') {
                const mkvTypes = [
                    'video/x-matroska;codecs=vp9',
                    'video/x-matroska;codecs=vp8',
                    'video/x-matroska;codecs=h264',
                    'video/x-matroska'
                ];
                let foundMkv = false;
                for (const type of mkvTypes) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        options = { mimeType: type };
                        actualMimeType = type;
                        foundMkv = true;
                        break;
                    }
                }
                if (!foundMkv) {
                    console.warn("video/x-matroska is not natively supported by this browser. Falling back to video/webm.");
                    const webmTypes = [
                        'video/webm;codecs=vp9',
                        'video/webm;codecs=vp8',
                        'video/webm'
                    ];
                    for (const type of webmTypes) {
                        if (MediaRecorder.isTypeSupported(type)) {
                            options = { mimeType: type };
                            actualMimeType = type;
                            break;
                        }
                    }
                }
            } else if (format === 'mov') {
                const movTypes = [
                    'video/quicktime;codecs=h264',
                    'video/quicktime'
                ];
                let foundMov = false;
                for (const type of movTypes) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        options = { mimeType: type };
                        actualMimeType = type;
                        foundMov = true;
                        break;
                    }
                }
                if (!foundMov) {
                    // Try MP4 first as it's highly compatible with MOV
                    const mp4Types = [
                        'video/mp4;codecs=h264',
                        'video/mp4'
                    ];
                    for (const type of mp4Types) {
                        if (MediaRecorder.isTypeSupported(type)) {
                            options = { mimeType: type };
                            actualMimeType = type;
                            foundMov = true;
                            break;
                        }
                    }
                }
                if (!foundMov) {
                    const webmTypes = [
                        'video/webm;codecs=vp9',
                        'video/webm;codecs=vp8',
                        'video/webm'
                    ];
                    for (const type of webmTypes) {
                        if (MediaRecorder.isTypeSupported(type)) {
                            options = { mimeType: type };
                            actualMimeType = type;
                            break;
                        }
                    }
                }
            } else if (format === 'avi') {
                // No standard native video/avi encoder exists. We use video/mp4 (or video/webm as fallback) and rename.
                const mp4Types = [
                    'video/mp4;codecs=h264',
                    'video/mp4'
                ];
                let foundAviBase = false;
                for (const type of mp4Types) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        options = { mimeType: type };
                        actualMimeType = type;
                        foundAviBase = true;
                        break;
                    }
                }
                if (!foundAviBase) {
                    const webmTypes = [
                        'video/webm;codecs=vp9',
                        'video/webm'
                    ];
                    for (const type of webmTypes) {
                        if (MediaRecorder.isTypeSupported(type)) {
                            options = { mimeType: type };
                            actualMimeType = type;
                            break;
                        }
                    }
                }
            } else {
                const webmTypes = [
                    'video/webm;codecs=vp9',
                    'video/webm;codecs=vp8',
                    'video/webm'
                ];
                for (const type of webmTypes) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        options = { mimeType: type };
                        actualMimeType = type;
                        break;
                    }
                }
            }

            if (!options.mimeType) {
                options = { mimeType: '' }; // Fallback to browser default
                actualMimeType = 'video/webm';
            }

            try {
                this.mediaRecorder = new MediaRecorder(combinedStream, options);
            } catch (e) {
                console.error('Exception while creating MediaRecorder:', e);
                onComplete(null, 'Error al iniciar el grabador de medios del navegador.');
                this.isRecording = false;
                // Restore loop state
                if (this.wasLooping !== undefined) {
                    this.video.loop = this.wasLooping;
                }
                return;
            }

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedBlobs.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const superBuffer = new Blob(this.recordedBlobs, { type: actualMimeType || 'video/webm' });
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
            this.checkProgressInterval = setInterval(() => {
                if (!this.isRecording) {
                    clearInterval(this.checkProgressInterval);
                    return;
                }

                let progress = 0;
                const duration = this.video.duration;
                if (duration && !isNaN(duration) && duration !== Infinity) {
                    progress = Math.min(99, Math.round((this.video.currentTime / duration) * 100));
                }
                
                // Determine if a fallback occurred
                let isFallback = false;
                if (format === 'mp4' && !MediaRecorder.isTypeSupported('video/mp4')) isFallback = true;
                if (format === 'mkv' && !MediaRecorder.isTypeSupported('video/x-matroska')) isFallback = true;
                if (format === 'mov' && !MediaRecorder.isTypeSupported('video/quicktime')) isFallback = true;
                
                const formatLabel = format.toUpperCase();
                const statusMsg = isFallback 
                    ? `Procesando (Fallback WebM a ${formatLabel})... ${progress}%`
                    : `Procesando y grabando ${formatLabel}... ${progress}%`;
                
                onProgress(progress, statusMsg);

                // Stop if video has ended or is near the end
                const isNearEnd = duration && !isNaN(duration) && duration !== Infinity && this.video.currentTime >= duration - 0.1;
                if (this.video.ended || isNearEnd) {
                    clearInterval(this.checkProgressInterval);
                    this.stopRecording();
                }
            }, 100);

        }, 500);
    }

    stopRecording() {
        if (!this.isRecording) return;
        this.video.pause();
        this.stop();

        // Restore loop state
        if (this.wasLooping !== undefined) {
            this.video.loop = this.wasLooping;
        }

        // Clean progress interval
        if (this.checkProgressInterval) {
            clearInterval(this.checkProgressInterval);
            this.checkProgressInterval = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }
}
