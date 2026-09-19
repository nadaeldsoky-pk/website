/* Responsive audit harness — drives real Chrome across pages x viewports and
   fails on horizontal overflow, clipped/off-screen elements, broken nav mode,
   broken images and console errors. Usage: node scripts/responsive-audit.mjs [--shots] [--pages a,b] [--widths 375,768] */
import http from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

const PAGES = [
  'index.html', 'about.html', 'contact.html', 'products.html',
  ...['cyber', 'governance', 'intel', 'inspect', 'risk', 'audit', 'incident', 'vendor'].map((id) => `product.html?id=${id}`),
];
const WIDTHS = [320, 360, 390, 414, 600, 768, 820, 1024, 1280, 1440, 1920];
const SHOT_WIDTHS = [375, 768, 1440];

const pages = opt('--pages') ? opt('--pages').split(',') : PAGES;
const widths = opt('--widths') ? opt('--widths').split(',').map(Number) : WIDTHS;
const shotDir = opt('--out') || join(ROOT, 'audit-output');

/* ---------- tiny static server ---------- */
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webp': 'image/webp', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let f = join(ROOT, p);
  if (!existsSync(f) && existsSync(f + '.html')) f += '.html';
  if (!existsSync(f)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;

/* ---------- in-page checks ---------- */
const pageCheck = () => {
  const vw = document.documentElement.clientWidth;
  const out = { vw, docScroll: document.documentElement.scrollWidth, bodyScroll: document.body.scrollWidth, offenders: [], smallText: 0, smallTargets: [], truncated: [], brokenImgs: [] };

  const clipped = (el) => {
    for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX !== 'visible') {
        const r = a.getBoundingClientRect();
        if (r.left >= -1 && r.right <= vw + 1) return true;
      }
    }
    return false;
  };
  const sel = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');

  const seen = new Set();
  document.querySelectorAll('body *').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (el.closest('#pageLoader, .logo-marquee, .sr-only, .skip-link')) return;
    if (r.right > vw + 1 || r.left < -1) {
      if (cs.position === 'fixed' && el.hasAttribute('hidden')) return;
      if (clipped(el)) return;
      const key = sel(el);
      if (seen.has(key)) return;
      seen.add(key);
      out.offenders.push({ el: key, left: Math.round(r.left), right: Math.round(r.right) });
    }
    // text smaller than 11px
    if (el.childNodes.length && Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 11 && !el.closest('.prods-cat,.prod-cat')) out.smallText++;
    // tap targets on small screens
    if (vw <= 820 && /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && cs.display !== 'inline') {
      if (r.height < 30 || r.width < 30) out.smallTargets.push(sel(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
    // truncated text
    if (cs.overflowX === 'hidden' && el.scrollWidth > el.clientWidth + 2 && el.textContent.trim() && !el.closest('.logo-marquee,.frameworks-orbit,.bench-card')) out.truncated.push(sel(el));
    if (el.tagName === 'IMG' && (!el.complete || el.naturalWidth === 0) && el.getAttribute('src')) out.brokenImgs.push(el.getAttribute('src'));
  });

  const menuBtn = document.getElementById('menuBtn');
  const navList = document.getElementById('navList');
  const vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
  out.navMode = vw >= 1024 ? (vis(navList) && !vis(menuBtn) ? 'ok' : 'bad-desktop-nav') : (vis(menuBtn) && !vis(navList) ? 'ok' : 'bad-mobile-nav');
  return out;
};

/* ---------- run ---------- */
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] });
const results = [];
const jobs = [];
for (const pg of pages) for (const w of widths) jobs.push({ pg, w });

const run = async ({ pg, w }) => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 140)); });
  page.on('requestfailed', (r) => { if (!/fonts\.g|googleapis|gstatic/.test(r.url())) errors.push('reqfail: ' + r.url().replace(BASE, '')); });
  page.on('response', (r) => { if (r.status() >= 400 && !/fonts\.g|googleapis|gstatic|favicon/.test(r.url())) errors.push(r.status() + ' ' + r.url().replace(BASE, '')); });
  const h = w < 600 ? 800 : w < 1024 ? 1000 : 900;
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w <= 820, hasTouch: w <= 820 });
  try {
    await page.goto(`${BASE}/${pg}`, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => { const l = document.getElementById('pageLoader'); if (l) l.remove(); });
    await new Promise((r) => setTimeout(r, 500));
    // scroll through so reveal observers fire
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total + h; y += Math.floor(h * 0.7)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await new Promise((r) => setTimeout(r, 90));
    }
    await new Promise((r) => setTimeout(r, 2200));
    const res = await page.evaluate(pageCheck);
    res.page = pg; res.width = w; res.errors = [...new Set(errors)];
    res.overflow = res.docScroll > res.vw + 1 || res.bodyScroll > res.vw + 1;
    if (flag('--shots') && SHOT_WIDTHS.some((s) => Math.abs(s - w) < 30)) {
      await page.evaluate(() => window.scrollTo(0, 0));
      mkdirSync(shotDir, { recursive: true });
      const name = pg.replace(/[?=.]/g, '_') + '@' + w + '.png';
      await page.screenshot({ path: join(shotDir, name), fullPage: true });
    }
    results.push(res);
  } catch (e) {
    results.push({ page: pg, width: w, fatal: String(e.message).slice(0, 200) });
  }
  await page.close();
};

const CONC = 4;
let idx = 0;
await Promise.all(Array.from({ length: CONC }, async () => { while (idx < jobs.length) await run(jobs[idx++]); }));
await browser.close();
server.close();

/* ---------- report ---------- */
results.sort((a, b) => (a.page + a.width).localeCompare(b.page + b.width, undefined, { numeric: true }));
let fails = 0, warns = 0;
const lines = [];
for (const r of results) {
  if (r.fatal) { fails++; lines.push(`FATAL  ${r.page} @${r.width}: ${r.fatal}`); continue; }
  const problems = [];
  if (r.overflow) problems.push(`H-OVERFLOW doc=${r.docScroll} vw=${r.vw}`);
  if (r.offenders.length) problems.push('OFF-SCREEN ' + r.offenders.slice(0, 6).map((o) => `${o.el}[${o.left},${o.right}]`).join(' | '));
  if (r.navMode !== 'ok') problems.push(r.navMode);
  if (r.brokenImgs.length) problems.push('BROKEN-IMG ' + [...new Set(r.brokenImgs)].slice(0, 3).join(','));
  if (r.errors.length) problems.push('ERRORS ' + r.errors.slice(0, 3).join(' ; '));
  if (problems.length) { fails++; lines.push(`FAIL   ${r.page} @${r.width}: ${problems.join('  ||  ')}`); }
  const w = [];
  if (r.smallTargets.length) w.push(`small-targets:${r.smallTargets.length} (${[...new Set(r.smallTargets)].slice(0, 3).join(', ')})`);
  if (r.truncated.length) w.push(`truncated:${[...new Set(r.truncated)].slice(0, 3).join(', ')}`);
  if (r.smallText) w.push(`tiny-text:${r.smallText}`);
  if (w.length) { warns++; lines.push(`warn   ${r.page} @${r.width}: ${w.join('  ')}`); }
}
console.log(lines.join('\n'));
console.log(`\n${results.length} runs — ${fails} failing, ${warns} with warnings`);
mkdirSync(shotDir, { recursive: true });
writeFileSync(join(shotDir, 'report.json'), JSON.stringify(results, null, 1));
process.exit(fails ? 1 : 0);
