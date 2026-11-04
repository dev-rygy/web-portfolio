---
title: Unstable Star
genre: Top-Down Bullet Hell
date: 2024-05-01
dates: Sep 2023 - May 2024
status: shipped
roles:
  - Systems Lead
  - Project Manager

summary: >-
  A comedic, heartwarming bullet hell about a lowly guard challenging a galactic empire — made with ASU's
  Video Game Development Club and released on Steam.
description: >-
  Developed for the Video Game Development Club's 2023-24 session, this game tells a comedic and
  heartwarming story of a lowly guard challenging a galactic empire. Players journey through three diverse
  levels with dynamic objectives and challenging boss fights, with a full animated dialogue system, weapon
  and ability inventory, and varied enemy behaviors.
overview: |
  *Unstable Star* was developed in collaboration with the [Video Game Development Club](https://asu.campuslabs.com/engage/organization/vgdc) at Arizona State University. This action-packed, lighthearted adventure spans three unique levels and two challenging boss fights. Players play as a former Border Guard of the Intragalactic Coalition as he becomes entangled in a rebellion to save the galaxy.

  As the club's vice president and systems lead, I oversaw project management, task organization, and project scheduling.

thumbnail: /assets/video/thumbs/unstable_star_thumbnail.mp4
poster: /assets/video/thumbs/unstable_star_thumbnail.jpg
video: https://www.youtube.com/watch?v=WldsXU3dp0c

links:
  steam: https://store.steampowered.com/app/3090070/Unstable_Star/
  itch: https://heatwave-studios.itch.io/unstable-star
  github: https://github.com/GDCASU/Unstable-Star

engine: Unity
platforms:
  - PC

featuresComment: "// Systems that I've contributed to"
features:
  - title: Wave System
    size: big
    significance: trivial
    media: /assets/images/unstable-star-images/wave_spawn.png
    body: |
      The base code for the wave system in this project carried over from it's predecessor [Rogue Nebula](https://ryancarpenterpf.dev/projects/rogue-nebula/). Hand-built prefabed formations that fly in, settle into position and fight until the last ship is down. The moment a wave is cleared, the next one is rolled from a pool and sent in. I built the system from three small pieces connected by two global events, so new formations could be added as prefabs without touching code.

      :::table {label="The pieces"}
      | Module | Type | Purpose |
      | :----- | :----- | :----- |
      | `Wave` | MonoBehaviour | One formation, saved as a prefab. Knows which enemies belong to it and announces when they are all gone. |
      | `WaveManager` | MonoBehaviour | Spawns one wave after another for as long as spawning is switched on. |
      | `WavePool` | ScriptableObject | The formations for one act, plus the band of screen height they settle into. |
      | `EventData` | Static Events | `OnEnemyDeath` and `OnWaveComplete` carry every message between the other three. |
      :::

  - title: Prefabed Waves
    size: sub
    body: |
      Each formation is an empty parent object with enemy prefabs placed as its children, arranged in the shape the wave should fly in. On Awake the wave walks its own children to build its enemy list. Designers can drag ships around inside the prefab and never keep a list in sync by hand.

      ```csharp ref="Wave.cs"
      private void Awake()
      {
          ResetAndPopulateEnemyList();
      }

      public void ResetAndPopulateEnemyList()
      {
          enemyList.Clear();

          foreach (Transform child in transform)
          {
              GameObject childGameObject = child.gameObject;
              if (childGameObject != null)
              {
                  enemyList.Add(childGameObject);
              }
          }
      }
      ```

  - title: Wave Pool Selection
    size: sub
    body: |
      Each act gets its own pool asset, made from Unity's Create menu. Picking a wave is a uniform random roll. If the rolled slot is empty, for example because a prefab was deleted, it rolls again. The pool can also push its own vertical bounds onto every wave, so all formations in an act settle in the same band of the screen.

      ```csharp ref="WavePool.cs"
      [CreateAssetMenu(fileName = "WavePool", menuName = "Wave Pool")]
      public class WavePool : ScriptableObject
      {
          [SerializeField] private List<GameObject> waves = new List<GameObject>();
          [SerializeField] float enemyBoundsCenter = .75f;
          [SerializeField] float enemyBoundsSize = .15f;
          [SerializeField] bool overrideWaveBounds = true;

          public GameObject RandomWaveSelect()
          {
              if (waves.Count <= 0)       // If no waves currently selected then return null
                  return null;

              if (overrideWaveBounds)
              {
                  foreach(GameObject wave in waves)
                  {
                      wave.GetComponent<Wave>().SetBoundFields(enemyBoundsCenter, enemyBoundsSize);
                  }
              }

              int roll = Random.Range(0, waves.Count);
              if (waves[roll])
                  return waves[roll];
              else
                  return RandomWaveSelect();
          }
      }
      ```

      Difficulty scales by act. Every act uses the same five formation shapes in harder versions. All three level scenes share one Wave Manager prefab that defaults to the Act 1 pool, and Levels 2 and 3 override that one field.

      :::table {label="Wave Pools"}
      | Act | Pool | Tier |
      | :----- | :----- | :----- |
      | Act1 | `level1_pool` | Easy |
      | Act2 | `level2_pool` | Medium |
      | Act3 | `level3_pool` | Hard |
      :::

  - title: Wave Spawn Loop
    size: sub
    body: |
      The manager is a scene singleton. In Start it subscribes SpawnWave to OnWaveComplete, and that single line is the whole loop: whenever a wave reports it is finished, the next one spawns. A waveSpawnStopped flag gates the call, so the loop can be paused without unsubscribing anything. onWaveStart is a UnityEvent that hands the wave number to any UI that wants to show it.

      ```csharp ref="WaveManager.cs"
      private void Start()
      {
          EventData.OnWaveComplete += SpawnWave;

          waveParent = GameObject.Find(WAVE_PARENT_NAME);

          currentWavePool = wavePools[0];     // Start currentWavePool at first wave in list
          // ...
      }

      public void SpawnWave()
      {
          if (waveSpawnStopped)
              return;

          // Event for UI
          onWaveStart?.Invoke(waveCounter);
          // Spawn wave using RandomWaveSelect()
          GameObject wave = Instantiate(currentWavePool.RandomWaveSelect(), waveParent.transform);
          currentWave = wave.GetComponent<Wave>();
          // ...
      }

      public void StartWaveSpawn()
      {
          waveSpawnStopped = false;
          SpawnWave();                        // Spawn the first wave
      }

      public void StopWaveSpawn()
      {
          waveSpawnStopped = true;
          currentWave.ClearWave();
      }
      ``` 

  - title: Player Abilities
    size: big
    significance: trivial
    media: /assets/images/unstable-star-images/unstable_gameplay2.png
    body: |
      In addition to the player's guns, they can take one special ability into each level, chosen from a disk on the loadout screen. The base code for this system was carried over by it's predecessor [Rogue Nebula](https://ryancarpenterpf.dev/projects/rogue-nebula/). The **Phase Shift** ability makes the ship untouchable for a few seconds. The **Proximity Bomb** ability releases an expanding shockwave that damages anything it touches. Each ability has limited charges and its own cooldown. The system splits into three layers: data assets that designers tune in the inspector, an inventory that holds what the player equipped, and a component that carries out the effect.

      :::table {label="The pieces"}
      | Module | Type | Purpose |
      | :----- | :----- | :----- |
      | `ScriptableAbility` | ScriptableObject | One asset per ability, holding its tuning values, icons, sounds and effects. |
      | `Ability` | Class | The runtime copy the player carries. Tracks charges left and cooldown time. |
      | `AbilityInventory` | MonoBehaviour | What the player equipped on the loadout screen, and which ability is selected. |
      | `AbilityComponent` | MonoBehaviour | Runs the effect, starts the cooldown and reports its progress to the HUD. |
      :::

  - title: Ability Scriptable Object
    size: sub
    body: | 
      Each ability type has a ScriptableObject that designers create from the Create menu and fill in from the inspector: charges, cooldown, icons, FMOD sound events and visual effects. `GetAbilityObject()` turns that asset into a new runtime `Ability`. The player spends charges on that copy, so playing a level never changes the values saved in the asset.

      ```csharp ref="ScriptablePhaseShift.cs"
      [CreateAssetMenu(fileName = "ScriptablePhaseShift", menuName = "ScriptableObjects/Abilities/Phase Shift")]
      public class ScriptablePhaseShift : ScriptableAbility
      {
          // Variables
          [Header("Phase Shift Settings")]
          public string sName;
          public Material phaseShiftMaterial;
          public GameObject particlePrefab;
          public FMODUnity.EventReference phaseShiftEnter;
          public FMODUnity.EventReference phaseShiftExit;
          public Sprite abilityIconActive;
          public Sprite abilityIconInactive;
          public int charges;
          public float cooldownTime;
          public float durationTime;
          [TextAreaAttribute]
          public string description;
          public override Ability GetAbilityObject()
          {
              return new PhaseShiftAbility(sName, abilityIconActive, phaseShiftEnter, phaseShiftExit, abilityIconInactive, phaseShiftMaterial, particlePrefab, charges, cooldownTime, durationTime, description);
          }
      }
      ```

  - title: Base Ability Class
    size: sub
    body: | 
      Every runtime ability inherits from an abstract `Ability` class. Fields for every ability type live on that base class, and an `AbilityTypes` enum says which kind it is. Code that runs abilities can read any ability's data without casting it, and decides what to do by switching on the enum.

      ```csharp ref=""
      public enum AbilityTypes
      {
          NULL,
          ProxiBomb,
          PhaseShift
      }

      // Ability Parent Class
      public abstract class Ability
      {
          // Common Variables
          public string sName;
          public AbilityTypes abilityType;
          public float cooldownTime;
          public float durationTime;
          public bool isOnCooldown;
          public int charges;
          public string description;

          // Proximity Bomb Variables
          public FMODUnity.EventReference bombExplosion;
          public GameObject bombPrefab;
          public float bombRadius;
          public int damage;

          // Phase Shift Variables
          // ...

          // This variable should be useful for implementing UI
          public float timeLeftInCooldown;
          // ...
      }
      ```

  - title: Dialogue System
    size: big
    significance: important
    media: /assets/images/unstable-star-images/unstable_gameplay2.png
    body: |
      Every conversation in Unstable Star, from the prison-break cutscenes to the banter before a boss fight, is written in plain text files. A small parser turns each file into rows of speaker, line and mood. A dialogue manager plays those rows back with portraits and a typewriter effect, then hands control back to Unity Timeline or to the level when the script says so.

  - title: Speakers and Portraits
    size: sub
    body: |
      A character portrait is displayed on the left side of the speech bubble. The `speaker` chooses a character portrait set and the `mood` chooses a portrait from the set.

      Each row's speaker resolves to an Options struct: the name for the nameplate, its color, the portrait set, and whether a nameplate is shown at all. Portrait arrays are filled in the Inspector in a fixed order, so a mood is just an index into that array.

      Characters the parser knows but that have no custom entry, like the Security Defense System, fall through to the default case and get a nameplate with their own name and a blank portrait. When a row's mood is ???, ChangeDialogue replaces the nameplate with `???` and hides the portrait, for characters who haven't been introduced yet.

      ```csharp ref=""
        public struct Options
        {
            public string name;
            public Color32 color;
            public Sprite[] emotions;
            public bool isDialogue;
        };

        public Options CreateOptions(string optionType)
        {
            switch (optionType)
            {
                case "APOLLO":
                    Options apollo = new Options
                    {
                        name = "APOLLO",
                        color = Color.black,
                        emotions = apolloEmotions,
                        isDialogue = true,
                    };
                    return apollo;
                // … one case per main character, boss and named civilian

                case "DESC: ":
                    Options description = new Options
                    {
                        name = "",
                        color = Color.black,
                        emotions = blankEmotions,
                        isDialogue = false,
                    };
                    return description;
                // … BREAK and NOISE also return isDialogue = false

                default:
                    Options baseOptions = new Options
                    {
                        name = optionType,
                        color = Color.black,
                        emotions = blankEmotions,
                        isDialogue = true,
                    };
                    return baseOptions;
            }
        }

        public Sprite GetEmotion(Options option, string emotion)
        {
            switch (emotion)
            {
                case "NORMAL":
                    return option.emotions[0];
                case "HAPPY":
                    return option.emotions[1];
                case "SAD":
                    return option.emotions[2];
                case "ANGRY":
                    return option.emotions[3];
                default:
                    return option.emotions[0];
            }
        }
      ```

  - title: Timeline Control
    size: sub
    body: |
      Cutscenes are Unity Timelines. The DialogueController prefab carries a Signal Receiver that maps two signal assets to methods: StartText.signal calls DialogueManager.StartText(), and SwitchScene.signal calls ChangeScene().

      A StartText marker pauses the Timeline and opens the box. When playback reaches a NOISE or BREAK row, StopText() resumes the Timeline, so the next beat (an explosion, a camera move, a sound) plays until the next StartText marker. The script file and the Timeline stay in sync by order alone.


      ```csharp ref="DialogueManager.cs"
      // Pauses timeline and makes the text clickable
      public void StartText()
      {
          dialogueObject.SetActive(true);
          start = true;
          timelinePlayer.Pause();
          ChangeDialogue();
          ChangeDialogue();
      }

      // Starts timeline and makes the text stop
      public void StopText()
      {
          // … hides the portrait, nameplate and dialogue box

          // pauses the dialogue and runs the animations
          timelinePlayer.Resume();
          start = false;
          current++;
      }
      ```

      `StartText` runs the press handler twice so the opening line appears without the player pressing anything. StopText steps current past the stop row, which means a NOISE line's text is never displayed. Writers use that text as a note for whoever builds the Timeline.

reflection:
  image: "/assets/images/oddinary-farm/kaedim_indie_showcase.png"
  qa:
    - question: What was my biggest mistake leading a team of this size?
      answer: |
        My biggest mistake was not leaving room for creativity, which turned out to be essential for leading a large team of developers. At first, I thought heavy direction and tightly defined requirements would lead to better productivity and retention. Instead, they led to slower deliverables and a loss of interest. As the middleman between the design and systems teams, I tried to bridge the gap between design decisions and the technical requirements needed to build them, and I ended up writing hundreds of small tasks with long technical descriptions. This took many hours of my time and became a major bottleneck in the production pipeline. Developers waited on tasks I hadn't written yet, and the ones they did get left little for them to solve on their own. Some club members left the project because of task shortages and repetitive work.

        Ultimately, I stopped writing long descriptions and let the systems team fill in the gaps themselves. If something wasn't feasible, they talked it over with design and settled on a workaround. This gave members more ownership over the project and sped up development overall. The lesson I took away is that a task should describe the problem and the goal, not the solution. A volunteer team especially stays motivated when people get to solve problems, not just carry out instructions.

    - question: Separation of Concerns
      answer: |
        Another important focus when working with a large team is splitting the game into modular systems that depend on each other as little as possible. Instead of micromanaging, I clearly defined modules around the combinations of mechanics the game needed, then delegated each one to a developer based on their interests. When two tasks depended heavily on each other, we used pair programming so the developers could build them together instead of waiting on one another.

        The wave system is a good example. Its pieces only talk to each other through two global events, `OnEnemyDeath` and `OnWaveComplete`, so designers could add new formations as prefabs and other developers could hook UI into each new wave without touching the wave code. Clear boundaries like these let a lot of people work in the same project at once without stepping on each other's toes.

    - question: What was communication like between design and systems?
      answer: |
        Difficult, to say the least. I was the main point of contact between systems and design, but that job was too much for one person. Every question and change request had to pass through me, so small misunderstandings easily turned into delays. It helped to include a few computer science majors on the design team, since they could flag what wasn't feasible early and shape mechanics so they fit naturally into the code.

        Ultimately, I had systems members review the design material themselves and talk directly with the designers about changes. Cutting out the middleman meant fewer details got lost in translation, and it freed me up to focus on scheduling and the overall direction of the project.
---
