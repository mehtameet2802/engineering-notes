export const topicIds = [
  'systems-architecture',
  'software-design',
  'data-persistence',
  'concurrency-performance',
  'reliability-apis',
  'problem-solving',
  'engineering-lessons',
] as const;

export type TopicId = (typeof topicIds)[number];

/** Topics need this many published topics before the directory is linked, indexed and put in the sitemap. */
export const MIN_TOPICS_FOR_DIRECTORY = 2;

export const siteConfig = {
  name: 'Meet Mehta',
  subtitle: 'Software Engineer',
  title: 'Meet Mehta — Engineering Notes',
  description:
    'Writing about software systems, design, problem solving, and things I learn while building and understanding software.',
  author: 'Meet Mehta',
  intro:
    'Writing about software systems, design, problem solving, and things I learn while building and understanding software.',
  about: {
    paragraphs: [
      'I’m a software engineer interested in understanding how software systems work and why engineering decisions are made.',
      'I write about software design, system behavior, databases, concurrency, APIs, problem solving, and other areas I’m learning or working with.',
      'This site is the place those notes live, written clearly enough that someone else can follow the reasoning too.',
    ],
  },
  url: 'https://mehtameet2802.github.io',
  base: '/engineering-notes',
  paths: { posts: '/posts' },
  footerTagline: 'Software engineering writing, notes, and technical explorations.',
  locale: 'en',
  social: {
    github: {
      label: 'GitHub',
      href: 'https://github.com/mehtameet2802',
      handle: 'github.com/mehtameet2802',
    },
    linkedin: {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/mehtameet2802',
      handle: 'linkedin.com/in/mehtameet2802',
    },
    leetcode: {
      label: 'LeetCode',
      href: 'https://leetcode.com/u/mehtameet2802/',
      handle: 'leetcode.com/u/mehtameet2802',
    },
    resume: {
      label: 'Resume',
      href: 'https://flowcv.com/resume/8v0d7ou9dp',
      handle: 'flowcv.com/resume/8v0d7ou9dp',
      description: 'Backend and full-stack experience, one page',
    },
  },
  navigation: [
    { label: 'Writing', href: '/posts', id: 'writing', icon: 'article' },
    { label: 'Topics', href: '/topics', id: 'topics', icon: 'tag', topicsOnly: true },
    { label: 'About', href: '/about', id: 'about', icon: 'book' },
  ],
  externalNavigation: [
    { label: 'GitHub', id: 'github', icon: 'github', social: 'github' },
    { label: 'LinkedIn', id: 'linkedin', icon: 'linkedin', social: 'linkedin' },
    { label: 'Resume', id: 'resume', icon: 'article', social: 'resume' },
  ],
  topics: [
    {
      id: 'systems-architecture',
      title: 'Systems & Architecture',
      description:
        'System design, scalability, communication patterns, caching, queues, and architectural trade-offs.',
    },
    {
      id: 'software-design',
      title: 'Software Design',
      description: 'Object-oriented design, modularity, interfaces, abstractions, and maintainability.',
    },
    {
      id: 'data-persistence',
      title: 'Data & Persistence',
      description: 'Databases, querying, indexing, data models, caching, and persistence patterns.',
    },
    {
      id: 'concurrency-performance',
      title: 'Concurrency & Performance',
      description: 'Threads, processes, async execution, runtime behavior, and performance trade-offs.',
    },
    {
      id: 'reliability-apis',
      title: 'Reliability & APIs',
      description: 'API design, retries, idempotency, rate limiting, failures, and service reliability.',
    },
    {
      id: 'problem-solving',
      title: 'Problem Solving',
      description: 'Algorithms, data structures, reasoning patterns, and problem-solving approaches.',
    },
    {
      id: 'engineering-lessons',
      title: 'Engineering Lessons',
      description:
        'Practical lessons, mental models, design trade-offs, debugging, and things learned while building.',
    },
  ] satisfies Array<{ id: TopicId; title: string; description: string }>,
  features: {
    newsletter: false,
    ogImages: false,
    search: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function withBase(path: string): string {
  const base = siteConfig.base.replace(/\/$/, '');
  if (!path || path === '/') return base || '/';
  if (path.startsWith('http')) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Absolute URL with a trailing slash, matching the canonical URLs and sitemap entries. */
export function canonicalUrl(path: string): string {
  const url = absoluteUrl(path);
  return url.endsWith('/') ? url : `${url}/`;
}

export function absoluteUrl(path: string): string {
  const normalized = withBase(path);
  if (normalized.startsWith('http')) return normalized;
  return new URL(normalized, siteConfig.url).toString();
}

/**
 * Internal links first, then external social links, all resolved to final hrefs.
 * Topics is listed only when `topics` is true, i.e. enough topics have published articles.
 */
export function getNavItems({ topics = false }: { topics?: boolean } = {}) {
  const internal = siteConfig.navigation
    .filter((item) => topics || !('topicsOnly' in item))
    .map((item) => ({ ...item, href: withBase(item.href), external: false }));
  const external = siteConfig.externalNavigation.map((item) => ({
    ...item,
    href: siteConfig.social[item.social].href,
    external: true,
  }));
  return { internal, external, all: [...internal, ...external] };
}

/** The RSS feed is not linked here; it is advertised via <link rel="alternate"> in the page head. */
export function getFooterLinks(options: { topics?: boolean } = {}) {
  return getNavItems(options).all;
}

export function getTopic(id: TopicId) {
  return siteConfig.topics.find((topic) => topic.id === id)!;
}
