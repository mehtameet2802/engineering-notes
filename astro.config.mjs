// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import { siteConfig, MIN_TOPICS_FOR_DIRECTORY } from './src/config/site.ts';

// Counts topics with at least one published article, reading frontmatter directly
// because content collections are not available while the config is evaluated.
function countPublishedTopics() {
  const dir = new URL('./src/content/articles/', import.meta.url);
  const topics = new Set();
  for (const file of readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const frontmatter = readFileSync(new URL(file, dir), 'utf8').split(/^---\s*$/m)[1] ?? '';
    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;
    const topic = frontmatter.match(/^topic:\s*(\S+)/m)?.[1];
    if (topic) topics.add(topic);
  }
  return topics.size;
}

const topicsDirectoryPublic = countPublishedTopics() >= MIN_TOPICS_FOR_DIRECTORY;

export default defineConfig({
  site: siteConfig.url,
  base: siteConfig.base,
  integrations: [mdx(), sitemap({
      filter: (page) => topicsDirectoryPublic || !page.endsWith('/topics/'),
    })],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
