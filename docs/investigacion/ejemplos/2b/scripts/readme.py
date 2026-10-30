import sys, json, urllib.request
pkg, out = sys.argv[1], sys.argv[2]
d = json.load(urllib.request.urlopen(f"https://pypi.org/pypi/{pkg}/json", timeout=30))
open(out, "w").write(d["info"]["description"] or "")
