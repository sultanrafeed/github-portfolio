/* ══════════════════════════════════════════════════════════════
   Rafeed Mohammad Sultan, a claim set with sources

   One idea drives this file: the document declares claims, and
   every claim points at an exhibit that declares its own evidence
   class. Nothing here is decorative. The citation index, the
   "cited by" backlinks and the source chips are all derived from
   the markup at runtime, so they cannot drift out of sync with
   what the page actually says.
   ══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var desktop = window.matchMedia('(min-width: 901px)');
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ── source taxonomy ─────────────────────────────────── */
    var SOURCES = {
        'peer-reviewed': { label: 'peer-reviewed', cls: 'chip-peer', rank: 1 },
        'repo': { label: 'public repo', cls: 'chip-repo', rank: 2 },
        'credential': { label: 'credential', cls: 'chip-credential', rank: 3 },
        'employment': { label: 'employment', cls: 'chip-employment', rank: 4 },
        'unverified': { label: 'unverified', cls: 'chip-unverified', rank: 5 }
    };

    /* ── read the exhibits out of the DOM ────────────────── */
    var EX = {};
    var ORDER = [];

    $$('#exhibits .ex').forEach(function (node) {
        var id = node.id;
        ORDER.push(id);
        EX[id] = {
            id: id,
            node: node,
            title: $('h3', node).textContent.trim(),
            kind: node.dataset.kind || '',
            meta: node.dataset.meta || '',
            source: node.dataset.source || 'unverified',
            related: (node.dataset.related || '').split(',').filter(Boolean)
        };
    });

    /* ── every element that cites an exhibit ─────────────── */
    var citers = $$('[data-ex]');

    // backlinks: which sections cite this exhibit
    citers.forEach(function (el) {
        var ex = EX[el.dataset.ex];
        if (!ex) return;
        if (!ex.citedBy) ex.citedBy = [];
        var sec = el.closest('.sec');
        if (sec) ex.citedBy.push({ el: el, sec: sec.id, name: secName(sec) });
    });

    function secName(sec) {
        var l = $('.sec-label', sec);
        return l ? l.textContent.replace(/\s+/g, ' ').trim() : sec.id;
    }

    /* ── source chips (revealed by evidence mode) ────────── */
    citers.forEach(function (el) {
        var ex = EX[el.dataset.ex];
        if (!ex) return;
        var s = SOURCES[ex.source] || SOURCES.unverified;

        // A run of adjacent citations sharing an evidence class gets one chip,
        // not five. The point is the grade, not the repetition.
        el.setAttribute('aria-label', 'Exhibit ' + ex.id + ': ' + ex.title + ' / ' + s.label);

        // The repository list is uniformly public, so one summary chip on the
        // section reads better than nine identical ones down the margin.
        if (el.classList.contains('repo')) return;

        var prev = el.previousElementSibling;
        var between = prev && prev.nextSibling !== el
            ? (prev.nextSibling.textContent || '').trim()
            : '';
        if (prev && !between && prev.classList.contains('src-chip') && prev.dataset.src === ex.source) {
            el.setAttribute('aria-label', 'Exhibit ' + ex.id + ': ' + ex.title + ' / ' + s.label);
            return;
        }

        var chip = document.createElement('span');
        chip.dataset.src = ex.source;
        chip.className = 'chip src-chip ' + s.cls;
        chip.textContent = s.label;
        chip.setAttribute('aria-hidden', 'true');
        if (el.classList.contains('cite')) {
            el.insertAdjacentElement('afterend', chip);
        } else {
            el.appendChild(chip);
        }
    });

    // one chip for the whole repository list
    (function () {
        var list = $('#repoList');
        if (!list) return;
        var n = $$('.repo[data-ex]', list).length;
        var chip = document.createElement('span');
        chip.className = 'chip src-chip chip-repo';
        chip.textContent = 'public repo × ' + n;
        chip.setAttribute('aria-hidden', 'true');
        list.previousElementSibling.appendChild(chip);
    })();

    /* ── build an exhibit card ───────────────────────────── */
    function card(id) {
        var ex = EX[id];
        var src = SOURCES[ex.source] || SOURCES.unverified;
        var wrap = document.createElement('div');
        wrap.className = 'ex-card';

        var top = document.createElement('div');
        top.className = 'ec-top';
        top.innerHTML = '<span class="ec-id">' + ex.id + '</span><span>' + esc(ex.kind) + '</span>' +
            (ex.meta ? '<span>' + esc(ex.meta) + '</span>' : '');
        var chip = document.createElement('span');
        chip.className = 'chip ' + src.cls;
        chip.textContent = src.label;
        top.appendChild(chip);
        wrap.appendChild(top);

        var h = document.createElement('h3');
        h.textContent = ex.title;
        wrap.appendChild(h);

        var dl = $('dl', ex.node);
        if (dl) wrap.appendChild(dl.cloneNode(true));

        var tags = $('.ex-tags', ex.node);
        if (tags) {
            var t = tags.cloneNode(true);
            t.className = 'ec-tags';
            wrap.appendChild(t);
        }

        var note = $('.ex-note', ex.node);
        if (note) {
            var n = note.cloneNode(true);
            n.className = 'ec-note';
            wrap.appendChild(n);
        }

        $$('.ex-src', ex.node).forEach(function (link) {
            var a = link.cloneNode(true);
            a.className = 'ec-src';
            a.innerHTML = a.textContent + '<svg class="ic" aria-hidden="true"><use href="#i-out"/></svg>';
            wrap.appendChild(a);
        });

        // derived links
        var links = document.createElement('div');
        links.className = 'ec-links';
        var any = false;

        if (ex.related.length) {
            any = true;
            links.appendChild(rowOf('Related', ex.related.map(function (rid) {
                return btn(rid + ' · ' + shortTitle(rid), function () { open(rid); });
            })));
        }
        if (ex.citedBy && ex.citedBy.length) {
            any = true;
            var seen = {};
            var backs = [];
            ex.citedBy.forEach(function (c) {
                if (seen[c.sec]) return;
                seen[c.sec] = 1;
                backs.push(btn(c.name, function () { jumpTo(c.el); }));
            });
            links.appendChild(rowOf('Cited in', backs));
        }
        if (any) wrap.appendChild(links);

        return wrap;
    }

    function shortTitle(id) {
        var ex = EX[id];
        if (!ex) return id;
        return ex.title.split(/[,:]/)[0].trim().slice(0, 34);
    }

    function rowOf(label, buttons) {
        var box = document.createElement('div');
        var h = document.createElement('h4');
        h.textContent = label;
        box.appendChild(h);
        var row = document.createElement('div');
        row.className = 'row';
        buttons.forEach(function (b) { row.appendChild(b); });
        box.appendChild(row);
        return box;
    }

    function btn(text, fn) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = text;
        b.addEventListener('click', fn);
        return b;
    }

    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

    /* ── the rail ────────────────────────────────────────── */
    var rail = $('#rail');
    var railIndex = $('#railIndex');
    var railSlot = $('#railSlot');
    var railBack = $('#railBack');
    var ixList = $('#ixList');
    var legend = $('#legend');

    ORDER.forEach(function (id) {
        var ex = EX[id];
        var li = document.createElement('li');
        li.dataset.source = ex.source;
        var b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = '<span class="ix-id">' + ex.id + '</span><span class="ix-t"></span>';
        $('.ix-t', b).textContent = ex.title;
        b.addEventListener('click', function () { open(id); });
        li.appendChild(b);
        ixList.appendChild(li);
    });

    // legend doubles as a filter over the index
    var counts = {};
    ORDER.forEach(function (id) { counts[EX[id].source] = (counts[EX[id].source] || 0) + 1; });
    var filter = null;

    Object.keys(SOURCES).sort(function (a, b) { return SOURCES[a].rank - SOURCES[b].rank; })
        .forEach(function (key) {
            if (!counts[key]) return;
            var b = document.createElement('button');
            b.type = 'button';
            b.dataset.src = key;
            b.setAttribute('aria-pressed', 'false');
            b.innerHTML = '<span class="swatch"></span><span>' + SOURCES[key].label +
                '</span><span class="n">' + counts[key] + '</span>';
            b.addEventListener('click', function () {
                filter = (filter === key) ? null : key;
                $$('#legend button').forEach(function (x) {
                    x.setAttribute('aria-pressed', String(x.dataset.src === filter));
                });
                $$('#ixList li').forEach(function (li) {
                    li.classList.toggle('is-dim', !!filter && li.dataset.source !== filter);
                });
            });
            legend.appendChild(b);
        });

    /* ── open / close an exhibit ─────────────────────────── */
    var current = null;
    var sheet = $('#sheet');
    var sheetBody = $('#sheetBody');
    var scrim = $('#sheetScrim');
    var lastFocus = null;

    function light(id) {
        $$('.is-lit').forEach(function (e) { e.classList.remove('is-lit'); });
        $$('.cite.is-active').forEach(function (e) { e.classList.remove('is-active'); });
        if (!id) return;
        $$('[data-ex="' + id + '"]').forEach(function (el) {
            el.classList.add(el.classList.contains('cite') ? 'is-active' : 'is-lit');
            var host = el.closest('.claim');
            if (host && el.classList.contains('cite')) host.classList.add('is-lit');
        });
    }

    function open(id) {
        if (!EX[id]) return;
        current = id;
        light(id);
        history.replaceState(null, '', '#' + id);

        if (desktop.matches) {
            railSlot.innerHTML = '';
            railSlot.appendChild(card(id));
            railSlot.hidden = false;
            railIndex.hidden = true;
            railBack.hidden = false;
            railSlot.scrollTop = 0;
            $('.rail-title').textContent = 'Exhibit ' + id;
        } else {
            lastFocus = document.activeElement;
            sheetBody.innerHTML = '';
            sheetBody.appendChild(card(id));
            sheet.hidden = false;
            scrim.hidden = false;
            document.body.style.overflow = 'hidden';
            sheetBody.scrollTop = 0;
            $('#sheetClose').focus();
        }
    }

    function toIndex() {
        current = null;
        light(null);
        railSlot.hidden = true;
        railIndex.hidden = false;
        railBack.hidden = true;
        $('.rail-title').textContent = 'Evidence';
    }

    function closeSheet() {
        sheet.hidden = true;
        scrim.hidden = true;
        document.body.style.overflow = '';
        light(null);
        current = null;
        if (lastFocus) lastFocus.focus();
    }

    railBack.addEventListener('click', toIndex);
    $('#sheetClose').addEventListener('click', closeSheet);
    scrim.addEventListener('click', closeSheet);

    // drag the sheet down to dismiss
    (function () {
        var y0 = null, dy = 0;
        sheet.addEventListener('touchstart', function (e) {
            if (sheetBody.scrollTop > 0 && e.target.closest('.sheet-body')) return;
            y0 = e.touches[0].clientY; dy = 0;
            sheet.style.transition = 'none';
        }, { passive: true });
        sheet.addEventListener('touchmove', function (e) {
            if (y0 === null) return;
            dy = Math.max(0, e.touches[0].clientY - y0);
            sheet.style.transform = 'translateY(' + dy + 'px)';
        }, { passive: true });
        sheet.addEventListener('touchend', function () {
            if (y0 === null) return;
            sheet.style.transition = '';
            sheet.style.transform = '';
            if (dy > 80) closeSheet();
            y0 = null;
        });
    })();

    function jumpTo(el) {
        if (!desktop.matches) closeSheet();
        el.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'center' });
    }

    citers.forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            open(el.dataset.ex);
        });
    });

    // deep link: /#E04 opens that exhibit
    if (/^#E\d+$/.test(location.hash) && EX[location.hash.slice(1)]) {
        setTimeout(function () { open(location.hash.slice(1)); }, 350);
    }

    desktop.addEventListener('change', function () {
        if (desktop.matches) { closeSheet(); }
        else { toIndex(); }
    });

    /* ── evidence mode ───────────────────────────────────── */
    var evToggle = $('#evToggle');

    function setEvidence(on, announce) {
        document.body.classList.toggle('ev-on', on);
        evToggle.setAttribute('aria-pressed', String(on));
        try { localStorage.setItem('rs-ev', on ? '1' : '0'); } catch (e) { }
        if (announce) toast(on
            ? 'Sources on. Every claim now shows its evidence class.'
            : 'Sources off.');
    }

    var evSaved = null;
    try { evSaved = localStorage.getItem('rs-ev'); } catch (e) { }
    setEvidence(evSaved === '1', false);

    evToggle.addEventListener('click', function () {
        setEvidence(!document.body.classList.contains('ev-on'), true);
    });

    /* ── theme ───────────────────────────────────────────── */
    var themeToggle = $('#themeToggle');
    themeToggle.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('rs-theme', next); } catch (e) { }
        var m = $('meta[name="theme-color"]');
        if (m) m.setAttribute('content', next === 'dark' ? '#0e100f' : '#f3f1ea');
    });

    /* ── keyboard ────────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
        var t = e.target.tagName;
        if (t === 'INPUT' || t === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;

        if (e.key === 'Escape') {
            if (!sheet.hidden) closeSheet();
            else if (current) toIndex();
            return;
        }
        if (e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            setEvidence(!document.body.classList.contains('ev-on'), true);
        }
        if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            themeToggle.click();
        }
    });

    /* ── scroll: progress + current section ──────────────── */
    var bar = $('#readBar');
    var secs = $$('.sec');
    var navLinks = $$('.mast-nav a, .contents a');
    var ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (max > 0 ? Math.min(1, window.scrollY / max) * 100 : 0) + '%';

            var mid = window.innerHeight * 0.35;
            var active = secs[0];
            secs.forEach(function (s) {
                if (s.getBoundingClientRect().top <= mid) active = s;
            });
            navLinks.forEach(function (a) {
                a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + active.id));
            });
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── reveal ──────────────────────────────────────────── */
    if ('IntersectionObserver' in window && !calm.matches) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.02 });
        secs.forEach(function (s) { io.observe(s); });
        // safety net: nothing on this page is allowed to stay invisible
        setTimeout(function () { secs.forEach(function (s) { s.classList.add('in'); }); }, 2500);
    } else {
        secs.forEach(function (s) { s.classList.add('in'); });
    }

    /* ── copy buttons ────────────────────────────────────── */
    $$('.copy').forEach(function (b) {
        b.addEventListener('click', function () {
            var v = b.dataset.copy;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(v).then(function () { toast('Copied ' + v); },
                    function () { toast(v); });
            } else { toast(v); }
        });
    });

    /* ── contact form ────────────────────────────────────── */
    var form = $('#contactForm');
    form.addEventListener('submit', function (e) {
        var ok = true;
        $$('input[required], textarea[required]', form).forEach(function (f) {
            var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
            f.classList.toggle('invalid', bad);
            if (bad && ok) { f.focus(); ok = false; }
        });
        if (!ok) { e.preventDefault(); toast('Please fill that in first.'); return; }

        if (!window.fetch) return; // let the plain POST happen
        e.preventDefault();

        var send = $('.send', form);
        send.disabled = true;
        send.textContent = 'Sending…';

        fetch('https://formsubmit.co/ajax/sultanrafeed@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                name: form.name.value,
                email: form.email.value,
                message: form.message.value,
                _subject: 'New message from your portfolio'
            })
        }).then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            toast('Sent. I\'ll reply from sultanrafeed@gmail.com.');
        }).catch(function () {
            toast('Didn\'t go through. Email sultanrafeed@gmail.com directly.');
        }).then(function () {
            send.disabled = false;
            send.innerHTML = 'Send <svg class="ic" aria-hidden="true"><use href="#i-out"/></svg>';
        });
    });

    /* ── toast ───────────────────────────────────────────── */
    var toastEl = $('#toast');
    var toastTimer;
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
    }

    /* ── misc ────────────────────────────────────────────── */
    $('#year').textContent = new Date().getFullYear();
    $('#exCount').textContent = ORDER.length;
})();
