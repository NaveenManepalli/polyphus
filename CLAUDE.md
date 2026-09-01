# Polyphus — landing page

This folder is the **public marketing site**. It is a self-contained static site
with no build step, no framework, no backend, and no dependency beyond Google
Fonts. It deploys on its own and stays deployed on its own.

> **The one rule for this folder: never reach into the application.** The Java
> service, the React console and this site have separate lifecycles and separate
> deploys. If something here needs data from the product, it gets a link, not an
> integration.

---

## 1. What Polyphus is

A founder describes a company in one sentence. A crew of agents researches the
market, designs a brand, builds the product, puts it online, and then keeps
running it — marketing, growth, support — day and night, stopping at a human for
the decisions that matter.

Two audiences, both named on the page: **solo founders** who have the idea but
not the time, and **businesses** with a backlog they cannot hire fast enough to
clear.

## 2. Names

| Where | Name |
|---|---|
| Public — this site, the product, anything a customer sees | **Polyphus** |
| Internal — specs, planning, conversation | **Agent OS** |
| Code — Java modules, repo paths | `florasant-*` |

Never put "Florasant" or "Agent OS" on this site. Casing: **`polyphus_`**
lowercase in the wordmark and in machine contexts (hostnames, the shell prompt);
**UPPERCASE** in labels, buttons and kickers; **Polyphus** title case in prose.

## 3. The files

| File | What it is | Lines |
|---|---|---|
| `index.html` | The landing page — hero, how it works, who it's for, role grid, CTA, footer | 152 |
| `start.html` | The product demo — intro, workspace, 4-agent build, mock site, marketing report, fake execute. `noindex`. | 92 |
| `styles.css` | Everything. Both pages share it. | 908 |
| `app.js` | Landing page — ASCII logo, ticker, scroll progress, counters, reveals, the pipeline scene | 360 |
| `workspace.js` | The demo simulation. **Everything in it is fake and it says so at the top.** | 595 |

`start.html` is the original prototype the requirement video was recorded from.
It is the source of truth for the demo flow.

## 4. Design tokens

Defined in `styles.css` `:root`. **Use the variables, never the literals.**

```css
--bg:         #0a0a09    /* page */
--bg-2:       #100f0d    /* raised panels */
--panel:      rgba(20, 19, 16, 0.72)
--ink:        #e9e5d8    /* primary text — cream, never white */
--ink-dim:    #8b8578    /* secondary */
--ink-faint:  #4a463d    /* see the warning below */
--line:       rgba(233, 229, 216, 0.12)
--line-soft:  rgba(233, 229, 216, 0.06)
--orange:     #f5431f    /* the accent */
--orange-soft: rgba(245, 67, 31, 0.16)
--mono:       'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace
--top-h:      82px
```

Three rules that hold the look together:

1. **Monospace everywhere.** Not a style choice — the ASCII logo, the pipeline
   diagram, the file trees and the budget splits align because every glyph is one
   cell wide. A proportional face breaks the layouts, not just the mood.
2. **The orange means alive, running, or actionable.** Never emphasis, never
   decoration. If everything is orange, nothing is running.
3. **Cream, not white.** `#e9e5d8`. Pure white on near-black is glare.

### Contrast — measured, not guessed

| Pair | Ratio | |
|---|---|---|
| `--ink` on `--bg` | **15.72:1** | passes |
| `--ink-dim` on `--bg` | **5.40:1** | passes |
| `--orange` on `--bg` | **5.38:1** | passes |
| `--bg` on `--orange` (button text) | **5.38:1** | passes |
| **`--ink-faint` on `--bg`** | **2.11:1** | **fails AA — needs 4.5:1** |

`--ink-faint` is used **17 times**. On a laptop in a bright room it is close to
invisible. If a VC cannot read it, it is not subtle, it is missing.

**Fix when touching those rules:** raise `--ink-faint` to around `#6f6a5e`
(~3.6:1) for decorative text, or to `--ink-dim` for anything a person must read.
Do not use it for body copy, form labels or placeholders at all.

## 5. Copy — do not drift

These strings are the product's voice and were signed off in the requirement
video. Change them deliberately, not incidentally.

| Where | Exact text |
|---|---|
| Hero | **It's your time to hire super-intelligence** |
| How it works | **Three steps. That's the whole thing.** |
| 01 | Tell it what you want — *Describe your company in a sentence — like texting a friend who happens to run a hundred businesses.* |
| 02 | It gets to work — *Agents research the market, design it, build it, and put it online. You watch it happen, live.* |
| 03 | You stay in charge — *Approve the big calls. Change your mind anytime. The agents handle the rest — day and night.* |
| Who it's for | **Made for two kinds of people.** |
| Solo founders | You have the idea. Not the time. |
| Businesses | You have a backlog a mile long. |
| Final CTA | **Start your company now.** / It takes one sentence. |
| Fine print | free to start // no credit card // cancel anytime |
| Footer | hire agents. run everything. |

**Register:** headlines and body in sentence case; every label, button, kicker
and status in UPPERCASE with wide tracking; log lines lowercase with a `>` prefix
and no full stop. Those two registers are how the eye separates chrome from
content — keep them apart.

## 6. Claim rules — read before a pitch

The page currently makes several claims that are **not true yet**. That is fine
in a prototype and dangerous in front of an investor, because every one of them
is a statement of fact a diligence process can check.

| On the page | Reality | What to do |
|---|---|---|
| `polyphus is running 10,322 companies right now` — a live, incrementing counter | Fabricated | **Remove it, or make it real.** A counted number on a page that also sells is the single riskiest thing here. |
| `live view // agents handing work down the line on a real customer build` | The scene is scripted | Drop the words **live** and **real customer**. "How work moves down the line" makes the same point and is true. |
| Six role tiles: RESEARCH, DESIGN, ENGINEERING, MARKETING, **GROWTH**, **SUPPORT** | The pipeline has four. Growth and Support are **not built** — P5 "The Crew" is 0/30. | Either mark the unbuilt ones as coming, or show four. |
| `> scanning 2,400 competitors`, `deploying to prod`, `conversion +12%` | Scripted | Fine as illustration; never present as a customer's numbers. |
| `start.html` — the build finishes and the site goes "live" | Nothing is built or deployed. There is no site-generation or hosting capability in the codebase at all. | The in-page disclaimer must stay. **Say "this is a simulation" out loud in the demo.** |

If a VC asks "is that real?", the honest answer is: *the interface is real, the
engine behind it is 40% built, and this specific flow is a simulation.* Saying
that costs far less than being caught not saying it.

## 7. Deploying

Static folder, no build. Any of these work and all have free tiers with HTTPS:

- **Cloudflare Pages** or **Netlify** — drag the folder in, or point it at this
  repo with output directory `docs/polyphus` and no build command.
- **Vercel** — same, framework preset "Other".
- **GitHub Pages** — serve from the folder directly.

**Do not deploy the application to make this work.** The Java service needs
Postgres, Redis, five containers and an Anthropic key that has not been issued
yet. None of it is required for this site.

**Keep them separate permanently** — this is the normal split, not a shortcut:

```
polyphus.com          this folder, static, deploys in seconds
app.polyphus.com      the product, deploys on its own schedule
```

When the product is ready, the only change here is the `Start` link: `start.html`
becomes `https://app.polyphus.com`. One line, in three places in `index.html`.

## 8. Where the full specification lives

`../agent-os-docs/agent-os-docs/` — 64 documents derived from the requirement
video, including 17 stills at 1920×1080.

| For | Read |
|---|---|
| Every string and screen, transcribed shot by shot | `source-material/VIDEO-WALKTHROUGH.md` |
| Art direction, grid, archetypes | `phase-4-user-interface/4.1-ui-specification.md` |
| The full token set and its derivation | `phase-4-user-interface/4.2-design-system.md` |
| Voice, copy registers, claim rules | `phase-4-user-interface/4.3-style-guide.md` |
| The 19 components | `phase-4-user-interface/4.4-component-library/` |
| Contrast audit and the fixes | `phase-4-user-interface/4.6-accessibility-specification.md` |
| What is exact vs measured vs estimated | `phase-4-user-interface/4.8-replication-spec.md` |
| The landing page itself | `phase-0-home-page/0.2-screen-home.md` |

## 9. Working here

- **Edit in place.** No build, no bundler, no npm. Open `index.html` in a
  browser, or `python -m http.server 8000` in this folder.
- **Both pages share `styles.css`.** A change to a token or a shared class hits
  `start.html` too — check both.
- **Test with `prefers-reduced-motion: reduce`.** There is a lot of motion here:
  ticker, ASCII field, scanlines, counters, reveals, the scene. `workspace.js`
  already honours it; keep it that way.
- **Check the page on a phone.** The role grid and the pipeline scene are the two
  things most likely to break — the scene needs to rotate to vertical below
  roughly 768px, because four horizontal stage boxes at 375px are illegible.
