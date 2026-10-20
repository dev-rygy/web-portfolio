---
title: The Devil's Diner
genre: Arcade Cooking
date: 2024-04-01
dates: Apr 2024
status: shipped
roles:
  - Gameplay Programmer

summary: >-
  A Hell-themed cooking game first built in 72 hours for Ludum Dare 50, then ported to iOS and Android
  in Unity. Serve demons in Hell's most treacherous kitchen.
description: >-
  First built in 72 hours with a small team for Ludum Dare Game Jam #50, then extended into a Unity build
  for iOS and Android. The player is doomed to make meals for demons in Hell's most treacherous kitchen.
  I implemented the crafting system, interactive UI, leaderboard, cutscenes, and level progression.
overview: |
  *The Devil's Diner* was created with a small team of developers for [Ludum Dare Game Jam #50](https://ldjam.com/events/ludum-dare/50). Ludum Dare is one of the largest game jams in the world, challenging participants to create a complete game in 72 hours based on a particular theme. The theme for this jam was "Every 10 Seconds," so we came up with the idea of a cooking game where every 10 seconds a new customer comes in. To put a unique spin on the genre, we made the aesthetic Hell-inspired: the player must serve demons in the hopes of saving his soul.

  After the jam, the game was extended into a Unity build for iOS and Android. I implemented core gameplay systems including the crafting system, interactive UI, leaderboard, cutscenes, and level progression, and adapted the controls and UI for touch input during the mobile port.

thumbnail: /assets/video/thumbs/the_devils_diner_thumbnail.mp4
poster: /assets/video/thumbs/the_devils_diner_thumbnail.jpg
video: /assets/images/devils-diner-images/devil_title.jpg

links:
  itch: https://madcolors-entertainment.itch.io/the-devils-diner
  github: https://github.com/dev-rygy/The-Devils-Diner

engine: Unity
platforms:
  - Web
  - iOS
  - Android

features:
  - title: Gameplay
    size: big
    significance: trivial
    media: /assets/images/devils-diner-images/devils_gameplay.png
    body: |
      The player is given 5 stars at the start of a new run and can lose those stars if they fail to serve customers on time. Up to six demons can sit at the counter and order food; an order will appear as a ticket on the left. The player must gather the correct ingredients for the dish while juggling other demons' orders in the queue. The game is endless, challenging players to survive as long as possible while aiming for a high score.

      :::gallery
      ![The Devil's Diner screenshot](/assets/images/devils-diner-images/devils_gameplay1.png)
      ![The Devil's Diner screenshot](/assets/images/devils-diner-images/devils_gameplay2.png)
      ![The Devil's Diner screenshot](/assets/images/devils-diner-images/devils_gameplay3.png)
      ![The Devil's Diner screenshot](/assets/images/devils-diner-images/devils_gameplay4.png)
      :::

  - title: Dynamic UI
    size: sub
    body: |
      Includes a menu for navigating game elements such as the ticket system, order display, demon aggression levels, and more.

  - title: Global Leaderboard System
    size: sub
    body: |
      A leaderboard system that uses a third-party service to display global rankings of players worldwide.

  - title: Crafting System
    size: sub
    body: |
      A scalable system that allows the player to mix and match ingredients to make meals.

  - title: Intro Cutscene
    size: sub
    body: |
      The Satan cutscene includes a dialogue system with a typewriter and shake effect.

  - title: Dynamic Particle Systems
    size: sub
    body: |
      Noise particle systems for cooking effects: steam particles, cauldron particles, and bubble particles.

  - title: Save System
    size: sub
    body: |
      A file save system that utilizes a JSON format.

  - title: Options Menu
    size: sub
    body: |
      A menu to tweak sound and music volume levels.

  - title: Music and Sound
    size: sub
    body: |
      Sounds found on free websites like [OpenGameArt](https://opengameart.org/) and mixed.
---
