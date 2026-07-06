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

Background: a fixed `body::before` layer with `bg-main.jpeg` under a dark gradient — injected via a `<style>` tag inside the page component. Copy the existing block when a new page needs it.

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
