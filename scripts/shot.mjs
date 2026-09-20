/* Screenshot one element: node scripts/shot.mjs "<path>" "<selector>" <width> <out.png> */
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [pg, selector, width, out] = process.argv.slice(2);
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  let f = join(ROOT, p); if (!existsSync(f) && existsSync(f + '.html')) f += '.html';
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, r));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
const w = Number(width);
await page.setViewport({ width: w, height: 900, isMobile: w <= 820, hasTouch: w <= 820 });
await page.goto(`http://localhost:${server.address().port}/${pg}`, { waitUntil: 'load' });
await page.evaluate(() => { const l = document.getElementById('pageLoader'); if (l) l.remove(); });
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await new Promise((r) => setTimeout(r, 80)); }
await new Promise((r) => setTimeout(r, 2500));
const el = await page.$(selector);
await el.scrollIntoView();
await new Promise((r) => setTimeout(r, 600));
await el.screenshot({ path: out });
await browser.close(); server.close();
console.log('saved', out);
