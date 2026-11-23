---
title: "ParseGen: Generating Rooms Like A Compiler"
date: 2026-11-12              # YYYY-MM-DD — newest posts appear first
summary: >-
  The Labyrinth Algorithm builds its levels out of hand-made room prefabs, but it doesn’t place them directly. It works in two passes. The first pass generates blueprints, marks in a grid space that define where rooms will go, without any real geometry. The second pass is **ParseGen**. An algorithm inspired by recursive descent, it fits room shapes onto those blueprints, the same way a parser reads a stream of characters and decides which tokens they form. Each time a shape fits, a prefab with that footprint is spawned on top, those blueprints are no longer parsable and a new set is chosen.
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
**"Blueprints"** are `1x1x1` unit grid cells that mark out space inside a zone. They’re created from **Blueprint Operations**, which is where most of the planning happens. When those operations finish, the zone is laid out as a network of connected corridors. No blueprint is disconnected from the overall conglomerate and each of them is connected by a unique flag that records which sides open into a neighbouring blueprint.
:::

:::text-code
### Generation in 4 stages

The table shows the four stages that go into generating a full map. Most of the work happens in blueprinting, which fills the map area with blueprints. It’s driven by **Blueprint Operations**: small, self-contained steps that sit in a queue and run one after another, a bit like instructions in a tiny virtual machine (See main [project page](http://localhost:4321/projects/labyrinth-project/)). Some operations are in charge of generating the layout, like Drunkard Walk, Delaunay Triangulation, and A* pathfinding. Others handle set operations such as union, intersection and difference. Branch and Jump let the queue loop and make decisions.

A second pass parses every available blueprint using a process I call **ParseGen**. For each group of blueprints, it works out which room shapes fit that arrangement and in which rotation. The parser is based on recursive descent parsing, a top-down technique commonly used in compilers.

:::table {label="Stages" caption="The four stages of map generation. ParseGen runs last."}
| Stage  | Module | Function |
| :------ | :----- | :----- |
| Initialize | None | Seed the RNG and position each zone's bounds in the world.|
| Load Operations | Blueprinting | Build the generation algorithm as a queue of operation nodes. Nothing runs yet. |
| Execute Operations | Blueprinting | Drain the queue. Walks, triangulation, MST and pathfinding fill the blueprint grid. |
| Parse and Generate Rooms | ParseGen | Fit room shapes onto the blueprints and spawns the prefabs. |
:::
:::

:::media-text {src="/assets/images/labyrinth-images/shapedata.png" side="right" alt="Describe the media"}

## Shapes Are The Grammar
The footprints for rooms are called **Room Shapes**. A shape is the set of connected cells a room takes up, along with rules about which neighbouring cells must or must not hold a blueprint. The parser checks each group of blueprints against every shape the path allows, and any shape that fits the arrangement exactly becomes a candidate. One candidate is then picked using the weights set on the path, and a room is spawned from that shape’s list of room prefabs. It works a lot like a toddler’s shape-sorter toy: the blueprints are the holes, and the parser’s job is to find the pieces that drop in cleanly.

### Shape Cell States
Each shape is made of `cells`. Every cell sits at an offset from the shape’s origin and has a state that sets a rule for that position. The room’s own cells must land on blueprints, and the cells around it can require a blueprint, forbid one, or allow anything. Every shape needs at least one Blueprint cell, or it has nothing to place. Each path should also include a `1×1×1` shape. It fits any blueprint, so it acts as the base case that guarantees the parser can always finish.
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

:::media-text {src="/assets/images/labyrinth-images/parsegen-animation.mp4" side="left" alt="Describe the media"}
### An Analogy
Before the parser starts walking, it turns every shape into a pool of candidates, one for each way the shape could cover the starting blueprint. That means one candidate for every cell that could sit on that blueprint, and one for every allowed rotation. Think of it as a hiring process. Each blueprint the parser visits is another interview round, and every remaining candidate has to meet the requirements set by its shape’s cells and the blueprints around it. Candidates who fail are cut. A candidate who has covered every one of its room cells has passed every round and makes the shortlist. When the interviews are done, there’s usually more than one candidate on the shortlist. The parser picks one shape using the weights set on the path, then picks a candidate of that shape at random. It’s a little unfair, but so is real hiring. If a branch of the walk runs out of candidates, that branch simply ends. This is the recursion’s base case, and anyone already on the shortlist stays there. That’s why the 1×1×1 shape matters: it passes the first round on any blueprint, so the shortlist is never empty.
:::

For one base blueprint, ParseGen first builds a candidate for every combination of shape, anchor and rotation. A 2×2 big room that can't rotate gives four candidates, one per cell. A hall that can rotate gives eight.

Why are there so many candidates for one shape? A simple 1x2 shape can have over 8 different candidates because of the number of possible anchors and rotations it has. Take $a$ to be the number of anchors a room can have, an anchor is a `Blueprint` shape cell that can act as the origin point for the room to possibly spawn on. The anchor is the shape cell that sits on the base blueprint. Take $r$ to be each possible rotation an anchor can have. When fitting a shape to a pattern we don't want to limit it's orientation to just one rotation, a room can have **4 possible rotations** (each along a cardinal axis). So our ending amount of candidates is:
:::callout
$$
\text{shape candidates} = a \times r
$$
where $a$ is the number of anchors and $r$ is the number of rotations.
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
The parser never rotates a shape. Each candidate carries a rotation, and the parser moves the world into the shape's frame instead. For a blueprint at $p$, parsing from base $b$:

:::callout
$$
\text{cell} = \text{anchor} + R^{-1}\,(p - b)
$$
:::

Neighbour checks go the other way. A shape cell's right side faces $R \cdot \text{right}$ in the world, so CheckConfigs compares the shape's six sides against the blueprint's six rotated sides. When a candidate wins, the room's origin is

:::callout
$$
\text{origin} = b - R \cdot \text{anchor}
$$
:::

and the prefab spawns there with the same rotation. All of this is integer matrix math in 90° steps, so there are no floats and nothing to round.

## Choosing a Winner
One base blueprint usually ends up with several accepted candidates. Picking one of them uniformly would be biased in a quiet way: shapes that rotate, or that have more cells, produce more candidates, so they'd win more often for reasons that have nothing to do with design.

ParseGen buckets the accepted candidates by shape first. It picks a shape using the weights on the path, picks a candidate from that shape's bucket uniformly, and finally picks one of the room prefabs that use that shape. The weight a designer sets is the weight they get.

A 1×1 shape fits any blueprint, so a path that includes one can always be fully parsed. Without one, the parser can get stuck on an awkward blueprint. When that happens the room generator stops and reports exactly which blueprint and which path it failed on, instead of leaving a hole in the map.

## What's next?

- **Undo for operations:** The operation interface has a slot for it already. With undo, the stepper could also step backwards.
- **Node Graph Editor:** Operations already talk through ports and memory IDs, so the queue that's built in code today could be wired up visually.
- **Smarter Zone Placement:** Zones are placed fairly simply right now. Voronoi diagrams or BSP would give more interesting overall shapes.
- **Pruning** - There's a stub for retiring a whole shape once one of its candidates is accepted. It would save work, but it also changes which placements are found, so it needs measuring before it goes in.