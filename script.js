document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Logic
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Smooth follow for outline
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover effects for cursor
    const interactiveElements = document.querySelectorAll('a, button, .grid-item, .project-item, input, textarea');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Audio Context
    let audioCtx;
    let isMuted = false;

    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    const playHoverSound = () => {
        if (isMuted || !audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    };

    const playClickSound = () => {
        if (isMuted || !audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    };

    // Attach sound listeners
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            initAudio();
            playHoverSound();
        });
        el.addEventListener('click', () => {
            initAudio();
            playClickSound();
        });
    });

    // Audio Toggle
    const audioBtn = document.getElementById('audioControl');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            audioBtn.textContent = isMuted ? 'SOUND: OFF' : 'SOUND: ON';
        });
    }

    // Loading Animation
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            setTimeout(() => loader.remove(), 500);
        }, 2000); // 2 seconds "cooking" time
    }

    // GitHub Stats (Mocking the graph for visual fidelity as requested)
    const renderGitHubGraph = () => {
        const container = document.getElementById('github-graph');
        if (!container) return;

        // Create a simple contribution grid
        let html = '<div style="display: flex; gap: 2px; flex-wrap: wrap;">';
        for (let i = 0; i < 365; i++) {
            const level = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
            const color = level === 0 ? '#eee' :
                level === 1 ? '#ffcc80' :
                    level === 2 ? '#ffb74d' :
                        level === 3 ? '#ff9800' : '#e65100'; // Orange shades for Biriyani theme

            html += `<div style="width: 10px; height: 10px; background-color: ${color}; border-radius: 2px;"></div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    };

    renderGitHubGraph();

    // Floating Spices Generator
    const createSpices = () => {
        const heroRight = document.querySelector('.hero-right');
        if (!heroRight) return;

        const spices = ['*', '✦', '•', '✷'];

        setInterval(() => {
            const spice = document.createElement('div');
            spice.className = 'spice-particle';
            spice.textContent = spices[Math.floor(Math.random() * spices.length)];
            spice.style.left = Math.random() * 100 + '%';
            spice.style.animationDuration = (Math.random() * 5 + 10) + 's';
            spice.style.fontSize = (Math.random() * 1 + 0.5) + 'rem';

            heroRight.appendChild(spice);

            // Cleanup
            setTimeout(() => spice.remove(), 15000);
        }, 2000);
    };

    createSpices();
    // Make entire project cards clickable (same link as title)
    const projectItems = document.querySelectorAll('.project-list .project-item');
    projectItems.forEach(item => {
        const link = item.querySelector('.project-title a');
        if (!link) return; // skip items without a link (e.g., pure text entries)

        // Show pointer cursor on hover
        item.style.cursor = 'pointer';

        item.addEventListener('click', (e) => {
            // If click is directly on a link inside, let the browser handle it
            if (e.target.closest('a')) return;

            // Otherwise trigger the title link
            link.click();
        });
    });


    // Form Warning
    const form = document.querySelector('.minimal-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            if (window.location.protocol === 'file:') {
                alert("Note: FormSubmit requires the site to be hosted on a web server (like GitHub Pages or localhost) to work correctly. It may not work when opening the file directly.");
            }
        });
    }
});
