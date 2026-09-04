# Polyphus — new UI

Polyphus's marketing page rebuilt on the visual system studied in
`../wishlabs-clone/`: a parallax sky, cream sections, deep-purple cards, and a
sticky panel the footer rides over.

Open `index.html` in a browser, or `python -m http.server 8000` in this folder.
No build step, no bundler, no npm, no CDN at runtime.

> This folder is a **UI**, not a copy. It takes the layout system and the
> abstract scenery. Every mark, icon, tag, console and line of copy is
> Polyphus's own. Nothing branded came across — see §6.

---

## 1. What changed from the reference system

Two Polyphus rules override the borrowed look wherever they meet it. Both live
in `css/tokens.css`.

**Orange means alive, running, or actionable.** Never emphasis, never
decoration. On this page it appears in exactly five places: the cursor in the
logotype, the `START` pill, the running pipeline stage, the running log line,
and the `Approve` button. That is the whole budget. "Built" tags are
deliberately *not* orange — being shipped is a fact, not a process.

**Monospace carries the chrome.** Every label, kicker, status, tag, button and
log row is JetBrains Mono, uppercase, widely tracked. Headlines and body stay
in DM Sans. Those two registers are how the eye separates chrome from content —
keep them apart. Log lines are lowercase with a `>` prefix and no full stop.

## 2. The page, top to bottom

| Section | File | Content |
|---|---|---|
| Hero | `sections/hero.css` | parallax sky, `polyphus_`, the crew strip |
| How it works | `sections/steps.css` | *Three steps. That's the whole thing.* + 4 bento tiles |
| Showcase | `sections/showcase.css` | cloud video + the hand-off console |
| The crew | `sections/crew.css` | four agent cards |
| Who it's for | `sections/audience.css` | solo founders / businesses |
| Meet our team | `sections/team.css` | three founder cards + prior-company marks |
| The river | `sections/gallery.css` | two auto-drifting photo rows, grey until hovered |
| Final CTA | `sections/cta.css` | *Start your company now.* (sticky) |
| Footer | `sections/footer.css` | *hire agents. run everything.* |
| Waitlist | `sections/signup.css` | `start.html` — coming soon + email capture |

## 3. The hero rig

Four cut-out plates, each 1440 × 2572. On scroll,
`translateY = scrollY × rate`:

| Plate | File | Rate |
|---|---|---|
| far | `sky-layer-1-far.png` | **+0.40** drifts down |
| peak | `sky-layer-2-peak.png` | **+0.20** |
| mid | `sky-layer-3-mid.png` | **0.00** locked to the page |
| near | `sky-layer-4-near.png` | **−0.10** climbs |

**Paint order is the trick.** Sky → glow → logotype → plates → foreground copy.
The plates are transparent PNGs, so the mountain occludes `polyphus_` and the
logotype reads as buried in the landscape. Put the sky plate back inside
`.hero__stage` and it covers the logotype entirely.

The logotype is **live text**, not an image — change the word, change the page.

## 4. The waitlist page, and wiring this to the application

`start.html` is where every Start button goes: a one-screen "coming soon" page
that takes an email. It reuses the same tokens, fonts and components, and adds
`css/sections/signup.css` + `js/modules/signup.js`.

> **Before this goes live, connect Supabase.** Three steps:
>
> 1. Run `supabase/waitlist.sql` in the Supabase SQL editor. It creates the
>    table, turns on row level security, and validates addresses server-side.
> 2. Project Settings → API: copy the **Project URL** and the **`anon` public**
>    key.
> 3. Put both on the form in `start.html`:
>
> ```html
> <form class="signup__form" data-signup
>       data-supabase-url="https://xxxxx.supabase.co"
>       data-supabase-key="eyJhbGciOi...">
> ```
>
> The anon key ships in the page and anyone can read it — that is how Supabase
> is meant to work. It is safe **only** because the SQL grants `anon` INSERT
> and nothing else, so the key cannot read, edit or delete your list. If you
> ever turn RLS off on that table, that public key becomes a way for anyone to
> download every address you have collected.
>
> **Until both attributes are filled in, addresses go into the visitor's own
> `localStorage` and reach you nowhere.** The confirmation still shows, so the
> only signal is a console warning. Do not ship it that way.

### What the form does

- **Every provider is accepted.** No allow-list, no Gmail special case —
  Outlook, Proton, iCloud, company domains, `.edu`, `.io`, `+` addressing and
  non-ASCII domains all pass. The check only rejects genuinely malformed input.
- **Addresses are normalised** (trimmed, lower-cased) before they are sent, and
  the table has a `unique` constraint, so one person is one row however they
  type it. A repeat signup trips that constraint, Supabase returns **409**, and
  the form treats it as "already on the list".
- **`anon` has INSERT and nothing else — not even SELECT.** Note that Supabase
  does *not* give you this for free: its default privileges grant `anon` and
  `authenticated` full rights on new tables in `public`, so a fresh table is
  guarded by RLS alone. The `revoke all` in the SQL file is what actually
  removes them — verified against a live project, where a `select` with the
  public key returns **401**, not an empty list. That is deliberate,
  and it is why duplicates are handled with a 409 rather than the more obvious
  `INSERT ... ON CONFLICT DO NOTHING`: `ON CONFLICT` requires SELECT privilege
  on the table, so using it would mean granting `anon` the right to read the
  list and relying on RLS alone to filter it back out. One careless SELECT
  policy later and the whole list is public. This way there is nothing to leak.
- **A failed send is not lost.** It is queued in `localStorage` and retried the
  next time that person opens the page.
- **A honeypot field** catches bots that fill every input. They get the same
  confirmation and nothing is sent — telling them they failed only teaches them
  to pass.
- **The browser check is a courtesy.** Anyone can bypass it from a console; the
  `WITH CHECK` clause in the SQL is what actually holds.

To export when you launch: Dashboard → Table Editor → `waitlist` → Export CSV,
or `select email, created_at from public.waitlist order by created_at;`

When the product itself is live, `start.html` becomes
`https://app.polyphus.com` — it appears **9 times** in `index.html`, one
find-and-replace, nothing else.

Everything else is static and deploys on its own: Cloudflare Pages, Netlify,
Vercel (preset "Other") or GitHub Pages, output directory `polyphus-ui`, no
build command. **Do not deploy the Java service to make this work.**

Reusable pieces, if you are building app screens on this system:
`.btn`, `.card`, `.console` + `.log`, `.status`, `.tag`, `.feature`, `.reveal`.
They are all in `css/components.css` and none of them depend on a section.

## 5. Claim rules — read before a pitch

The page states only what is true today.

- **No counter.** There is no "running N companies" number anywhere. A counted
  figure on a page that also sells is the single riskiest thing you can ship.
- **The console says what it is.** The caption under it reads *"an illustration
  of the hand-off — not a live feed"*. Keep it.
- **Four roles, not six.** Research, Design, Engineering and Marketing are
  tagged `Built`. Growth and Support are tagged `In build`, appear greyed in
  the hero strip with `· soon`, and there is a line under the crew grid saying
  so. Do not quietly promote them.
- If asked "is that real?", the honest answer is: the interface is real, the
  engine behind it is partly built, and the demo flow is a simulation.

## 6. Assets

`assets/` holds only abstract scenery, all renamed for what it is — no
content-hash filenames.

| File | Origin |
|---|---|
| `sky-layer-1-far.png` … `sky-layer-4-near.png` | scenery, carried over |
| `clouds-loop.mp4` | scenery, carried over |
| `cloud-city.png`, `valley-river.jpg`, `cloud-factory.png`, `footer-horizon.png` | scenery, carried over |
| `crew-research.jpg`, `crew-design.jpg`, `crew-engineering.jpg`, `crew-marketing.jpg` | 680 × 920 crops cut from the scenery above |
| `icons/*.svg` | **drawn for Polyphus** — mark, arrows, chevrons, nine line icons, favicon |
| `team/*` | founder portraits and prior-company marks, supplied by the team |
| `bottom/*.jpeg` | the river photographs — **placeholder**, not Polyphus's own |
| `fonts/` | DM Sans, Inter, Satoshi, Lato, JetBrains Mono — all self-hosted |

No product screenshots, brand marks, staff photographs or third-party logotypes
were carried across. The scenery is placeholder art: commission or licence
replacements before this page goes public.

> **Swapping the video.** `clouds-loop.mp4` must be **H.264 (`avc1`), 8-bit
> `yuv420p`**. Chrome on Windows cannot decode HEVC/H.265 (`hvc1`) in a
> `<video>` element, and it fails silently in the worst way: the element
> reports `playing`, the clock advances, and it decodes **zero frames**, so
> the section renders empty with no console error and no failed request.
> Most phone and camera exports are HEVC by default. Convert before dropping
> one in:
>
> ```
> ffmpeg -i new-clip.mov -map 0:v:0 -an -sn -dn >   -c:v libx264 -profile:v high -preset slow -crf 22 >   -pix_fmt yuv420p -movflags +faststart clouds-loop.mp4
> ```
>
> To check what you have: `ffprobe -show_entries stream=codec_name,pix_fmt`.
> Chrome's own tell is `video.getVideoPlaybackQuality().totalVideoFrames` —
> if it stays at 0 while the video "plays", the codec is the problem.

## 7. Working here

- **Edit in place.** No build. Change a token in `css/tokens.css` and the whole
  page follows.
- **Test with `prefers-reduced-motion: reduce`.** Parallax and reveals both
  honour it; keep it that way.
- **Check a phone.** Below 810px the hero recomposes as a taller stack, the
  bento goes single-column, the pipeline turns into a 2 × 2 grid, the sticky
  CTA is released, and the nav drops to the mark plus `START`.
- **Never reach into the application.** This folder has its own deploy and its
  own lifecycle. If it needs data from the product, it gets a link.
