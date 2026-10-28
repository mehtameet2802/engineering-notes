import { expect, test, type Page } from '@playwright/test';
import { url } from '../helpers/site';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const ROUTES = ['', 'about/', 'posts/', 'posts/zeta-newest/', 'topics/', 'topics/reliability-apis/', 'does-not-exist/'];

async function metrics(page: Page) {
  return page.evaluate(() => {
    const footer = document.querySelector('footer')!.getBoundingClientRect();
    const main = document.querySelector('main')!.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      innerWidth: innerWidth,
      innerHeight: innerHeight,
      scrollWidth: doc.scrollWidth,
      scrollHeight: doc.scrollHeight,
      footerTop: footer.top + scrollY,
      footerBottom: footer.bottom + scrollY,
      mainBottom: main.bottom + scrollY,
    };
  });
}

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`/${route}: no horizontal overflow and exactly one H1`, async ({ page }) => {
        await page.goto(url('two', route));
        const m = await metrics(page);
        expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth);
        await expect(page.locator('h1')).toHaveCount(1);
      });
    }

    for (const route of ['posts/', 'topics/', 'does-not-exist/']) {
      test(`/${route} (short page): footer reaches the bottom with no blank area`, async ({ page }) => {
        await page.goto(url('none', route));
        const m = await metrics(page);
        expect(m.footerBottom).toBeGreaterThanOrEqual(m.innerHeight - 1);
        expect(Math.abs(m.scrollHeight - m.footerBottom)).toBeLessThanOrEqual(1);
        if (vp.name !== 'mobile') {
          expect(m.scrollHeight).toBeLessThanOrEqual(m.innerHeight + 1);
        }
      });
    }

    test('long page: footer follows the content', async ({ page }) => {
      await page.goto(url('two', 'posts/'));
      const m = await metrics(page);
      expect(m.scrollHeight).toBeGreaterThan(m.innerHeight);
      expect(m.footerTop).toBeGreaterThanOrEqual(m.mainBottom - 1);
      expect(m.footerTop - m.mainBottom).toBeLessThanOrEqual(1);
      expect(Math.abs(m.scrollHeight - m.footerBottom)).toBeLessThanOrEqual(1);
    });

    if (vp.name === 'mobile') {
      test('footer content is not covered by the bottom navigation', async ({ page }) => {
        await page.goto(url('two', 'posts/'));
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
        const { copyrightBottom, navTop } = await page.evaluate(() => {
          const copyright = [...document.querySelectorAll('footer p')].at(-1)!.getBoundingClientRect();
          const nav = document.querySelector('nav[aria-label="Mobile"]')!.getBoundingClientRect();
          return { copyrightBottom: copyright.bottom, navTop: nav.top };
        });
        expect(copyrightBottom).toBeLessThanOrEqual(navTop);
      });

      test('mobile navigation shows only the intended links and the header nav is hidden', async ({ page }) => {
        await page.goto(url('two'));
        await expect(page.locator('header nav[aria-label="Primary"]')).toBeHidden();
        const links = page.locator('nav[aria-label="Mobile"] a');
        await expect(links).toHaveText(['Writing', 'Topics', 'About', 'GitHub', 'LinkedIn', 'Resume']);
        await expect(links.first()).toBeVisible();
      });
    } else {
      test('header links are visible, inside the viewport and do not overlap', async ({ page }) => {
        await page.goto(url('two'));
        await expect(page.locator('nav[aria-label="Mobile"]')).toBeHidden();
        const links = page.locator('header nav[aria-label="Primary"] a');
        await expect(links).toHaveText(['Writing', 'Topics', 'About', 'GitHub', 'LinkedIn', 'Resume']);
        const boxes = await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
        const controls = await page
          .locator('header [data-search-open], header [data-theme-toggle]')
          .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
        const all = [...boxes, ...controls].sort((a, b) => a.left - b.left);
        for (const box of all) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(vp.width);
        }
        for (let i = 1; i < all.length; i++) expect(all[i].left).toBeGreaterThanOrEqual(all[i - 1].right);
      });
    }
  });
}

test.describe('images', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name}: About images load and have alt text`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(url('one', 'about/'));
      await page.waitForLoadState('load');
      const images = await page.locator('img').evaluateAll((els) =>
        (els as HTMLImageElement[]).map((img) => ({ src: img.currentSrc, alt: img.alt, w: img.naturalWidth, shown: img.offsetParent !== null })),
      );
      expect(images.length).toBeGreaterThan(0);
      for (const img of images) {
        expect(img.alt.length, img.src).toBeGreaterThan(5);
        expect(img.w, img.src).toBeGreaterThan(0);
      }
      expect(images.filter((i) => i.shown)).toHaveLength(1);
    });
  }
});
