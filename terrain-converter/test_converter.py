import json
import math
from pathlib import Path
import tempfile
import unittest
import numpy as np
from convert import write_drkt
from validate import read_drkt
from raster import intersections, distinct

HERE=Path(__file__).resolve().parent

class TerrainTests(unittest.TestCase):
    def test_round_trip_and_reject_corruption(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'test.drkt'
            field=np.full((35,3,33),127,dtype=np.int8)
            field[1,1,1]=-32; field[34,2,32]=0
            write_drkt(path,field)
            np.testing.assert_array_equal(field,read_drkt(path,[33,3,35],1))
            with self.assertRaises(ValueError): read_drkt(path,[34,3,35],1)
            with self.assertRaises(FileExistsError): write_drkt(path,field)
            raw=path.read_bytes(); path.write_bytes(raw[:-1])
            with self.assertRaises(ValueError): read_drkt(path)

    def test_generated_file_and_world_bounds(self):
        field=read_drkt(HERE/'landscape-preview-1m.drkt',[258,47,189],1)
        self.assertEqual(field.shape,(189,47,258))
        self.assertLess(field.min(),0); self.assertGreater(field.max(),0)
        cfg=json.loads((HERE/'config.json').read_text())
        self.assertEqual(cfg['final_dimensions'],[249.121,38.88,180.92])
        for centre, model, grid in zip(cfg['position'],cfg['final_dimensions'],[258,47,189]):
            self.assertGreaterEqual((grid-model)/2,4)
            self.assertLess(centre-grid/2,centre-model/2)
            self.assertGreater(centre+grid/2,centre+model/2)

    def test_original_surface_samples_lie_inside_decoded_shell(self):
        field=read_drkt(HERE/'landscape-preview-1m.drkt',[258,47,189],1)
        cfg=json.loads((HERE/'config.json').read_text())
        tri=np.load(HERE/'mesh.npz')['triangles']
        lo=tri.min(axis=(0,1)); hi=tri.max(axis=(0,1))
        tri=(tri-(lo+hi)/2)*(np.array(cfg['final_dimensions'])/(hi-lo))
        # Exact sample columns in the grid's integer-point coordinate system.
        xs=np.arange(-100,101,10.0); zs=np.arange(-70.5,71,10.0)
        hits=intersections(tri,xs,zs); checked=0
        for iz,z in enumerate(zs):
            for ix,x in enumerate(xs):
                levels=distinct(hits[iz*len(xs)+ix],.25)
                if not levels: continue
                y=levels[-1]; gy=y+47/2; y0=math.floor(gy); fraction=gy-y0
                gx=int(x+258/2); gz=int(z+189/2)
                d=(1-fraction)*float(field[gz,y0,gx])+fraction*float(field[gz,y0+1,gx])
                self.assertLess(d,10, f'surface sample ({x},{y},{z}) falls outside shell')
                checked+=1
        self.assertGreater(checked,200)

if __name__=='__main__': unittest.main()
