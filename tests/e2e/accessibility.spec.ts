import { expect, test } from '@playwright/test';
import { url } from '../helpers/site';

test.describe('keyboard and focus', () => {
  test('skip link moves focus to main', async ({ page }) => {
    await page.goto(url('one'));
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('keyboard focus is visible on links and buttons', async ({ page }) => {
    await page.goto(url('one'));
    const visibleFocus = () =>
      page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const s = getComputedStyle(el);
        const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
        const ring = s.boxShadow !== 'none';
        const underline = s.textDecorationLine.includes('underline');
        return { tag: el.tagName, text: (el.textContent ?? '').trim().slice(0, 20), shown: outline || ring || underline };
      });
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const state = await visibleFocus();
      expect(state.shown, `${state.tag} "${state.text}" has no visible focus indicator`).toBe(true);
    }
  });
});

test.describe('names and labels', () => {
  test('header, search, theme, copy-link and code-copy buttons have accessible names', async ({ page }) => {
    await page.goto(url('one', 'posts/idempotency-keys/'));
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Footer' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Table of contents' })).toBeAttached();
    await expect(page.getByRole('button', { name: 'Search writing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle color theme' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy code to clipboard' })).toBeVisible();
  });

  test('mobile navigation is labelled', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(url('one'));
    await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
  });
});

test.describe('theme', () => {
  test('toggle switches the theme and persists after refresh', async ({ page }) => {
    await page.goto(url('one'));
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole('button', { name: 'Toggle color theme' }).click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    await page.getByRole('button', { name: 'Toggle color theme' }).click();
    await page.reload();
    await expect(html).not.toHaveClass(/dark/);
  });
});
