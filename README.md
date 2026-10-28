# Meet Mehta — Software Engineering

A personal technical publication built with Astro, Tailwind CSS, and Pagefind.

## Publishing

1. Add a `.md` (or `.mdx`, when you need components) file to `src/content/articles/`.
2. Fill in the frontmatter: `title`, `description`, `date`, `topic`, `tags`, and optionally `featured`, `draft`, `updated`.
3. Commit and push to `main`. GitHub Actions builds and deploys to GitHub Pages.

`topic` must be one of the ids in `src/config/site.ts`. Drafts show in `npm run dev` only.

## Configuration

Site identity, navigation, social links, topics, and feature flags live in `src/config/site.ts`.
Color tokens live in `src/styles/global.css`; swap the `--primary*` values to change the accent.

## Commands

| Command           | Action                                              |
| :---------------- | :-------------------------------------------------- |
| `npm run dev`     | Start the dev server (search needs a build)         |
| `npm run build`   | Build to `dist/` and generate the Pagefind index    |
| `npm run preview` | Preview the production build                        |
