/*
 * Web Application Main Orchestrator
 * Interlinks user interface components with the Converter and AI Prompt Engines.
 * Implements multi-language client-side router, drag-and-drop mechanics, controls binding, and FAQ accordions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Language Handling & Client-side Translation Engine
    // -------------------------------------------------------------
    let currentLang = 'es';
    
    function detectLanguage() {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        if (urlLang && ['es', 'en', 'fr', 'pt', 'de'].includes(urlLang)) {
            return urlLang;
        }
        
        const browserLang = navigator.language || navigator.userLanguage;
        const shortLang = browserLang.substring(0, 2).toLowerCase();
        if (['es', 'en', 'fr', 'pt', 'de'].includes(shortLang)) {
            return shortLang;
        }
        return 'es'; // Default
    }

    function translateStaticPage(lang) {
        if (!window.staticTranslations || !window.staticTranslations[lang]) return;
        
        currentLang = lang;
        const dict = window.staticTranslations[lang];

        // Translate elements with data-key attribute
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (dict[key]) {
                // If it contains HTML tags, inject as innerHTML, else textContent
                if (dict[key].includes('<')) {
                    el.innerHTML = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });

        // Translate specific IDs
        const logoText = document.querySelector('#header-logo span');
        if (logoText) logoText.textContent = 'ASCII Player';

        const promptInput = document.getElementById('prompt-input');
        if (promptInput && dict['placeholder_prompt']) {
            promptInput.placeholder = dict['placeholder_prompt'];
        }

        const btnCancel = document.getElementById('btn-cancel-export');
        if (btnCancel) btnCancel.textContent = lang === 'es' ? 'Cancelar' : 'Cancel';

        const promptSettings = document.getElementById('lbl-prompt-settings');
        if (promptSettings) promptSettings.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4"/></svg> ${lang === 'es' ? 'Ajustes del Prompt' : 'Prompt Adjustments'}`;

        const animSpeed = document.getElementById('lbl-anim-speed');
        if (animSpeed) animSpeed.textContent = lang === 'es' ? 'Velocidad de Animación:' : 'Animation Speed:';

        const colorTheme = document.getElementById('lbl-color-theme');
        if (colorTheme) colorTheme.textContent = lang === 'es' ? 'Tema de Colores:' : 'Color Theme:';

        const exportAnim = document.getElementById('lbl-export-anim');
        if (exportAnim) exportAnim.textContent = lang === 'es' ? 'Exportar Animación' : 'Export Animation';

        const footerLangs = document.getElementById('lbl-footer-langs');
        if (footerLangs) footerLangs.textContent = lang === 'es' ? 'Idiomas' : 'Languages';

        const footerNav = document.getElementById('lbl-footer-nav');
        if (footerNav) footerNav.textContent = lang === 'es' ? 'Navegación' : 'Navigation';

        // Update button active state
        document.getElementById('lang-btn').innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"/></svg>
            ${lang.toUpperCase()}
        `;

        document.querySelectorAll('.lang-option').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update document title and html lang attribute
        document.title = dict['title'];
        document.documentElement.lang = lang;

        // Show/hide correct SEO articles based on language (ES / EN / FR / PT / DE)
        const articleEs = document.getElementById('seo-article-es');
        const articleEn = document.getElementById('seo-article-en');
        const articleFr = document.getElementById('seo-article-fr');
        const articlePt = document.getElementById('seo-article-pt');
        const articleDe = document.getElementById('seo-article-de');

        if (articleEs) articleEs.style.display = 'none';
        if (articleEn) articleEn.style.display = 'none';
        if (articleFr) articleFr.style.display = 'none';
        if (articlePt) articlePt.style.display = 'none';
        if (articleDe) articleDe.style.display = 'none';

        if (lang === 'es' && articleEs) {
            articleEs.style.display = 'block';
        } else if (lang === 'fr' && articleFr) {
            articleFr.style.display = 'block';
        } else if (lang === 'pt' && articlePt) {
            articlePt.style.display = 'block';
        } else if (lang === 'de' && articleDe) {
            articleDe.style.display = 'block';
        } else if (articleEn) {
            articleEn.style.display = 'block'; // Fallback to English
        }
    }

    // Set up language selector toggle behavior
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    
    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            langDropdown.classList.remove('show');
        });

        // Binds static index.html language actions
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedLang = btn.getAttribute('data-lang');
                if (selectedLang) {
                    e.preventDefault();
                    translateStaticPage(selectedLang);
                    
                    // Update URL param cleanly without reload
                    const url = new URL(window.location);
                    url.searchParams.set('lang', selectedLang);
                    window.history.pushState({}, '', url);
                }
            });
        });
    }

    // Init translations if we are in static HTML mirror mode
    currentLang = detectLanguage();
    if (window.staticTranslations) {
        translateStaticPage(currentLang);
    }

    // Immediately load cached star count from localStorage to avoid flashing '--' and improve perceived loading speed
    const cachedStars = localStorage.getItem('github_stars_count');
    if (cachedStars) {
        const headerCountEl = document.getElementById('github-stars-count');
        if (headerCountEl) headerCountEl.textContent = cachedStars;
        
        const bodyCountEl = document.getElementById('github-stars-count-body');
        if (bodyCountEl) bodyCountEl.textContent = cachedStars;
    }

    // Dynamic UI synchronizer that animates updates with a glowing pulse
    function updateStarsUI(count) {
        const prevCount = localStorage.getItem('github_stars_count') || '--';
        localStorage.setItem('github_stars_count', count);
        
        // If the number actually changed, trigger an interactive flash/glow to highlight verification
        const isChanged = prevCount !== '--' && String(prevCount) !== String(count);

        const headerCountEl = document.getElementById('github-stars-count');
        if (headerCountEl) {
            headerCountEl.textContent = count;
            if (isChanged) {
                headerCountEl.classList.remove('number-glow-active');
                void headerCountEl.offsetWidth; // Force layout recalculation
                headerCountEl.classList.add('number-glow-active');
            }
        }
        
        const bodyCountEl = document.getElementById('github-stars-count-body');
        if (bodyCountEl) {
            bodyCountEl.textContent = count;
            if (isChanged) {
                bodyCountEl.classList.remove('number-glow-active');
                void bodyCountEl.offsetWidth; // Force layout recalculation
                bodyCountEl.classList.add('number-glow-active');
            }
        }
    }

    // Fetch real-time GitHub repository stargazers count (with cache-busting to ensure real-time updates)
    async function fetchGitHubStars() {
        try {
            // Append timestamp to query to bypass browser cache and force GitHub API to fetch fresh data
            const response = await fetch('https://api.github.com/repos/CoralGamer/ACSII-Video-Convertor---Web-Free?t=' + Date.now(), {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                },
                cache: 'no-store'
            });
            if (response.ok) {
                const data = await response.json();
                const starsCount = data.stargazers_count;
                updateStarsUI(starsCount);
            }
        } catch (e) {
            console.warn("Failed to fetch GitHub stars:", e);
        }
    }

    // Perform initial fetch
    fetchGitHubStars();

    // Re-verify and update stars automatically when the user returns to the tab (tab focus/visibility change)
    window.addEventListener('focus', () => {
        fetchGitHubStars();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            fetchGitHubStars();
        }
    });

    // Provide instant feedback: Auto-increment local UI value immediately when the user clicks the "Dar Estrella / Star" links
    document.querySelectorAll('.btn-github-star, .github-stars-badge').forEach(link => {
        link.addEventListener('click', () => {
            const hasStarred = localStorage.getItem('has_starred_this_session');
            if (!hasStarred) {
                localStorage.setItem('has_starred_this_session', 'true');
                
                // Get current value
                const currentVal = localStorage.getItem('github_stars_count');
                let count = parseInt(currentVal, 10);
                if (isNaN(count)) {
                    count = 0;
                }
                
                // Instantly update UI with the incremented value for zero-latency feedback
                const newCount = count + 1;
                updateStarsUI(newCount);
                
                // Pulse the elements with a cyan glow
                const headerBadge = document.getElementById('header-github-stars');
                if (headerBadge) {
                    headerBadge.classList.remove('star-pulse-active');
                    void headerBadge.offsetWidth;
                    headerBadge.classList.add('star-pulse-active');
                }
                
                const supportBadge = document.querySelector('.github-support-card');
                if (supportBadge) {
                    supportBadge.classList.remove('star-pulse-active');
                    void supportBadge.offsetWidth;
                    supportBadge.classList.add('star-pulse-active');
                }
            }
            
            // Poll in background a few times with delay to capture the real GitHub API registration once complete
            let checkAttempts = 0;
            const checkInterval = setInterval(() => {
                checkAttempts++;
                fetchGitHubStars();
                if (checkAttempts >= 4) {
                    clearInterval(checkInterval);
                }
            }, 3000);
        });
    });

    // -------------------------------------------------------------
    // 2. Tab Navigation
    // -------------------------------------------------------------
    const tabVideoBtn = document.getElementById('tab-btn-video');
    const tabPromptBtn = document.getElementById('tab-btn-prompt');
    const contentVideo = document.getElementById('content-video');
    const contentPrompt = document.getElementById('content-prompt');

    function switchTab(activeTab) {
        if (activeTab === 'video') {
            tabVideoBtn.classList.add('active');
            tabPromptBtn.classList.remove('active');
            contentVideo.classList.add('active');
            contentPrompt.classList.remove('active');
            
            // Stop prompt engine when leaving tab
            if (aiEngine) aiEngine.stop();
            // Start converter if a video is already loaded and was playing
            if (converter && !videoPlayer.paused) converter.start();
        } else {
            tabVideoBtn.classList.remove('active');
            tabPromptBtn.classList.add('active');
            contentVideo.classList.remove('active');
            contentPrompt.classList.add('active');
            
            // Stop video converter loop
            if (converter) converter.stop();
            if (!videoPlayer.paused) videoPlayer.pause();
            
            // Start AI prompt engine
            if (aiEngine) aiEngine.start();
        }
    }

    if (tabVideoBtn && tabPromptBtn) {
        tabVideoBtn.addEventListener('click', () => switchTab('video'));
        tabPromptBtn.addEventListener('click', () => switchTab('prompt'));
    }

    // -------------------------------------------------------------
    // 3. Converter Hookups (Video elements and controls)
    // -------------------------------------------------------------
    const videoPlayer = document.getElementById('hidden-video-player');
    const uploaderZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('video-input');
    const terminalWrapper = document.getElementById('terminal-wrapper');
    const asciiOutputText = document.getElementById('ascii-output-text');
    const outputCanvas = document.getElementById('canvas-video-render');

    // Controls
    const sliderCols = document.getElementById('slider-columns');
    const valCols = document.getElementById('val-columns');
    const selectPalette = document.getElementById('select-palette');
    const selectColor = document.getElementById('select-color');
    const sliderContrast = document.getElementById('slider-contrast');
    const valContrast = document.getElementById('val-contrast');
    const sliderBrightness = document.getElementById('slider-brightness');
    const valBrightness = document.getElementById('val-brightness');
    const sliderGamma = document.getElementById('slider-gamma');
    const valGamma = document.getElementById('val-gamma');
    const checkDither = document.getElementById('check-dither');
    const checkInvert = document.getElementById('check-invert');
    const btnExportVideo = document.getElementById('btn-export-video');

    // Mute/Play UI controls
    const btnPlayPause = document.getElementById('btn-play-pause');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const btnLoop = document.getElementById('btn-loop');
    const btnMute = document.getElementById('btn-mute');
    const unmuteIcon = document.getElementById('unmute-icon');
    const muteIcon = document.getElementById('mute-icon');

    // Advanced Seeker and Time controls
    const playerSeek = document.getElementById('player-seek');
    const playerTimeDisplay = document.getElementById('player-time-display');
    let isSeeking = false;

    let converter = null;

    // Instantiation
    if (videoPlayer && asciiOutputText && outputCanvas) {
        converter = new ASCIIConverter(videoPlayer, asciiOutputText, outputCanvas);
    }

    // Drag-and-drop
    if (uploaderZone && fileInput) {
        uploaderZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploaderZone.classList.add('dragover');
        });

        uploaderZone.addEventListener('dragleave', () => {
            uploaderZone.classList.remove('dragover');
        });

        uploaderZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploaderZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                loadVideo(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                loadVideo(fileInput.files[0]);
            }
        });
    }

    // Format seconds to MM:SS format
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return '00:00';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function loadVideo(file) {
        if (!file.type.startsWith('video/')) {
            alert(currentLang === 'es' ? 'Por favor, cargue un archivo de video compatible.' : 'Please load a compatible video file.');
            return;
        }

        // Revoke previous URL to release RAM
        if (videoPlayer.src) {
            URL.revokeObjectURL(videoPlayer.src);
        }

        const objectURL = URL.createObjectURL(file);
        videoPlayer.src = objectURL;
        videoPlayer.load();

        videoPlayer.onloadeddata = () => {
            // Unveil terminal screen
            uploaderZone.style.display = 'none';
            terminalWrapper.classList.add('active');

            // Apply options initially
            updateConverterOptions();

            // Set up volume controls states
            videoPlayer.volume = 0.5;
            videoPlayer.muted = false;
            videoPlayer.loop = true;
            btnLoop.classList.add('active');

            // Reset scrubber and timer displays
            if (playerSeek) playerSeek.value = 0;
            if (playerTimeDisplay) {
                playerTimeDisplay.textContent = `00:00 / ${formatTime(videoPlayer.duration)}`;
            }

            // Play and start loop
            videoPlayer.play();
            converter.start();
            
            // Toggle buttons
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            btnExportVideo.disabled = false;
        };
    }

    // Connect slider listeners
    function updateConverterOptions() {
        if (!converter) return;

        converter.setOptions({
            cols: sliderCols.value,
            charPalette: selectPalette.value,
            colorMode: selectColor.value,
            contrast: sliderContrast.value,
            brightness: sliderBrightness.value,
            gamma: sliderGamma ? parseFloat(sliderGamma.value) : 1.0,
            dither: checkDither ? checkDither.checked : false,
            invert: checkInvert.checked
        });
    }

    if (sliderCols) {
        sliderCols.addEventListener('input', () => {
            valCols.textContent = sliderCols.value;
            updateConverterOptions();
        });
    }

    if (selectPalette) selectPalette.addEventListener('change', updateConverterOptions);
    if (selectColor) selectColor.addEventListener('change', updateConverterOptions);

    if (sliderContrast) {
        sliderContrast.addEventListener('input', () => {
            valContrast.textContent = sliderContrast.value;
            updateConverterOptions();
        });
    }

    if (sliderBrightness) {
        sliderBrightness.addEventListener('input', () => {
            valBrightness.textContent = sliderBrightness.value;
            updateConverterOptions();
        });
    }

    if (sliderGamma) {
        sliderGamma.addEventListener('input', () => {
            valGamma.textContent = parseFloat(sliderGamma.value).toFixed(1);
            updateConverterOptions();
        });
    }

    if (checkDither) checkDither.addEventListener('change', updateConverterOptions);
    if (checkInvert) checkInvert.addEventListener('change', updateConverterOptions);

    // Dynamic Video Scrubber Update Loops
    if (videoPlayer) {
        videoPlayer.addEventListener('timeupdate', () => {
            if (!isSeeking && playerSeek && playerTimeDisplay) {
                playerSeek.value = (videoPlayer.currentTime / videoPlayer.duration) * 100;
                playerTimeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
            }
            
            // Draw a single frame even if paused, to ensure seek previews translate immediately to ASCII!
            if (videoPlayer.paused && converter && converter.isProcessing) {
                converter.processFrame();
            }
        });

        videoPlayer.addEventListener('durationchange', () => {
            if (playerTimeDisplay) {
                playerTimeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
            }
        });
    }

    // Drag Seek controls behavior
    if (playerSeek) {
        playerSeek.addEventListener('mousedown', () => { isSeeking = true; });
        playerSeek.addEventListener('touchstart', () => { isSeeking = true; });

        playerSeek.addEventListener('input', () => {
            if (videoPlayer.duration) {
                const seekTo = (playerSeek.value / 100) * videoPlayer.duration;
                videoPlayer.currentTime = seekTo;
                if (playerTimeDisplay) {
                    playerTimeDisplay.textContent = `${formatTime(seekTo)} / ${formatTime(videoPlayer.duration)}`;
                }
            }
        });

        playerSeek.addEventListener('mouseup', () => { isSeeking = false; });
        playerSeek.addEventListener('touchend', () => { isSeeking = false; });
    }

    // Audio / Loop Control buttons actions
    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            if (videoPlayer.paused) {
                videoPlayer.play();
                converter.start();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                videoPlayer.pause();
                converter.stop();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        });
    }

    if (btnLoop) {
        btnLoop.addEventListener('click', () => {
            videoPlayer.loop = !videoPlayer.loop;
            btnLoop.classList.toggle('active', videoPlayer.loop);
        });
    }

    if (btnMute) {
        btnMute.addEventListener('click', () => {
            videoPlayer.muted = !videoPlayer.muted;
            if (videoPlayer.muted) {
                unmuteIcon.style.display = 'none';
                muteIcon.style.display = 'block';
            } else {
                unmuteIcon.style.display = 'block';
                muteIcon.style.display = 'none';
            }
        });
    }

    // -------------------------------------------------------------
    // 4. Client Video Exporting (MediaRecorder overlay mechanics)
    // -------------------------------------------------------------
    const exportOverlay = document.getElementById('export-overlay');
    const exportProgress = document.getElementById('export-progress');
    const exportBar = document.getElementById('export-bar');
    const btnCancelExport = document.getElementById('btn-cancel-export');
    const selectExportFormat = document.getElementById('select-export-format');

    // Format Compatibility Helper
    function checkFormatCompatibility(selectElement, warningBoxId) {
        if (!selectElement) return;
        const format = selectElement.value;
        const warningBox = document.getElementById(warningBoxId);
        if (!warningBox) return;

        let isSupported = true;
        if (format === 'mp4') {
            isSupported = MediaRecorder.isTypeSupported('video/mp4;codecs=h264') ||
                          MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2') ||
                          MediaRecorder.isTypeSupported('video/mp4');
        } else if (format === 'mkv') {
            isSupported = MediaRecorder.isTypeSupported('video/x-matroska;codecs=vp9') ||
                          MediaRecorder.isTypeSupported('video/x-matroska;codecs=vp8') ||
                          MediaRecorder.isTypeSupported('video/x-matroska');
        } else if (format === 'mov') {
            isSupported = MediaRecorder.isTypeSupported('video/quicktime;codecs=h264') ||
                          MediaRecorder.isTypeSupported('video/quicktime');
        } else if (format === 'avi') {
            isSupported = false; // Always fallback
        } else {
            isSupported = true; // WebM is always supported
        }

        if (!isSupported) {
            warningBox.style.display = 'flex';
        } else {
            warningBox.style.display = 'none';
        }
    }

    if (selectExportFormat) {
        selectExportFormat.addEventListener('change', () => {
            checkFormatCompatibility(selectExportFormat, 'export-format-warning');
        });
        // Initial check
        checkFormatCompatibility(selectExportFormat, 'export-format-warning');
    }

    if (btnExportVideo) {
        btnExportVideo.addEventListener('click', () => {
            if (!converter || !converter.isProcessing) return;

            // Trigger recording overlay
            exportOverlay.classList.add('active');
            exportProgress.textContent = '0%';
            exportBar.style.width = '0%';

            const format = selectExportFormat ? selectExportFormat.value : 'mp4';

            converter.startRecording(
                format,
                // Progress callback
                (percentage, msg) => {
                    exportProgress.textContent = `${percentage}%`;
                    exportBar.style.width = `${percentage}%`;
                    
                    // Show custom status message if any
                    const statusTextEl = document.getElementById('export-status');
                    if (statusTextEl) {
                        statusTextEl.textContent = msg;
                    }
                },
                // Completion callback
                (url, error) => {
                    exportOverlay.classList.remove('active');
                    if (error) {
                        alert(error);
                        return;
                    }
                    
                    if (url) {
                        // Programmatic download trigger
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = `ascii-video-export-${Date.now()}.${format}`;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        }, 100);
                    }
                }
            );
        });
    }

    if (btnCancelExport) {
        btnCancelExport.addEventListener('click', () => {
            if (converter) {
                converter.stopRecording();
                exportOverlay.classList.remove('active');
            }
        });
    }

    // -------------------------------------------------------------
    // 5. AI Prompt to ASCII Engine Hookups
    // -------------------------------------------------------------
    const promptInput = document.getElementById('prompt-input');
    const btnRunPrompt = document.getElementById('btn-run-prompt');
    const promptOutputText = document.getElementById('prompt-output-text');
    const canvasPromptRender = document.getElementById('canvas-prompt-render');

    // Controls
    const sliderPromptCols = document.getElementById('slider-prompt-columns');
    const valPromptCols = document.getElementById('val-prompt-columns');
    const sliderPromptSpeed = document.getElementById('slider-prompt-speed');
    const valPromptSpeed = document.getElementById('val-prompt-speed');
    const selectPromptPalette = document.getElementById('select-prompt-palette');
    const selectPromptTheme = document.getElementById('select-prompt-theme');
    const btnExportPromptVideo = document.getElementById('btn-export-prompt-video');

    let aiEngine = null;

    if (promptOutputText && canvasPromptRender) {
        aiEngine = new AIPromptEngine(promptOutputText, canvasPromptRender);
    }

    function runPrompt() {
        if (!aiEngine) return;
        const text = promptInput.value.trim();
        if (text === '') return;

        aiEngine.stop();
        aiEngine.parsePrompt(text);
        
        // Sync control inputs to match parsed themes
        selectPromptPalette.value = aiEngine.charPalette;
        selectPromptTheme.value = aiEngine.colorTheme;
        
        // Render
        aiEngine.start();
    }

    if (btnRunPrompt) btnRunPrompt.addEventListener('click', runPrompt);
    if (promptInput) {
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') runPrompt();
        });
    }

    // Binds suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt && promptInput) {
                promptInput.value = prompt;
                runPrompt();
            }
        });
    });

    // Update AI parameters dynamic listeners
    function updateAIParameters() {
        if (!aiEngine) return;
        aiEngine.setOptions({
            cols: sliderPromptCols.value,
            speed: sliderPromptSpeed.value,
            charPalette: selectPromptPalette.value,
            colorTheme: selectPromptTheme.value
        });
    }

    if (sliderPromptCols) {
        sliderPromptCols.addEventListener('input', () => {
            valPromptCols.textContent = sliderPromptCols.value;
            updateAIParameters();
        });
    }

    if (sliderPromptSpeed) {
        sliderPromptSpeed.addEventListener('input', () => {
            valPromptSpeed.textContent = `${sliderPromptSpeed.value}x`;
            updateAIParameters();
        });
    }

    if (selectPromptPalette) selectPromptPalette.addEventListener('change', updateAIParameters);
    if (selectPromptTheme) selectPromptTheme.addEventListener('change', updateAIParameters);

    // Prompt animation exporter
    const selectPromptExportFormat = document.getElementById('select-prompt-export-format');
    if (selectPromptExportFormat) {
        selectPromptExportFormat.addEventListener('change', () => {
            checkFormatCompatibility(selectPromptExportFormat, 'prompt-export-format-warning');
        });
        // Initial check
        checkFormatCompatibility(selectPromptExportFormat, 'prompt-export-format-warning');
    }

    if (btnExportPromptVideo) {
        btnExportPromptVideo.addEventListener('click', () => {
            if (!aiEngine || !aiEngine.isPlaying) {
                alert(currentLang === 'es' ? 'Genere una animación con prompt primero antes de exportar.' : 'Please generate a prompt animation first before exporting.');
                return;
            }

            const format = selectPromptExportFormat ? selectPromptExportFormat.value : 'mp4';

            // Hook recording from AI render canvas using MediaRecorder
            const fps = 24;
            const stream = canvasPromptRender.captureStream(fps);
            const recordedChunks = [];

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
                options = { mimeType: '' };
                actualMimeType = 'video/webm';
            }

            const recorder = new MediaRecorder(stream, options);
            
            // Show temporary export overlay inside the button by replacing the text span, leaving SVG untouched
            const lblExportAnim = document.getElementById('lbl-export-anim');
            btnExportPromptVideo.disabled = true;

            let isFallback = false;
            if (format === 'mp4' && !MediaRecorder.isTypeSupported('video/mp4')) isFallback = true;
            if (format === 'mkv' && !MediaRecorder.isTypeSupported('video/x-matroska')) isFallback = true;
            if (format === 'mov' && !MediaRecorder.isTypeSupported('video/quicktime')) isFallback = true;
            
            const formatLabel = format.toUpperCase();
            const recordingText = isFallback 
                ? (currentLang === 'es' ? `Grabando (${formatLabel} Fallback)...` : (currentLang === 'fr' ? `Enr. (${formatLabel})...` : (currentLang === 'pt' ? `Gravando (${formatLabel})...` : (currentLang === 'de' ? `Aufnahme (${formatLabel})...` : `Recording (${formatLabel})...`))))
                : (currentLang === 'es' ? `Grabando ${formatLabel}...` : (currentLang === 'fr' ? `Enregistrement ${formatLabel}...` : (currentLang === 'pt' ? `Gravando ${formatLabel}...` : (currentLang === 'de' ? `Aufnahme ${formatLabel}...` : `Recording ${formatLabel}...`))));

            if (lblExportAnim) lblExportAnim.textContent = recordingText;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: actualMimeType || 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Automatic download trigger
                const a = document.createElement('a');
                a.href = url;
                a.download = `ascii-ai-prompt-${Date.now()}.${format}`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                btnExportPromptVideo.disabled = false;
                if (lblExportAnim) {
                    lblExportAnim.textContent = (window.staticTranslations && window.staticTranslations[currentLang] && window.staticTranslations[currentLang]['lbl_export_anim']) 
                        || (currentLang === 'es' ? 'Exportar Animación' : 'Export Animation');
                }
            };

            // Record a beautiful 5 seconds loop segment
            recorder.start();
            setTimeout(() => {
                recorder.stop();
            }, 5000);
        });
    }

    // Set default prompt running initially
    if (promptInput && aiEngine) {
        promptInput.value = 'matrix digital rain';
        aiEngine.parsePrompt('matrix digital rain');
        aiEngine.start();
    }

    // -------------------------------------------------------------
    // 6. FAQ Accordion Panels Interactive Script
    // -------------------------------------------------------------
    document.querySelectorAll('.faq-item').forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (questionBtn && answer) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Collapse all items
                document.querySelectorAll('.faq-item').forEach(otherItem => {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                });

                // Open current item if it was closed
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });
});
