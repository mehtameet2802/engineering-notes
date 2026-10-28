import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import scenarios from '../scenarios.json' with { type: 'json' };

export type Scenario = keyof typeof scenarios;
export const ORIGIN = 'https://mehtameet2802.github.io';
export const BASE = '/engineering-notes';

const dist = (scenario: Scenario) => resolve(import.meta.dirname, '../../dist-test', scenario);

/** Path of a page's HTML file; '' is the home page and 'about/' is /about/. */
export function htmlFile(scenario: Scenario, route: string): string {
  const clean = route.replace(/^\/|\/$/g, '');
  return join(dist(scenario), clean, 'index.html');
}

export function pageExists(scenario: Scenario, route: string): boolean {
  return existsSync(htmlFile(scenario, route));
}

export function doc(scenario: Scenario, route: string): HTMLElement {
  return parse(readFileSync(htmlFile(scenario, route), 'utf8'));
}

export function doc404(scenario: Scenario): HTMLElement {
  return parse(readFileSync(join(dist(scenario), '404.html'), 'utf8'));
}

/** Every built HTML page of a scenario as route -> parsed document (404 excluded). */
export function allPages(scenario: Scenario): Record<string, HTMLElement> {
  const out: Record<string, HTMLElement> = {};
  const walk = (dir: string, prefix: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === 'pagefind' || name === '_astro') continue;
        walk(full, `${prefix}${name}/`);
      } else if (name === 'index.html') {
        out[prefix] = parse(readFileSync(full, 'utf8'));
      }
    }
  };
  walk(dist(scenario), '');
  return out;
}

export function sitemapUrls(scenario: Scenario): string[] {
  const xml = readFileSync(join(dist(scenario), 'sitemap-0.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

export function pagefindPageCount(scenario: Scenario): number {
  const entry = JSON.parse(readFileSync(join(dist(scenario), 'pagefind/pagefind-entry.json'), 'utf8'));
  return entry.languages.en.page_count;
}

export const canonicalOf = (route: string) => `${ORIGIN}${BASE}/${route.replace(/^\/|\/$/g, '')}${route.replace(/^\/|\/$/g, '') ? '/' : ''}`;

export const labels = (root: HTMLElement, navLabel: string) =>
  root.querySelectorAll(`nav[aria-label="${navLabel}"] a`).map((a) => a.text.trim());

export const activeLabels = (root: HTMLElement, navLabel: string) =>
  root.querySelectorAll(`nav[aria-label="${navLabel}"] a[aria-current="page"]`).map((a) => a.text.trim());

export const isNoindex = (root: HTMLElement) => root.querySelector('meta[name="robots"]')?.getAttribute('content') === 'noindex';

export const jsonLd = (root: HTMLElement) =>
  root.querySelectorAll('script[type="application/ld+json"]').map((s) => JSON.parse(s.text));

export const url = (scenario: Scenario, route = '') => `http://127.0.0.1:${scenarios[scenario].port}${BASE}/${route.replace(/^\//, '')}`;
export const devUrl = (route = '') => `http://127.0.0.1:4510${BASE}/${route.replace(/^\//, '')}`;
