---
name: frontend-conventions
description: UI conventions for this repo — the shared dark-purple theme, inline-style objects, panel/card patterns, client-component structure, and marketing-page rules (including the untouchable TikTok apply link). Use when building or editing any page or panel UI.
---

# Frontend Conventions

## Stack reality

No CSS framework, no component library, no TypeScript. Pages are single-file `'use client'` components with **inline style objects**, plus one global stylesheet (`app/globals.css`). Match this — do not introduce Tailwind, CSS modules, or shared component files without being asked.

## The theme (used by both control panels and most pages)

```js
const s = {
  page:  { minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '32px 20px', ... },
  card:  { background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #334155' },
  h2:    { fontSize: 16, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  input: { background: '#0f172a', border: '1px solid #475569', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0' },
  btn:   { background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600 },
};
```

Palette: purple accent `#a855f7` / heading glow `#d4a5ff`, slate surfaces (`#0f172a` / `#1e293b` / `#334155`), muted text `#64748b`/`#94a3b8`, success `#10b981`, warning `#f59e0b`, danger `#ef4444`. Status badges: `background: color + '22'` with 1px border of the color. Action colors: hide=red, flag=amber, review=blue, allow=green.

Background: a fixed `body::before` layer with `bg-main.jpeg` under a dark tint. **Now lives in a sibling `page.css` imported at the top of each page component** — NOT an inline `<style>` tag anymore (all 17 were extracted to real CSS files July 2026 so `style-src 'unsafe-inline'` could eventually be dropped for an Aikido finding; the `<style>{`…`}</style>` blocks were pure static CSS, moved verbatim, served as external `<link>` which `style-src 'self'` allows with no nonce). Copy the existing `page.css` block when a new page needs the background. Inline `style={{…}}` props on marketing pages are being migrated to classes for the same reason — prefer a class in `page.css` over a new inline style attribute.

### The mobile background — flat canvas + a watermark that CANNOT mismatch the strips

This took ~7 commits and a lot of Tyler's patience. The final, working design (do not re-litigate it):

```css
/* every page.css */
html { background-color: #0f172a; }   /* the ONE color, fills every strip */
body { background: transparent; }

/* logo-on-black pages (bg-main.jpeg, 13 pages): */
body::before {
  content: ""; position: fixed; inset: 0;
  background: url("/bg-main.jpeg") center center / cover no-repeat;
  mix-blend-mode: lighten;   /* black field → blends INTO the navy → invisible */
  opacity: 0.2;              /* faint watermark; per-page ~0.12–0.35 */
  z-index: -1; pointer-events: none;
}

/* photo pages (bg-tyler.png, 4 pages: tyler/agency/contact-tyler/links): */
body::before {
  content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100lvh;
  background-image:
    linear-gradient(to bottom, #0f172a 0%, #0f172a 8%,
      rgba(15,23,42,<X>) 20%, rgba(15,23,42,<X>) 80%, #0f172a 92%, #0f172a 100%),
    url("/bg-tyler.png");
  background: … center / cover no-repeat; z-index: -3; pointer-events: none;
}
```
And `globals.css` `html, body` uses **`background-color`** (longhand), never the `background` shorthand — the shorthand would reset `background-image` and its color would fight the page's.

**The two hard-won facts behind this:**
- **iOS 26 Safari refuses to paint `position: fixed`/`sticky` content behind its floating bottom toolbar** — it clips it (Apple dev forum thread 800798). So a fixed background layer leaves a flat gap under the toolbar. NO size/unit fixes this — three commits were wasted on `vh`→`dvh`→oversized `lvh`, a fallback color, and `theme-color`, all treating a render-path bug as geometry. `dvh` is separately bad (resizes with the toolbar → seam "zooms in and out"), but even perfect sizing can't save a fixed element here.
- **The winning idea: make the seam impossible instead of chasing coverage.** Put ONE flat `#0f172a` on the html canvas (paints every strip — status bar, under-toolbar, overscroll — uniformly). Then the watermark is layered so its *field* equals that same navy: for the logo-on-black image, `mix-blend-mode: lighten` makes the pure-black field blend invisibly into the navy (only the logo, brighter than navy, shows); for the photo, a vertical gradient fades the tint to solid `#0f172a` at the top/bottom edges. Either way the watermark contributes only its center imagery — the strips are always plain navy, so painted-or-not under the toolbar is irrelevant. The iOS bug stops mattering.
- **Rejected detour:** putting the full tinted image on the html canvas (canvas propagation does paint under the toolbar) — but `cover` on the root sizes to the *document*, which zoomed the watermark huge on long pages ("way too zoomed in"). The blend/fade approach keeps a normal viewport-sized watermark AND no seam.
- **You cannot verify this in headless Chromium** — it renders no Safari chrome/toolbar. Confirm layout locally (build + screenshot: field should be uniform navy, only the centered logo/photo visible), then get final sign-off from a real iOS device. Say so; don't call it fixed from the sandbox.

## Panel pattern (control panels)

Each feature is a `function XxxPanel({ adminKey, enabled })` (admin) or `function XxxPanel()` (system) rendering one `s.card`: `<h2 style={s.h2}>` title, muted description `<p>`, controls, then result/error area. Conventions:
- Loading: disable button, swap label ("Syncing…"), `opacity: 0.6`
- Errors inline in amber `#f59e0b`; success in green `#10b981`
- `enabled === false` → render the "Connect X first" muted message instead of controls
- Fetch → `setResult(await res.json())`, check `data.error` and TikTok's `data.code !== 0`
- Long lists: `maxHeight` + `overflowY: 'auto'` inside the card
- Tab toggles: local `tabStyle(active)` inline helper

Both panels' `s` objects are near-identical on purpose — port JSX between them with only auth/endpoint edits (see mirrored-admin-system skill).

## Admin key plumbing (admin page only)

`adminKey` comes from localStorage (`admin_key`) or `/api/admin/me`, lives in top-level state, passed as a prop to every panel, sent as `x-admin-key` on every fetch. **Never put the key in a URL** (`?key=` in `window.location.href` was an Aikido open-redirect/leak finding — fixed; OAuth buttons use bare hardcoded paths because those routes also accept the `admin_session` cookie).

## Marketing pages

- Live at `app/<name>/page.js` with a sibling `layout.js` exporting per-page `metadata` (title/description/openGraph)
- **THE APPLY LINK `https://www.tiktok.com/t/ZTkgQvTCb/` IS IMMUTABLE.** It appears on agency-related pages. Never change, "fix", or url-encode it.
- Legal pages under `app/legal/` are long-form JSX documents; edit surgically, don't reflow
- Root metadata/site title in `app/layout.js`

## Client/server split

Pages that fetch are fully client-side (`'use client'`, fetch-in-useEffect) against the API routes — there are no server components with data fetching, no server actions. Keep new interactive UI in the same style: client component + API route.
