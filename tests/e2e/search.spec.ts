import { expect, test } from '@playwright/test';
import { devUrl, url } from '../helpers/site';

test.describe('search', () => {
  test('is hidden when there are no published articles', async ({ page }) => {
    await page.goto(url('none'));
    await expect(page.locator('[data-search-open]')).toHaveCount(0);
    await expect(page.locator('#search-dialog')).toHaveCount(0);
  });

  test('finds the article for "idempotency" and highlights the match', async ({ page }) => {
    await page.goto(url('one'));
    await page.getByRole('button', { name: 'Search writing' }).click();
    await page.getByRole('searchbox', { name: 'Search query' }).fill('idempotency');
    const result = page.locator('#search-dialog [data-search-results] a').first();
    await expect(result).toContainText('Why Idempotency Keys Matter');
    await expect(result.locator('mark').first()).toBeVisible();
    await expect(result.locator('mark').first()).toHaveText(/idempotency/i);
    await result.click();
    await expect(page).toHaveURL(/\/posts\/idempotency-keys\/?$/);
  });

  test('shows a "no results" message for an unknown query', async ({ page }) => {
    await page.goto(url('one'));
    await page.getByRole('button', { name: 'Search writing' }).click();
    await page.getByRole('searchbox', { name: 'Search query' }).fill('zzzzqqq');
    await expect(page.locator('#search-dialog')).toContainText('No matching writing found.');
  });

  test('closes with Escape', async ({ page }) => {
    await page.goto(url('one'));
    await page.getByRole('button', { name: 'Search writing' }).click();
    await expect(page.locator('#search-dialog')).toHaveJSProperty('open', true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-dialog')).toHaveJSProperty('open', false);
  });

  test('closes with the close button', async ({ page }) => {
    await page.goto(url('one'));
    await page.getByRole('button', { name: 'Search writing' }).click();
    await page.getByRole('button', { name: 'Close search' }).click();
    await expect(page.locator('#search-dialog')).toHaveJSProperty('open', false);
  });

  test('development mode explains the production-only index instead of failing', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(devUrl());
    await page.getByRole('button', { name: 'Search writing' }).click();
    await page.getByRole('searchbox', { name: 'Search query' }).fill('draft');
    await expect(page.locator('#search-dialog')).toContainText('Search index is only available in the production build.');
    expect(errors).toEqual([]);
  });
});

test.describe('development mode', () => {
  test('shows draft articles', async ({ page }) => {
    await page.goto(devUrl('posts/'));
    await expect(page.locator('article h2')).toHaveText([/Draft Sample/]);
  });
});
