import { describe, expect, it } from 'vitest';
import { allPages } from '../helpers/site';
import { siteConfig } from '../../src/config/site';

const { websiteId, scriptUrl, hostUrl, domains } = siteConfig.analytics.umami;

describe('analytics', () => {
  it('every built page loads the Umami script exactly once, restricted to the live domain', () => {
    for (const [route, page] of Object.entries(allPages('two'))) {
      const scripts = page.querySelectorAll('script[data-website-id]');
      expect(scripts.length, route).toBe(1);
      expect(scripts[0].getAttribute('src'), route).toBe(scriptUrl);
      expect(scripts[0].getAttribute('data-website-id'), route).toBe(websiteId);
      expect(scripts[0].getAttribute('data-host-url'), route).toBe(hostUrl);
      expect(scripts[0].getAttribute('data-domains'), route).toBe(domains.join(','));
      expect(scripts[0].hasAttribute('defer'), route).toBe(true);
    }
  });
});

describe('search console', () => {
  it('every built page carries the Google verification tag', () => {
    for (const [route, page] of Object.entries(allPages('two'))) {
      const tags = page.querySelectorAll('meta[name="google-site-verification"]');
      expect(tags.length, route).toBe(1);
      expect(tags[0].getAttribute('content'), route).toBe(siteConfig.searchConsoleVerification);
    }
  });
});
