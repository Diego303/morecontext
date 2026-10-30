import json, sys, urllib.request
pkgs = sys.argv[1:]
for p in pkgs:
    try:
        d = json.load(urllib.request.urlopen(f"https://pypi.org/pypi/{p}/json", timeout=20))
        v = d['info']['version']
        files = d['releases'].get(v) or []
        up = files[0]['upload_time'][:10] if files else '?'
        lic = d['info'].get('license_expression') or d['info'].get('license') or ''
        if len(lic) > 40: lic = lic[:40] + '…'
        cls = [c.split('::')[-1].strip() for c in d['info']['classifiers'] if c.startswith('License')]
        status = [c.split('::')[-1].strip() for c in d['info']['classifiers'] if c.startswith('Development Status')]
        req = d['info'].get('requires_python')
        print(f"{p} | {v} | {lic or cls} | {up} | {status} | py{req}")
    except Exception as e:
        print(p, "ERR", e)
