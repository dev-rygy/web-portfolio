// Markdown → HTML for project/blog/shader bodies.
//
// Besides normal Markdown, bodies can use container blocks:
//
//   :::media-text {src="/assets/x.mp4" side="right" alt="..."}
//   ### Optional heading
//   Text that sits beside the media.
//   :::
//
//   :::text-code
//   Explanation text…
//   ```hlsl label="Dissolve edge" caption="What the snippet does"
//   float edge = step(noise, _Cutoff);
//   ```
//   :::
//
//   :::media {src="/assets/x.png" alt="..." caption="..."}
//   :::
//
//   :::gallery
//   ![Before](/assets/before.png)
//   ![After](/assets/after.png)
//   :::
//
//   :::callout
//   A highlighted note or takeaway.
//   :::
//
//   :::table {label="Weapon stats" caption="..."}
//   | Weapon | Damage |
//   | ------ | -----: |
//   | Sword  | 12     |
//   :::
//
// Every Markdown table renders as a Table Block (framed like a code block); wrapping it in :::table
// sets its label and caption. Inside :::text-code, tables sit in the code column.
//
// `## Heading` renders as the green Section Heading; `### Heading` as a paragraph heading.

import { Marked, Renderer } from 'marked';
import hljs from 'highlight.js';
import { codeBlock, media, sectionHeading, tableBlock } from '../templates/components/ui.js';
import { escapeHtml } from './html.js';

// HLSL/GLSL/ShaderLab are close enough to C-family syntax for highlighting.
const LANGUAGE_ALIASES = { hlsl: 'cpp', shaderlab: 'cpp', usf: 'cpp', ush: 'cpp', compute: 'cpp', blueprint: 'plaintext' };

// `![alt](src "caption")` lines inside a :::gallery block.
const GALLERY_IMAGE = /!\[([^\]]*)\]\(([^)\s]*)(?:\s*"([^"]*)")?\)/g;

/** Parse `key="value" key2=value2` attribute strings (with or without surrounding braces). */
export function parseAttrs(input = '') {
  const attrs = {};
  const body = input.trim().replace(/^\{|\}$/g, '');
  const pattern = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"']+))/g;
  let match;
  while ((match = pattern.exec(body))) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4];
  }
  return attrs;
}

export function highlight(code, lang) {
  const language = LANGUAGE_ALIASES[lang?.toLowerCase()] ?? lang?.toLowerCase();
  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(code, { language, ignoreIllegals: true }).value;
  }
  return escapeHtml(code);
}

function renderCode(token) {
  const info = (token.lang ?? '').trim();
  const lang = info.match(/^\S*/)?.[0] ?? '';
  const attrs = parseAttrs(info.slice(lang.length));
  return String(
    codeBlock({
      code: highlight(token.text, lang),
      lang,
      label: attrs.label,
      caption: attrs.caption,
    }),
  );
}

const containerExtension = {
  name: 'container',
  level: 'block',
  start(src) {
    return src.match(/^:::[\w-]/m)?.index;
  },
  tokenizer(src) {
    const match = /^:::([\w-]+)[ \t]*(\{[^\n]*\})?[ \t]*\n([\s\S]*?)\n?:::[ \t]*(?:\n+|$)/.exec(src);
    if (!match) return undefined;
    const token = {
      type: 'container',
      raw: match[0],
      kind: match[1],
      attrs: parseAttrs(match[2] ?? ''),
      text: match[3],
      tokens: [],
    };
    this.lexer.blockTokens(match[3], token.tokens);
    return token;
  },
  renderer(token) {
    const { kind, attrs } = token;
    const inner = (tokens) => this.parser.parse(tokens);

    switch (kind) {
      case 'media-text': {
        const side = attrs.side === 'right' ? 'right' : 'left';
        return `<div class="block block--media-text block--media-${side}">
  <div class="block__media">${media({ src: attrs.src, alt: attrs.alt, poster: attrs.poster, controls: true })}</div>
  <div class="block__text prose">${inner(token.tokens)}</div>
</div>\n`;
      }
      case 'text-code': {
        // Code blocks and tables (plain or :::table) go in the code column.
        const isCode = (t) => t.type === 'code' || t.type === 'table' || (t.type === 'container' && t.kind === 'table');
        const codeTokens = token.tokens.filter(isCode);
        const textTokens = token.tokens.filter((t) => !isCode(t));
        return `<div class="block block--text-code">
  <div class="block__text prose">${inner(textTokens)}</div>
  <div class="block__code">${inner(codeTokens)}</div>
</div>\n`;
      }
      case 'media':
        return `<figure class="block block--media">${media({ src: attrs.src, alt: attrs.alt, poster: attrs.poster, controls: true })}${
          attrs.caption ? `<figcaption>${escapeHtml(attrs.caption)}</figcaption>` : ''
        }</figure>\n`;
      case 'gallery': {
        const images = [...token.text.matchAll(GALLERY_IMAGE)];
        const items = images
          .map(([, alt, src, caption]) => {
            const thumb = String(media({ src, alt }));
            // Images open full size in a new tab; placeholders and videos are shown as-is.
            const linked = src && /\.(png|jpe?g|webp|gif|avif)$/i.test(src)
              ? `<a class="gallery__link" href="${escapeHtml(src)}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(alt || 'image')} full size">${thumb}</a>`
              : thumb;
            return `<figure>${linked}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`;
          })
          .join('');
        return `<div class="block block--gallery" style="--gallery-cols:${Math.min(images.length || 1, 3)}">${items}</div>\n`;
      }
      case 'callout':
        return `<aside class="block block--callout prose">${inner(token.tokens)}</aside>\n`;
      case 'table':
        // The label and caption belong to the table inside; the table renderer reads them.
        for (const t of token.tokens) if (t.type === 'table') t.attrs = attrs;
        return inner(token.tokens);
      default:
        // Unknown block: render its contents so nothing is lost.
        return `<div class="block block--${escapeHtml(kind)} prose">${inner(token.tokens)}</div>\n`;
    }
  },
};

const marked = new Marked({
  gfm: true,
  extensions: [containerExtension],
  renderer: {
    code(token) {
      return renderCode(token);
    },
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 2) return `${sectionHeading(text, { html: true })}\n`;
      if (depth === 3) return `<h3 class="paragraph-heading">${text}</h3>\n`;
      return `<h${depth}>${text}</h${depth}>\n`;
    },
    table(token) {
      const table = Renderer.prototype.table.call(this, token);
      return `${tableBlock({ table, label: token.attrs?.label, caption: token.attrs?.caption })}\n`;
    },
    image({ href, title, text }) {
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" decoding="async">`;
    },
  },
});

/**
 * Pull `:::media` and `:::gallery` blocks out of a Markdown body, in order.
 * Returns the body without them plus [{ src, alt, poster, caption, gallery }] — gallery items open full size.
 */
export function extractMedia(source = '') {
  const items = [];
  const body = String(source).replace(
    /^:::(media|gallery)[ \t]*(\{[^\n]*\})?[ \t]*\n([\s\S]*?)\n?:::[ \t]*$/gm,
    (_, kind, attrString, text) => {
      if (kind === 'media') {
        const { src, alt, poster, caption } = parseAttrs(attrString ?? '');
        items.push({ src, alt, poster, caption });
      } else {
        for (const [, alt, src, caption] of text.matchAll(GALLERY_IMAGE)) items.push({ src, alt, caption, gallery: true });
      }
      return '';
    },
  );
  return { body, items };
}

/** Render a Markdown document body. */
export function renderMarkdown(source = '') {
  return marked.parse(String(source));
}

/** Render a single line of Markdown (bold, links, code) without a wrapping <p>. */
export function renderInline(source = '') {
  return marked.parseInline(String(source));
}
