// Project page — Figma "Project Page" (177:928)

import { html, raw } from '../../lib/html.js';
import { renderMarkdown } from '../../lib/markdown.js';
import { blogCard } from '../components/cards.js';
import { linkList, media, metricPane, nextPrev, sectionHeading, titleBar } from '../components/ui.js';

function projectMetrics(project) {
  return metricPane({
    label: '// METRICS',
    groups: [
      { title: 'Links', items: linkList(project.links).map((l) => ({ text: l.label, href: l.url })) },
      { title: 'Engine', items: project.engine ? [{ text: project.engine }] : [] },
      { title: 'My Roles', items: (project.roles ?? []).map((r) => ({ text: r })), separator: ',' },
      { title: 'Platforms', items: (project.platforms ?? []).map((p) => ({ text: p })), separator: ',' },
    ],
  });
}

function overview(project) {
  const body = project.body ? renderMarkdown(project.body) : '';
  return html`<section class="section">
  <div class="container section__body">
    ${sectionHeading('OVERVIEW')}
    <div class="overview">
      <div class="overview__showcase">
        ${media({ src: project.video || project.thumbnail, poster: project.poster, alt: `${project.title} overview`, controls: true })}
        ${projectMetrics(project)}
      </div>
      <div class="prose">${raw(body || project.description || project.summary || '')}</div>
    </div>
  </div>
</section>`;
}

function features(project, blogs) {
  const list = project.features ?? [];
  if (!list.length) return '';
  return html`<section class="section">
  <div class="container section__body">
    ${sectionHeading('TECHNICAL FEATURES')}
    <div class="feature-list">
      ${list.map((feature) => {
        const related = (feature.relatedBlogs ?? []).map((slug) => blogs.find((b) => b.slug === slug)).filter(Boolean);
        return html`<article class="feature">
        <div class="feature__main">
          <div class="feature__text">
            ${sectionHeading(feature.title, { tag: 'h3' })}
            <div class="prose">${raw(renderMarkdown(feature.body ?? ''))}</div>
          </div>
          ${media({ src: feature.media, poster: feature.poster, alt: feature.title, controls: true, className: 'feature__media' })}
        </div>
        ${related.length
          ? html`<div class="related">
          <p class="related__label">// Related Blogs</p>
          <div class="card-grid card-grid--4">${related.map(blogCard)}</div>
        </div>`
          : ''}
      </article>`;
      })}
    </div>
  </div>
</section>`;
}

function reflection(project) {
  const qa = project.reflection?.qa ?? [];
  if (!qa.length) return '';
  return html`<section class="section section--plain">
  <div class="container section__body">
    ${sectionHeading('THOUGHTS & REFLECTION')}
    <div class="reflection">
      ${media({ src: project.reflection.image, alt: `${project.title} reflection`, className: 'reflection__media' })}
      <div class="reflection__qa">
        ${qa.map(
          (item) => html`<div class="reflection__item">
          <h3 class="paragraph-heading">${item.question}</h3>
          <div class="prose">${raw(renderMarkdown(item.answer ?? ''))}</div>
        </div>`,
        )}
      </div>
    </div>
  </div>
</section>`;
}

export function projectPage({ project, blogs, prev, next }) {
  return html`${titleBar(project.title)}
${overview(project)}
${features(project, blogs)}
${reflection(project)}
${nextPrev({ prev, next, noun: 'TOPIC' })}`;
}
