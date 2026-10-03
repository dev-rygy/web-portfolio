// elements.html — style guide of every reusable piece. Published but hidden:
// not linked anywhere, noindex, excluded from the sitemap and analytics.

import { html, raw } from '../../lib/html.js';
import { highlight, renderMarkdown } from '../../lib/markdown.js';
import { blogCard, projectCard, shaderCard } from '../components/cards.js';
import {
  button,
  chip,
  codeBlock,
  inputField,
  media,
  metricPane,
  nextPrev,
  sectionHeading,
  socialLinks,
  statusChip,
} from '../components/ui.js';

function item(name, classes, body) {
  return html`<div class="elements__item">
  <p class="elements__name">${name} — <code>${classes}</code></p>
  ${body}
</div>`;
}

function group(title, ...items) {
  return html`<section class="elements__section">
  ${sectionHeading(title)}
  ${items}
</section>`;
}

const SAMPLE_PROJECT = {
  title: 'Sample Project',
  url: '#',
  genre: 'Action Roguelike',
  date: '2026-06-01',
  status: 'shipped',
  roles: ['Gameplay Programmer', 'Technical Artist'],
  summary: 'Short summary used on the small homepage card.',
  description: 'Longer summary used on the Projects page card. It is clamped to four lines so every card in a row lines up neatly.',
  links: { github: '#', steam: '#', itch: '#' },
};

const BLOCKS_MARKDOWN = `
## Section Heading (\`## \`)

Plain paragraphs are body text with **bold**, *italic*, [a link](#) and \`inline code\`.

### Paragraph Heading (\`### \`)

- Unordered list item
- Another item

1. Ordered list item
2. Another item

> A blockquote for pull quotes or citations.

| Column | Description |
| --- | --- |
| Row one | Tables render with simple rules |
| Row two | Useful for stats or comparisons |

:::media-text {src="" side="left" alt="Placeholder"}
### :::media-text — media left
Media on one side, text on the other. Use \`side="right"\` to flip it.
:::

:::media-text {src="" side="right" alt="Placeholder"}
### :::media-text — media right
The same block with \`side="right"\`.
:::

:::text-code
### :::text-code
Explanation on the left, code on the right.

\`\`\`hlsl label="Example" caption="Optional caption under the code."
float edge = step(noise, _Cutoff);
\`\`\`
:::

:::media {src="" alt="Placeholder" caption=":::media — full-width media with an optional caption"}
:::

:::gallery
![One]( "Gallery item with caption")
![Two]()
![Three]()
:::

:::callout
**:::callout** — a highlighted note or takeaway.
:::
`;

const CSHARP_SAMPLE = `using SomeInclude; // This is a comment
public class SomeClass
{
  private string someString = "This is a string";
  private int someNumber = 30;
  private Object someObject = new Object();
  private Struct someStruct;
  private void SomeFunction() { }
}`;

export function elementsPage({ site, projects, blogs, shaders }) {
  const project = projects[0] ?? SAMPLE_PROJECT;
  return html`<section class="elements">
  <div class="container">
    <h1 class="hero__title">Elements</h1>
    <p class="elements__note">Reference page of every reusable component on the site. It is not linked anywhere and is hidden from search engines. Class names are shown above each example so the markup can be copied; the Markdown blocks at the bottom are what you can use inside blog and shader posts.</p>

    ${group(
      'Typography',
      item('Title Text', '.hero__title / .page-intro__title / .title-bar__text', html`<p class="hero__title">Title Text 48</p>`),
      item('Section Heading', '.section-heading', sectionHeading('HEADING TEXT')),
      item('Paragraph Heading', '.paragraph-heading', html`<h3 class="paragraph-heading">What did I learn?</h3>`),
      item(
        'Body text',
        '.prose',
        html`<div class="prose"><p>Body text at 18px with 1.6 line height. <strong>Bold</strong>, <em>italic</em>, <a href="#">link</a> and <code>inline code</code>.</p></div>`,
      ),
      item('Label text', '.metric-pane__label / .toolset__label', html`<p class="toolset__label">// LABEL TEXT</p>`),
    )}

    ${group(
      'Buttons',
      item(
        'Button',
        '.button.button--primary / .button.button--light',
        html`<div class="elements__row">
          ${button({ label: 'PRIMARY', href: '#', variant: 'primary' })}
          ${button({ label: 'LIGHT', href: '#', variant: 'light' })}
          ${button({ label: 'WITH ICON', href: '#', variant: 'light', iconName: 'download' })}
          ${button({ label: 'DISABLED', variant: 'primary', attrs: 'disabled' })}
        </div>`,
      ),
    )}

    ${group(
      'Chips',
      item('Display Chip — tag (Without Outline)', '.chip.chip--tag', html`<div class="chip-list">${chip('Role #1')}${chip('Role #2')}</div>`),
      item('Display Chip — tool (With Outline)', '.chip.chip--tool', html`<div class="chip-list">${chip('C#', 'tool')}${chip('Unreal (C++/Blueprints)', 'tool')}</div>`),
      item(
        'Status Chip',
        '.status-chip.status-chip--{shipped|prototype|awaiting}',
        html`<div class="elements__row">${statusChip('shipped')}${statusChip('prototype')}${statusChip('awaiting')}</div>`,
      ),
    )}

    ${group(
      'Media',
      item('Media Placeholder', '.media.media--placeholder', html`<div style="max-width:440px">${media({ alt: 'Placeholder' })}</div>`),
      item(
        'Video (with controls)',
        '.media > video.media__video',
        html`<div style="max-width:440px">${media({
          src: '/assets/video/carousel/unstable_star_carousel.mp4',
          poster: '/assets/video/carousel/unstable_star_carousel.jpg',
          controls: true,
          alt: 'Example video',
        })}</div>`,
      ),
      item(
        'Photo / logo',
        '.entry__logo',
        html`<div class="elements__row"><img class="entry__logo" src="/assets/logos/asu.png" alt="ASU logo"><span class="entry__logo entry__logo--placeholder"></span></div>`,
      ),
    )}

    ${group(
      'Metric Pane',
      item(
        'Metric Pane',
        '.metric-pane',
        metricPane({
          label: '// METRICS',
          groups: [
            { title: 'Links', items: [{ text: 'GitHub', href: '#' }, { text: 'Steam', href: '#' }, { text: 'Itch', href: '#' }] },
            { title: 'Engine', items: [{ text: 'Unity 6' }] },
            { title: 'My Roles', items: [{ text: 'UI/UX Designer' }, { text: 'Systems Programmer' }], separator: ',' },
            { title: 'Platforms', items: [{ text: 'PC' }, { text: 'Mobile' }], separator: ',' },
          ],
        }),
      ),
    )}

    ${group(
      'Code Block',
      item(
        'Code Block',
        '.code-block (```lang label="…" caption="…")',
        html`<div style="max-width:890px">${codeBlock({
          code: highlight(CSHARP_SAMPLE, 'csharp'),
          lang: 'csharp',
          label: 'CODE BLOCK',
          caption: 'The multi-threaded solver outputs a lean coordinate map back to the main actor loop, which then paints instances using optimized GPU arrays.',
        })}</div>`,
      ),
    )}

    ${group(
      'Input Field',
      item(
        'Input Field',
        '.input-field',
        html`<div style="max-width:773px;display:flex;flex-direction:column;gap:16px">
          ${inputField({ id: 'el-name', name: 'el-name', label: 'Field_Title', placeholder: 'Placeholder text' })}
          ${inputField({ id: 'el-message', name: 'el-message', label: 'Field_Title', placeholder: 'Multiline placeholder…', multiline: true })}
          <p class="message-box__status">Error: Please fill in all required information.</p>
          <p class="message-box__status is-success">Message sent! I’ll get back to you within ~24 hours.</p>
        </div>`,
      ),
    )}

    ${group(
      'Cards',
      item(
        'Project Card — small (homepage)',
        '.card.card--project.card--small',
        html`<div class="card-grid card-grid--4">${projectCard(project, { size: 'small' })}</div>`,
      ),
      item(
        'Project Card — large (Projects page)',
        '.card.card--project.card--large',
        html`<div class="card-grid card-grid--3">${projectCard(project, { size: 'large' })}</div>`,
      ),
      blogs[0] ? item('Blog Card', '.card.card--blog', html`<div class="card-grid card-grid--4">${blogCard(blogs[0])}</div>`) : '',
      shaders[0] ? item('Shader Card', '.card.card--shader', html`<div class="card-grid card-grid--3">${shaderCard(shaders[0])}</div>`) : '',
    )}

    ${group(
      'Social links',
      item('Icons (hero)', '.social-icons', socialLinks(site.socials, 'icons')),
      item('Text (footer)', '.social-text', socialLinks(site.socials, 'text')),
    )}

    <section class="elements__section">
      ${sectionHeading('Generic page blocks')}
      <p class="elements__note">Everything below is rendered from Markdown — copy the syntax from <code>content/blogs/example-blog.md</code>.</p>
      <div class="generic-body__content">${raw(renderMarkdown(BLOCKS_MARKDOWN))}</div>
    </section>
  </div>
</section>
${nextPrev({ prev: { href: '#', title: 'Previous' }, next: { href: '#', title: 'Next' }, noun: 'TOPIC' })}`;
}
