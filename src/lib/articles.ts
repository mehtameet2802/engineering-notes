import { getCollection, type CollectionEntry } from 'astro:content';
import { getTopic, siteConfig, type TopicId } from '../config/site';

export type Article = CollectionEntry<'articles'>;

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection('articles', ({ data }) => {
    if (data.draft && import.meta.env.PROD) return false;
    return true;
  });
  return articles.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function articlePath(article: Article): string {
  return `${siteConfig.paths.posts}/${article.id.replace(/\.mdx?$/, '')}`;
}

export function getFeaturedArticle(articles: Article[]): Article | undefined {
  return articles.find((article) => article.data.featured) ?? articles[0];
}

export function articlesByTopic(articles: Article[], topic: TopicId): Article[] {
  return articles.filter((article) => article.data.topic === topic);
}

export function getTopicCounts(articles: Article[]) {
  return siteConfig.topics.map((topic, index) => {
    const topicArticles = articlesByTopic(articles, topic.id);
    return {
      ...topic,
      index: index + 1,
      count: topicArticles.length,
      featured: [...topicArticles.filter((a) => a.data.featured), ...topicArticles.filter((a) => !a.data.featured)].slice(0, 2),
    };
  });
}

export function relatedArticles(article: Article, articles: Article[], limit = 3): Article[] {
  const others = articles.filter((item) => item.id !== article.id);
  const scored = others.map((item) => {
    let score = 0;
    if (item.data.topic === article.data.topic) score += 3;
    const overlap = item.data.tags.filter((tag) => article.data.tags.includes(tag)).length;
    score += overlap;
    return { item, score };
  });
  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.data.date.valueOf() - a.item.data.date.valueOf())
    .slice(0, limit)
    .map(({ item }) => item);
}

export function neighbors(article: Article, articles: Article[]) {
  const chronological = [...articles].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  const index = chronological.findIndex((item) => item.id === article.id);
  return {
    previous: index > 0 ? chronological[index - 1] : undefined,
    next: index >= 0 && index < chronological.length - 1 ? chronological[index + 1] : undefined,
  };
}

export { getTopic };

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
