// Minimal static server that mimics GitHub Pages for a project site served under /engineering-notes/.
// Usage: node tests/serve.mjs <dir> <port>
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const [dir, port] = [process.argv[2], Number(process.argv[3])];
const base = '/engineering-notes';
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.pdf': 'application/pdf',
};

function send(res, status, file) {
  res.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname !== base && !url.pathname.startsWith(`${base}/`)) return notFound(res);
  const rel = normalize(decodeURIComponent(url.pathname.slice(base.length))).replace(/^(\.\.[/\\])+/, '');
  let file = join(dir, rel);
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      res.writeHead(301, { location: `${url.pathname}/${url.search}` });
      return res.end();
    }
    file = join(file, 'index.html');
  }
  if (existsSync(file)) return send(res, 200, file);
  notFound(res);
}).listen(port, '127.0.0.1');

function notFound(res) {
  const page = join(dir, '404.html');
  if (existsSync(page)) return send(res, 404, page);
  res.writeHead(404);
  res.end('Not found');
}
