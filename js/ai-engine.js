/*
 * AI Prompt-to-ASCII Procedural Generator
 * Uses keyword matching and mathematically animated HTML5 Canvas canvases 
 * to procedurally generate 2D/3D visual styles in high-fidelity ASCII.
 */

class AIPromptEngine {
    constructor(outputContainer, outputCanvas) {
        this.container = outputContainer;
        this.canvas = outputCanvas;
        this.ctx = this.canvas.getContext('2d');

        // Processing canvas for ASCII conversion
        this.procCanvas = document.createElement('canvas');
        this.procCtx = this.procCanvas.getContext('2d', { willReadFrequently: true });

        // Configuration
        this.cols = 100;
        this.rows = 40;
        this.speed = 1.0;
        this.colorTheme = 'matrix'; // 'matrix', 'cyberpunk', 'fire', 'neon', 'monochrome'
        this.charPalette = 'standard';
        
        // Loop controls
        this.animationId = null;
        this.isPlaying = false;
        this.frameCount = 0;
        this.promptText = '';
        this.currentMode = 'cosmic'; // Default fallback mode

        // Palettes
        this.palettes = {
            standard: '@#W$9876543210?!abc;:+=-,. ',
            extended: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
            blocks: '█▓▒░ ',
            binary: '01 '
        };

        // State variables for different generator modes
        this.initEngineStates();
    }

    initEngineStates() {
        // Matrix Rain State
        this.matrixDrops = [];
        
        // Starfield State
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 1000,
                y: (Math.random() - 0.5) * 1000,
                z: Math.random() * 1000
            });
        }

        // 3D Geometry vertices (Cube)
        this.cubeVertices = [
            {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1},
            {x: 1, y: 1, z: -1},  {x: -1, y: 1, z: -1},
            {x: -1, y: -1, z: 1},  {x: 1, y: -1, z: 1},
            {x: 1, y: 1, z: 1},   {x: -1, y: 1, z: 1}
        ];
        
        this.cubeEdges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Back face
            [4, 5], [5, 6], [6, 7], [7, 4], // Front face
            [0, 4], [1, 5], [2, 6], [3, 7]  // Connectors
        ];

        // 3D angles
        this.angleX = 0;
        this.angleY = 0;
        this.angleZ = 0;
    }

    setOptions(options) {
        if (options.cols !== undefined) this.cols = parseInt(options.cols);
        if (options.rows !== undefined) this.rows = parseInt(options.rows);
        if (options.speed !== undefined) this.speed = parseFloat(options.speed);
        if (options.colorTheme !== undefined) this.colorTheme = options.colorTheme;
        if (options.charPalette !== undefined) this.charPalette = options.charPalette;
    }

    parsePrompt(prompt) {
        this.promptText = prompt.toLowerCase().trim();
        this.initEngineStates(); // Reset animation states
        this.frameCount = 0;

        // Semantic keyword routing
        if (this.promptText.includes('matrix') || this.promptText.includes('rain') || this.promptText.includes('digital') || this.promptText.includes('hacker')) {
            this.currentMode = 'matrix';
            this.colorTheme = 'matrix';
        } else if (this.promptText.includes('fire') || this.promptText.includes('flame') || this.promptText.includes('burning') || this.promptText.includes('lava') || this.promptText.includes('hell')) {
            this.currentMode = 'fire';
            this.colorTheme = 'fire';
        } else if (this.promptText.includes('cube') || this.promptText.includes('3d') || this.promptText.includes('box') || this.promptText.includes('geometry')) {
            this.currentMode = 'cube3d';
            this.colorTheme = 'cyberpunk';
        } else if (this.promptText.includes('torus') || this.promptText.includes('donut') || this.promptText.includes('ring')) {
            this.currentMode = 'torus3d';
            this.colorTheme = 'neon';
        } else if (this.promptText.includes('star') || this.promptText.includes('space') || this.promptText.includes('galaxy') || this.promptText.includes('tunnel')) {
            this.currentMode = 'starfield';
            this.colorTheme = 'neon';
        } else if (this.promptText.includes('ocean') || this.promptText.includes('wave') || this.promptText.includes('water') || this.promptText.includes('sea')) {
            this.currentMode = 'ocean';
            this.colorTheme = 'cyberpunk';
        } else if (this.promptText.includes('fractal') || this.promptText.includes('mandelbrot') || this.promptText.includes('math') || this.promptText.includes('infinity')) {
            this.currentMode = 'fractal';
            this.colorTheme = 'cyberpunk';
        } else {
            // Cosmic vortex fallback
            this.currentMode = 'cosmic';
            if (this.promptText.includes('cyberpunk') || this.promptText.includes('synthwave')) {
                this.colorTheme = 'cyberpunk';
            } else if (this.promptText.includes('retro') || this.promptText.includes('vintage') || this.promptText.includes('old')) {
                this.colorTheme = 'monochrome';
            } else {
                this.colorTheme = 'neon';
            }
        }
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

        this.generateProceduralFrame();
        this.convertFrameToASCII();

        this.frameCount++;
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    // Procedural Renderers (Draws onto procCanvas)
    generateProceduralFrame() {
        // Adjust grid dimensions dynamically
        const charAspectRatio = 0.55; 
        const adjustedRows = Math.round(this.cols * charAspectRatio);
        this.rows = adjustedRows;

        this.procCanvas.width = this.cols * 2; // Extra super-sample resolution
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
            case 'fire':
                this.drawFire(ctx, w, h, time);
                break;
            case 'cube3d':
                this.drawCube3D(ctx, w, h, time);
                break;
            case 'torus3d':
                this.drawTorus3D(ctx, w, h, time);
                break;
            case 'starfield':
                this.drawStarfield(ctx, w, h);
                break;
            case 'ocean':
                this.drawOcean(ctx, w, h, time);
                break;
            case 'fractal':
                this.drawFractal(ctx, w, h, time);
                break;
            case 'cosmic':
            default:
                this.drawCosmicVortex(ctx, w, h, time);
                break;
        }
    }

    /* --- Procedural Draw Algorithms --- */

    drawMatrixRain(ctx, w, h) {
        const columns = Math.floor(w / 12);
        if (this.matrixDrops.length !== columns) {
            this.matrixDrops = Array(columns).fill(1);
        }

        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < this.matrixDrops.length; i++) {
            const char = String.fromCharCode(33 + Math.floor(Math.random() * 93));
            const x = i * 12;
            const y = this.matrixDrops[i] * 12;

            // Gradient matrix glow
            ctx.fillStyle = Math.random() > 0.98 ? '#ffffff' : '#00ff00';
            ctx.fillText(char, x, y);

            if (y > h && Math.random() > 0.975) {
                this.matrixDrops[i] = 0;
            }
            this.matrixDrops[i] += this.speed * 0.5;
        }
    }

    drawFire(ctx, w, h, time) {
        // Draw fire particles floating upwards
        const particleCount = 60;
        ctx.filter = 'blur(4px)';
        for (let i = 0; i < particleCount; i++) {
            const seed = i * 13.7;
            const size = 15 + Math.sin(time + seed) * 10;
            const x = (w / 2) + Math.sin(time * 0.5 + seed) * (w * 0.4) + Math.cos(time + seed) * 10;
            const y = h - ((time * 80 + seed * 10) % (h * 1.1));
            
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
            grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.7)');
            grad.addColorStop(0.6, 'rgba(120, 20, 120, 0.3)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.filter = 'none';
        
        // Base heat source
        const bottomGrad = ctx.createLinearGradient(0, h - 15, 0, h);
        bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        bottomGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.6)');
        bottomGrad.addColorStop(1, 'rgba(255, 240, 100, 1)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, h - 20, w, 20);
    }

    drawCube3D(ctx, w, h, time) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;

        // Set rotation angles
        this.angleX = time * 0.5;
        this.angleY = time * 0.3;
        
        const scale = Math.min(w, h) * 0.35;
        const cx = w / 2;
        const cy = h / 2;

        const projected = [];

        // Rotate and project vertices
        for (let i = 0; i < this.cubeVertices.length; i++) {
            const v = this.cubeVertices[i];
            
            // Rotate X
            let y1 = v.y * Math.cos(this.angleX) - v.z * Math.sin(this.angleX);
            let z1 = v.y * Math.sin(this.angleX) + v.z * Math.cos(this.angleX);
            
            // Rotate Y
            let x2 = v.x * Math.cos(this.angleY) + z1 * Math.sin(this.angleY);
            let z2 = -v.x * Math.sin(this.angleY) + z1 * Math.cos(this.angleY);

            // Simple perspective projection
            const fov = 3.5;
            const distance = 4;
            const f = scale / (distance + z2);
            
            projected.push({
                x: cx + x2 * f * fov,
                y: cy + y1 * f * fov
            });
        }

        // Draw edges
        for (let i = 0; i < this.cubeEdges.length; i++) {
            const e = this.cubeEdges[i];
            const p1 = projected[e[0]];
            const p2 = projected[e[1]];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        // Add visual flair to show "AI computing"
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        projected.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.shadowBlur = 0; // Reset shadow
    }

    drawTorus3D(ctx, w, h, time) {
        ctx.fillStyle = '#d946ef';
        const R = 1.8; // Major radius
        const r = 0.75; // Minor radius
        const scale = Math.min(w, h) * 0.16;
        const cx = w / 2;
        const cy = h / 2;

        const angleX = time * 0.4;
        const angleY = time * 0.25;

        // Render point cloud torus
        for (let theta = 0; theta < Math.PI * 2; theta += 0.2) {
            for (let phi = 0; phi < Math.PI * 2; phi += 0.12) {
                // Torus geometry equation
                const x0 = (R + r * Math.cos(phi)) * Math.cos(theta);
                const y0 = (R + r * Math.cos(phi)) * Math.sin(theta);
                const z0 = r * Math.sin(phi);

                // Rotate X
                let y1 = y0 * Math.cos(angleX) - z0 * Math.sin(angleX);
                let z1 = y0 * Math.sin(angleX) + z0 * Math.cos(angleX);

                // Rotate Y
                let x2 = x0 * Math.cos(angleY) + z1 * Math.sin(angleY);
                let z2 = -x0 * Math.sin(angleY) + z1 * Math.cos(angleY);

                // Projection
                const distance = 4;
                const ooz = 1 / (distance + z2); // One over Z
                const xp = Math.round(cx + x2 * scale * 2.5 * ooz);
                const yp = Math.round(cy + y1 * scale * 4 * ooz); // Adjust for taller characters

                // Calculate basic shading value based on surface normal
                const luminance = Math.cos(phi) * Math.cos(theta) * Math.sin(angleY) - Math.cos(angleX) * Math.cos(phi) * Math.sin(theta) - Math.sin(angleX) * Math.sin(phi) + Math.cos(angleY) * (Math.cos(angleX) * Math.sin(phi) - Math.sin(angleX) * Math.cos(phi) * Math.sin(theta));
                
                if (luminance > 0) {
                    const alpha = Math.min(1.0, 0.2 + luminance * 0.8);
                    ctx.fillStyle = `rgba(217, 70, 239, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(xp, yp, Math.round(ooz * 12), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    drawStarfield(ctx, w, h) {
        ctx.fillStyle = '#ffffff';
        const cx = w / 2;
        const cy = h / 2;
        
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            s.z -= this.speed * 8; // Move star forward

            if (s.z <= 0) {
                s.z = 1000;
                s.x = (Math.random() - 0.5) * 1000;
                s.y = (Math.random() - 0.5) * 1000;
            }

            // Project to 2D
            const k = 200 / s.z;
            const px = s.x * k + cx;
            const py = s.y * k + cy;

            if (px >= 0 && px < w && py >= 0 && py < h) {
                const size = (1 - s.z / 1000) * 5;
                const alpha = 1 - s.z / 1000;
                
                // Neon blue glow trail
                ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.3})`;
                ctx.lineWidth = size * 0.5;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px - (s.x * k * 0.15), py - (s.y * k * 0.15));
                ctx.stroke();

                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawOcean(ctx, w, h, time) {
        // Multi-layered scrolling sine wave grids
        const waveCount = 5;
        for (let i = 0; i < waveCount; i++) {
            const offset = i * 25;
            const scale = 20 + i * 10;
            const frequency = 0.015 - i * 0.002;
            const speedWave = time * (0.8 + i * 0.2);

            const baseHeight = (h * 0.45) + (i * 20);

            ctx.beginPath();
            ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 5) {
                const y = baseHeight + Math.sin(x * frequency + speedWave) * scale + Math.cos(x * 0.005 - speedWave) * 10;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(w, h);
            ctx.closePath();

            // Colorful ocean gradient layers
            const grad = ctx.createLinearGradient(0, baseHeight - scale, 0, h);
            if (i % 2 === 0) {
                grad.addColorStop(0, `rgba(0, 242, 254, ${0.4 - i * 0.05})`);
                grad.addColorStop(1, 'rgba(13, 16, 23, 0.8)');
            } else {
                grad.addColorStop(0, `rgba(217, 70, 239, ${0.35 - i * 0.05})`);
                grad.addColorStop(1, 'rgba(13, 16, 23, 0.8)');
            }
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    drawFractal(ctx, w, h, time) {
        // Dynamic zooming Mandelbrot fractal on a small scale canvas
        const maxIter = 24;
        const zoom = 1.0 + (time * 0.2) % 15.0; // Dynamic zoom sequence
        const cx = -0.743643887037158704752191506114774; // Zoom coordinates
        const cy = 0.131825904205311970493132056385139;

        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;

        const wRatio = 3.0 / (w * zoom);
        const hRatio = 2.0 / (h * zoom);

        for (let py = 0; py < h; py++) {
            const y0 = cy + (py - h / 2) * hRatio;
            for (let px = 0; px < w; px++) {
                const x0 = cx + (px - w / 2) * wRatio;
                let x = 0.0;
                let y = 0.0;
                let iteration = 0;
                
                while (x*x + y*y <= 4.0 && iteration < maxIter) {
                    const xtemp = x*x - y*y + x0;
                    y = 2.0*x*y + y0;
                    x = xtemp;
                    iteration++;
                }

                const pixelIdx = (py * w + px) * 4;
                if (iteration === maxIter) {
                    data[pixelIdx] = 0;
                    data[pixelIdx+1] = 0;
                    data[pixelIdx+2] = 0;
                    data[pixelIdx+3] = 255;
                } else {
                    // Gradient map based on iterations
                    const mu = iteration / maxIter;
                    data[pixelIdx] = Math.round(Math.sin(mu * Math.PI) * 200 + 55 * mu);
                    data[pixelIdx+1] = Math.round(Math.sin(mu * Math.PI + Math.PI / 3) * 255);
                    data[pixelIdx+2] = Math.round(Math.cos(mu * Math.PI) * 150 + 105 * mu);
                    data[pixelIdx+3] = 255;
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }

    drawCosmicVortex(ctx, w, h, time) {
        // Glowing spirals representing a deep cosmic mathematical portal
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, w, h);

        const spirals = 3;
        const dots = 80;
        const centerX = w / 2;
        const centerY = h / 2;

        ctx.filter = 'blur(2px)';
        for (let s = 0; s < spirals; s++) {
            const spiralOffset = s * (Math.PI * 2 / spirals);
            for (let i = 0; i < dots; i++) {
                const t = i / dots;
                const r = t * Math.min(w, h) * 0.48;
                const theta = t * 12 + time * 1.5 + spiralOffset;

                const x = centerX + Math.cos(theta) * r;
                const y = centerY + Math.sin(theta) * r * 0.7; // Tilted aspect

                // Alternate neon color nodes
                if (s % 3 === 0) {
                    ctx.fillStyle = `rgba(0, 242, 254, ${t})`;
                } else if (s % 3 === 1) {
                    ctx.fillStyle = `rgba(217, 70, 239, ${t})`;
                } else {
                    ctx.fillStyle = `rgba(16, 185, 129, ${t})`;
                }

                ctx.beginPath();
                ctx.arc(x, y, 2 + t * 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.filter = 'none';
    }

    /* --- ASCII Mapping Algorithm --- */

    convertFrameToASCII() {
        const w = this.procCanvas.width;
        const h = this.procCanvas.height;

        // Downsample super-sampled draw canvas to the exact target column/row layout
        const downCanvas = document.createElement('canvas');
        downCanvas.width = this.cols;
        downCanvas.height = this.rows;
        const downCtx = downCanvas.getContext('2d');
        downCtx.drawImage(this.procCanvas, 0, 0, this.cols, this.rows);

        const imgData = downCtx.getImageData(0, 0, this.cols, this.rows);
        const pixels = imgData.data;

        // Prep high-res canvas rendering
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
                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];

                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const charIdx = Math.floor((gray / 255.0) * (paletteLen - 1));
                const char = palette[charIdx];

                rowText += char;

                const charX = x * 6;
                const charY = y * 10;

                // Colorize based on selected visual theme
                if (this.colorTheme === 'matrix') {
                    const intensity = Math.round(50 + (gray / 255.0) * 205);
                    this.ctx.fillStyle = `rgb(0, ${intensity}, 0)`;
                } else if (this.colorTheme === 'fire') {
                    // Shift RGB colors dynamically from yellow to red depending on intensity
                    const warmR = Math.min(255, Math.round(gray * 2.2));
                    const warmG = Math.min(255, Math.round(gray * 0.8));
                    const warmB = Math.min(255, Math.round(gray * 0.1));
                    this.ctx.fillStyle = `rgb(${warmR}, ${warmG}, ${warmB})`;
                } else if (this.colorTheme === 'cyberpunk') {
                    // Electric blue and neon pink blend based on grid placement and gray value
                    const mix = (x / this.cols) * 0.5 + (gray / 255.0) * 0.5;
                    const rVal = Math.round(217 * mix + (1 - mix) * 0);
                    const gVal = Math.round(70 * mix + (1 - mix) * 242);
                    const bVal = Math.round(239 * mix + (1 - mix) * 254);
                    this.ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
                } else if (this.colorTheme === 'neon') {
                    this.ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                } else {
                    // Monochrome (White)
                    this.ctx.fillStyle = '#ffffff';
                }

                this.ctx.fillText(char, charX, charY);
            }
            textBuffer += rowText + '\n';
        }

        // Render DOM text
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
