---
# ─────────────────────────────────────────────────────────────────────────────
# EXAMPLE SHADER — copy this file to add a shader, then delete it.
# The file name becomes the URL: example-shader.md → /shaders/example-shader/
# ─────────────────────────────────────────────────────────────────────────────

title: Example Dissolve
type: Shader                  # Shader | VFX | Post-Process — prefixes the card title
language: HLSL                # shown on the card next to the date
date: 2026-04-10              # YYYY-MM-DD — newest first
description: >-
  The long-form summary shown on the Shaders page card (cut off after four lines) and at the top
  of the shader page.
thumbnail: ""                 # image or short silent .mp4 loop — blank = placeholder
poster: ""
video: ""                     # optional media at the top of the page (.mp4 or YouTube URL)
links:
  github: https://github.com/dev-rygy
---

## Breakdown

The body uses the same Markdown blocks as blog posts — see `content/blogs/example-blog.md`.

:::text-code
### How it works

A noise texture is compared against a cutoff value; pixels below the cutoff are clipped and a
thin colored edge is drawn where the two meet.

```hlsl label="Dissolve" caption="Fragment shader excerpt."
float noise = tex2D(_NoiseTex, i.uv).r;
clip(noise - _Cutoff);
float edge = 1 - smoothstep(0.0, _EdgeWidth, noise - _Cutoff);
col.rgb = lerp(col.rgb, _EdgeColor.rgb, edge);
```
:::
