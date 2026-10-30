# Uso: python -I pypi_info.py paquete [palabras clave...]  -> versión, fecha, licencia, URLs y fragmentos del README
import sys, json, urllib.request, re
pkg, kws = sys.argv[1], sys.argv[2:]
d = json.load(urllib.request.urlopen(f"https://pypi.org/pypi/{pkg}/json", timeout=30))
i = d["info"]; rel = d["releases"].get(i["version"], [])
print(f"== {i['name']} {i['version']} ({rel[0]['upload_time'][:10] if rel else '?'}) license={i.get('license_expression') or (i.get('license') or '')[:60]!r}")
print("classifiers:", [c for c in i.get("classifiers", []) if "License" in c])
print("urls:", i.get("project_urls"))
desc = i.get("description") or ""
for kw in kws:
    for m in list(re.finditer(re.escape(kw), desc, re.I))[:3]:
        s = max(0, m.start()-300); e = min(len(desc), m.end()+500)
        print(f"--- [{kw}] ...{desc[s:e]}...")
