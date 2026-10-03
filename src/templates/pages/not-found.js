// 404 page — also shown for old URLs from the previous site.

import { html } from '../../lib/html.js';
import { button } from '../components/ui.js';

export function notFoundPage() {
  return html`<section class="not-found">
  <div class="container not-found__inner">
    <p class="not-found__code">// ERROR 404</p>
    <h1 class="hero__title">This page doesn't exist (anymore).</h1>
    <p class="hero__text">The site was recently redesigned, so older links may point somewhere that moved. Try one of these instead:</p>
    <div class="button-row">
      ${button({ label: 'HOME', href: '/', variant: 'primary' })}
      ${button({ label: 'PROJECTS', href: '/projects/', variant: 'light' })}
      ${button({ label: 'SHADERS', href: '/shaders/', variant: 'light' })}
      ${button({ label: 'BLOG', href: '/blog/', variant: 'light' })}
    </div>
  </div>
</section>`;
}
