import { describe, expect, it } from 'vitest';
import {
  ORIGIN, BASE, activeLabels, allPages, doc, isNoindex, labels, pageExists, pagefindPageCount, sitemapUrls,
} from '../helpers/site';

const loc = (route: string) => `${ORIGIN}${BASE}/${route}`;
const siteNav = (d: ReturnType<typeof doc>) => ({
  header: labels(d, 'Primary'),
  footer: labels(d, 'Footer'),
  mobile: labels(d, 'Mobile'),
});

describe('no published articles', () => {
  const home = doc('none', '');

  it('excludes draft articles from production', () => {
    expect(pageExists('none', 'posts/draft-sample/')).toBe(false);
    expect(Object.keys(allPages('none')).filter((r) => r.startsWith('posts/') && r !== 'posts/')).toEqual([]);
  });

  it('home has no Featured or Latest sections', () => {
    expect(home.querySelector('#featured-heading')).toBeNull();
    expect(home.querySelector('#latest-heading')).toBeNull();
    expect(home.text).not.toContain('Featured writing');
    expect(home.text).not.toContain('Latest writing');
  });

  it('hides search entirely', () => {
    for (const route of Object.keys(allPages('none'))) {
      const page = doc('none', route);
      expect(page.querySelector('[data-search-open]'), route).toBeNull();
      expect(page.querySelector('#search-dialog'), route).toBeNull();
    }
  });

  it('generates no individual topic pages', () => {
    const topicPages = Object.keys(allPages('none')).filter((r) => r.startsWith('topics/') && r !== 'topics/');
    expect(topicPages).toEqual([]);
  });

  it('keeps /topics/ available with the empty message, noindex and out of the sitemap', () => {
    const topics = doc('none', 'topics');
    expect(topics.text).toContain('Topics will appear here once articles are published.');
    expect(isNoindex(topics)).toBe(true);
    expect(sitemapUrls('none')).not.toContain(loc('topics/'));
  });

  it('has no Topics link in navigation', () => {
    const nav = siteNav(home);
    for (const links of Object.values(nav)) expect(links).not.toContain('Topics');
  });
});

describe('one published article and topic', () => {
  const article = doc('one', 'posts/idempotency-keys');

  it('generates the article page, its topic page, a sitemap entry and a search-index entry', () => {
    expect(pageExists('one', 'posts/idempotency-keys/')).toBe(true);
    expect(pageExists('one', 'topics/reliability-apis/')).toBe(true);
    const urls = sitemapUrls('one');
    expect(urls).toContain(loc('posts/idempotency-keys/'));
    expect(urls).toContain(loc('topics/reliability-apis/'));
    expect(pagefindPageCount('one')).toBe(1);
  });

  it('does not generate pages for unpublished topics', () => {
    expect(pageExists('one', 'topics/systems-architecture/')).toBe(false);
    expect(pageExists('one', 'topics/data-persistence/')).toBe(false);
  });

  it('opens the specific topic page from the topic badge', () => {
    const badge = article.querySelector(`a[href="${BASE}/topics/reliability-apis"]`);
    expect(badge?.text.trim()).toBe('Reliability & APIs');
  });

  it('omits Topics from header, footer and mobile navigation', () => {
    const nav = siteNav(doc('one', ''));
    for (const links of Object.values(nav)) expect(links).not.toContain('Topics');
  });

  it('makes /topics/ noindex and keeps it out of the sitemap', () => {
    expect(isNoindex(doc('one', 'topics'))).toBe(true);
    expect(sitemapUrls('one')).not.toContain(loc('topics/'));
  });
});

describe('two or more published topics', () => {
  const home = doc('two', '');
  const topics = doc('two', 'topics');

  it('adds Topics to desktop, footer and mobile navigation', () => {
    const nav = siteNav(home);
    for (const links of Object.values(nav)) expect(links).toContain('Topics');
  });

  it('lists /topics/ in the sitemap and makes it indexable', () => {
    expect(sitemapUrls('two')).toContain(loc('topics/'));
    expect(isNoindex(topics)).toBe(false);
  });

  it('lists only active topics', () => {
    const titles = topics.querySelectorAll('[data-filter-item] h2').map((h) => h.text.replace(/^\s*\d+\s*/, '').trim());
    expect(titles).toEqual(['Data & Persistence', 'Reliability & APIs']);
  });

  it('keeps draft-only topics unpublished', () => {
    expect(pageExists('two', 'topics/concurrency-performance/')).toBe(false);
    expect(pageExists('two', 'posts/hidden-draft/')).toBe(false);
  });

  it('indexes every published article for search', () => {
    expect(pagefindPageCount('two')).toBe(7);
  });

  it('highlights Topics on a topic page once Topics is in the navigation', () => {
    const page = doc('two', 'topics/reliability-apis');
    expect(activeLabels(page, 'Primary')).toEqual(['Topics']);
    expect(activeLabels(page, 'Mobile')).toEqual(['Topics']);
  });
});

describe('one topic keeps topic pages inside the Writing section', () => {
  it('highlights Writing, not a missing Topics item', () => {
    const page = doc('plain', 'topics/software-design');
    expect(activeLabels(page, 'Primary')).toEqual(['Writing']);
    expect(activeLabels(page, 'Mobile')).toEqual(['Writing']);
  });
});
