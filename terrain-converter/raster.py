"""Vertical triangle intersections at regularly spaced Y-up X/Z sample points."""
import numpy as np


def intersections(triangles, xs, zs):
    hits = [[] for _ in range(len(xs) * len(zs))]
    dx = xs[1] - xs[0]; dz = zs[1] - zs[0]
    for tri in triangles:
        x, y, z = tri[:, 0], tri[:, 1], tri[:, 2]
        det = (z[1]-z[2])*(x[0]-x[2]) + (x[2]-x[1])*(z[0]-z[2])
        if abs(det) < 1e-10:
            continue
        x0=max(0,int(np.ceil((min(x)-xs[0])/dx))); x1=min(len(xs)-1,int(np.floor((max(x)-xs[0])/dx)))
        z0=max(0,int(np.ceil((min(z)-zs[0])/dz))); z1=min(len(zs)-1,int(np.floor((max(z)-zs[0])/dz)))
        if x0>x1 or z0>z1:
            continue
        xx,zz=np.meshgrid(xs[x0:x1+1],zs[z0:z1+1])
        a=((z[1]-z[2])*(xx-x[2])+(x[2]-x[1])*(zz-z[2]))/det
        b=((z[2]-z[0])*(xx-x[2])+(x[0]-x[2])*(zz-z[2]))/det
        c=1-a-b
        for iz,ix in np.argwhere((a>=-1e-8)&(b>=-1e-8)&(c>=-1e-8)):
            hits[(z0+iz)*len(xs)+x0+ix].append(float(a[iz,ix]*y[0]+b[iz,ix]*y[1]+c[iz,ix]*y[2]))
    return hits


def distinct(values, epsilon=0.05):
    result=[]
    for value in sorted(values):
        if not result or value-result[-1]>epsilon:
            result.append(value)
    return result
