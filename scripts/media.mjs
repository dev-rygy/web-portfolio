// Generates web-ready media from the originals in source-media/ (needs ffmpeg on PATH).
//
//   npm run media
//
//   source-media/header-graphic.gif          → assets/video/header-graphic.{mp4,jpg}
//   source-media/carousel/<name>.mp4         → assets/video/carousel/<name>.{mp4,jpg}
//   source-media/thumbnails/<name>.mp4       → assets/video/thumbs/<name>.{mp4,jpg}   (8 s card loop, 640 wide)
//   source-media/images/<folder>/<name>.gif  → assets/images/<folder>/<name>.loop.{mp4,jpg}   (.mp4/.mov/.webm also accepted)
//
// GIFs become silent looping MP4s (often 20–50× smaller). Reference them in content as
// "/assets/images/<folder>/<name>.loop.mp4" — files ending in .loop.mp4 play like a GIF.
//
// Outputs are committed, so the site builds without ffmpeg. A manifest of source hashes
// means only new or changed files are re-encoded. Originals are never modified.

import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'source-media');
const VIDEO_OUT = path.join(ROOT, 'assets', 'video');
const MANIFEST = path.join(VIDEO_OUT, '.media-manifest.json');

const EVEN = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
const MAX_1280 = "scale='min(1280,iw)':-2";

function hasFfmpeg() {
  return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
}

function hash(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit' });
}

function filesIn(dir, pattern, { recursive = false } = {}) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive })
    .filter((entry) => entry.isFile() && pattern.test(entry.name))
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name));
}

/** Silent, web-optimised H.264 MP4 (+faststart so it streams). */
function encodeMp4(input, output, { filter = MAX_1280, crf = 28, extra = [] } = {}) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  ffmpeg([...extra, '-i', input, '-vf', `${filter},format=yuv420p`, '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-movflags', '+faststart', '-an', output]);
}

function poster(input, output, { at = 0, filter = MAX_1280 } = {}) {
  ffmpeg(['-ss', String(at), '-i', input, '-frames:v', '1', '-vf', filter, '-q:v', '4', output]);
}

const jobs = [];

// Header motion graphic: looping GIF → small MP4 + poster frame.
const headerGif = path.join(SOURCE, 'header-graphic.gif');
if (fs.existsSync(headerGif)) {
  const mp4 = path.join(VIDEO_OUT, 'header-graphic.mp4');
  const jpg = path.join(VIDEO_OUT, 'header-graphic.jpg');
  jobs.push({
    source: headerGif,
    outputs: [mp4, jpg],
    run() {
      encodeMp4(headerGif, mp4, { filter: EVEN, crf: 24 });
      poster(headerGif, jpg, { filter: EVEN });
    },
  });
}

// Carousel clips: compressed full-length copies + poster frame.
for (const source of filesIn(path.join(SOURCE, 'carousel'), /\.(mp4|mov|webm|m4v)$/i)) {
  const name = path.basename(source).replace(/\.[^.]+$/, '');
  const mp4 = path.join(VIDEO_OUT, 'carousel', `${name}.mp4`);
  const jpg = path.join(VIDEO_OUT, 'carousel', `${name}.jpg`);
  jobs.push({
    source,
    outputs: [mp4, jpg],
    run() {
      encodeMp4(source, mp4);
      poster(source, jpg, { at: 1 });
    },
  });
}

// Card thumbnails: short, small loops so cards stay light even when several play at once.
for (const source of filesIn(path.join(SOURCE, 'thumbnails'), /\.(mp4|mov|webm|m4v)$/i)) {
  const name = path.basename(source).replace(/\.[^.]+$/, '');
  const mp4 = path.join(VIDEO_OUT, 'thumbs', `${name}.mp4`);
  const jpg = path.join(VIDEO_OUT, 'thumbs', `${name}.jpg`);
  jobs.push({
    source,
    outputs: [mp4, jpg],
    run() {
      const small = "scale='min(640,iw)':-2";
      encodeMp4(source, mp4, { filter: small, crf: 30, extra: ['-t', '8'] });
      poster(source, jpg, { at: 1, filter: small });
    },
  });
}

// GIFs (or GIF-style clips exported as video) anywhere under source-media/images
// → silent looping MP4 next to the other images.
const loopRoot = path.join(SOURCE, 'images');
const LOOP_SOURCE = /\.(gif|mp4|mov|webm|m4v)$/i;
for (const source of filesIn(loopRoot, LOOP_SOURCE, { recursive: true })) {
  const relative = path.relative(loopRoot, source).replace(LOOP_SOURCE, '');
  const mp4 = path.join(ROOT, 'assets', 'images', `${relative}.loop.mp4`);
  const jpg = path.join(ROOT, 'assets', 'images', `${relative}.loop.jpg`);
  jobs.push({
    source,
    outputs: [mp4, jpg],
    run() {
      encodeMp4(source, mp4, { crf: 26 });
      poster(source, jpg, { at: 1 }); // first GIF frames are often black fade-ins
    },
  });
}

if (!hasFfmpeg()) {
  console.log('ffmpeg not found — skipping media generation (committed files in assets/ are used as-is).');
  process.exit(0);
}

fs.mkdirSync(VIDEO_OUT, { recursive: true });
const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const manifest = {};
let changed = 0;

for (const job of jobs) {
  const key = path.relative(ROOT, job.source).replace(/\\/g, '/');
  const digest = hash(job.source);
  manifest[key] = digest;
  if (previous[key] === digest && job.outputs.every((o) => fs.existsSync(o))) continue;
  process.stdout.write(`Encoding ${key} … `);
  job.run();
  changed++;
  console.log('done');
}

// Only sources that still exist are kept in the manifest.
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(changed ? `Generated media for ${changed} source file(s).` : 'All media up to date.');
