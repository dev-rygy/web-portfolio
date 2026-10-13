---
title: Bloodlust
genre: Survival
date: 2021-10-01
dates: "2021"
status: prototype
roles:
  - Gameplay Programmer
  - Artist

summary: >-
  A vampire survival game made with a colleague in 72 hours for Ludum Dare 49 — study your victims'
  schedules and strike before your blood runs out.
description: >-
  Developed with a colleague for Ludum Dare Game Jam #49, this game features AI with A* pathfinding, a
  dynamic NPC scheduling system, a day and night cycle, and an inventory system. All assets and artwork
  are my own.
overview: |
  *Bloodlust* is a game I created with a colleague for [Ludum Dare Game Jam #49](https://ldjam.com/events/ludum-dare/49). Ludum Dare is one of the largest game jams in the world, challenging participants to create a complete game in 72 hours based on a particular theme. The theme was "Prevent the Inevitable," and given the timing near Halloween, we designed a game about a vampire who must feast on victims to survive.

  The game features AI with A* pathfinding, a dynamic NPC scheduling system, a day and night cycle, and an inventory system. All assets and artwork are my own.

thumbnail: /assets/images/bloodlust-images/blood_title.jpg
video: /assets/images/bloodlust-images/blood_gameplay5.png

links:
  itch: https://madcolors-entertainment.itch.io/bloodlust
  github: https://github.com/MaDness1184/Bloodlust-LDGJ-Version

platforms:
  - Web

features:
  - title: Gameplay
    size: big
    media: /assets/images/bloodlust-images/blood_gameplay3.png
    body: |
      The player starts with a full blood count that decreases over time. Once it reaches zero, the player dies. Study your victims' schedules closely and find the best time to strike, but be cautious — if a victim escapes, they'll alert the nearby guards. The player can take advantage of the weapons some NPCs drop to kill more effectively. The aim of the game is to survive and accrue as many kills as possible.

      :::gallery
      ![Bloodlust screenshot](/assets/images/bloodlust-images/blood_gameplay4.png)
      ![Bloodlust screenshot](/assets/images/bloodlust-images/blood_gameplay2.png)
      ![Bloodlust screenshot](/assets/images/bloodlust-images/blood_gameplay.png)
      :::

  - title: Day and Night Cycles
    size: sub
    body: |
      The time scale of the game affects the day/night cycle. This in turn affects NPC awareness during certain times.

  - title: Dynamic NPC Schedules
    size: sub
    body: |
      NPCs follow specific schedules based on delta time and utilize pathfinding.

  - title: Dynamic NPC Behavior
    size: sub
    body: |
      NPCs react to the player's attacks through a suspicion system, becoming wary or seeking help from guards.

  - title: Inventory System
    size: sub
    body: |
      An inventory system determines what the player has in their arsenal at a given time.

  - title: Music and Sound
    size: sub
    body: |
      Sounds found on free websites like [OpenGameArt](https://opengameart.org/) and mixed.
---
