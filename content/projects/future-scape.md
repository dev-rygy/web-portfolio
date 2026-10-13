---
title: Future Scape
genre: VR Career Explorer
date: 2025-04-01
dates: Jun 2024 - Apr 2025
status: shipped
roles:
  - Gameplay Programmer
  - Game Designer

summary: >-
  A virtual reality career explorer for primary and middle school students, built for ASU Enterprise
  Technology. I created the pharmacy, manufacturing, and urban planning minigames.
description: >-
  Developed for Enterprise Technology, this virtual reality career explorer targets primary and middle
  school students. It features a variety of minigames exploring careers like pharmacology,
  manufacturing, forensic science and more. I solely created the pharmacy, manufacturing, and urban
  planning minigames.
overview: |
  Developed for [Enterprise Technology](https://tech.asu.edu/), *Future Scape* is a virtual career exploration tool designed for K-12 students. The project features interactive minigames, each attempting to emulate different careers such as pharmacology, manufacturing, forensic science, etc.

  I specifically designed and developed the **pharmacy**, **manufacturing**, and **urban planning** minigames. In the pharmacy minigame, players act as pharmacists, dispensing medications to patients within a time limit. The manufacturing minigame challenges players to build assembly lines and create products while managing a budget. The urban planning minigame involves designing a city and managing resources and budgeting effectively.

thumbnail: /assets/video/thumbs/futurescape_thumbnail.mp4
poster: /assets/video/thumbs/futurescape_thumbnail.jpg
video: /assets/video/carousel/futurescape_carousel.mp4
videoPoster: /assets/video/carousel/futurescape_carousel.jpg

links:
  itch: https://nextlab.itch.io/futurescape
  website: https://nextlab.asu.edu/futurescape

engine: Unity (XR Interaction Toolkit)
platforms:
  - VR

features:
  - title: Gameplay
    size: big
    significance: trivial
    media: /assets/images/future_scape_images/manufacturing_demo3.png
    body: |
      The gameplay varies across minigames, all accessible via portals from a main hub. Each game introduces unique challenges, from solving forensic puzzles to managing complex economic systems and building cities. The games that I created employ a sandbox-like environment where players can place and remove objects on a grid system without overlap, facilitated by an economy and resource system for object selection and placement.

      :::gallery
      ![Pharmacy minigame](/assets/images/future_scape_images/pharm_demo.png)
      ![Urban planning minigame](/assets/images/future_scape_images/urban_plan_demo2.png)
      ![Forensic science minigame](/assets/images/future_scape_images/biol_demo.png)
      ![Manufacturing minigame](/assets/images/future_scape_images/manufacturing_demo2.png)
      :::

  - title: XR Development Kit
    size: sub
    body: |
      Leverages Unity's XR Development Kit to create immersive VR experiences, featuring locomotion, grabbing, raycasting, and other interactive elements suitable for a VR headset.

  - title: Sandbox Building
    size: sub
    body: |
      Utilized in both manufacturing and urban planning, this feature includes grid snapping and spatial memory for object placement. The player may place and remove objects in a way that does not conflict with the placement of others. The player may rotate and select a variety of objects with the help of a transparent green silhouette in the shape of the selected mesh.

  - title: Component Linking
    size: big
    significance: trivial
    media: /assets/images/future_scape_images/manufacturing_demo.png
    body: |
      In manufacturing, components are machines that can be linked via conveyor belts to create assembly lines. A complex system handles items that interact with these components: input item(s) are detected and accepted if a possible output item can be created.

  - title: Economy Systems
    size: sub
    body: |
      Both in urban planning and manufacturing, the player must manage a budget in order to purchase and place objects in the world. Income can also be provided through passive means to help the player build quickly and prevent soft locking.

  - title: Resource Management Systems
    size: big
    significance: trivial
    media: /assets/images/future_scape_images/urban_plan_demo.png
    body: |
      In urban planning, managing resources is critical to making sure your city is stable and functional. Each building has required and provided resources. Required resources must be met before a building can be taxed. Players strategize to balance required and available resources to optimize city operations.

  - title: Particle Systems and Shaders
    size: big
    significance: trivial
    media: /assets/images/future_scape_images/main_hub_demo.png
    body: |
      Particles include ambient dust in manufacturing, and fireflies in astronomy. Shaders include the portals in the main hub room and the relay pad in urban planning. All shaders were made using Unity's Shader Graph.
---
