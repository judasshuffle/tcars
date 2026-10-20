# Implementation and source evidence

## Source baselines inspected

- TCARS local starting commit: `95eb77a` on `github-import`, preserving the original imported history.
- Current upstream [DarkRide](https://github.com/caitlynmeeks/darkride-interface):
  `e08159ee6a5ea3366317a9d725dea75c7fe25fdd` (2026-10-20), freshly cloned for read-only API inspection.
- Local Windows reference, remote `https://github.com/Madders/darkride-interface.git`:
  `935d79a919d69eb1bd0808f04ca8dadb90639dcd` (2026-10-17), including `BUILD_WINDOWS.md`.
  This reference was not claimed to be the latest Windows remote commit.

No viewer source was changed. Inspected upstream files:

- `libraries/physics/src/VehicleSimulation.cpp`: dynamic chassis, native suspension/automatic
  gearbox, wheel visual binding, driver prediction/replication and explicit pose-edit recovery.
- `libraries/vehicles/src/WheeledVehicleSpec.{h,cpp}`: wheel centres, travel, steering fractions,
  drive type, mass, torque, ratios and seat JSON parsing.
- `libraries/vehicles/src/VehicleInput.{h,cpp}`: signed throttle and steering; brake/handBrake [0,1].
- `scripts/system/vehicles.js`: seating, drive-key disabling, native controls, reverse/brake
  threshold, chase camera and `goToLocation` exit behavior.
- `libraries/entities/src/EntityScriptingInterface.{h,cpp}`: vehicle control methods, rez
  checks, ray intersection, visual loading and statistics APIs.

## Runtime

`launch-tcars.js` loads the plain catalogue and original JSON exports, owns tablet signals and
dispatches actions. `darkride/session.js` owns spawned IDs, build transactions, seat/camera
state, native controls, audio and cleanup. `darkride/core.js` contains independently testable
transforms, sanitised import, control mapping and swept checkpoint detection.
`darkride/catalog.js` defines the offline examples and adapts the original car/track catalogue.
`darkride/hud.html` and `hud.js` are ordinary HTML/JS, connected through the tablet EventBridge.

The actual default example vehicle and track configuration are the exported `vehicle()` and
`practice()` definitions in `catalog.js`. `node tools/export-examples.js` writes their JSON forms
under `examples/`, useful for inspecting dimensions, wheels, physics settings and checkpoints.
Changing the shipped catalogue is a developer task; driving through the HUD needs no edits.

The chassis has `vehicle.type: "wheeled"`, JSON-encoded wheels and native engine/suspension
parameters. Children tagged `vehicle.type: "wheel"` with matching wheel names are animated
by Jolt. Runtime input goes only through `setVehicleControls`; velocity/pose is edited only
for explicit recovery. Controls are cleared on exit, errors, deletion and shutdown.

TCARS intentionally supplies `vehicle.seats: "[]"` and parents its avatar from the HUD. The
viewer system script therefore cannot simultaneously claim a native click-to-enter seat in
the same car. The launcher uses the upstream seating pattern, restores saved settings and
does not replace or stop the viewer's system script. Driver UUID is native; private ownership
markers identify which entities this launcher may delete. No world-wide deletion scans occur.

The old `modules/car.js`, camera/seating scripts and lobby/session managers were inspected.
Old constant values for movement are not applied. Original engine idle/driving loops are
cached and reused. Original model names/layouts and camera concepts survive; old synthetic
vehicle motion and giant spectator scaling do not. Original lobby/session protocols remain
historical code, outside the runtime dependency graph.

## Asset and track limitations

`assets/manifest.json` records 125 source resources: 122 downloaded, 3 unavailable as of
2026-10-20. Cached bytes retain their original content; `.gitattributes` prevents line-ending
conversion from invalidating mesh hashes. `tools/cache-assets.py` retries source downloads
over HTTPS, with size limits, timeouts, document-response rejection and SHA-256 recording.
Geometry URLs resolve to upstream HTTPS for file/loopback launches, or to packaged cache URLs
when the launcher root is a shared HTTP(S) URL. This keeps collision assets reachable on remote
physics servers. Local-only audio always uses the package cache. Offline means the primitive
example; it does not imply a remote domain can read the user's local FBX/OBJ files.

Unavailable resources and explicit handling:

- `https://dl.dropboxusercontent.com/u/96759331/fbx/collision_track.obj`: HTTP 404. It is one
  standalone model/collision entity in School Classroom (the URL appears in two properties).
  That entity is omitted. The recovered `test.fbx` visual model uses native `static-mesh`
  collision instead. This is a substitute collision strategy, **not recovered missing geometry**.
- `https://hifi-public.s3.amazonaws.com/ryan/ryan_phoneApt01.fbx`: HTTP 403; two decorative
  Street entities omitted.
- `https://hifi-public.s3.amazonaws.com/models/props/flashlight.fbx`: HTTP 403; one decorative
  Street entity omitted.

All other missing model/collision references fail preflight, preserving the existing track.
Archived scripts, parent IDs, raw userData, and global lighting zones are not imported. Static
model entities exported with `shapeType: none` use `static-mesh`; original explicit box/compound
collision modes remain. All imported geometry is static in this first release, including old
movable props. Entity transforms/dimensions are retained apart from the common relocation/yaw.

Read-only FBX inspection found 105 embedded Video texture payloads. Six Video texture entries
lacked embedded content: four in Space's `spacetrack.fbx`, one in `pallette.fbx`, and one in
`shopfrontthinfg.fbx`. Original paths refer to old desktop locations, sometimes only a `.fbm`
directory. These external textures were not recovered; rendering/color quality needs a live
check. Embedded textures and all model bytes are preserved, without re-exporting geometry.

None of the five trackzone exports has a checkpoint sequence. The four-gate practice circuit
is explicitly new primitive geometry, not a fabricated restoration. Original free-drive tracks
have no invented lap results. Timing is local and is reset by recovery; competitive validation,
shared race state, hand/gamepad input and per-car wheel/collision tuning remain future work.

Cached assets retain the original creators' rights and provenance. Original TCARS source
headers and Git authorship remain; new JavaScript uses the same Apache-2.0 terms. Source
downloads and commits were local only; no pushes, publishing, or merges were performed.
