/* ============================================================
   RAFEED MOHAMMAD SULTAN — Portfolio · script.js
   Modules: boot · cursor · nav · reveal · spotlight · tilt+magnetic
            · marquee · github · toast · contact · smoothscroll
            · scroll-progress · sound · konami · copy · visitor-dot
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

document.addEventListener('DOMContentLoaded', () => {
    /* ========== THEME TOGGLE ========== */
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
    const saved = localStorage.getItem('rs-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = saved || (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', initial);

    const updateIcon = (theme) => {
        const icon = themeBtn.querySelector('i');
        icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    };
    updateIcon(initial);

    themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('rs-theme', next);
        updateIcon(next);
        themeBtn.classList.add('spin');
        setTimeout(() => themeBtn.classList.remove('spin'), 500);
        if (window.sound) window.sound.theme();
    });
}

/* ========== BOOP (Josh Comeau style wiggle on hover) ========== */
document.querySelectorAll('[data-boop]').forEach(el => {
    let booping = false;
    el.addEventListener('mouseenter', () => {
        if (booping) return;
        booping = true;
        const rotate = (Math.random() * 8 - 4).toFixed(1);
        el.style.transition = 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = `scale(1.05) rotate(${rotate}deg)`;
        if (window.sound) window.sound.boop();
        setTimeout(() => {
            el.style.transform = '';
            setTimeout(() => { el.style.transition = ''; booping = false; }, 250);
        }, 180);
    });
});

/* ========== CLICK SPARKS ========== */
document.addEventListener('click', (e) => {
    if (!e.target.closest('button, a, [data-magnetic]')) return;
    if (e.target.closest('#themeToggle, #soundToggle')) return;
    const SPARKS = 8;
    for (let i = 0; i < SPARKS; i++) {
        const spark = document.createElement('div');
        spark.className = 'click-spark';
        spark.style.left = `${e.clientX - 2}px`;
        spark.style.top  = `${e.clientY - 2}px`;
        spark.style.setProperty('--angle', `${(360 / SPARKS) * i + (Math.random() * 20 - 10)}deg`);
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 600);
    }
});

    /* ========== 1. BOOT SCREEN ========== */
    const bootScreen = document.querySelector('.boot-screen');
    if (bootScreen) {
        const removeBoot = () => bootScreen.remove();
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            bootScreen.addEventListener('transitionend', removeBoot, { once: true });
            // Fallback: if transitionend doesn't fire, force-remove
            setTimeout(removeBoot, 1500);
        }, 1800);
    }

    /* ========== 2. FOOTER YEAR ========== */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ========== 3. SOUND ENGINE (Web Audio, opt-in) ========== */
    const sound = (() => {
        let ctx = null;
        let enabled = localStorage.getItem('rs-sound') === 'on';

        const init = () => {
            if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
        };

        // tiny tone helper (frequency, duration, type, volume)
        const tone = (freq, dur = 0.08, type = 'sine', vol = 0.04) => {
            if (!enabled || !ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + dur);
        };

return {
    hover:   () => tone(880, 0.05, 'sine', 0.025),
    click:   () => { tone(440, 0.04, 'triangle', 0.05); tone(660, 0.06, 'triangle', 0.04); },
    success: () => { tone(523, 0.1); setTimeout(() => tone(784, 0.15), 80); },
    error:   () => tone(180, 0.2, 'sawtooth', 0.04),
    boop:    () => tone(660 + Math.random() * 220, 0.06, 'sine', 0.03), // playful jitter
    theme:   () => { tone(330, 0.08, 'sine', 0.04); setTimeout(() => tone(440, 0.12, 'sine', 0.04), 60); },
    toggle: (on) => {
        enabled = on;
        localStorage.setItem('rs-sound', on ? 'on' : 'off');
        if (on) init();
    },
    isEnabled: () => enabled,
    init,
};
    })();

    // Sound toggle button
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
        const updateBtn = () => {
            const on = sound.isEnabled();
            soundBtn.classList.toggle('active', on);
            soundBtn.setAttribute('aria-pressed', String(on));
            soundBtn.querySelector('i').className = on
                ? 'fa-solid fa-volume-high'
                : 'fa-solid fa-volume-xmark';
        };
        updateBtn();
        soundBtn.addEventListener('click', () => {
            sound.toggle(!sound.isEnabled());
            updateBtn();
        });
    }
    window.sound = sound;

    /* ========== 4. CUSTOM CURSOR ========== */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing && isFinePointer) {
        let mx = 0, my = 0, rx = 0, ry = 0;

        window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

        const tick = () => {
            cursorDot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
            rx += (mx - rx) * 0.15;
            ry += (my - ry) * 0.15;
            cursorRing.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        // Delegated hover — track element so sound fires once per entry, not per child
        let hoveringTarget = null;
        const HOVER_SEL = 'a, button, input, textarea, [data-magnetic], [data-spotlight]';
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest(HOVER_SEL);
            if (target && target !== hoveringTarget) {
                hoveringTarget = target;
                document.body.classList.add('hovering');
                sound.hover();
            }
        });
        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest(HOVER_SEL);
            if (target && !target.contains(e.relatedTarget)) {
                hoveringTarget = null;
                document.body.classList.remove('hovering');
            }
        });

        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
        });
    }

    // Override the cursor-dot / cursor-ring CSS positioning so transform works clean
    if (cursorDot) { cursorDot.style.left = '0'; cursorDot.style.top = '0'; cursorDot.style.transform = 'translate(-100px, -100px)'; }
    if (cursorRing) { cursorRing.style.left = '0'; cursorRing.style.top = '0'; cursorRing.style.transform = 'translate(-100px, -100px)'; }

    // Click sound — single global listener
    document.addEventListener('click', (e) => {
        if (e.target.closest('a, button, [data-magnetic]')) sound.click();
    });

    /* ========== 5. NAV (scroll hide/show + active links) ========== */
    const nav = document.getElementById('nav');
    if (nav) {
        let lastY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            const y = window.scrollY;
            nav.classList.toggle('hidden', y > 120 && y > lastY);
            nav.classList.toggle('scrolled', y > 40);
            lastY = y;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
        }, { passive: true });

        const navLinks = document.querySelectorAll('[data-nav]');
        const sections = document.querySelectorAll('section[id]');
        const sectionObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(l => l.classList.toggle('active',
                        l.getAttribute('href') === `#${entry.target.id}`));
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(s => sectionObs.observe(s));
    }

    /* ========== 6. NAV BURGER ========== */
    const burger = document.getElementById('navBurger');
    const navLinksEl = document.querySelector('.nav-links');
    if (burger && navLinksEl) {
        const closeMenu = () => {
            burger.classList.remove('open');
            navLinksEl.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
        };
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = burger.classList.toggle('open');
            navLinksEl.classList.toggle('open', isOpen);
            burger.setAttribute('aria-expanded', String(isOpen));
        });
        navLinksEl.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        document.addEventListener('click', (e) => {
            if (nav && !nav.contains(e.target)) closeMenu();
        });
    }

    /* ========== 7. REVEAL ========== */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
                    const delay = Math.min(siblings.indexOf(entry.target), 6) * 80;
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(el => obs.observe(el));
    }

    /* ========== 8. UNIFIED CARD INTERACTIONS (spotlight + tilt + magnetic) ========== */
    if (isFinePointer && !reduceMotion) {
        // Cache rect on enter, update on resize/scroll-end
        document.querySelectorAll('[data-spotlight], [data-tilt], [data-magnetic]').forEach(el => {
            const hasSpotlight = el.hasAttribute('data-spotlight');
            const hasTilt = el.hasAttribute('data-tilt');
            const hasMagnetic = el.hasAttribute('data-magnetic');

            let rect = null;
            let raf = null;
            let pending = null;

            const update = () => {
                if (!pending || !rect) { raf = null; return; }
                const { x, y } = pending;
                const px = x - rect.left;
                const py = y - rect.top;
                const nx = px / rect.width;   // 0..1
                const ny = py / rect.height;
                const cx = (nx - 0.5) * 2;    // -1..1
                const cy = (ny - 0.5) * 2;

                if (hasSpotlight) {
                    el.style.setProperty('--mx', `${nx * 100}%`);
                    el.style.setProperty('--my', `${ny * 100}%`);
                }

                let transform = '';
                if (hasMagnetic) {
                    transform += `translate(${cx * 8}px, ${cy * 8}px) `;
                }
                if (hasTilt) {
                    transform += `perspective(900px) rotateY(${cx * 6}deg) rotateX(${-cy * 6}deg) scale(1.015)`;
                }
                if (transform) el.style.transform = transform.trim();

                raf = null;
            };

            el.addEventListener('mouseenter', () => {
                rect = el.getBoundingClientRect();
            });

            el.addEventListener('mousemove', (e) => {
                if (!rect) rect = el.getBoundingClientRect();
                pending = { x: e.clientX, y: e.clientY };
                if (!raf) raf = requestAnimationFrame(update);
            });

            el.addEventListener('mouseleave', () => {
                pending = null;
                if (raf) { cancelAnimationFrame(raf); raf = null; }
                // Spring-y return — let CSS handle it via the existing transition
                if (hasTilt || hasMagnetic) {
                    el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    el.style.transform = '';
                    setTimeout(() => { el.style.transition = ''; }, 600);
                }
            });
        });
    }

    /* ========== 9. MARQUEE — clone for seamless loop ========== */
document.querySelectorAll('.marquee-track').forEach(track => {
    track.innerHTML += track.innerHTML;
});

    /* ========== 10. GITHUB GRAPH (lazy, mulberry32 PRNG) ========== */
    const graphContainer = document.getElementById('githubGraph');
    const countEl = document.getElementById('ghCount');

    if (graphContainer) {
        const buildGraph = () => {
            // mulberry32 — small, real PRNG
            let s = 1337;
            const rand = () => {
                s |= 0; s = s + 0x6D2B79F5 | 0;
                let t = Math.imul(s ^ s >>> 15, 1 | s);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };

            const total = 53 * 7;
            const frag = document.createDocumentFragment();
            let commits = 0;

            for (let i = 0; i < total; i++) {
                const cell = document.createElement('div');
                const r = rand();
                let level = 0;
                if (r > 0.92) level = 4;
                else if (r > 0.80) level = 3;
                else if (r > 0.65) level = 2;
                else if (r > 0.45) level = 1;

                cell.className = level > 0 ? `cell l${level}` : 'cell';
                commits += [0, 1, 3, 5, 8][level];
                cell.title = level > 0 ? `${level * 2} contributions` : 'No contributions';
                frag.appendChild(cell);
            }
            graphContainer.appendChild(frag);

            // Animate the count up
            if (countEl) {
                let n = 0;
                const start = performance.now();
                const animate = (now) => {
                    const t = Math.min((now - start) / 1200, 1);
                    const eased = 1 - Math.pow(1 - t, 3);
                    n = Math.floor(eased * commits);
                    countEl.textContent = `${n.toLocaleString()} commits`;
                    if (t < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        };

        // Lazy-init when graph scrolls into view
        const graphObs = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => { if (e.isIntersecting) { buildGraph(); obs.disconnect(); } });
        }, { rootMargin: '200px' });
        graphObs.observe(graphContainer);
    }

    /* ========== 11. TOAST ========== */
    const toastContainer = document.getElementById('toastContainer') || document.getElementById('toast-container');
    const showToast = (msg, type = 'info', dur = 4000) => {
        if (!toastContainer) return;
        const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${msg}</span>`;
        toastContainer.appendChild(t);

        let dismissed = false;
        const dismiss = () => {
            if (dismissed) return;
            dismissed = true;
            t.classList.add('leaving');
            t.addEventListener('animationend', () => t.remove(), { once: true });
        };
        const timer = setTimeout(dismiss, dur);
        t.addEventListener('click', () => { clearTimeout(timer); dismiss(); });

        if (type === 'success') sound.success();
        if (type === 'error') sound.error();
    };
    window.showToast = showToast;

    /* ========== 12. CONTACT FORM ========== */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (window.location.protocol === 'file:') {
                showToast('Please host the site to use the contact form.', 'info'); return;
            }
            const btn = contactForm.querySelector('[type="submit"]');
            const orig = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Sending…</span>';
            try {
                const r = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' },
                });
                if (!r.ok) throw new Error();
                showToast('Message sent! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            } catch {
                showToast('Something went wrong. Try emailing me directly.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = orig;
            }
        });
    }

    /* ========== 13. SMOOTH SCROLL (Lenis-style, vanilla) ========== */
    if (!reduceMotion) {
        let targetY = window.scrollY;
        let currentY = window.scrollY;
        let smoothing = false;

        const lerp = (a, b, n) => a + (b - a) * n;

        const tick = () => {
            currentY = lerp(currentY, targetY, 0.18);
            if (Math.abs(targetY - currentY) < 1) {
                window.scrollTo(0, targetY);
                smoothing = false;
                return;
            }
            window.scrollTo(0, currentY);
            requestAnimationFrame(tick);
        };

        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const id = link.getAttribute('href').slice(1);
                const target = id ? document.getElementById(id) : null;
                if (!target) return;
                e.preventDefault();
                const navH = nav ? nav.offsetHeight + 20 : 80;
                targetY = target.getBoundingClientRect().top + window.scrollY - navH;
                currentY = window.scrollY;
                if (!smoothing) { smoothing = true; requestAnimationFrame(tick); }
            });
        });
    }

    /* ========== 14. SCROLL PROGRESS BAR ========== */
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
        let ticking = false;
        const update = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const pct = h > 0 ? window.scrollY / h : 0;
            progressBar.style.transform = `scaleX(${pct})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    }

    /* ========== 15. COPY TO CLIPBOARD ========== */
    document.querySelectorAll('[data-copy]').forEach(el => {
        el.addEventListener('click', async (e) => {
            const value = el.getAttribute('data-copy');
            // Allow normal navigation on long-press / modifier keys
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            // Try clipboard, fall back to letting the link work
            if (!navigator.clipboard) return;
            try {
                e.preventDefault();
                await navigator.clipboard.writeText(value);
                showToast(`Copied: ${value}`, 'success', 2500);
            } catch {
                // fall through — let the link navigate
            }
        });
    });

    /* ========== 16. KONAMI CODE ========== */
    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let kIdx = 0;
    document.addEventListener('keydown', (e) => {
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === konami[kIdx]) {
            kIdx++;
            if (kIdx === konami.length) {
                kIdx = 0;
                document.body.classList.add('konami-active');
                document.dispatchEvent(new CustomEvent('konami'));
                showToast('🎉 Konami unlocked. You\'re a real one.', 'success', 3000);
                sound.success();
                setTimeout(() => document.body.classList.remove('konami-active'), 1500);
            }
        } else {
            kIdx = (key === konami[0]) ? 1 : 0;
        }
    });

    /* ========== 17. VISITOR DOT ========== */
    const visitorDot = document.getElementById('visitorDot');
    if (visitorDot) {
        const visits = parseInt(sessionStorage.getItem('rs-visits') || '0', 10) + 1;
        sessionStorage.setItem('rs-visits', String(visits));
        const text = visitorDot.querySelector('.vd-text');
        if (text) text.textContent = visits === 1 ? 'You\'re here · session active' : `You're back · ${visits} views this session`;
        // Reveal after a moment, hide on first scroll past hero
        setTimeout(() => visitorDot.classList.add('visible'), 2500);
    }

   /* ========== 18. CERT ISSUER SCRAMBLE ========== */
/* ========== 18. SCRAMBLE (cert cards + contact links) ========== */
document.querySelectorAll('.cert-card, .contact-link').forEach(card => {
    const scrambleEl = card.querySelector('.js-scramble');
    if (!scrambleEl) return;
    const original = scrambleEl.getAttribute('data-text');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!';
    let frame = null;
    let iteration = 0;
    const scramble = () => {
        iteration++;
        scrambleEl.textContent = original.split('').map((letter, i) => {
            if (i < Math.floor(iteration / 2)) return original[i];
            if (letter === ' ' || letter === '@' || letter === '.' || letter === '-' || letter === '+') return letter;
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iteration < original.length * 2) {
            frame = requestAnimationFrame(scramble);
        } else {
            scrambleEl.textContent = original;
        }
    };
    card.addEventListener('mouseenter', () => {
        iteration = 0;
        cancelAnimationFrame(frame);
        scramble();
    });
});

/* ========== 19. CERT ACCORDION ========== */
document.querySelectorAll('[data-cert-toggle]').forEach(toggle => {
    const card = toggle.closest('.cert-accordion');
    if (!card) return;

    // Open the first card by default
    if (card === document.querySelector('.cert-accordion')) {
        card.classList.add('open');
    }

    toggle.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        // Close all
        document.querySelectorAll('.cert-accordion.open').forEach(c => c.classList.remove('open'));
        // Open clicked unless it was already open
        if (!isOpen) card.classList.add('open');
        if (window.sound) window.sound.click();
    });
});
/* ========== 22. PIXEL AVATAR ========== */
(() => {
    const canvas = document.getElementById('pixelAvatar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const P = 5; // 5px per character pixel → 20×20 grid = 100×100 canvas

    /* ── palette matched to portrait ──────────────────────────────────
       S = bright warm skin (user requested lighter),  G = glasses frame
       ────────────────────────────────────────────────────────────────── */
    const _ = null;
    const H = '#0e0602', S = '#e8a878', D = '#9a5c38', B = '#1c0c04',
          E = '#1a1020', G = '#1e1e2c', N = '#b07040', M = '#8c3a28',
          K = '#06060c', C = '#f5ede0', T = '#d8c895';

    /* ── 20×20 portrait ────────────────────────────────────────────────
       rows  0-3  : hair (4 rows, tapers top → wide sideburns)
       rows  4-6  : forehead / brow
       rows  7-10 : glasses + eyes (two 3-wide lenses, bridge centre)
       rows 11-12 : nose + wide smile
       rows 13-14 : beard / jaw
       row  15    : neck
       rows 16-19 : shirt collar, tie, black suit jacket
       ─────────────────────────────────────────────────────────────── */
    const OPEN = [
      // 0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
        [_,  _,  _,  _,  _,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  _,  _,  _,  _,  _],  //  0
        [_,  _,  _,  _,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  _,  _,  _,  _],  //  1
        [_,  _,  _,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  _,  _,  _],  //  2
        [_,  _,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  H,  _,  _],  //  3
        [_,  _,  H,  H,  H,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  H,  H,  H,  _,  _],  //  4
        [_,  _,  H,  H,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  H,  H,  _,  _],  //  5
        [_,  _,  H,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  H,  _,  _],  //  6
        [_,  _,  H,  S,  G,  G,  G,  G,  G,  S,  S,  G,  G,  G,  G,  G,  S,  H,  _,  _],  //  7 glasses top
        [_,  _,  H,  S,  G,  E,  E,  E,  G,  S,  S,  G,  E,  E,  E,  G,  S,  H,  _,  _],  //  8 eyes
        [_,  _,  H,  S,  G,  E,  E,  E,  G,  S,  S,  G,  E,  E,  E,  G,  S,  H,  _,  _],  //  9 eyes
        [_,  _,  H,  S,  G,  G,  G,  G,  G,  S,  S,  G,  G,  G,  G,  G,  S,  H,  _,  _],  // 10 glasses bottom
        [_,  _,  H,  S,  S,  S,  S,  N,  S,  S,  S,  S,  N,  S,  S,  S,  S,  H,  _,  _],  // 11 nose
        [_,  _,  H,  S,  S,  M,  M,  M,  M,  M,  M,  M,  M,  M,  M,  S,  S,  H,  _,  _],  // 12 smile
        [_,  _,  H,  D,  D,  B,  B,  B,  B,  B,  B,  B,  B,  B,  D,  D,  D,  H,  _,  _],  // 13 beard
        [_,  _,  H,  H,  D,  D,  D,  D,  D,  D,  D,  D,  D,  D,  D,  D,  H,  H,  _,  _],  // 14 jaw
        [_,  _,  _,  H,  H,  S,  S,  S,  S,  S,  S,  S,  S,  S,  S,  H,  H,  _,  _,  _],  // 15 neck
        [_,  _,  _,  _,  C,  C,  K,  K,  T,  T,  T,  T,  K,  K,  C,  C,  _,  _,  _,  _],  // 16 collar + tie
        [_,  _,  _,  K,  K,  K,  K,  T,  T,  T,  T,  T,  K,  K,  K,  K,  _,  _,  _,  _],  // 17 suit + tie
        [_,  _,  K,  K,  K,  K,  K,  K,  T,  T,  T,  K,  K,  K,  K,  K,  K,  _,  _,  _],  // 18 suit lower
        [_,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  K,  _,  _],  // 19 suit bottom
    ];

    /* blink — lids close over lenses, frames stay visible */
    const BLINK = OPEN.map((row, r) => {
        if (r === 8) return [_,_,H,S,G,S,S,S,G,S,S,G,S,S,S,G,S,H,_,_]; // upper lid
        if (r === 9) return [_,_,H,S,G,D,D,D,G,S,S,G,D,D,D,G,S,H,_,_]; // lash line
        return row;
    });

    function draw(frame) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) { ctx.fillStyle = color; ctx.fillRect(x * P, y * P, P, P); }
            });
        });
    }

    let nextBlink = performance.now() + 3000 + Math.random() * 2000;
    let blinkEnd  = 0;
    let blinking  = false;

    function tick(now) {
        if (!blinking && now >= nextBlink) { blinking = true; blinkEnd = now + 140; }
        if ( blinking && now >= blinkEnd)  { blinking = false; nextBlink = now + 3000 + Math.random() * 3000; }
        draw(blinking ? BLINK : OPEN);
        requestAnimationFrame(tick);
    }

    draw(OPEN);
    requestAnimationFrame(tick);
})();

/* ========== 23. FOOTER CAT ========== */
const footerCat = document.querySelector('.footer-cat');
const footerEl  = document.querySelector('.footer');
if (footerCat && footerEl) {
    const catObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                setTimeout(() => footerCat.classList.add('visible'), 300);
                catObs.disconnect();
            }
        });
    }, { threshold: 0.2 });
    catObs.observe(footerEl);
}

/* ========== WHIMSICAL LAYER ========== */

/* --- Floating doodles with mouse parallax --- */
(function initDoodles() {
    if (reduceMotion) return;
    const field = document.createElement('div');
    field.className = 'doodle-field';
    field.setAttribute('aria-hidden', 'true');
    const atmo = document.querySelector('.atmosphere');
    if (atmo) atmo.after(field);
    else document.body.prepend(field);

    const shapes = ['✦', '✧', '★', '⋆', '◆', '◇', '●', '○', '✿', '❋', '⚡', '♥', '◎', '✱', '❀', '⊹'];
    const colors = ['var(--amber)', 'var(--coral)', 'var(--lilac)', 'var(--sky)', 'var(--mint)', 'var(--amber-soft)'];
    const count  = window.innerWidth < 768 ? 0 : 14;
    const doodleEls = [];

    for (let i = 0; i < count; i++) {
        const d = document.createElement('span');
        d.className = 'doodle';
        d.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        const sz    = (0.7 + Math.random() * 1.1).toFixed(2);
        const dur   = (8 + Math.random() * 8).toFixed(1);
        const delay = (-Math.random() * parseFloat(dur)).toFixed(1);
        const amp   = -(10 + Math.random() * 18).toFixed(0);
        const r0    = (Math.random() * 14 - 7).toFixed(1);
        const r1    = (Math.random() * 24 - 12).toFixed(1);
        const r2    = (Math.random() * 14 - 7).toFixed(1);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const opac  = (0.12 + Math.random() * 0.18).toFixed(2);
        const depth = (0.2 + Math.random() * 0.8).toFixed(2); // parallax depth
        const baseX = parseFloat((Math.random() * 100).toFixed(1));
        const baseY = parseFloat((Math.random() * 100).toFixed(1));
        d.style.cssText = [
            `left:${baseX}%`, `top:${baseY}%`,
            `--sz:${sz}rem`, `--dur:${dur}s`, `--delay:${delay}s`,
            `--amp:${amp}px`, `--rot0:${r0}deg`, `--rot1:${r1}deg`,
            `--rot2:${r2}deg`, `--dc:${color}`, `--opac:${opac}`,
        ].join(';');
        field.appendChild(d);
        doodleEls.push({ el: d, depth: parseFloat(depth) });
    }

    // Mouse parallax — GPU-friendly transform offset
    if (!isFinePointer) return;
    let mx = 0, my = 0, rafId;
    document.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        if (!rafId) rafId = requestAnimationFrame(applyParallax);
    }, { passive: true });

    function applyParallax() {
        doodleEls.forEach(({ el, depth }) => {
            const px = mx * depth * 18;
            const py = my * depth * 18;
            el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
        });
        rafId = null;
    }
})();

/* --- Mascot with click counter rainbow mode --- */
(function initMascot() {
    const mascot = document.createElement('div');
    mascot.className = 'mascot';
    mascot.setAttribute('aria-hidden', 'true');
    mascot.setAttribute('title', 'Click me!');

    const bubble = document.createElement('div');
    bubble.className = 'mascot-bubble';

    const img = document.createElement('img');
    img.src = 'DAS.gif';
    img.alt = '';
    img.className = 'mascot-img';

    mascot.appendChild(bubble);
    mascot.appendChild(img);
    document.body.appendChild(mascot);

    // Time-aware greeting
    const hour = new Date().getHours();
    const timeGreet =
        hour < 6  ? 'still up? 🌙 respect.' :
        hour < 12 ? 'good morning! ☀️' :
        hour < 17 ? 'afternoon vibes ✦' :
        hour < 21 ? 'evening, friend 🌆' :
                    'late night scroll? 🌙';

    const sayings = [
        timeGreet,
        '(ฅ^•ﻌ•^ฅ) meow!',
        'click 5× for a surprise',
        'try the Konami code 🎮',
        'built with ☕ & curiosity',
        'spicy algorithms inside 🌶️',
        'catch the ★ stars falling!',
        'AI & cats — the future 🐱',
        '∞ curiosity, finite bugs',
        'psst... hover everything ✦',
        'you found the cat. nice.',
        'check the browser console 👀',
    ];

    let bubbleTimer = null;
    let isShowing   = false;
    let clickCount  = 0;

    function showSaying(text) {
        clearTimeout(bubbleTimer);
        bubble.textContent = text || sayings[Math.floor(Math.random() * sayings.length)];
        bubble.classList.add('show');
        isShowing = true;
        if (window.sound) window.sound.boop();
        bubbleTimer = setTimeout(() => {
            bubble.classList.remove('show');
            isShowing = false;
        }, 3800);
    }

    mascot.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 5) {
            // Rainbow mode
            document.body.classList.add('rainbow-mode');
            setTimeout(() => document.body.classList.remove('rainbow-mode'), 1600);
            if (window.confettiBurst) window.confettiBurst(window.innerWidth / 2, window.innerHeight / 2, 80);
            showSaying('✨ rainbow mode unlocked!');
            clickCount = 0;
        } else if (isShowing) {
            bubble.classList.remove('show');
            isShowing = false;
            clearTimeout(bubbleTimer);
        } else {
            showSaying();
        }
    });

    // Auto-greet with time-aware message
    setTimeout(() => { if (!isShowing) showSaying(timeGreet); }, 5500);
})();

/* --- Canvas-based cursor trail (no DOM spam) --- */
(function initCursorTrail() {
    if (!isFinePointer || reduceMotion) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'cursorTrailCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }, { passive: true });

    const MODES = {
        default: { cols: ['#f59e0b','#fbbf24','#fb7185','#a78bfa','#60a5fa','#4ade80'], interval: 50, r: [2,3], vy: [-0.5,-0.8], fade: 0.03, shape: 'circle' },
        matrix:  { cols: ['#00ff41','#39ff14','#0aff0a','#00cc33'], interval: 30, r: [3,5], vy: [0.5, 1.5], fade: 0.018, shape: 'char' },
        fire:    { cols: ['#ff4500','#ff6600','#ff8c00','#ffd700','#ff3300'], interval: 25, r: [3,6], vy: [-1.2,-1.8], fade: 0.022, shape: 'circle' },
        rainbow: { cols: ['#ff0000','#ff7f00','#ffff00','#00ff00','#0000ff','#8b00ff'], interval: 20, r: [2,4], vy: [-0.8,-1.2], fade: 0.025, shape: 'circle' },
    };

    let currentMode = 'default';
    window.setCursorMode = (mode) => { currentMode = MODES[mode] ? mode : 'default'; };

    const dots = [];
    let mx = -999, my = -999;
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const matrixChars = '01アイウエオカキクケコ';
    let lastDot = 0;
    function tick(now) {
        const m = MODES[currentMode];
        if (now - lastDot > m.interval && mx > 0) {
            lastDot = now;
            dots.push({
                x: mx, y: my,
                r: m.r[0] + Math.random() * m.r[1],
                color: m.cols[Math.floor(Math.random() * m.cols.length)],
                alpha: 0.75,
                vy: -(m.vy[0] + Math.random() * m.vy[1]),
                vx: (Math.random() - 0.5) * 0.6,
                char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
                shape: m.shape,
                fade: m.fade,
            });
        }
        ctx.clearRect(0, 0, W, H);
        for (let i = dots.length - 1; i >= 0; i--) {
            const d = dots[i];
            d.alpha -= d.fade;
            d.y += d.vy;
            d.x += d.vx;
            if (d.alpha <= 0) { dots.splice(i, 1); continue; }
            ctx.globalAlpha = d.alpha;
            ctx.fillStyle   = d.color;
            if (d.shape === 'char') {
                ctx.font = `${d.r * 3}px monospace`;
                ctx.fillText(d.char, d.x, d.y);
            } else {
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();

/* --- Confetti System --- */
(function initConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];
    let running = false;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = ['#f59e0b','#fb7185','#a78bfa','#60a5fa','#4ade80','#fcd34d','#f97316','#34d399'];

    function makeParticle(x, y) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 9,
            vy: -(Math.random() * 10 + 4),
            rot: Math.random() * 360,
            rotV: (Math.random() - 0.5) * 14,
            size: 4 + Math.random() * 8,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            round: Math.random() > 0.5,
            gravity: 0.32 + Math.random() * 0.22,
            alpha: 1,
            decay: 0.013 + Math.random() * 0.01,
        };
    }

    function burst(x, y, n) {
        if (reduceMotion) return;
        resize();
        const add = Math.min(n || 40, 80);
        for (let i = 0; i < add; i++) particles.push(makeParticle(x, y));
        if (particles.length > 200) particles = particles.slice(-200); // cap
        if (!running) { running = true; loop(); }
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.alpha > 0.02);
        if (!particles.length) { running = false; return; }
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
            p.vx *= 0.99; p.rot += p.rotV; p.alpha -= p.decay;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
            else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        });
        requestAnimationFrame(loop);
    }

    window.confettiBurst = burst;
})();

/* --- Falling stars mini-game --- */
(function initFallingStars() {
    if (reduceMotion || window.innerWidth < 768) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'starCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Counter UI
    const counter = document.createElement('div');
    counter.className = 'star-counter';
    counter.innerHTML = '★ <span class="star-counter-num" id="starNum">0</span> caught';
    document.body.appendChild(counter);

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }, { passive: true });

    let caught = 0;
    let mx = -999, my = -999;
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    const stars = [];
    const STAR_COLS = ['#fbbf24','#fb7185','#a78bfa','#60a5fa','#4ade80'];

    function spawnStar() {
        stars.push({
            x: 40 + Math.random() * (W - 80),
            y: -20,
            vy: 0.6 + Math.random() * 0.9,
            vx: (Math.random() - 0.5) * 0.4,
            r: 5 + Math.random() * 5,
            color: STAR_COLS[Math.floor(Math.random() * STAR_COLS.length)],
            alpha: 0.8 + Math.random() * 0.2,
            caught: false,
            popAlpha: 0,
        });
    }

    let spawnTimer = 0;
    function tick(now) {
        if (now - spawnTimer > 3500) { spawnStar(); spawnTimer = now; }

        ctx.clearRect(0, 0, W, H);
        for (let i = stars.length - 1; i >= 0; i--) {
            const s = stars[i];
            if (s.caught) {
                s.popAlpha -= 0.06;
                s.r += 0.8;
                if (s.popAlpha <= 0) { stars.splice(i, 1); continue; }
                ctx.globalAlpha = s.popAlpha;
                ctx.strokeStyle = s.color;
                ctx.lineWidth   = 1.5;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
                continue;
            }
            s.x += s.vx; s.y += s.vy;

            // Catch check
            const dx = s.x - mx, dy = s.y - my;
            if (Math.sqrt(dx*dx + dy*dy) < 38) {
                s.caught    = true;
                s.popAlpha  = 0.9;
                caught++;
                const numEl = document.getElementById('starNum');
                if (numEl) {
                    numEl.textContent = caught;
                    numEl.classList.add('pop');
                    setTimeout(() => numEl.classList.remove('pop'), 250);
                }
                counter.classList.add('show');
                if (window.sound) window.sound.success();
                continue;
            }

            if (s.y > H + 30) { stars.splice(i, 1); continue; }

            // Draw star glyph
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle   = s.color;
            ctx.font        = `${s.r * 2}px serif`;
            ctx.textAlign   = 'center';
            ctx.textBaseline= 'middle';
            ctx.fillText('★', s.x, s.y);
            ctx.globalAlpha = 1;
        }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();

/* --- Star burst on click (canvas-friendly, capped) --- */
(function initStarBurst() {
    if (reduceMotion) return;
    const STARS = ['✦', '★', '✧', '⋆', '✱'];
    const COLS  = ['#f59e0b','#fb7185','#a78bfa','#60a5fa','#4ade80'];
    document.addEventListener('click', (e) => {
        // Skip nav/button UI to avoid spam
        if (e.target.closest('nav, .btn, button, a')) return;
        for (let i = 0; i < 3; i++) {
            const el = document.createElement('span');
            el.className = 'star-burst';
            el.textContent = STARS[Math.floor(Math.random() * STARS.length)];
            el.style.cssText = `left:${e.clientX+(Math.random()*36-18)}px;top:${e.clientY+(Math.random()*36-18)}px;color:${COLS[Math.floor(Math.random()*COLS.length)]};`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 850);
        }
    });
})();

/* --- Confetti on primary btn --- */
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (window.confettiBurst) window.confettiBurst(e.clientX, e.clientY, 30);
    });
});

/* --- Stickers on hero-side --- */
(function addStickers() {
    const heroSide = document.querySelector('.hero-side');
    if (!heroSide) return;
    const data = [
        { cls: 'sticker-ai',    text: '✦ AI Researcher' },
        { cls: 'sticker-cool',  text: '◆ Builder'       },
        { cls: 'sticker-spicy', text: '★ Open to collab' },
    ];
    data.forEach(({ cls, text }) => {
        const s = document.createElement('div');
        s.className = `sticker ${cls}`;
        s.setAttribute('aria-hidden', 'true');
        s.textContent = text;
        heroSide.appendChild(s);
    });
})();

/* --- Ripple burst on profile card click --- */
const profileCard = document.querySelector('.profile-card');
if (profileCard) {
    profileCard.addEventListener('click', (e) => {
        const rect = profileCard.getBoundingClientRect();
        const r = document.createElement('div');
        r.className = 'ripple-burst';
        r.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;`;
        profileCard.appendChild(r);
        setTimeout(() => r.remove(), 800);
        if (window.confettiBurst) window.confettiBurst(e.clientX, e.clientY, 18);
    });
}

/* --- Section doodle watermarks --- */
const sectionDoodles = {
    '#about':        '◎',
    '#experience':   '✦',
    '#research':     '★',
    '#projects':     '◆',
    '#stack':        '⚡',
    '#education':    '✿',
    '#certifications':'◇',
    '#contact':      '♥',
};
Object.entries(sectionDoodles).forEach(([id, glyph]) => {
    const sec = document.querySelector(id);
    if (!sec) return;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    const bg = document.createElement('span');
    bg.className = 'section-doodle-bg';
    bg.setAttribute('aria-hidden', 'true');
    bg.textContent = glyph;
    sec.querySelector('.container')?.prepend(bg) || sec.prepend(bg);
});

/* --- Card wiggle pop on click --- */
document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('click', () => {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = 'wigglePop 0.55s var(--ease-spring)';
        setTimeout(() => el.style.animation = '', 600);
    });
});

/* --- Console Easter egg for devs --- */
(function consoleEasterEgg() {
    const styles = {
        big:  'font-size:18px;font-weight:bold;color:#f59e0b;',
        sub:  'font-size:11px;color:#a78bfa;',
        muted:'font-size:10px;color:#6b6660;',
    };
    console.log('%c✦ hey, you found the console.', styles.big);
    console.log('%cRafeed Mohammad Sultan — AI Researcher & Incoming UTS Master\'s Student', styles.sub);
    console.log('%cBuilt by hand. No frameworks were harmed.\nSource: github.com/sultanrafeed', styles.muted);
    console.log('%c★ try the Konami code on the page: ↑↑↓↓←→←→BA', styles.sub);
})();

/* --- Walking cat Easter egg --- */
(function initWalkingCat() {
    if (reduceMotion) return;
    const cat = document.getElementById('walkingCat');
    if (!cat) return;

    function sendCat() {
        cat.classList.remove('walk');
        void cat.offsetHeight;
        cat.classList.add('walk');
        setTimeout(() => cat.classList.remove('walk'), 8200);
    }

    setTimeout(() => {
        sendCat();
        setInterval(sendCat, 50000 + Math.random() * 40000);
    }, 15000);

    document.addEventListener('konami', sendCat);
})();

/* ========== TERMINAL EASTER EGG ========== */
(function initTerminal() {
    const overlay  = document.getElementById('terminalOverlay');
    const body     = document.getElementById('terminalBody');
    const input    = document.getElementById('terminalInput');
    const closeBtn = document.getElementById('termClose');
    if (!overlay || !body || !input) return;

    let history = [], histIdx = -1;
    let isOpen = false;

    const WELCOME = [
        { cls: 'green', text: '  ██████╗  ███████╗' },
        { cls: 'green', text: '  ██╔══██╗ ██╔════╝' },
        { cls: 'green', text: '  ██████╔╝ ███████╗' },
        { cls: 'green', text: '  ██╔══██╗ ╚════██║' },
        { cls: 'green', text: '  ██║  ██║ ███████║' },
        { cls: 'green', text: '  ╚═╝  ╚═╝ ╚══════╝  Portfolio CLI v1.0' },
        { cls: 'empty', text: '' },
        { cls: 'out',   text: '  Rafeed Mohammad Sultan — Software Engineer & AI Researcher' },
        { cls: 'out',   text: '  Dhaka, Bangladesh · sultanrafeed@gmail.com' },
        { cls: 'empty', text: '' },
        { cls: 'amber', text: "  Type 'help' for available commands. Tab to autocomplete." },
        { cls: 'empty', text: '' },
    ];

    const COMMANDS = {
        help: {
            desc: 'Show available commands',
            run: () => [
                { cls: 'amber', text: 'Available commands:' },
                { cls: 'hi',    text: '  whoami            Who is Rafeed?' },
                { cls: 'hi',    text: '  ls                List sections' },
                { cls: 'hi',    text: '  ls projects       List all projects' },
                { cls: 'hi',    text: '  ls -la            Directory listing' },
                { cls: 'hi',    text: '  cat about         About me' },
                { cls: 'hi',    text: '  cat research      Research papers' },
                { cls: 'hi',    text: '  skills            Tech stack' },
                { cls: 'hi',    text: '  contact           Contact info' },
                { cls: 'hi',    text: '  open [section]    Scroll to section' },
                { cls: 'hi',    text: '  neofetch          System info' },
                { cls: 'hi',    text: '  ping [host]       Ping a host' },
                { cls: 'hi',    text: '  git log           Commit history' },
                { cls: 'hi',    text: '  git status        Working tree status' },
                { cls: 'hi',    text: '  top               Running processes' },
                { cls: 'hi',    text: '  uname -a          Kernel info' },
                { cls: 'hi',    text: '  history           Command history' },
                { cls: 'hi',    text: '  sudo [cmd]        Escalate privileges' },
                { cls: 'hi',    text: '  coffee            Essential utility' },
                { cls: 'hi',    text: '  date              Current date & time' },
                { cls: 'hi',    text: '  echo [text]       Print text' },
                { cls: 'hi',    text: '  fortune           Random dev wisdom' },
                { cls: 'hi',    text: '  sl                A classic mistake' },
                { cls: 'hi',    text: '  hack              I\'m in.' },
                { cls: 'hi',    text: '  cursor [mode]     Change trail style' },
                { cls: 'hi',    text: '  weather           Dhaka live weather' },
                { cls: 'hi',    text: '  joke              Programmer joke' },
                { cls: 'hi',    text: '  ascii [text]      ASCII art text' },
                { cls: 'hi',    text: '  spotify           Current playlist' },
                { cls: 'hi',    text: '  quiz              CS trivia quiz' },
                { cls: 'hi',    text: '  snake             Play snake 🐍' },
                { cls: 'hi',    text: '  hire me           👀' },
                { cls: 'hi',    text: '  banner            Show welcome banner' },
                { cls: 'hi',    text: '  clear             Clear terminal' },
                { cls: 'hi',    text: '  matrix            ???' },
                { cls: 'empty', text: '' },
            ],
        },
        whoami: {
            desc: 'Print user info',
            run: () => [
                { cls: 'hi',    text: 'Rafeed Mohammad Sultan' },
                { cls: 'out',   text: 'Incoming Master of AI @ UTS Sydney (Jul 2026)' },
                { cls: 'out',   text: 'AI Researcher — NLP · LLM Alignment · RAG · Trustworthy AI' },
                { cls: 'out',   text: 'Published @ ICPR 2024 · IEEE Big Data 2024 · IJCNN 2025 · Q1 Journal' },
                { cls: 'amber', text: '4 publications · 4+ years coding · ∞ curiosity' },
                { cls: 'empty', text: '' },
            ],
        },
        ls: {
            desc: 'List sections or projects',
            run: (args) => {
                if (args[0] === 'projects') {
                    return [
                        { cls: 'lilac', text: 'drwxr-xr-x  Rokkha              — Personal-safety Android app (Kotlin · Firebase)' },
                        { cls: 'lilac', text: 'drwxr-xr-x  Roomafy             — Collaborative listening rooms (Django · React · Spotify)' },
                        { cls: 'lilac', text: 'drwxr-xr-x  Cross-Model Eval    — Judging AI ethics with LLMs (Python · DFAR)' },
                        { cls: 'lilac', text: 'drwxr-xr-x  White Spot XAI      — Shrimp farm ML (Python · SHAP · scikit-learn)' },
                        { cls: 'lilac', text: 'drwxr-xr-x  Optimizer Benchmarks — CNN optimizer study (PyTorch · VGG)' },
                        { cls: 'lilac', text: 'drwxr-xr-x  Language Efficiency — Runtime · memory · CPU benchmarks' },
                        { cls: 'lilac', text: 'drwxr-xr-x  Library Management  — Online PDF library (PHP · MySQL)' },
                        { cls: 'lilac', text: 'drwxr-xr-x  Selenium QA Suite   — GigaTech test automation (Python · Selenium)' },
                        { cls: 'lilac', text: 'drwxr-xr-x  Phonebook           — Java Swing GUI (Java · SQLite)' },
                        { cls: 'empty', text: '' },
                    ];
                }
                return [
                    { cls: 'green', text: 'about/  experience/  research/  projects/  stack/  education/  certifications/  contact/' },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        cat: {
            desc: 'Read a file',
            run: (args) => {
                if (args[0] === 'about') return [
                    { cls: 'amber', text: '── about.md ──────────────────────────────────' },
                    { cls: 'hi',    text: '' },
                    { cls: 'hi',    text: "Incoming Master of AI @ UTS Sydney (Jul 2026)." },
                    { cls: 'hi',    text: 'Previously Software Engineer at SELISE Digital Platforms,' },
                    { cls: 'hi',    text: 'leading OpenClaw and MCP server tooling.' },
                    { cls: 'empty', text: '' },
                    { cls: 'hi',    text: 'Research: trustworthy NLP · LLM alignment & evaluation ·' },
                    { cls: 'hi',    text: 'RAG in multilingual/low-resource settings · medical AI.' },
                    { cls: 'empty', text: '' },
                    { cls: 'out',   text: 'BSc CSE @ North South University · CGPA 3.38/4.00' },
                    { cls: 'empty', text: '' },
                ];
                if (args[0] === 'research') return [
                    { cls: 'amber', text: '── research.md ───────────────────────────────' },
                    { cls: 'hi',    text: '' },
                    { cls: 'green', text: '[1] ICPR 2024      — Beyond Labels: Aligning LLMs with Human-like Reasoning' },
                    { cls: 'out',   text: '                     arxiv.org/abs/2408.11879' },
                    { cls: 'green', text: '[2] IEEE BigData24 — Empowering Meta-Analysis: LLMs for Scientific Synthesis' },
                    { cls: 'out',   text: '                     arxiv.org/abs/2411.10878' },
                    { cls: 'green', text: '[3] Q1 Journal     — Efficient Skin Cancer Detection' },
                    { cls: 'out',   text: '                     Intelligence-Based Medicine (ScienceDirect)' },
                    { cls: 'green', text: '[4] IJCNN 2025     — LegalRAG: Hybrid RAG for Multilingual Legal IR' },
                    { cls: 'out',   text: '                     arxiv.org/abs/2504.16121' },
                    { cls: 'empty', text: '' },
                ];
                return [{ cls: 'err', text: `cat: ${args[0] || '(nothing)'}: No such file` }, { cls: 'empty', text: '' }];
            },
        },
        skills: {
            desc: 'Show tech stack',
            run: () => [
                { cls: 'amber', text: '── stack ─────────────────────────────────────' },
                { cls: 'hi',    text: 'Languages  Python · TypeScript · JavaScript · Java · C++ · C' },
                { cls: 'hi',    text: 'AI / ML    PyTorch · HF Transformers · PEFT · FAISS · scikit-learn' },
                { cls: 'hi',    text: 'NLP        LLM Fine-tuning · RAG · Prompt Engineering · Alignment' },
                { cls: 'hi',    text: 'Backend    NestJS · Flask · Django · PostgreSQL · MongoDB' },
                { cls: 'hi',    text: 'Frontend   React · HTML/CSS · WebSocket' },
                { cls: 'hi',    text: 'Agentic    MCP · LangChain · ElevenLabs · OpenAI API' },
                { cls: 'hi',    text: 'Cloud      Azure · Firebase · Git/GitHub · Postman' },
                { cls: 'empty', text: '' },
            ],
        },
        contact: {
            desc: 'Show contact info',
            run: () => [
                { cls: 'amber', text: '── contact ───────────────────────────────────' },
                { cls: 'hi',    text: 'Email    sultanrafeed@gmail.com' },
                { cls: 'hi',    text: 'LinkedIn linkedin.com/in/rafeed-sultan' },
                { cls: 'hi',    text: 'GitHub   github.com/sultanrafeed' },
                { cls: 'hi',    text: 'Phone    +880 1732-073478' },
                { cls: 'empty', text: '' },
            ],
        },
        open: {
            desc: 'Scroll to a section',
            run: (args) => {
                const id = args[0];
                const map = { about: 'about', experience: 'experience', research: 'research',
                    projects: 'projects', stack: 'stack', education: 'education',
                    certifications: 'certifications', contact: 'contact' };
                const target = map[id?.toLowerCase()];
                if (target) {
                    const el = document.getElementById(target);
                    if (el) {
                        closeTerminal();
                        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                        return [{ cls: 'green', text: `→ Navigating to #${target}…` }, { cls: 'empty', text: '' }];
                    }
                }
                return [
                    { cls: 'err',   text: `open: section '${id || '?'}' not found.` },
                    { cls: 'out',   text: 'Try: open about | experience | research | projects | stack | education | certifications | contact' },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        clear: {
            desc: 'Clear the terminal',
            run: () => { body.innerHTML = ''; return []; },
        },
        matrix: {
            desc: 'Matrix rain easter egg',
            run: () => {
                if (window.confettiBurst) window.confettiBurst(window.innerWidth / 2, window.innerHeight / 2, 60);
                document.body.classList.add('konami-active');
                setTimeout(() => document.body.classList.remove('konami-active'), 1500);
                if (window.sound) window.sound.success();
                return [
                    { cls: 'green', text: 'Wake up, Neo…' },
                    { cls: 'green', text: 'The Matrix has you.' },
                    { cls: 'out',   text: '(The portfolio was built by hand. No frameworks were harmed.)' },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        neofetch: {
            desc: 'System info (Rafeed OS)',
            run: () => [
                { cls: 'green', text: '       .\'\'-.        rafeed@portfolio' },
                { cls: 'green', text: '      /  _ \\       ─────────────────────────────────' },
                { cls: 'green', text: '     | (/ ) |      OS:       Rafeed OS (Dhaka Linux) 1.0' },
                { cls: 'amber', text: '      \\____/       Kernel:   LLM-6.0-alignment-patched' },
                { cls: 'amber', text: '     /  __  \\      Uptime:   4 years, 0 regrets' },
                { cls: 'amber', text: '    / /    \\ \\     Shell:    /bin/python3 --curiosity=∞' },
                { cls: 'hi',    text: '   / /      \\ \\    DE:       React 18 + NestJS Compositor' },
                { cls: 'hi',    text: '  /_/        \\_\\   WM:       Agentic AI + MCP Server' },
                { cls: 'hi',    text: '                   Terminal: rafeed@portfolio (this one)' },
                { cls: 'hi',    text: '                   CPU:      Human Brain™ @ ∞ GHz' },
                { cls: 'hi',    text: '                   GPU:      Curiosity Engine v2.0' },
                { cls: 'hi',    text: '                   RAM:      ∞ / ∞ MiB  (leak-free)' },
                { cls: 'hi',    text: '                   Disk:     4 publications · 9 projects' },
                { cls: 'empty', text: '' },
                { cls: 'out',   text: '                   ████ ████ ████ ████ ████ ████ ████' },
                { cls: 'empty', text: '' },
            ],
        },
        neofetch2: { desc: '', run: () => COMMANDS.neofetch.run() }, // alias
        ping: {
            desc: 'Ping a host',
            run: (args) => {
                const host = args[0] || 'selise.com';
                const rtts = Array.from({ length: 4 }, () => (8 + Math.random() * 12).toFixed(3));
                return [
                    { cls: 'hi',    text: `PING ${host} (127.0.0.∞): 56 data bytes` },
                    ...rtts.map((r, i) => ({ cls: 'green', text: `64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${r} ms` })),
                    { cls: 'empty', text: '' },
                    { cls: 'amber', text: `--- ${host} ping statistics ---` },
                    { cls: 'hi',    text: `4 packets transmitted, 4 received, 0% packet loss` },
                    { cls: 'out',   text: `rtt min/avg/max = ${Math.min(...rtts.map(Number)).toFixed(3)}/${(rtts.map(Number).reduce((a,b)=>a+b,0)/4).toFixed(3)}/${Math.max(...rtts.map(Number)).toFixed(3)} ms` },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        'git': {
            desc: 'Git log or status',
            run: (args) => {
                if (args[0] === 'log') return [
                    { cls: 'amber', text: 'commit a1b2c3d (HEAD → main, origin/main)' },
                    { cls: 'out',   text: 'Author: Rafeed Sultan <sultanrafeed@gmail.com>' },
                    { cls: 'out',   text: 'Date:   ' + new Date().toDateString() },
                    { cls: 'hi',    text: '    feat: ship OpenClaw v2 with MCP server tooling' },
                    { cls: 'empty', text: '' },
                    { cls: 'amber', text: 'commit 9f8e7d6' },
                    { cls: 'out',   text: '    feat: LegalRAG — hybrid dense+sparse retrieval (IJCNN 2025)' },
                    { cls: 'empty', text: '' },
                    { cls: 'amber', text: 'commit 5c4b3a2' },
                    { cls: 'out',   text: '    feat: voice agent with ElevenLabs TTS + guardrails' },
                    { cls: 'empty', text: '' },
                    { cls: 'amber', text: 'commit 2d1e0f9' },
                    { cls: 'out',   text: '    feat: DFAR dataset + ICPR 2024 paper accepted 🎉' },
                    { cls: 'empty', text: '' },
                    { cls: 'amber', text: 'commit 0a9b8c7' },
                    { cls: 'out',   text: '    init: curiosity.exe — no going back' },
                    { cls: 'empty', text: '' },
                ];
                if (args[0] === 'status') return [
                    { cls: 'green', text: 'On branch main' },
                    { cls: 'green', text: 'Your branch is up to date with \'origin/main\'.' },
                    { cls: 'empty', text: '' },
                    { cls: 'hi',    text: 'nothing to commit, working tree clean ✓' },
                    { cls: 'empty', text: '' },
                ];
                return [{ cls: 'err', text: `git: '${args[0] || ''}' is not a git command. Try: git log, git status` }, { cls: 'empty', text: '' }];
            },
        },
        sudo: {
            desc: 'Elevate privileges',
            run: (args) => {
                const cmd = args.join(' ') || '(nothing)';
                const responses = [
                    [ { cls: 'err',   text: `[sudo] password for rafeed: ` },
                      { cls: 'err',   text: 'rafeed is not in the sudoers file. This incident will be reported.' },
                      { cls: 'out',   text: '(JK — you\'re already the admin of your own story.)' } ],
                    [ { cls: 'amber', text: `sudo ${cmd}: Running at ∞ privilege level…` },
                      { cls: 'green', text: 'Done. Also ordered pizza.' } ],
                    [ { cls: 'hi',    text: 'Nice try. The root password is the Konami code.' } ],
                ];
                return [...responses[Math.floor(Math.random() * responses.length)], { cls: 'empty', text: '' }];
            },
        },
        top: {
            desc: 'Show running processes',
            run: () => [
                { cls: 'amber', text: 'rafeed@portfolio  uptime: 4yrs  load: ∞/∞/∞' },
                { cls: 'out',   text: 'Tasks: 12 running, 3 sleeping, 0 zombie' },
                { cls: 'empty', text: '' },
                { cls: 'hi',    text: '  PID  %CPU  %MEM  COMMAND' },
                { cls: 'green', text: '  001  42.0   8.1  llm-research --align --honest' },
                { cls: 'green', text: '  002  28.5   6.0  agentic-ai --mcp --voice --react' },
                { cls: 'amber', text: '  003  18.3   4.2  curiosity.exe --infinite' },
                { cls: 'hi',    text: '  004   9.1   3.3  writing-papers --venue=icpr,ieee' },
                { cls: 'out',   text: '  005   1.2   0.4  coffee-daemon --loop' },
                { cls: 'out',   text: '  006   0.7   0.2  sleep (weekends)' },
                { cls: 'out',   text: '  007   0.2   0.1  bugs --count=0 [liar]' },
                { cls: 'empty', text: '' },
            ],
        },
        pwd: {
            desc: 'Print working directory',
            run: () => [
                { cls: 'hi',  text: '/home/rafeed/portfolio' },
                { cls: 'empty', text: '' },
            ],
        },
        'ls -la': {
            desc: 'List files (verbose)',
            run: () => [
                { cls: 'amber', text: 'total 48' },
                { cls: 'hi',    text: 'drwxr-xr-x  rafeed  staff   -  ./' },
                { cls: 'out',   text: '-rw-r--r--  rafeed  staff  12K  index.html' },
                { cls: 'out',   text: '-rw-r--r--  rafeed  staff  98K  style.css' },
                { cls: 'out',   text: '-rw-r--r--  rafeed  staff  54K  script.js' },
                { cls: 'green', text: '-rw-r--r--  rafeed  staff  2.1M DAS.gif              ← best file' },
                { cls: 'out',   text: '-rw-r--r--  rafeed  staff  4.7M joelfazhari-*.mp3' },
                { cls: 'out',   text: '-rw-r--r--  rafeed  staff  180K rafeed_sultan_academic_CV.pdf' },
                { cls: 'out',   text: '-rw-r--r--  rafeed  staff  512K profile.jpg' },
                { cls: 'empty', text: '' },
            ],
        },
        uname: {
            desc: 'Print system info',
            run: (args) => {
                if (args[0] === '-a' || args[0] === '-all') return [
                    { cls: 'hi', text: 'RafeedOS portfolio 6.0-LLM-aligned #1 SMP Dhaka Bangladesh x86_curiosity' },
                    { cls: 'empty', text: '' },
                ];
                return [{ cls: 'hi', text: 'RafeedOS' }, { cls: 'empty', text: '' }];
            },
        },
        history: {
            desc: 'Show command history',
            run: () => {
                const h = history.slice(0, 12).map((cmd, i) => ({
                    cls: 'out', text: `  ${String(i + 1).padStart(4, ' ')}  ${cmd}`,
                }));
                return h.length ? h.concat([{ cls: 'empty', text: '' }])
                    : [{ cls: 'out', text: '  (no history yet)' }, { cls: 'empty', text: '' }];
            },
        },
        banner: {
            desc: 'Print the welcome banner again',
            run: () => { addLines(WELCOME); return []; },
        },
        coffee: {
            desc: 'Make coffee',
            run: () => [
                { cls: 'hi',    text: '☕ Brewing…' },
                { cls: 'green', text: '████████████████████ 100%' },
                { cls: 'amber', text: 'Coffee ready. +10 focus. Bugs reduced by 40%.' },
                { cls: 'empty', text: '' },
            ],
        },
        date: {
            desc: 'Show current date and time',
            run: () => {
                const now = new Date();
                return [
                    { cls: 'hi',    text: now.toUTCString() },
                    { cls: 'out',   text: `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}` },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        echo: {
            desc: 'Print text',
            run: (args) => [
                { cls: 'hi',    text: args.join(' ') || '' },
                { cls: 'empty', text: '' },
            ],
        },
        fortune: {
            desc: 'A random dev wisdom',
            run: () => {
                const quotes = [
                    '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Fowler',
                    '"First, solve the problem. Then, write the code." — Johnson',
                    '"Programs must be written for people to read, and only incidentally for machines to execute." — Abelson',
                    '"The best code is no code at all." — Jeff Atwood',
                    '"It works on my machine." — every developer, ever',
                    '"Have you tried turning it off and on again?" — the wisest advice',
                    '"A designer knows they have achieved perfection not when there is nothing more to add, but when there is nothing left to take away." — de Saint-Exupéry',
                    '"Talk is cheap. Show me the code." — Torvalds',
                    '"Without requirements or design, programming is the art of adding bugs to an empty text file." — Mayes',
                    '"One man\'s crappy software is another man\'s full-time job." — Segaller',
                ];
                const pick = quotes[Math.floor(Math.random() * quotes.length)];
                return [
                    { cls: 'amber', text: '── fortune ───────────────────────────────────' },
                    { cls: 'hi',    text: pick },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        sl: {
            desc: 'A classic Unix mistake',
            run: () => [
                { cls: 'green', text: '      ====        ________                ___________    ' },
                { cls: 'green', text: '  _D _|  |_______/        \\__I_I_____===__|_________|   ' },
                { cls: 'green', text: '   |(_)---  |   H\\________/ |   |        =|___ ___|      ' },
                { cls: 'green', text: '   /     |  |   H  |  |     |   |         ||_| |_||      ' },
                { cls: 'green', text: '  |      |  |   H  |__--------------------| [___] |      ' },
                { cls: 'green', text: '  | ________|___H__/__|_____/[][]~\\_______|       |      ' },
                { cls: 'green', text: '  |/ |   |-----------I_____I [][] []  D   |=======|__    ' },
                { cls: 'green', text: "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__   " },
                { cls: 'green', text: ' |/-=|___|=    ||    ||    ||    |_____/~\\_____/~\\_____  ' },
                { cls: 'green', text: '  \\_/      \\O=====O=====O=====O_/      \\_/      \\_/     ' },
                { cls: 'amber', text: '  You meant ls, didn\'t you?' },
                { cls: 'empty', text: '' },
            ],
        },
        hack: {
            desc: 'I\'m in.',
            run: () => {
                const lines = [
                    { cls: 'green', text: 'Initializing hack sequence…' },
                    { cls: 'out',   text: 'Bypassing firewall ████████░░ 80%' },
                    { cls: 'out',   text: 'Injecting payload  ██████████ 100%' },
                    { cls: 'green', text: 'ACCESS GRANTED' },
                    { cls: 'empty', text: '' },
                    { cls: 'amber', text: 'Just kidding. This is a portfolio.' },
                    { cls: 'out',   text: 'But if you\'re a recruiter — hi! 👋' },
                    { cls: 'lilac', text: 'sultanrafeed@gmail.com' },
                    { cls: 'empty', text: '' },
                ];
                document.dispatchEvent(new CustomEvent('konami'));
                return lines;
            },
        },
        'hire me': {
            desc: 'The most important command',
            run: () => {
                showToast('🎉 Great taste! Let\'s talk → sultanrafeed@gmail.com', 'success', 5000);
                if (window.sound) window.sound.success();
                if (window.confettiBurst) window.confettiBurst(window.innerWidth/2, window.innerHeight/2, 80);
                return [
                    { cls: 'amber', text: '✦ Great idea. Here\'s how to reach me:' },
                    { cls: 'hi',    text: '  Email   : sultanrafeed@gmail.com' },
                    { cls: 'hi',    text: '  LinkedIn: linkedin.com/in/sultanrafeed' },
                    { cls: 'hi',    text: '  GitHub  : github.com/sultanrafeed' },
                    { cls: 'empty', text: '' },
                    { cls: 'green', text: '  I\'m open to research collabs & engineering roles.' },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        cursor: {
            desc: 'Change cursor trail mode',
            run: (args) => {
                const mode = args[0] || '';
                const valid = ['default','matrix','fire','rainbow'];
                if (!valid.includes(mode)) return [
                    { cls: 'amber', text: 'Usage: cursor [mode]' },
                    { cls: 'hi',    text: '  cursor default   — colourful dots' },
                    { cls: 'hi',    text: '  cursor matrix    — falling green chars' },
                    { cls: 'hi',    text: '  cursor fire      — fire trail' },
                    { cls: 'hi',    text: '  cursor rainbow   — rainbow burst' },
                    { cls: 'empty', text: '' },
                ];
                if (window.setCursorMode) window.setCursorMode(mode);
                const msgs = { default: 'Back to default. Comfy.', matrix: 'You are now in the Matrix.', fire: '🔥 Fire trail activated.', rainbow: '🌈 Rainbow mode engaged.' };
                showToast(msgs[mode], 'success', 2500);
                return [
                    { cls: 'green', text: `Cursor mode set to: ${mode}` },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        weather: {
            desc: 'Current weather in Dhaka',
            run: () => {
                addLines([{ cls: 'out', text: 'Fetching weather for Dhaka…' }]);
                fetch('https://api.open-meteo.com/v1/forecast?latitude=23.81&longitude=90.41&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&timezone=Asia%2FDhaka')
                    .then(r => r.json())
                    .then(d => {
                        const c = d.current;
                        const codes = { 0:'☀️ Clear sky', 1:'🌤 Mostly clear', 2:'⛅ Partly cloudy', 3:'☁️ Overcast', 45:'🌫 Foggy', 51:'🌦 Light drizzle', 61:'🌧 Rain', 71:'🌨 Snow', 95:'⛈ Thunderstorm' };
                        const desc = codes[c.weathercode] || codes[Math.floor(c.weathercode/10)*10] || '🌡 Unknown';
                        addLines([
                            { cls: 'amber', text: '── weather: Dhaka, Bangladesh ────────────────' },
                            { cls: 'hi',    text: `  ${desc}` },
                            { cls: 'hi',    text: `  Temperature : ${c.temperature_2m}°C` },
                            { cls: 'hi',    text: `  Humidity    : ${c.relativehumidity_2m}%` },
                            { cls: 'hi',    text: `  Wind        : ${c.windspeed_10m} km/h` },
                            { cls: 'empty', text: '' },
                        ]);
                    })
                    .catch(() => addLines([{ cls: 'err', text: 'Failed to fetch weather. No internet?' }, { cls: 'empty', text: '' }]));
                return [];
            },
        },
        joke: {
            desc: 'A programmer joke',
            run: () => {
                const jokes = [
                    ['Why do programmers prefer dark mode?', 'Because light attracts bugs.'],
                    ['Why did the developer go broke?', 'Because he used up all his cache.'],
                    ['A SQL query walks into a bar,', 'walks up to two tables and asks… "Can I JOIN you?"'],
                    ['How many programmers does it take to change a light bulb?', 'None — that\'s a hardware problem.'],
                    ['Why do Java developers wear glasses?', 'Because they don\'t C#.'],
                    ['What\'s a programmer\'s favorite place?', 'Foo Bar.'],
                    ['It\'s not a bug —', 'it\'s an undocumented feature.'],
                    ['There are 10 types of people in the world:', 'those who understand binary, and those who don\'t.'],
                    ['Why was the JavaScript developer sad?', 'Because he didn\'t know how to null his feelings.'],
                    ['What do you call a programmer from Finland?', 'Nerdic.'],
                ];
                const [q, a] = jokes[Math.floor(Math.random() * jokes.length)];
                return [
                    { cls: 'amber', text: '── joke ──────────────────────────────────────' },
                    { cls: 'hi',    text: `  Q: ${q}` },
                    { cls: 'empty', text: '' },
                    { cls: 'green', text: `  A: ${a}` },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        ascii: {
            desc: 'ASCII art text (short words only)',
            run: (args) => {
                const word = args.join(' ').toUpperCase().slice(0, 8) || 'HELLO';
                const FONT = {
                    A:['▄▀█','█▀█'],' ':['   ','   '],B:['█▄▄','█▄█'],C:['█▀▀','█▄▄'],D:['█▀▄','█▄▀'],
                    E:['█▀▀','█▄▄'],F:['█▀▀','█▀ '],G:['█▀▀','█▄█'],H:['█ █','█▀█'],I:['█','█'],
                    J:[' ▀█','█▄█'],K:['█▀▄','█▄▀'],L:['█  ','█▄▄'],M:['█▄█','█ █'],N:['█▄█','█ █'],
                    O:['▄▀▄','▀▄▀'],P:['█▀▄','█▀ '],Q:['▄▀▄','▀▀▄'],R:['█▀▄','█▀▄'],S:['▄▀▀','▄▄▀'],
                    T:['▀█▀','  █'],U:['█ █','▀▄█'],V:['█ █','▀▄▀'],W:['█ █','▀▄▀'],X:['▀▄▀','█ █'],
                    Y:['▀▄▀',' █ '],Z:['▀▄ ','▄▄▀'],
                    '0':['▄▀▄','▀▄▀'],'1':[' █','▄█'],'2':['▀▄ ','▄▄▀'],'3':['▄▄▀','▄▄▀'],
                    '4':['█ █','  █'],'5':['▄▀▀','▄▄▀'],'6':['▄▀▀','▀▄▀'],'7':['▀▀█',' █ '],
                    '8':['▄▀▄','▀▄▀'],'9':['▄▀▄','▄▄▀'],
                };
                const chars = word.split('').filter(c => FONT[c]);
                if (!chars.length) return [{ cls: 'err', text: 'No supported characters found.' }, { cls: 'empty', text: '' }];
                const rows = [0,1].map(r => '  ' + chars.map(c => (FONT[c][r] || '  ')).join(' '));
                return [
                    ...rows.map(r => ({ cls: 'green', text: r })),
                    { cls: 'empty', text: '' },
                ];
            },
        },
        spotify: {
            desc: 'Current vibes playlist',
            run: () => [
                { cls: 'amber', text: '── now vibing to ─────────────────────────────' },
                { cls: 'hi',    text: '  🎵 Tame Impala — Let It Happen' },
                { cls: 'hi',    text: '  🎵 Bon Iver — Holocene' },
                { cls: 'hi',    text: '  🎵 FKJ — Lying Together' },
                { cls: 'hi',    text: '  🎵 Mac Miller — Small Worlds' },
                { cls: 'hi',    text: '  🎵 Khruangbin — A Calf Born in Winter' },
                { cls: 'hi',    text: '  🎵 The Japanese House — Saw It Coming' },
                { cls: 'empty', text: '' },
                { cls: 'out',   text: '  Late-night coding playlist. You\'re welcome.' },
                { cls: 'empty', text: '' },
            ],
        },
        quiz: {
            desc: 'CS trivia quiz',
            run: () => {
                window._quizActive = true;
                window._quizScore  = 0;
                window._quizStep   = 0;
                const qs = [
                    { q: 'Q1: What does "HTTP" stand for?', a: 'hypertext transfer protocol', hint: 'hypertext transfer protocol' },
                    { q: 'Q2: What sorting algorithm has worst-case O(n²)?',  a: 'bubble sort', hint: 'bubble sort' },
                    { q: 'Q3: In Python, what is the output of: bool("") ?', a: 'false', hint: 'false' },
                ];
                window._quizQs = qs;
                return [
                    { cls: 'amber', text: '── CS trivia quiz ────────────────────────────' },
                    { cls: 'hi',    text: '  3 questions. Type your answer and press Enter.' },
                    { cls: 'empty', text: '' },
                    { cls: 'amber', text: `  ${qs[0].q}` },
                    { cls: 'empty', text: '' },
                ];
            },
        },
        snake: {
            desc: 'Play snake in the terminal',
            run: () => {
                setTimeout(() => window._launchSnake && window._launchSnake(), 100);
                return [
                    { cls: 'green', text: 'Launching Snake… use arrow keys to play.' },
                    { cls: 'out',   text: 'Press Q to quit, R to restart.' },
                    { cls: 'empty', text: '' },
                ];
            },
        },
    };

    const ALL_CMDS = Object.keys(COMMANDS);

    function addLines(lines) {
        lines.forEach(({ cls, text }) => {
            const el = document.createElement('div');
            el.className = `term-line ${cls}`;
            el.textContent = text;
            body.appendChild(el);
        });
        body.scrollTop = body.scrollHeight;
    }

    function openTerminal() {
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('open');
        document.body.classList.add('term-open');
        isOpen = true;
        if (body.children.length === 0) addLines(WELCOME);
        setTimeout(() => input.focus(), 280);
    }

    function closeTerminal() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('term-open');
        isOpen = false;
        input.blur();
    }

    // Trigger: backtick key
    document.addEventListener('keydown', (e) => {
        if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            e.preventDefault();
            isOpen ? closeTerminal() : openTerminal();
        }
        if (e.key === 'Escape' && isOpen) { e.preventDefault(); closeTerminal(); }
    });

    // Trigger: FAB button
    const fab = document.getElementById('termFab');
    if (fab) fab.addEventListener('click', () => isOpen ? closeTerminal() : openTerminal());

    // Sync body class so FAB can hide while terminal is open
    const _origOpen = openTerminal;
    const _origClose = closeTerminal;

    closeBtn?.addEventListener('click', closeTerminal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTerminal(); });

    // Command submission
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = input.value.trim();
            input.value = '';
            if (!raw) return;
            history.unshift(raw);
            histIdx = -1;

            addLines([{ cls: 'cmd', text: raw }]);

            // Quiz intercept
            if (window._quizActive) {
                const qs = window._quizQs;
                const step = window._quizStep;
                const correct = raw.toLowerCase().includes(qs[step].a);
                if (correct) {
                    window._quizScore++;
                    addLines([{ cls: 'green', text: '  ✓ Correct!' }, { cls: 'empty', text: '' }]);
                } else {
                    addLines([{ cls: 'err', text: `  ✗ Nope. Answer: ${qs[step].hint}` }, { cls: 'empty', text: '' }]);
                }
                window._quizStep++;
                if (window._quizStep < qs.length) {
                    addLines([{ cls: 'amber', text: `  ${qs[window._quizStep].q}` }, { cls: 'empty', text: '' }]);
                } else {
                    window._quizActive = false;
                    const score = window._quizScore;
                    const msg = score === 3 ? '🏆 Perfect score! You\'re a CS wizard.' : score === 2 ? '🎉 2/3 — pretty solid.' : score === 1 ? '🤔 1/3 — brush up on those basics.' : '😅 0/3 — it\'s okay, keep learning!';
                    addLines([
                        { cls: 'amber', text: `  Final score: ${score}/3` },
                        { cls: 'hi',    text: `  ${msg}` },
                        { cls: 'empty', text: '' },
                    ]);
                    if (score === 3 && window.confettiBurst) window.confettiBurst(window.innerWidth / 2, window.innerHeight / 2, 60);
                }
                return;
            }

            const parts = raw.toLowerCase().split(/\s+/);
            const cmd   = parts[0];
            const args  = parts.slice(1);
            // Support two-word commands: "ls -la", "git log", "git status", "hire me"
            const cmd2  = parts.slice(0, 2).join(' ');

            if (COMMANDS[cmd2]) {
                addLines(COMMANDS[cmd2].run(args.slice(1)) || []);
            } else if (COMMANDS[cmd]) {
                addLines(COMMANDS[cmd].run(args) || []);
            } else {
                addLines([
                    { cls: 'err',  text: `command not found: ${cmd}` },
                    { cls: 'out',  text: "Type 'help' for available commands." },
                    { cls: 'empty', text: '' },
                ]);
                if (window.sound) window.sound.error();
            }
        }

        // History navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
            else { histIdx = -1; input.value = ''; }
        }

        // Tab autocomplete
        if (e.key === 'Tab') {
            e.preventDefault();
            const val = input.value.toLowerCase();
            const match = ALL_CMDS.find(c => c.startsWith(val));
            if (match) input.value = match;
        }
    });

    // Update console Easter Egg tip
    console.log('%c★ press ` (backtick) — or click the >_ button — to open the terminal', 'font-size:11px;color:#f59e0b;');

    // expose openTerminal globally for other easter eggs
    window._openTerminal = openTerminal;
    window._termAddLines = addLines;
})();

/* ========== GHOST TYPING EASTER EGG ========== */
/* type "hireme" anywhere on the page (outside inputs) */
(function initGhostTyping() {
    const targets = ['hireme', 'sudo hire', 'hire me'];
    let buf = '';
    const maxLen = Math.max(...targets.map(t => t.length));

    document.addEventListener('keypress', (e) => {
        const tag = document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        buf = (buf + e.key.toLowerCase()).slice(-maxLen);

        if (targets.some(t => buf.endsWith(t))) {
            buf = '';
            showToast('🎉 Great taste! Let\'s talk → sultanrafeed@gmail.com', 'success', 5000);
            if (window.sound) window.sound.success();
            if (window.confettiBurst) window.confettiBurst(window.innerWidth/2, window.innerHeight/2, 80);
            if (window._openTerminal) {
                window._openTerminal();
                setTimeout(() => {
                    if (window._termAddLines) window._termAddLines([
                        { cls: 'amber', text: '✦ Oh, you typed that. I like you already.' },
                        { cls: 'hi',    text: '  Email   : sultanrafeed@gmail.com' },
                        { cls: 'hi',    text: '  LinkedIn: linkedin.com/in/sultanrafeed' },
                        { cls: 'empty', text: '' },
                    ]);
                }, 350);
            }
        }
    });
})();

/* ========== HERO NAME CLICK EASTER EGG ========== */
/* click the hero name 5 times fast → surprise */
(function initNameClicks() {
    const heroName = document.querySelector('.hero-name');
    if (!heroName) return;

    let clicks = 0, timer = null;
    heroName.style.cursor = 'pointer';

    heroName.addEventListener('click', () => {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 2000);

        if (clicks === 3) showToast('Keep going…', 'info', 1200);
        if (clicks >= 5) {
            clicks = 0; clearTimeout(timer);
            const msgs = [
                '✨ You found me! Yes, that\'s my name.',
                '🎯 Five clicks. You\'re persistent. I respect it.',
                '🤔 Still clicking? Bold move.',
                '☕ Okay at this point just email me: sultanrafeed@gmail.com',
            ];
            const pick = msgs[Math.floor(Math.random() * msgs.length)];
            showToast(pick, 'success', 4000);
            if (window.sound) window.sound.success();
            document.dispatchEvent(new CustomEvent('konami'));
        }
    });
})();

/* ========== CLICK STORM EASTER EGG ========== */
/* click anywhere 10 times in 2 seconds → confetti + toast */
(function initClickStorm() {
    let clicks = 0, timer = null;
    document.addEventListener('click', (e) => {
        // ignore clicks on interactive elements
        if (e.target.closest('a,button,input,textarea,.mascot')) return;
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 2000);
        if (clicks >= 10) {
            clicks = 0;
            if (window.confettiBurst) window.confettiBurst(e.clientX, e.clientY, 80);
            showToast('ok ok I get it 😅', 'success', 3000);
            if (window.sound) window.sound.success();
        }
    });
})();

/* ========== IDLE CAT SIT BEHAVIOR ========== */
(function initIdleCat() {
    const cat = document.getElementById('walkingCat');
    if (!cat || reduceMotion) return;
    let idleTimer = null;

    function goIdle() {
        cat.classList.remove('walk');
        cat.classList.add('sit');
    }
    function wakeUp() {
        cat.classList.remove('sit');
    }

    function resetIdle() {
        clearTimeout(idleTimer);
        wakeUp();
        idleTimer = setTimeout(goIdle, 120000); // 2 minutes
    }

    ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt =>
        document.addEventListener(evt, resetIdle, { passive: true })
    );
    resetIdle();
})();

/* ========== DRAGGABLE MASCOT ========== */
(function initDraggableMascot() {
    const mascot = document.querySelector('.mascot');
    if (!mascot || !isFinePointer) return;

    let dragging = false, ox = 0, oy = 0, startX = 0, startY = 0;
    mascot.style.cursor = 'grab';

    mascot.addEventListener('mousedown', (e) => {
        if (e.target.closest('.mascot-bubble')) return;
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        const rect = mascot.getBoundingClientRect();
        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;
        mascot.style.cursor = 'grabbing';
        mascot.style.transition = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const x = e.clientX - ox;
        const y = e.clientY - oy;
        mascot.style.position = 'fixed';
        mascot.style.right = 'auto';
        mascot.style.bottom = 'auto';
        mascot.style.left = Math.max(0, Math.min(window.innerWidth - 80, x)) + 'px';
        mascot.style.top  = Math.max(0, Math.min(window.innerHeight - 80, y)) + 'px';
    });

    document.addEventListener('mouseup', (e) => {
        if (!dragging) return;
        dragging = false;
        mascot.style.cursor = 'grab';
        mascot.style.transition = '';
        const moved = Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY);
        if (moved > 20) showToast('You can drag me! 🐱', 'info', 2000);
    });
})();

/* ========== SECRET NAV ITEM (after Konami) ========== */
(function initSecretNav() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    let revealed = false;

    // Add secret section to page
    const secretSection = document.createElement('section');
    secretSection.id = 'secret';
    secretSection.className = 'secret-section';
    secretSection.setAttribute('aria-label', 'Secret section');
    secretSection.innerHTML = `
        <div class="container">
            <h2 class="secret-title">// secret.md</h2>
            <div class="secret-facts">
                <div class="secret-fact"><span class="sf-icon">☕</span><span>I debug best between 11pm and 2am. Something about the quiet.</span></div>
                <div class="secret-fact"><span class="sf-icon">🎵</span><span>I listen to lo-fi hip-hop while writing research papers. Every single time.</span></div>
                <div class="secret-fact"><span class="sf-icon">🐈</span><span>The walking cat on this page? Named DAS. Yes, I named my site's cat.</span></div>
                <div class="secret-fact"><span class="sf-icon">🌏</span><span>I've been learning Japanese slowly for 3 years. まだまだです。</span></div>
                <div class="secret-fact"><span class="sf-icon">📚</span><span>I re-read "The Pragmatic Programmer" every year. Different things hit differently each time.</span></div>
                <div class="secret-fact"><span class="sf-icon">🤖</span><span>My first AI experiment was a rule-based Bangla chatbot in 2020. It was terrible. I loved it.</span></div>
                <div class="secret-fact"><span class="sf-icon">🎮</span><span>I got here via the Konami code. You're one of us now.</span></div>
            </div>
        </div>
    `;
    document.body.appendChild(secretSection);

    document.addEventListener('konami', () => {
        if (revealed) return;
        revealed = true;
        const li = document.createElement('li');
        li.className = 'secret-nav-item';
        li.innerHTML = '<a href="#secret" data-nav>???</a>';
        navLinks.appendChild(li);
        // animate it in
        requestAnimationFrame(() => {
            li.classList.add('show');
            secretSection.classList.add('revealed');
        });
        showToast('🔓 A secret section was unlocked in the nav!', 'success', 4000);
    });
})();

/* ========== "STILL HERE" TOAST ========== */
(function initStillHereToast() {
    const FIVE_MIN = 5 * 60 * 1000;
    const shown = sessionStorage.getItem('rs-stillhere');
    if (shown) return;
    setTimeout(() => {
        sessionStorage.setItem('rs-stillhere', '1');
        showToast('Still here? You\'re thorough. I like that. 👀', 'info', 5000);
    }, FIVE_MIN);
})();

/* ========== GHOST TYPING: DEBUG OVERLAY ========== */
(function initDebugMode() {
    const targets = ['debug', 'inspect'];
    let buf = '', active = false;
    const maxLen = Math.max(...targets.map(t => t.length));

    function toggleDebug(on) {
        active = on;
        document.querySelectorAll('section, .card, .project-card, nav, header, footer').forEach((el, i) => {
            if (on) {
                el.dataset._dbgOutline = el.style.outline || '';
                el.style.outline = `1px solid hsl(${(i * 47) % 360},80%,60%)`;
                const label = document.createElement('span');
                label.className = 'debug-label';
                label.textContent = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : el.className.split(' ')[0] ? `.${el.className.split(' ')[0]}` : '');
                el.appendChild(label);
            } else {
                el.style.outline = el.dataset._dbgOutline || '';
                el.querySelectorAll('.debug-label').forEach(l => l.remove());
            }
        });
        if (on) {
            showToast('🛠 Debug mode ON — type "debug" again to exit', 'info', 3000);
            setTimeout(() => { if (active) toggleDebug(false); }, 8000);
        }
    }

    document.addEventListener('keypress', (e) => {
        const tag = document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        buf = (buf + e.key.toLowerCase()).slice(-maxLen);
        if (targets.some(t => buf.endsWith(t))) {
            buf = '';
            toggleDebug(!active);
        }
    });
})();

/* ========== SNAKE GAME IN TERMINAL ========== */
(function initSnakeGame() {
    window._launchSnake = function () {
        const overlay = document.getElementById('terminalOverlay');
        const termBody = document.getElementById('terminalBody');
        const termInput = document.getElementById('terminalInput');
        if (!overlay || !termBody) return;

        // Build canvas inside terminal body
        const existing = document.getElementById('snakeCanvas');
        if (existing) { existing.remove(); }

        termInput.disabled = true;
        termInput.placeholder = 'Arrow keys to play • Q to quit • R to restart';

        const CELL = 14, COLS = 28, ROWS = 16;
        const W = CELL * COLS, H = CELL * ROWS;

        const canvas = document.createElement('canvas');
        canvas.id = 'snakeCanvas';
        canvas.width = W; canvas.height = H;
        canvas.style.cssText = 'display:block;margin:8px auto;border:1px solid #3fb950;border-radius:4px;';
        termBody.appendChild(canvas);
        termBody.scrollTop = termBody.scrollHeight;
        const ctx = canvas.getContext('2d');

        let snake, dir, nextDir, food, score, alive, raf;

        function rand(n) { return Math.floor(Math.random() * n); }
        function spawnFood(s) {
            let f;
            do { f = { x: rand(COLS), y: rand(ROWS) }; }
            while (s.some(p => p.x === f.x && p.y === f.y));
            return f;
        }

        function init() {
            snake = [{ x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }];
            dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
            food = spawnFood(snake);
            score = 0; alive = true;
        }

        function draw() {
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, W, H);
            // grid
            ctx.strokeStyle = 'rgba(63,185,80,0.06)';
            ctx.lineWidth = 0.5;
            for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke(); }
            for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke(); }
            // food
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath(); ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-1, 0, Math.PI*2); ctx.fill();
            // snake
            snake.forEach((p, i) => {
                ctx.fillStyle = i === 0 ? '#3fb950' : `hsl(140,60%,${25+i*2}%)`;
                ctx.fillRect(p.x*CELL+1, p.y*CELL+1, CELL-2, CELL-2);
            });
            // score
            ctx.fillStyle = '#a78bfa';
            ctx.font = '11px monospace';
            ctx.fillText(`score: ${score}`, 6, H - 5);
            if (!alive) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, H/2-22, W, 44);
                ctx.fillStyle = '#f85149';
                ctx.font = 'bold 16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`GAME OVER  score: ${score}`, W/2, H/2-4);
                ctx.fillStyle = '#a78bfa';
                ctx.font = '11px monospace';
                ctx.fillText('press R to restart  •  Q to quit', W/2, H/2+16);
                ctx.textAlign = 'left';
            }
        }

        let lastTick = 0;
        function loop(ts) {
            if (!alive) { draw(); return; }
            if (ts - lastTick > 120) {
                lastTick = ts;
                dir = { ...nextDir };
                const head = { x: (snake[0].x + dir.x + COLS) % COLS, y: (snake[0].y + dir.y + ROWS) % ROWS };
                if (snake.some(p => p.x === head.x && p.y === head.y)) { alive = false; draw(); return; }
                snake.unshift(head);
                if (head.x === food.x && head.y === food.y) { score++; food = spawnFood(snake); }
                else snake.pop();
            }
            draw();
            raf = requestAnimationFrame(loop);
        }

        function quit() {
            cancelAnimationFrame(raf);
            canvas.remove();
            termInput.disabled = false;
            termInput.placeholder = '';
            termInput.focus();
            if (window._termAddLines) window._termAddLines([
                { cls: 'amber', text: `Snake over. Final score: ${score}` },
                { cls: 'empty', text: '' },
            ]);
            document.removeEventListener('keydown', handleKey);
        }

        function handleKey(e) {
            const map = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0} };
            if (map[e.key]) {
                const d = map[e.key];
                if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
                e.preventDefault();
            }
            if (e.key === 'q' || e.key === 'Q') quit();
            if ((e.key === 'r' || e.key === 'R') && !alive) { cancelAnimationFrame(raf); init(); raf = requestAnimationFrame(loop); }
        }

        document.addEventListener('keydown', handleKey);
        init();
        raf = requestAnimationFrame(loop);
    };
})();

/* ========== ACHIEVEMENT UNLOCK SYSTEM ========== */
(function initAchievements() {
    const unlocked = new Set(JSON.parse(sessionStorage.getItem('rs-achievements') || '[]'));

    const ACHIEVEMENTS = [
        { id: 'about',          icon: '🔍', name: 'Curious Mind',          desc: 'Explored the About section'         },
        { id: 'experience',     icon: '💼', name: 'Career Archaeologist',   desc: 'Dug through the experience timeline' },
        { id: 'research',       icon: '🔬', name: 'Fellow Researcher',      desc: 'Read the published papers'           },
        { id: 'projects',       icon: '🚀', name: 'Code Explorer',          desc: 'Discovered all the projects'         },
        { id: 'stack',          icon: '⚡', name: 'Stack Inspector',         desc: 'Checked out the tech stack'          },
        { id: 'education',      icon: '🎓', name: 'Scholar Found',          desc: 'Reviewed the education history'      },
        { id: 'certifications', icon: '🏆', name: 'Cert Hunter',            desc: 'Browsed all certifications'          },
        { id: 'contact',        icon: '💌', name: 'Let\'s Connect!',        desc: 'Made it to the contact section'      },
    ];

    let queue = [];
    let showing = false;

    function showNext() {
        if (!queue.length) { showing = false; return; }
        showing = true;
        const ach = queue.shift();

        const banner = document.createElement('div');
        banner.className = 'achievement-banner';
        banner.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-body">
                <div class="achievement-label">Achievement Unlocked</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>`;
        document.body.appendChild(banner);

        if (window.sound) window.sound.success();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => banner.classList.add('show'));
        });

        setTimeout(() => {
            banner.classList.remove('show');
            banner.classList.add('leaving');
            banner.addEventListener('transitionend', () => {
                banner.remove();
                setTimeout(showNext, 300);
            }, { once: true });
        }, 3500);
    }

    function unlock(id) {
        if (unlocked.has(id)) return;
        unlocked.add(id);
        sessionStorage.setItem('rs-achievements', JSON.stringify([...unlocked]));
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (!ach) return;
        queue.push(ach);
        if (!showing) showNext();
    }

    const achObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                unlock(entry.target.id);
                achObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    ACHIEVEMENTS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) achObs.observe(el);
    });
})();

/* ========== VINYL RECORD PLAYER ========== */
(function initVinylPlayer() {
    const player = document.getElementById('vinylPlayer');
    const disc   = document.getElementById('vinylDisc');
    if (!player) return;

    let audio       = null;
    let isPlaying   = false;

    function getAudio() {
        if (!audio) {
            audio = new Audio('joelfazhari-interstellar-adventure-space-theme-soundtrack-4494.mp3');
            audio.loop   = true;
            audio.volume = 0.25;
            // Keep isPlaying in sync if browser pauses (tab switch, etc.)
            audio.addEventListener('pause', () => { isPlaying = false; player.classList.remove('playing'); });
            audio.addEventListener('play',  () => { isPlaying = true;  player.classList.add('playing');    });
        }
        return audio;
    }

    player.addEventListener('click', () => {
        const a = getAudio();
        if (isPlaying) {
            a.pause();
            // syncState handled by pause event above
        } else {
            // Immediately reflect intent so disc starts spinning before async resolves
            player.classList.add('playing');
            a.play()
                .then(() => { isPlaying = true; })
                .catch(() => {
                    // Blocked — roll back
                    player.classList.remove('playing');
                    isPlaying = false;
                    if (window.showToast) showToast('Browser blocked autoplay — try again.', 'info', 2500);
                });
        }
        if (window.sound) window.sound.click();
    });

    // Show vinyl after boot screen clears
    setTimeout(() => player.classList.add('visible'), 3200);
})();

/* ========== PROJECT CARD DETAIL PANELS ========== */
(function initProjectDetails() {
    const DETAILS = {
        '01': {
            story: 'Built during a personal safety awareness initiative at NSU. Learned Firebase Realtime DB + Kotlin coroutines by shipping it end-to-end in 3 weeks.',
            link: 'https://github.com/SumitKar01/rokkha',
        },
        '02': {
            story: 'Ongoing passion project — wanted synchronized listening rooms with friends. Currently wiring up Spotify OAuth + Django Channels for real-time sync.',
            link: 'https://github.com/sultanrafeed/roomafy',
        },
        '03': {
            story: 'Direct extension of the DFAR dataset paper (ICPR 2024). Used GPT-4 and Llama-2 as judges — found 85%+ agreement with human evaluators.',
            link: 'https://github.com/sultanrafeed/Cross-Model-Evaluation-Judging-AI-Ethics-and-Alignment-Responses-with-Language-Models',
        },
        '04': {
            story: 'Partnered with aquaculture researchers. SHAP explanations revealed water temperature and stocking density as the two dominant risk factors.',
            link: 'https://github.com/sultanrafeed/Predictive-Modeling-and-Explainable-AI-Analysis',
        },
        '05': {
            story: 'Systematic study across Adam, SGD, RMSProp with batch sizes 16–256 on VGG-style CNN. Adam + batch 64 consistently won on CIFAR-10.',
            link: 'https://github.com/sultanrafeed/Optimizer-Perfomance-Evaluation',
        },
        '06': {
            story: 'Benchmarked identical algorithms in Python, Java, and C++ across O(n), O(n²), O(n log n) tasks. C++ was 40–80× faster than Python on sorting.',
            link: 'https://github.com/sultanrafeed/Efficiency-Comparison-Of-PL-in-Algorithm-Development',
        },
        '07': {
            story: 'First full-stack web project. Built a library portal with PDF uploads, user auth, and search. MySQL foreign keys taught me relational modeling.',
            link: 'https://github.com/sultanrafeed/librarymanagementsystem',
        },
        '08': {
            story: 'Wrote 60+ Selenium test cases covering login, checkout, and search flows. Generated HTML reports with pytest-html for the QA team.',
            link: 'https://github.com/sultanrafeed/Software-Testing-For-GigaTech',
        },
        '09': {
            story: 'Mini desktop app with CRUD contacts, SQLite persistence, and a Swing GUI. First Java project — got hooked on event-driven programming.',
            link: 'https://github.com/sultanrafeed/phonebook',
        },
    };

    document.querySelectorAll('.project-card').forEach(card => {
        const numEl = card.querySelector('.project-num');
        if (!numEl) return;
        const num = numEl.textContent.trim();
        const detail = DETAILS[num];
        if (!detail) return;

        // Inject detail panel HTML
        const panel = document.createElement('div');
        panel.className = 'project-detail';
        panel.innerHTML = `
            <div class="project-detail-title">Behind the build</div>
            <div class="project-detail-story">${detail.story}</div>
            <a href="${detail.link}" target="_blank" rel="noopener" class="project-detail-link">
                <i class="fa-brands fa-github"></i> View on GitHub
            </a>`;
        card.appendChild(panel);

        // Click on card number or anywhere non-link toggles detail
        card.addEventListener('click', (e) => {
            // If clicking the GitHub detail link, let it navigate
            if (e.target.closest('.project-detail-link')) return;

            const isOpen = card.classList.contains('detail-open');

            // Close all others first
            document.querySelectorAll('.project-card.detail-open').forEach(c => {
                c.classList.remove('detail-open');
            });

            if (!isOpen) {
                e.preventDefault(); // prevent navigating on first click (open detail)
                card.classList.add('detail-open');
                if (window.sound) window.sound.click();
            }
            // Second click (was open → now closed) → allow navigation via href
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-card')) {
            document.querySelectorAll('.project-card.detail-open').forEach(c => c.classList.remove('detail-open'));
        }
    });
})();

/* THREE.JS NEURAL PARTICLE NETWORK — disabled per user request */
(function initParticleNet() {
    return; // disabled
    if (reduceMotion || window.innerWidth < 768) return;
    if (typeof THREE === 'undefined') return;

    /* ── Scene setup ─────────────────────────────────────── */
    const W = window.innerWidth, H = window.innerHeight;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 300);
    camera.position.set(0, 0, 65);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.id    = 'particleNetCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
    // Insert right after atmosphere div so it's above aurora but below content
    const atmo = document.querySelector('.atmosphere');
    atmo ? atmo.after(canvas) : document.body.prepend(canvas);

    /* ── Particles ───────────────────────────────────────── */
    const COUNT = window.innerWidth > 1200 ? 240 : 160;
    const BOX   = { x: 110, y: 70, z: 55 };

    const pts = Array.from({ length: COUNT }, () => ({
        x:  (Math.random() - 0.5) * BOX.x,
        y:  (Math.random() - 0.5) * BOX.y,
        z:  (Math.random() - 0.5) * BOX.z,
        vx: (Math.random() - 0.5) * 0.045,
        vy: (Math.random() - 0.5) * 0.045,
        vz: (Math.random() - 0.5) * 0.018,
    }));

    const ptPos  = new Float32Array(COUNT * 3);
    const ptGeo  = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));

    // Particles — warm amber dots, varying size for depth illusion
    const ptMat  = new THREE.PointsMaterial({
        color: 0xfbbf24, size: 1.4, transparent: true,
        opacity: 0.55, sizeAttenuation: true,
    });
    scene.add(new THREE.Points(ptGeo, ptMat));

    /* ── Connection lines ────────────────────────────────── */
    const MAX_SEGS  = 500;
    const linePos   = new Float32Array(MAX_SEGS * 6);  // 2 verts × xyz
    const lineCol   = new Float32Array(MAX_SEGS * 6);  // vertex colors
    const lineGeo   = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));

    const lineMat   = new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.28,
    });
    const lineSegs  = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegs);

    const DIST     = 20;       // connection threshold (world units)
    const DIST_SQ  = DIST * DIST;
    // Amber decomposed for vertex color math
    const CR = 0.984, CG = 0.749, CB = 0.141; // #fbbf24

    /* ── Mouse parallax ──────────────────────────────────── */
    let mx = 0, my = 0;
    let camTX = 0, camTY = 0;
    document.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    /* ── Resize ───────────────────────────────────────────── */
    window.addEventListener('resize', () => {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }, { passive: true });

    /* ── Render loop ─────────────────────────────────────── */
    let frameId;
    function animate() {
        frameId = requestAnimationFrame(animate);

        // Move particles + bounce
        for (let i = 0; i < COUNT; i++) {
            const p = pts[i];
            p.x += p.vx;  p.y += p.vy;  p.z += p.vz;
            if (Math.abs(p.x) > BOX.x / 2) p.vx *= -1;
            if (Math.abs(p.y) > BOX.y / 2) p.vy *= -1;
            if (Math.abs(p.z) > BOX.z / 2) p.vz *= -1;
            const b = i * 3;
            ptPos[b] = p.x;  ptPos[b+1] = p.y;  ptPos[b+2] = p.z;
        }
        ptGeo.attributes.position.needsUpdate = true;

        // Build line segments between nearby particles
        let seg = 0;
        outer: for (let i = 0; i < COUNT; i++) {
            for (let j = i + 1; j < COUNT; j++) {
                const dx = pts[i].x - pts[j].x;
                const dy = pts[i].y - pts[j].y;
                const dz = pts[i].z - pts[j].z;
                const d2 = dx*dx + dy*dy + dz*dz;
                if (d2 < DIST_SQ) {
                    const alpha = (1 - Math.sqrt(d2) / DIST) * 0.5;
                    const b = seg * 6;
                    linePos[b]   = pts[i].x; linePos[b+1] = pts[i].y; linePos[b+2] = pts[i].z;
                    linePos[b+3] = pts[j].x; linePos[b+4] = pts[j].y; linePos[b+5] = pts[j].z;
                    lineCol[b]   = CR*alpha; lineCol[b+1] = CG*alpha; lineCol[b+2] = CB*alpha;
                    lineCol[b+3] = CR*alpha; lineCol[b+4] = CG*alpha; lineCol[b+5] = CB*alpha;
                    if (++seg >= MAX_SEGS) break outer;
                }
            }
        }
        lineGeo.setDrawRange(0, seg * 2);
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate    = true;

        // Smooth camera parallax
        camTX += (mx * 10 - camTX) * 0.04;
        camTY += (-my * 6  - camTY) * 0.04;
        camera.position.x = camTX;
        camera.position.y = camTY;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    // Fade out particles when scrolled far from hero (performance)
    window.addEventListener('scroll', () => {
        const pct = Math.min(window.scrollY / window.innerHeight, 1);
        canvas.style.opacity = String(1 - pct * 0.85);
    }, { passive: true });

    // Light mode — reduce opacity so particles don't clash
    const applyThemeOpacity = () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        ptMat.opacity  = isLight ? 0.25 : 0.55;
        lineMat.opacity = isLight ? 0.12 : 0.28;
    };
    applyThemeOpacity();
    document.getElementById('themeToggle')?.addEventListener('click', applyThemeOpacity);
})();

});


