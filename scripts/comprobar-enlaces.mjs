#!/usr/bin/env node
// Recorre dist/ y comprueba que cada enlace interno (href/src que empieza por /) existe en el sitio generado.
// Uso: node scripts/comprobar-enlaces.mjs   (después de pnpm build)
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
if (!fs.existsSync(DIST)) { console.error('No existe dist/. Ejecuta antes: pnpm build'); process.exit(1); }

const html = [];
(function recorrer(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'pagefind' && e.name !== '_astro') recorrer(p); }
    else if (e.name.endsWith('.html')) html.push(p);
  }
})(DIST);

const existe = (url) => {
  const limpio = decodeURIComponent(url.split('#')[0].split('?')[0]);
  const p = path.join(DIST, limpio);
  return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')));
};
const ids = new Map(); // archivo → Set(ids)
const idsDe = (archivo) => {
  if (!ids.has(archivo)) ids.set(archivo, new Set([...fs.readFileSync(archivo, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(archivo);
};

const rotos = [];
for (const archivo of html) {
  const txt = fs.readFileSync(archivo, 'utf8');
  const pagina = '/' + path.relative(DIST, archivo).replace(/index\.html$/, '').replace(/\\/g, '/');
  for (const m of txt.matchAll(/\s(?:href|src)="(\/[^"]*|#[^"]+)"/g)) {
    const url = m[1];
    if (url.startsWith('//')) continue;
    if (url.startsWith('#')) {
      if (url.length > 1 && !idsDe(archivo).has(decodeURIComponent(url.slice(1)))) rotos.push(`${pagina} → ${url} (ancla)`);
      continue;
    }
    if (!existe(url)) { rotos.push(`${pagina} → ${url}`); continue; }
    const [ruta, ancla] = url.split('#');
    if (ancla) {
      const destino = path.join(DIST, decodeURIComponent(ruta), ruta.endsWith('/') ? 'index.html' : '');
      if (fs.existsSync(destino) && fs.statSync(destino).isFile() && !idsDe(destino).has(decodeURIComponent(ancla)))
        rotos.push(`${pagina} → ${url} (ancla)`);
    }
  }
}
const unicos = [...new Set(rotos)];
unicos.slice(0, 200).forEach((r) => console.log('✗', r));
console.log(`\n${html.length} páginas · ${unicos.length} enlaces internos rotos`);
process.exit(unicos.length ? 1 : 0);
