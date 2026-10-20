// Projects / Shaders / Blog list pages — Figma 53:482, 69:1552, 69:2331

import { html } from '../../lib/html.js';
import { blogCard, projectCard, shaderCard } from '../components/cards.js';
import { pageIntro } from '../components/ui.js';

const LISTS = {
  projects: { grid: 'card-grid--3', render: (p) => projectCard(p, { size: 'large' }), empty: 'No projects yet.' },
  shaders: { grid: 'card-grid--3', render: shaderCard, empty: 'No shaders yet.' },
  blogs: { grid: 'card-grid--4 card-grid--blog', render: blogCard, empty: 'No blog posts yet.' },
};

export function listPage({ kind, intro, items }) {
  const list = LISTS[kind];
  return html`${pageIntro(intro)}
<section class="list-section">
  <div class="container">
    ${items.length
      ? html`<div class="card-grid ${list.grid}">${items.map(list.render)}</div>`
      : html`<p class="list-section__empty">${list.empty}</p>`}
  </div>
</section>`;
}
