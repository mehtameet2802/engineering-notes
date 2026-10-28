import { expect, test } from '@playwright/test';
import { url } from '../helpers/site';

const visibleTitles = (page: import('@playwright/test').Page) =>
  page.locator('article[data-filter-item]:not([hidden]) h2').allInnerTexts().then((t) => t.map((s) => s.trim()));

test.describe('writing archive filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(url('two', 'posts/'));
  });

  test('shows every article before filtering', async ({ page }) => {
    expect(await visibleTitles(page)).toHaveLength(7);
  });

  for (const [field, query, expected] of [
    ['title', 'gamma', ['Gamma Transactions']],
    ['description', 'indexing strategies', ['Alpha Indexing']],
    ['topic', 'persistence', ['Epsilon Replication', 'Gamma Transactions', 'Alpha Indexing']],
    ['tag', 'newest-tag', ['Zeta Newest']],
  ] as const) {
    test(`matches by ${field}`, async ({ page }) => {
      await page.getByRole('searchbox', { name: 'Filter writing' }).fill(query);
      expect(await visibleTitles(page)).toEqual(expected);
    });
  }

  test('shows "Nothing matches that filter." when nothing matches', async ({ page }) => {
    const empty = page.getByText('Nothing matches that filter.');
    await expect(empty).toBeHidden();
    await page.getByRole('searchbox', { name: 'Filter writing' }).fill('no-such-article');
    await expect(empty).toBeVisible();
    expect(await visibleTitles(page)).toEqual([]);
    await page.getByRole('searchbox', { name: 'Filter writing' }).fill('');
    await expect(empty).toBeHidden();
  });
});

test('unpublished topic URLs return 404', async ({ request }) => {
  const missing = await request.get(url('two', 'topics/concurrency-performance/'));
  expect(missing.status()).toBe(404);
  const draft = await request.get(url('two', 'posts/hidden-draft/'));
  expect(draft.status()).toBe(404);
  const published = await request.get(url('two', 'topics/data-persistence/'));
  expect(published.status()).toBe(200);
});

test('Home links the brand and Writing to the right places', async ({ page }) => {
  await page.goto(url('two', 'about/'));
  await page.locator('header').getByRole('link', { name: 'Meet Mehta' }).click();
  await expect(page).toHaveURL(url('two'));
  await page.locator('header nav').getByRole('link', { name: 'Writing' }).click();
  await expect(page).toHaveURL(url('two', 'posts/'));
});
