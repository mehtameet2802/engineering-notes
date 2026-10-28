import { describe, expect, it } from 'vitest';
import {
  ORIGIN, BASE, allPages, canonicalOf, doc, doc404, isNoindex, jsonLd, sitemapUrls,
} from '../helpers/site';

const SCENARIOS = ['none', 'one', 'plain', 'two'] as const;

describe('canonical URLs', () => {
  for (const scenario of SCENARIOS) {
    it(`every page in "${scenario}" has exactly one canonical URL ending in /`, () => {
      for (const [route, page] of Object.entries(allPages(scenario))) {
        const links = page.querySelectorAll('link[rel="canonical"]');
        expect(links.length, route).toBe(1);
        const href = links[0].getAttribute('href')!;
        expect(href, route).toBe(canonicalOf(route));
        expect(href.endsWith('/'), route).toBe(true);
      }
    });
  }
});

describe('structured data', () => {
  it('Home includes WebSite schema whose url matches the canonical URL', () => {
    const [site] = jsonLd(doc('two', ''));
    expect(site['@type']).toBe('WebSite');
    expect(site.url).toBe(canonicalOf(''));
  });

  it('About includes Person schema with jobTitle Software Engineer', () => {
    const [person] = jsonLd(doc('two', 'about'));
    expect(person['@type']).toBe('Person');
    expect(person.jobTitle).toBe('Software Engineer');
    expect(person.url).toBe(canonicalOf('about'));
    expect(person.sameAs).toEqual([
      'https://github.com/mehtameet2802',
      'https://www.linkedin.com/in/mehtameet2802',
      'https://leetcode.com/u/mehtameet2802/',
    ]);
  });

  it('articles include BlogPosting schema whose URL matches the canonical URL', () => {
    const [post] = jsonLd(doc('two', 'posts/zeta-newest'));
    expect(post['@type']).toBe('BlogPosting');
    expect(post.headline).toBe('Zeta Newest');
    expect(post.mainEntityOfPage).toBe(canonicalOf('posts/zeta-newest'));
  });

  it('every structured-data URL equals the page canonical URL', () => {
    for (const [route, page] of Object.entries(allPages('two'))) {
      for (const data of jsonLd(page)) {
        const urls = [data.url, data.mainEntityOfPage].filter(Boolean);
        for (const u of urls) expect(u, route).toBe(canonicalOf(route));
      }
    }
  });
});

describe('sitemap', () => {
  for (const scenario of SCENARIOS) {
    it(`"${scenario}" contains exactly the indexable pages`, () => {
      const indexable = Object.entries(allPages(scenario))
        .filter(([, page]) => !isNoindex(page))
        .map(([route]) => canonicalOf(route));
      expect(sitemapUrls(scenario).sort()).toEqual(indexable.sort());
    });
  }
});

describe('metadata', () => {
  it('404 page is noindex', () => {
    expect(isNoindex(doc404('two'))).toBe(true);
  });

  it('browser title on Home is "Meet Mehta — Engineering Notes"', () => {
    expect(doc('two', '').querySelector('title')?.text).toBe('Meet Mehta — Engineering Notes');
  });

  it('sub-page titles end with the site name', () => {
    expect(doc('two', 'about').querySelector('title')?.text).toBe('About — Meet Mehta');
    expect(doc('two', 'posts').querySelector('title')?.text).toBe('Writing — Meet Mehta');
  });

  it('declares ICO, SVG, PNG, Apple touch icon and manifest links', () => {
    const head = doc('two', '');
    const href = (selector: string) => head.querySelector(selector)?.getAttribute('href');
    expect(href('link[rel="icon"][href$="favicon.ico"]')).toBe(`${BASE}/favicon.ico`);
    expect(href('link[rel="icon"][type="image/svg+xml"]')).toBe(`${BASE}/favicon.svg`);
    expect(href('link[rel="icon"][type="image/png"]')).toBe(`${BASE}/favicon-48.png`);
    expect(href('link[rel="apple-touch-icon"]')).toBe(`${BASE}/apple-touch-icon.png`);
    expect(href('link[rel="manifest"]')).toBe(`${BASE}/site.webmanifest`);
  });

  it('articles use og:type article', () => {
    expect(doc('two', 'posts/zeta-newest').querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article');
    expect(doc('two', '').querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website');
  });

  it('serves absolute URLs in canonical and og:url', () => {
    const page = doc('two', 'about');
    expect(page.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(`${ORIGIN}${BASE}/about/`);
  });
});
