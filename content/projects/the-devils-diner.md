---
title: The Devil's Diner
genre: Arcade Cooking
date: 2024-04-01
dates: Apr 2024
status: shipped
roles:
  - Gameplay Programmer

summary: >-
  A Hellish-themed cooking game first built in 72 hours for Ludum Dare 50, then ported to iOS and Android
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
video: /assets/video/thumbs/the_devils_diner_thumbnail.mp4

links:
  itch: https://madcolors-entertainment.itch.io/the-devils-diner
  github: https://github.com/dev-rygy/The-Devils-Diner

engine: Unity
platforms:
  - Web
  - iOS
  - Android

reflection:
  image: "/assets/images/devils-diner-images/devil_title.jpg"
  qa:
    - question: Three-Day Jam vs Full Production Game
      answer: |
        After the jam, our Ludum Dare team decided to keep developing the game. We already had a working prototype in front of us, so we figured all it needed was a more streamlined progression system and some polish before it was ready to release. At least, that's what we thought. In reality, the game took months more to develop. Our main programmer decided to rework the entire codebase because it was messy and wouldn't scale. The systems were there, but the architecture couldn't keep up with changing requirements, which is no surprise for code written in 72 hours. On top of that, we realized a full release of *The Devil's Diner* would take far more than we had anticipated. To be worth paying for, it would need a campaign, an endless mode, upgrades, and a shop. We could have scrapped many of those, but we didn't think that stripped-down version would be worth a Steam release.

        The biggest lesson was that a jam prototype proves an idea is fun, not that the game is close to finished. Jam code is written to survive one weekend, and turning it into a product means rebuilding the foundation as much as adding new features.

    - question: Primary Setbacks Before Release
      answer: |
        The largest setback of turning a jam game into a real title was scope creep. As mentioned above, we wanted a full campaign running from the tutorial to the final boss (Satan), an endless mode to give players a reason to keep playing after finishing the campaign, and a shop where players could buy cosmetics with a secondary currency earned by reaching checkpoints in both modes. All of this, on top of polishing the game, stretched development to around five months, far beyond our original plan of just four weeks.

        Each feature sounded small on its own, but together they multiplied the work of balancing, testing and polishing. If I did it again, I would lock the scope before writing any new code: define the smallest version worth releasing, ship that, and treat everything else as post-launch updates.

    - question: Teamwork Insights
      answer: |
        The biggest thing I've learned from working with teams, on jams and many other projects, is that people naturally settle into roles over time, especially once features start piling up in the backlog. On this project, I took on the roles of artist and animator alongside my programming work. I made all of the sprites, tiles and sprite sheets, animated them with Unity's Animator and Dope Sheet, and then hooked those animations into the scripts that needed them.

        Stepping into the roles the team was missing, rather than sticking to the one I started with, kept work from stalling. And because I was both making the art and wiring it into the code, I could fix an animation or swap a sprite without waiting on a handoff.
---
