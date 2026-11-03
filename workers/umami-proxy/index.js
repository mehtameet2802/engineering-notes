const ALLOWED_ORIGIN = 'https://mehtameet2802.github.io';
const UMAMI_HEADERS = ['x-umami-website-id', 'x-umami-hostname', 'x-umami-cache'];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': ['content-type', ...UMAMI_HEADERS].join(', '),
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };

    if (url.pathname === '/script.js' && request.method === 'GET') {
      const upstream = await fetch('https://cloud.umami.is/script.js');
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (url.pathname === '/api/send') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      if (request.method === 'POST') {
        const headers = {
          'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
          'User-Agent': request.headers.get('User-Agent') ?? '',
          'X-Forwarded-For': request.headers.get('CF-Connecting-IP') ?? '',
        };
        for (const name of UMAMI_HEADERS) {
          const value = request.headers.get(name);
          if (value) headers[name] = value;
        }

        const upstream = await fetch('https://gateway.umami.is/api/send', {
          method: 'POST',
          headers,
          body: request.body,
        });
        const response = new Response(upstream.body, upstream);
        for (const [name, value] of Object.entries(cors)) response.headers.set(name, value);
        return response;
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
