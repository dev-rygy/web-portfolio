// Generic page for blogs and shaders — Figma "Generic Page" (180:1488)

import { html, raw } from '../../lib/html.js';
import { formatDate } from '../../lib/format.js';
import { renderInline, renderMarkdown } from '../../lib/markdown.js';
import { linkList, media, metricPane, nextPrev, titleBar } from '../components/ui.js';

function metricsFor(item, kind) {
  // Optional custom metrics from frontmatter: metrics: [{ title, items: [text | {text, href}] }]
  if (Array.isArray(item.metrics) && item.metrics.length) {
    return item.metrics.map((group) => ({
      title: group.title,
      items: (group.items ?? []).map((i) => (typeof i === 'string' ? { text: i } : i)),
    }));
  }
  if (kind === 'shaders') {
    return [
      { title: 'Links', items: linkList(item.links).map((l) => ({ text: l.label, href: l.url })) },
      { title: 'Language', items: item.language ? [{ text: item.language }] : [] },
      { title: 'Type', items: item.type ? [{ text: item.type }] : [] },
    ];
  }
  return [
    { title: 'Genre', items: item.genre ? [{ text: item.genre }] : [] },
    { title: 'Date', items: item.date ? [{ text: formatDate(item.date) }] : [] },
    { title: 'Links', items: linkList(item.links).map((l) => ({ text: l.label, href: l.url })) },
  ];
}

export function genericPage({ item, kind, prev, next }) {
  const intro = item.description || item.summary;
  return html`${titleBar(item.title)}
<section class="section section--plain">
  <div class="container">
    <div class="overview">
      <div class="overview__showcase">
        ${media({ src: item.video || item.thumbnail, poster: item.poster, alt: item.title, controls: true })}
        ${metricPane({ label: '// METRICS', groups: metricsFor(item, kind) })}
      </div>
      ${intro ? html`<div class="prose"><p>${raw(renderInline(intro))}</p></div>` : html`<span></span>`}
    </div>
  </div>
</section>
${item.body
  ? html`<section class="generic-body">
  <div class="container generic-body__content">${raw(renderMarkdown(item.body))}</div>
</section>`
  : ''}
${nextPrev({ prev, next, noun: 'TOPIC' })}`;
}
