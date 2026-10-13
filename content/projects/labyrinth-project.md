---
title: Labyrinth Procedural Dungeon Generator
genre: Tool
date: 2024-11-01
dates: Nov 2024 - Present
status: prototype
roles:
  - Procedural Programmer

summary: >-
  The Labyrinth is an interconnected procedural dungeon generation algorithm built in Unity/C# that creates seamlessly joined, thematically distinct 3D areas without loading screens.
description: >-
  The Labyrinth is an interconnected procedural dungeon generation algorithm built in Unity/C# that creates seamlessly joined, thematically distinct 3D areas without loading screens.
overview: |
  Procedural dungeon generation algorithm built in Unity/C# with the purpose of creating and linking seamlessly connected, thematically distinct areas into one contiguous map without teleporting or loading screens.

  Most techniques used in the algorithm are fairly well known within the proc-gen community except for one feature. I first occupy grid space with marks I call **"Blueprints"** and then parse them later to create rooms of varying shape and size. This provides some variability to what can spawn between critical rooms, something I haven't seen in many rogue-like games that use similar techniques.

  The algorithm was made in Unity 3D but can be rewritten to work in any game engine.

thumbnail: /assets/video/thumbs/labyrinth_thumbnail.mp4
poster: /assets/video/thumbs/labyrinth_thumbnail.jpg
video: "https://www.youtube.com/watch?v=Adakgpoy0p0"

links:
  github: https://github.com/dev-rygy/labyrinth-algorithm.git
  itch: "https://dev-rygy.itch.io/labyrinth-procedural-generator"

engine: Unity 6
platforms:
  - PC

features:
  - title: Blueprints
    size: big
    media: /assets/images/labyrinth-images/unique_blueprints.png
    body: |
      **Blueprints** are the backbone of the algorithm. They must exist in order for any rooms to generate. Blueprints are simply single-celled marks on a grid that tell the algorithm "a room can eventually spawn here". When the blueprints are done generating, a second pass parses the blueprints and generates rooms based on a set of rules. Think of how Rule Tiles work in game engines.

      ```csharp label="Blueprint"
      public class Blueprint
      {
          public readonly string CellID;
          public readonly Vector3Int Position;    // Position of blueprint coords on grid
          public bool Available { get; set; }     // Prevents/allows parsing algorithm to use blueprint
          public bool[] EntryPointFlags { get; set; }

          // Constructor
          public Blueprint(Vector3Int position, string cellID = "Blueprint")
          {
              Available = true;
              CellID = cellID;
              Position = position;
              EntryPointFlags = new bool[6];      // A flag to mark which entrances should be open for a room
          }
      }
      ```

      To prevent blueprints from spawning on top of other blueprints, a Dictionary is used. A C# dictionary has O(1) lookup time, cannot contain duplicates, and can allocate space dynamically. To prevent rooms from spawning on top of each other, blueprints house a flag called `Available` that tells the room parser whether or not to include the blueprint in its check. Finally, `EntryPointFlags` tell the room which doorways it needs to open. These flags are determined during the blueprint pass of the algorithm.

      **Blueprint Operations** are individual instruction-set style units of execution that can generate Blueprints in a specific pattern. This not only fosters a more organically catered dungeon but also makes the generation easy to debug by stepping through each operation individually one-by-one.

  - title: Blueprint Operations
    size: sub
    media: ""
    body: |
      As the algorithm grew larger, I began to worry about how hard it would be to debug in future iterations. At the time, the procedural generator executed all of its code in one go, but I wanted a way to step through each process individually, something akin to setting breakpoints in code. This is when I had the idea of applying concepts from assembly and instruction set architecture to my algorithm. Little did I know that building this debugger would end up making my procedural generator more dynamic and controllable than ever before.

      To accomplish this, I needed to split each of the algorithm's processes into individual, executable components I call "Blueprint Operations." Each operation holds both input and output data, similar to registers in an assembly language. Operations are initialized and placed into a queue, then executed one by one.

      ```csharp label="BlueprintOperation"
      public abstract class BlueprintOperation
      {
          // DataID for is used strictly for debugging purposes.
          public string OperationID { get; protected set; }

          // Ports are the arguments and return values of operations.
          public List<string> InputPorts { get; protected set; }
          public List<string> OutputPorts { get; protected set; }

          protected MapGenerationContext _context;

          public BlueprintOperation(MapGenerationContext context)
          {
              InputPorts = new List<string>();
              OutputPorts = new List<string>();

              _context = context;
          }

          ...
      }
      ```

  - title: Map Generation Context
    size: sub
    media: ""
    body: |
      Just like in assembly, the outputs of some operations need to be stored in memory so other operations can use them later. The map generation's `context` holds both the instruction/operation execution order and the data used in those operations.

      ```csharp label="MapGenerationContext"
      public sealed class MapGenerationContext
      {
          // Quick random access blueprint container; stores all blueprints generated in map
          private static Dictionary<Vector3Int, Blueprint> _blueprintDictionary;
          public static Dictionary<Vector3Int, Blueprint> BlueprintDictionary => _blueprintDictionary;

          public int OperationIDCounter { get; private set; } = 10000;
          public int MemoryIDCounter { get; private set; } = 20000;

          // Stores blueprint operations to be executed later
          public LinkedList<BlueprintOperation> OperationQueue { get; private set; }

          // Stores outputs from blueprint operations
          private Dictionary<string, object> _dataCache;

          public MapGenerationContext()
          {
              _dataCache = new();
              _blueprintDictionary = new();
              OperationQueue = new();
          }

          public BlueprintOperation OperationQueuePeek()
          {
              return OperationQueue?.First.Value;
          }

          public void OperationQueueEnqueue(BlueprintOperation op)
          {
              OperationQueue?.AddLast(op);
          }

          public void OperationQueueAddFront(BlueprintOperation op)
          {
              OperationQueue?.AddFirst(op);
          }

          public BlueprintOperation OperationQueueDequeue()
          {
              // Check to see if queue has at least one operation stored
              if (OperationQueue?.First is null)
                  return null;

              BlueprintOperation op = OperationQueue?.First.Value;
              OperationQueue?.RemoveFirst();
              return op;
          }

          // Get data
          public bool TryGet<T>(string memoryID, out T value)
          {
              if (_dataCache is null)
              {
                  value = default;
                  return false;
              }

              if (_dataCache.TryGetValue(memoryID, out object obj) && obj is T castValue)
              {
                  value = castValue;
                  return true;
              }

              value = default;
              return false;
          }

          // Store data
          public void Malloc(string memoryID, object value)
          {
              if (_dataCache is null)
                  return;

              _dataCache[memoryID] = value;
          }

          // Check for data
          public bool Contains(string memoryID)
          {
              if (_dataCache is null)
                  return false;

              return _dataCache.ContainsKey(memoryID);
          }

          // Remove data
          public void Remove(string memoryID)
          {
              if (_dataCache is null)
                  return;

              if (_dataCache.ContainsKey(memoryID))
                  _dataCache.Remove(memoryID);
          }

          public int ConsumeOperationID()
          {
              return OperationIDCounter++;
          }

          public int ConsumeMemoryID()
          {
              return MemoryIDCounter++;
          }

          ...
      }
      ```

  - title: Blueprint Graph
    size: big
    media: /assets/images/labyrinth-images/blueprint_graph.png
    body: |
      The **Blueprint Graph** determines the order of execution of each individual **Blueprint Operation**. Taking inspiration from *Unreal's Blueprint system*, the developer can mix and match operations in order to generate specific progression patterns in the dungeon. The operations responsible for generation are *Pathfinding*, *Random Placement*, and the *Drunkard's Walk*. Although, these generation patterns can be combined and expanded via set operations - *union*, *intersection*, and *difference*. There are also *random access* operations for even more variation. Generation patterns can be repeated via the *branch* and *jump* operations.

      Right now, all nodes are hardcoded into a controller, though this feature would work perfectly with Unity's graphing toolkit in a future implementation. Below is the controller used to both store and execute operations. Operations can be stepped through by a specified `stepLength`, given via the `Advance()` function.

      ```csharp label="MapGenerationController"
      public class MapGenerationController
      {
          private void LoadOperations()
          {
              // Hardcoded operations listed in their order of execution. Loaded into context to be executed later.

              ...
          }

          private void ConsumeStep()
          {
              if (_runToEnd)
                  return;

              if (_stepBudget > 0)
                  _stepBudget--;
          }

          public void Advance(int stepLength)
          {
              if (stepLength <= 0)
                  return;

              _stepBudget += stepLength;
              _runToEnd = false;
          }

          public void AdvanceAll()
          {
              if (!IsGenerating)
                  return;

              _runToEnd = true;
          }

          private IEnumerator ExecuteOperations()
          {
              // Execute operations and generate blueprints
              while (_context.OperationQueue.Count > 0)
              {
                  // Halt the execution of operations
                  while (!_runToEnd && _stepBudget <= 0)
                      yield return null;

                  ConsumeStep();

                  // Dequeue the current operation
                  BlueprintOperation operation = _context.OperationQueueDequeue();
                  if (operation == null)
                      throw new ArgumentNullException(nameof(operation));

                  // Execute Operation
                  bool result = operation.Execute();

                  // Operation failed to execute; stop running coroutine
                  if (!result)
                  {
                      GenerationFailed();
                      yield break;
                  }
              }
          }

          ...
      }
      ```

  - title: Zones
    size: big
    media: /assets/images/labyrinth-images/zone_connection_showcase.loop.mp4
    body: |
      One of the most important problems I set out to solve was a way to generate themed areas and connect them together in a seamless fashion, allowing the player to move back and forth between them. Alongside rogue-likes I'm also a huge fan of RPGs that can transport the player to different areas but also require them to come back to earlier areas for progression purposes. The concept of "Zones" helped me accomplish this.

      Zones connect to one another through intermediary zones I call "Connection Zones." These zones simply intersect their bounds with others and connect them via their own blueprint operations. In the clip, blue blueprints are part of the zone and purple ones are part of the connection zone.

      As of now, Zones are purely containers that house unique rooms, branches, and bounds that contain their blueprints. A controller still determines zone generation, though in a future update, Zones will be able to house their own operations and blueprint graph for unique generation rules.

  - title: Unique Blueprint Placement
    size: sub
    media: ""
    body: |
      Unique rooms are rooms determined by their zone before runtime; the blueprints generated in place of these rooms *are not* to be included later in the room parsing procedure. These are most likely necessary rooms whose blueprint shape would be difficult or impossible to parse later.

      These rooms can either be fixed (placed in a set position) or bounded (placed randomly within set bounds). Both cases have their respective blueprint operations. The blueprints generated from this operation can later be used as points for the Delaunay and A* operations.

  - title: Divergent Blueprint Placement
    size: sub
    media: ""
    body: |
      Some zones may have few unique rooms, which means a small set of points for pathfinding. The resulting generation would be very simple and boring. To make the generation a bit more windy and organic, I place what I call "Divergent Rooms" to add more points to the pathfinding graph.

      Divergent rooms are a set number of blueprints randomly spawned within a zone. These blueprints can have varied dimensions, described as an input to the operation. The blueprints generated from this operation can later be used as points by the Delaunay and A* operations.

  - title: Delaunay Triangulation
    size: big
    media: /assets/images/labyrinth-images/triangulation.loop.mp4
    body: |
      Delaunay Triangulation takes a set of defined points and creates a mesh such that no vertex lies inside the circumcircle of a triangle in the mesh. That mesh can later be used as a graph for pathfinding. In 2D it's fairly simple, but in 3D it gets more complicated: instead of triangles we must use tetrahedra and find the circumsphere of each tetrahedron using the determinant. [This article](https://mathworld.wolfram.com/Circumsphere.html) helped me calculate those things.

      My implementation of Delaunay uses a set of blueprint positions as points and creates edges connecting them. It also helps prevent the generation of a dungeon with too many long and unnecessary paths between rooms.

      ### Greedy Algorithms

      Delaunay ensures every point in the resultant graph is connected, which means no room is left out. However, this can still result in many edges, leading to an excess of branches and rooms. To manage this, I use a greedy algorithm, Prim's Algorithm, to find the MST (minimum spanning tree) in the graph. From there, we can randomly select other edges in the graph if we want some loops in our dungeon.

  - title: Handling Coplanar Tetrahedra
    size: sub
    media: /assets/images/labyrinth-images/coplanar.loop.mp4
    body: |
      A major problem I faced was dealing with degenerate tetrahedra, which can occur when all four points are coplanar (the determinant is 0, which breaks the triangulation logic). I needed to ensure that at least one blueprint point used in a tetrahedron exists on a different floor than the other three to prevent this from happening. When a zone is completely flat (one floor), I can just use 2D Delaunay to connect the blueprints instead.

  - title: Lexgen (Blueprint Parsing)
    tabText: Lexgen
    size: big
    media: /assets/images/labyrinth-images/room_walls.png
    body: |
      The final pass of the algorithm parses all available blueprints using a process I call **Lexgen**. The parsing determines what rooms can be generated from a orientation and pattern of blueprints. The parsing system is based on a top-down recursive technique commonly used in compilers called **Recursive Descent Parsing**. 

      ### Shape Data
      `ShapeData` is a object that essentually functions as a token for parsing. Generated blueprint cells are checked against each possible shape, the shapes that fit the blueprint structure perfectly are choosen to be generated. By generate I mean spawning the rooms that the shapes represent, each shape having a respective list of rooms. You can think of this method as similar to the old "Fitting Shapes In Their Correct Holes" game that toddlers play.

  - title: Recursive Descent
    size: sub
    media: ""
    body: |
      A base blueprint is choosen for the algorithm to parse, usually the next available blueprint in a path. From this `candidates` are choosen from ShapeData cells that are considered to be contenders to fit in that blueprint position. For a candidate can be a contender its blueprint configuration needs to match the base blueprint's configuration. These are defined by the other cells surrounding it. All 6 directions are checked; a 'Dont Care' config means we do not need to worry about whether there is or isn't a blueprint in a certain direction, a 'Blueprint' config means there needs to be a blueprint in that direction or it will not succeed, and a 'No Blueprint' config means there must not be a blueprint in that direction.

      ```csharp label="ShapeCandidate"
      public class ShapeCandidate
        {
            // Candidate Properties
            private ShapeData _shape;
            public ShapeData Shape => _shape;
            private Vector3Int _anchor;
            public Vector3Int Anchor => _anchor;
            private RoomRotation _rotation;
            public RoomRotation Rotation => _rotation;

            // Temp Parsing Data
            private readonly HashSet<Vector3Int> _coveredCells;
            public HashSet<Vector3Int> CoveredCells => _coveredCells;
            public int PassedCells => _coveredCells.Count;
            private bool _isFilled;
            public bool IsFilled => _isFilled;

            public ShapeCandidate(ShapeData shape, Vector3Int cell, RoomRotation rotation = RoomRotation.Deg0)
            {
                _shape = shape;
                _anchor = cell;
                _coveredCells = new();
                _rotation = rotation;
            }

            public bool CheckFilled()
            {
                if (_coveredCells.Count >= _shape.CellCount)
                {
                    return true;
                }
                return false;
            }

            public void MarkFilled()
            {
                _isFilled = true;
            }

            public void CellCovered(Vector3Int shapeCell)
            {
                // Only 'Blueprint' cells belong to the room; others are just neighbor constraints
                if (_shape.Cells.TryGetValue(shapeCell, out var state) && state == CellState.Blueprint)
                    _coveredCells.Add(shapeCell);
            }
        }
      ```

      Candidates that succeed are taken to the next round, this is where the recursion comes in. The base blueprint for the next round depends on whether or not a blueprint exists in a certain direction from the blueprint of the current function call. If there is then we parse bringing the candidates that passed into the next iteration. From this the configuration matching process begins again but now fitting against the new base blueprint.

      If a candidate fits the blueprint orientation perfectly it is flagged as `accepted` and goes into a list. Once all candidates are exhausted the parsing terminates - a random shape and room are choosen from the accepted list.

        ```csharp label="ParseBlueprints"
        public void ParseBlueprints(Blueprint currentBlueprint, List<ShapeCandidate> candidates, HashSet<Blueprint> visited)
        {
            // Base case; no viable shapes to check for next blueprint
            if (candidates.Count <= 0)
                return;

            // Shapes that pass this iteration have atleast one vaiable anchor
            List<ShapeCandidate> nextRoundCandidates = new List<ShapeCandidate>(candidates);

            // Make sure we don't visit a blueprint twice in a recursive branch
            HashSet<Blueprint> visitedBlueprintDictionary = new HashSet<Blueprint>(visited);

            // Local position from base blueprint
            Vector3Int localPosition = currentBlueprint.Position - _baseBlueprint.Position;

            // Check all candidates
            foreach (var candidate in nextRoundCandidates.ToArray())
            {
                // Shape cell that lands on this blueprint; undo the candidate's rotation, then cellOffset from its anchor
                Vector3Int localPosFromAnchor = candidate.Anchor + candidate.Rotation.ToInverseMatrix() * localPosition;

                // If candidate passes
                if (CheckConfigs(localPosFromAnchor, candidate.Shape, currentBlueprint, candidate.Rotation))
                {
                    // AddBlueprint passed cell to candidate
                    candidate.CellCovered(localPosFromAnchor);

                    // If all cells of shape are satisfied; first time satisfaction
                    if (candidate.CheckFilled() && !candidate.IsFilled)
                    {
                        candidate.MarkFilled();     // Prevents duplicate candidates from being pushed into the accepted list
                        _acceptedShapes.Add(candidate);
                    }

                    // Removed if already filled; prevents algorithm from checking multiple valid paths for one candidate
                    if (candidate.IsFilled)
                        nextRoundCandidates.Remove(candidate);

                }
                else  // Candidate did not pass
                {
                    nextRoundCandidates.Remove(candidate);
                }
            }
            visitedBlueprintDictionary.Add(currentBlueprint);

            // Parse new blueprint
            foreach (var direction in k_directions)
            {
                // Blueprint needs to exist and be available to walk into
                if (!ParserPeek(currentBlueprint, direction, out Blueprint found))
                    continue;

                // Already checked blueprint in this direction so don't parse
                if (visitedBlueprintDictionary.Contains(found))
                    continue;

                // Parse the neighbour with the shapes that are still viable
                ParseBlueprints(found, nextRoundCandidates, visitedBlueprintDictionary);
            }
        }

        ...

        private bool ParserPeek(Blueprint blueprint, Vector3Int position, out Blueprint found)
        {
            if (_blueprintDictionary.TryGetValue(blueprint.Position + position, out found))
            {
                if (found.Available)        // Blueprint needs to be available to parse
                    return true;
            }
            return false;
        }
        ```
  - title: Handling Candidate Rotation
    size: sub
    media: ""
    body: |
      Shape rotation is considered in order to add more variation to the maps layout. This is done by rotating the positions of the shape cells with the **Rotation Matrix**. When a candidate is rotated it's configs must also be rotated in order to match it's new orientation. 

      Since we are only interested in the orthonormal directions setting up each rotation is simple and can be set static and immutable.

      ```csharp label="Matrix3x3Int"
      // 3D Rotation Matrices; each matches Unity's Quaternion.Euler about that axis (e.g. RotMatrixY90 == Euler(0, 90, 0))
      public static readonly Matrix3x3Int RotMatrixX90 = new Matrix3x3Int(1, 0, 0, 0, 0, -1, 0, 1, 0);
      public static readonly Matrix3x3Int RotMatrixX180 = new Matrix3x3Int(1, 0, 0, 0, -1, 0, 0, 0, -1);
      public static readonly Matrix3x3Int RotMatrixX270 = new Matrix3x3Int(1, 0, 0, 0, 0, 1, 0, -1, 0);
      public static readonly Matrix3x3Int RotMatrixY90 = new Matrix3x3Int(0, 0, 1, 0, 1, 0, -1, 0, 0);
      public static readonly Matrix3x3Int RotMatrixY180 = new Matrix3x3Int(-1, 0, 0, 0, 1, 0, 0, 0, -1);
      public static readonly Matrix3x3Int RotMatrixY270 = new Matrix3x3Int(0, 0, -1, 0, 1, 0, 1, 0, 0);
      public static readonly Matrix3x3Int RotMatrixZ90 = new Matrix3x3Int(0, -1, 0, 1, 0, 0, 0, 0, 1);
      public static readonly Matrix3x3Int RotMatrixZ180 = new Matrix3x3Int(-1, 0, 0, 0, -1, 0, 0, 0, 1);
      public static readonly Matrix3x3Int RotMatrixZ270 = new Matrix3x3Int(0, 1, 0, -1, 0, 0, 0, 0, 1);
      public static readonly Matrix3x3Int Identity = new Matrix3x3Int(1, 0, 0, 0, 1, 0, 0, 0, 1);
      ```

      A separate class `RoomRotationExtensions` handles the actual rotation of each candidate cell by simply returning the rotation requested. The inverse matrix is used to map the offsets used to rotate a candidate back to it's original shape orientation.

      ```csharp label="RoomRotationExtensions"
      public static class RoomRotationExtensions
      {
          public static Math.Matrix3x3Int ToMatrix(this RoomRotation rotation)
          {
              return rotation switch
              {
                  RoomRotation.Deg0 => Math.Matrix3x3Int.Identity,
                  RoomRotation.Deg90 => Math.Matrix3x3Int.RotMatrixY90,
                  RoomRotation.Deg180 => Math.Matrix3x3Int.RotMatrixY180,
                  RoomRotation.Deg270 => Math.Matrix3x3Int.RotMatrixY270,
                  _ => Math.Matrix3x3Int.Identity,
              };
          }
        
          public static Math.Matrix3x3Int ToInverseMatrix(this RoomRotation rotation)
          {
              return ((RoomRotation)((4 - (int)rotation) % 4)).ToMatrix();
          }
      }
      ```
  - title: Pathfinding
    size: big
    media: /assets/images/labyrinth-images/heuristic_showcase.loop.mp4
    body: |
      Many pathfinding algorithms exist that could help connect blueprints together, but none are as fast and versatile as A*. Encapsulating A* into an operation, I can either connect two blueprints directly or pass in a graph and connect all of its nodes. A* returns all the positions needed to connect the blueprints, and from there I simply spawn new blueprints in their place.

      ### Heuristic Functions
      A cost/heuristic function tells A* how to path toward each blueprint. The heuristic can make the path curvy, straight, or zig-zagged. There are endless possibilities for what the cost function can be, but as of now I use four well-known functions:

      1. **Euclidean** — creates a fairly straight path to the target.<br>`D = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²)`
      2. **Manhattan** — causes the path to stay parallel to the x, y, and z axes.<br>`D = |x₂ − x₁| + |y₂ − y₁| + |z₂ − z₁|`
      3. **Chebyshev** — causes the path to zig-zag and staircase.<br>`D = max(|x₂ − x₁|, |y₂ − y₁|, |z₂ − z₁|)`
      4. **Dijkstra** — guaranteed optimal path; cheapest route.<br>`D = 0`

  - title: The Drunkard's Walk
    tabText: Drunkard's Walk
    size: big
    media: ""
    body: |
      This was the first algorithm that gave birth to the Labyrinth. Simply put, a blueprint is placed randomly in one of six directions from a point in space. This continues until a pathway is generated with the desired number of rooms. Seems simple enough at first, but I ran into a problem: what if a blueprint is already surrounded by other blueprints? Should the algorithm just stop generating and cut its losses?

      ### Backtracking

      The solution was backtracking. When a conflict occurs, a recursive algorithm backtracks to a previously placed blueprint and attempts to generate a new one in its place. Drunkard's Walk is still used today for branches that can lead to rewards, trials, and secrets.

      ```csharp label="Recursive Drunkard's Walk"
      private bool BlueprintDrunkardWalkRecursive(BoundsInt bounds, Blueprint previousBlueprint)
      {
          // Amount of desired blueprints placed; stop condition
          if (path.BlueprintCount() >= DesiredPathLength)
              return true;

          // Attempt to place a new blueprint
          Blueprint newBlueprint = PlaceBlueprintInRandomDirection(bounds, previousBlueprint);

          // New blueprint was placed -> place next blueprint
          if (newBlueprint != null)
          {
              bool placed = BlueprintDrunkardWalkRecursive(bounds, newBlueprint);

              // next blueprint could not be placed? Continuation of path failed -> try prev blueprint again
              if (!placed)
                  return BlueprintDrunkardWalkRecursive(bounds, previousBlueprint); // Backtrack
              else
                  return true;
          }
          return false;    // No blueprint could be placed; not enough valid space
      }
      ```

  - title: Player State Machine
    size: big
    media: /assets/images/labyrinth-images/player_state_machine_nfa.png
    body: |
      Originally, before I became obsessed with the procedural generator, this project leaned more toward a game than a tech demo. The player could wield multiple weapons, each housing its own set of abilities, and also cycled through situational states like falling, climbing, and emoting. Without a formal state model, the player codebase would have devolved into an unmanageable tangle of flags and booleans, so I turned to finite automata instead.

      Using the principles from *Introduction to the Theory of Computation* by Michael Sipser, I modeled the player as an NFA: a set of states **Q**, whose transitions are triggered by an input symbol from the alphabet **Σ**, or by an empty input. The rules break down as follows:

      - **States (Q)** = { Idle, ComboPrimary, PowerPrimary, ComboSecondary, PowerSecondary, Charge, Cast, Fall, Land, Climb, Dash, DashAttack, Hit, Death, Emote }
      - **Alphabet (Σ)** = { button_south, button_east, button_west, button_north, left_stick, right_stick, right_shoulder, left_shoulder, right_trigger, left_trigger, interact, take_damage, IsGrounded() = true, IsGrounded() = false, left_stick + right_stick, left_shoulder + right_shoulder, emote }
      - **Start State (q0 ∈ Q)** = { Idle }
      - **Final States (F ⊆ Q)** = { Death }

      Each state in code is represented as a class. A new instance is created and held in the player's `currentState` variable. Every state implements a shared interface with three required functions:

      ```csharp label="PlayerState"
      public class SomePlayerState : PlayerState
      {
          public SomePlayerState(PlayerStateMachine stateMachine) : base(stateMachine) { }

          // Enter is called on the first frame when the state is created.
          public override void Enter() { }

          // Tick is called on every frame of the stateMachine.
          public override void Tick(float deltaTime) { }

          // Exit is called right before the state is switched.
          public override void Exit() { }
      }
      ```

      - `Enter()` fires on the first frame the state becomes active, before any `Tick()` calls. It's best used for subscribing to events and setting up animations.
      - `Tick()` runs every frame the player remains in the state, handling whatever needs continuous updating.
      - `Exit()` runs on the state's final frame, right before the switch occurs — the next state won't begin executing until this finishes. It's the right place to unsubscribe from events and cancel any in-progress actions or animations.

      This state machine kept the player controller predictable even as the ability list grew; new states could be added without worrying about which combination of booleans might silently break another. In hindsight, that discipline ended up mattering more than I expected: once the procedural generator became the focus of the project, having a player controller that was already modular and easy to scale meant I could add more states and abilities in the future without worrying about changing source code.

      :::media {src="https://www.youtube.com/watch?v=Hko1P993wqQ" alt="Swapping ability sets" caption="Swapping broadsword, buckler, and unarmed ability sets"}
      :::

  - title: Command Line Interface
    tabText: CLI
    size: big
    media: ""
    body: |
      As my project grew larger, having a solid debugging system in place became essential. Procedural generation is already hard to debug — many errors are semantic, meaning it can be difficult to trace through code alone. That's what sparked the idea of building a CLI.

      Each command is an object of type `ConsoleCommand`, tied to a unique ID and a delegate. Commands are stored in a command registry — a dictionary keyed by command ID. The first string typed into the interface is parsed as the command name; everything after it is treated as that command's arguments.

      By decoupling commands from the registry, I ensured they could be created from anywhere in the project, reducing dependencies, mitigating subscription errors, and keeping the system adaptable to future updates.

      ```csharp label="ConsoleCommand + ConsoleCommandRegistry"
      public class ConsoleCommand
      {
          private string _commandId;
          private string _commandDescription;
          private Action<string[]> _execute;

          public string CommandId { get { return _commandId; } }
          public string CommandDescription { get { return _commandDescription; } }
          public Action<string[]> Execute { get { return _execute; } }

          public ConsoleCommand(string commandId, string commandDescription, Action<string[]> execute)
          {
              _commandId = commandId;
              _commandDescription = commandDescription;
              _execute = execute;
          }
      }

      public class ConsoleCommandRegistry
      {
          // List to hold all commands
          private Dictionary<string, ConsoleCommand> _commands = new();

          public void RegisterCommand(ConsoleCommand command)
          {
              // Prevent duplicate command entries
              if (_commands.ContainsKey(command.CommandId.ToLower()))
                  return;

              // Add command to registry
              _commands.Add(command.CommandId, command);
          }

          public void UnregisterCommand(string commandId)
          {
              // Prevent unregistering a command that doesn't exist
              if (!_commands.ContainsKey(commandId.ToLower()))
                  return;

              // Remove command from registry
              _commands.Remove(commandId.ToLower());
          }

          public bool TryExecuteCommand(string input)
          {
              // Split the string into individual parts
              // This will help us determine the command arguments
              var splitString = input.Split(' ');

              if (splitString.Length == 0)
                  return false;

              // The command to execute itself
              string commandName = splitString[0].ToLower();

              // Command arguments
              string[] args = splitString.Length > 1 ? splitString[1..] : Array.Empty<string>();

              // Search command registry for command with the name specified
              if (_commands.TryGetValue(commandName, out var command))
              {
                  try         // Attempt to execute the command
                  {
                      command.Execute.Invoke(args);
                      return true;
                  }
                  catch (Exception e)     // Error executing command
                  {
                      Print($"Error executing command '{commandName}': {e.Message}.");
                      return false;
                  }
              }
              else    // Command keyword not recognized
              {
                  Print($"Unknown command - {commandName}.");
              }

              return false;
          }

          ...
      }
      ```

      With this setup, commands can be registered or unregistered from any script. Scripts can opt in/out of depending on the registry dynamically (e.g., register on enable, unregister on disable). Below is the typical format for registering a new command:

      ```csharp label="Registering a command"
      CommandRegistry.RegisterCommand(new ConsoleCommand(
          "category.command",                    // Command Name
          "A command that does something.",      // Command Description for 'help' command
          args =>                                // Command delegate function
          {
              // Not needed if command takes no arguments
              if (args.Length < 2)
              {
                  Print("No argument given, please enter true or false.");
                  return;
              }

              // Extract arguments
              string arg0 = args[0];
              string arg1 = args[1];

              // Execute command with input
              ...
          }));
      ```

reflection:
  image: "/assets/images/labyrinth-images/orbit_loop.mp4"
  qa:
    - question: Backstory
      answer: |
        I began building this algorithm back in 2023 for a club at my university. I was tasked with procedurally generating a 3D dungeon for an FPS we were making. It goes without saying that, between coursework and other obligations, a single semester wasn't enough time to finish a game of that scale. The game itself never came together, but it was enough to hook me on procedural generation. I picked the algorithm back up and kept developing it in 2024.

        The procedural generation was simple at first, relying on a well known algorithm called The Drunkard's Walk that spawns rooms in random directions from the previous one. I later added Delaunay triangulation, A*, and Prim's algorithm to the pipeline.

    - question: What sets this algorithm apart from others?
      answer: |
        Most of the algorithms the Labyrinth uses today are well known in the proc-gen community, but there's one feature I can genuinely call my own. Back in the club days, I had little knowledge of how procedural generation actually worked, so in a way, I had to get creative. Combining tools that I've learned over the years and from school, I came up with a feature I call "Blueprints" which are individual, single-celled components on a grid that combine to form an entire map. Using this blueprint method I then perform recursive descent parsing to generate rooms based on the patterns they create.

    - question: What's the ultimate goal for the project?
      answer: |
        I've always admired how games like *The Binding of Isaac*, *Enter the Gungeon*, and *Wizard of Legend* generate their maps, but I equally admired the intricate, deliberate level design of games like *Zelda* and *Dark Souls*. Was there a way to randomize dungeon layouts while still producing levels that felt hand-crafted and made sense? Is it possible to link these levels together seamlessly so that different themed areas didn't need to be loaded in a different scene? That's the problem I set out to solve.
---
