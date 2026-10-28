import { describe, expect, it } from 'vitest';
import { BASE, activeLabels, allPages, doc, labels } from '../helpers/site';

describe('header', () => {
  it('links the brand "Meet Mehta" to Home', () => {
    const brand = doc('two', 'about').querySelector('header a');
    expect(brand?.text.trim()).toBe('Meet Mehta');
    expect(brand?.getAttribute('href')).toBe(BASE);
  });

  it('does not highlight Writing (or anything) on Home', () => {
    expect(activeLabels(doc('two', ''), 'Primary')).toEqual([]);
    expect(activeLabels(doc('two', ''), 'Mobile')).toEqual([]);
  });

  it('highlights Writing on the archive and on article pages', () => {
    for (const route of ['posts', 'posts/zeta-newest']) {
      expect(activeLabels(doc('two', route), 'Primary'), route).toEqual(['Writing']);
      expect(activeLabels(doc('two', route), 'Mobile'), route).toEqual(['Writing']);
    }
  });

  it('highlights About only on About', () => {
    expect(activeLabels(doc('two', 'about'), 'Primary')).toEqual(['About']);
    for (const route of ['', 'posts', 'posts/zeta-newest', 'topics']) {
      expect(activeLabels(doc('two', route), 'Primary'), route).not.toContain('About');
    }
  });

  it('shows the intended desktop, footer and mobile links in order', () => {
    const page = doc('two', '');
    const expected = ['Writing', 'Topics', 'About', 'GitHub', 'LinkedIn', 'Resume'];
    expect(labels(page, 'Primary')).toEqual(expected);
    expect(labels(page, 'Footer')).toEqual(expected);
    expect(labels(page, 'Mobile')).toEqual(expected);
    const single = doc('one', '');
    const without = ['Writing', 'About', 'GitHub', 'LinkedIn', 'Resume'];
    expect(labels(single, 'Primary')).toEqual(without);
    expect(labels(single, 'Footer')).toEqual(without);
    expect(labels(single, 'Mobile')).toEqual(without);
  });
});

describe('external links', () => {
  it('open in a new tab with noopener noreferrer', () => {
    for (const route of Object.keys(allPages('two'))) {
      const page = doc('two', route);
      const external = page
        .querySelectorAll('header nav a, footer nav a, nav[aria-label="Mobile"] a')
        .filter((a) => /^https?:/.test(a.getAttribute('href') ?? ''));
      expect(external.length, route).toBeGreaterThanOrEqual(9);
      for (const a of external) {
        expect(a.getAttribute('target'), `${route} ${a.text}`).toBe('_blank');
        expect(a.getAttribute('rel'), `${route} ${a.text}`).toBe('noopener noreferrer');
      }
    }
  });

  it('includes the About page cards', () => {
    const cards = doc('two', 'about')
      .querySelectorAll('main a')
      .filter((a) => /^https?:/.test(a.getAttribute('href') ?? ''));
    expect(cards.map((a) => a.getAttribute('href'))).toEqual([
      'https://flowcv.com/resume/8v0d7ou9dp',
      'https://github.com/mehtameet2802',
      'https://www.linkedin.com/in/mehtameet2802',
      'https://leetcode.com/u/mehtameet2802/',
    ]);
    for (const a of cards) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });
});
