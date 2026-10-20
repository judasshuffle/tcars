# Install and run

Use a current [DarkRide viewer](https://github.com/caitlynmeeks/darkride-interface) with
`Entities.setVehicleControls` and `Entities.clearVehicleControls`. The
[Windows build reference](https://github.com/Madders/darkride-interface/blob/main/BUILD_WINDOWS.md)
describes the viewer toolchain; **TCARS itself needs no C++ build**. A legacy TCARS/High Fidelity
viewer without the Jolt API is not supported. The HUD reports this explicitly.

Keep `launch-tcars.js`, `darkride/`, `assets/`, `trackzones/`, `car-button.svg` and the three
catalogue modules (`modules/vehicles.js`, `modules/tracks.js`, `modules/constants.js`) together.
Load **only `launch-tcars.js`** through Running Scripts. Do not load `tcar.js`, `tcarTest.js`,
the old lobby/session scripts or `darkride/session.js` alongside it.

The entire checked-out folder is directly runnable. `python tools/package.py` creates a
portable ZIP in `dist/` containing just the runtime, assets and documentation, without old
movement scripts, editor files or Git metadata. Extract the ZIP and select its launcher.

If local-file HTML is blocked by your viewer configuration, run:

```powershell
cd C:\Users\DanGr\tcars-darkride
python -m http.server 8765 --bind 127.0.0.1
```

Leave that terminal running, then load `http://127.0.0.1:8765/launch-tcars.js` in DarkRide.
This serves only on your machine. Stop the server with Ctrl+C after quitting TCARS.
It is also available as `tools/serve.ps1`. Do not change browser security settings.

## Use

Build a track before spawning to use its saved start point. The current track remains until
a replacement finishes building; **Cancel build** rolls back the replacement. Building while
seated is blocked. Spawning a replacement car releases your old seat safely.

The track importer rotates around the saved start heading and moves that start in front of
the avatar. Rotation is yaw-only, so original slope angles and gravity orientation survive.
No original dimensions are rescaled. The old giant spectator-avatar scaling is not applied.
Models may need time to load. Spawn checks for a collidable track surface near the start and
asks you to wait if it cannot find one. The precise collision fit still needs a live test.

**Recover upright** lifts and levels the car at its current position; **Return to start**
uses its saved spawn. Both clear velocity and native controls and reset lap timing.
The camera switches between chase and hood. Desktop keyboard controls are implemented;
VR gamepad/hand controls have not been implemented or tested. The tablet is the supported
in-world panel; the small speed overlay is a desktop supplement.

Closing the panel keeps the session. Stopping the script restores camera/avatar settings
and deletes only IDs that this session created and whose ownership marker still matches.
There are no radius-based world deletion sweeps. Entities use renewable two-hour lifetimes
so a crash does not leave them indefinitely. Leaving a domain releases local session state;
entities left on an unreachable old domain expire through that lifetime.

## Diagnostics

| Symptom | Action |
|---|---|
| Missing native vehicle API | Install/run the current Jolt DarkRide build. No legacy physics fallback is used. |
| Rez permission denied | Use your own domain or obtain permanent/temporary rez permission. |
| Track says unavailable | The manifest lacks a required asset. Practice circuit remains available. Run `python tools/cache-assets.py` to retry retrieval. |
| Track surface not ready | Wait for geometry to load and retry Spawn. Inspect Script Log and Diagnostics. If persistent, use Practice and report the track; do not assume a render mesh proves collision readiness. |
| White/missing textures | Geometry may be present but old texture dependencies may be missing. See the asset limitations. |
| Original body does not render | Try the offline Roadster; verify `assets/cache` is present and its manifest paths resolve. |
| No sound | Toggle Sound on, check viewer audio. Cached loops load asynchronously; sound is local to the driver. |
| Car will not move while panel is open | Close the panel; it intentionally applies brakes while open. Click the world to restore keyboard focus. |
| Car falls or clips on an original track | Return to start/exit; test Practice to isolate API versus imported collision issues. Record track, car and diagnostics for live tuning. |

Diagnostics shows native API availability, owned entity count and `Entities.getVehicleStats`
when supported. `[TCARS]` messages also appear in the viewer Script Log.

## Multiple users

TCARS creates domain entities, so the viewer's native vehicle replication handles peers.
Each launcher controls only its own car, track, driver seat and timer. The old assignment-client
lobby, voting, shared countdown, shared lap scoreboard and passenger seating are not restored.
No multiplayer race result is claimed to be authoritative or verified.

For a self-contained shared asset deployment, host the **entire runtime folder** at one
shared HTTP(S) location reachable by clients **and the domain physics server**, and have
launchers use that URL. Local-file/localhost launches use the original verified HTTPS geometry
URLs instead: sending a client-local mesh path to a remote physics server would break collision.
Local driver sound uses the package cache. Hosting/publication is not performed by this rebuild. The offline primitive
car and practice track avoid model URL dependencies. Avoid building overlapping copies.
