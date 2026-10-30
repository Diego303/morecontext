// Adapta el frontmatter del paquete v2 al esquema del proyecto (fase I2 de la integración).
// Uso: pnpm exec node docs/integracion/mapear-frontmatter.mjs [--aplicar] [contenido]
// Sin --aplicar solo lista los cambios. Toca solo el bloque de frontmatter y respeta los finales de línea (LF o CRLF).
//
//   herramientas/*.md, _plantillas/herramienta.md   web: …            → url: …
//   plantillas/*.md, _plantillas/plantilla.md       formato: markdown → md · texto → txt (toml no existe en el esquema: error)
import fs from 'node:fs';
import path from 'node:path';

const APLICAR = process.argv.includes('--aplicar');
const RAIZ = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'contenido');
const FORMATO = { markdown: 'md', texto: 'txt', yaml: 'yaml', json: 'json', md: 'md', txt: 'txt', jsonl: 'jsonl' };

const md = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'index.md').map((f) => path.join(dir, f)) : []);
const reglas = [
  { archivos: [...md(path.join(RAIZ, 'herramientas')), path.join(RAIZ, '_plantillas', 'herramienta.md')],
    cambiar: (fm) => fm.replace(/^web:/m, 'url:') },
  { archivos: [...md(path.join(RAIZ, 'plantillas')), path.join(RAIZ, '_plantillas', 'plantilla.md')],
    cambiar: (fm, f) => fm.replace(/^formato:[ \t]*["']?([\w-]+)["']?/m, (_, v) => {
      if (!FORMATO[v]) throw new Error(`${f}: formato "${v}" no existe en el esquema del proyecto`);
      return `formato: ${FORMATO[v]}`;
    }) },
];

let cambiados = 0, errores = 0;
for (const { archivos, cambiar } of reglas)
  for (const f of archivos.filter((a) => fs.existsSync(a))) {
    const texto = fs.readFileSync(f, 'utf8');
    const m = texto.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
    if (!m) { console.error(`✗ ${path.relative(RAIZ, f)}: sin frontmatter`); errores++; continue; }
    let nuevo;
    try { nuevo = cambiar(m[0], path.relative(RAIZ, f)); } catch (x) { console.error(`✗ ${x.message}`); errores++; continue; }
    if (nuevo === m[0]) continue;
    cambiados++;
    const antes = m[0].split(/\r?\n/), despues = nuevo.split(/\r?\n/);
    console.log(`${path.relative(RAIZ, f)}: ${antes.filter((l, i) => l !== despues[i]).join(' | ')} → ${despues.filter((l, i) => l !== antes[i]).join(' | ')}`);
    if (APLICAR) fs.writeFileSync(f, nuevo + texto.slice(m[0].length));
  }
console.log(`\n${cambiados} archivo(s) ${APLICAR ? 'cambiados' : 'por cambiar'} · ${errores} error(es)`);
if (errores) process.exit(1);
