# Experimental FBX to DarkRide terrain

**Status: diagnostic prototype, not a verified collision replacement.** No domain has been changed. The included DRKT is a volumetric, double-sided shell of the source triangles; it preserves multiple levels better than a heightfield but adds thickness and includes non-road geometry. It is **not safe to regard this as a matching driving surface**. Server loading, visual orientation, alignment and vehicle collision remain untested in DarkRide. Do not use it on the live domain.

## Findings

The source is FBX 7400, SHA-256 `cd886fa8a3cf47201c4fa72fa20db678d7416a7561926478e3a9cc1f70143e41`. FBX global settings report Y up (axis 1), Z front (axis 2), X coordinate axis and `UnitScaleFactor=1`; FBX expresses that factor relative to centimetres. Blender 4.5's standard FBX importer produces one mesh, `Plane`, with 3,023 vertices and 5,981 triangles. After excluding 552 zero-area triangles, 5,429 remain. The imported, transformed Y-up bounds are:

| Axis | Minimum | Maximum | Extent |
|---|---:|---:|---:|
| X | -124.570351 | 124.560738 | 249.131088 |
| Y | -34.787041 | 9.289818 | 44.076859 |
| Z | -90.557076 | 90.362930 | 180.920006 |

These are Blender-import coordinates, before fitting to the inspector dimensions; they are not world positions. Blender's Z-up world is mapped back to Y-up as `(x, z, -y)`. The importer has applied FBX transforms and its unit handling. DarkRide's importer may interpret FBX axes differently; an asymmetric landmark in the actual viewer must confirm handedness and front/back. The numbers in the inspector, not a second multiplication by 0.882, determine the final extents.

Welded nondegenerate geometry has four substantial connected components of 4,782, 389, 256 and 2 triangles. The largest contains the bounding box's bottom and sides. One separate two-triangle plane spans approximately 130 × 87 m. At 1 m sampling in the interior footprint, 45,069 columns had at least two distinct intersections and 12,310 had at least three (0.25 m separation threshold). The lowest surface is consistently near imported Y=-34.787, and other levels overlap above it. Thus choosing a single height at each X/Z would erase surfaces. A central section shows walls and cavities; whether these are usable tunnels, roads, hidden construction surfaces or redundant geometry requires visual inspection. The analysis does not establish which surfaces are drivable. The current tool deliberately exposes all nondegenerate surfaces in the diagnostic shell; it does **not** claim to have identified the driving surface, and can create unwanted collision floors, walls and ceilings.

## Placement for the supplied model

These settings describe the generated file only, and are conditional on verifying the FBX importer orientation and the inspector values. The model should remain unchanged. For a separate **test domain**, create a Terrain entity with:

| Property | Value |
|---|---|
| Position | `10138.637, 10000.222, 10070.400` m |
| Dimensions | `258, 47, 189` m |
| Voxel size | `1.0` m |
| Registration point | `0.5, 0.5, 0.5` |
| Rotation | `0, 0, 0` degrees |
| Terrain file | `landscape-preview-1m.drkt`, hosted at a URL reachable by both test clients and the test physics server |
| Collisionless | `false` |

The 258 × 47 × 189 grid corresponds to exactly 2,291,814 stored grid points. Padding is `ceil(model dimension / voxel) + 8` voxels per axis, centred on the original model, so the pad is at least 4 m per side. The terrain box bounds are X `10009.637–10267.637`, Y `9976.722–10023.722`, Z `9975.900–10164.900`. The fitted model bounds are X `10014.0765–10263.1975`, Y `9980.782–10019.662`, Z `9979.940–10160.860`. Voxel (0,0,0) sits at the terrain box's low corner; samples are integer grid points, not voxel centres.

The transform used is `local = (imported - (min + max)/2) * final_dimensions/(max-min)`, followed by the entity's position. In the present case this applies a Y factor of approximately 0.882 once. DarkRide's [model renderer](https://github.com/caitlynmeeks/darkride-interface/blob/main/libraries/entities-renderer/src/RenderableModelEntityItem.cpp) scales a loaded model to its **scaled dimensions** and snaps to registration. The [server terrain implementation](https://github.com/caitlynmeeks/darkride-interface/blob/main/assignment-client/src/physics/ServerTerrainEntityItem.cpp) maps voxel zero to the low corner and rejects file counts that differ from the entity's rounded dimensions/voxel size. The exact interpretation of the in-world inspector values and model orientation must still be verified with known landmarks.

The orange curves in [preview.png](preview.png) are interpolated **field zero contours**, not DarkRide's actual Surface Nets mesh. Black is the original FBX section at local Z=-0.5 m. The shell has radius 0.8 voxels (1.6 m total thickness at 1 m), so the outer face is displaced and narrow gaps can close. Meshing and voxel interpolation add further error. Consequently a car could float well above the visual road, hit unwanted surfaces, or encounter missing thin features. This file is for measuring the problem, not a collision-ready result.

## Visibility

The examined DarkRide source indicates a possible configuration: set Terrain `visible` to `false` and `collisionless` to `false`. The [terrain renderer](https://github.com/caitlynmeeks/darkride-interface/blob/main/libraries/entities-renderer/src/RenderableTerrainEntityItem.cpp) flags invisible render items, while [server terrain physics](https://github.com/caitlynmeeks/darkride-interface/blob/main/assignment-client/src/physics/ServerTerrainEntityItem.cpp) decides physicality from dead/local/collisionless state, not visibility. This is a **source-code inference**, not a verified runtime result: versions, loading and physics behavior must be tested in an isolated domain before relying on it. If terrain remains visible, both surfaces may overlap or z-fight; with this shell they can also be visibly separated by about 0.8 m, not just z-fight. Opacity or transparent materials have not been verified as collision-preserving alternatives.

## Reproduce on Windows

Requires Blender 4.5 and Python 3 with NumPy; Matplotlib is only needed for a new preview. Blender uses its bundled NumPy. The source is not committed. In PowerShell, from this directory:

```powershell
Invoke-WebRequest 'https://raw.githubusercontent.com/judasshuffle/ass/e010a42db7cd70cedf0f6ae1b2c822f718180a4a/photiz/testingaoland.fbx' -OutFile source.fbx
python convert.py source.fbx new-preview.drkt --blender 'C:\Program Files\Blender Foundation\Blender 4.5\blender.exe'
python validate.py new-preview.drkt --dimensions 258 47 189 --voxel 1
python -m unittest -v test_converter
python preview.py mesh.npz new-preview.drkt new-preview.png
```

The converter checks the source hash, refuses to overwrite an output, and caps the default grid at five million samples. `--voxel` changes resolution; `--padding`, `--shell-radius` and `--max-voxels` are explicit options. Smaller voxels increase work approximately cubically and require recomputing the printed dimensions. For another FBX, supply a separate `--config` containing its hash, final displayed dimensions and centre; the prototype rejects nonzero rotations and non-centred registration rather than silently misaligning them. The `mesh.npz` and metadata in this folder are the source-derived diagnostic snapshot, used by tests and the preview; for a different FBX first run `inspect_fbx.py` under Blender and point `preview.py` at its resulting NPZ. The converter itself freshly imports the input on every run.

DRKT v1 follows [Caitlyn's generator](https://github.com/caitlynmeeks/darkride-interface/blob/main/tests-manual/physics-baseline/make-terrain.py) and [TerrainFile.h](https://github.com/caitlynmeeks/darkride-interface/blob/main/libraries/terrain/src/terrain/TerrainFile.h): 32³ chunks; x-fastest signed int8 distances at 32 units per voxel, clamped to ±127; material 0; uniform or zlib-compressed dense chunks. Unlike a closed-solid inside/outside test, the negative region is the union of a fixed-radius band around every triangle. This works on the source's open/nonmanifold mesh but introduces two faces per surface and does not infer solid interiors. It is not a clean signed distance to a repaired solid.

The generated file is 174,842 bytes. A repeat on this machine took about 6 seconds total, including about 3 seconds voxelization, and reproduced SHA-256 `e30ab71db9898b5ed69b2e03684bf4ddc74de3f6aed95a189b4f1d541753ff6d`. The int8 grid itself occupies about 2.19 MiB; Blender, the BVH, temporary geometry, zlib and Python add overhead. Peak process memory was not measured. Tests independently parse all chunks, check counts, corruption and representative source samples; they do not run DarkRide's loader or physics.

Before any vehicle experiment, inspect the mesh components and identify actual drivable surfaces, develop a representation without the shell's upward offset and unwanted planes, compare multiple landmark elevations and asymmetric features in a test viewer, and verify loading, visibility and collision on a disposable test domain with TCARS V5. Crompton Moor remains untouched.
