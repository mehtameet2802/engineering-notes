import { expect, test } from '@playwright/test';
import { devUrl } from '../helpers/site';

test('the development server does not load analytics', async ({ page }) => {
  await page.goto(devUrl());
  await expect(page.locator('script[data-website-id]')).toHaveCount(0);
});
