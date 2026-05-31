/*
 * Generative AI Prompt-to-ASCII Drawing Engine
 * Interprets natural language prompts and generates custom interactive 
 * procedural visuals (3D Cube, Pulsing Heart, DVD Bounce, Matrix Rain,
 * Equalizer, Fire, or seed-based Neural Synapse networks) in beautiful ASCII.
 */

class AIPromptEngine {
    constructor(outputContainer, outputCanvas) {
        this.container = outputContainer;
        this.canvas = outputCanvas;
        this.ctx = this.canvas.getContext('2d');

        // Downsampling canvas for ASCII conversions
        this.procCanvas = document.createElement('canvas');
        this.procCtx = this.procCanvas.getContext('2d', { willReadFrequently: true });

        // Default configurations
        this.cols = 100;
        this.rows = 40;
        this.speed = 1.0;
        this.colorTheme = 'cyberpunk';
        this.charPalette = 'standard';
        
        // Loop states
        this.isPlaying = false;
        this.animationId = null;
        this.frameCount = 0;
        this.promptText = '';
        this.currentMode = 'neural'; // Default seed-based mode

        // String seed parameters for custom neural network generation
        this.seedHash = 0;
        
        // DVD Bouncer State
        this.dvd = { x: 50, y: 50, dx: 2, dy: 1.5, sizeX: 24, sizeY: 12, colorIdx: 0 };
        this.dvdColors = ['#00f2fe', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

        // Equalizer State
        this.eqBars = [];
        
        // Palettes mapping
        this.palettes = {
            standard: '@#W$9876543210?!abc;:+=-,. ',
            extended: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
            blocks: '█▓▒░ ',
            binary: '01 '
        };

        this.initStates();
    }

    initStates() {
        // Star/Drop coordinates for Matrix
        this.drops = [];
        
        // Neural network particle nodes
        this.nodes = [];
    }

    // Hash string to create a repeatable random seed for custom prompt generation
    hashPrompt(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    parsePrompt(prompt) {
        this.promptText = prompt.trim();
        const cleanPrompt = this.promptText.toLowerCase();
        this.frameCount = 0;
        this.initStates();

        // Calculate seed hash based on prompt text
        this.seedHash = this.hashPrompt(cleanPrompt);

        // Reset DVD state with slight random variation from seed
        this.dvd = {
            x: 20 + (this.seedHash % 40),
            y: 10 + (this.seedHash % 15),
            dx: (this.seedHash % 2 === 0 ? 1.5 : -1.5) * this.speed,
            dy: (this.seedHash % 3 === 0 ? 1.2 : -1.2) * this.speed,
            sizeX: 28,
            sizeY: 10,
            colorIdx: 0
        };

        // Keyword router
        if (cleanPrompt.includes('matrix') || cleanPrompt.includes('rain') || cleanPrompt.includes('digital') || cleanPrompt.includes('code')) {
            this.currentMode = 'matrix';
            this.colorTheme = 'matrix';
            this.charPalette = 'binary';
        } else if (cleanPrompt.includes('cube') || cleanPrompt.includes('3d') || cleanPrompt.includes('cubo') || cleanPrompt.includes('box')) {
            this.currentMode = 'cube';
            this.colorTheme = 'cyberpunk';
            this.charPalette = 'extended';
        } else if (cleanPrompt.includes('heart') || cleanPrompt.includes('love') || cleanPrompt.includes('corazon') || cleanPrompt.includes('amor')) {
            this.currentMode = 'heart';
            this.colorTheme = 'fire';
            this.charPalette = 'standard';
        } else if (cleanPrompt.includes('dvd') || cleanPrompt.includes('bounce') || cleanPrompt.includes('bouncing') || cleanPrompt.includes('rebote')) {
            this.currentMode = 'dvd';
            this.colorTheme = 'neon';
            this.charPalette = 'blocks';
        } else if (cleanPrompt.includes('music') || cleanPrompt.includes('audio') || cleanPrompt.includes('spectrum') || cleanPrompt.includes('equalizer') || cleanPrompt.includes('sonido')) {
            this.currentMode = 'equalizer';
            this.colorTheme = 'cyberpunk';
            this.charPalette = 'blocks';
        } else if (cleanPrompt.includes('fire') || cleanPrompt.includes('fuego') || cleanPrompt.includes('flame') || cleanPrompt.includes('lava')) {
            this.currentMode = 'fire';
            this.colorTheme = 'fire';
            this.charPalette = 'standard';
        } else if (cleanPrompt.includes('neural') || cleanPrompt.includes('synapse') || cleanPrompt.includes('nodes') || cleanPrompt.includes('red')) {
            // Seed-based NEURAL SYNAPSE galaxy fallback
            this.currentMode = 'neural';
            const themes = ['cyberpunk', 'neon', 'matrix', 'fire', 'monochrome'];
            this.colorTheme = themes[this.seedHash % themes.length];
            const palettes = ['standard', 'extended', 'blocks', 'binary'];
            this.charPalette = palettes[(this.seedHash >> 2) % palettes.length];
        } else {
            // Generative AI Text-to-Image with dynamic pixel mapping and frame warp!
            this.currentMode = 'ai-image';
            this.colorTheme = 'neon'; // High-fidelity color by default
            this.charPalette = 'extended'; // Deep detailed shading
            
            // Start local pixel extraction downloader
            this.triggerImageGeneration(this.promptText);
        }

        // Explanatory Toast Notification
        if (typeof window.showToast === 'function') {
            const isEs = (document.documentElement.lang === 'es' || (navigator.language || '').startsWith('es'));
            let title = '';
            let message = '';
            
            switch (this.currentMode) {
                case 'matrix':
                    title = isEs ? 'Lluvia Digital Procedimental' : 'Procedural Digital Rain';
                    message = isEs 
                        ? 'Generando una cascada animada de código binario en tiempo real adaptada al tema Matrix.' 
                        : 'Generating a live animated binary code cascade in real-time configured with the Matrix theme.';
                    break;
                case 'cube':
                    title = isEs ? 'Motor Procedimental 3D' : '3D Procedural Engine';
                    message = isEs 
                        ? 'Proyección matemática tridimensional de un cubo giratorio en perspectiva sobre el canvas de caracteres.' 
                        : 'Mathematical 3D projection of a rotating perspective cube onto the character canvas.';
                    break;
                case 'heart':
                    title = isEs ? 'Ecuación Paramétrica' : 'Parametric Equation';
                    message = isEs 
                        ? 'Renderizado de curva de vector cardíaco palpitante usando fórmulas matemáticas polares en tonos de fuego.' 
                        : 'Rendering a pulsating cardiac vector curve using polar mathematical formulas with the fire theme.';
                    break;
                case 'dvd':
                    title = isEs ? 'Logotipo de Rebote DVD' : 'Bouncing DVD Logo';
                    message = isEs 
                        ? 'Simulando el clásico rebote de pantalla vectorial con detección de colisiones físicas en los bordes.' 
                        : 'Simulating the classic screen bounce vector with physics collision detection on the canvas boundaries.';
                    break;
                case 'equalizer':
                    title = isEs ? 'Espectro de Audio' : 'Audio Wave Spectrum';
                    message = isEs 
                        ? 'Calculando ondas de espectro gráfico de audio procedimentales dinámicas en tonos cyberpunk.' 
                        : 'Computing dynamic procedural audio spectrum graphics bars mapped to cyberpunk neon hues.';
                    break;
                case 'fire':
                    title = isEs ? 'Física de Fluidos y Partículas' : 'Fluid & Particle Physics';
                    message = isEs 
                        ? 'Autómata celular de calor ascendente y física de partículas fluidas calientes sobre la grilla ASCII.' 
                        : 'Rising heat cellular automata and hot fluid particle physics computed over the ASCII grid.';
                    break;
                case 'neural':
                    title = isEs ? 'Red Galáctica de Sinapsis' : 'Synaptic Galaxy Network';
                    message = isEs 
                        ? `Nodos y conexiones neuronales interactivas generadas proceduralmente a partir del hash único del texto: ${this.seedHash}.` 
                        : `Interactive neural nodes and synaptic connections procedurally generated from your prompt's unique hash: ${this.seedHash}.`;
                    break;
                case 'ai-image':
                    title = isEs ? 'Pipeline de IA Text-to-Image' : 'Generative AI Text-to-Image';
                    message = isEs 
                        ? 'El Smart Prompt Augmentor enriquece tu texto. Usamos el modelo Flux (768px) + post-procesamiento (auto-contraste, enfoque Gaussiano, filtro Sobel) y deformación Perlin bilineal.' 
                        : 'Smart Prompt Augmentor enriches your prompt. Running Flux model (768px) + 3-stage post-processing (contrast, unsharp mask, Sobel edge) and Perlin bilinear warping.';
                    break;
            }
            window.showToast(title, message, this.currentMode === 'ai-image' ? 'ai' : 'info', 6500);
        }
    }

    setOptions(options) {
        if (options.cols !== undefined) this.cols = parseInt(options.cols);
        if (options.speed !== undefined) this.speed = parseFloat(options.speed);
        if (options.charPalette !== undefined) this.charPalette = options.charPalette;
        if (options.colorTheme !== undefined) this.colorTheme = options.colorTheme;
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.loop();
    }

    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    loop() {
        if (!this.isPlaying) return;

        this.drawProceduralFrame();
        this.convertFrameToASCII();

        this.frameCount++;
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    drawProceduralFrame() {
        // Keep dimensions locked to correct monospace proportions
        const charAspectRatio = 0.55;
        this.rows = Math.round(this.cols * charAspectRatio);

        // Super-sampled render sizes to keep contours high-definition before ASCII mapping
        this.procCanvas.width = this.cols * 2;
        this.procCanvas.height = this.rows * 2;
        
        const w = this.procCanvas.width;
        const h = this.procCanvas.height;
        const ctx = this.procCtx;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        const time = (this.frameCount * 0.05) * this.speed;

        switch (this.currentMode) {
            case 'matrix':
                this.drawMatrixRain(ctx, w, h);
                break;
            case 'cube':
                this.draw3DCube(ctx, w, h, time);
                break;
            case 'heart':
                this.drawPulsingHeart(ctx, w, h, time);
                break;
            case 'dvd':
                this.drawDVDBouncer(ctx, w, h);
                break;
            case 'equalizer':
                this.drawEqualizer(ctx, w, h, time);
                break;
            case 'fire':
                this.drawFire(ctx, w, h, time);
                break;
            case 'ai-image':
                this.drawAIImageWarp(ctx, w, h, time);
                break;
            case 'neural':
            default:
                this.drawNeuralSynapse(ctx, w, h, time);
                break;
        }
    }

    /* --- Sub-algorithms for Drawing --- */

    drawMatrixRain(ctx, w, h) {
        const charSize = 14;
        const columns = Math.floor(w / charSize);
        
        if (this.drops.length !== columns) {
            this.drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -30));
        }

        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Add trace fading
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < columns; i++) {
            const char = String.fromCharCode(48 + Math.floor(Math.random() * 2)); // Binary 0/1 rain
            const x = i * charSize;
            const y = this.drops[i] * charSize;

            if (y >= 0 && y < h) {
                // Draw head character white, others matrix green
                ctx.fillStyle = Math.random() > 0.96 ? '#ffffff' : '#00ff41';
                ctx.fillText(char, x, y);
            }

            if (y > h && Math.random() > 0.97) {
                this.drops[i] = 0;
            }
            this.drops[i] += this.speed * 0.7;
        }
    }

    draw3DCube(ctx, w, h, time) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;

        const vertices = [
            {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1},
            {x: 1, y: 1, z: -1},  {x: -1, y: 1, z: -1},
            {x: -1, y: -1, z: 1},  {x: 1, y: -1, z: 1},
            {x: 1, y: 1, z: 1},   {x: -1, y: 1, z: 1}
        ];
        
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // back
            [4, 5], [5, 6], [6, 7], [7, 4], // front
            [0, 4], [1, 5], [2, 6], [3, 7]  // links
        ];

        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.38;

        const rotX = time * 0.6;
        const rotY = time * 0.4;

        const projected = [];

        vertices.forEach(v => {
            // Rotate X
            let y1 = v.y * Math.cos(rotX) - v.z * Math.sin(rotX);
            let z1 = v.y * Math.sin(rotX) + v.z * Math.cos(rotX);
            
            // Rotate Y
            let x2 = v.x * Math.cos(rotY) + z1 * Math.sin(rotY);
            let z2 = -v.x * Math.sin(rotY) + z1 * Math.cos(rotY);

            // Project perspective
            const d = 3.0;
            const factor = scale / (d + z2);
            projected.push({
                x: cx + x2 * factor * 2,
                y: cy + y1 * factor * 2
            });
        });

        // Draw edges
        ctx.beginPath();
        edges.forEach(e => {
            const p1 = projected[e[0]];
            const p2 = projected[e[1]];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        });
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    drawPulsingHeart(ctx, w, h, time) {
        ctx.fillStyle = '#ff2a5f';
        const cx = w / 2;
        const cy = h / 2 - 10;
        
        // Calculate pulse scaling based on sine wave
        const pulse = 1.0 + Math.sin(time * 2.5) * 0.12;
        const scale = Math.min(w, h) * 0.08 * pulse;

        ctx.beginPath();
        // Trace heart equation
        for (let t = 0; t < Math.PI * 2; t += 0.02) {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            
            const px = cx + x * scale;
            const py = cy - y * scale; // Invert Y axis for screen

            if (t === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Subtitle prompt typewriter-like aesthetic overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('<3 GENERATED WITH LOVE <3', cx, h - 20);
    }

    drawDVDBouncer(ctx, w, h) {
        // Move DVD box
        this.dvd.x += this.dvd.dx * this.speed;
        this.dvd.y += this.dvd.dy * this.speed;

        // Collision logic
        if (this.dvd.x <= 0 || this.dvd.x + this.dvd.sizeX >= w) {
            this.dvd.dx = -this.dvd.dx;
            this.dvd.colorIdx = (this.dvd.colorIdx + 1) % this.dvdColors.length;
            this.dvd.x = Math.max(0, Math.min(this.dvd.x, w - this.dvd.sizeX));
        }

        if (this.dvd.y <= 0 || this.dvd.y + this.dvd.sizeY >= h) {
            this.dvd.dy = -this.dvd.dy;
            this.dvd.colorIdx = (this.dvd.colorIdx + 1) % this.dvdColors.length;
            this.dvd.y = Math.max(0, Math.min(this.dvd.y, h - this.dvd.sizeY));
        }

        // Draw glowing DVD container box
        const color = this.dvdColors[this.dvd.colorIdx];
        ctx.fillStyle = color;
        ctx.fillRect(this.dvd.x, this.dvd.y, this.dvd.sizeX, this.dvd.sizeY);

        // Print inner white DVD letters
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('DVD', this.dvd.x + this.dvd.sizeX / 2, this.dvd.y + this.dvd.sizeY / 2 + 3);
    }

    drawEqualizer(ctx, w, h, time) {
        const barCount = 14;
        const barSpacing = Math.floor(w / barCount);
        
        if (this.eqBars.length !== barCount) {
            this.eqBars = Array(barCount).fill(0).map(() => Math.random() * 0.8 + 0.1);
        }

        ctx.fillStyle = '#10b981';

        for (let i = 0; i < barCount; i++) {
            // Oscillate heights with sine noise
            const noise = Math.sin(time * 3 + i * 0.7) * 0.3;
            const val = Math.max(0.1, Math.min(0.95, this.eqBars[i] + noise));
            
            const barW = barSpacing - 6;
            const barH = h * 0.7 * val;
            const x = i * barSpacing + 3;
            const y = h - barH - 10;

            // Draw segmented equalizer blocks
            const grad = ctx.createLinearGradient(0, h - 10, 0, 10);
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(0.6, '#f59e0b');
            grad.addColorStop(0.95, '#ef4444');

            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barW, barH);
        }
    }

    drawFire(ctx, w, h, time) {
        // Procedural warm floating flame circles
        const pCount = 35;
        for (let i = 0; i < pCount; i++) {
            const seed = i * 29.3;
            const x = (w / 2) + Math.sin(time * 0.4 + seed) * (w * 0.35);
            const y = h - ((time * 65 + seed * 8) % (h * 1.15));
            const size = 18 + Math.sin(time * 0.8 + seed) * 12;

            const radialGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
            radialGrad.addColorStop(0, 'rgba(255, 230, 80, 0.95)');
            radialGrad.addColorStop(0.2, 'rgba(249, 115, 22, 0.85)');
            radialGrad.addColorStop(0.55, 'rgba(239, 68, 68, 0.55)');
            radialGrad.addColorStop(0.9, 'rgba(120, 20, 120, 0.15)');
            radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = radialGrad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Seed-based custom brain node map
    drawNeuralSynapse(ctx, w, h, time) {
        // Deterministic particle creation based on the prompt seed
        const particleCount = 20 + (this.seedHash % 15);
        if (this.nodes.length !== particleCount) {
            this.nodes = [];
            for (let i = 0; i < particleCount; i++) {
                // Deterministic coordinates utilizing sin/cos of seed multiplication
                const sx = Math.sin(this.seedHash + i * 4.7) * (w * 0.38) + (w / 2);
                const sy = Math.cos(this.seedHash + i * 2.3) * (h * 0.32) + (h / 2);
                const speedScale = 0.5 + ((this.seedHash + i) % 4) * 0.3;

                this.nodes.push({
                    x: sx,
                    y: sy,
                    vx: Math.cos(i * 1.1) * speedScale * 0.8,
                    vy: Math.sin(i * 1.5) * speedScale * 0.8,
                    radius: 3 + ((this.seedHash + i) % 5)
                });
            }
        }

        // Connect nodes based on distance threshold
        const maxDist = 70 + (this.seedHash % 30);
        ctx.lineWidth = 1;
        
        ctx.strokeStyle = this.colorTheme === 'matrix' ? 'rgba(0, 255, 65, 0.25)' : 
                          this.colorTheme === 'fire' ? 'rgba(239, 68, 68, 0.25)' : 
                          this.colorTheme === 'cyberpunk' ? 'rgba(217, 70, 239, 0.25)' : 
                          'rgba(0, 242, 254, 0.25)';

        for (let i = 0; i < this.nodes.length; i++) {
            const n1 = this.nodes[i];
            
            // Move node
            n1.x += n1.vx * this.speed;
            n1.y += n1.vy * this.speed;

            // Bounce bounds
            if (n1.x < 10 || n1.x > w - 10) n1.vx *= -1;
            if (n1.y < 10 || n1.y > h - 10) n1.vy *= -1;

            // Check distance and draw synapse lines
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n2 = this.nodes[j];
                const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                
                if (dist < maxDist) {
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }

        // Draw glowing neural nodes
        ctx.fillStyle = this.colorTheme === 'matrix' ? '#00ff41' : 
                        this.colorTheme === 'fire' ? '#ef4444' : 
                        this.colorTheme === 'cyberpunk' ? '#d946ef' : 
                        '#00f2fe';

        for (let i = 0; i < this.nodes.length; i++) {
            const n = this.nodes[i];
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dynamic textual console seed status
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`[NEURAL AI MAP PROCESSING PROMPT: "${this.promptText.toUpperCase()}"]`, 20, 25);
        ctx.fillText(`[SEED SECTOR CODE: #${this.seedHash.toString(16).toUpperCase()}]`, 20, 37);
        ctx.fillText(`[SYNAPSES ENTRANCES: ${this.nodes.length} ACTIVE NODES]`, 20, 49);
    }

    // ---- Smart Prompt Augmentation ----
    augmentPrompt(rawPrompt) {
        const qualityBoost = [
            'highly detailed', 'sharp focus', 'cinematic lighting',
            'vibrant colors', '4k resolution', 'professional photography',
            'dramatic composition', 'masterpiece quality'
        ];
        // Don't double-add if user already included quality terms
        const lower = rawPrompt.toLowerCase();
        const extras = qualityBoost.filter(q => !lower.includes(q.split(' ')[0]));
        return `${rawPrompt}, ${extras.join(', ')}`;
    }

    triggerImageGeneration(prompt) {
        this.loadedImage = null;
        this.cachedCanvas = null;
        this.cachedPixels = null;
        this.enhancedPixels = null;

        const enhancedPrompt = this.augmentPrompt(prompt);

        const img = new Image();
        img.crossOrigin = "anonymous";
        // Higher resolution (768) + flux model for significantly better quality
        img.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=768&height=768&nologo=true&model=flux&seed=${this.seedHash}`;

        img.onload = () => {
            if (this.currentMode !== 'ai-image' || this.promptText !== prompt) return;
            this.loadedImage = img;

            // Use a high-res intermediate cache for post-processing
            const cacheW = Math.max(this.cols * 2, 400);
            const cacheH = Math.max(this.rows * 2, 220);

            this.cachedCanvas = document.createElement('canvas');
            this.cachedCanvas.width = cacheW;
            this.cachedCanvas.height = cacheH;

            const cacheCtx = this.cachedCanvas.getContext('2d', { willReadFrequently: true });
            cacheCtx.drawImage(img, 0, 0, cacheW, cacheH);

            // Apply full post-processing pipeline
            this.applyPostProcessing(cacheCtx, cacheW, cacheH);

            this.cachedPixels = cacheCtx.getImageData(0, 0, cacheW, cacheH);
        };

        img.onerror = (e) => {
            console.error("Generative Text-to-Image API error:", e);
            // Try fallback without flux model
            const fallbackImg = new Image();
            fallbackImg.crossOrigin = "anonymous";
            fallbackImg.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=768&height=768&nologo=true&seed=${this.seedHash}`;
            fallbackImg.onload = () => {
                if (this.currentMode !== 'ai-image' || this.promptText !== prompt) return;
                this.loadedImage = fallbackImg;
                const cacheW = Math.max(this.cols * 2, 400);
                const cacheH = Math.max(this.rows * 2, 220);
                this.cachedCanvas = document.createElement('canvas');
                this.cachedCanvas.width = cacheW;
                this.cachedCanvas.height = cacheH;
                const cacheCtx = this.cachedCanvas.getContext('2d', { willReadFrequently: true });
                cacheCtx.drawImage(fallbackImg, 0, 0, cacheW, cacheH);
                this.applyPostProcessing(cacheCtx, cacheW, cacheH);
                this.cachedPixels = cacheCtx.getImageData(0, 0, cacheW, cacheH);
            };
            fallbackImg.onerror = () => {
                console.error("Fallback Text-to-Image also failed, switching to neural mode");
                this.currentMode = 'neural';
                this.colorTheme = 'fire';
            };
        };
    }

    // ---- Post-Processing Pipeline ----

    applyPostProcessing(ctx, w, h) {
        // Step 1: Auto-Contrast (histogram stretch)
        this.applyAutoContrast(ctx, w, h);
        // Step 2: Unsharp Mask (sharpen edges for ASCII clarity)
        this.applyUnsharpMask(ctx, w, h, 1.2);
        // Step 3: Subtle edge enhancement for character definition
        this.applyEdgeEnhance(ctx, w, h, 0.3);
    }

    applyAutoContrast(ctx, w, h) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        let minL = 255, maxL = 0;

        // Find actual luminance range
        for (let i = 0; i < d.length; i += 4) {
            const lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
            if (lum < minL) minL = lum;
            if (lum > maxL) maxL = lum;
        }

        // Clamp extremes (ignore bottom/top 1% to avoid outlier dominance)
        const hist = new Uint32Array(256);
        for (let i = 0; i < d.length; i += 4) {
            const lum = Math.round(0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]);
            hist[lum]++;
        }
        const totalPx = (w * h);
        const clipLow = totalPx * 0.01;
        const clipHigh = totalPx * 0.99;
        let cumul = 0;
        for (let i = 0; i < 256; i++) {
            cumul += hist[i];
            if (cumul >= clipLow) { minL = i; break; }
        }
        cumul = 0;
        for (let i = 255; i >= 0; i--) {
            cumul += hist[i];
            if (cumul >= totalPx - clipHigh) { maxL = i; break; }
        }

        if (maxL <= minL) return; // Already full range or flat image

        const range = maxL - minL;
        for (let i = 0; i < d.length; i += 4) {
            d[i]   = Math.min(255, Math.max(0, ((d[i] - minL) / range) * 255));
            d[i+1] = Math.min(255, Math.max(0, ((d[i+1] - minL) / range) * 255));
            d[i+2] = Math.min(255, Math.max(0, ((d[i+2] - minL) / range) * 255));
        }

        ctx.putImageData(imgData, 0, 0);
    }

    applyUnsharpMask(ctx, w, h, strength) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const orig = new Uint8ClampedArray(d); // Copy original

        // 3x3 Gaussian blur approximation kernel
        const kernel = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let blurred = 0;
                    let ki = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
                            blurred += orig[idx] * kernel[ki++];
                        }
                    }
                    const idx = (y * w + x) * 4 + c;
                    // Unsharp: original + strength * (original - blurred)
                    d[idx] = Math.min(255, Math.max(0, Math.round(orig[idx] + strength * (orig[idx] - blurred))));
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    applyEdgeEnhance(ctx, w, h, weight) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const gray = new Float32Array(w * h);

        // Convert to grayscale
        for (let i = 0; i < w * h; i++) {
            const idx = i * 4;
            gray[i] = 0.299 * d[idx] + 0.587 * d[idx+1] + 0.114 * d[idx+2];
        }

        // Sobel edge detection (magnitude only)
        const edges = new Float32Array(w * h);
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const tl = gray[(y-1)*w+(x-1)], tc = gray[(y-1)*w+x], tr = gray[(y-1)*w+(x+1)];
                const ml = gray[y*w+(x-1)],                          mr = gray[y*w+(x+1)];
                const bl = gray[(y+1)*w+(x-1)], bc = gray[(y+1)*w+x], br = gray[(y+1)*w+(x+1)];

                const gx = -tl - 2*ml - bl + tr + 2*mr + br;
                const gy = -tl - 2*tc - tr + bl + 2*bc + br;

                edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
            }
        }

        // Blend edges into original image for enhanced contours
        for (let i = 0; i < w * h; i++) {
            const idx = i * 4;
            const edgeVal = Math.min(255, edges[i] * weight);
            d[idx]   = Math.min(255, d[idx] + edgeVal);
            d[idx+1] = Math.min(255, d[idx+1] + edgeVal);
            d[idx+2] = Math.min(255, d[idx+2] + edgeVal);
        }

        ctx.putImageData(imgData, 0, 0);
    }

    drawAIImageWarp(ctx, w, h, time) {
        if (!this.loadedImage || !this.cachedPixels) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);
            
            // Animated loading screen with progress dots
            const dotCount = Math.floor(time * 3) % 4;
            const dots = '.'.repeat(dotCount);
            
            ctx.fillStyle = '#00f2fe';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            
            const blink = Math.floor(time * 2.0) % 2 === 0 ? '█' : ' ';
            ctx.fillText(`SINTETIZANDO IMAGEN POR IA${dots}${blink}`, w / 2, h / 2 - 20);
            
            // Animated loading bar
            const barW = w * 0.5;
            const barH = 4;
            const barX = (w - barW) / 2;
            const barY = h / 2;
            ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
            ctx.fillRect(barX, barY, barW, barH);
            const progress = (Math.sin(time * 1.5) + 1) / 2;
            ctx.fillStyle = '#00f2fe';
            ctx.fillRect(barX, barY, barW * progress, barH);
            
            ctx.font = '10px monospace';
            ctx.fillStyle = 'rgba(0, 242, 254, 0.7)';
            ctx.fillText(`PROMPT: "${this.promptText.toUpperCase()}"`, w / 2, h / 2 + 20);
            ctx.fillText("MODELO FLUX • POST-PROCESAMIENTO AVANZADO", w / 2, h / 2 + 37);
            return;
        }

        const dstW = this.cols * 2;
        const dstH = this.rows * 2;

        if (this.cachedPixels.width !== dstW || this.cachedPixels.height !== dstH) {
            const cacheW = dstW;
            const cacheH = dstH;
            this.cachedCanvas = document.createElement('canvas');
            this.cachedCanvas.width = cacheW;
            this.cachedCanvas.height = cacheH;
            const cacheCtx = this.cachedCanvas.getContext('2d', { willReadFrequently: true });
            cacheCtx.drawImage(this.loadedImage, 0, 0, cacheW, cacheH);
            // Re-apply post-processing at new size
            this.applyPostProcessing(cacheCtx, cacheW, cacheH);
            this.cachedPixels = cacheCtx.getImageData(0, 0, cacheW, cacheH);
        }

        const tempImgData = this.procCtx.createImageData(dstW, dstH);
        const dst = tempImgData.data;
        const src = this.cachedPixels.data;
        const srcW = this.cachedPixels.width;
        const srcH = this.cachedPixels.height;

        // Organic breathing: slow global zoom pulse
        const breathe = 1.0 + Math.sin(time * 0.4) * 0.015;
        const centerX = 0.5;
        const centerY = 0.5;

        for (let y = 0; y < dstH; y++) {
            for (let x = 0; x < dstW; x++) {
                let nx = x / dstW;
                let ny = y / dstH;

                // Apply breathing (zoom from center)
                nx = centerX + (nx - centerX) * breathe;
                ny = centerY + (ny - centerY) * breathe;

                // ---- Multi-Layer Flow Field Deformation ----

                // Layer 1: Primary slow wave (low frequency, large displacement)
                let dx = Math.sin(time * 0.8 + ny * 4.0) * 0.018;
                let dy = Math.cos(time * 0.8 + nx * 4.0) * 0.018;

                // Layer 2: Secondary medium wave (medium freq, medium displacement)
                dx += Math.sin(time * 1.5 + ny * 8.0 + nx * 2.0) * 0.010;
                dy += Math.cos(time * 1.3 + nx * 7.0 + ny * 3.0) * 0.010;

                // Layer 3: High-frequency turbulence (pseudo-Perlin with harmonic summing)
                dx += Math.sin(time * 2.8 + ny * 16.0 + nx * 9.0) * 0.004;
                dy += Math.cos(time * 2.5 + nx * 14.0 + ny * 11.0) * 0.004;

                // Layer 4: Rotational swirl (subtle vortex around center)
                const distFromCenter = Math.sqrt((nx - 0.5) * (nx - 0.5) + (ny - 0.5) * (ny - 0.5));
                const swirlAngle = distFromCenter * Math.sin(time * 0.3) * 0.5;
                const cosA = Math.cos(swirlAngle);
                const sinA = Math.sin(swirlAngle);
                const relX = nx - 0.5;
                const relY = ny - 0.5;
                nx = 0.5 + relX * cosA - relY * sinA;
                ny = 0.5 + relX * sinA + relY * cosA;

                // Apply displacements
                nx += dx;
                ny += dy;

                // ---- Bilinear Interpolation ----
                const fx = nx * srcW - 0.5;
                const fy = ny * srcH - 0.5;

                const x0 = Math.floor(fx);
                const y0 = Math.floor(fy);
                const x1 = x0 + 1;
                const y1 = y0 + 1;

                const wx = fx - x0;
                const wy = fy - y0;

                // Clamp coordinates
                const cx0 = Math.max(0, Math.min(srcW - 1, x0));
                const cy0 = Math.max(0, Math.min(srcH - 1, y0));
                const cx1 = Math.max(0, Math.min(srcW - 1, x1));
                const cy1 = Math.max(0, Math.min(srcH - 1, y1));

                const i00 = (cy0 * srcW + cx0) * 4;
                const i10 = (cy0 * srcW + cx1) * 4;
                const i01 = (cy1 * srcW + cx0) * 4;
                const i11 = (cy1 * srcW + cx1) * 4;

                const dstIdx = (y * dstW + x) * 4;

                // Bilinear blend for each channel
                for (let c = 0; c < 3; c++) {
                    const v00 = src[i00 + c];
                    const v10 = src[i10 + c];
                    const v01 = src[i01 + c];
                    const v11 = src[i11 + c];

                    const top = v00 + (v10 - v00) * wx;
                    const bot = v01 + (v11 - v01) * wx;
                    let val = top + (bot - top) * wy;

                    // Gamma correction (slight boost for ASCII readability)
                    val = Math.pow(val / 255.0, 0.92) * 255.0;

                    dst[dstIdx + c] = Math.min(255, Math.max(0, Math.round(val)));
                }
                dst[dstIdx + 3] = 255; // Full alpha
            }
        }

        this.procCtx.putImageData(tempImgData, 0, 0);
    }

    /* --- ASCII Mapping Algorithm --- */

    convertFrameToASCII() {
        // Downsample procedural super-sampled canvas to exactly target column/row layout
        const downCanvas = document.createElement('canvas');
        downCanvas.width = this.cols;
        downCanvas.height = this.rows;
        const downCtx = downCanvas.getContext('2d');
        downCtx.drawImage(this.procCanvas, 0, 0, this.cols, this.rows);

        const imgData = downCtx.getImageData(0, 0, this.cols, this.rows);
        const pixels = imgData.data;

        // Prep visible display canvas dimensions
        const fontSize = 10;
        this.canvas.width = this.cols * 6;
        this.canvas.height = this.rows * 10;
        
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `${fontSize}px 'Fira Code', monospace`;
        this.ctx.textBaseline = 'top';

        const palette = this.palettes[this.charPalette] || this.palettes.standard;
        const paletteLen = palette.length;

        let textBuffer = '';

        for (let y = 0; y < this.rows; y++) {
            let rowText = '';
            for (let x = 0; x < this.cols; x++) {
                const idx = (y * this.cols + x) * 4;
                let r = pixels[idx];
                let g = pixels[idx + 1];
                let b = pixels[idx + 2];

                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // Improved character selection with gamma curve for better tonal distribution
                const gammaGray = Math.pow(gray / 255.0, 0.85) * 255.0;
                const charIdx = Math.min(paletteLen - 1, Math.floor((gammaGray / 255.0) * paletteLen));
                const char = palette[charIdx] || ' ';

                rowText += char;

                const charX = x * 6;
                const charY = y * 10;

                // Handle themed color profiles
                if (this.colorTheme === 'matrix') {
                    const intensity = Math.round(50 + (gray / 255.0) * 205);
                    this.ctx.fillStyle = `rgb(0, ${intensity}, 0)`;
                } else if (this.colorTheme === 'fire') {
                    const warmR = Math.min(255, Math.round(gray * 2.2));
                    const warmG = Math.min(255, Math.round(gray * 0.8));
                    const warmB = Math.min(255, Math.round(gray * 0.1));
                    this.ctx.fillStyle = `rgb(${warmR}, ${warmG}, ${warmB})`;
                } else if (this.colorTheme === 'cyberpunk') {
                    const mix = (x / this.cols) * 0.5 + (gray / 255.0) * 0.5;
                    const rVal = Math.round(217 * mix);
                    const gVal = Math.round(70 * mix + (1 - mix) * 242);
                    const bVal = Math.round(239 * mix + (1 - mix) * 254);
                    this.ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
                } else if (this.colorTheme === 'neon') {
                    // Enhanced color preservation for AI images
                    if (gray < 8) {
                        // Near-black: subtle dark glow instead of pure black
                        this.ctx.fillStyle = 'rgba(15, 15, 25, 0.9)';
                    } else {
                        // Saturation boost: push colors away from gray center
                        const avg = (r + g + b) / 3;
                        const satBoost = 1.35;
                        const boostedR = Math.min(255, Math.max(0, Math.round(avg + (r - avg) * satBoost)));
                        const boostedG = Math.min(255, Math.max(0, Math.round(avg + (g - avg) * satBoost)));
                        const boostedB = Math.min(255, Math.max(0, Math.round(avg + (b - avg) * satBoost)));
                        this.ctx.fillStyle = `rgb(${boostedR}, ${boostedG}, ${boostedB})`;
                    }
                } else {
                    // Monochrome (White)
                    this.ctx.fillStyle = '#ffffff';
                }

                this.ctx.fillText(char, charX, charY);
            }
            textBuffer += rowText + '\n';
        }

        // Apply visual classes to terminal pre element
        if (this.colorTheme === 'matrix') {
            this.container.className = 'ascii-output green';
        } else if (this.colorTheme === 'fire') {
            this.container.className = 'ascii-output amber';
        } else {
            this.container.className = 'ascii-output colorized';
        }
        
        this.container.textContent = textBuffer;
    }
}
