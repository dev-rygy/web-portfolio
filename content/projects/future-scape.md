---
title: FutureScape
genre: VR Career Explorer
date: 2025-04-01
dates: Aug 2023 - Apr 2025
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
  manufacturing, forensic science and more. I built the pharmacy, manufacturing, and urban
  planning minigames.
overview: |
  Developed for [Enterprise Technology](https://tech.asu.edu/), *FutureScape* is a VR career exploration tool developed in Unity and lets middle schoolers try out careers across 15 STEAM industries through short, hands-on minigames. The project features interactive minigames, each attempting to emulate different careers such as pharmacology, manufacturing, forensic science, etc. Students played it at school visits, outreach programs and events.

  I worked on FutureScape as a student developer at ASU NextLab, on a team of five to eight developers. I specifically designed and developed the **pharmacy**, **manufacturing**, and **urban planning** minigames, plus the custom VR rig that every minigame uses. In the pharmacy minigame, players act as pharmacists, dispensing medications to patients within a time limit. The manufacturing minigame challenges players to build assembly lines and create products while managing a budget. The urban planning minigame involves designing a city and managing resources and budgeting effectively.

thumbnail: /assets/video/thumbs/futurescape_thumbnail.mp4
poster: /assets/video/thumbs/futurescape_thumbnail.jpg
video: /assets/video/carousel/futurescape_carousel.mp4
videoPoster: /assets/video/carousel/futurescape_carousel.jpg

links:
  itch: https://nextlab.itch.io/futurescape
  website: https://nextlab.asu.edu/futurescape

engine: Unity (XR Interaction Toolkit)
platforms:
  - VR, PC, WebGL

featuresComment: "// Systems that I've contributed to"
features:
  - title: Custom VR Rig
    size: big
    significance: important
    media: /assets/images/future_scape_images/main_hub_demo.png
    body: |
      The XR Interaction Toolkit's starter rig makes carrying and moving mutually exclusive: grabbing something turns off teleporting on that hand, and starting a teleport drops whatever the hand is holding. It also juggles more movement modes than a first-time VR player can learn quickly. Four of us each prototyped a replacement, and mine became the standard rig for every FutureScape minigame. With it, students carry parts across a room in a few teleports, and we spent less time explaining controls at events.

  - title: One-Stick Teleport
    size: sub
    body: |
      I rebuilt the right hand around one rule: push the stick forward to aim, let go to teleport, push left or right to snap-turn. A custom Thumbstick Held action replaces XRI's stock teleport, turn and move actions. It only fires in the stick's North sector, so turning and aiming can never collide, and its canceled callback, which fires when the stick springs back to center, is the "let go" signal.

      The input callbacks only set flags, and `Update` does the work. It reads where the arc was pointing when the player let go and hands the move to XRI's `TeleportationProvider` instead of moving the rig directly. The provider goes through XRI's locomotion system, which grants exclusive access, so a teleport can never overlap a snap turn in the same frame.

      ```csharp label="Teleport on release"
      // Player hasn't released the thumbstick, don't teleport yet
      if (!_hasReleasedThumbstick) return;

      // Player now wants to teleport, check if it's a valid location
      if (!rightTpRayInteractor.TryGetCurrent3DRaycastHit(out RaycastHit hit))
      {
          _isActive = false;
          _hasReleasedThumbstick = true;
          return;
      }

      // Valid location: hand the move to XRI's locomotion system
      TeleportRequest request = new TeleportRequest()
      {
          destinationPosition = hit.point,
      };
      tpProvider.QueueTeleportRequest(request);
      ```

  - title: Teleporting While Holding Items
    size: sub
    body: |
      This is the main reason the custom rig exists. While the player aims a teleport, the grab ray has to get out of the way, but XRI offers two ways to turn a ray off, and they behave very differently:

      :::table {label="Turning Off The Grab Ray"}
      | Approach | What happens to a held object |
      | :----- | :----- |
      | `gameObject.SetActive(false)` or `enabled = false` | The interaction manager unregisters the interactor and its selection ends. **The object drops.** |
      | `maxRaycastDistance = 0` | The interactor stays registered and keeps its selection. The ray has zero length, so it finds no hover targets and can't grab anything new. **The object stays in hand.** |
      :::

      So the rule is: if the hand is empty, switch the grab ray off completely; if it's holding something, mute it. I checked the XRI source to confirm that a zero-length ray also draws a zero-length line, so the muted ray disappears. The same trick hides the placeholder hand and its line when a player grabs something, because XRI's built-in Hide Controller On Select had nothing to hide on our nested hand prefabs.

      ```csharp label="Muting the grab ray"
      void Update()
      {
          if (!_isActive)
          {
              // Idle: teleport ray off, grab ray fully restored
              rightTpRayInteractor.enabled = false;
              rightGrabRayInteractor.maxRaycastDistance = defaultGrabRayDistance;
              rightGrabRayInteractor.gameObject.SetActive(true);
              return;
          }

          // Aiming a teleport: turn on the teleport ray
          rightTpRayInteractor.enabled = true;

          // Hide the grab ray WITHOUT disabling the interactor
          rightGrabRayInteractor.maxRaycastDistance = 0;

          // Only fully switch off the grab ray if the hand is empty
          if (rightGrabRayInteractor.interactablesSelected.Count <= 0)
          {
              rightGrabRayInteractor.gameObject.SetActive(false);
          }

          // ...teleport logic from above
      }
      ```

  - title: Teleportable Layer
    size: sub
    body: |
      Early builds had a teleport-anywhere bug: the arc could land on walls, tables and props. Unity and XRI have two separate layer systems. Physics layers decide what a raycast can hit, and XRI interaction layers decide which interactors can use which interactables. Restricting the teleport ray's interaction layers wasn't enough, because my rig reads the raw physics hit instead of waiting for an interactable to be selected, so any collider the arc touched was still a valid destination.

      The fix was a new Teleportable physics layer. The teleport ray's mask only includes that layer, so if the ray hits anything, the destination is valid by definition. Level designers now mark a floor as walkable just by setting its layer, with no components or interaction-layer setup.

      ```diff label="Teleportable layer setup"
      # ProjectSettings/TagManager.asset (layers)
        - Scenetransition   # 10
        - Teleportable      # 11  ← new

      # Right Teleport Ray → XRRayInteractor
        m_RaycastMask:
      -   m_Bits: 4294967295   # Everything
      +   m_Bits: 2048         # 1 << 11 (Teleportable)

      # Teleportation Area.prefab
      - m_Layer: 2    # Ignore Raycast
      + m_Layer: 11   # Teleportable
      ```

  - title: Manufacturing Minigame
    size: big
    significance: important
    media: /assets/images/future_scape_images/manufacturing_demo.png
    body: |
      The Manufacturing minigame drops a student onto an empty factory floor with $0 and one goal: build production lines that turn raw materials into products worth money. Students buy machines, snap them onto a grid, link them with conveyors and ship what comes out the end, and each sale pays for the next, more complex line, from $25 sodas up to $150 jet turbines. I designed and built the minigame: grid building, placement for VR and desktop, the machines and their recipes, and the economy.

  - title: Machines and Recipes
    size: sub
    body: |
      Every placeable piece inherits from `ManufacturingComponent`, which holds what all machines share: a price, a list of recipes, an output point and the direction items travel after touching it. Recipes are ScriptableObjects that list a machine's inputs and its output. Each machine reads its output direction from its own rotation when it spawns, so a rotated machine sends items the new way with no extra code.

      :::table {label="Machine Subclasses"}
      | Subclass | What it does | Prefabs | Build cost |
      | :----- | :----- | :----- | :----- |
      | `Dispensor` | Spawns one raw material every 3 s | Sugar, Plastic, Aluminum, Copper, Silicon | $50–$200 |
      | `Conveyer` | Steers items; straight, left-turn and right-turn | 3 conveyor pieces | $50 |
      | `IOMachine` | Consumes inputs and outputs a product by recipe | Carbonator, Coiler, Combiner, Cutter, Filler, Labeler, Linker, Presser | $100–$350 |
      | `Shipper` | Sells finished goods for cash | Shipper | $500 |
      :::

      The hardest bug lived in the I/O machines. When two or more items arrived at once, inputs were counted twice and items were lost. I fixed it with a busy flag: while a machine is processing, it ignores new arrivals, and they wait at the input until it's free.

      ```csharp label="ManufacturingComponent.cs"
      public class ManufacturingComponent : MonoBehaviour
      {
          [SerializeField] public int value;                       // build price, refunded on sale
          [SerializeField] protected ManufacturingRecipe[] manufacturingRecipes;
          [SerializeField] protected Transform outputSpawnpoint;
          [SerializeField] public MovementDirection itemMovementDirection;
          // ...

          protected virtual void Awake()
          {
              // ... find the game manager
              switch (itemMovementDirection)
              {
                  case MovementDirection.forward: movementDirection = transform.forward; break;
                  case MovementDirection.up:      movementDirection = transform.up;      break;
                  default:                        movementDirection = transform.right;   break;
              }
              // ...
          }

          // ... SpawnItem and the rest of the shared machine behaviour
      }
      ```

  - title: One Placement System for VR and Desktop
    size: sub
    body: |
      Every machine fills one cell of a 100 × 100 grid that covers the factory floor. The floor sits at positive world coordinates, so a snapped position cast to an integer is already the array index, with no conversion layer between world space and grid space.

      `SelectionManager` handles aiming, placing, rotating and selling for both the VR rig and the desktop first-person rig in one script. That works because both rigs aim with an XR Interaction Toolkit `XRRayInteractor`; the desktop rig simply casts its ray from the camera, so the aiming code only decides which ray to read. VR and desktop input arrive differently but meet in a single placement check. Holding the button lays a whole row of conveyors, and selling a machine refunds its full price, so students experiment instead of worrying about wasting money.

      ```csharp label="SelectionManager.cs"
      public void UpdateReticlePosition()
      {
          RaycastHit raycastHit;
          if (useDesktopControls)
              desktopRayInteractor.TryGetCurrent3DRaycastHit(out raycastHit);
          else
              VRRayInteractor.TryGetCurrent3DRaycastHit(out raycastHit);

          reticlePosition  = raycastHit.point;
          selectedPosition = ManufacturingGrid.SnapToGrid(reticlePosition);

          if (!raycastHit.collider)
              return;

          onGround = raycastHit.collider.gameObject.CompareTag("Ground");

          CheckCollision();                    // ask the grid whether the cell is free
          OnSelection?.Invoke(availability);   // tell the preview gizmo
          cellSelectorGizmo.transform.position = selectedPosition;
      }
      ```

  - title: Economy and a Timing Bug
    size: sub
    body: |
      Money is the minigame's progression system. Students earn a passive $10 every 2 seconds plus the sale price of every finished product that reaches a Shipper. Raw and intermediate items are worth nothing, so only complete production lines pay off.

      Passive income started as a check in `Update` that compared `Time.time` with a stored next-payment time. `Time.time` counts from app launch, not from when the scene loads, so a student who entered the minigame late found the schedule far behind the clock and received a burst of catch-up payments. I moved the payments into a coroutine that starts with the scene and counts its own elapsed time, which removes the absolute clock entirely.

      ```csharp label="ManufacturingGameManager.cs"
      private IEnumerator PassiveIncomeRoutine()
      {
          float timePassed = 0;
          while (true)
          {
              timePassed += Time.deltaTime;
              if (timePassed >= secondsTillPassiveIncome)   // time for the next payment
              {
                  playerBalance += passiveIncome;
                  OnBalanceUpdate?.Invoke(playerBalance);
                  timePassed = 0;
              }
              yield return null;                             // wait a frame
          }
      }
      ```

  - title: Pharmacy Minigame
    size: big
    significance: trivial
    media: /assets/images/future_scape_images/pharm_demo.png
    body: |
      The Pharmacy minigame turns a pharmacist's job into a two-minute race: read each patient's symptoms, prepare the right medication and hand it over before the clock runs out. I built the original game loop in 2023, including the medication system, pill bottles, patients and difficulty scaling; teammates later added the medicine guidebook, desktop tooltips and a reworked timer. The hardest parts were the pill-bottle physics and keeping the game easy for middle schoolers to follow.

  - title: Ailments as Data
    size: sub
    body: |
      Every ailment is a ScriptableObject asset. A `SymptomData` asset holds the text the patient shows and the one medication that cures it, and every tonic, cream and pill bottle carries a `Medication` component naming the medication it is, so checking a cure is a plain enum comparison. Adding or editing an ailment takes no code: a designer creates the asset from Unity's Create menu and drops it into the game manager's list. That made content easy to grow and adjust; the game ships with 12 ailments.

      ```csharp label="SymptomData.cs"
      [CreateAssetMenu(fileName = "SymptomData", menuName = "Scriptable Objects/Data/Symptom Data", order = 1)]
      public class SymptomData : ScriptableObject
      {
          [TextArea(3,10)]
          public string description;

          public MedicationType cure;
      }
      ```

      :::table {label="Symptoms" caption="4 of the 12 ailments that ship with the game."}
      | Symptom | Cure | Form |
      | :----- | :----- | :------ |
      | Nausea and vomiting | Promethazine | Tonic |
      | Second-degree sunburn | Hydrocortisone | Cream |
      | Fever | Ibuprofen | Pills |
      | High blood pressure | Lisinopril | Pills |
      :::

  - title: Pill Bottle Physics
    size: sub
    body: |
      Tonics and creams are ready to hand over, but pills have to be counted into a bottle first, which is the game's main hands-on mechanic. Players drop loose pills one by one into an empty bottle. The first pill decides what the bottle will become, pills of a different type are never counted, and once five matching pills are in, the bottle is capped and becomes an ordinary `Medication`, so delivery has only one code path.

      Two physics problems made it hard. A single pill could set off the bottle's trigger more than once and be counted twice, which a bottle-side evaluation flag (`pillEvalFlag`) fixed. And tiny pills were hard to grab with VR controllers, so their grab colliders are larger than the visible pill.

      ```csharp label="PillBottle.cs"
      private void OnTriggerEnter(Collider other)
      {
          if (!pillEvalFlag && pillCount < requiredPillCount && other.gameObject.GetComponent<Pill>() != null)
          {
              Pill pill = other.gameObject.GetComponent<Pill>();

              // The first pill sets the bottle's type
              if (currentMedicationType == MedicationType.emptyBottle)
              {
                  currentMedicationType = pill.pillType;
                  OnNewPill?.Invoke(pill.pillSprite);  // show this pill's icon

                  Destroy(other.gameObject);
                  pillCount++;
              }
              else if (currentMedicationType == pill.pillType)
              {
                  Destroy(other.gameObject);
                  pillCount++;
              }
              CheckBottle();
              OnPillUpdate?.Invoke(pillCount, requiredPillCount);
          }
      }
      ```

  - title: Patients and Delivery
    size: sub
    body: |
      A relay pad on the counter is the single doorway into the game rules: the player only ever touches physical objects, and anything placed on the pad is checked against the symptoms the patient still has. A correct medication is socketed. Its grab interactable is disabled so a VR player can't grab it back, and its rigidbody turns kinematic so physics can't knock it off the counter. A wrong medication simply stays loose, so the only cost of a mistake is time, which keeps the game forgiving for kids. Patients arrive with one symptom, and every third cure adds another, up to three.

      ```csharp label="RelayPad.cs"
      public void SocketMedication(GameObject medication)
      {
          if (socketIndex < socketPoints.Length)
          {
              medicationsOnCounter.Add(medication);

              medication.transform.position = socketPoints[socketIndex].position;
              medication.transform.rotation = socketPoints[socketIndex].rotation;

              medication.GetComponent<XRGrabInteractable>().enabled = false;
              medication.GetComponent<Rigidbody>().isKinematic = true;

              socketIndex++;
          }
      }
      ```

  - title: Urban Planning Minigame
    size: big
    significance: trivial
    media: /assets/images/future_scape_images/urban_plan_demo.png
    body: |
      The Urban Planning minigame lets students build a sci-fi city one tile at a time, in VR or at a desktop: they pick one of 19 buildings or four road pieces, and a see-through preview snaps to the grid, green when the tile is free and red when it's taken. I built the core in 2024: the scene, the building system, grid placement and removal, the preview, and a resource and happiness simulation that was cut after playtests showed it was too complex for middle schoolers. Teammates later added the guided tutorial and the paged build menu.

  - title: Reusing the Manufacturing Grid
    size: sub
    body: |
      Urban Planning builds on the same grid and placement code as the Manufacturing minigame, which gave it working collision checks from day one. Placement only fires when a building is selected, the tile is free, the ray is on ground, the cooldown has expired and the build menu is closed, so a click on the menu never lands in the world. Every new building is parented to one container, which makes a full reset a scene reload. Each building registers itself with the game manager when it starts and unregisters when it's destroyed, so the manager's list is always accurate without the placement code having to tell it.

  - title: Resource Cascade (Cut)
    size: sub
    body: |
      Each building needed people, energy, water, produce and food, and produced some of its own, with every stat stored in a `BuildingData` ScriptableObject so the city could be tuned without touching code. A building only works when the city's spare resources cover its needs, and once it works, its output joins the pool, which might switch on another building further down the list. That chain was the hardest part: `CheckResources` walks every building and, if any of them changed state, runs again until the city settles.

      Playtests showed the system was too complex for middle schoolers, so it was cut from the final game.

      ```csharp label="Resource cascade"
      public void CheckResources()
      {
          changed = false;
          if (buildingList.Count == 0) return;

          // Reuse BuildingData as a scratch container for what's left in the pool
          BuildingData resourcesLeft = ScriptableObject.CreateInstance<BuildingData>();
          resourcesLeft.peopleRequired = totalPeople;
          resourcesLeft.energyRequired = totalEnergy;
          // ...water, produce, food

          for (int i = 0; i < buildingList.Count; i++)
              buildingList[i].UpdateResources(resourcesLeft);

          if (changed)        // something switched on or off, so settle again
              CheckResources();
      }
      ```
---
