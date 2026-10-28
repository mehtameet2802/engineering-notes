import { describe, expect, it } from 'vitest';
import { doc } from '../helpers/site';

const titles = (root: ReturnType<typeof doc>, selector: string) =>
  root.querySelectorAll(`${selector} h3`).map((h) => h.text.trim());

describe('featured article', () => {
  it('uses the article marked featured, even when it is not the newest', () => {
    const home = doc('two', '');
    expect(home.querySelector('#featured-heading')).not.toBeNull();
    const featured = home.querySelector('section[aria-labelledby="featured-heading"]')!;
    expect(featured.text).toContain('Featured Older');
    expect(featured.text).not.toContain('Zeta Newest');
  });

  it('falls back to the newest article when none is marked featured', () => {
    const featured = doc('plain', '').querySelector('section[aria-labelledby="featured-heading"]')!;
    expect(featured.text).toContain('Plain Newest');
  });
});

describe('latest writing', () => {
  const home = doc('two', '');
  const latest = () => home.querySelector('section[aria-labelledby="latest-heading"]')!;

  it('excludes the featured article', () => {
    expect(latest().text).not.toContain('Featured Older');
  });

  it('contains at most five articles, newest first', () => {
    expect(titles(home, 'section[aria-labelledby="latest-heading"]')).toEqual([
      'Zeta Newest', 'Epsilon Replication', 'Delta Timeouts', 'Gamma Transactions', 'Beta Queues',
    ]);
  });

  it('shows "More writing coming soon." when the featured article is the only article', () => {
    const only = doc('one', '').querySelector('section[aria-labelledby="latest-heading"]')!;
    expect(only.text).toContain('More writing coming soon.');
    expect(latest().text).not.toContain('More writing coming soon.');
  });

  it('links to the full archive', () => {
    expect(latest().querySelector('a[href="/engineering-notes/posts"]')?.text).toContain('View all writing');
  });
});

describe('writing archive', () => {
  it('lists every published article newest first', () => {
    const archive = doc('two', 'posts');
    const order = archive.querySelectorAll('article h2').map((h) => h.text.trim());
    expect(order).toEqual([
      'Zeta Newest', 'Epsilon Replication', 'Delta Timeouts', 'Gamma Transactions',
      'Beta Queues', 'Alpha Indexing', 'Featured Older',
    ]);
    expect(order).not.toContain('Hidden Draft');
  });

  it('is titled "All writing" and shows the article count', () => {
    const archive = doc('two', 'posts');
    expect(archive.querySelector('h1')?.text.trim()).toBe('All writing');
    expect(archive.text).toContain('7 articles');
  });

  it('offers filter chips only for active topics', () => {
    const chips = doc('two', 'posts').querySelectorAll('ul[aria-label="Topics"] a').map((a) => a.text.trim());
    expect(chips).toEqual(['All writing', 'Data & Persistence', 'Reliability & APIs']);
  });
});
