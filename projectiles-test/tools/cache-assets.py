"""Cache original TCARS assets without changing historical exports (stdlib only)."""
import concurrent.futures
import hashlib
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / 'assets' / 'cache'
CACHE.mkdir(parents=True, exist_ok=True)
urls = set()
for path in (ROOT / 'trackzones').glob('*.json'):
    for entity in json.loads(path.read_text())['entities']:
        for key in ('modelURL', 'compoundShapeURL'):
            if entity.get(key):
                urls.add(entity[key])
for path in re.findall(r'"(cars/[^"\n]+)"', (ROOT / 'modules' / 'vehicles.js').read_text()):
    urls.add('http://hifi-external.s3.amazonaws.com/tcars/models/' + path)
for name in ('enginenoise2', 'idle', 'decelerating', 'starting', 'shutdown'):
    urls.add('http://hifi-external.s3.amazonaws.com/tcars/sounds/' + name + '.wav')

def download(url):
    secure = re.sub(r'^http:', 'https:', url)
    ext = pathlib.PurePosixPath(secure.split('?')[0]).suffix
    dest = CACHE / (hashlib.sha256(url.encode()).hexdigest()[:20] + ext)
    result = {'source': url, 'request': secure}
    try:
        if not dest.exists():
            with urllib.request.urlopen(secure, timeout=25) as response:
                blob = response.read(64 * 1024 * 1024 + 1)
                if len(blob) > 64 * 1024 * 1024:
                    raise ValueError('Asset exceeds 64 MiB limit')
                if blob.lstrip().startswith((b'<html', b'<!DOCTYPE html', b'<?xml')):
                    raise ValueError('Server returned a document instead of an asset')
                dest.write_bytes(blob)
        result.update(available=True, path=dest.relative_to(ROOT).as_posix(), bytes=dest.stat().st_size,
                      sha256=hashlib.sha256(dest.read_bytes()).hexdigest())
    except Exception as error:
        result.update(available=False, error=str(error))
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(download, sorted(urls)))
(ROOT / 'assets' / 'manifest.json').write_text(json.dumps({'assets': {r['source']: r for r in results}}, indent=2) + '\n')
print(json.dumps({'available': sum(r['available'] for r in results), 'total': len(results)}))
