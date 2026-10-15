import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../game/dist/', import.meta.url));
const port = Number(process.env.PORT || 4317);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  const target = resolve(root, '.' + (path === '/' ? '/index.html' : path));
  if (!target.startsWith(resolve(root) + sep)) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    const file = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : file);
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'EISDIR') console.error(error);
    res.writeHead(404); res.end('Not found');
  }
});
server.on('error', error => {
  console.error(`Cannot start preview (${error.code}). Set PORT to an available port and retry.`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
