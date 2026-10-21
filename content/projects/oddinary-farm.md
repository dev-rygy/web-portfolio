---
title: Oddinary Farm
genre: Co-op Farming Sim
date: 2026-07-01
dates: May 2025 - Jul 2026
status: awaiting
roles:
  - Associate Director
  - Gameplay Programmer
  - Sprite Artist

summary: >-
  A 2D arcade-style co-op farming game built in Unity with Netcode for GameObjects and Steamworks.
  Winner of Best Presentation at the Kaedim Indie Showcase at GDC.
description: >-
  A 2D arcade-style co-op farming game made in Unity/C# using Netcode for GameObjects and Steamworks
  Facepunch. Players plant crops, build defenses, and explore a procedurally generated landscape. Made
  with Spring Rolls Studio, it has 400+ wishlists and won Best Presentation at the Kaedim Indie Showcase at GDC.
overview: |
  Oddinary Farm is an arcade-style co-op farming game built in Unity. The game combines classic farming mechanics with chaotic gameplay by juggling casual building with a tower defense aspect. The game is made by [Spring Rolls Studio](https://oddinaryfarm.com/about), a small team made up of college graduates. 
  
  The lead programmer is Khoa Nguyen and I was the associate lead programmer. The game hosts peer-to-peer multiplayer utilizing Steamworks Facepunch and Unity's Netcode for GameObjects. The open playtest is out now on [Steam](https://store.steampowered.com/app/3848990/Oddinary_Farm/)!

thumbnail: /assets/video/thumbs/oddFarm_thumbnail.mp4
poster: /assets/video/thumbs/oddFarm_thumbnail.jpg
video: https://www.youtube.com/watch?v=_tOKbZzo1No

links:
  steam: https://store.steampowered.com/app/3848990/Oddinary_Farm/
  website: https://oddinaryfarm.com/
  tasks: https://sharing.clickup.com/90131661240/l/h/6-901314181332-1/c4fd09ffc50e2dc

engine: Unity
platforms:
  - PC

featuresComment: "// Systems that I've contributed to"
features:
  - title: Steam Lobbies & Invites
    tabText: Multiplayer
    size: big
    significance: important
    media: /assets/images/oddinary-farm/gameplay_2.loop.mp4
    body: |
      Oddinary Farm is peer-to-peer co-op built on Unity Netcode for GameObjects and Facepunch Steamworks. One player hosts from their own PC, friends join through Steam, and all traffic runs over Steam Datagram Relay, so nobody forwards ports and players never see each other's IP addresses. On top of the team's networking layer, I built the lobby and invite flow that every player goes through to get into a game, in the open Steam playtest and at our events.

  - title: Lobby Hosting & Visibility
    size: sub
    body: |
      Players never type an IP address. They connect to a SteamID, and the Steam lobby is where they find it. Pressing Host creates a friends-only lobby sized to the 16-player cap and named after the host, and the menu waits for that lobby to exist before it starts Netcode. Whenever the game enters a lobby, as host or as guest, it points the transport at the lobby owner's SteamID. From the in-game lobby panel, the host can switch between friends-only, public and private, copy the lobby ID to share it, or open Steam's invite overlay.

      ```csharp label="ConnectionManager"
      public async void CreateLobby()
      {
          try
          {
              CurrentLobby = await SteamMatchmaking.CreateLobbyAsync(maxPlayer);
              if (!CurrentLobby.HasValue) return;

              var lobby = CurrentLobby.Value;
              lobby.SetFriendsOnly();   // default visibility
              lobby.SetJoinable(true);
              lobby.SetData(LOBBY_NAME_KEY, lobby.Owner.Name + "'s Lobby");
              lobby.SetData(LOBBY_VISIBILITY_KEY, ((int)LobbyVisibility.FriendsOnly).ToString());
          }
          catch (Exception e)
          {
              // ... log and return
          }
      }

      private void SetLobbyAndTransportTarget(Lobby lobby)
      {
          CurrentLobby = lobby;
          facepunchTransport.targetSteamId = lobby.Owner.Id;
      }
      ```

  - title: Joining From an Invite Mid-Match
    size: sub
    body: |
      Steam invites were broken, and the open playtest couldn't ship without them. Players can accept an invite, or click Join Game in their Steam friends list, at any moment, including in the middle of a match. Two problems made that hard:

      - **Leaving cleanly:** a player already in a match has to leave it completely first. The game leaves its lobby, shuts down the NetworkManager and waits until it has fully stopped before joining the new lobby.
      - **Unreliable callbacks:** joins could hang waiting on a second lobby callback that arrived late or never. `JoinLobbyAsync` has already confirmed membership, so I set the transport target straight from its result.

      Together these fixed the invite bugs players had reported.

      ```csharp label="ConnectionManager"
      private IEnumerator JoinLobbyFromInviteCoroutine(Lobby lobby)
      {
          // If the player is already in a game, leave it first
          if (networkManager.IsServer || networkManager.IsClient)
          {
              // ... show the transition screen
              LeaveLobby();
              if (networkManager)
              {
                  if (networkManager.IsListening && !networkManager.ShutdownInProgress)
                      networkManager.Shutdown();
                  yield return new WaitUntil(() => !networkManager.IsListening && !networkManager.ShutdownInProgress);
              }
              // ... load the main menu
          }

          var joinTask = SteamMatchmaking.JoinLobbyAsync(lobby.Id);
          yield return new WaitUntil(() => joinTask.IsCompleted);
          // ... show an error dialog if the join faulted or was canceled
          var joinedLobby = joinTask.Result;
          // ... show an error dialog if the lobby is invalid

          // JoinLobbyAsync has already confirmed membership. Set the target directly
          // instead of depending on a second callback that might be delayed or missed.
          SetLobbyAndTransportTarget(joinedLobby.Value);
          StartGameOnlineClient();
      }
      ```

  - title: Procedural World Sync & Streaming
    tabText: World Streaming
    size: big
    significance: important
    media: /assets/images/oddinary-farm/oddfarm_5.jpg
    body: |
      Every match is played on a fresh 500 × 500-tile island built from the team's layered Perlin noise maps, and none of it is saved to disk. I made that world work in multiplayer and run fast: every player generates the same island from a handful of synced seeds, and the world streams in chunks around each player. Streaming took mid-range machines from about 20 fps to about 60 fps.

  - title: One Seed Per Layer
    size: sub
    body: |
      Sending the island over the network would mean a quarter of a million tiles for every player who joins. Instead, only the server rolls dice: it picks a random origin for each of the four noise layers and stores it in a NetworkVariable. Clients wait for the origins to arrive, then generate the maps locally. Four pairs of integers cross the network instead of the whole map, and every player ends up on the same island.

      ```csharp label="WorldGenerator"
      if (IsServer)
      {
          // ...
          ElevationMapOrigin.Value = new Vector2Int(Random.Range(-10000, 10000), Random.Range(-10000, 10000));
          ResourcesMapOrigin.Value = new Vector2Int(Random.Range(-10000, 10000), Random.Range(-10000, 10000));
          MoistureMapOrigin.Value = new Vector2Int(Random.Range(-10000, 10000), Random.Range(-10000, 10000));
          OreMapOrigin.Value = new Vector2Int(Random.Range(-10000, 10000), Random.Range(-10000, 10000));
      }

      yield return new WaitUntil(() => ElevationMapOrigin.Value != Vector2Int.zero);
      // ...

      // Initialize the maps
      elevationMap.SetMapOrigin(ElevationMapOrigin.Value);
      elevationMap.GenerateMap(mapSize);
      // ... the flood map, then the resource, moisture and ore maps the same way
      ```

  - title: Chunk Streaming
    size: sub
    body: |
      Spawning the whole island at once, every tile, plant and resource, dropped mid-range machines to around 20 fps. I split the map into chunks and had each client stream only the chunks around its own player. Every client already has the full map, so streaming is purely local. Nearby chunks are recalculated only when the player crosses a chunk border, and whole chunks spawn and despawn at a time, taking their tiles and foliage from the local object pool instead of `Instantiate` and `Destroy`.

      The hard part was keeping the world correct while it streams. Changes to tiles are stored as data and reapplied when a chunk loads again, and networked objects such as farm plots and structures are never streamed at all. The same machines now run at about 60 fps.

  - title: Object Pooling
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      Oddinary Farm creates and removes objects constantly: bullets every time someone fires, tiles and foliage as chunks stream, and item drops for every player in a session. Creating each one with `Instantiate` and removing it with `Destroy` caused garbage-collection stutter, and every networked spawn and destroy also sent a message to every client. I built the game's object pools, which switch finished objects off and hand them out again the next time something asks for that prefab.

  - title: Two Pools, One Interface
    size: sub
    body: |
      Some objects only exist on one machine. Others belong to the server, and every client has to agree on them. Those needs pull in different directions, so I built two pools that share the same Spawn and Despawn shape:

      - **Local pool:** runs on each machine for projectiles, terrain tiles, foliage, VFX and UI popups.
      - **Network pool:** runs on the server for item drops. It is registered with Netcode as an `INetworkPrefabInstanceHandler`, so when the server spawns a pooled drop, every client takes its copy from its own pool too.

      The other hard part was making reused objects come back clean. Pooled objects implement spawn and despawn hooks that reset their own state, and the pool itself resets the Rigidbody, transform and parent when an object is returned.

  - title: Mount System
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/oddfarm_1.jpg
    body: |
      Players can saddle certain creatures and ride them around the farm. Riding touches input, physics, networking, the camera and the UI all at once. I led the networked mount system, and lead programmer Khoa Nguyen pair-programmed with me on its toughest physics problem.

  - title: Smooth Riding Over the Network
    size: sub
    body: |
      The first version attached the rider to the mount with a `FixedJoint2D`, and the two jittered against each other because of how Unity's physics handles the joint. I replaced the joint with parenting: while riding, the rider's own physics is switched off and it simply moves with the mount. I also hand the mount's ownership to the rider's client, so movement is simulated on the machine where the input happens instead of being corrected by the host.

      To keep every machine agreeing on who is riding, `MountInteraction` stores the rider in one NetworkVariable that only the server writes. Parenting, ownership, physics, the camera and the interaction prompt all react to that value changing, so there is no second message that could arrive out of order. Running the handler once at spawn means players who join mid-game see existing riders already seated.

      ```csharp label="MountInteraction.cs"
      // Network variable to store the current owner of the mount
      private NetworkVariable<NetworkObjectReference> CurrentOwner = new NetworkVariable<NetworkObjectReference>();
      public bool HasOwner => CurrentOwner.Value.TryGet(out NetworkObject _);

      public override void OnNetworkSpawn()
      {
          CurrentOwner.OnValueChanged += HandleCurrentOwnerChange;
          HandleCurrentOwnerChange(default, CurrentOwner.Value); // Initialize the current owner state, even for late joiners
      }
      ```

  - title: Shop
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      Crops drop coins into one wallet that the whole team shares, and the shop is where that money gets spent. I built the shop: buying items, buying in quantity, selling items back, and per-shop upgrades that unlock better stock. I also built the in-game HUD.

  - title: Buying and Selling Over the Network
    size: sub
    body: |
      A purchase puts the item straight into the buyer's own networked inventory. Selling was the harder direction. The team's wallet lives on the server, so a sale can't just change a number on the seller's machine: it goes to the server as an RPC, which adds the coins to the shared wallet for the whole team. Each shop building also upgrades on its own, and every level unlocks better items to buy.

  - title: Prices That Scale With the Team
    size: sub
    body: |
      Every player can spend the whole team's income, so prices are multiplied by the number of players. That made the shop UI harder than it looks. Players join and leave mid-match, so the shop recalculates prices while it's open instead of caching them, and the total for a quantity purchase has to be checked against what the team can afford.

      ```csharp label="PlayerManager.cs, ShopUI.cs"
      // PlayerManager.cs
      public static int Scaling => Mathf.Max(1, ParticipantCount);

      // ShopUI.cs, BuyItem
      var scaling = (uint)PlayerManager.Scaling;
      var price = itemProperty.Price * scaling * (uint)count;
      ```

reflection:
  image: "/assets/images/oddinary-farm/kaedim_indie_showcase.png"
  qa:
    - question: What was my role in this project?
      answer: |
        I hopped on this project back in August of 2025. A very good friend of mine was the director of the game and decided to make me an associate director due to my previous experience working with games. As associate director I handled reviewing design documentation, making tasks for developers and artists, and overseeing codebase changes through Git. In addition to this responsibility I also programmed some systems including the mounting system, procedural generation, UI, and some aspects of the lobby system. I also helped pitch the game at **Kaedim Indie Showcase**, an event at 2026 GDC, which ended up winning an award for best pitch.

    - question: What did I learn
      answer: |
        This was my first large-scale project where real stakes were involved. I took my role seriously and organized design meetings and tasks for developers alike. My biggest takeaway was **learning to do what was best for the game** not just what looked good to me. This was also my first introduction to multiplayer programming which became a core personal interest.

    - question: What would I change.
      answer: |
        With more time and experience, I would have decoupled more of the multiplayer code from the engine code. Since our game was peer-to-peer only aspects of the game that are essential for other client simulations should be sent over the network.
---

