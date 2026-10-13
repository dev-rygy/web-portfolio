---
title: Oddinary Farm
genre: Co-op Farming Sim
date: 2026-07-01
dates: May 2025 - Jul 2026
status: awaiting
roles:
  - Associate Lead Programmer
  - Game Designer
  - Sprite Artist

summary: >-
  A 2D arcade-style co-op farming game built in Unity with Netcode for GameObjects and Steamworks.
  Winner of Best Presentation at the Kaedim Indie Showcase at GDC.
description: >-
  A 2D arcade-style co-op farming game made in Unity/C# using Netcode for GameObjects and Steamworks
  Facepunch. Players plant crops, build defenses, and explore a procedurally generated landscape. Made
  with Spring Rolls Studio, it has 400+ wishlists and won Best Presentation at the Kaedim Indie Showcase at GDC.
overview: |
  Oddinary Farm is an arcade-style co-op farming game built in Unity. The game combines classic farming mechanics with chaotic gameplay by juggling casual building with a tower defense aspect. The game is made by [Spring Rolls Studio](https://oddinaryfarm.com/about), a small team made up of college graduates. The lead programmer is Khoa Ngyuen and the associate lead programmer is me, Ryan Carpenter. The game hosts peer-to-peer multiplayer utilizing Steamworks Facepunch and Unity's Netcode for GameObjects. The open playtest is out now on [Steam](https://store.steampowered.com/app/3848990/Oddinary_Farm/)!

  **My contribution**

  - **Task Management** — Created, assigned, and managed project tasks in ClickUp based on team meetings.
  - **Multiplayer Code** — Created base code for mounting objects and entities, including animals and the hot air balloon.
  - **Game Design** — Contributed many ideas to the game, including enemies, shop upgrades and items, pets, and combat mechanics.
  - **Documentation** — Constantly updated code documentation with new commits. Created conventions and style guides for both new and old developers on the project.
  - **Sprites and Animation** — Created sprites and animations including the Laser Deer, scrum enemy, brute enemy, artillery enemy, hamster, and the player HUD.

thumbnail: /assets/video/thumbs/oddFarm_thumbnail.mp4
poster: /assets/video/thumbs/oddFarm_thumbnail.jpg
video: https://www.youtube.com/watch?v=_tOKbZzo1No

links:
  steam: https://store.steampowered.com/app/3848990/Oddinary_Farm/
  github: https://github.com/colormak3r/Oddinary-Farm
  website: https://oddinaryfarm.com/
  tasks: https://sharing.clickup.com/90131661240/l/h/6-901314181332-1/c4fd09ffc50e2dc

engine: Unity
platforms:
  - PC

features:
  - title: Peer-to-peer Multiplayer
    size: big
    media: /assets/images/oddinary-farm/gameplay_2.loop.mp4
    body: |
      Unity Netcode for GameObjects, transported over Facepunch (Steamworks). Networking is deeply woven through the codebase, not confined to one layer. Allows player clients to connect to a host over the internet through Steam invites.

  - title: Procedural Generation
    size: big
    media: /assets/images/oddinary-farm/oddfarm_5.jpg
    body: |
      The system builds a synchronized island world out of four layered Perlin noise maps (elevation, moisture, ore, and resource), then streams terrain, foliage, and resources in and out around each player in real time. Map generation is done client-side with a seed to improve performance.

  - title: Inventory System
    size: big
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      Dynamic and scalable slot-based inventory system akin to *Minecraft's* system. Items are data-driven and situational. The player can perform a variety of actions depending on the item, including placement, combat, and buffs.

  - title: Object Pooling
    size: big
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      The game reuses identical items/objects instead of creating new ones to improve performance and frame rate.

  - title: Mounts
    size: big
    media: /assets/images/oddinary-farm/oddfarm_1.jpg
    body: |
      The player can mount animals and other entities to increase movement speed and other properties.

  - title: Economy
    size: big
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      Shop, wallet/currency, quotas, loot tables/generator, and gambling.

  - title: Day and Night Cycle
    size: big
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      A time scale that affects the day/night cycle of the game. This changes the state of the game and the events that happen.
---
