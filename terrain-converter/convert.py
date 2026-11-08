"""Generate an experimental DRKT v1 surface shell. Requires Python numpy and Blender 4.x."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess
import tempfile
import time
import zlib
import numpy as np

CHUNK=32
ROOT=Path(__file__).resolve().parent

def write_drkt(path, field):
    nz,ny,nx=field.shape
    counts=[nx,ny,nz]; chunks=[math.ceil(n/CHUNK) for n in counts]
    dense=0
    with open(path,'xb') as f:
        f.write(struct.pack('<4sIiii iI',b'DRKT',1,*counts,CHUNK,math.prod(chunks)))
        for kz in range(chunks[2]):
            for ky in range(chunks[1]):
                for kx in range(chunks[0]):
                    # Edge extension is the engine's outside-grid sampling convention.
                    zi=np.minimum(np.arange(kz*32,(kz+1)*32),nz-1)
                    yi=np.minimum(np.arange(ky*32,(ky+1)*32),ny-1)
                    xi=np.minimum(np.arange(kx*32,(kx+1)*32),nx-1)
                    block=field[np.ix_(zi,yi,xi)]
                    if block.min()==block.max():
                        f.write(struct.pack('<iiiBbB',kx,ky,kz,0,int(block.flat[0]),0))
                    else:
                        dense+=1
                        payload=zlib.compress(block.tobytes()+bytes(CHUNK**3))
                        f.write(struct.pack('<iiiBI',kx,ky,kz,1,len(payload))); f.write(payload)
    return dense

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('fbx',type=Path); ap.add_argument('output',type=Path)
    ap.add_argument('--blender',required=True,help='Path to blender executable')
    ap.add_argument('--config',type=Path,default=ROOT/'config.json')
    ap.add_argument('--voxel',type=float,default=1.0)
    ap.add_argument('--padding',type=int,default=4,help='padding in voxels on each side')
    ap.add_argument('--shell-radius',type=float,default=0.8,help='half-thickness in voxels; offsets both faces')
    ap.add_argument('--max-voxels',type=int,default=5000000)
    args=ap.parse_args()
    if not 0.05<=args.voxel<=16 or args.padding<2 or not 0.6<=args.shell_radius<=2:
        ap.error('voxel must be 0.05..16 m; padding >= 2; shell radius 0.6..2 voxels')
    cfg=json.loads(args.config.read_text(encoding='utf-8'))
    if cfg['rotation_degrees'] != [0,0,0] or cfg['registration_point'] != [0.5,0.5,0.5]:
        ap.error('prototype currently supports zero rotation and centred registration only')
    sha=hashlib.sha256(args.fbx.read_bytes()).hexdigest()
    if cfg.get('source_sha256') and sha.lower()!=cfg['source_sha256'].lower():
        ap.error('FBX SHA-256 does not match configuration')
    counts=[math.ceil(d/args.voxel)+2*args.padding for d in cfg['final_dimensions']]
    if min(counts)<1 or max(counts)>16384: ap.error('voxel counts exceed DarkRide file limits')
    if math.prod(counts)>args.max_voxels: ap.error('grid exceeds --max-voxels; increase voxel size or raise the limit explicitly')
    if args.output.exists(): ap.error('refusing to overwrite output')
    cfg.update(voxel=args.voxel,counts=counts,shell_radius=args.shell_radius)
    start=time.time()
    with tempfile.TemporaryDirectory() as temp:
        temp=Path(temp); mesh=temp/'mesh.npz'; field=temp/'field.npy'; config=temp/'settings.json'
        config.write_text(json.dumps(cfg),encoding='utf-8')
        def blender(script,*params):
            subprocess.run([args.blender,'-b','-t','2','--python',str(ROOT/script),'--',*map(str,params)],check=True)
        blender('inspect_fbx.py',args.fbx.resolve(),mesh)
        blender('voxelize_blender.py',mesh,config,field)
        vox=np.load(field,mmap_mode='r')
        dense=write_drkt(args.output,vox)
        vox._mmap.close()
        del vox
        print(json.dumps({'counts':counts,'dimensions_m':[n*args.voxel for n in counts],
              'position':cfg['position'],'voxel_m':args.voxel,'shell_radius_voxels':args.shell_radius,
              'chunks':math.prod(math.ceil(n/32) for n in counts),'dense_chunks':dense,
              'bytes':args.output.stat().st_size,'seconds':round(time.time()-start,2)},indent=2))

if __name__=='__main__': main()
