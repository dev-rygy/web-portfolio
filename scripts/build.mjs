// Builds the static site: content/ + src/ + assets/ → dist/
//
//   npm run build
//
// Everything in dist/ is plain HTML, CSS and JavaScript ready for GitHub Pages.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadContent } from '../src/lib/content.js';
import { excerpt, isoDate } from '../src/lib/format.js';
import { layout } from '../src/templates/layout.js';
import { contactPage } from '../src/templates/pages/contact.js';
import { elementsPage } from '../src/templates/pages/elements.js';
import { genericPage } from '../src/templates/pages/generic.js';
import { homePage } from '../src/templates/pages/home.js';
import { listPage } from '../src/templates/pages/list.js';
import { notFoundPage } from '../src/templates/pages/not-found.js';
import { projectPage } from '../src/templates/pages/project.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// Order matters: later files can override earlier ones.
const CSS_FILES = ['tokens.css', 'base.css', 'layout.css', 'components.css', 'pages.css'];
const JS_FILES = ['header.js', 'nav.js', 'media.js', 'carousel.js', 'contact.js', 'email.js'];

function write(relativePath, contents) {
  const target = path.join(DIST, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

/**
 * Mirror src → dest, copying only new/changed files and removing stale ones.
 * Assets are synced rather than wiped so files held open (e.g. a video streaming
 * in the dev preview on Windows) never break a rebuild.
 */
function syncDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const wanted = new Set();
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue; // e.g. .media-manifest.json
    wanted.add(entry.name.toLowerCase());
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      syncDir(from, to);
      continue;
    }
    const a = fs.statSync(from);
    const b = fs.existsSync(to) ? fs.statSync(to) : null;
    if (!b || b.size !== a.size || b.mtimeMs < a.mtimeMs) {
      try {
        fs.copyFileSync(from, to);
      } catch (error) {
        console.warn(`  ! could not update ${path.relative(ROOT, to)} (${error.code}) — it is probably open in another program`);
      }
    }
  }
  for (const entry of fs.readdirSync(dest, { withFileTypes: true })) {
    if (wanted.has(entry.name.toLowerCase())) continue;
    try {
      fs.rmSync(path.join(dest, entry.name), { recursive: true, force: true });
    } catch {
      /* file in use — it will be removed on a later build */
    }
  }
}

/** Remove everything in dist/ except the synced assets folder. */
function cleanDist() {
  fs.mkdirSync(DIST, { recursive: true });
  for (const entry of fs.readdirSync(DIST)) {
    if (entry.toLowerCase() === 'assets') continue;
    fs.rmSync(path.join(DIST, entry), { recursive: true, force: true });
  }
}

function concat(dir, files) {
  return files
    .map((file) => {
      const full = path.join(ROOT, dir, file);
      return fs.existsSync(full) ? `/* ${file} */\n${fs.readFileSync(full, 'utf8')}` : '';
    })
    .join('\n');
}

/** Neighbours in list order: prev = the item shown before it, next = the item after it. */
function neighbours(items, index) {
  const toLink = (item) => (item ? { href: item.url, title: item.title } : null);
  return { prev: toLink(items[index - 1]), next: toLink(items[index + 1]) };
}

export async function build({ quiet = false } = {}) {
  const started = Date.now();
  const content = loadContent(ROOT);
  const { site, projects, blogs, shaders } = content;

  // ---- Clean + static files ----------------------------------------------
  cleanDist();
  syncDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
  if (fs.existsSync(path.join(ROOT, 'CNAME'))) fs.copyFileSync(path.join(ROOT, 'CNAME'), path.join(DIST, 'CNAME'));

  const css = concat('src/css', CSS_FILES);
  const js = concat('src/js', JS_FILES);
  const version = crypto.createHash('sha1').update(css).update(js).digest('hex').slice(0, 10);
  write('css/site.css', css);
  write('js/site.js', js);

  // ---- Pages ---------------------------------------------------------------
  const pages = []; // { path, html, sitemap }
  const page = (urlPath, opts, { sitemap = true, lastmod } = {}) => {
    const file = urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath;
    write(file, layout({ site, path: urlPath, version, ...opts }));
    pages.push({ path: urlPath, sitemap, lastmod });
  };

  page('/', { title: '', nav: 'home', pageClass: 'page-home', body: homePage(content) });

  const lists = [
    { kind: 'projects', path: '/projects/', nav: 'projects', items: projects },
    { kind: 'shaders', path: '/shaders/', nav: 'shaders', items: shaders },
    { kind: 'blogs', path: '/blog/', nav: 'blog', items: blogs },
  ];
  for (const list of lists) {
    const intro = site.pages[list.nav];
    page(list.path, {
      title: intro.title,
      description: intro.intro,
      nav: list.nav,
      pageClass: `page-list page-${list.kind}`,
      body: listPage({ kind: list.kind, intro, items: list.items }),
    });
  }

  projects.forEach((project, index) => {
    page(
      project.url,
      {
        title: project.title,
        description: excerpt(project.summary || project.description || project.body),
        image: project.ogImage || (/\.(png|jpe?g|webp)$/i.test(project.thumbnail ?? '') ? project.thumbnail : undefined),
        type: 'article',
        nav: 'projects',
        pageClass: 'page-project',
        body: projectPage({ project, blogs, ...neighbours(projects, index) }),
      },
      { lastmod: isoDate(project.date) },
    );
  });

  for (const [kind, items, nav] of [['blogs', blogs, 'blog'], ['shaders', shaders, 'shaders']]) {
    items.forEach((item, index) => {
      page(
        item.url,
        {
          title: item.title,
          description: excerpt(item.summary || item.description || item.body),
          image: item.ogImage || (/\.(png|jpe?g|webp)$/i.test(item.thumbnail ?? '') ? item.thumbnail : undefined),
          type: 'article',
          nav,
          pageClass: `page-generic page-${kind}`,
          body: genericPage({ item, kind, ...neighbours(items, index) }),
        },
        { lastmod: isoDate(item.date) },
      );
    });
  }

  page('/contact/', {
    title: site.pages.contact.title,
    description: site.pages.contact.intro,
    nav: 'contact',
    pageClass: 'page-contact',
    emailjs: true,
    body: contactPage({ site, intro: site.pages.contact }),
  });

  page('/404.html', { title: 'Page not found', nav: '', pageClass: 'page-404', noindex: true, body: notFoundPage() }, { sitemap: false });

  // Style guide: published but hidden (noindex, not linked, not in sitemap, no analytics).
  page(
    '/elements.html',
    { title: 'Elements', nav: '', pageClass: 'page-elements', noindex: true, body: elementsPage(content) },
    { sitemap: false },
  );

  // ---- sitemap.xml + robots.txt -------------------------------------------
  const urls = pages
    .filter((p) => p.sitemap)
    .map((p) => `  <url><loc>${new URL(p.path, site.url).href}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`);

  if (!quiet) {
    console.log(`Built ${pages.length} pages into dist/ in ${Date.now() - started} ms`);
  }
  return { pages: pages.length };
}

// Run directly: `node scripts/build.mjs`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((error) => {
    console.error(`\n✖ Build failed\n${error.message}\n`);
    process.exit(1);
  });
}
