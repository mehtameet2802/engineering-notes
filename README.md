# Meet Mehta — Engineering Notes

A personal technical publication built with Astro, Tailwind CSS, and Pagefind. It is deployed to GitHub Pages at `https://mehtameet2802.github.io/engineering-notes/`.

## Publishing

1. Add a `.md` (or `.mdx`, when you need components) file to `src/content/articles/`.
2. Fill in the frontmatter: `title`, `description`, `date`, `topic`, `tags`, and optionally `featured`, `draft`, `updated`.
3. Open a pull request. Once the **test** check passes, merge it. Merging to `main` deploys the site through GitHub Actions.

`topic` must be one of the ids in `src/config/site.ts`. Drafts show in `npm run dev` only and are left out of production builds.

### How content drives the site

The site adapts to what is published, so there are no empty pages to maintain:

- **Home** shows the article marked `featured: true` (otherwise the newest one), then up to five other recent articles. With no published articles, only the introduction is shown.
- **Topics** with no published article are hidden, and their pages are not built.
- **The Topics directory** (`/topics/`) is linked in the navigation, indexable, and in the sitemap only once at least two topics have published articles. Below that it carries `noindex` and stays out of the sitemap. The threshold is `MIN_TOPICS_FOR_DIRECTORY` in `src/config/site.ts`.
- **Search** is hidden until at least one article is published. It uses the Pagefind index, which only exists after `npm run build`, so in `npm run dev` it explains that instead of returning results.

The sample article in `src/content/articles/` is a draft. Delete it or set `draft: false` before sharing the site as a portfolio.

## Configuration

- Site identity, navigation, social links, resume link, topics, and feature flags live in `src/config/site.ts`.
- The resume is hosted on FlowCV; change `social.resume.href` to point elsewhere.
- The About page portrait uses `src/assets/profile-light.jpg` (light theme) and `src/assets/profile-dark.jpg` (dark theme).
- The browser favicon is `public/favicon.svg` (with an ICO and PNG fallback). App icons and the web manifest are in `public/`.
- Color tokens live in `src/styles/global.css`; swap the `--primary*` values to change the accent.

Pages declare structured data (`WebSite`, `Person`, `BlogPosting`) and canonical URLs ending in `/`. Social-preview images and a `robots.txt` are intentionally not set up: the site lives under a subdirectory, where `robots.txt` is ignored. Submit `sitemap-index.xml` in Google Search Console instead.

## Commands

| Command                | Action                                                         |
| :--------------------- | :------------------------------------------------------------- |
| `npm run dev`          | Start the dev server (search needs a build)                    |
| `npm run build`        | Build to `dist/` and generate the Pagefind index               |
| `npm run preview`      | Preview the production build                                   |
| `npm test`             | Build the test fixtures, then run the static and browser tests |
| `npm run test:build`   | Build only the fixture sites into `dist-test/`                 |
| `npm run test:static`  | Run the Vitest tests on the built HTML                         |
| `npm run test:e2e`     | Run the Playwright browser tests                               |

## Tests

The suite builds the site against four small fixture content sets in `tests/fixtures/` (no articles, one article, three unfeatured articles, seven articles across two topics) by setting the optional `ARTICLES_DIR` environment variable. It then checks:

- **Static tests (Vitest):** content states, featured and latest rules, archive order, navigation and active states, canonical URLs, structured data, sitemap, titles, favicon links, heading order, labels, and alt text.
- **Browser tests (Playwright):** search, the archive filter, 404s, layout at 375, 768 and 1440px, the footer position, keyboard and accessibility behaviour, and theme persistence.

The browser tests use Google Chrome installed on your machine; no browser is downloaded. Test servers use ports 4501–4504 and 4510.

## Continuous integration

- **Tests** (`.github/workflows/test.yml`) runs `npm test` on every pull request, or by hand from the Actions tab (**Run workflow**).
- **Deploy** (`.github/workflows/deploy.yml`) builds and publishes to GitHub Pages on every push to `main`.
- `main` is protected: a pull request can only merge once the **test** check passes, and direct pushes are blocked. This also applies to repository admins.
