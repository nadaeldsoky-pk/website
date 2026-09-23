/* SEO + accessibility audit across the whole site, driven by real Chrome via puppeteer-core.
   - Accessibility: injects axe-core (WCAG2A/AA rules) and reports violations by impact.
   - SEO: title/meta description presence+length, canonical, single H1, heading order,
          image alt coverage, lang attribute, viewport meta, robots meta, internal link text.
*/
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = 'C:/projects/website';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const PAGES = [
  'index.html', 'about.html', 'contact.html', 'products.html',
  'services.html', 'consultation.html', 'security-services.html', 'solutions.html',
  ...['cyber', 'governance', 'intel', 'inspect', 'risk', 'audit', 'incident', 'vendor'].map((id) => `product.html?id=${id}`),
];

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

async function getAxeSource() {
  const cachePath = join(ROOT, 'scripts', '.axe-core-cache.js');
  if (existsSync(cachePath)) return readFileSync(cachePath, 'utf8');
  const res = await fetch('https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js');
  const text = await res.text();
  writeFileSync(cachePath, text);
  return text;
}

const axeSource = await getAxeSource();

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox', '--hide-scrollbars'] });

const results = [];

for (const pg of PAGES) {
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  await page.setViewport({ width: 1440, height: 900 });
  try {
    await page.goto(`${BASE}/${pg}`, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => { const l = document.getElementById('pageLoader'); if (l) l.remove(); });
    await new Promise((r) => setTimeout(r, 700));

    // --- SEO checks ---
    const seo = await page.evaluate(() => {
      const title = document.title || '';
      const desc = document.querySelector('meta[name="description"]');
      const descContent = desc ? desc.getAttribute('content') || '' : '';
      const canonical = document.querySelector('link[rel="canonical"]');
      const robotsMeta = document.querySelector('meta[name="robots"]');
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const h1s = Array.from(document.querySelectorAll('h1'));
      const htmlLang = document.documentElement.getAttribute('lang') || '';
      const imgs = Array.from(document.querySelectorAll('img'));
      const imgsMissingAlt = imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.getAttribute('src') || '(no src)');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      // heading order check: collect all headings in DOM order, flag jumps >1 level
      const heads = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      let lastLevel = 0;
      const jumps = [];
      heads.forEach((h) => {
        const lvl = parseInt(h.tagName[1], 10);
        if (lastLevel && lvl - lastLevel > 1) jumps.push(`${h.tagName} after h${lastLevel}: "${h.textContent.trim().slice(0, 40)}"`);
        lastLevel = lvl;
      });
      const linksNoText = Array.from(document.querySelectorAll('a')).filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]')).length;
      return {
        title, titleLen: title.length,
        descContent, descLen: descContent.length,
        hasCanonical: !!canonical,
        robotsContent: robotsMeta ? robotsMeta.getAttribute('content') : null,
        hasViewport: !!viewportMeta,
        h1Count: h1s.length, h1Text: h1s.map((h) => h.textContent.trim().slice(0, 60)),
        htmlLang,
        imgCount: imgs.length, imgsMissingAlt,
        hasOg: !!(ogTitle && ogDesc && ogImage),
        headingJumps: jumps,
        linksNoAccessibleText: linksNoText,
      };
    });

    // --- Accessibility: axe-core ---
    await page.evaluate(axeSource);
    const axeResults = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] },
      });
      return {
        violations: r.violations.map((v) => ({
          id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,
          targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
        })),
      };
    });

    results.push({ page: pg, seo, a11y: axeResults.violations, consoleErrors: [...new Set(consoleErrors)] });
  } catch (e) {
    results.push({ page: pg, error: String(e.message).slice(0, 300) });
  }
  await page.close();
}

await browser.close();
server.close();

writeFileSync(join(ROOT, 'scripts', '.seo-a11y-report.json'), JSON.stringify(results, null, 1));

// ---- console summary ----
for (const r of results) {
  console.log('\n==========', r.page, '==========');
  if (r.error) { console.log('ERROR:', r.error); continue; }
  const s = r.seo;
  const problems = [];
  if (!s.title || s.titleLen < 10 || s.titleLen > 65) problems.push(`title len=${s.titleLen}: "${s.title}"`);
  if (!s.descContent || s.descLen < 50 || s.descLen > 165) problems.push(`meta description len=${s.descLen}`);
  if (s.h1Count !== 1) problems.push(`h1 count=${s.h1Count} ${JSON.stringify(s.h1Text)}`);
  if (!s.htmlLang) problems.push('missing <html lang>');
  if (s.imgsMissingAlt.length) problems.push(`images missing alt: ${s.imgsMissingAlt.length} -> ${s.imgsMissingAlt.slice(0, 5).join(', ')}`);
  if (!s.hasViewport) problems.push('missing viewport meta');
  if (!s.hasOg) problems.push('missing Open Graph tags (og:title/description/image)');
  if (s.headingJumps.length) problems.push(`heading level jumps: ${s.headingJumps.join(' | ')}`);
  if (s.linksNoAccessibleText) problems.push(`links with no accessible text: ${s.linksNoAccessibleText}`);
  console.log('SEO issues:', problems.length ? problems : 'none');

  const seriousA11y = r.a11y.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  const minorA11y = r.a11y.filter((v) => v.impact !== 'critical' && v.impact !== 'serious');
  console.log('A11y critical/serious:', seriousA11y.length ? seriousA11y.map((v) => `${v.id}(${v.impact}, ${v.nodes} nodes): ${v.help}`) : 'none');
  console.log('A11y moderate/minor:', minorA11y.length ? minorA11y.map((v) => `${v.id}(${v.impact}, ${v.nodes})`) : 'none');
  if (r.consoleErrors.length) console.log('console errors:', r.consoleErrors);
}
