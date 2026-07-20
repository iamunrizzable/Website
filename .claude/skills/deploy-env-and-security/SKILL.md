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
| `SMTP_HOST/PORT/SECURE/USER/PASS/FROM` | email alerts, agency form | Gmail defaults; unset = emails silently skipped |
| `ANTHROPIC_API_KEY` | `/api/dm` | Hallie DM assistant (claude-sonnet-4-6) |
| `CHROMIUM_PATH` | lib/tiktok/browser.js | Optional local override; Vercel uses @sparticuz/chromium |
| `SITE_URL` | lib/site-url.js | Canonical origin for redirects; defaults to tjbmanagementinc.com in prod |

The two lowercase env names are real and intentional (they're checked before their UPPERCASE variants). Don't "fix" the casing without updating Vercel.

## Security headers — single source of truth

Static headers (HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) live in `next.config.js`, plus `poweredByHeader: false`. **CSP is the exception: it is built per-request in `middleware.js`** (Next.js 16 deprecated this filename for `proxy.js` — see api-route-conventions skill for why that rename was tried and reverted same day) so `script-src` can carry a fresh nonce + `'strict-dynamic'` instead of `unsafe-inline`/`unsafe-eval` (both removed July 2026 for Aikido). This requires `export const dynamic = 'force-dynamic'` in `app/layout.js` — Next.js stamps the nonce onto its inline scripts only during dynamic rendering, so **do not remove that export or re-add a static CSP header** (a second CSP intersects and breaks all pages). **Never add headers to `vercel.json`** — duplicates there caused Aikido "Multiple X-Frame-Options/HSTS" findings. `vercel.json` contains crons only.

`img-src` is an enumerated TikTok-CDN allowlist (not a bare `https:` wildcard — Aikido flagged that), plus `upgrade-insecure-requests`. `style-src` still has `unsafe-inline` — removal is in progress (Aikido "CSP allows inline CSS", risk 20): all 17 `<style>` blocks were externalized to `page.css` files (July 2026), and inline `style={{}}` props are being converted to CSS classes file-by-file (the two big control panels, ~243 props, are the remaining bulk — a real refactor on unstaged production surfaces, do it carefully with per-file visual checks). `unsafe-inline` can only be dropped from `style-src` once the LAST inline style attribute is gone (nonces don't cover the `style="…"` attribute form, only `<style>` tags).

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
