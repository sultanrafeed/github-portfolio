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

});