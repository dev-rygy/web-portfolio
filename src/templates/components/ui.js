// Reusable UI pieces matching the Figma "Desktop Components" section.

import { cx, escapeHtml, html, raw } from '../../lib/html.js';
import { mediaKind, youtubeId } from '../../lib/format.js';

/** Font Awesome icon (decorative). */
export function icon(name, { brand = false } = {}) {
  return html`<i class="${brand ? 'fa-brands' : 'fa-solid'} fa-${name}" aria-hidden="true"></i>`;
}

/**
 * Button — Figma "Button" (Look=Colored → primary, Look=White → light).
 * Renders an <a> when href is given, otherwise a <button>.
 */
export function button({ label, href, variant = 'primary', iconName, type = 'button', download, external, className, attrs = '' }) {
  const classes = cx('button', `button--${variant}`, className);
  const content = html`<span>${label}</span>${iconName ? icon(iconName) : ''}`;
  if (href) {
    return html`<a class="${classes}" href="${href}"${download ? raw(` download`) : ''}${
      external ? raw(' target="_blank" rel="noopener"') : ''
    }${raw(attrs ? ` ${attrs}` : '')}>${content}</a>`;
  }
  return html`<button class="${classes}" type="${type}"${raw(attrs ? ` ${attrs}` : '')}>${content}</button>`;
}

/**
 * Display Chip — Figma "Display Chip".
 * look 'tag'  → Look=Without Outline (grey role chip on cards)
 * look 'tool' → Look=With Outline (white toolset chip)
 */
export function chip(text, look = 'tag') {
  return html`<span class="chip chip--${look}">${text}</span>`;
}

export const STATUSES = {
  shipped: 'SHIPPED',
  prototype: 'PROTOTYPE',
  awaiting: 'AWAITING PUBLICATION',
};

/** Status Chip — Figma "Status Chip". */
export function statusChip(status) {
  if (!status || !STATUSES[status]) return '';
  return html`<span class="status-chip status-chip--${status}"><span class="status-chip__dot" aria-hidden="true"></span>${STATUSES[status]}</span>`;
}

/** Section Heading — green heading with an 80px underline. Pass {html:true} when text is already HTML. */
export function sectionHeading(text, { tag = 'h2', id, html: isHtml = false } = {}) {
  const content = isHtml ? raw(text) : text;
  return html`<div class="section-heading"${id ? raw(` id="${escapeHtml(id)}"`) : ''}>${raw(`<${tag} class="section-heading__text">`)}${content}${raw(`</${tag}>`)}<span class="section-heading__line" aria-hidden="true"></span></div>`;
}

/** Page Intro — grey band with page title on the left and a description on the right. */
export function pageIntro({ title, intro }) {
  return html`<section class="page-intro">
  <div class="container page-intro__inner">
    <h1 class="page-intro__title">${title}</h1>
    ${intro ? html`<p class="page-intro__text">${intro}</p>` : ''}
  </div>
</section>`;
}

/** Title bar used at the top of project / generic pages ("Project Name" frame). */
export function titleBar(title) {
  return html`<section class="title-bar"><div class="container"><h1 class="title-bar__text">${title}</h1></div></section>`;
}

/**
 * Media — image, video file, YouTube embed, or the checkerboard placeholder when no src.
 * `autoplay` = silent looping thumbnail that plays only while on screen (see js/media.js).
 */
export function media({ src, alt = '', poster, autoplay = false, controls = false, className, eager = false } = {}) {
  const kind = mediaKind(src);
  const classes = cx('media', className, !kind && 'media--placeholder');

  if (!kind) {
    return html`<div class="${classes}" role="img" aria-label="${alt || 'Media placeholder'}"></div>`;
  }
  if (kind === 'youtube') {
    const id = youtubeId(src);
    return html`<div class="${classes} media--embed"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${
      alt || 'YouTube video'
    }" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  }
  if (kind === 'video') {
    if (autoplay) {
      return html`<div class="${classes}"><video class="media__video" data-autoplay muted loop playsinline preload="none"${
        poster ? raw(` poster="${escapeHtml(poster)}"`) : ''
      } aria-label="${alt}"><source src="${src}" type="video/${src.endsWith('.webm') ? 'webm' : 'mp4'}"></video></div>`;
    }
    return html`<div class="${classes}"><video class="media__video"${controls ? raw(' controls') : raw(' muted loop autoplay')} playsinline preload="metadata"${
      poster ? raw(` poster="${escapeHtml(poster)}"`) : ''
    } aria-label="${alt}"><source src="${src}" type="video/${src.endsWith('.webm') ? 'webm' : 'mp4'}"></video></div>`;
  }
  return html`<div class="${classes}"><img class="media__img" src="${src}" alt="${alt}"${eager ? '' : raw(' loading="lazy"')} decoding="async"></div>`;
}

/**
 * Metric Pane — label plus columns of titled values.
 * groups: [{ title, items: [{ text, href }] }]
 */
export function metricPane({ label = '// METRICS', groups = [] }) {
  const visible = groups.filter((g) => g.items?.length);
  if (!visible.length) return '';
  return html`<div class="metric-pane">
  <p class="metric-pane__label">${label}</p>
  <dl class="metric-pane__list">
    ${visible.map(
      (group) => html`<div class="metric-pane__group">
      <dt>${group.title}</dt>
      <dd>${group.items.map((item, i) => {
        const sep = i < group.items.length - 1 && group.separator ? group.separator : '';
        return item.href
          ? html`<a href="${item.href}" target="_blank" rel="noopener">${item.text}</a>${sep}`
          : html`<span>${item.text}${sep}</span>`;
      })}</dd>
    </div>`,
    )}
  </dl>
</div>`;
}

/** Code Block — `code` must already be highlighted/escaped HTML. */
export function codeBlock({ code, lang, label, caption }) {
  return html`<figure class="code-block"${lang ? raw(` data-lang="${escapeHtml(lang)}"`) : ''}>
  <figcaption class="code-block__label">// ${label || (lang ? `${lang.toUpperCase()}` : 'CODE BLOCK')}</figcaption>
  <pre><code class="hljs">${raw(code)}</code></pre>
  ${caption ? html`<p class="code-block__caption">${caption}</p>` : ''}
</figure>`;
}

/** Input Field — label + white field (input or textarea). */
export function inputField({ id, name, label, placeholder, type = 'text', multiline = false, autocomplete }) {
  const control = multiline
    ? html`<textarea class="input-field__control" id="${id}" name="${name}" placeholder="${placeholder}" rows="8" required></textarea>`
    : html`<input class="input-field__control" id="${id}" name="${name}" type="${type}" placeholder="${placeholder}"${
        autocomplete ? raw(` autocomplete="${autocomplete}"`) : ''
      } required>`;
  return html`<div class="input-field${multiline ? ' input-field--multiline' : ''}">
  <label class="input-field__label" for="${id}">${label}</label>
  ${control}
</div>`;
}

/** Next/Prev Bar — walks a collection; either side may be missing. */
export function nextPrev({ prev, next, noun = 'TOPIC' }) {
  if (!prev && !next) return '';
  return html`<nav class="next-prev" aria-label="More ${noun.toLowerCase()}s">
  <div class="container next-prev__inner">
    ${prev
      ? html`<div class="next-prev__item next-prev__item--prev">
      <span class="next-prev__label">// PREV ${noun}</span>
      ${button({ label: `← PREV ${noun}`, href: prev.href, variant: 'light', attrs: `title="${escapeHtml(prev.title)}"` })}
    </div>`
      : html`<span></span>`}
    ${next
      ? html`<div class="next-prev__item next-prev__item--next">
      <span class="next-prev__label">// NEXT ${noun}</span>
      ${button({ label: `NEXT ${noun} →`, href: next.href, variant: 'primary', attrs: `title="${escapeHtml(next.title)}"` })}
    </div>`
      : ''}
  </div>
</nav>`;
}

/**
 * "Email me" button that opens a small menu of ways to write to `email`:
 * Gmail / Outlook in the browser (address pre-filled), the default mail app, or copy the address.
 * Without JavaScript it is a plain mailto: link.
 */
export function emailButton({ email, label = 'EMAIL ME', variant = 'light', id = 'email-menu' }) {
  const to = encodeURIComponent(email);
  const options = [
    { label: 'Gmail', icon: 'google', brand: true, href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}` },
    { label: 'Outlook', icon: 'microsoft', brand: true, href: `https://outlook.office.com/mail/deeplink/compose?to=${to}` },
    { label: 'Default email app', icon: 'envelope', href: `mailto:${email}` },
  ];
  return html`<div class="email-menu" data-email-menu>
  ${button({ label, href: `mailto:${email}`, variant, className: 'email-menu__trigger', attrs: `aria-haspopup="true" aria-expanded="false" aria-controls="${id}"` })}
  <div class="email-menu__panel" id="${id}" hidden>
    <p class="email-menu__label">// Write to ${email}</p>
    ${options.map(
      (o) => html`<a class="email-menu__item" href="${o.href}"${o.href.startsWith('http') ? raw(' target="_blank" rel="noopener"') : ''}>${icon(o.icon, { brand: o.brand })}<span>${o.label}</span></a>`,
    )}
    <button class="email-menu__item" type="button" data-copy="${email}">${icon('copy')}<span>Copy address</span></button>
  </div>
</div>`;
}

/** Social links as icons (hero) or underlined text (footer). */
export function socialLinks(socials = [], variant = 'icons') {
  if (variant === 'text') {
    return html`<ul class="social-text">${socials.map(
      (s) => html`<li><a href="${s.url}" target="_blank" rel="noopener">${s.label.toUpperCase()}</a></li>`,
    )}</ul>`;
  }
  return html`<ul class="social-icons">${socials.map(
    (s) => html`<li><a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}" title="${s.label}">${icon(s.icon, { brand: true })}</a></li>`,
  )}</ul>`;
}

const LINK_ICONS = {
  github: { icon: 'github', label: 'GitHub' },
  steam: { icon: 'steam', label: 'Steam' },
  itch: { icon: 'itch-io', label: 'Itch.io' },
  youtube: { icon: 'youtube', label: 'YouTube' },
  website: { icon: 'globe', label: 'Website', solid: true },
};

/** Ordered list of {key, url, icon, label} for a links object like {github, steam, itch}. */
export function linkList(links = {}) {
  return Object.entries(links)
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url, ...(LINK_ICONS[key] ?? { icon: 'link', label: key, solid: true }) }));
}

/** Card footer row: "Links:" followed by icon links. */
export function iconLinks(links = {}) {
  const list = linkList(links);
  if (!list.length) return '';
  return html`<div class="card__links">
  <span class="card__links-label">Links:</span>
  ${list.map(
    (l) => html`<a class="card__link" href="${l.url}" target="_blank" rel="noopener" aria-label="${l.label}" title="${l.label}">${icon(l.icon, { brand: !l.solid })}</a>`,
  )}
</div>`;
}
