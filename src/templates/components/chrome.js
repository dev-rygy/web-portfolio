// Site header + footer — Figma "Page Header" (53:509) and "Footer" (60:1010).

import { html } from '../../lib/html.js';
import { socialLinks } from './ui.js';

export function siteHeader(site, activeNav) {
  return html`<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__brand" href="/" aria-label="${site.name} — home">
      <span class="site-header__name"><span class="site-header__name-text" data-typewriter>${site.name}</span><span class="site-header__cursor" aria-hidden="true"></span></span>
      <span class="site-header__role">// ${site.role}</span>
    </a>
    <div class="site-header__graphic" aria-hidden="true">
      <video class="site-header__video" autoplay muted loop playsinline preload="auto" poster="/assets/video/header-graphic.jpg">
        <source src="/assets/video/header-graphic.mp4" type="video/mp4">
      </video>
      <canvas class="site-header__noise" width="164" height="24"></canvas>
    </div>
    <button class="site-header__menu" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <ul>
        ${site.nav.map(
          (item) => html`<li><a class="nav-link${item.key === activeNav ? ' is-active' : ''}" href="${item.href}"${
            item.key === activeNav ? html` aria-current="page"` : ''
          }>${item.label}</a></li>`,
        )}
      </ul>
    </nav>
  </div>
</header>`;
}

export function siteFooter(site) {
  return html`<footer class="site-footer">
  <div class="container">
    <div class="site-footer__top">
      <div class="site-footer__about">
        <p class="site-footer__name">${site.name}</p>
        <p class="site-footer__blurb">${site.footer.blurb}</p>
      </div>
      <div class="site-footer__contact">
        <p class="site-footer__label">// Contact Info</p>
        <a class="site-footer__email" href="mailto:${site.email}">${site.email}</a>
        <p class="site-footer__location">${site.location}</p>
      </div>
      <div class="site-footer__availability">
        <p class="site-footer__label">// AVAILABILITY</p>
        <p class="site-footer__status"><span class="site-footer__dot" aria-hidden="true"></span>${site.footer.availability}</p>
        <p class="site-footer__note">${site.footer.availabilityNote}</p>
      </div>
    </div>
    <div class="site-footer__bottom">
      ${socialLinks(site.socials, 'text')}
    </div>
  </div>
</footer>`;
}
