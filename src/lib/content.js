// Loads everything in content/ and validates it, so mistakes fail the build
// with a clear message instead of producing a broken page.

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { dateValue, sortValue } from './format.js';

const COLLECTIONS = {
  projects: { dir: 'projects', route: '/projects/', required: ['title', 'date'] },
  blogs: { dir: 'blogs', route: '/blog/', required: ['title', 'date'] },
  shaders: { dir: 'shaders', route: '/shaders/', required: ['title', 'date'] },
};

const PROJECT_STATUSES = ['shipped', 'prototype', 'awaiting'];
const FEATURE_SIZES = ['big', 'sub'];
const MAX_FEATURED = 8;
const MAX_CAROUSEL = 6;

function readJson(root, file) {
  const full = path.join(root, 'content', file);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    throw new Error(`content/${file}: ${error.message}`);
  }
}

function loadCollection(root, name) {
  const { dir, route } = COLLECTIONS[name];
  const folder = path.join(root, 'content', dir);
  if (!fs.existsSync(folder)) return [];

  return fs
    .readdirSync(folder)
    .filter((file) => file.endsWith('.md') && !file.startsWith('_')) // _template.md etc. are ignored
    .map((file) => {
      const source = fs.readFileSync(path.join(folder, file), 'utf8');
      const { data, content } = matter(source);
      const slug = data.slug || file.replace(/\.md$/, '');
      return { ...data, slug, url: `${route}${slug}/`, body: content.trim(), file: `content/${dir}/${file}` };
    })
    .filter((item) => !item.draft)
    // Newest first by END date (end of `dates`, e.g. "May 2025 - Jul 2026"; "Present" = now),
    // falling back to `date`. Ties are broken by `date`, then title.
    .sort(
      (a, b) =>
        sortValue(b) - sortValue(a) ||
        dateValue(b.date) - dateValue(a.date) ||
        String(a.title).localeCompare(String(b.title)),
    );
}

/** Every local media path referenced by an item (for existence checks). */
function mediaRefs(item) {
  const refs = [item.thumbnail, item.poster, item.video, item.videoPoster, item.reflection?.image];
  for (const feature of item.features ?? []) refs.push(feature.media);
  return refs.filter(Boolean);
}

export function loadContent(root) {
  const errors = [];
  const fail = (where, message) => errors.push(`${where}: ${message}`);

  const site = readJson(root, 'site.json');
  const home = readJson(root, 'home.json');
  const experience = readJson(root, 'experience.json');
  const education = readJson(root, 'education.json');
  const toolset = readJson(root, 'toolset.json');

  const collections = {};
  for (const name of Object.keys(COLLECTIONS)) {
    collections[name] = loadCollection(root, name);
  }
  const { projects, blogs, shaders } = collections;

  const assetExists = (ref) => {
    if (!ref || /^https?:\/\//.test(ref)) return true;
    return fs.existsSync(path.join(root, ref.replace(/^\//, '')));
  };

  // ---- Collection checks ---------------------------------------------------
  for (const [name, items] of Object.entries(collections)) {
    const seen = new Set();
    for (const item of items) {
      for (const field of COLLECTIONS[name].required) {
        if (!item[field]) fail(item.file, `missing required field "${field}"`);
      }
      if (item.date && !Number.isFinite(dateValue(item.date))) {
        fail(item.file, `"date" should look like 2026-03-15 (got "${item.date}")`);
      }
      if (seen.has(item.slug)) fail(item.file, `duplicate slug "${item.slug}"`);
      seen.add(item.slug);
      for (const ref of mediaRefs(item)) {
        if (!assetExists(ref)) fail(item.file, `file not found: ${ref}`);
      }
    }
  }

  const blogSlugs = new Set(blogs.map((b) => b.slug));
  for (const project of projects) {
    if (project.status && !PROJECT_STATUSES.includes(project.status)) {
      fail(project.file, `"status" must be one of ${PROJECT_STATUSES.join(', ')} (got "${project.status}")`);
    }
    if (project.roles && !Array.isArray(project.roles)) fail(project.file, '"roles" must be a list');
    if (project.relatedBlogs && !Array.isArray(project.relatedBlogs)) fail(project.file, '"relatedBlogs" must be a list');
    for (const slug of project.relatedBlogs ?? []) {
      if (!blogSlugs.has(slug)) fail(project.file, `"relatedBlogs" links unknown blog "${slug}"`);
    }
    for (const feature of project.features ?? []) {
      if (feature.size && !FEATURE_SIZES.includes(feature.size)) {
        fail(project.file, `feature "${feature.title}": "size" must be one of ${FEATURE_SIZES.join(', ')} (got "${feature.size}")`);
      }
      if (feature.relatedBlogs) {
        fail(project.file, `feature "${feature.title}": "relatedBlogs" now goes at the project level (next to "links"), not on a feature`);
      }
    }
  }

  // ---- Homepage checks -----------------------------------------------------
  const projectSlugs = new Set(projects.map((p) => p.slug));
  const featured = home.featured ?? [];
  if (featured.length > MAX_FEATURED) fail('content/home.json', `"featured" can list at most ${MAX_FEATURED} projects`);
  for (const slug of featured) {
    if (!projectSlugs.has(slug)) fail('content/home.json', `"featured" lists unknown project "${slug}"`);
  }

  const clips = home.carousel?.clips ?? [];
  if (clips.length > MAX_CAROUSEL) fail('content/home.json', `the carousel can hold at most ${MAX_CAROUSEL} clips`);
  for (const clip of clips) {
    if (!assetExists(clip.src)) fail('content/home.json', `carousel clip not found: ${clip.src}`);
    if (clip.project && !projectSlugs.has(clip.project)) {
      fail('content/home.json', `carousel clip "${clip.src}" links unknown project "${clip.project}"`);
    }
  }

  for (const [file, entries] of [['experience.json', experience], ['education.json', education]]) {
    for (const entry of entries) {
      if (entry.logo && !assetExists(entry.logo)) fail(`content/${file}`, `logo not found: ${entry.logo}`);
    }
  }
  if (site.resume && !assetExists(site.resume)) fail('content/site.json', `resume not found: ${site.resume}`);

  if (errors.length) {
    const error = new Error(`Content problems found:\n  - ${errors.join('\n  - ')}`);
    error.contentErrors = errors;
    throw error;
  }

  return { site, home, experience, education, toolset, projects, blogs, shaders };
}
