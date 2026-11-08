"""Run in Blender: import FBX and export triangles in Y-up, metre coordinates."""
import bpy
import json
import os
import sys
import numpy as np
from io_scene_fbx import parse_fbx

args = sys.argv[sys.argv.index('--') + 1:]
source, output = args
root, version = parse_fbx.parse(os.path.abspath(source))
global_settings = {}
for node in root.elems:
    if node.id == b'GlobalSettings':
        for container in node.elems:
            if container.id == b'Properties70':
                for prop in container.elems:
                    if prop.id == b'P' and prop.props:
                        key = prop.props[0].decode('utf-8', 'replace')
                        if key in ('UpAxis','UpAxisSign','FrontAxis','FrontAxisSign','CoordAxis','CoordAxisSign','UnitScaleFactor','OriginalUnitScaleFactor'):
                            global_settings[key] = prop.props[-1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=os.path.abspath(source), use_anim=False)
depsgraph = bpy.context.evaluated_depsgraph_get()
triangles = []
info = []
for obj in bpy.context.scene.objects:
    if obj.type != 'MESH':
        continue
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    verts = np.array([tuple(obj.matrix_world @ v.co) for v in mesh.vertices], dtype=np.float64)
    # Blender world is Z-up; undo Blender's conventional -Z-forward/Y-up import basis.
    verts = verts[:, [0, 2, 1]] * np.array([1, 1, -1])
    faces = np.array([tuple(t.vertices) for t in mesh.loop_triangles], dtype=np.int32)
    if len(faces):
        triangles.append(verts[faces])
        info.append({'name':obj.name, 'vertices':len(verts), 'triangles':len(faces),
                     'bounds_min':verts.min(axis=0).tolist(), 'bounds_max':verts.max(axis=0).tolist(),
                     'matrix_world':[list(row) for row in obj.matrix_world]})
    evaluated.to_mesh_clear()
if not triangles:
    raise RuntimeError('No mesh triangles in FBX')
np.savez_compressed(output, triangles=np.concatenate(triangles))
with open(output + '.json', 'w', encoding='utf-8') as f:
    json.dump({'fbx_version':version, 'global_settings':global_settings, 'objects':info, 'scene_unit_scale':bpy.context.scene.unit_settings.scale_length}, f, indent=2)
print('EXPORTED', len(triangles), 'objects', sum(x['triangles'] for x in info), 'triangles')
