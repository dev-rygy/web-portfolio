// Project page — Figma "Project Page" (177:928)

import { cx, html, raw } from '../../lib/html.js';
import { extractMedia, renderMarkdown } from '../../lib/markdown.js';
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

/** Figma "Related Blogs" (2220:1270) — under the metrics; hidden when the project lists none. */
function relatedBlogs(project, blogs) {
  const related = (project.relatedBlogs ?? []).map((slug) => blogs.find((b) => b.slug === slug)).filter(Boolean);
  if (!related.length) return '';
  return html`<div class="related">
  <p class="related__label">// Related Blogs</p>
  <div class="card-grid card-grid--4">${related.map(blogCard)}</div>
</div>`;
}

function overview(project, blogs) {
  const text = project.overview || project.body;
  const body = text ? renderMarkdown(text) : '';
  return html`<section class="section">
  <div class="container section__body">
    ${sectionHeading('OVERVIEW')}
    <div class="project-overview">
      <div class="overview overview--split">
        ${media({ src: project.video || project.thumbnail, poster: project.video ? project.videoPoster : project.poster, alt: `${project.title} overview`, controls: true })}
        ${projectMetrics(project)}
        <div class="overview__text"><div class="prose">${raw(body || project.description || project.summary || '')}</div></div>
      </div>
      ${relatedBlogs(project, blogs)}
    </div>
  </div>
</section>`;
}

/** `size: big | sub` in the feature's frontmatter; without it, features with media are big. */
function isBigFeature(feature) {
  if (feature.size) return feature.size === 'big';
  return Boolean(feature.media);
}

/** `significance: important` gives a big feature's tab the gold shine; anything else (e.g. `trivial`) is plain. */
function isImportant(feature) {
  return feature?.significance === 'important';
}

/**
 * A feature's text plus all of its media: the `media` field first, then any :::media / :::gallery
 * blocks from its body (taken out of the text so they can stack beside it).
 */
function featureContent(feature) {
  const { body, items } = extractMedia(feature.body ?? '');
  if (feature.media) items.unshift({ src: feature.media, poster: feature.poster, alt: feature.title });
  return { body: raw(renderMarkdown(body)), items };
}

function mediaStack(items) {
  if (!items.length) return '';
  return html`<div class="feature__media">
  ${items.map((item) => {
    const shown = media({ src: item.src, alt: item.alt, poster: item.poster, controls: true });
    const linked = item.gallery && /\.(png|jpe?g|webp|gif|avif)$/i.test(item.src)
      ? html`<a href="${item.src}" target="_blank" rel="noopener" aria-label="Open ${item.alt || 'image'} full size">${shown}</a>`
      : shown;
    return html`<figure class="feature__figure">${linked}${item.caption ? html`<figcaption>${item.caption}</figcaption>` : ''}</figure>`;
  })}
</div>`;
}

/**
 * Big feature: Figma "Name and Video" — green heading + text, its media stacked beside it (text fills the row without media).
 * The media comes first in the markup so it can float when js/features.js lets long text wrap under it; CSS keeps it on the right.
 */
function bigFeature(feature) {
  const { body, items } = featureContent(feature);
  return html`<article class="feature">
  <div class="${cx('feature__main', !items.length && 'feature__main--full')}">
    ${mediaStack(items)}
    <div class="feature__text">
      ${sectionHeading(feature.title, { tag: 'h3' })}
      <div class="prose">${body}</div>
    </div>
  </div>
</article>`;
}

/** Sub feature: small heading. With media it gets its own row (media stacked beside the text, as in bigFeature); without, two per row. */
function subFeature(feature) {
  const { body, items } = featureContent(feature);
  const text = html`<h3 class="paragraph-heading feature__title">${feature.title}</h3>
  <div class="prose">${body}</div>`;
  if (!items.length) return html`<article class="feature feature--text">${text}</article>`;
  return html`<article class="feature feature--text">
  <div class="feature__main">
    ${mediaStack(items)}
    <div class="feature__text">${text}</div>
  </div>
</article>`;
}

/** Sub features in order; runs of text-only ones share a two-column grid. */
function subFeatures(subs) {
  const groups = [];
  for (const feature of subs) {
    const textOnly = !feature.media && !extractMedia(feature.body ?? '').items.length;
    const last = groups.at(-1);
    if (textOnly && last?.textOnly) last.items.push(feature);
    else groups.push({ textOnly, items: [feature] });
  }
  return groups.map((group) =>
    group.textOnly ? html`<div class="feature-grid">${group.items.map((f) => subFeature(f))}</div>` : subFeature(group.items[0]),
  );
}

/** Figma "Feature Tab Panel" (2222:1319) — one tab per big feature; js/tabs.js switches them. */
function features(project) {
  const list = project.features ?? [];
  if (!list.length) return '';

  // Sub features join the tab of the big feature above them; any before the first big one join the first tab.
  const tabs = [];
  const leading = [];
  for (const feature of list) {
    if (isBigFeature(feature)) tabs.push({ title: feature.tabText || feature.title, big: feature, subs: [] });
    else (tabs.at(-1)?.subs ?? leading).push(feature);
  }
  if (!tabs.length) tabs.push({ title: 'Features', subs: [] });
  tabs[0].subs.unshift(...leading);

  return html`<section class="section">
  <div class="container section__body">
    ${sectionHeading('TECHNICAL FEATURES')}
    <div class="feature-tabs" data-tabs>
      <div class="feature-tabs__list" role="tablist" aria-label="Technical features">
        ${tabs.map(
          (tab, i) => html`<button class="feature-tabs__tab${isImportant(tab.big) ? ' feature-tabs__tab--important' : ''}" type="button" role="tab" id="feature-tab-${i + 1}" aria-controls="feature-panel-${i + 1}" aria-selected="${String(i === 0)}"${
            i ? raw(' tabindex="-1"') : ''
          }>${
            isImportant(tab.big)
              ? html`<span class="feature-tabs__label">${tab.title}</span><span class="feature-tabs__bling" aria-hidden="true"></span>`
              : tab.title
          }</button>`,
        )}
      </div>
      ${tabs.map(
        (tab, i) => html`<div class="feature-tabs__panel" role="tabpanel" id="feature-panel-${i + 1}" aria-labelledby="feature-tab-${i + 1}"${i ? raw(' hidden') : ''}>
        ${tab.big ? bigFeature(tab.big) : ''}
        ${subFeatures(tab.subs)}
      </div>`,
      )}
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
    <div class="reflection${project.reflection.image ? '' : ' reflection--text-only'}">
      ${project.reflection.image ? media({ src: project.reflection.image, alt: `${project.title} reflection`, className: 'reflection__media' }) : ''}
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
${overview(project, blogs)}
${features(project)}
${reflection(project)}
${nextPrev({ prev, next, noun: 'PROJECT' })}`;
}
