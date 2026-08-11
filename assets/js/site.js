/* ═══════════════════════════════════════════════════════════════════════════
   Rafeed Mohammad Sultan / portfolio behaviour
   No dependencies. Every exhibit degrades to readable static HTML without it.
   Exhibits initialise lazily on first intersection; nothing runs eagerly.
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
  const wait = ms => new Promise(r => setTimeout(r, REDUCED.matches ? 0 : ms));

  /* ── Toast ──────────────────────────────────────────────────────────────── */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg, ms = 4200) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, ms);
  }

  /* ── Progressive enhancement ────────────────────────────────────────────── */
  /* Blocks that are revealed by an interaction ship VISIBLE in the HTML, so the
     page is complete without JavaScript. We collapse them here, eagerly, before
     the section can be scrolled to. */
  $$('[data-js-collapse]').forEach(el => { el.hidden = true; });

  /* ── Theme ──────────────────────────────────────────────────────────────── */
  (function theme() {
    const root = document.documentElement;
    const btn = $('#themeToggle');
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);

    const isDark = () => root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);

    const sync = () => btn && btn.setAttribute('aria-pressed', String(isDark()));
    sync();

    btn && btn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      sync();
    });
  })();

  /* ── Scroll spy ─────────────────────────────────────────────────────────── */
  (function spy() {
    const links = $$('.topbar__nav a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map();
    links.forEach(a => {
      const el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) map.set(el, a);
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const a = map.get(e.target);
        if (!a) return;
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('is-here'));
          a.classList.add('is-here');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((_, el) => io.observe(el));
  })();

  /* ── Lazy exhibit initialisation ────────────────────────────────────────── */
  /* Exhibits start when they come near the viewport. IntersectionObserver is
     the fast path, but it is only an optimisation: a scroll sweep and a hard
     timeout both also start exhibits, so no single mechanism failing can leave
     the page inert. `boot()` is called at the end of this file, once every
     INIT.* handler below has been defined. */
  const INIT = {};
  const started = new WeakSet();

  function ensure(el) {
    if (!el || started.has(el)) return;
    started.add(el);
    el.classList.add('is-in');
    try { INIT[el.dataset.lazy] && INIT[el.dataset.lazy](el); }
    catch (err) { console.warn('exhibit failed to start:', el.dataset.lazy, err); }
  }

  function boot() {
    const targets = $$('[data-lazy]');
    const near = el => {
      const r = el.getBoundingClientRect();
      return r.top < innerHeight * 1.2 && r.bottom > -innerHeight * 0.2;
    };
    const sweep = () => targets.forEach(el => { if (near(el)) ensure(el); });

    if ('IntersectionObserver' in window) {
      // threshold 0: an exhibit taller than the viewport can never reach a
      // fractional ratio, so any intersection at all is the correct trigger.
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          obs.unobserve(e.target);
          ensure(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
      targets.forEach(el => io.observe(el));
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; sweep(); });
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });

    sweep();
    // Last resort: if neither observer nor scroll has reached something within
    // a few seconds, start everything. A dormant exhibit is worse than an
    // eagerly-started one.
    setTimeout(() => targets.forEach(ensure), 3500);
  }

  /* Grow a set of bars from zero, fail-safe: the resting CSS state is already
     the final one, so if this never runs the chart is simply static and
     correct. `.pre` is only ever added when we know we can take it off again. */
  function grow(bars, delay = 60) {
    if (REDUCED.matches || !bars.length) return;
    bars.forEach(b => b.classList.add('pre'));
    setTimeout(() => bars.forEach(b => b.classList.remove('pre')), delay);
  }

  INIT.thesis = root => grow($$('.rho__bar', root));

  /* ═══ Experiment 02 / judges ════════════════════════════════════════════ */
  const JUDGES = {
    phi3: {
      rho: -0.71, val: 'ρ = −0.71', range: '2.83 – 3.56',
      verdict: 'Recovers the human ranking of the six systems closely. This is what a usable judge looks like.',
      foot: 'Phi-3 Mini is the strongest judge on the panel at 3.8B parameters, and still a small open model run locally.'
    },
    gemma: {
      rho: -0.71, val: 'ρ = −0.71', range: 'not reported here',
      verdict: 'Matches Phi-3 Mini’s agreement at roughly half the parameters. Scale was not the thing that mattered.',
      foot: 'Two judges reached identical agreement from very different capacity. Panel size would not have predicted that.'
    },
    zephyr: {
      rho: -0.09, val: 'ρ = −0.09', range: 'not reported here',
      verdict: 'Essentially no relationship to the human ranking, on an identical task with an identical rubric and identical responses. It still produced confident, well-formatted scores throughout.',
      foot: 'If this had been the only judge, the entire evaluation would have been noise, and nothing in the output would have looked wrong.'
    },
    gpt2: {
      rho: 0, val: 'degenerate', range: '1.21 – 2.73',
      verdict: 'Degenerate. Issued 1.21–2.73 where Phi-3 Mini issued 2.83–3.56, compressing six genuinely different systems into nearly one verdict.',
      foot: 'A judge can fail by having no opinion. Averaging it into a panel does not remove it; it dilutes everyone else.'
    }
  };

  INIT.judge = root => {
    const arc = $('#dialArc', root), val = $('#dialVal', root), range = $('#jRange', root);
    const verdict = $('#jVerdict', root), foot = $('#jFoot', root);
    const btns = $$('.jbtn', root);

    function show(key) {
      const j = JUDGES[key];
      if (!j) return;
      const mag = Math.abs(j.rho);
      arc.style.strokeDashoffset = String(100 - mag * 100);
      arc.style.stroke = mag === 0 ? 'var(--human)' : 'var(--machine)';
      val.textContent = j.val;
      val.style.color = mag === 0 ? 'var(--human)' : '';
      range.textContent = j.range;
      verdict.textContent = j.verdict;
      foot.textContent = j.foot;
      btns.forEach(b => {
        const on = b.dataset.judge === key;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', String(on));
      });
    }

    btns.forEach((b, i) => {
      b.addEventListener('click', () => show(b.dataset.judge));
      b.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const n = btns[(i + d + btns.length) % btns.length];
        n.focus(); show(n.dataset.judge);
      });
    });

    show('phi3');
    /* The rank-inversion disclosure is a native <details>, so no JS is required. */
  };

  /* ═══ Experiment 03 / retrieval and abstention ══════════════════════════ */
  const RAG = [
    {
      q: '“What is the punishment for criminal breach of trust?”', lang: 'en',
      steps: [
        ['received', 'done'],
        ['top-k passages returned', 'done'],
        ['relevant, passes threshold', 'done'],
        ['not needed', 'skip'],
        ['grounded in the retrieved section', 'done']
      ],
      out: ['', 'A grounded answer, with the section it came from cited alongside it.'],
      broken: {
        steps: [['received', 'done'], ['top-k passages returned', 'done'], ['removed', 'skip'], ['removed', 'skip'], ['generated from top-k regardless', 'done']],
        out: ['', 'Same answer. When the corpus contains the answer, the extra stages cost latency and buy nothing.']
      }
    },
    {
      q: 'জমি রেজিস্ট্রেশনের নিয়ম কী?', lang: 'bn',
      note: '“What are the rules for land registration?” Broad, underspecified, and the corpus is bilingual.',
      steps: [
        ['received', 'done'],
        ['top-k passages returned, weak match', 'done'],
        ['below threshold, fails', 'fail'],
        ['query expanded, retrieval re-run', 'done'],
        ['grounded on the second attempt', 'done']
      ],
      out: ['', 'An answer, but only because the query was rewritten first. This loop is the difference between the two systems.'],
      broken: {
        steps: [['received', 'done'], ['top-k passages returned, weak match', 'done'], ['removed', 'skip'], ['removed', 'skip'], ['generated from the weak match', 'done']],
        out: ['halluc', 'A fluent answer built on a passage that was never a good match. Nothing in the output signals that.']
      }
    },
    {
      q: '“How do I apply for a US H-1B visa?”', lang: 'en',
      note: 'Nothing in a Bangladeshi legal corpus answers this. Retrieval will still return its nearest neighbours, because that is what nearest-neighbour search does.',
      steps: [
        ['received', 'done'],
        ['top-k passages returned', 'done'],
        ['no passage is relevant, fails', 'fail'],
        ['rewritten twice, still nothing', 'fail'],
        ['refused', 'done']
      ],
      out: ['abstain', 'I don’t know. Nothing in this corpus answers that question.'],
      broken: {
        steps: [['received', 'done'], ['top-k passages returned', 'done'], ['removed', 'skip'], ['removed', 'skip'], ['generated from top-k regardless', 'done']],
        out: ['halluc', 'A confident, well-formatted paragraph about US immigration law, assembled from Bangladeshi legal text. This is the failure mode the relevance check exists to prevent.']
      }
    }
  ];

  INIT.rag = root => {
    const qEl = $('#ragQuery', root), note = $('#ragNote', root);
    const pipe = $$('.pipe__n', root), out = $('#ragOut', root);
    const outV = $('.ragout__v', out), breakBtn = $('#ragBreak', root), hint = $('#ragBreakHint', root);
    let current = 0, broken = false, run = 0;

    async function play(i) {
      current = i;
      const s = RAG[i];
      const cfg = broken && s.broken ? s.broken : s;
      const token = ++run;

      qEl.textContent = s.q;
      qEl.setAttribute('lang', s.lang);
      /* Notes are rendered, not hung off a title attribute, because a tooltip is
         invisible on touch and unreliable for screen readers. */
      note.textContent = s.note || '';
      note.hidden = !s.note;

      pipe.forEach(n => { n.className = 'pipe__n'; $('.pipe__v', n).textContent = '·'; });
      out.className = 'ragout';
      outV.textContent = '…';

      for (let k = 0; k < cfg.steps.length; k++) {
        await wait(k === 0 ? 90 : 300);
        if (token !== run) return;
        const [text, state] = cfg.steps[k];
        const n = pipe[k];
        $('.pipe__v', n).textContent = text;
        n.className = 'pipe__n is-' + state;
      }

      await wait(260);
      if (token !== run) return;
      const [cls, text] = cfg.out;
      out.className = 'ragout' + (cls ? ' is-' + cls : '');
      outV.textContent = text;

      if (cls === 'abstain') {
        outV.insertAdjacentHTML('beforeend',
          ' <span class="mono" style="color:var(--ink-3)">That is the correct answer, and the one the pipeline was never designed to produce.</span>');
      }
    }

    $$('.qbtn', root).forEach(b => b.addEventListener('click', () => {
      $$('.qbtn', root).forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      play(Number(b.dataset.q));
    }));

    breakBtn.addEventListener('click', () => {
      broken = !broken;
      breakBtn.setAttribute('aria-pressed', String(broken));
      breakBtn.textContent = broken ? 'Put the relevance check back' : 'Break it, remove the relevance check';
      hint.textContent = broken ? 'this is vanilla RAG, now try query three' : 'this is what vanilla RAG does';
      play(current);
    });

    play(0);
  };

  /* ═══ Experiment 01 / right answer, wrong reason ════════════════════════ */
  INIT.align = root => {
    const vote = $('#alignVote', root), reveal = $('#alignReveal', root), echo = $('#alignEcho', root);
    const bars = $$('.bar2__f', reveal);
    $$('.vbtn', vote).forEach(b => b.addEventListener('click', () => {
      if (vote.classList.contains('is-done')) return;
      vote.classList.add('is-done');
      b.classList.add('is-picked');
      echo.textContent = b.dataset.v === 'mis'
        ? 'You said the reason is unrelated. Standard accuracy disagrees with you: it scores this item as a hit.'
        : 'You said right, and standard accuracy agrees with you. Read the reason once more.';
      reveal.hidden = false;
      reveal.classList.add('is-shown');
      grow(bars, 90);
    }));
  };

  /* ═══ Experiment 04 / Bangla ════════════════════════════════════════════ */
  INIT.bangla = root => {
    const items = $$('.bnitem__t', root);
    $$('.lbtn', root).forEach(b => b.addEventListener('click', () => {
      const lang = b.dataset.lang;
      $$('.lbtn', root).forEach(x => {
        const on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-pressed', String(on));
      });
      items.forEach(p => {
        p.textContent = lang === 'bn' ? p.dataset.bn : p.dataset.en;
        p.setAttribute('lang', lang === 'bn' ? 'bn' : 'en');
      });
    }));
  };

  /* ═══ Experiment 05 / compression ══════════════════════════════════════ */
  const SQUEEZE = [
    { name: 'DenseNet161 teacher', params: '28.7M', dot: 132,
      acc: 'The reference architecture the student is measured against. Too large for the memory-constrained devices this was built for.' },
    { name: 'Distilled student', params: '0.35M', dot: 16,
      acc: '82× smaller, learned from multiple teachers at once. The paper does not report a standalone accuracy for this stage, so neither does this page.' },
    { name: 'Souped ensemble', params: '1.05M', dot: 28,
      acc: '88.0% on HAM10000. Model souping and ensembling buy back capacity at a fraction of the original size, and these are the same parameter-space operations I want to point at safety transfer.' }
  ];

  INIT.squeeze = root => {
    const range = $('#sqRange', root), dot = $('#sqDot', root);
    const name = $('#sqName', root), params = $('#sqParams', root), acc = $('#sqAcc', root);
    const steps = $$('#sqSteps li', root);

    function show(i) {
      const s = SQUEEZE[i];
      dot.style.setProperty('--d', s.dot + 'px');
      name.textContent = s.name;
      params.textContent = s.params;
      acc.textContent = s.acc;
      steps.forEach((li, k) => li.classList.toggle('is-on', k === i));
    }
    range.addEventListener('input', () => show(Number(range.value)));
    steps.forEach((li, k) => {
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => { range.value = String(k); show(k); });
    });
    show(0);
  };

  /* ═══ Systems / pipeline inspector ═════════════════════════════════════ */
  const ARCH = [
    ['Mixed-format source documents',
     'Customer context arrives as PDFs and images rather than clean text, so the pipeline starts before there is anything an embedding model can read.'],
    ['Ingestion',
     'Parsing, extraction and normalisation of multimodal input into chunked text with its provenance intact. Most of the eventual answer quality is decided here, not at the model.'],
    ['Azure PostgreSQL',
     'Vector and metadata storage on managed Postgres. Chosen so the retrieval layer sat inside infrastructure the team already operated, rather than adding a service nobody was on call for.'],
    ['Retrieval',
     'Query-time search over the stored context. The same architecture as the LegalRAG work, with production constraints attached: latency budgets, tenancy, and documents that change under you.'],
    ['LLM with guardrails',
     'Guardrailed prompting with explicit refusal handling. A production assistant that answers when it should not is a liability, so refusal behaviour is a feature to be specified, not an accident of the base model.'],
    ['Response',
     'Delivered to the product surface, and before release put through the evaluation protocols I designed for accuracy, robustness and instruction adherence.']
  ];

  INIT.pipe = root => {
    const detail = $('#archDetail', root);
    const nodes = $$('.anode', root);
    function show(i) {
      const [t, b] = ARCH[i];
      $('.arch__title', detail).textContent = t;
      $('.arch__text', detail).textContent = b;
      nodes.forEach((n, k) => {
        n.classList.toggle('is-on', k === i);
        n.setAttribute('aria-selected', String(k === i));
      });
    }
    nodes.forEach((n, i) => {
      n.addEventListener('click', () => show(i));
      n.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const nx = nodes[(i + d + nodes.length) % nodes.length];
        nx.focus(); show(nodes.indexOf(nx));
      });
    });
    show(0);
  };

  /* ═══ Provenance map ═══════════════════════════════════════════════════ */
  const PN = [
    { id: 'dfar',   x: 14,  y: 26,  w: 156, h: 40, t: 'DFAR', s: '5,000 annotated statements', kind: 'data',
      r: 'DFAR: 5,000 ethical statements with human-written rationales, twelve annotators. I designed the annotation protocol.' },
    { id: 'mad',    x: 14,  y: 106, w: 156, h: 40, t: 'MAD', s: '625 meta-articles', kind: 'data',
      r: 'MAD: 625 meta-articles over 6,344 supporting abstracts, built for long-context scientific synthesis.' },
    { id: 'legal',  x: 14,  y: 186, w: 156, h: 40, t: 'Bangla/English corpus', s: 'legal documents', kind: 'data',
      r: 'A bilingual Bangla/English legal corpus: the setting where multilingual retrieval stops being a benchmark and starts being a problem.' },
    { id: 'ham',    x: 14,  y: 266, w: 156, h: 40, t: 'HAM10000', s: 'skin lesion images', kind: 'data',
      r: 'HAM10000: the dermatology benchmark used to test how far compression can go.' },

    { id: 'p2',     x: 216, y: 26,  w: 150, h: 40, t: '[1] Beyond Labels', s: 'ICPR 2024', kind: 'paper',
      r: 'Beyond Labels (ICPR 2024). Reason-supervised QLoRA: 36.4% → 89.4% accuracy, Misalignment Rate 52.0% → 9.4%.' },
    { id: 'p3',     x: 216, y: 106, w: 150, h: 40, t: '[3] Meta-Analysis', s: 'IEEE BigData 2024', kind: 'paper',
      r: 'Empowering Meta-Analysis (IEEE BigData 2024). Inverse Cosine Distance loss; 87.6% relevance over thirteen annotators.' },
    { id: 'p1',     x: 216, y: 186, w: 150, h: 40, t: '[2] LegalRAG', s: 'IJCNN 2025', kind: 'paper',
      r: 'LegalRAG (IJCNN 2025), equal first author. Relevance check and query refinement over vanilla RAG, and the out-of-context failure it could not fix.' },
    { id: 'p4',     x: 216, y: 266, w: 150, h: 40, t: '[4] Souping + KD', s: 'Elsevier Q1 2024', kind: 'paper',
      r: 'Efficient Skin Cancer Detection (Intelligence-Based Medicine, Q1). Multi-teacher distillation, model souping, 82× compression.' },

    { id: 'mr',     x: 410, y: 16,  w: 150, h: 40, t: 'Misalignment Rate', s: 'metric I proposed', kind: 'work',
      r: 'Misalignment Rate: the share of items where the label is right and the reasoning is not. Everything downstream depends on being able to measure that gap.' },
    { id: 'judge',  x: 410, y: 92,  w: 150, h: 40, t: 'Judge study', s: '4 judges · 6 systems', kind: 'work',
      r: 'The independent cross-model LLM-as-judge study. Agreement with humans ranged from ρ = −0.71 to −0.09, the finding this whole site is arranged around.' },
    { id: 'prod',   x: 410, y: 168, w: 150, h: 40, t: 'Production RAG + MCP', s: 'SELISE, 18 months', kind: 'work',
      r: 'Production RAG ingestion and retrieval, a guardrailed voice agent, MCP tool servers and agentic orchestration: the same subject matter with a customer attached.' },
    { id: 'be',     x: 410, y: 244, w: 150, h: 40, t: 'BanglaEval', s: 'open harness, running', kind: 'work',
      r: 'BanglaEval: an open Bangla evaluation harness that reports its own judge disagreement. Built; no results published yet, and the site says so.' },

    { id: 'd1',     x: 630, y: 54,  w: 214, h: 44, t: 'Direction 01', s: 'judge reliability outside English', kind: 'dir',
      r: 'Direction 01: measure, rather than assume, judge reliability in Bangla and comparable Global-South languages.' },
    { id: 'd2',     x: 630, y: 154, w: 214, h: 44, t: 'Direction 02', s: 'does safety alignment transfer?', kind: 'dir',
      r: 'Direction 02: build Bangla refusal and red-team resources with rationales, then move alignment by parameter-space methods instead of retraining.' },
    { id: 'd3',     x: 630, y: 254, w: 214, h: 44, t: 'Direction 03', s: 'faithfulness + abstention', kind: 'dir',
      r: 'Direction 03: component-level diagnosis of where faithfulness breaks in agentic retrieval, with abstention as a primary metric.' }
  ];

  const PE = [
    ['dfar', 'p2'], ['mad', 'p3'], ['legal', 'p1'], ['ham', 'p4'],
    ['p2', 'mr'], ['mr', 'judge'], ['p2', 'judge'],
    ['p3', 'prod'], ['p1', 'prod'], ['p1', 'be'],
    ['judge', 'd1'], ['be', 'd1'],
    ['p2', 'd2'], ['p4', 'd2'],
    ['p1', 'd3'], ['prod', 'd3']
  ];

  INIT.prov = root => {
    const svg = $('#provSvg', root), gE = $('#provEdges', svg), gN = $('#provNodes', svg);
    const read = $('#provRead', root);
    const fallback = $('#provFallback', root);
    if (fallback) fallback.remove(); /* the drawn map replaces the prose version */
    const base = read.textContent;
    const byId = Object.fromEntries(PN.map(n => [n.id, n]));
    const NS = 'http://www.w3.org/2000/svg';

    PE.forEach(([a, b]) => {
      const s = byId[a], t = byId[b];
      const x1 = s.x + s.w, y1 = s.y + s.h / 2, x2 = t.x, y2 = t.y + t.h / 2;
      const dx = Math.max(28, (x2 - x1) * 0.5);
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
      p.dataset.a = a; p.dataset.b = b;
      gE.appendChild(p);
    });

    PN.forEach(n => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'pnode' + (n.kind === 'dir' ? ' pnode--dir' : ''));
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', n.t + ': ' + n.s);
      g.dataset.id = n.id;

      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', n.x); r.setAttribute('y', n.y);
      r.setAttribute('width', n.w); r.setAttribute('height', n.h);
      g.appendChild(r);

      const t1 = document.createElementNS(NS, 'text');
      t1.setAttribute('x', n.x + 10); t1.setAttribute('y', n.y + n.h / 2 - 6);
      t1.textContent = n.t;
      g.appendChild(t1);

      const t2 = document.createElementNS(NS, 'text');
      t2.setAttribute('class', 'pn-sub');
      t2.setAttribute('x', n.x + 10); t2.setAttribute('y', n.y + n.h / 2 + 8);
      t2.textContent = n.s;
      g.appendChild(t2);

      gN.appendChild(g);
    });

    const nodes = $$('.pnode', gN), edges = $$('path', gE);

    function clear() {
      root.classList.remove('is-focus');
      nodes.forEach(n => n.classList.remove('is-lit', 'is-sel'));
      edges.forEach(e => e.classList.remove('is-lit'));
      read.textContent = base;
    }

    function lite(id) {
      root.classList.add('is-focus');
      nodes.forEach(n => n.classList.remove('is-lit', 'is-sel'));
      edges.forEach(e => e.classList.remove('is-lit'));
      const near = new Set([id]);
      edges.forEach(e => {
        if (e.dataset.a === id || e.dataset.b === id) {
          e.classList.add('is-lit');
          near.add(e.dataset.a); near.add(e.dataset.b);
        }
      });
      nodes.forEach(n => {
        if (n.dataset.id === id) n.classList.add('is-sel');
        else if (near.has(n.dataset.id)) n.classList.add('is-lit');
      });
      read.textContent = byId[id].r;
    }

    nodes.forEach(n => {
      n.addEventListener('mouseenter', () => lite(n.dataset.id));
      n.addEventListener('focus', () => lite(n.dataset.id));
      n.addEventListener('click', () => lite(n.dataset.id));
      n.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lite(n.dataset.id); }
        if (e.key === 'Escape') clear();
      });
    });
    svg.addEventListener('mouseleave', clear);
  };

  /* ═══ Live GitHub ══════════════════════════════════════════════════════ */
  INIT.gh = async root => {
    const status = $('#ghStatus', root);
    const cards = $$('.repo', root);
    const CACHE = 'gh:sultanrafeed:v1';

    const fmt = iso => {
      const d = new Date(iso), now = Date.now();
      const days = Math.round((now - d) / 864e5);
      if (days < 1) return 'updated today';
      if (days < 31) return `updated ${days}d ago`;
      if (days < 365) return `updated ${Math.round(days / 30)}mo ago`;
      return `updated ${d.getFullYear()}`;
    };

    let data;
    try {
      const cached = sessionStorage.getItem(CACHE);
      if (cached) {
        data = JSON.parse(cached);
      } else {
        const res = await fetch('https://api.github.com/users/sultanrafeed/repos?per_page=100&sort=updated', {
          headers: { Accept: 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        data = await res.json();
        try { sessionStorage.setItem(CACHE, JSON.stringify(data)); } catch (_) {}
      }
    } catch (err) {
      status.textContent = 'GitHub’s API did not answer just now (it rate-limits anonymous requests), so these are the descriptions written into the page. The links are unaffected.';
      return;
    }

    if (!Array.isArray(data)) {
      status.textContent = 'GitHub returned an unexpected response. Showing the descriptions written into the page.';
      return;
    }

    const byName = Object.fromEntries(data.map(r => [r.name, r]));
    let hits = 0;

    cards.forEach(card => {
      const r = byName[card.dataset.repo];
      if (!r) return;
      hits++;
      if (r.description) $('.repo__d', card).textContent = r.description;
      const bits = [];
      if (r.language) bits.push(`<span class="repo__lang">${esc(r.language)}</span>`);
      if (r.stargazers_count) bits.push(`★ ${r.stargazers_count}`);
      if (r.forks_count) bits.push(`⎇ ${r.forks_count}`);
      if (r.pushed_at) bits.push(fmt(r.pushed_at));
      $('.repo__m', card).innerHTML = bits.join('<span aria-hidden="true">·</span>');
    });

    status.textContent = `Live from the GitHub API a moment ago: ${hits} of ${cards.length} shown here, out of ${data.length} public repositories. Stars and forks are whatever they actually are; this is evidence, not a scoreboard.`;
  };

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ═══ Easter eggs ══════════════════════════════════════════════════════ */

  /* 1. `j` = judge mode. Grades the page with meaningless scores, on purpose. */
  (function judgeMode() {
    let on = false;
    const heads = () => $$('.band__head, .xp__head');
    function toggle() {
      on = !on;
      if (!on) { $$('.jm').forEach(el => el.remove()); toast('Judge mode off.'); return; }
      heads().forEach(h => {
        const score = (Math.random() * 3 + 2.4).toFixed(2);
        const s = document.createElement('span');
        s.className = 'jm';
        s.textContent = `judge → ${score} / 6`;
        s.title = 'These scores are generated at random and mean nothing. They are formatted exactly like scores that do mean something, which is the entire problem.';
        h.appendChild(s);
      });
      toast('Judge mode on. Every heading now carries a confident score. None of them mean anything, so hover one.', 7000);
    }
    addEventListener('keydown', e => {
      if (e.key !== 'j' && e.key !== 'J') return;
      const t = e.target;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      toggle();
    });
  })();

  /* 2. The confidence readout. */
  (function confidence() {
    const btn = $('#confBtn');
    if (!btn) return;
    const lines = [
      'That is exactly why we evaluate it.',
      'Confidence is not calibration. Ask any judge on this page.',
      'It has been suspiciously high since 2024. Nobody has audited it.',
      'A number this clean should make you more suspicious, not less.'
    ];
    let i = 0;
    btn.addEventListener('click', () => { toast(lines[i % lines.length]); i++; });
  })();

  /* 3. Console note. */
  console.log(
    '%cThe field grades language models with language models.',
    'font: italic 15px Georgia, serif; color:#B4402B'
  );
  console.log(
    '%cThis page has no framework, no analytics and no cookies. ' +
    'Every figure traces to a paper, a repo or the CV, see the ledger in Evidence.\n' +
    'Two things deliberately have no number: the distilled student’s standalone accuracy, ' +
    'and the BanglaEval leaderboard. Neither has been measured, so neither is claimed.\n' +
    'Source: https://github.com/sultanrafeed/github-portfolio  ·  Press j.',
    'font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.6'
  );

  /* Every INIT.* handler is defined by this point, so it is safe to start. */
  boot();

})();
