---
title: Rogue Nebula
genre: Top-Down Bullet Hell
date: 2023-07-01
dates: Jun 2023 - Jul 2023
status: shipped

summary: >-
  A 3D top-down bullet hell made for the Video Game Development Club's summer session. Survive endless
  waves of enemies in pursuit of a high score.
description: >-
  Developed for the Video Game Development Club's summer session, this game challenges players to survive
  endless waves of enemies in pursuit of a high score. Inspired by Galaga, Defender (1981), and Space
  Invaders, it features an ability system, dynamic progression, reactive UI, vibrant effects, and varied
  enemy behaviors.
overview: |
  Developed during the summer session of the [Video Game Development Club](https://asu.campuslabs.com/engage/organization/vgdc), *Rogue Nebula* challenges players to survive endless waves of enemies while aiming for a high score.

  Heavily inspired by classic arcade titles like *Galaga*, *Defender (1981)*, and *Space Invaders*, the game features a scrolling 3D environment, reactive UI, vibrant special effects, and diverse enemy behaviors. Play it in the browser on [itch.io](https://heatwave-studios.itch.io/rogue-nebula).

thumbnail: /assets/video/thumbs/rogue_thumbnail.mp4
poster: /assets/video/thumbs/rogue_thumbnail.jpg
video: /assets/video/carousel/rogue_carousel.mp4
videoPoster: /assets/video/carousel/rogue_carousel.jpg

links:
  itch: https://heatwave-studios.itch.io/rogue-nebula
  github: https://github.com/GDCASU/SummerSession2023

engine: Unity
platforms:
  - Web

features:
  - title: Gameplay
    size: big
    significance: trivial
    media: /assets/images/rogue-nebula-images/nebula_gameplay.png
    body: |
      The player begins by entering their name for a leaderboard entry; if a name is not selected, they are labeled "anonymous." When start is pressed, the player is thrust into battle immediately as endless waves of enemies barrage the screen. To survive, players must dodge incoming projectiles and retaliate with the weapons in their arsenal. To aid survival, players can use special abilities and select a wide array of weapons.

      Every eight waves, the difficulty increases, with the hardest level starting after wave sixteen. Enemies continue to scale with the difficulty, keeping the game a challenging and rewarding bullet-hell experience. High scores are displayed for other players who open the game.

      :::gallery
      ![Rogue Nebula gameplay](/assets/images/rogue-nebula-images/nebula_gameplay2.png)
      ![Rogue Nebula gameplay](/assets/images/rogue-nebula-images/nebula_gameplay3.png)
      ![Rogue Nebula title screen](/assets/images/rogue-nebula-images/nebula_title.jpg)
      :::

  - title: High Score System
    size: sub
    body: |
      The high score persists across playthroughs using Unity's Scriptable Object system and a JSON save format.

  - title: Player Abilities
    size: sub
    body: |
      The player is given a small set of unique abilities. Players can use an "Evade" ability, providing brief invulnerability and extra speed, and the "Bubble Shield," granting extended invulnerability. Each ability has a cooldown timer displayed on the HUD that communicates when abilities will be available again.

  - title: Enemy Variety
    size: sub
    body: |
      The game includes four enemy types: a basic enemy that flies back and forth, shooting periodically; radial enemies that fire bullets in all directions; bomber enemies that drop fused bombs; and homing enemies that track and shoot at the player's position.

  - title: Enemy Variants
    size: sub
    body: |
      Each enemy type has its own movement and attack patterns, plus variants that increase attack speed, movement speed, health, and fire rate as the difficulty of the game changes.

  - title: Dynamic Wave System
    size: sub
    body: |
      The game reacts to the player's wave count. Every ten waves, new enemies are introduced, and more challenging variants of basic enemies appear.

  - title: Particle System and Shaders
    size: sub
    body: |
      The game incorporates arcade-inspired hit and explosion particles, with voxel-based 3D effects and dynamic hit effects that change color based on the damaged entity.
---
