---
title: Star Raid
genre: Co-op Survival
date: 2021-01-01
dates: 2020 - 2021
status: prototype
roles:
  - Gameplay Programmer
  - Artist

summary: >-
  An ambitious co-op survival game set on a ship stranded in deep space, with peer-to-peer multiplayer,
  crafting, and A* pathfinding enemies.
description: >-
  A once very ambitious project developed with a colleague. Development halted as the project's growing
  scope outweighed our plans to continue. The game focused on co-op gameplay and featured P2P
  multiplayer, a crafting system, A* pathfinding for enemies, raycast projectiles, and a command system.
  All assets and artwork are my own.
overview: |
  *Star Raid* is a game I started with a friend back in 2020. We planned on making it into a full game but decided to halt development because the scope had grown too large, and we wanted to move on to a more tangible project.

  The game is set in space with a focus on multiplayer. The player(s) must try to survive against multiple waves of aliens that invade a ship stranded in deep space. All assets and artwork are my own.

# No images for Star Raid were brought over yet — add a thumbnail and media here when you have them.
thumbnail: ""

links:
  github: https://github.com/dev-rygy/Star-Raid

engine: Unity (Mirror)

features:
  - title: Gameplay
    size: sub
    body: |
      The game starts in the hangar of the ship. The player(s) spawn near their crashed ship, and they must explore and survive the alien waves that frequently invade the ship. The ship is randomly generated, which means the loot and rooms on the ship change each run. Special rooms hold machines that are vital to the ship's functions: the radar helps locate valuable loot, the generator powers the ship and keeps the lights on, and so on.

      The player(s) must defend the machines as much as they can, or risk their defense to scavenge for loot. Players can craft items and structures that help them defend and repair the ship. Some items require heavy defending, as the container they are in can be easily destroyed by enemies. The end goal is to repair their former ship, repair the big ship they are on, or take an escape pod.

  - title: Peer-to-Peer Server Model
    size: sub
    body: |
      Co-op done using Mirror, an open source networking tool for Unity. A player's system acts as the server and connects to all the other clients. This system is highly subject to cheating, but we did not plan to have any sort of competitive play or leaderboard, so it suited our type of game.

  - title: Command Line
    size: sub
    body: |
      A command line that can be used in real time for debugging purposes.

  - title: Random Generation
    size: sub
    body: |
      Each room on the ship is randomly generated with respect to type and loot to add diversity throughout each run.

  - title: Crafting System
    size: sub
    body: |
      A scalable system that allows the player to craft items and structures like health kits and turrets.

  - title: Bullet Raycasting
    size: sub
    body: |
      To save on performance, we used raycasting/hitscan for bullets. Bullets still come out of the gun, but as a visual effect handled on the client.

  - title: Placeable Objects
    size: sub
    body: |
      Certain objects in the player's inventory can be placed on a ground tile and act as either an aid for the player or a defense against enemies.

  - title: A* Pathfinding
    size: sub
    body: |
      A* is a highly optimal pathfinding algorithm that uses a graph traversal search through nodes to find the most desirable path to a target.

  - title: Music and Sound
    size: sub
    body: |
      Sounds found on free websites like [OpenGameArt](https://opengameart.org/) and mixed.
---
