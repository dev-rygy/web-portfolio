// Page shell: <head>, header, main, footer, scripts.

import { html, raw } from '../lib/html.js';
import { siteFooter, siteHeader } from './components/chrome.js';

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;700;800&display=swap';
const FONT_AWESOME_URL = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';
const EMAILJS_URL = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';

// Runs before first paint: flags JS support and whether the header typewriter should play,
// so the name can be hidden until it is typed (no flash of the full name).
const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{if(!sessionStorage.getItem('rc-typed')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('will-type');}}catch(e){}})();`;

/**
 * @param {object} opts
 * @param {object} opts.site       site.json
 * @param {string} opts.title      page title (site name appended)
 * @param {string} opts.description meta description
 * @param {string} opts.path       URL path, e.g. "/projects/"
 * @param {string} opts.nav        active nav key
 * @param {*}      opts.body       main content (html)
 * @param {string} [opts.pageClass]
 * @param {string} [opts.image]    Open Graph image path
 * @param {boolean}[opts.noindex]  hide from search + analytics
 * @param {boolean}[opts.emailjs]  load the EmailJS SDK
 * @param {string} opts.version    cache-busting token
 */
export function layout({ site, title, description, path, nav, body, pageClass = '', image, noindex = false, emailjs = false, version, type = 'website' }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.role}`;
  const url = new URL(path, site.url).href;
  const ogImage = image || site.ogImage;
  const ogImageUrl = ogImage ? new URL(ogImage, site.url).href : '';
  const analytics = site.goatcounter && !noindex;

  return `<!doctype html>
${html`<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fullTitle}</title>
  <meta name="description" content="${description || site.description}">
  ${noindex ? raw('<meta name="robots" content="noindex, nofollow">') : html`<link rel="canonical" href="${url}">`}
  <meta name="theme-color" content="#313131">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${title || site.name}">
  <meta property="og:description" content="${description || site.description}">
  <meta property="og:url" content="${url}">
  ${ogImageUrl ? html`<meta property="og:image" content="${ogImageUrl}">
  <meta name="twitter:image" content="${ogImageUrl}">` : ''}
  <meta name="twitter:card" content="${ogImageUrl ? 'summary_large_image' : 'summary'}">
  <link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONT_URL}">
  <link rel="stylesheet" href="${FONT_AWESOME_URL}" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="/css/site.css?v=${version}">
  <script>${raw(HEAD_SCRIPT)}</script>
</head>
<body class="${pageClass}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${siteHeader(site, nav)}
  <main id="main">
${body}
  </main>
  ${siteFooter(site)}
  ${emailjs ? html`<script src="${EMAILJS_URL}" defer></script>` : ''}
  <script src="/js/site.js?v=${version}" defer></script>
  ${analytics
    ? html`<script data-goatcounter="https://${site.goatcounter}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`
    : ''}
</body>
</html>`}
`;
}
