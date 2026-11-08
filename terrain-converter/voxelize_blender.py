"""Blender worker: distance to imported triangles, using a double-sided solid shell."""
import sys
import time
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

args=sys.argv[sys.argv.index('--')+1:]
mesh, config, output=args
tri=np.load(mesh)['triangles']
import json
with open(config, encoding='utf-8') as f: settings=json.load(f)
lo=tri.min(axis=(0,1)); hi=tri.max(axis=(0,1))
tri=(tri-(lo+hi)/2)*(np.asarray(settings['final_dimensions'])/(hi-lo))
area=np.linalg.norm(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]),axis=1)
tri=tri[area>1e-8]
verts=[tuple(p) for p in tri.reshape(-1,3)]
faces=[(i,i+1,i+2) for i in range(0,len(verts),3)]
bvh=BVHTree.FromPolygons(verts,faces,all_triangles=True)
voxel=settings['voxel']; counts=settings['counts']; radius=settings['shell_radius']
low=-np.asarray(counts,dtype=float)*voxel/2
# C order is z,y,x, matching DarkRide's x-fastest chunk layout.
field=np.empty((counts[2],counts[1],counts[0]),dtype=np.int8)
start=time.time()
for z in range(counts[2]):
    pz=low[2]+z*voxel
    for y in range(counts[1]):
        py=low[1]+y*voxel
        for x in range(counts[0]):
            result=bvh.find_nearest(Vector((low[0]+x*voxel,py,pz)), (radius+4.1)*voxel)
            distance=result[3] if result[0] is not None else (radius+4.1)*voxel
            field[z,y,x]=max(-127,min(127,round((distance/voxel-radius)*32)))
    if z%32==0: print('VOXELIZE',z,'/',counts[2],flush=True)
np.save(output,field)
print('VOXELIZE SECONDS',round(time.time()-start,2),'nondegenerate triangles',len(tri),flush=True)
