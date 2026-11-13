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

featuresComment: "// Systems that I've created and contributed to"
features:
  - title: Wave System
    size: big
    significance: trivial
    media: /assets/images/rogue-nebula-images/rogue_gameplay_1.mp4
    body: |
      This game picks a hand-built enemy formation from a difficulty pool, promotes some ships to tougher variants, and moves to a harder pool every eight waves.

      Four main scripts share the work. WaveManager owns the pools and the wave count, WavePool assets hold the content, each Wave prefab tracks its own ships, and AnnouncementUI tells the player what is coming.

      :::table {label="The Pieces"}
      | Module | Type | Purpose |
      | :----- | :----- | :----- |
      | `WaveManager` | MonoBehaviour | Chooses the `Wave` from a `WavePool` based on difficulty and random chance. |
      | `WavePool` | ScriptableObject | Set of prefabed `Waves` and variant spawn chances. |
      | `Wave` | MonoBehaviour | Prefabs formations of enemy types. |
      | `AnnoucementUI` | MonoBehaviour | Responds to event calls and updates UI text to match wave number and difficulty. |
      :::

  - title: Data-Driven Wave System
    size: sub
    body: | 
      Each enemy formation is a prefab: an empty `Wave` object whose children are the ships, already placed in formation. Formations are grouped into three `WavePool` ScriptableObjects, one per difficulty. A pool holds its list of wave prefabs and the odds of spawning elite variants, so a whole difficulty tier can be rebalanced in the Inspector without touching code.

      ```csharp ref="WavePool.cs"
      [CreateAssetMenu(fileName = "WavePool", menuName = "Wave Pool")]
      public class WavePool : ScriptableObject
      {
          [Header("Wave Settings")]
          [SerializeField] private WaveDifficulty waveDifficulty = 0;
          [SerializeField] private List<GameObject> waves = new List<GameObject>();

          [Header("Varient Enemies")]
          [SerializeField] public int varientMedChance = 0;
          [SerializeField] public int varientHardChance = 0;
          [SerializeField] public int varientMaxSpawn = 0;

          public GameObject RandomWaveSelect()
          {
              if (waves.Count <= 0)       // If no waves currently selected then return null
                  return null;

              int roll = Random.Range(0, waves.Count);
              if (waves[roll])
                  return waves[roll];
              else
                  return RandomWaveSelect();
          }
      }
      ```

      `RandomWaveSelect()` picks a random slot and re-rolls if that slot was left empty in the Inspector, so a half-filled pool still works while formations are being built.

  - title: Wave Loop
    size: sub
    body: | 
      `WaveManager` is a singleton that starts on the first pool and spawns the first wave as soon as the scene loads. Spawning runs in a coroutine: it waits `waveDelay`, fires the onWaveStart event with the current wave number, then instantiates a random formation from the active pool.

      ```csharp ref="WaveManager.cs"
      [Header("Events")]
      [SerializeField] public UnityEvent<int> onWaveStart;

      private void Start()
      {
          currentWavePool = wavePools[0];     // Start currentWavePool at first wave in list
          SpawnWave();
      }

      public void SpawnWave()
      {
          StartCoroutine(SpawnWaveCo());
      }

      private IEnumerator SpawnWaveCo()
      {
          GameObject waveParent = GameObject.Find(WAVE_PARENT_NAME);

          yield return new WaitForSeconds(waveDelay);
          // Event for UI
          onWaveStart?.Invoke(waveCounter);

          GameObject wave = Instantiate(currentWavePool.RandomWaveSelect(), waveParent.transform);
      }
      ```

      `onWaveStart` is a `UnityEvent<int>` connected in the Inspector, so the manager has no reference to any UI. In the main scene it is wired to the wave announcement, and other listeners can be added without changing this script.

  - title: Difficulty
    size: sub
    body: | 
      Each cleared wave increments the counter. When it reaches the next multiple of `changePoolAfterWaves` (set to 8 in the main scene), the manager switches to the next pool. On the last pool the check fails and the game stays at Hard for the rest of the run.

      ```csharp ref="WaveManager.cs"
      public void UpdateWaveCounter()
      {
          waveCounter++;
          // changeWavePoolAfter * i = nextWavePoolChange
          if (waveCounter >= changePoolAfterWaves * waveCountMult)
          {
              RaiseDifficulty();
              waveCountMult++;
          }
      }

      public void RaiseDifficulty()
      {
          // Check if we are not at the end of wavePools; otherwise, stay on last WavePool
          if (((int)currentDifficulty + 1) < wavePools.Count)
          {
              currentDifficulty++;
              currentWavePool = wavePools[((int)currentDifficulty)];
          }
      }
      ```

      :::table {label="Difficulty Selection"}
      | Pool | Waves | Med Variant Chance | Hard Variant Chance | Variant Cap | 
      | :----- | :----- | :----- | :----- | :----- |
      | Easy | 1-7 | 10% | 0% | 1 |
      | Medium | 8-15 | 35% | 5% | 2 |
      | Hard | 16+ | 50% | 20% | 3 |
      :::

  - title: Ability System
    size: big
    significance: important
    media: /assets/images/rogue-nebula-images/rogue_gameplay_2.mp4
    body: |
      I built the player ability system that ended up becoming a baseline system for many games to follow. Both sit on one small base class that handles cooldowns, sound and the HUD, so each ability only has to describe what it actually does.

      Every ability inherits from `Ability`, a `MonoBehaviour` that lives on the Player prefab. Its Execute() method handles everything the abilities have in common:

      - **Cooldown gate:** If the ability is still cooling down, Execute() returns true and stops there.
      - **Feedback:** It plays the ability's startup sound through the AudioManager.
      - **HUD Update:** It invokes onAbilityCooldown with the cooldown length, so the UI knows how long to animate.
      - **Timer:** A coroutine clears the cooldown flag after abilityCooldown seconds.
      
      It also caches the Player, Rigidbody and `EntityHealth` components as protected fields, so subclasses can use them without looking anything up.

      ```csharp ref="Ability.cs"
      public class Ability : MonoBehaviour
      {
          [Header("Unity Events")]
          [SerializeField] public UnityEvent<float> onAbilityCooldown;

          [Header("Ability Cooldown")]
          [SerializeField] private float abilityCooldown = 0f;
          private bool abilityOnCooldown = false;

          [Header("Sounds")]
          [SerializeField] protected AudioClip abilityStartupSound;
          [SerializeField] protected AudioClip abilityEndSound;

          // Components
          protected Player playerComponent;
          protected Rigidbody rbComponent;
          protected EntityHealth healthComponent;

          private void Awake()
          {
              playerComponent = GetComponent<Player>();
              healthComponent = GetComponent<EntityHealth>();
              rbComponent = GetComponent<Rigidbody>();
          }

          public virtual bool Execute()       // overriden function to execute ability; return true if on cooldown, return false otherwise
          {
              if (abilityCooldown > 0 && abilityOnCooldown)
                  return true;

              AudioManager.instance?.PlaySFX(abilityStartupSound);

              onAbilityCooldown?.Invoke(abilityCooldown);
              StartCoroutine(CooldownCo());
              return false;
          }

          private IEnumerator CooldownCo()
          {
              abilityOnCooldown = true;
              yield return new WaitForSeconds(abilityCooldown);
              abilityOnCooldown = false;
          }
      }
      ```

      *This structure evolved in later projects also implementing a `Tick()`, `Start()`, and `Exit()` function that all abilities would inherit.*
---
