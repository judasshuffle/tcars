# ROBOTDOLLY TCARS for DarkRide

Launch **`launch-tcars.js`**. This is the single entry point for the rebuilt system on
`experimental/tcars-darkride`. It uses DarkRide's native Jolt vehicles; Blockly is removed.

## First drive

1. Open a current **Jolt-enabled DarkRide** viewer and connect to a domain where you can rez.
2. Stop any old TCARS scripts in **Running Scripts**. Run only one copy of this launcher.
3. In **Running Scripts → Load Script**, choose this checkout's `launch-tcars.js`.
   On this machine: `C:\Users\DanGr\tcars-darkride\launch-tcars.js`.
   If the dialog expects a URL, use `file:///C:/Users/DanGr/tcars-darkride/launch-tcars.js`.
4. The TCARS panel opens. Select **Practice circuit (offline)** and **Build in front of me**.
5. Choose **TCARS Roadster (offline)**, **Spawn car**, then **Enter & drive**.
6. Drive with **W/S** (accelerate / brake then reverse), **A/D** (steer), and **Space** (handbrake).
   **F** exits, **R** recovers upright, **T** returns to the start. Arrow keys also drive.
7. Reopen the **TCARS** tablet/toolbar button for track selection, camera, sound, reset and removal.
   **Close** hides the panel. **Quit & clean up** stops the launcher and removes its entities.

The practice track and primitive roadster need no external model downloads. The start is
12 metres ahead of the avatar; a car without a track spawns 6 metres ahead. Original tracks
retain their large layouts and scale and can extend around the avatar: choose a clear area.
Opening TCARS or taking focus away from DarkRide applies the brakes while seated.

## Original cars and tracks

The repository includes **122 recovered assets** (about 201 MiB): original car bodies,
track geometry, collision meshes and engine sounds. Source URLs and SHA-256 hashes are in
`assets/manifest.json`. All five original exports are selectable:

For a local-file/localhost launch, original geometry uses the verified source HTTPS URLs so
the domain's physics server can load the same meshes. A shared HTTP(S) deployment uses the
packaged cache instead. Original tracks therefore need network access unless that shared
cache is reachable on your local network. Driver sound uses the local cache.

| Track | Restoration |
|---|---|
| School Classroom | Original visual layout; unavailable standalone collision object omitted; recovered visual mesh provides static collision. Needs live collision validation. |
| School Classroom (new) | Geometry and collision assets recovered; two old lighting zones excluded. |
| Street Track | Geometry and collision assets recovered; two unavailable phone props and one flashlight omitted. |
| Toy Track | Geometry and collision assets recovered. |
| Space Track | Geometry and collision assets recovered; some original external textures unavailable. |

Original vehicle bodies use a new centred box chassis and four native suspension wheels.
The original bespoke collision/steering controller is never loaded. Jolt handles movement,
braking, reverse, suspension and wheel animation. This is a handling conversion, not a claim
that every original car's wheel alignment or handling has been tuned in the viewer.

The saved exports contain **no checkpoint sequences**. Original tracks are free-drive;
the new practice circuit has four ordered gates, lap count, current/last/best times.
Drive forward along the left lane, right across the far end, down the right lane and
back to the start. Cyan strips identify intermediate checkpoints. Reset invalidates the timer.

## Installation, checks and status

- [Installation and troubleshooting](docs/DARKRIDE-INSTALL.md)
- [Architecture, API evidence and limitations](docs/DARKRIDE-IMPLEMENTATION.md)
- [Live acceptance checklist](docs/DARKRIDE-TESTING.md)
- [Progress and exact resume steps](PROGRESS.md)

No npm packages, viewer compilation, assignment clients, Blockly or UI frameworks are needed.
Node 18+ is needed only for development tests: `npm test` and `npm run check`.
Python 3 is optional for asset refresh, localhost serving and packaging.

**Verification:** automated tests exercise the actual launcher and session logic against
mocked DarkRide APIs, all original transforms, cleanup, failure rollback and input behavior.
Asset hashes and JS syntax are checked. **In-world driving has not been verified** in this
environment; no active DarkRide process or controllable native viewer/browser was available.
Use the live checklist before describing this experimental branch as production-ready.

Original TCARS Git history and source authorship are preserved. Historical scripts remain
for reference but are not the launcher. The original dirty checkout at `C:\Projects\tcars`
was left intact; this work is in a separate Git worktree. Nothing has been pushed or merged.
