"""Build a portable runtime ZIP; excludes legacy controllers and Git metadata."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
output = root / 'dist' / 'tcars-darkride.zip'
output.parent.mkdir(exist_ok=True)
paths = ['launch-tcars.js', 'car-button.svg', 'README.md', 'PROGRESS.md', 'package.json', 'LICENSE',
         'modules/vehicles.js', 'modules/tracks.js', 'modules/constants.js']
for directory in ['darkride', 'assets', 'trackzones', 'examples', 'docs', 'tools', 'tests/darkride']:
    paths.extend(p.relative_to(root).as_posix() for p in (root / directory).rglob('*')
                 if p.is_file() and '__pycache__' not in p.parts)
with ZipFile(output, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for name in sorted(paths):
        archive.write(root / name, 'tcars-darkride/' + name)
with ZipFile(output) as archive:
    bad = archive.testzip()
    if bad:
        raise RuntimeError('ZIP validation failed: ' + bad)
print(f'{output} ({output.stat().st_size / 1024 / 1024:.1f} MiB), verified ZIP CRCs')
