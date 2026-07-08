import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { getBrowserCookies } from '../tokens.js';

async function launchStealthBrowser() {
  const executablePath = process.env.CHROMIUM_PATH || await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );
  return { browser, page };
}

// Diagnostic / admin-debug only: visits a commenter's PUBLIC profile page
// anonymously (no login cookies — we have no confirmed-active session) to
// see what TikTok actually embeds/renders for a given username, as a first
// step toward a bot-likelihood heuristic. TikTok embeds profile stats as
// JSON in a <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"> tag (current
// format) or the older <script id="SIGI_STATE">; exact nested paths shift
// over time and haven't been confirmed against the live site from this
// environment (outbound access to www.tiktok.com is blocked by this
// sandbox's network policy), so this returns the raw embedded JSON AND a
// best-effort parse AND raw visible-DOM text, so a live test tells us the
// real shape instead of guessing it up front.
export async function getProfileSignals(username) {
  const { browser, page } = await launchStealthBrowser();
  try {
    await page.goto(`https://www.tiktok.com/@${encodeURIComponent(username)}`, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    const extracted = await page.evaluate(() => {
      function readJsonScript(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        try { return JSON.parse(el.textContent); } catch { return { parse_error: true, raw_length: el.textContent?.length ?? 0 }; }
      }

      const universalData = readJsonScript('__UNIVERSAL_DATA_FOR_REHYDRATION__');
      const sigiState = universalData ? null : readJsonScript('SIGI_STATE');

      const textOf = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null;

      const domSignals = {
        followers: textOf('[data-e2e="followers-count"]'),
        following: textOf('[data-e2e="following-count"]'),
        likes: textOf('[data-e2e="likes-count"]'),
        bio: textOf('[data-e2e="user-bio"]'),
        nickname: textOf('[data-e2e="user-subtitle"]'),
        has_verified_badge: !!document.querySelector('[data-e2e="user-verified-icon"], [class*="Verified" i]'),
        avatar_present: !!document.querySelector('[data-e2e="user-avatar"] img'),
      };

      return {
        page_title: document.title,
        found_universal_data: !!universalData,
        found_sigi_state: !!sigiState,
        universal_data_excerpt: universalData ? JSON.stringify(universalData).slice(0, 8000) : null,
        sigi_state_excerpt: sigiState ? JSON.stringify(sigiState).slice(0, 8000) : null,
        dom_signals: domSignals,
        body_text_excerpt: document.body?.innerText?.slice(0, 500) ?? null,
      };
    });

    return { username, ...extracted };
  } finally {
    await browser.close();
  }
}

export async function blockTikTokUser(username) {
  const cookies = await getBrowserCookies();
  if (!cookies?.length) throw new Error('NO_BROWSER_COOKIES');

  const { browser, page } = await launchStealthBrowser();

  try {
    await page.setCookie(...cookies);

    await page.goto(`https://www.tiktok.com/@${encodeURIComponent(username)}`, {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    // Click the more-options ("...") button on their profile
    const moreClicked = await tryClickAny(page, [
      '[data-e2e="user-more"]',
      '[aria-label="More"]',
      'button[aria-label*="more" i]',
      'button[aria-label*="options" i]',
    ]);
    if (!moreClicked) throw new Error('SELECTOR_NOT_FOUND:more_options');

    await delay(800);

    // Click "Block" in the dropdown
    const blockClicked = await tryClickByText(page, 'Block');
    if (!blockClicked) throw new Error('SELECTOR_NOT_FOUND:block_option');

    await delay(800);

    // Confirm the block dialog
    await tryClickByText(page, 'Block');

    return { blocked: true, username };
  } finally {
    await browser.close();
  }
}

async function tryClickAny(page, selectors) {
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 4000, visible: true });
      await page.click(sel);
      return true;
    } catch {}
  }
  return false;
}

async function tryClickByText(page, text) {
  try {
    const [el] = await page.$x(
      `//*[normalize-space(text())='${text}' and not(self::script) and not(self::style)]`
    );
    if (el) { await el.click(); return true; }
  } catch {}
  return false;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
