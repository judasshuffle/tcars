"""Report connected components of welded, nondegenerate triangle geometry."""
import sys
import numpy as np

t=np.load(sys.argv[1])['triangles']
v, inv=np.unique(np.round(t.reshape(-1,3),5),axis=0,return_inverse=True)
f=inv.reshape(-1,3)
cross=np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]); area=np.linalg.norm(cross,axis=1)/2
parent=np.arange(len(v))
def root(i):
    while parent[i]!=i:
        parent[i]=parent[parent[i]]; i=parent[i]
    return i
for a,b,c in f[area>1e-8]:
    ra,rb,rc=root(a),root(b),root(c); parent[rb]=ra; parent[rc]=ra
groups={}
for i in np.flatnonzero(area>1e-8):
    key=root(f[i,0]); groups.setdefault(key,[]).append(i)
print('nondegenerate triangles',sum(area>1e-8),'degenerate',sum(area<=1e-8))
for ids in sorted(groups.values(),key=len,reverse=True)[:20]:
    p=t[ids].reshape(-1,3)
    print('triangles',len(ids),'area',round(float(sum(area[ids])),2),'min',p.min(axis=0).round(2),'max',p.max(axis=0).round(2))
