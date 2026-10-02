#!/usr/bin/env node
/**
 * build-footer — pushes src/partials/footer.html into every page.
 *
 *   npm run build:footer
 *
 * Each page keeps a generated copy between FOOTER:START / FOOTER:END markers,
 * so the shipped HTML stays static (good for SEO, no flash of missing footer)
 * while the markup itself lives in exactly one file.
 *
 * On the first run the markers do not exist yet — the script finds the
 * current <footer> block and replaces it, then writes the markers around it.
 *
 * Line endings are preserved per file so editors don't show the whole page
 * as changed on Windows checkouts.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PARTIAL = join(ROOT, 'src', 'partials', 'footer.html');

const START = '<!-- FOOTER:START — generated from src/partials/footer.html by `npm run build:footer`. Edit the partial, not this. -->';
const END = '<!-- FOOTER:END -->';

/** Per-page link targets — same values as HREF_HOME/HREF_PRODUCTS/HREF_SERVICES in build-nav.mjs. */
const PAGES = {
  'index.html':              { HREF_HOME: '#top', HREF_PRODUCTS: '#products', HREF_SERVICES: '#services' },
  'about.html':               { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
  'contact.html':              { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
  'products.html':            { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
  'services.html':            { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
  'consultation.html':        { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
  'security-services.html':   { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
  'solutions.html':           { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
  'product.html':             { HREF_HOME: 'index.html', HREF_PRODUCTS: 'products.html', HREF_SERVICES: 'services.html' },
};

/** Strip the partial's authoring note — it is not meant to ship. */
function loadPartial() {
  const raw = readFileSync(PARTIAL, 'utf8').replace(/\r\n/g, '\n');
  return raw.replace(/^<!--[\s\S]*?-->\s*/, '').trimEnd();
}

function render(page, cfg) {
  let html = loadPartial();
  for (const [token, value] of Object.entries(cfg)) {
    html = html.replaceAll(`{{${token}}}`, value);
  }
  const leftover = html.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) throw new Error(`${page}: unfilled token(s) ${[...new Set(leftover)].join(', ')}`);
  return html;
}

let changed = 0;
for (const [page, cfg] of Object.entries(PAGES)) {
  const file = join(ROOT, page);
  if (!existsSync(file)) {
    console.warn(`  skip  ${page} (not found)`);
    continue;
  }

  const original = readFileSync(file, 'utf8');
  const crlf = original.includes('\r\n');
  const src = crlf ? original.replace(/\r\n/g, '\n') : original;

  const block = `${START}\n${render(page, cfg)}\n${END}`;

  let next;
  if (src.includes(START) && src.includes(END)) {
    const a = src.indexOf(START);
    const b = src.indexOf(END) + END.length;
    next = src.slice(0, a) + block + src.slice(b);
  } else {
    const footer = /<footer[\s\S]*?<\/footer>/;
    if (!footer.test(src)) throw new Error(`${page}: no FOOTER markers and no <footer> to replace`);
    next = src.replace(footer, block);
  }

  if (next === src) {
    console.log(`  same  ${page}`);
    continue;
  }
  writeFileSync(file, crlf ? next.replace(/\n/g, '\r\n') : next, 'utf8');
  console.log(`update  ${page}`);
  changed++;
}

console.log(`\nfooter build done — ${changed} page(s) updated`);
