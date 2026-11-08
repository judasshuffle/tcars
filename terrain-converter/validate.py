"""Validate and read an unpainted, complete DRKT version 1 file."""
import math
import struct
import zlib
import numpy as np
from pathlib import Path

def read_drkt(path, dimensions=None, voxel=None):
    data=Path(path).read_bytes(); offset=0
    def take(fmt):
        nonlocal offset
        size=struct.calcsize(fmt)
        if offset+size>len(data): raise ValueError('truncated file')
        result=struct.unpack_from(fmt,data,offset); offset+=size
        return result
    magic,version,nx,ny,nz,side,nchunks=take('<4sIiiiiI')
    if magic!=b'DRKT' or version!=1 or side!=32: raise ValueError('invalid header')
    if min(nx,ny,nz)<1 or max(nx,ny,nz)>16384: raise ValueError('invalid counts')
    expected=tuple(math.ceil(n/32) for n in (nx,ny,nz))
    if nchunks!=math.prod(expected): raise ValueError('chunk count mismatch')
    if dimensions is not None:
        if voxel is None or voxel<=0: raise ValueError('voxel size required')
        if tuple(math.floor(d/voxel+0.5) for d in dimensions)!=(nx,ny,nz): raise ValueError('entity voxel counts mismatch')
    field=np.empty((nz,ny,nx),dtype=np.int8); seen=set()
    for _ in range(nchunks):
        x,y,z,kind=take('<iiiB'); key=(x,y,z)
        if key in seen or any(i<0 or i>=n for i,n in zip(key,expected)): raise ValueError('duplicate or out-of-range chunk')
        seen.add(key)
        if kind==0:
            value,material=take('<bB'); block=np.full((32,32,32),value,dtype=np.int8)
        elif kind==1:
            size,=take('<I')
            if offset+size>len(data): raise ValueError('truncated payload')
            decoder=zlib.decompressobj(); raw=decoder.decompress(data[offset:offset+size]); raw+=decoder.flush(); offset+=size
            if len(raw)!=65536 or not decoder.eof or decoder.unused_data: raise ValueError('invalid dense payload')
            block=np.frombuffer(raw[:32768],dtype=np.int8).reshape((32,32,32))
        else: raise ValueError('invalid chunk kind')
        dx=min(32,nx-x*32); dy=min(32,ny-y*32); dz=min(32,nz-z*32)
        field[z*32:z*32+dz,y*32:y*32+dy,x*32:x*32+dx]=block[:dz,:dy,:dx]
    if offset!=len(data): raise ValueError('trailing bytes')
    return field

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('file'); p.add_argument('--dimensions',nargs=3,type=float); p.add_argument('--voxel',type=float)
    a=p.parse_args(); f=read_drkt(a.file,a.dimensions,a.voxel)
    print('valid DRKT v1; voxel counts x/y/z:',tuple(reversed(f.shape)), 'distance range:',int(f.min()),int(f.max()))
