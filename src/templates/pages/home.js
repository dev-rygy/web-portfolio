// Homepage — Figma "Home Page" (8:3)

import { html, raw } from '../../lib/html.js';
import { renderInline } from '../../lib/markdown.js';
import { blogCard, projectCard } from '../components/cards.js';
import { button, chip, emailButton, sectionHeading, socialLinks } from '../components/ui.js';

const LATEST_BLOG_COUNT = 8;

function hero({ site, home, projects }) {
  return html`<section class="hero">
  <div class="container hero__inner">
    <div class="hero__intro">
      <h1 class="hero__title">${home.hero.greeting}</h1>
      <div class="hero__text">${home.hero.intro.map((p) => html`<p>${raw(renderInline(p))}</p>`)}</div>
      <div class="button-row">
        ${button({ label: 'MY PROJECTS', href: '/projects/', variant: 'primary' })}
        ${site.resume ? button({ label: 'DOWNLOAD RESUME', href: site.resume, variant: 'light', iconName: 'download', download: true }) : ''}
      </div>
      ${socialLinks(site.socials, 'icons')}
    </div>
    ${carousel(home.carousel, projects)}
  </div>
</section>`;
}

function carousel(config = {}, projects) {
  const clips = (config.clips ?? []).map((clip, index) => {
    const project = projects.find((p) => p.slug === clip.project);
    return {
      src: clip.src,
      poster: clip.poster || clip.src.replace(/\.(mp4|webm)$/i, '.jpg'),
      start: Number(clip.start) || 0,
      max: Number(clip.maxSeconds) || Number(config.maxSeconds) || 15,
      url: project?.url ?? '',
      title: clip.title || project?.title || `Clip ${index + 1}`,
    };
  });
  if (!clips.length) return '';
  const first = clips[0];

  return html`<div class="hero__carousel carousel" data-carousel>
  <div class="carousel__stage media">
    <video class="media__video" muted playsinline preload="metadata" poster="${first.poster}" aria-label="Project highlight reel">
      <source src="${first.src}" type="video/mp4">
    </video>
  </div>
  <div class="carousel__controls" role="group" aria-label="Project carousel">
    ${clips.map(
      (clip, i) => html`<button class="carousel__bar" type="button" data-index="${i}" aria-label="Show ${clip.title} (${i + 1} of ${clips.length})"><span class="carousel__fill"></span></button>`,
    )}
    <button class="carousel__toggle" type="button" aria-pressed="false" aria-label="Pause carousel"></button>
  </div>
  <script type="application/json" class="carousel__data">${raw(JSON.stringify(clips).replace(/</g, '\\u003c'))}</script>
</div>`;
}

function cardSection({ title, items, renderCard, seeMoreHref, id }) {
  if (!items.length) return '';
  return html`<section class="section" id="${id}">
  <div class="container section__body">
    ${sectionHeading(title)}
    <div class="card-grid card-grid--4">${items.map(renderCard)}</div>
    ${button({ label: 'SEE MORE', href: seeMoreHref, variant: 'primary' })}
  </div>
</section>`;
}

function entryList({ title, entries, id }) {
  if (!entries.length) return '';
  return html`<section class="section" id="${id}">
  <div class="container section__body">
    ${sectionHeading(title)}
    <div class="entry-list">
      ${entries.map(
        (entry) => html`<div class="entry">
        ${entry.logo
          ? html`<img class="entry__logo" src="${entry.logo}" alt="${entry.name} logo" loading="lazy" width="50" height="50">`
          : html`<span class="entry__logo entry__logo--placeholder" aria-hidden="true"></span>`}
        <div class="entry__heading">
          <p class="entry__name">${entry.name}</p>
          <p class="entry__role">${entry.role}</p>
        </div>
        <p class="entry__dates">${entry.dates}</p>
        ${entry.description ? html`<p class="entry__text">${raw(renderInline(entry.description))}</p>` : html`<span></span>`}
      </div>`,
      )}
    </div>
  </div>
</section>`;
}

function toolsetSection(toolset) {
  return html`<section class="section" id="toolset">
  <div class="container">
    <div class="toolset">
      <div class="toolset__intro">
        ${sectionHeading(toolset.title)}
        <p>${toolset.intro}</p>
      </div>
      <div class="toolset__groups">
        ${toolset.groups.map(
          (group) => html`<div class="toolset__group">
          <p class="toolset__label">// ${group.label}</p>
          <div class="chip-list">${group.items.map((item) => chip(item, 'tool'))}</div>
        </div>`,
        )}
      </div>
    </div>
  </div>
</section>`;
}

function cta({ site, home }) {
  return html`<section class="cta">
  <div class="container cta__inner">
    <h2 class="cta__title">${home.cta.title}</h2>
    <div class="button-row">
      ${button({ label: 'CONTACT ME', href: '/contact/', variant: 'primary' })}
      ${emailButton({ email: site.email, label: 'EMAIL ME', variant: 'light' })}
    </div>
  </div>
</section>`;
}

export function homePage(ctx) {
  const { home, projects, blogs, experience, education, toolset } = ctx;
  // Featured = hand-picked order from home.json; falls back to newest projects if the list is empty.
  const featured = home.featured?.length
    ? home.featured.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean)
    : projects.slice(0, 8);

  return html`${hero(ctx)}
${cardSection({
  title: home.sections.projects,
  items: featured,
  renderCard: (p) => projectCard(p, { size: 'small' }),
  seeMoreHref: '/projects/',
  id: 'featured-projects',
})}
${cardSection({
  title: home.sections.blogs,
  items: blogs.slice(0, LATEST_BLOG_COUNT),
  renderCard: blogCard,
  seeMoreHref: '/blog/',
  id: 'latest-blogs',
})}
${entryList({ title: home.sections.experience, entries: experience, id: 'experience' })}
${toolsetSection(toolset)}
${entryList({ title: home.sections.education, entries: education, id: 'education' })}
${cta(ctx)}`;
}
