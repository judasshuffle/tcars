# TCARS DarkRide checkpoint

## Location and preservation

- Working tree: `C:\Users\DanGr\tcars-darkride`
- Branch: `experimental/tcars-darkride`
- Original worktree: `C:\Projects\tcars`, branch `github-import`, left intact with all pre-existing changes/untracked files.
- Baseline: `95eb77a`. First implementation commit: `75c94a4`.
- Read this file at the latest branch commit (`git log -1 --oneline`) for the complete checkpoint.
  No push/merge and no write to Thoys' GitLab; viewer source unchanged.

## Finished

- Single `launch-tcars.js` entry point; native tablet HUD and desktop speed overlay.
- Native Jolt chassis/wheels/input; no old movement controller dependency.
- Offline car/circuit, original vehicle selection and five original track imports.
- 122/125 assets cached with provenance/hash manifest, including engine loops.
- Avatar-relative placement; original layout/scale and world-up/slope preservation.
- HUD enter/exit, native driver ownership, chase/hood camera, speed, local sound, focus braking.
- Recover, return to start, timer reset, own-ID-only removal and finite crash lifetimes.
- Cancellable batched track build, rollback/preflight, temporary rez support, missing start-surface diagnostics.
- Server-reachable geometry URL selection: verified HTTPS on local launches; cache on shared web deployments.
- Practice checkpoints/laps/timing; honest free-drive mode for original exports without checkpoints.
- Blockly removed from this branch; original history/authorship retained.
- Installation/API/asset limitations/live testing documentation and reproducible example/package tools.

## Verification and remaining work

Checkpoint verification: **18/18 automated tests passed**; JS syntax and all **122 cached
asset hashes passed**; `git diff --check` passed. Tests exercise real runtime modules with
mocked APIs, not actual Jolt. The portable ZIP is generated under `dist/tcars-darkride.zip`
and its CRCs are checked. See `docs/DARKRIDE-TESTING.md` for the precise boundaries.

**Next recommended task: run the live acceptance checklist in DarkRide, starting with the offline
Roadster and Practice circuit.** No active DarkRide process or controllable native/browser
surface was available during this session, so driving/rendering/Qt focus remain unverified.

Then validate all original tracks, especially Classroom's substitute static-mesh collision,
car wheel/body alignment, start placement and asset loading. Missing external textures remain
in Space/pallet/shopfront models. Tune per-car chassis/seats only from observed results.
Native domain replication is used, but shared lobby/voting/countdowns/scoreboard/passengers
and gamepad/VR hand controls are not implemented. Multiplayer has not been live tested.

## Exact resume steps

```powershell
cd C:\Users\DanGr\tcars-darkride
git status --short
git branch --show-current
git log -3 --oneline
npm test
npm run check
```

Do not reset, stash or alter the original dirty checkout. Continue only on the experimental
worktree. Load `C:\Users\DanGr\tcars-darkride\launch-tcars.js` in DarkRide Running Scripts;
choose Practice → Build → Roadster → Spawn → Enter. Follow `docs/DARKRIDE-TESTING.md` and
record the actual viewer build and results. If local-file web UI is blocked, use
`python -m http.server 8765 --bind 127.0.0.1` and load the localhost launcher URL.

To regenerate configuration examples: `node tools/export-examples.js`.
To regenerate the portable package: `python tools/package.py`.
To retry the three unavailable source assets: `python tools/cache-assets.py` (network required).

## Usage checkpoint rule

The user requests a safe stop around 10% remaining usage. The agent cannot directly monitor
the account percentage; the last user-reported reading was 39%. Do not start a large new
operation near the limit. Finish the current operation, quick-check, commit completed work,
update this file, and report `git rev-parse HEAD` plus the next task. Prioritise a clean,
recoverable branch over another feature.
