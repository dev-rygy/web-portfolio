// Local preview with auto-rebuild and live reload.
//
//   npm run dev        → http://localhost:4321
//
// Rebuilds dist/ whenever content/, src/, assets/ or CNAME change, then reloads open tabs.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4321;
const WATCH = ['content', 'src', 'assets'];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const RELOAD_SNIPPET = `<script>new EventSource('/__reload').onmessage=()=>location.reload();</script>`;
const clients = new Set();

// Each build runs in a fresh Node process so template edits are always picked up.
let building = false;
let queued = false;
function rebuild() {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { cwd: ROOT, stdio: 'inherit' });
  child.on('exit', (code) => {
    building = false;
    if (code === 0) for (const res of clients) res.write('data: reload\n\n');
    if (queued) {
      queued = false;
      rebuild();
    }
  });
}

let timer;
for (const dir of WATCH) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  fs.watch(full, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}

/** Serve a file with HTTP range support (needed for <video> seeking). */
function sendFile(req, res, file, status = 200) {
  const ext = path.extname(file).toLowerCase();
  const type = TYPES[ext] || 'application/octet-stream';

  if (ext === '.html') {
    const body = fs.readFileSync(file, 'utf8').replace('</body>', `${RELOAD_SNIPPET}</body>`);
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(body);
    return;
  }

  const { size } = fs.statSync(file);
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Assets are served straight from assets/ so open video streams never lock files in dist/.
  const pathname = decodeURIComponent(url.pathname);
  const base = pathname.startsWith('/assets/') ? ROOT : DIST;
  let file = path.join(base, pathname);
  if (!file.startsWith(base)) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');

  if (fs.existsSync(file)) {
    sendFile(req, res, file);
  } else {
    // Mirror GitHub Pages: unknown paths get 404.html.
    const notFound = path.join(DIST, '404.html');
    if (fs.existsSync(notFound)) sendFile(req, res, notFound, 404);
    else res.writeHead(404).end('Not found');
  }
});

rebuild();
server.listen(PORT, () => {
  console.log(`\nDev server running at http://localhost:${PORT}  (Ctrl+C to stop)\n`);
});
