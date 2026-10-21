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
  
  The lead programmer is Khoa Ngyuen and I was the associate lead programmer. The game hosts peer-to-peer multiplayer utilizing Steamworks Facepunch and Unity's Netcode for GameObjects. The open playtest is out now on [Steam](https://store.steampowered.com/app/3848990/Oddinary_Farm/)!

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

featuresComment: "// Systems that I've contributed to"
features:
  - title: Peer-to-peer Multiplayer
    size: big
    significance: important
    media: /assets/images/oddinary-farm/gameplay_2.loop.mp4
    body: |
      Unity Netcode for GameObjects, transported over Facepunch (Steamworks). Networking is deeply woven through the codebase, not confined to one layer. Allows player clients to connect to a host over the internet through Steam invites. One player hosts from their own PC and friends join through Steam. Game traffic travels over Steam Datagram Relay, Valve's relay network, so nobody forwards ports and players never see each other's IP addresses.

  - title: Authority Model
    size: sub
    body: |
      Every machine runs the same simulation, so each piece of state needs exactly one machine that is allowed to change it. The game splits that responsibility three ways. The host owns the world. Each player owns their own character. Shared objects like mounts, turrets and dropped items are owned by whoever is using them, and go back to the host afterwards.

      ### Listen-Server Architecture
      Anything all players share lives on the host. The game phase, the clock, quotas and the player roster are NetworkVariables that only the server can write. Clients read them and react to their change callbacks. Server write is Netcode's default, so most declarations don't need to say it.

      ```csharp label="PlayerManager & GameManager"
      // PlayerManager
      private NetworkList<ulong> PlayerClientIds = new NetworkList<ulong>();
      private NetworkVariable<int> ParticipantCountValue = new NetworkVariable<int>(
          0,
          NetworkVariableReadPermission.Everyone,
          NetworkVariableWritePermission.Server);
      
      ...
      
      // GameManager
      private NetworkVariable<GameState> CurrentGameState = new NetworkVariable<GameState>(GameState.Uninitialized);
      ```

      World changes travel as requests. When a player hoes the ground, their machine sends the target position to the host. The host spawns the farm plot and Netcode replicates it to everyone. Removing a plot works the same way, and the host runs its own physics lookup to find the plot, so the client only ever sends a position.

      ```csharp label="ItemSystem"
      public void SpawnFarmPlot(Vector2 position)
      {
          SpawnFarmPlotRpc(position);
          // ... tutorial bookkeeping
      }

      [Rpc(SendTo.Server)]
      private void SpawnFarmPlotRpc(Vector2 position)
      {
          AssetManager.Main.SpawnPrefabOnServer(AssetManager.Main.FarmPlotPrefab, position);
          // ... editor-only spawn recording
      }

      [Rpc(SendTo.Server)]
      private void RemoveFarmPlotRpc(Vector2 position)
      {
          var farmPlotCollider = Physics2D.OverlapPoint(position, LayerManager.Main.FarmPlotLayer);
          if (farmPlotCollider)
          {
              // ... editor-only spawn recording
              farmPlotCollider.GetComponent<NetworkObject>().Despawn();
          }
      }
      ```

      Small pieces of player-only state are owner-write NetworkVariables. These include facing direction, melee mode, the held item's modifier and the character's outfit. The held Item object only exists on the owner's machine, so the owner publishes its modifier for everyone else to render.

      ```csharp label="PlayerController"
      private NetworkVariable<bool> IsFacingRight = new NetworkVariable<bool>(false, default, NetworkVariableWritePermission.Owner);
      private NetworkVariable<bool> ForceMeleeMode = new NetworkVariable<bool>(false, default, NetworkVariableWritePermission.Owner);
      // The held Item only exists on the owner, so every other machine reads its modifier from here.
      private NetworkVariable<ItemModifier> HeldModifier = new NetworkVariable<ItemModifier>(ItemModifier.NoModifier, default, NetworkVariableWritePermission.Owner);

      private void HandleCurrentItemChanged(Item item)
      {
          currentItem = item;

          // Only the owner holds the Item. A changed modifier refreshes the particles through
          // HandleHeldModifierChanged, here and on every other machine.
          if (IsSpawned && IsOwner) HeldModifier.Value = item ? item.Modifier : ItemModifier.NoModifier;
      }
      ```

  - title: Co-Op Over Steam Relay
    size: sub
    body: |
      The transport sits on the Network Manager prefab next to Unity's NetworkManager, and that object persists across scenes. In Awake it starts the Steam client with the game's App ID. A coroutine waits for Steam to come online and then initializes relay access early, so the first connection doesn't have to wait for it.

      Async callbacks are turned off, and the transport calls SteamClient.RunCallbacks() from Update. Every Steam callback, from lobby invites to connection status changes, runs inside that call on Unity's main thread, where it can safely touch game objects.

      ```csharp label="FacepunchTransport"
      private void Awake()
      {
          try
          {
              SteamClient.Init(steamAppId, false);
          }
          catch (Exception e)
          {
              // ... log the error
          }
          finally
          {
              StartCoroutine(InitSteamworks());
          }
      }

      private void Update()
      {
          SteamClient.RunCallbacks();
      }

      private IEnumerator InitSteamworks()
      {
          yield return new WaitUntil(() => SteamClient.IsValid);

          SteamNetworkingUtils.InitRelayNetworkAccess();

          userSteamId = SteamClient.SteamId;
      }
      ```

      ### The Lobby Is The Address Book

      Clients connect to a SteamID instead of an IP address, and the Steam lobby is where they find it. Pressing Host creates a lobby sized to the 16-player cap, makes it friends-only by default and names it after the host. The menu waits for the lobby to exist before it starts Netcode. Whenever the game enters a lobby, as host or as guest, it points the transport at the lobby owner's SteamID.

      From the in-game lobby panel the host can switch between friends-only, public and private, copy the lobby ID to share, or open Steam's invite overlay.

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

      private void OnLobbyEntered(Lobby lobby)
      {
          if (lobby.MemberCount <= 0)
          {
              lobby.Leave();
              return;
          }

          SetLobbyAndTransportTarget(lobby);
      }

      private void SetLobbyAndTransportTarget(Lobby lobby)
      {
          CurrentLobby = lobby;
          facepunchTransport.targetSteamId = lobby.Owner.Id;
      }
      ```

      ### Joining From Steam Invite

      Players can accept an invite, or click Join Game in their Steam friends list, at any moment, including in the middle of another match. An invite that arrives while the game is open shows a Join or Decline prompt first. The handler then leaves the current session and waits for the NetworkManager to finish shutting down. After that it joins the new lobby and sets the transport target straight from the join result instead of waiting on a second lobby callback.

      ```csharp label="ConnectionManager"
      private IEnumerator JoinLobbyFromInviteCoroutine(Lobby lobby)
      {
          // If the player is already in a game, leave it first
          if (networkManager.IsServer || networkManager.IsClient)
          {
              yield return TransitionUI.Main.ShowCoroutine();

              isDisconnecting = true;
              LeaveLobby();

              if (networkManager)
              {
                  if (networkManager.IsListening && !networkManager.ShutdownInProgress)
                      networkManager.Shutdown();

                  yield return new WaitUntil(() => !networkManager.IsListening && !networkManager.ShutdownInProgress);
              }

              // ... load the main menu
              isDisconnecting = false;
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

  - title: Procedural Generation
    size: big
    significance: important
    media: /assets/images/oddinary-farm/oddfarm_5.jpg
    body: |
      The system builds a synchronized island world out of four layered Perlin noise maps (elevation, moisture, ore, and resource), then streams terrain, foliage, and resources in and out around each player in real time. Map generation is done client-side with a seed to improve performance.

      A JavaScript port of the game's generator, running Spring Island's settings and rule tables. It swaps Unity's `Mathf.PerlinNoise` for a standard Perlin implementation, so islands follow the game's shapes and rules without matching its exact seeds. Per-prefab caps and distance bands are left out.

  - title: Noise Maps
    size: sub
    media: /assets/images/oddinary-farm/oddfarm_5.jpg
    body: |
      Each game of Oddinary Farm is played on a fresh 500 × 500-tile island, and none of it is saved to disk. The server rolls four random origins, and every client rebuilds the same world from four Perlin noise maps: elevation, moisture, resource and ore. Terrain, foliage, resource spots, ore deposits and even the flood are read straight off those maps.

      - **Raw Noise:** Two octaves of Perlin noise sampled from the elevation origin. On its own it has no edges and no centre.
      - **Island Falloff:** `(1 − nx²)(1 − ny²)` 1 at the centre of the map and 0 along every edge.
      - **Elevation:** The noise blended 80% toward the falloff and clamped to 0–1. The ring marks the highest tile, which anchors the spawn area.
      - **Terrain:** Every tile's elevation looked up in Spring Island's eight terrain bands.
      - **Moisture:** Five octaves raised to the 4th power. Almost every value lands below 0.2, so this view is brightened 5×.
      - **Foliage:** Moisture bands pick 1×, 2× or 3× density. Green tiers grow on land and blue tiers on the seabed. Resource peaks and ore tiles stay clear.
      - **Resource Peaks:** Tiles holding the highest resource value within 3 tiles. Every other tile is set to 0.
      - **Ore Clusters:** Bright tiles passed the threshold and the cluster filter. Dim tiles passed the threshold but were filtered out. The dark disc in the middle is the dead zone.
      - **Combined Maps:** Terrain and foliage, with resource spots as dots and ore deposits in cyan, under the selected water level. The square is the no-resource zone around spawn.
  
  - title: One Seed Per Layer
    size: sub
    body: |
      Only the server rolls dice. It picks a random origin for each layer and stores it in a NetworkVariable. Clients wait until all four origins arrive, then generate the maps locally. Four pairs of integers cross the network instead of a quarter of a million tiles, and every player ends up on the same island.

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
      
      ...

      // Initialize the maps
      elevationMap.SetMapOrigin(ElevationMapOrigin.Value);
      elevationMap.GenerateMap(mapSize);
      BuildFloodElevationMap();
      resourceMap.SetMapOrigin(ResourcesMapOrigin.Value);
      resourceMap.GenerateMap(mapSize);
      moistureMap.SetMapOrigin(MoistureMapOrigin.Value);
      moistureMap.GenerateMap(mapSize);
      oreMap.SetMapOrigin(OreMapOrigin.Value);
      oreMap.GenerateMap(mapSize);
      ```

  - title: Fractal Perlin Noise
    size: sub
    body: |
      All four layers extend one base class, `PerlinNoiseGenerator`. It sums several octaves of `Mathf.PerlinNoise`, each at a higher frequency and a lower amplitude, normalises the total back to 0–1 and raises it to an exponent. Subclasses override GetValue to shape individual samples and TransformMap to post-process the finished grid.

      ```csharp label="PerlinNoiseGenerator"
      private float GetNoise(float x, float y, Vector2 origin, Vector2 dimension,
      float scale, int octaves, float persistence, float frequencyBase, float exponent)
      {
          float xCoord = origin.x + x / dimension.x * scale;
          float yCoord = origin.y + y / dimension.y * scale;

          var total = 0f;
          var frequency = 1f;
          var amplitude = 1f;
          var maxValue = 0f;
          for (int i = 0; i < octaves; i++)
          {
              total += Mathf.PerlinNoise(xCoord * frequency, yCoord * frequency) * amplitude;

              maxValue += amplitude;
              amplitude *= persistence;
              frequency *= frequencyBase;
          }

          return Mathf.Pow(total / maxValue, exponent);
      }
      ```



  - title: Inventory System
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      The inventory holds everything a player carries in Oddinary Farm: tools, seeds, crops, weapons and the items bought from vending machines. It is a 30-slot bag owned by one networked component, drawn by a small set of uGUI scripts, and filled by world drops that the server assigns to one player at a time. Dynamic and scalable slot-based inventory system akin to *Minecraft's* system. Items are data-driven and situational. The player can perform a variety of actions depending on the item, including placement, combat, and buffs.

  - title: Inventory Slots and Hotbar
    size: sub
    body: |
      Every slot lives in one array, InventorySlot[30]. Slots 0 to 9 are the hotbar and slots 10 to 29 are the backpack, so moving an item between them is an ordinary swap. Slot 0 always holds the Hand. Selecting an empty slot falls back to it, so the player is never holding nothing.

      Players can mark hotbar positions as quick slots. The mouse wheel then cycles through only the marked positions, and the choice is saved to PlayerPrefs as a 10-bit mask.

      ```csharp label="PlayerInventory.cs"
      /// <summary>Local, persistent hotbar positions included in mouse-wheel selection.</summary>
      public sealed class QuickSlotSelection
      {
          public const int SlotCount = 10;
          private const int AllSlots = (1 << SlotCount) - 1;
          private readonly string preferenceKey;
          private int mask;

          // ...

          public int NextIndex(int currentIndex, int direction)
          {
              if (direction == 0) return currentIndex;
              int step = direction > 0 ? 1 : -1;
              int index = currentIndex >= 0 && currentIndex < SlotCount
                  ? currentIndex : (step > 0 ? SlotCount - 1 : 0);
              for (int i = 0; i < SlotCount; i++)
              {
                  index = (index + step + SlotCount) % SlotCount;
                  if (mask == 0 || IsSelected(index)) return index;
              }
              return currentIndex;
          }
      }
      ```

  - title: Item Data
    size: sub
    body: |
      Each item type is an `ItemProperty` ScriptableObject that defines its name, icon, prefab, stack size, price and sounds. Every copy of the item shares those values. Anything that can differ between two copies of the same item, its modifier and its remaining durability, goes in a small `ItemStatus` struct instead. That struct travels with the item from the loot roll to the ground, into the bag, and back out when the item is dropped.

      - **ItemProperty:** Name, icon, prefab, MaxStack, price, sounds.
      - **ItemStatus:** Modifier, durability, whether the modifier was rolled.
      - **InventorySlot:** The live `Item` instance and a count.

      ```csharp label="PlayerInventory.cs, ItemStatus.cs"
      [System.Serializable]
      public struct InventorySlot
      {
          public Item Item;
          public uint Count;

          public ItemProperty Property => Item?.BaseProperty;
          public bool IsFull => Item != null && Count >= Item.BaseProperty.MaxStack;
          public bool IsEmpty => Item == null || Count == 0;

          public InventorySlot(Item item, uint count = 1)
          {
              Item = item;
              Count = count;
          }
      }

      ...

      [Serializable]
      public struct ItemStatus : INetworkSerializable, IEquatable<ItemStatus>
      {
          // True once this item has been through the modifier roll. Prevents a Broken pistol
          // from rerolling into a Pristine one every time it is dropped and picked back up.
          public bool ModifierGenerated;
          public ItemModifier Modifier;
          public bool HasDurability;
          public int Durability;

          // ...

          public bool HasModifier => Modifier != ItemModifier.NoModifier;
          public bool IsDepleted => HasDurability && Durability <= 0;

          public void NetworkSerialize<T>(BufferSerializer<T> serializer) where T : IReaderWriter
          {
              serializer.SerializeValue(ref ModifierGenerated);
              serializer.SerializeValue(ref Modifier);
              serializer.SerializeValue(ref HasDurability);
              serializer.SerializeValue(ref Durability);
          }

          // ...
      }
      ```

  - title: Object Pooling
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      Oddinary Farm creates and removes objects constantly. Bullets fly every time someone fires, terrain tiles and foliage stream in and out as players walk the map, and item drops have to appear for every player in an online session. Creating each one with `Instantiate` and removing it with `Destroy` causes garbage collection spikes, and for networked objects it also sends a spawn and a destroy message to every client. The game avoids both by keeping finished objects around, switched off, and handing them out again the next time something asks for that prefab.

  - title: LocalObjectPooling vs NetworkObjectPooling
    size: sub
    body: |
      Some objects only exist on one machine, like a projectile or a terrain tile. Others belong to the server, and every client has to agree on them. Those needs pull in different directions, so the project has two pools that share the same Spawn and Despawn shape. 
      
      - **Local Object Pooling:** Runs on each machine/client independently and consists of projectiles, terrain tiles, foliage, vfx, and UI popups.
      - **Network Object Pooling:** Runs on the server only and consists mainly of item drops.

  - title: Pooled Object GUID
    size: sub
    body: |
      A spawned instance has no reference back to the prefab it came from, so each pooled prefab stores its own ID. A context-menu command writes a fresh GUID into the prefab and records an Undo step, so it behaves like any other Inspector edit. The ID survives renames and folder moves, which a prefab name would not.

      ```csharp label="LocalObjectController.cs"
      [SerializeField]
      private string guid;
      public string Guid => guid;

      #if UNITY_EDITOR
      [ContextMenu("Generate GUID")]
      public void GenerateGUID()
      {
          guid = System.Guid.NewGuid().ToString();

          // Record object state for undo functionality and mark as dirty
          Undo.RecordObject(this, "Generate GUID");
          EditorUtility.SetDirty(this);
      }
      #endif
      ```

      Both controllers log an error in `Awake` when the GUID is empty, so a prefab that skipped this step gets flagged the first time it is used.

  - title: Mount System
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/oddfarm_1.jpg
    body: |
      Players can saddle certain entities and ride it around the farm. All use a custom networked mount system. The mount tracks who is riding, the rider's own client steers, and the server approves every change.

      Riding touches input, physics, networking, the camera and the UI, so the work is split across five components. Two paths run through them: one decides who is riding, the other carries movement input. PlayerMountHandler is where they meet.

      PlayerController -> PlayerMountHandler -> MountController

      `MountInteraction` stores the rider in a single NetworkVariable that only the server writes. Mounting sets it, dismounting clears it, and everything else (parenting, ownership, physics, the camera, the interaction prompt) happens as a reaction to that value changing. There is no second message announcing a mount that could arrive out of order.

      Running the handler once at spawn covers players who join mid-game. They see existing riders already seated.

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

  - title: Economy
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      The game economy revolves around a daily bill. Crops drop coins, the team spends them on seeds, tools and buildings, and every day ends with a quota the farm has to pay to stay in business. Players who reach the end escape with what's left in their wallet and put it toward a debt of 999 trillion coins that carries over between runs. This section follows the money from a coin hitting the ground to the Steam leaderboard.

  - title: Coin Currency
    size: sub
    body: |
      A coin is an ordinary item. `CurrencyProperty` extends the same `ItemProperty` base as seeds and tools, so a crop lists coins in its drop table like any other loot, and they spawn, scatter and despawn through the same item pipeline. Pickup is the only special case: instead of taking an inventory slot, the coin's value goes straight to the wallet and pops up in the coin's own color.

      ```csharp label="CurrencyProperty.cs"
      [CreateAssetMenu(fileName = " Property", menuName = "Scriptable Objects/Item/Currency")]
      public class CurrencyProperty : ItemProperty
      {
          [Header("Currency Settings")]
          [SerializeField]
          private uint value;
          [SerializeField]
          private Color color;

          public uint Value => value;
          public Color Color => color;
      }
      ```

      ```csharp label="PlayerInventory.cs"
      // AddItem
      else if (property is CurrencyProperty currency)
      {
          var value = currency.Value;
          AddCoinsOnClient(value, currency);

          sfxAudioElement.PlayOneShot(currency.PickupSound);

          // Update stat
          StatisticsManager.Main.UpdateStat(StatisticType.CoinsPickedUp, property);

          return true;
      }

      ... 

      public void AddCoinsOnClient(uint value, CurrencyProperty source = null, bool countAsEarned = true)
      {
          if (countAsEarned)
              WalletManager.Main.AddToWallet(value);
          else
              WalletManager.Main.GrantToWallet(value);
          // …
          if (source)
              EnqueueCurrencyPopup(source);
          else
              EnqueueMoneyPopup(value);
      }
      ```

  - title: Shared Community Wallet
    size: sub
    body: |
      Ultimately the decision was made for the entire team to share earnings; this ensures multiple roles are viable regardless of how much they earn (farming, exploring, fighting). The server holds one number, GlobalWallet: every coin anyone has brought onto the farm. Each client keeps a private record of what it has spent and lost. A player's spendable balance is the team's income minus their own outgoings.

      ```csharp label="WalletManager.cs"
      [SerializeField] private NetworkVariable<ulong> GlobalWallet = new NetworkVariable<ulong>(0);
      [SerializeField] private ulong personalCoinsSpent = 0;
      // Penalties (a death, the vacation curse) leave the wallet too, but they are losses, not spending.
      [SerializeField] private ulong personalCoinsPenalized = 0;
      public ulong LocalWalletValue => GlobalWallet.Value - personalCoinsSpent - personalCoinsPenalized;
      ```

      Nobody splits loot, two players can never race for the same coin, and a purchase doesn't wait on the server because it only changes a local number. The catch is that every player can spend the whole team's income. The game pays for that by multiplying prices by the number of players, and the daily quota grows the same way.

      ```csharp label="PlayerManager.cs, ShopUI.cs, StructureUpgrader.cs"
      // PlayerManager.cs
      public static int Scaling => Mathf.Max(1, ParticipantCount);

      // ShopUI.cs, BuyItem
      var scaling = (uint)PlayerManager.Scaling;
      var price = itemProperty.Price * scaling * (uint)count;

      // StructureUpgrader.cs
      public uint Cost => upgradeCost * (uint)PlayerManager.Scaling;
      ```

      A new player also brings starting money. The server adds 150 coins whenever the player count reaches a new high, and only then, so leaving and rejoining can't print money.

      ```csharp label="WalletManager.cs"
      private int highestScaling = 0;
      private void HandleScalingChanged(int newScaling)
      {
          if (newScaling > highestScaling)
          {
              GlobalWallet.Value += 150UL * (ulong)(newScaling - highestScaling);
              highestScaling = newScaling;
          }
      }
      ```

  - title: Day and Night Cycle
    size: big
    significance: trivial
    media: /assets/images/oddinary-farm/gameplay_1.loop.mp4
    body: |
      A time scale that affects the day/night cycle of the game. This changes the state of the game and the events that happen. One in-game day lasts 6 real minutes. Players farm during the day (about 5 minutes). Then night falls and ShowTime begins: a one-minute rush where creatures attack the farm. The clock controls lighting, weather, music, crop behaviour, creature AI and the daily coin quota. Because the game is online co-op, every player has to see the same time.

reflection:
  image: "/assets/images/oddinary-farm/kaedim_indie_showcase.png"
  qa:
    - question: What was my role in this project?
      answer: |
        I hopped on this project back in August of 2025. A very good friend of mine was the director of the game and decided to make me an associate director due to my previous experience working with games. As associate director I handled reviewing design documentation, making tasks for developers and artists, and overseeing codebase changes through Git. In addition to this responsibility I also programmed some  systems including the mounting system, procedural generation, UI, and some aspects of the lobby system. I also helped pitch the game at **Keadim Indie Showcase**, an event at 2026 GDC, which ended up winning an award for best pitch.

    - question: What did I learn
      answer: |
        This was my first large-scale project where real stakes were involved. I took my role seriously and organized design meetings and tasks for developers alike. My biggest takaway was **learning to do what was best for the game** not just what looked good to me. This was also my first introduction to multiplayer programming which became a core personal interest.

    - question: What would I change.
      answer: |
        With more time and experience, I would have decoupled more of the multiplayer code from the engine code. Since our game was peer-to-peer only aspects of the game that are essential for other client simulations should be sent over the network.
---

