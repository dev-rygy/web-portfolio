// Cards — Figma "Card" component set (Project / Large Project / Blog / Shader, Idle + Hover).
// Hover/focus state (blurred thumbnail + "Learn More" button) is pure CSS.

import { html } from '../../lib/html.js';
import { formatDate } from '../../lib/format.js';
import { chip, iconLinks, media, statusChip } from './ui.js';

function showcase(item, { status, title }) {
  return html`<div class="card__showcase">
    ${media({ src: item.thumbnail, poster: item.poster, alt: `${title} preview`, autoplay: true, className: 'card__media' })}
    ${status ? statusChip(status) : ''}
    <a class="button button--light card__learn-more" href="${item.url}" tabindex="-1" aria-hidden="true"><span>LEARN MORE</span></a>
  </div>`;
}

function meta(parts, { muted = false } = {}) {
  const visible = parts.filter(Boolean);
  if (!visible.length) return '';
  return html`<p class="card__meta${muted ? ' card__meta--muted' : ''}">${visible.map((p) => html`<span>${p}</span>`)}</p>`;
}

/** Project card. size 'small' = homepage card, 'large' = Projects page card. */
export function projectCard(project, { size = 'small' } = {}) {
  const title = `PROJECT: ${project.title}`;
  const text = size === 'large' ? project.description || project.summary : project.summary;
  return html`<article class="card card--project card--${size}">
  ${showcase(project, { status: project.status, title: project.title })}
  <div class="card__header">
    <h3 class="card__title"><a href="${project.url}">${title}</a></h3>
    ${meta([project.genre, formatDate(project.date)])}
    ${project.roles?.length ? html`<div class="card__chips">${project.roles.map((r) => chip(r, 'tag'))}</div>` : ''}
  </div>
  ${text ? html`<p class="card__text">${text}</p>` : ''}
  <hr class="card__separator">
  ${iconLinks(project.links)}
</article>`;
}

export function blogCard(blog) {
  return html`<article class="card card--blog">
  ${showcase(blog, { title: blog.title })}
  <div class="card__header">
    <h3 class="card__title"><a href="${blog.url}">Blog: ${blog.title}</a></h3>
    ${meta([blog.genre, formatDate(blog.date)])}
  </div>
  ${blog.summary ? html`<p class="card__text">${blog.summary}</p>` : ''}
</article>`;
}

export function shaderCard(shader) {
  return html`<article class="card card--shader card--large">
  ${showcase(shader, { title: shader.title })}
  <div class="card__header">
    <h3 class="card__title"><a href="${shader.url}">${shader.type || 'Shader'}: ${shader.title}</a></h3>
    ${meta([shader.language, formatDate(shader.date)], { muted: true })}
  </div>
  ${shader.description ? html`<p class="card__text">${shader.description}</p>` : ''}
  <hr class="card__separator">
  ${iconLinks(shader.links)}
</article>`;
}
