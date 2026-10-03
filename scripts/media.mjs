// Generates web-ready media from the originals in source-media/ (needs ffmpeg on PATH).
//
//   npm run media
//
//   source-media/header-graphic.gif   → assets/video/header-graphic.{mp4,jpg}
//   source-media/carousel/<name>.mp4  → assets/video/carousel/<name>.{mp4,jpg}
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
const OUT = path.join(ROOT, 'assets', 'video');
const MANIFEST = path.join(OUT, '.media-manifest.json');

function hasFfmpeg() {
  return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
}

function hash(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit' });
}

const jobs = [];

// Header motion graphic: looping GIF → small MP4 + poster frame.
const headerGif = path.join(SOURCE, 'header-graphic.gif');
if (fs.existsSync(headerGif)) {
  jobs.push({
    source: headerGif,
    outputs: ['header-graphic.mp4', 'header-graphic.jpg'],
    run() {
      const even = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
      ffmpeg(['-i', headerGif, '-vf', `${even},format=yuv420p`, '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', '-an', path.join(OUT, 'header-graphic.mp4')]);
      ffmpeg(['-i', headerGif, '-frames:v', '1', '-q:v', '3', path.join(OUT, 'header-graphic.jpg')]);
    },
  });
}

// Carousel clips: compress for the web (max 1280 wide, no audio, fast start) + poster frame.
const carouselDir = path.join(SOURCE, 'carousel');
if (fs.existsSync(carouselDir)) {
  for (const file of fs.readdirSync(carouselDir).filter((f) => /\.(mp4|mov|webm|m4v)$/i.test(f))) {
    const name = file.replace(/\.[^.]+$/, '');
    const source = path.join(carouselDir, file);
    jobs.push({
      source,
      outputs: [`carousel/${name}.mp4`, `carousel/${name}.jpg`],
      run() {
        fs.mkdirSync(path.join(OUT, 'carousel'), { recursive: true });
        ffmpeg([
          '-i', source,
          '-vf', "scale='min(1280,iw)':-2,format=yuv420p",
          '-c:v', 'libx264', '-crf', '28', '-preset', 'slow', '-profile:v', 'high',
          '-movflags', '+faststart', '-an',
          path.join(OUT, 'carousel', `${name}.mp4`),
        ]);
        ffmpeg(['-ss', '1', '-i', source, '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", '-q:v', '4', path.join(OUT, 'carousel', `${name}.jpg`)]);
      },
    });
  }
}

if (!hasFfmpeg()) {
  console.log('ffmpeg not found — skipping media generation (committed files in assets/video are used as-is).');
  process.exit(0);
}

fs.mkdirSync(OUT, { recursive: true });
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
let changed = 0;

for (const job of jobs) {
  const key = path.relative(ROOT, job.source).replace(/\\/g, '/');
  const digest = hash(job.source);
  const upToDate = manifest[key] === digest && job.outputs.every((o) => fs.existsSync(path.join(OUT, o)));
  if (upToDate) continue;
  process.stdout.write(`Encoding ${key} … `);
  job.run();
  manifest[key] = digest;
  changed++;
  console.log('done');
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(changed ? `Generated media for ${changed} source file(s).` : 'All media up to date.');
