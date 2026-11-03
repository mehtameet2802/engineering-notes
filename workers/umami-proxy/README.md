# Umami proxy Worker

A reference copy of the Cloudflare Worker behind `https://stats.hemaelectric.in`. Cloudflare runs the version
pasted into its dashboard; this file is not deployed by the site build, so keep the two in sync by hand.

## What it does

The blog loads its analytics script and sends tracking calls to this first-party address instead of an Umami domain,
so common ad-blocker lists do not match them.

- `GET /script.js` serves Umami's tracker from `https://cloud.umami.is/script.js`.
- `POST /api/send` relays tracking calls to `https://gateway.umami.is/api/send`, forwarding the visitor's IP and
  user agent plus the `x-umami-*` headers the tracker sends.
- `OPTIONS /api/send` answers the browser's CORS preflight, allowing only `https://mehtameet2802.github.io`.

The site side lives in `siteConfig.analytics.umami` (`src/config/site.ts`) and `src/components/Analytics.astro`.

## Redeploying

1. Cloudflare dashboard, Workers & Pages, `umami-proxy`, Edit code.
2. Replace the code with `index.js` and Deploy.
3. Custom domain: `stats.hemaelectric.in` (Settings, Domains & Routes). Do not enable Cloudflare Access on it, or the
   tracker cannot reach the Worker.

If Umami adds another `x-umami-*` request header, the browser console shows a CORS error naming it; add it to
`UMAMI_HEADERS`.
