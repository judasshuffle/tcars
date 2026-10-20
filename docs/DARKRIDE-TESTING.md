# Verification and live acceptance

Checkpoint result (2026-10-20): **18/18 tests pass**, syntax valid, all 122 cached asset
hashes match, and `git diff --check` passes. No live driving result is claimed.

## Automated checks

```powershell
cd C:\Users\DanGr\tcars-darkride
npm test
npm run check
git diff --check
```

The tests run with Node's built-in test runner (no dependency installation). They cover all
five original export transforms, unchanged dimensions/upright world orientation, missing
geometry preflight, reverse/brake mapping, swept ordered gates, the offline examples, the
actual launcher boot/EventBridge action flow, domain signal cleanup, native-only driving
calls, seating/restoration, reset, spawn/build rollback, cancellation, stopping mid-build,
foreign entity protection, external deletion, driver changes, focus braking, missing start
surface and temporary rez/lifetime handling. Asset checks read and hash the downloaded files.

These are **mocked scripting-API tests**, not a Jolt simulation or graphical viewer test.
The harness does not prove suspension stability, rendered textures, collision readiness,
network authority/driver latency, actual Qt tablet focus or in-world car alignment.

## Required live test (not yet run)

Use a current Jolt viewer and a test domain with enough clear space. No DarkRide process was
running during implementation; no native application or browser control surface was available
in the tool inventory. The viewer was not launched or modified.

- [ ] Load `launch-tcars.js`; verify the panel opens and TCARS button reopens it.
- [ ] Build Practice; verify the start is ahead, road/island/barriers appear and build completes.
- [ ] Spawn offline Roadster; verify four native wheels settle on the road and chassis remains above it.
- [ ] Enter; verify seat/animation, chase camera, speed overlay and closed tablet. Hold W; verify actual motion.
- [ ] A/D and arrows steer; S brakes moving forward, then reverses after stopping; Space brakes.
- [ ] Reopen the panel/alt-tab while driving; verify brakes, then resume control on returning focus.
- [ ] Drive the circuit across all cyan gates; verify ordered checkpoint progression and a lap at the start stripe.
- [ ] Roll/tilt car if possible; Recover levels it; Return to start stops it and resets timing.
- [ ] F and HUD Exit restore avatar collisions, camera and movement; test exit from an overturned car.
- [ ] Test chase/hood, sound on/off, replacing car, timer reset, cancelling a track build.
- [ ] Build each original track; wait for geometry, Spawn/Enter, test the road near start and one circuit.
- [ ] Inspect Classroom substitute collision especially; check original body/wheel alignment, shadows and textures.
- [ ] Verify Toy/Street slopes keep their original orientation after avatar-relative placement.
- [ ] Delete the car externally; verify seat recovery and remaining owned-child cleanup.
- [ ] Quit, stop script and change domain; verify no stuck input/avatar state and no unrelated entities removed.
- [ ] On a shared asset URL, use two clients to verify native replication and independent ownership/cleanup.

Record viewer commit/build, domain physics mode, track/car, observed result and Script Log.
Use Diagnostics for vehicle statistics. Investigate a viewer API limitation only after the
offline native rig fails reproducibly; do not change viewer source to compensate for an
untested script assumption.
