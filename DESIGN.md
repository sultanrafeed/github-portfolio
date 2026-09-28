# Design record: portfolio rebuild

This file is the reasoning behind the site. It exists so the next person to touch
the code (probably future Rafeed) knows *why* something is the way it is, and
does not "improve" a deliberate decision by accident.

---

## 0. What the sources actually said

Three sources were read before any UI was designed: the current site, the
researcher CV, and the live GitHub account (repo list, file trees, READMEs).

**What the CV had that the old site did not:**

- A stated research thesis, not a list of interests: *the field grades language
  models with language models, and that substitution was adopted faster than it
  was validated.*
- The independent LLM-as-judge study, with real numbers: 4 judges, 6 response
  systems, 500 statement–reason pairs, Spearman ρ from −0.71 down to −0.09, a
  documented rank inversion, a degenerate judge.
- Misalignment Rate as a metric he proposed, and what it separates.
- LegalRAG's *failure*: out-of-context and unanswerable queries, which no tested
  configuration resolved.
- Production engineering that is genuinely adjacent to the research (RAG
  ingestion, voice agent with refusal handling, MCP tool server, agentic
  orchestration) rather than unrelated CRUD work.

**What GitHub had that neither had:**

- `banglaeval`: an open evaluation harness for Bangla instruction-following,
  factuality and refusal, that reports judge disagreement as a headline number.
  It has a `LIMITATIONS.md` that states its own weaknesses before anyone else
  can. This is research direction 1+2 already turned into running code, and it
  was completely invisible on the old site.
- `nsw-energy-forecast`: a deployed ML system with a champion/challenger
  retraining gate and a real holdout result (1.50% MAPE vs 5.42% naive).
- The `banglaeval` leaderboard is **empty**. No run has been published.

That last point matters. The honest thing to show is an instrument that is built
and not yet reporting. The site says exactly that. It does not invent numbers.

**Discrepancies found and resolved:**

- The old site showed projects `Rokkha` and `Roomafy`, which have no
  corresponding public repository and appear nowhere in the CV. They are not
  carried over. If they are real, they need a source before they go back.
- The old README described the site as "biriyani-themed" with a "mock GitHub
  contribution heatmap". A *mock* heatmap is anti-evidence. Removed.
- The old site's CV link pointed at `rafeed_sultan_academic_CV.pdf`, which is
  deleted in the working tree. The new site links the researcher CV.

---

## 1. Six concepts

### A. The Disagreement Engine
**Metaphor:** the website is itself an evaluation harness. Every claim it makes
is scored by a panel of judges, and the panel disagrees.
**Homepage:** one claim, four judges, four different scores, visible spread.
**Projects as:** systems under evaluation.
**Research as:** the rubric.
**GitHub as:** the raw judgement log.
**Why not typical:** portfolios assert; this one *scores itself and shows the
error bar*.
**Risk:** if applied to everything it becomes a joke that outstays its welcome,
and a recruiter cannot find a phone number.

### B. Margin Notes / The Lab Notebook
**Metaphor:** a research notebook. Clean prose in the main column, evidence in
the margin. Click any claim and its source, method and result slide into the
margin next to it.
**Homepage:** a short first-person page of prose that happens to be entirely
annotated.
**Why not typical:** it treats reading as the primary interaction rather than
scrolling.
**Risk:** margins do not exist on mobile. Needs a genuinely different mobile
model, not a squeeze.

### C. The Failure Museum
**Metaphor:** exhibits of systems that broke. Each has a working state, a lever,
and a documented failure.
**Homepage:** a wall of things that went wrong, with dates.
**Why not typical:** nobody shows failures.
**Risk:** reads as self-deprecation. A hiring manager skimming for 15 seconds
sees only failure. Needs the working state to come first.

### D. The Instrument Panel
**Metaphor:** a bench of laboratory instruments you can operate: dials,
readouts, a signal path.
**Risk:** this is a hair's breadth from "cyberpunk dashboard", which is banned,
and it makes text secondary to chrome. Skin-deep.

### E. The Ranking That Moves
**Metaphor:** the entire site is a leaderboard, and the ordering changes
depending on which judge you ask. Choose "recruiter", "researcher", "engineer"
and the page reorders itself.
**Why not typical:** the IA is the argument.
**Risk:** a page that rearranges under the visitor is disorienting, breaks deep
links, and destroys scroll position. Also it is a personalisation gimmick
wearing a research costume.

### F. Provenance Graph / Pull the Thread
**Metaphor:** everything is a node (paper, dataset, repo, metric, employer) and
edges are real derivations. Nothing is presented; everything is traced.
**Why not typical:** it shows how the work compounds instead of listing it.
**Risk:** as a *primary* navigation model it is a maze. Force-directed graphs
are also a performance and accessibility problem, and every one of them looks
the same.

---

## 2. Elimination

- **D is cut outright.** It is a style, not an idea, and the style is on the
  banned list.
- **E is cut.** Reordering the page under the reader fails the "readable, fast,
  intuitive" constraint and the deep-link requirement. The *insight* behind it,
  that the answer depends who is asking, survives as content rather than as
  layout behaviour.
- **F is demoted** from navigation to a single bounded exhibit. As a hand-laid
  static SVG with real edges it is fast, deterministic, keyboard-navigable and
  honest. As a physics simulation driving the whole site it is a liability.
- **C is demoted** from the concept to a *rule*: every exhibit must have a
  working state first and a failure state second. Failure is the punchline, not
  the premise.
- **A and B survive.** A is the thesis. B is the mechanism that keeps A readable.

---

## 3. The synthesis: "The Bench"

> **A is what the site argues. B is how the site reads. C is the rule every
> exhibit obeys. F is one exhibit.**

The site is an editorial research notebook whose spine is a single idea:

**"A model can look aligned without being aligned. A judge can look reliable
without being reliable. The work is telling the difference."**

That is not a slogan invented for the website. It is the first sentence of his
research interests, the reason `Misalignment Rate` exists, the finding of the
LLM-as-judge study, the design principle of `banglaeval`, and the reason
`LIMITATIONS.md` is in the repo. The site is built around the one idea that is
already true across every piece of his work.

Three rules follow from it, and they are enforced everywhere:

1. **Every exhibit works before it breaks.** Show the system doing its job.
   Then hand the visitor the lever.
2. **Every number is traceable.** A figure on screen can be expanded to its
   source: which paper, which run, which repo. No decorative statistics, no
   count-up animations.
3. **Absence is reportable.** Where there is no result yet (`banglaeval`), the
   site says so. An empty leaderboard is displayed as an empty leaderboard.

### Information architecture

Not the old resume headings. Six movements, each answering a question a real
visitor arrives with:

| Section | The visitor's question |
|---|---|
| `The bench` | What is this and who is he? |
| `Experiments` | What has he actually investigated? *(5 interactive exhibits)* |
| `Systems` | Does he ship, or only publish? |
| `Evidence` | Can I verify any of this? *(papers, provenance map, live GitHub, CV)* |
| `Trail` | How did he get here? |
| `Next` | What is he going to do in my lab? |

A recruiter's path, CV, contact, experience, is reachable from a persistent
header without scrolling. A researcher's path, findings, limitations, code 
is the body of the page.

### The five experiments

Each is drawn from real, published or committed work. Each has: a question, an
interaction, a result with a number, and a documented failure.

| # | Topic | Question | Source |
|---|---|---|---|
| 01 | alignment | Right label, wrong reasoning. Does that count as aligned? | Beyond Labels / DFAR, ICPR 2024 |
| 02 | evaluation | Can a language model judge whether another one is aligned? | Independent LLM-as-judge study (CV) |
| 03 | faithfulness | Can a retrieval system admit it does not know? | LegalRAG, IJCNN 2025 |
| 04 | safety | Does alignment survive the change of language? | `banglaeval` (live, no results yet) |
| 05 | alignment transfer | Can alignment be moved into a model instead of trained in? | Skin cancer souping/distillation, Q1 journal |

The order is deliberate. Alignment is the thesis, so it opens; evaluation
follows because it is what any alignment claim rests on. Each exhibit carries a
topic badge so the spread of the work is legible at a glance rather than
inferred.

Experiment 04 carries the Bangla/English dimension. It is not a language toggle
bolted onto the chrome, the toggle only exists inside the exhibit where the
language *is* the variable under test, using the actual benchmark items from the
`banglaeval` repo.

### On 3D

There is none. Nothing in this work is spatial. A research constellation in
WebGL would have been a rotating object that communicates nothing, cost ~600 KB
of runtime, and delayed first paint. The provenance map does the same job in
hand-placed SVG at a few kilobytes, works with a keyboard, and prints. If a
future exhibit is genuinely about 3D structure, revisit; until then, this is a
deliberate omission, not an oversight.

---

## 4. Design system

### Colour: two accents, and they mean something

The ground is a cool mineral grey. There are exactly two accents and they are
**semantic, not decorative**:

- `--human` (magenta): everything measured by people. Annotators, human
  evaluation, majority vote, ground truth.
- `--machine` (cyan): everything measured by models. Judges, automatic scores,
  model output.

They are the subtractive process inks of a printed scientific plate, which is
the register the whole site is pitched in. They also stay distinguishable under
the common colour-vision deficiencies, unlike a red/green or red/orange pair.
Once you know the rule, the charts read without a legend and the site's argument,
that humans and machines disagree, is visible as a colour tension.

Deliberately avoided: warm cream and terracotta (the default "thoughtful
document" palette, now so common it reads as a template), neon purple/blue
gradients, and any third accent. Nothing else on the page is coloured.

```
light                          dark
--paper    #EEF1F3             #0E1316
--paper-2  #E4EAEE             #151C20
--ink      #101619             #E3EAEE
--ink-2    #46525C             #98A6AF
--ink-3    #5F6C76             #79878F
--rule     #CCD6DC             #242E34
--human    #A31D5B             #F27BA9
--machine  #0B6C82             #5CBCD4
```

Every foreground token clears WCAG AA against its ground in both themes; the
lowest is `--ink-3` at 4.75:1 light and 5.05:1 dark, and it is only used for
meta text. (Superseded by section 5: the site is now light only.)

### Type

| Role | Face | Why |
|---|---|---|
| Display | **Fraunces** | Variable serif with an optical-size axis, so a heading at 4rem and a heading at 1.2rem are genuinely different drawings rather than one cut scaled. Distinctive without being a novelty face, and its italic carries every research *question*. |
| Text/UI | **Atkinson Hyperlegible Next** | Engineered by the Braille Institute for character recognition at low acuity. `I`, `l` and `1` are drawn apart; `O` and `0` are drawn apart; `rn` cannot be misread as `m`. On a page carrying model names, run IDs, ρ values and parameter counts, that is a correctness feature, not a style. |
| Data | **JetBrains Mono** | Clearest numerals of the mono faces, true tabular figures. Every figure, label, ID and axis. |
| Bangla | **Noto Sans Bengali** | Loaded by unicode-range, so it only downloads for visitors who reach Experiment 04. |

Rule, unchanged: **serif italic = a question, mono = a measurement, sans =
everything else.** Applied consistently, this tells you what kind of sentence
you are reading before you read it.

Fraunces sets wider per character than the serif it replaced, so every display
size carries more negative tracking; Atkinson runs a large x-height, so the body
size is set slightly smaller than it would be for a normal humanist sans and
still reads a size larger.

### Space, rule, shadow

An 8px base scale. Borders are 1px hairlines in `--rule`; there are **no box
shadows and no rounded-corner cards floating in space**. Structure comes from
rules and whitespace, like a printed journal. The only radius in the system is
2–4px on controls.

### Motion, four levels, and a budget

1. **Micro** (≤150ms): hover, focus, press. Always on.
2. **Reveal** (≤400ms): a section's first appearance, once, opacity+2px. Never
   re-triggers on scroll-up.
3. **Explanatory**: an exhibit animating *because the data changed*, a bar
   moving to a new value, a token flowing down a pipeline. This is the only
   place where motion is allowed to be the point.
4. **Ambient**: none. There is no idle animation anywhere on this site.

`prefers-reduced-motion: reduce` collapses 2 and 3 to instant state changes.
Every exhibit remains fully usable and fully legible with motion off, the
animation is never the carrier of the information.

### Interaction language

- Anything you can operate has a hairline border and a mono label.
- Anything that reveals more is a `<button>` or a `<details>`, never a div.
- Hover is enhancement only. Every hover state has a click/tap equivalent, and
  every exhibit is operable by keyboard in tab order.
- The one recurring control is **`break it`**, a bordered mono button in
  `--human` that puts an exhibit into its documented failure state. Same
  affordance every time it appears, so it is learned once.

### Performance budget

Static HTML/CSS/JS, no framework, no build step, deployed as-is to GitHub Pages.

- No runtime dependency of any kind. No React, no D3, no Three.js, no icon font.
- Icons are inline SVG.
- Exhibits initialise lazily via `IntersectionObserver`; nothing above the fold
  waits on anything below it.
- Portrait served as WebP at 2 sizes with `width`/`height` set to reserve layout.
- Live GitHub data is fetched once, cached in `sessionStorage`, and degrades to
  hand-written static markup already present in the HTML if the API is
  unavailable or rate-limited. The page is complete and correct with JavaScript
  disabled entirely.

### Accessibility

Semantic landmarks, one `h1`, ordered headings, skip link, visible focus rings
that survive both themes, `aria-live` on readouts that change, `aria-pressed` on
toggles, colour never the sole carrier of meaning (every human/machine pair is
also labelled), and a full print stylesheet.

### Easter eggs, five, none of them load-bearing

1. `j`, **judge mode.** Each section gets a randomly generated score in the
   margin. The tooltip explains that the scores are meaningless and that this is
   precisely the point.
2. The footer status readout: *model confidence: suspiciously high* → hover:
   *that is exactly why we evaluate it.*
3. An `abstain` control in Experiment 02 that makes the site itself decline to
   answer rather than guess.
4. A line of Bangla in the colophon that is not translated.
5. A console message for anyone who opens DevTools.

None of these hide information. Turn all five off and nothing is lost.

---

## 5. The comic edition (September 2026)

The "process plate" was always printed in magenta and cyan, the subtractive
inks. Pop art is what happens when you print those same inks at full strength,
so the site moved from a scientific plate to a comic plate. The argument, the
information architecture and the three rules are the same. Only the drawing
changed.

**What the style is:** ligne claire and neo-pop. That means flat fills, one
consistent weight of black outline around everything (3px on panels, 2px on
controls), hard offset shadows with no blur, a faint halftone dot ground,
caption boxes and speech bubbles.

**Rules that changed on purpose:**

- *"No box shadows"* is replaced by *"only hard shadows"*. A zero-blur offset of
  `--shade` is part of the comic line. A soft drop shadow is still banned.
- The ground is **neutral**: white panels on a cool light grey. No cream, no
  beige, no yellow anywhere. A warm "paper" tint was tried and rejected as
  looking like every other AI-generated page.
- Magenta and cyan keep their meaning (human / machine). Narration (captions,
  section numbers, the selected tab) is solid black ink with white lettering,
  so it never competes with the two data colours.
- Each ink has a dark cut for text (`--human`, `--machine`, both AA on the
  ground) and a bright cut for fills (`--human-pop`, `--machine-pop`).

**Light only.** There is no dark theme. One carefully drawn edition beats two
that are each half-checked, and the comic line reads best as black ink on white.

**Type, remapped:**

| Role | Face | Rule |
|---|---|---|
| Headline | Archivo Black | poster lettering |
| Voice | Comic Neue 700 | **a question is spoken, so it goes in a speech bubble** (replaces serif italic) |
| Text | Atkinson Hyperlegible Next | unchanged, because legibility is not a style choice |
| Data | JetBrains Mono | unchanged: mono = a measurement |
| SFX | Bangers | the `break it` control only |

**Illustrations** are inline SVG drawn in the same line (the six icons in the
lab kit), a few hundred bytes each.

**Print** switches all of it off: no dots, no shadows, no rotation.

### Content added at the same time

- **The lab kit** (Section 03): skills from the CV, grouped by the step of an
  experiment they serve, and each group links to where it was used on the page
  (rule 2, applied to skills).
