# sultanrafeed.github.io/github-portfolio

Personal site for **Rafeed Mohammad Sultan**: LLM alignment, multilingual
evaluation, and agentic retrieval.

**[Live site →](https://sultanrafeed.github.io/github-portfolio/)**

---

## The idea

The site is built around one claim, which is the first sentence of the research
interests in the CV:

> A model can look aligned without being aligned. A judge can look reliable
> without being reliable. The work is telling the difference.

That is not a tagline invented for a website. It is the reason `Misalignment Rate`
exists (right label, wrong reasoning, 52.0% of the time before reason supervision),
the finding of the cross-model judge study (ρ from −0.71 to −0.09 on one task),
the design principle of [`banglaeval`](https://github.com/sultanrafeed/banglaeval),
and the reason that repo ships a `LIMITATIONS.md`.

Three rules follow, and the whole site obeys them:

1. **Every exhibit works before it breaks.** Show the system doing its job, then
   hand the visitor the lever. Experiment 03 has a literal *"break it, remove the
   relevance check"* button that puts LegalRAG into its documented failure mode.
2. **Every number is traceable.** There is a ledger in the Evidence section
   listing every figure on the page against its paper, repository or CV line.
   No decorative statistics, no count-up animations.
3. **Absence is reportable.** BanglaEval's leaderboard is empty, so the site
   prints the empty JSON. The distilled student in Experiment 05 has no published
   standalone accuracy, so no accuracy is shown for it.

The full brainstorm (six concepts, what was cut and why) and the design system
are in **[DESIGN.md](DESIGN.md)**.

---

## Structure

```
index.html                    the whole page, semantic, no templating
404.html                      an error page that abstains instead of guessing
robots.txt · sitemap.xml      crawl basics
assets/css/site.css           design system + components
assets/js/site.js             exhibit behaviour, no dependencies
assets/img/rafeed-*.webp      portrait, 2 sizes, WebP + JPEG fallback
rafeed_sultan_Researcher_CV.pdf
DESIGN.md                     design record and reasoning
FORMS.md                      how to wire the note form to a spreadsheet
legacy/                       the previous version of the site, kept for reference
```

Eight sections: **the bench** (who and what) · **experiments** (five interactive
exhibits) · **systems** (production engineering, plus the RSNA knee challenge) · **kit** (skills, by experiment step) · **evidence** (papers,
provenance map, live GitHub, CV) · **trail** (reverse-chronological, with linked
certifications) · **next** (research directions) · **score it** (the rubric,
turned on the page itself).

## Type

- **Fraunces** for display. A variable serif with an optical-size axis, so
  headings tighten as they grow rather than being one static cut stretched
  across the whole range.
- **Atkinson Hyperlegible Next** for everything else. Engineered by the Braille
  Institute to maximise character recognition at low acuity: the letterforms
  that normally collapse into one another (`I l 1`, `O 0`, `rn`/`m`) are
  deliberately disambiguated. On a page this dense with model names, IDs and
  figures, that is a functional choice before it is an aesthetic one.
- **JetBrains Mono** for data, kept for its numerals and true tabular figures.

## Collecting notes and visits

Two things land in one Google Sheet, via a single Apps Script endpoint. Setup is
about ten minutes and is written up in **[FORMS.md](FORMS.md)**; one constant in
`site.js` switches both on, and while it is empty neither collects anything.

- **`notes`**, when a visitor presses send. The **Score it** section carries a
  six-point rating (the same scale the judges used in Experiment 02, turned on
  the page itself) plus an optional message.
- **`visits`**, automatically. Coarse location, referrer, device, browser, time
  on page, scroll depth, which sections they stopped on, and whether they opened
  the CV.

The visit record collects as little as it can while still being useful:

- **No IP is stored or transmitted.** The browser resolves its own address to a
  city and discards the rest, so the sheet holds "Sydney, Australia" and nothing
  that points at a person.
- **No cookies.** The session id lives in `sessionStorage` and dies with the tab.
- **Do Not Track and Global Privacy Control are honoured** without being asked.
- **No third-party analytics or ad scripts**, and nothing joined to any other
  dataset.

There is no visible disclosure panel. The page therefore makes no claim about
analytics either way; the colophon says only "no third-party trackers and no
advertising", which remains true. If a third-party script, cookies or persistent
identifiers are ever added, that line needs revisiting.

## Stack

Static HTML, CSS and JavaScript. No framework, no build step, no bundler, no
package.json, no analytics, no cookies. It deploys by pushing to `main`.

That is a deliberate choice rather than a limitation: nothing on this page needs
a virtual DOM, and a portfolio that takes eight seconds to load is a bad
portfolio regardless of what it says.

- **No 3D.** Nothing in this work is spatial, so a WebGL constellation would have
  been a rotating object communicating nothing. The provenance map does the same
  job in hand-placed SVG at a few kilobytes, works with a keyboard, and prints.
- **Exhibits initialise lazily** on approach, with a scroll sweep and a timeout as
  independent fallbacks so no single mechanism failing can leave the page inert.
- **Works without JavaScript.** Every reveal ships visible in the HTML and is
  collapsed by script, or uses a native `<details>`. Turn JS off and no content
  is lost; only the animation and the live GitHub data go away.
- **Live GitHub data** is fetched once, cached in `sessionStorage`, and falls back
  to descriptions written into the page when the API rate-limits.
- Respects `prefers-reduced-motion` and `prefers-color-scheme`; both themes are
  designed rather than inverted.

## Content sourcing

Everything on the page comes from the researcher CV, the four peer-reviewed
papers, or public repositories. Nothing is invented: no fabricated metrics,
projects, dates or GitHub activity. Two projects present on the previous version
of the site were removed because no source could be found for them.

## Running locally

```bash
python -m http.server 8823
```

Then open <http://localhost:8823>. There is nothing to install or build.

> Asset links carry a `?v=` query string. Bump it when changing CSS or JS so
> GitHub Pages' cache serves the new file.

## Easter eggs

Five, none of them load-bearing. Press <kbd>j</kbd> for one of them. Turn them all
off and nothing is lost.

## Contact

[sultanrafeed@gmail.com](mailto:sultanrafeed@gmail.com) ·
[GitHub](https://github.com/sultanrafeed) ·
[LinkedIn](https://www.linkedin.com/in/rafeed-sultan/) ·
[ORCID 0009-0008-4291-1570](https://orcid.org/0009-0008-4291-1570)
