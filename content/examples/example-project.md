---
# ─────────────────────────────────────────────────────────────────────────────
# EXAMPLE PROJECT — copy this file to add a project, then delete it.
# The file name becomes the URL: example-project.md → /projects/example-project/
# Anything left blank is simply hidden on the site.
# ─────────────────────────────────────────────────────────────────────────────

title: Example Project
genre: Action Roguelike                 # shown on the card under the title
date: 2026-06-01                        # YYYY-MM-DD — used for ordering when "dates" is blank
dates: ""                               # optional, e.g. "May 2025 - Jul 2026" or "Nov 2024 - Present" — shown on the card;
                                        # lists are ordered newest-first by its END date ("Present" = newest)
status: prototype                       # shipped | prototype | awaiting
roles:                                  # chips on the card + "My Roles" in the metrics
  - Gameplay Programmer
  - Technical Artist

summary: >-
  One or two sentences for the small homepage card. Keep it short — it is cut off after three lines.
description: >-
  A slightly longer summary used on the Projects page card (cut off after four lines) and as a
  fallback for the Overview text if "overview" is empty.
overview: |                             # keep every line indented two spaces, blank lines between paragraphs
  This is the **Overview** text shown beside the project video. Write as much as you like in
  normal Markdown — paragraphs, **bold**, [links](https://ryancarpenterpf.dev), lists and so on.

  A second paragraph works the same way.

thumbnail: ""        # card media: an image (.jpg/.png/.webp) or a short silent .mp4 loop — blank = placeholder;
                     # a featured project's .mp4 also plays in the homepage carousel
poster: ""           # optional still frame shown before a video thumbnail starts
video: ""            # Overview media on the project page: .mp4 path or a YouTube URL (blank = thumbnail)
videoPoster: ""     # optional still frame for an .mp4 overview video

links:               # any you leave out are hidden; also available: website, youtube, tasks (task board)
  github: https://github.com/dev-rygy
  steam: ""
  itch: ""

engine: Unity 6
platforms:
  - PC
  - Mobile
relatedBlogs:        # blog file names (without .md), shown under the metrics in the Overview; leave empty to hide
  - example-blog

featuresComment: "// Systems that I've contributed to"   # small comment under the "Technical Features" heading;
                                                         # "" hides it (left out = this default text)
features:            # "Technical Features" tab panel, in this order — leave empty to hide the section
  - title: Feature One
    size: big        # big = its own tab: green heading, text, media beside the text
                     # sub = goes inside the tab of the big feature above it: small heading, media under the text,
                     #       two per row (sub features before the first big one go in the first tab)
                     # leave out to decide by content: big if it has media, otherwise sub
    significance: trivial   # big features only: important = gold shine + sparkle on the tab text
                            #                    trivial (or left out) = plain tab
    tabText: ""      # big features only: text on the tab (blank = same as the title)
    media: ""        # image, .mp4 or YouTube URL (optional for either size)
    body: |
      Explain what the feature does and how you built it. **Markdown** works here,
      including `inline code` and lists:

      - Point one
      - Point two
  - title: Feature Two
    size: sub
    media: ""
    body: |
      A sub feature. It shows inside the "Feature One" tab, below it.

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
