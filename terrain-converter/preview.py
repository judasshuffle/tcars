"""Plot a source cross-section against zero contours decoded from the actual DRKT."""
import argparse
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from validate import read_drkt

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('mesh'); p.add_argument('drkt'); p.add_argument('output'); p.add_argument('--config',default=str(Path(__file__).parent/'config.json'))
p.add_argument('--voxel',type=float,default=1); p.add_argument('--z-index',type=int)
a=p.parse_args(); cfg=json.loads(Path(a.config).read_text()); tri=np.load(a.mesh)['triangles']; field=read_drkt(a.drkt)
nz,ny,nx=field.shape; lo=tri.min(axis=(0,1)); hi=tri.max(axis=(0,1)); tri=(tri-(lo+hi)/2)*(np.array(cfg['final_dimensions'])/(hi-lo))
iz=a.z_index if a.z_index is not None else nz//2
if not 0<=iz<nz: raise ValueError('z index outside grid')
z=(-nz/2+iz)*a.voxel; xs=(np.arange(nx)-nx/2)*a.voxel; ys=(np.arange(ny)-ny/2)*a.voxel
segments=[]
for t in tri:
    points=[]
    for i,j in [(0,1),(1,2),(2,0)]:
        d=t[j,2]-t[i,2]
        if abs(d)>1e-10 and 0<=(z-t[i,2])/d<=1:
            points.append(t[i]+(z-t[i,2])/d*(t[j]-t[i]))
    if len(points)>=2: segments.append(points[:2])
fig,ax=plt.subplots(figsize=(15,5),constrained_layout=True)
for seg in segments:
    q=np.array(seg); ax.plot(q[:,0],q[:,1],color='black',lw=0.8,alpha=.65)
ax.contour(xs,ys,field[iz],levels=[0],colors=['#e45027'],linewidths=.8)
ax.set(title=f'Source FBX (black) and DRKT shell zero crossings (orange), Z={z:.1f} m relative to model centre',xlabel='X (m)',ylabel='Y (m)')
ax.set_aspect('equal'); ax.grid(alpha=.2); fig.savefig(a.output,dpi=160)
