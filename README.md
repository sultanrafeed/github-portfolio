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
assets/css/site.css           design system + components
assets/js/site.js             exhibit behaviour, no dependencies
assets/img/rafeed-*.webp      portrait, 2 sizes, WebP + JPEG fallback
rafeed_sultan_Researcher_CV.pdf
DESIGN.md                     design record and reasoning
legacy/                       the previous version of the site, kept for reference
```

Six sections: **the bench** (who and what) · **experiments** (five interactive
exhibits) · **systems** (production engineering) · **evidence** (papers,
provenance map, live GitHub, CV) · **trail** (timeline) · **next** (research
directions).

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
