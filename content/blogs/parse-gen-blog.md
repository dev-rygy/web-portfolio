---
title: "ParseGen: Generating Rooms Like A Compiler"
date: 2026-11-12              # YYYY-MM-DD — newest posts appear first
summary: >-
  The Labyrinth uses a variation of recursive descent parsing to generate premade rooms on top of
  "Blueprints", unit grid cells that generate on a preceding pass. It takes a premade layout and 
  fits prefabed rooms onto it, the same way a parser reads a stream of 
  characters and decides which tokens they form. 
thumbnail: "/assets/images/labyrinth-images/parser_showcase.mp4"                 # image or short silent .mp4 loop — blank = placeholder
poster: ""
video: "/assets/images/labyrinth-images/parser_showcase.mp4"                     # optional media for the top of the post (.mp4 or YouTube URL); blank = thumbnail
links:
  github: "https://github.com/dev-rygy/labyrinth-algorithm/blob/main/Assets/Scripts/Procedural%20Generation/RoomGenerator.cs"
# metrics:                    # optional — replaces the default Genre / Date / Links pane
#   - title: Engine
#     items: [Unity 6]
---

## Blueprint Pass, "The Tokens"

:::media-text {src="/assets/images/labyrinth-images/labyrinth_slide_3.png" side="left" alt="Describe the media"}
**"Blueprints"** are one-by-one unit grid cells that take up space within a Zone. The primary process for creating these is handled by **Blueprint Operations**. This is when
most of the planning takes place and where most of the algorithmic complexity resides. By the end of this process the map is covered in contiguous corredors. No blueprint is 
disconnected from the overall conglomerate and each of them is connected by a unique flag that determins at what point it will connect with another.
:::

:::text-code
### Generation runs in 4 stages

This table displays the four stages that go into generating a full map. Blueprinting is the process of generating blueprints all over the map area. This is done using Blueprint Operations,
unique units of execution that handle connecting rooms together sequentially like a tiny virtual machine. Many operations exist for this purpose: Delaunay Triangulation, A*, Drunkard Walk, Set Operations (Union,
Intersection, Difference), Branch, and Jump. This is where most of the complexity lies and where most of the decision making takes place.

A second pass of the algorithm parses all available blueprints using a process I call ParseGen. The parsing determines what rooms can be generated from an orientation and pattern of blueprints. The parsing system is based on a top-down recursive technique commonly used in compilers called **Recursive Descent Parsing**.

:::table {label="Stages" caption="The four stages of map generation. ParseGen runs last."}
| Stage  | Module | Function |
| :------ | :----- | :----- |
| Initialize | None | Seed the RNG and position each zone's bounds in the world.|
| Load Operations | Blueprinting | Build the generation algorithm as a queue of operation nodes. Nothing runs yet. |
| Execute Operations | Blueprinting | Drain the queue. Walks, triangulation, MST and pathfinding fill the blueprint grid. |
| Parse and Generate Rooms | ParseGen | Fit room shapes onto the blueprints and spawns the prefabs. |
:::
:::


## Shapes Are The Grammar

The footprints for rooms are called **Room Shapes**. Each shape is a set of connected cells or space that a room must take in order to spawn correctly. Generated blueprint cells are checked against each possible shape, the shapes that fit the blueprint structure perfectly are chosen to be generated. By generate I mean spawning the rooms that the shapes represent, each shape having a respective list of rooms. You can think of this method as similar to the old "Fitting Shapes In Their Correct Holes" game that toddlers play.

:::media-text {src="/assets/images/labyrinth-images/shapedata.png" side="right" alt="Describe the media"}
### Shape Cell States
Each shape has a list of `Cells`. These cells determine the rules that the surrounding blueprints must follow in order for a possible spawn to take place. Every shape must have at least one `Blueprint` cell and there must be at least one 1x1x1 shape to function as the base case.
:::

:::table {label="Shape Cell States" caption="These are the four states a shape cell can be in."}
| State  | Description |
| :------ | :----- |
| Blueprint  | There must be a blueprint in that cell in order to spawn. The room will take up this blueprint cell. |
| Need Blueprint | There must be a blueprint in that cell in order to spawn. Although, the room will not occupy that blueprint cell. |
| No Blueprint | Outside the room, and nothing can be here (no blueprint). Keeps a dead end from landing in the middle of a corridor. |
| Don't Care | Anything goes. Any offset missing from the dictionary is treated as this. |
:::

```csharp label="Room Shapes as data modules"
[CreateAssetMenu(fileName = "ShapeData", menuName = "Scriptable Objects/Procedural Generation/Shape Data", order = 3)]
public class ShapeData : ScriptableObject
{
    [SerializeField] private Dictionary<Vector3Int, CellState> _cells;
    public Dictionary<Vector3Int, CellState> Cells => _cells;
    [SerializeField] private bool _canRotate = true;
    public bool CanRotate => _canRotate;
    public int CellCount
    // Only count cells marked as 'Blueprint'
    {
        get
        {
            int count = 0;
            foreach (var cell in _cells)
            {
                if (cell.Value == CellState.Blueprint)
                    count++;
            }
            return count;
        }
    }
}
```

A shape also says whether it may rotate. Room prefabs point at a shape, so many prefabs can share one footprint, and each path lists the shapes it's allowed to use along with a weight for each.

## The Descent

:::media-text {src="/assets/images/labyrinth-images/parsing_analogy.png" side="left" alt="Describe the media"}
### An Analogy
Each shape becomes a group of valid candidates for a section of the blueprint map. Think of candidates in a job application process. In order for a candidate to proceed to the next hiring round they must meet the requirements determined by the shape cells and the surrounding blueprint pattern. In the final round there may be more than one candidate that fits the role perfectly. From here a winning candidate is choosen at random, a bit unfair but many things in life are. There may be some instances where a perfect candidate is not found, this is our base case, we must then fall back on the candidates from the previous round and reevaluate.
:::


For one base blueprint, ParseGen first builds a candidate for every combination of shape, anchor and rotation. A 2×2 big room that can't rotate gives four candidates, one per cell. A hall that can rotate gives eight.

Why are there so many candidates for one shape? A simple 1x2 shape can have over 8 different candidates because of the number of possible anchors and rotations it has. Take **a** to be the number of anchors a room can have, an anchor is a `Blueprint` shape cell that can act as the origin point for the room to possibly spawn on. The anchor is the shape cell that sits on the base blueprint. Take **r** to be each possible rotation an anchor can have. When fitting a shape to a pattern we don't want to limit it's orientation to just one rotation, a room can have 4 possible rotations (each along a cardinal axis). So our ending amount of candidates is:
:::callout
**Shape Candidates** = a * r where 'a' is the anchor and 'r' is the rotations
:::
Then it walks. At each blueprint it visits, every surviving candidate gets asked two things: which of your cells lands on this blueprint, and do that cell's neighbour rules match the real neighbours? Candidates that fail are dropped from this branch. Candidates that pass record the cell as covered, and once a candidate has covered every one of its room cells, it's accepted. The parser then steps into each available neighbour it hasn't already visited on this branch, handing along only the survivors.

```csharp label="Blueprint Parser"
public void ParseBlueprints(Blueprint current, List<ShapeCandidate> candidates, HashSet<Blueprint> visited)
{
    // Only unclaimed blueprints can be parsed, and an empty list ends the branch
    if (!current.Available || candidates.Count <= 0)
        return;

    var next = new List<ShapeCandidate>(candidates);
    var seen = new HashSet<Blueprint>(visited);
    Vector3Int local = current.Position - _baseBlueprint.Position;

    foreach (var candidate in candidates)
    {
        // Determine which cell of this shape would land on the current blueprint.
        Vector3Int cell = candidate.Anchor + candidate.Rotation.ToInverseMatrix() * local;

        if (CheckConfigs(cell, candidate.Shape, current, candidate.Rotation))
        {
            candidate.CellCovered(cell);
            if (candidate.CheckFilled() && !candidate.IsFilled)
            {
                candidate.MarkFilled();
                _acceptedShapes.Add(candidate);
            }
            if (candidate.IsFilled)
                next.Remove(candidate);
        }
        else
            next.Remove(candidate);
    }
    seen.Add(current);

    // Descend into every available neighbour not yet visited on this branch
    foreach (var dir in k_directions)
        if (ParserPeek(current, dir, out Blueprint neighbour) && !seen.Contains(neighbour))
            ParseBlueprints(neighbour, next, seen);
}
```

The recursion stops on its own. A candidate can only survive while the walk stays inside its footprint, so the depth is capped by the largest shape, and any branch that runs out of survivors returns immediately. In practice each base blueprint costs a few dozen checks.

The walk uses all six directions, up and down included, which is how the same code places the extra-tall rooms. The demo is a 2D slice of the same idea.

## Rotation Without Rotating Anything
The parser never rotates a shape. Each candidate carries a rotation, and the parser moves the world into the shape's frame instead. For a blueprint at `p`, parsing from base `b`:

:::callout
**Cell** = anchor + R^(−1) · (p − b)
:::

Neighbour checks go the other way. A shape cell's right side faces R · right in the world, so CheckConfigs compares the shape's six sides against the blueprint's six rotated sides. When a candidate wins, the room's origin is

:::callout
**Origin** = b − R · anchor
:::

and the prefab spawns there with the same rotation. All of this is integer matrix math in 90° steps, so there are no floats and nothing to round.