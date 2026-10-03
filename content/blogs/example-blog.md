---
# ─────────────────────────────────────────────────────────────────────────────
# EXAMPLE BLOG POST — copy this file to add a post, then delete it.
# The file name becomes the URL: example-blog.md → /blog/example-blog/
# ─────────────────────────────────────────────────────────────────────────────

title: Example Blog Post
genre: Devlog                 # shown on the card under the title
date: 2026-05-20              # YYYY-MM-DD — newest posts appear first
summary: >-
  A short summary for the blog card and link previews. It is cut off after three lines on the card.
thumbnail: ""                 # image or short silent .mp4 loop — blank = placeholder
poster: ""
video: ""                     # optional media for the top of the post (.mp4 or YouTube URL); blank = thumbnail
links:
  github: ""
# metrics:                    # optional — replaces the default Genre / Date / Links pane
#   - title: Engine
#     items: [Unity 6]
---

## Section Heading

Plain Markdown paragraphs become normal body text. Use `## ` for a green section heading and
`### ` for a smaller paragraph heading.

:::media-text {src="" side="left" alt="Describe the media"}
### Media beside text

Put an image, `.mp4` or YouTube link in `src`, and choose `side="left"` or `side="right"`.
Leave `src` empty to see the placeholder.
:::

:::text-code
### Text beside code

Explain the snippet here. The code block on the right uses your Figma code colors.

```hlsl label="Dissolve edge" caption="A label and caption are optional."
float noise = tex2D(_NoiseTex, i.uv).r;
float edge = step(noise, _Cutoff);
return lerp(_EdgeColor, col, edge);
```
:::

```csharp label="Full-width code"
public class Example : MonoBehaviour
{
    private int someNumber = 30;
    private void Update() { }
}
```

:::callout
**Callout:** use this for a key takeaway or a note you want to stand out.
:::

:::gallery
![First image]( "Captions are optional — put an image path before the quotes")
![Second image]()
![Third image]()
:::
