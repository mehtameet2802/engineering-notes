import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { siteConfig, absoluteUrl, withBase } from '../config/site';
import { articlePath, getPublishedArticles } from '../lib/articles';

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: absoluteUrl('/'),
    stylesheet: withBase('/rss/styles.xsl'),
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.date,
      link: absoluteUrl(articlePath(article)),
      categories: [article.data.topic, ...article.data.tags],
    })),
  });
}
