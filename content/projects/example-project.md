---
# ─────────────────────────────────────────────────────────────────────────────
# EXAMPLE PROJECT — copy this file to add a project, then delete it.
# The file name becomes the URL: example-project.md → /projects/example-project/
# Anything left blank is simply hidden on the site.
# ─────────────────────────────────────────────────────────────────────────────

title: Example Project
genre: Action Roguelike                 # shown on the card under the title
date: 2026-06-01                        # YYYY-MM-DD — sets the order (newest first)
status: prototype                       # shipped | prototype | awaiting
roles:                                  # chips on the card + "My Roles" in the metrics
  - Gameplay Programmer
  - Technical Artist

summary: >-
  One or two sentences for the small homepage card. Keep it short — it is cut off after three lines.
description: >-
  A slightly longer summary used on the Projects page card (cut off after four lines) and as a
  fallback for the page description if the body below is empty.

thumbnail: ""        # card media: an image (.jpg/.png/.webp) or a short silent .mp4 loop — blank = placeholder
poster: ""           # optional still frame shown before a video thumbnail starts
video: ""            # Overview media on the project page: .mp4 path or a YouTube URL (blank = thumbnail)

links:               # any you leave out are hidden
  github: https://github.com/dev-rygy
  steam: ""
  itch: ""

engine: Unity 6
platforms:
  - PC
  - Mobile

features:            # "Technical Features" — one block per feature, in this order
  - title: Feature One
    media: ""        # image, .mp4 or YouTube URL beside the text
    body: |
      Explain what the feature does and how you built it. **Markdown** works here,
      including `inline code` and lists:

      - Point one
      - Point two
    relatedBlogs:    # blog file names (without .md); leave empty to hide "Related Blogs"
      - example-blog
  - title: Feature Two
    media: ""
    body: |
      A second feature. Features without related blogs simply skip that row.

reflection:          # "Thoughts & Reflection" — remove the whole block to hide the section
  image: ""          # tall image on the left (roughly 1:2, portrait)
  qa:
    - question: What did I learn?
      answer: Your answer. Markdown works here too.
    - question: What would I change?
      answer: Your answer.
    - question: Upcoming Features
      answer: Your answer.
---

This is the **Overview** text shown beside the project video. Write as much as you like in
normal Markdown — paragraphs, **bold**, [links](https://ryancarpenterpf.dev), lists and so on.

A second paragraph works the same way.
