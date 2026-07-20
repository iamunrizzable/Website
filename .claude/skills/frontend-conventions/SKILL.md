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

### The mobile background — get this exactly right, it bit us three times in one day

The fixed background layer must be sized with **`lvh` (large-viewport), oversized past every edge**, never `dvh` or `vh`:
```css
body::before { position: fixed; top: -10lvh; left: 0; width: 100vw; height: 120lvh; … }
```
Why, learned the hard way:
- **`dvh` is the trap.** The dynamic viewport unit live-resizes as iOS Safari's toolbar collapses/expands during scroll. A background sized `100dvh` has a bottom edge that *travels with the toolbar*, exposing whatever's underneath — a visible seam that "zooms in and out when you scroll" (Tyler's exact words, and the clue that finally cracked it). Use `lvh` (static, largest-possible viewport, never resizes) and oversize it (`-10lvh` top, `120lvh` tall) so the edge sits outside anything Safari ever reveals, including overscroll bounce.
- **A flat fallback color can never match a photo background.** When the background is `bg-main.jpeg` + tint, any solid `background-color` under it (on `html`/`body`) will show a hard edge wherever the image layer ends. Two commits were burned "matching" the fallback to `#16213e` then `#0f172a` — both still seamed, because the real background is a *photo*, not a color. The fix is to make the image layer never end on-screen, not to color-match beneath it.
- **The top/bottom bands are Safari's browser chrome, not page pixels.** Status-bar area (top) and toolbar area (bottom) are painted by Safari. Declare `export const viewport = { themeColor: '#0f172a' }` in `app/layout.js` so Safari doesn't sample-and-guess a wrong tint — but know its limit: Safari's toolbar is *translucent* and blurs whatever's behind it, so theme-color alone won't fix a seam if what's behind the toolbar is the wrong thing. All three layers (oversized lvh image, flat html fallback, theme-color) work together; the lvh sizing is the load-bearing one.
- **You cannot see any of this in headless Chromium** — it doesn't render Safari's chrome or toolbar-collapse behavior. Verify the CSS is correct locally (built output, screenshot for gross layout), then get final confirmation from a real iOS device. Say so explicitly rather than claiming it's fixed.

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
