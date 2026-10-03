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
// `## Heading` renders as the green Section Heading; `### Heading` as a paragraph heading.

import { Marked } from 'marked';
import hljs from 'highlight.js';
import { codeBlock, media, sectionHeading } from '../templates/components/ui.js';
import { escapeHtml } from './html.js';

// HLSL/GLSL/ShaderLab are close enough to C-family syntax for highlighting.
const LANGUAGE_ALIASES = { hlsl: 'cpp', shaderlab: 'cpp', usf: 'cpp', ush: 'cpp', compute: 'cpp', blueprint: 'plaintext' };

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
        const codeTokens = token.tokens.filter((t) => t.type === 'code');
        const textTokens = token.tokens.filter((t) => t.type !== 'code');
        return `<div class="block block--text-code">
  <div class="block__text prose">${inner(textTokens)}</div>
  <div class="block__code">${codeTokens.map(renderCode).join('')}</div>
</div>\n`;
      }
      case 'media':
        return `<figure class="block block--media">${media({ src: attrs.src, alt: attrs.alt, poster: attrs.poster, controls: true })}${
          attrs.caption ? `<figcaption>${escapeHtml(attrs.caption)}</figcaption>` : ''
        }</figure>\n`;
      case 'gallery': {
        const images = [...token.text.matchAll(/!\[([^\]]*)\]\(([^)\s]*)(?:\s*"([^"]*)")?\)/g)];
        const items = images
          .map(
            ([, alt, src, caption]) =>
              `<figure>${media({ src, alt })}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`,
          )
          .join('');
        return `<div class="block block--gallery" style="--gallery-cols:${Math.min(images.length || 1, 3)}">${items}</div>\n`;
      }
      case 'callout':
        return `<aside class="block block--callout prose">${inner(token.tokens)}</aside>\n`;
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
    image({ href, title, text }) {
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" decoding="async">`;
    },
  },
});

/** Render a Markdown document body. */
export function renderMarkdown(source = '') {
  return marked.parse(String(source));
}

/** Render a single line of Markdown (bold, links, code) without a wrapping <p>. */
export function renderInline(source = '') {
  return marked.parseInline(String(source));
}
