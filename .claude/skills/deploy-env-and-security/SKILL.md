---
name: deploy-env-and-security
description: Deployment workflow, complete environment-variable inventory, security-header policy, dependency override policy, and Aikido security-scanner history. Use when deploying, adding/renaming env vars, updating dependencies, responding to Aikido findings, or debugging production-only behavior.
---

# Deploy, Env Vars & Security

## Deploy workflow

- Hosting: Vercel, serverless. **Pushing to `main` = production deploy** to tjbmanagementinc.com. There is no staging environment.
- CLAUDE.md rule: work on the dev branch and merge to `main` after every set of changes (in recent practice, commits go straight to `main` — either way `main` must end up with the work, pushed).
- Verification: `npm run build` locally before pushing (no tests, no linter). For UI changes, confirm on the live site after deploy.
- Never deploy a speculative fix — confirm root cause or ask first (CLAUDE.md Critical Rule).

## Environment variables (complete inventory)

| Var | Used by | Notes |
|---|---|---|
| `ADMIN_SECRET` | middleware, all admin routes, oauth-state HMAC | The master secret. Rotating it invalidates admin sessions AND in-flight OAuth states |
| `ADMIN_USERNAME` | `/api/admin/login` | Optional — if unset, any username works |
| `CRON_SECRET` | `/api/cron/*` | Vercel injects it into cron request headers |
| `TIKTOK_BUSINESS_APP_ID` / `TIKTOK_BUSINESS_SECRET` | business-oauth.js | Business app 7654470451766231041 |
| `TIKTOK_BUSINESS_REDIRECT_URI` | advertiser flow | `.../auth/tiktok/business/callback` |
| `TIKTOK_ACCOUNT_REDIRECT_URI` | account flow | defaults to business URI with `/account-callback` swapped in |
| `tiktok_advertiser_authorization_url` (lowercase!) | `getBusinessAuthUrl` | Full portal URL; its `state` param is overwritten with a real signed state |
| `tiktok_account_authorization_url` (lowercase!) | `getTikTokAccountAuthUrl` | Currently a Login Kit URL — known limitation, see tiktok-tokens-and-oauth |
| `TIKTOK_ADVERTISER_TOKEN` | `getBusinessTokens()` | JSON token blob, checked FIRST — survives serverless cold starts. Export from admin panel |
| `TIKTOK_BUSINESS_ID` | reference | Numeric Business Center ID `7632045808657368084` |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` / `TIKTOK_REDIRECT_URI` | legacy Login Kit flow | dormant |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | lib/tokens.js, /api/agency | **Currently NOT configured** — everything falls back to in-memory + cookies |
| `SMTP_HOST/PORT/SECURE` + `ICLOUD_EMAIL_ADDRESS`/`ICLOUD_APP_PASSWORD` | email alerts (lib/email/alerts.js) | iCloud Mail only (not Gmail) — `smtp.mail.me.com` default, app-specific password required; unset = emails silently skipped |
| `ANTHROPIC_API_KEY` | `/api/dm` | Hallie DM assistant (claude-sonnet-4-6) |
| `CHROMIUM_PATH` | lib/tiktok/browser.js | Optional local override; Vercel uses @sparticuz/chromium |
| `SITE_URL` | lib/site-url.js | Canonical origin for redirects; defaults to tjbmanagementinc.com in prod |

The two lowercase env names are real and intentional (they're checked before their UPPERCASE variants). Don't "fix" the casing without updating Vercel.

## Security headers — single source of truth

Static headers (HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) live in `next.config.js`, plus `poweredByHeader: false`. **CSP is the exception: it is built per-request in `middleware.js`** (Next.js 16 deprecated this filename for `proxy.js` — see api-route-conventions skill for why that rename was tried and reverted same day) so `script-src` can carry a fresh nonce + `'strict-dynamic'` instead of `unsafe-inline`/`unsafe-eval` (both removed July 2026 for Aikido). This requires `export const dynamic = 'force-dynamic'` in `app/layout.js` — Next.js stamps the nonce onto its inline scripts only during dynamic rendering, so **do not remove that export or re-add a static CSP header** (a second CSP intersects and breaks all pages). **Never add headers to `vercel.json`** — duplicates there caused Aikido "Multiple X-Frame-Options/HSTS" findings. `vercel.json` contains crons only.

`img-src` is an enumerated TikTok-CDN allowlist (not a bare `https:` wildcard — Aikido flagged that), plus `upgrade-insecure-requests`. `style-src` is `'self'` — **`unsafe-inline` was dropped September 2026** (Aikido "CSP allows inline CSS", risk 20), and it turned out NOT to require converting every `style={{}}` prop first, correcting what this skill previously assumed. The reason: every route is wrapped in `DeviceGate` (`app/layout.js`), which renders only a loading spinner server-side and swaps in real content client-side once its own fingerprint check resolves — so no page's real content, inline styles included, is ever present in the raw server-rendered HTML the browser's HTML parser sees. `style-src` only restricts style set via parsed markup (a literal `style="…"` attribute already in the HTML, or a `<style>` element) — it does **not** restrict style already-permitted script applies at runtime via the DOM (React's `style` prop reconciles through `node.style`, the same CSSOM path a plain `el.style.color = 'red'` uses, and that is not blocked by `style-src` either — confirmed by direct experiment, contrary to an initial assumption made from memory of the spec text). Verified with zero `securitypolicyviolation` events across every major page (including both moderation panels) plus real interactions, with `unsafe-inline` fully removed. There's also no `dangerouslySetInnerHTML` anywhere in this codebase, so there's no code path for attacker-controlled markup to land an inline style in the first place — the finding Aikido describes (injected CSS via markup) isn't actually reachable here regardless. Converting `style={{}}` props to CSS classes (all `<style>` blocks were externalized to `page.css`/colocated `.css` files; some pages' `style={{}}` props are too, piecemeal) is still good hygiene/defense-in-depth in case a future route ever renders real content server-side, but is no longer a blocker for the CSP header itself — don't assume it is if this comes up again. **If ever reconsidering this**: the empirical test is cheap — temporarily set `style-src 'self'` (no `unsafe-inline`), rebuild, load pages in a real browser with a `securitypolicyviolation` listener attached, and check for violations directly, rather than reasoning from CSP spec text alone.

## Dependency policy

`package.json` has an `"overrides"` block forcing transitive deps to patched versions (next, nodemailer, zod, postcss, tar-fs) — added for Aikido SCA findings. When bumping deps: edit versions, run `npm install --package-lock-only`, verify the lock has no nested vulnerable copies (the chromium-bidi nested zod@3 was the original offender), commit both files. Tyler sometimes pushes dependency commits himself — `git pull --rebase` before pushing.

## Aikido scanner — institutional memory

- **JWT-manipulation findings on `/api/cron/*`: FALSE POSITIVES.** No JWT library exists here; cron auth is a string compare. Mark as accepted risk.
- CSP `unsafe-inline`/`unsafe-eval` findings: fixed July 2026 with the middleware nonce CSP (see above). Every page became server-rendered per request as a consequence — build output showing all routes as ƒ (Dynamic) is intentional.
- Open-redirect findings (client + server): fixed July 2026 via hardcoded `window.location.href` strings, `safeRedirect` allowlists, and `absoluteUrl()`. Don't regress.
- Cookie-flag findings: every `cookies.set`, including deletions, must carry httpOnly/secure/sameSite/path.
- X-Powered-By: suppressed via `poweredByHeader: false`.
- Aikido DAST scans the live site — findings can be stale until the next scan after a deploy. Check the finding's timestamp against the deploy time before investigating "regressions."
- **"CSP header not set" (risk 91) appeared right after the middleware→proxy rename.** Couldn't confirm causation from the sandbox (no live-prod-header access — the network policy 403s our own domain, same as tiktok.com). Reverted the rename immediately rather than risk a live CSP gap. If this finding ever recurs: first confirm the CSP header is actually present on prod (`curl -I` the live domain from somewhere with network access, or Tyler's browser Network tab) before assuming it's real — a stale scan or a Vercel build hiccup can both produce it. The `middleware.js` file is deliberately NOT renamed to `proxy.js` for this reason (the deprecation warning is harmless; a CSP gap is not).
- **@sparticuz/chromium bundling** (see moderation-pipeline skill): needs both `serverExternalPackages` and `outputFileTracingIncludes` in next.config.js, per route that imports `lib/tiktok/browser.js`. Not a scanner finding but a deploy-only failure — crashes with "input directory .../bin does not exist" that never shows in local build.

## Production-only debugging notes

- No Redis → each serverless instance has its own memory; state "disappearing" between requests is normal. Durable state = cookies + env vars only.
- `secure: true` cookies require HTTPS — OAuth flows won't set cookies over plain http in production mode locally.
- Middleware redirects unauthed `/admin` page hits to `/admin/login`; API hits get JSON 401s.
