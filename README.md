# ryancarpenterpf.dev

Ryan Carpenter's portfolio. Plain HTML, CSS and JavaScript, generated from simple content
files by a small Node script and hosted on GitHub Pages.

- **Design:** [Figma — Portfolio High-Fidelity Prototype](https://www.figma.com/design/PV98jfctonoIFECz16yQGv/Portfolio--High-Fidelity-Prototype)
- **Requirements:** [`REQUIREMENTS.md`](REQUIREMENTS.md)
- **Component reference:** `/elements.html` (published but hidden — not linked, not indexed)

## Quick start

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install        # once
npm run dev        # preview at http://localhost:4321 — rebuilds and reloads as you edit
npm run build      # build the finished site into dist/
```

## Adding and editing content

Everything you write lives in `content/`. You never need to touch `src/` to add things.

| What | Where | How |
| --- | --- | --- |
| A project | `content/projects/<name>.md` | Copy `example-project.md`. The file name becomes the URL (`/projects/<name>/`). |
| A blog post | `content/blogs/<name>.md` | Copy `example-blog.md`. |
| A shader | `content/shaders/<name>.md` | Copy `example-shader.md`. |
| Homepage featured projects | `content/home.json` → `featured` | List up to 8 project file names (without `.md`) in the order you want. |
| Homepage carousel | `content/home.json` → `carousel` | Up to 6 clips. See *Media* below. |
| Experience / Education | `content/experience.json`, `content/education.json` | One entry per job/school, most recent first. |
| Engineering toolset | `content/toolset.json` | Add/remove chips in each group. |
| Name, socials, footer, email, page intros | `content/site.json` | |

The example files explain every field in comments. Blank fields are simply hidden, so a
project without a "Thoughts & Reflection" or related blogs just won't show those sections.
Lists are ordered newest-first by each file's `date`.

**Drafts:** add `draft: true` to a file's frontmatter, or start its name with `_`, to keep it
off the site.

The build checks your content and stops with a clear message if something is wrong — a
missing title, a typo in a status, a related blog that doesn't exist, an image path that
doesn't match a file, and so on.

### Writing posts (Markdown blocks)

Blog and shader bodies are Markdown, plus a few layout blocks. All of them are shown on
`/elements.html` and used in `content/blogs/example-blog.md`.

````md
## Green section heading
### Paragraph heading

:::media-text {src="/assets/images/clip.mp4" side="left" alt="What it shows"}
Text beside an image, video or YouTube link. Use side="right" to flip it.
:::

:::text-code
Explanation beside a code block.
```hlsl label="Dissolve" caption="Optional caption"
clip(noise - _Cutoff);
```
:::

:::media {src="/assets/images/shot.png" caption="Full-width media"}
:::

:::gallery
![Before](/assets/images/before.png "Optional caption")
![After](/assets/images/after.png)
:::

:::callout
A highlighted takeaway.
:::
````

### Media

- Put images and short videos anywhere under `assets/` (e.g. `assets/projects/my-game/`) and
  reference them from content as `/assets/projects/my-game/thumb.jpg`.
- Card thumbnails can be an image **or** a short silent `.mp4` loop; videos only play while
  the card is on screen.
- Video fields also accept a YouTube URL.
- **Carousel clips and the header graphic** are compressed for the web from the originals in
  `source-media/`. Drop a new clip into `source-media/carousel/`, run `npm run media`
  (needs [ffmpeg](https://ffmpeg.org)), then add it to `content/home.json`, for example
  `{ "src": "/assets/video/carousel/my-clip.mp4", "project": "my-game", "start": 5 }`.
  `project` makes the clip link to that project page; `start` and `maxSeconds` (default 15)
  choose which part plays.

## Changing colors and fonts

All colors, fonts and sizes are CSS variables in [`src/css/tokens.css`](src/css/tokens.css),
named after the Figma variables. Change a value there and it updates everywhere.

## Contact form

Messages are sent with [EmailJS](https://www.emailjs.com) using the keys in
`content/site.json` → `emailjs`. The EmailJS template should use the variables
`{{name}}`, `{{email}}`, `{{message}}` and `{{sent_at}}`, with *To Email* set to your own
address (never a variable).

## Visitor stats

Create a site at [goatcounter.com](https://www.goatcounter.com) and put its code (the part
before `.goatcounter.com`) in `content/site.json` → `goatcounter`. Leave it empty to disable.
The elements and 404 pages are never counted.

## Project layout

```
content/        ← everything you edit
assets/         ← images, logos, resume, generated video (published as /assets/…)
source-media/   ← original videos/GIFs (not published; `npm run media` converts them)
src/
  css/          ← tokens.css (colors), base, layout, components, pages
  js/           ← header typewriter + noise, nav, carousel, card videos, contact form
  templates/    ← page templates and components (plain JS that returns HTML)
  lib/          ← content loading/validation, Markdown, helpers
scripts/        ← build.mjs, dev.mjs, media.mjs
dist/           ← build output (not committed)
```

## Deployment

`.github/workflows/deploy.yml` builds the site on every push and deploys pushes to `main` to
GitHub Pages. The `CNAME` file keeps the custom domain `ryancarpenterpf.dev`.

**Launch checklist** (moving from the old site in this repo):

1. In **Settings → Pages**, set **Source** to **GitHub Actions** *before* merging, so the
   repository's raw source files are never served.
2. Save the old site: create a `legacy-site` branch from the current `main`.
3. Merge `redesign` into `main` (or replace `main` with it). The workflow builds and deploys.
4. Check that **Enforce HTTPS** is still on and the custom domain still shows `ryancarpenterpf.dev`.

To roll back, set the Pages source back to "Deploy from a branch" and point it at `legacy-site`.
