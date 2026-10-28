import { describe, expect, it } from 'vitest';
import { allPages, doc, labels } from '../helpers/site';

describe('document structure', () => {
  it('every page has exactly one H1', () => {
    for (const scenario of ['none', 'two'] as const) {
      for (const [route, page] of Object.entries(allPages(scenario))) {
        expect(page.querySelectorAll('h1').length, `${scenario}:${route}`).toBe(1);
      }
    }
  });

  it('has no duplicate IDs on any page', () => {
    for (const [route, page] of Object.entries(allPages('two'))) {
      const ids = page.querySelectorAll('[id]').map((el) => el.getAttribute('id')!);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(duplicates, route).toEqual([]);
    }
  });

  it('article headings go H1 then H2 without skipping levels', () => {
    const page = doc('one', 'posts/idempotency-keys');
    const levels = page.querySelectorAll('h1, h2, h3, h4').map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    expect(levels[1]).toBe(2);
    levels.forEach((level, i) => {
      if (i > 0) expect(level - levels[i - 1], `heading #${i}`).toBeLessThanOrEqual(1);
    });
  });
});

describe('heading hierarchy', () => {
  const levels = (page: ReturnType<typeof doc>) =>
    page.querySelectorAll('h1, h2, h3, h4, h5, h6').map((h) => Number(h.tagName[1]));

  it('never skips a level on any page', () => {
    for (const scenario of ['none', 'one', 'plain', 'two'] as const) {
      for (const [route, page] of Object.entries(allPages(scenario))) {
        const seq = levels(page);
        expect(seq[0], `${scenario}:${route}`).toBe(1);
        seq.forEach((level, i) => {
          if (i > 0) expect(level - seq[i - 1], `${scenario}:${route} heading #${i} (${seq.join(',')})`).toBeLessThanOrEqual(1);
        });
      }
    }
  });

  it('puts article titles at H2 on the archive and topic pages', () => {
    for (const route of ['posts', 'topics/reliability-apis', 'topics/data-persistence']) {
      const page = doc('two', route);
      expect(page.querySelectorAll('article h2').length, route).toBeGreaterThan(0);
      expect(page.querySelectorAll('article h3').length, route).toBe(0);
    }
  });

  it('keeps article titles at H3 under the "Latest writing" H2 on Home', () => {
    const home = doc('two', '');
    expect(home.querySelector('#latest-heading')?.tagName).toBe('H2');
    expect(home.querySelectorAll('section[aria-labelledby="latest-heading"] article h3').length).toBe(5);
    expect(home.querySelectorAll('section[aria-labelledby="latest-heading"] article h2').length).toBe(0);
  });
});

describe('landmarks and labels', () => {
  it('has a skip link targeting main', () => {
    const page = doc('two', '');
    expect(page.querySelector('a[href="#main"]')?.text.trim()).toBe('Skip to content');
    expect(page.querySelector('main#main')?.getAttribute('tabindex')).toBe('-1');
  });

  it('labels the header, footer and mobile navigation', () => {
    const page = doc('two', '');
    for (const name of ['Primary', 'Footer', 'Mobile']) {
      expect(page.querySelectorAll(`nav[aria-label="${name}"]`).length, name).toBe(1);
      expect(labels(page, name).length, name).toBeGreaterThan(0);
    }
  });

  it('labels the article table of contents', () => {
    expect(doc('one', 'posts/idempotency-keys').querySelector('nav[aria-label="Table of contents"]')).not.toBeNull();
  });

  it('gives icon-only buttons an accessible name', () => {
    const page = doc('one', 'posts/idempotency-keys');
    expect(page.querySelector('[data-search-open]')?.getAttribute('aria-label')).toBe('Search writing');
    expect(page.querySelector('[data-theme-toggle]')?.getAttribute('aria-label')).toBe('Toggle color theme');
    expect(page.querySelector('[data-copy-link]')?.text.trim()).toBe('Copy link');
  });

  it('gives every image meaningful alt text', () => {
    const images = doc('two', 'about').querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    for (const img of images) {
      expect(img.getAttribute('alt')?.trim().length, img.getAttribute('src') ?? '').toBeGreaterThan(5);
    }
  });
});
