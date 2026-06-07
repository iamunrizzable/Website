import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { getBrowserCookies } from '../tokens.js';

export async function blockTikTokUser(username) {
  const cookies = await getBrowserCookies();
  if (!cookies?.length) throw new Error('NO_BROWSER_COOKIES');

  const executablePath = process.env.CHROMIUM_PATH || await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();

    // Suppress the automation flag TikTok checks for
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

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
