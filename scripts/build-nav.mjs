#!/usr/bin/env node
/**
 * build-nav — pushes src/partials/nav.html into every page.
 *
 *   npm run build:nav
 *
 * Each page keeps a generated copy between NAV:START / NAV:END markers, so the
 * shipped HTML stays static (good for SEO, no flash of missing nav) while the
 * markup itself lives in exactly one file.
 *
 * On the first run the markers do not exist yet — the script finds the current
 * <header id="siteHeader"> block, replaces it, and writes the markers around it.
 *
 * Line endings are preserved per file so editors don't show the whole page as
 * changed on Windows checkouts.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PARTIAL = join(ROOT, 'src', 'partials', 'nav.html');

const START = '<!-- NAV:START — generated from src/partials/nav.html by `npm run build:nav`. Edit the partial, not this. -->';
const END = '<!-- NAV:END -->';

/** Per-page wiring. `active` must match a data-nav key in the partial. */
const PAGES = {
  'index.html': {
    active: 'home',
    HREF_HOME: '#top',
    HREF_SERVICES: '#strategic-services',
    HREF_PRODUCTS: 'products.html',
    HREF_CTA: '#contact',
  },
  'about.html': {
    active: 'about',
    HREF_HOME: 'index.html',
    HREF_SERVICES: 'index.html#strategic-services',
    HREF_PRODUCTS: 'products.html',
    HREF_CTA: '#contact',
  },
  'contact.html': {
    active: 'contact',
    HREF_HOME: 'index.html',
    HREF_SERVICES: 'index.html#strategic-services',
    HREF_PRODUCTS: 'products.html',
    HREF_CTA: '#contact-heading',
  },
  'products.html': {
    active: 'products',
    HREF_HOME: 'index.html',
    HREF_SERVICES: 'index.html#strategic-services',
    HREF_PRODUCTS: 'products.html',
    HREF_CTA: 'contact.html',
  },
  'product.html': {
    active: 'products',
    HREF_HOME: 'index.html',
    HREF_SERVICES: 'index.html#strategic-services',
    HREF_PRODUCTS: 'products.html',
    HREF_CTA: 'index.html#contact',
  },
};

const INACTIVE_DESKTOP = 'nav-link text-muted hover:text-primary transition-colors';
const ACTIVE_DESKTOP = 'nav-link font-semibold text-primary transition-colors';
const INACTIVE_MOBILE = 'block rounded-lg px-3 py-2 text-muted hover:bg-surface';
const ACTIVE_MOBILE = 'block rounded-lg px-3 py-2 font-semibold text-primary bg-surface';

/** Strip the partial's authoring note — it is not meant to ship. */
function loadPartial() {
  const raw = readFileSync(PARTIAL, 'utf8').replace(/\r\n/g, '\n');
  return raw.replace(/^<!--[\s\S]*?-->\s*/, '').trimEnd();
}

/** Mark the active item: swap its classes and add aria-current. */
function markActive(html, key) {
  const swap = (attr, inactive, active) =>
    new RegExp(`(<a\\s+${attr}="${key}"[^>]*?)class="${inactive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`);

  let out = html;
  const d = swap('data-nav', INACTIVE_DESKTOP);
  if (!d.test(out)) throw new Error(`no desktop link with data-nav="${key}"`);
  out = out.replace(d, `$1class="${ACTIVE_DESKTOP}" aria-current="page"`);

  const m = swap('data-nav-m', INACTIVE_MOBILE);
  if (!m.test(out)) throw new Error(`no mobile link with data-nav-m="${key}"`);
  out = out.replace(m, `$1class="${ACTIVE_MOBILE}" aria-current="page"`);

  return out;
}

function render(page, cfg) {
  let html = loadPartial();
  for (const [token, value] of Object.entries(cfg)) {
    if (token === 'active') continue;
    html = html.replaceAll(`{{${token}}}`, value);
  }
  const leftover = html.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) throw new Error(`${page}: unfilled token(s) ${[...new Set(leftover)].join(', ')}`);
  return markActive(html, cfg.active);
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
    const header = /<header id="siteHeader"[\s\S]*?<\/header>/;
    if (!header.test(src)) throw new Error(`${page}: no NAV markers and no <header id="siteHeader"> to replace`);
    next = src.replace(header, block);
  }

  if (next === src) {
    console.log(`  same  ${page}`);
    continue;
  }
  writeFileSync(file, crlf ? next.replace(/\n/g, '\r\n') : next, 'utf8');
  console.log(`update  ${page}`);
  changed++;
}

console.log(`\nnav build done — ${changed} page(s) updated`);
