// Índice de todo /contenido para resolver [[wikilinks]] y enlaces .md relativos.
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { urlDeArchivo, normalizarId } from './rutas.mjs';

export const RAIZ_CONTENIDO = path.resolve(process.cwd(), 'contenido');
let cache = null;

function recorrer(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name.startsWith('_')) continue; // .obsidian, _plantillas, _borradores…
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function leerFrontmatter(abs) {
  const txt = fs.readFileSync(abs, 'utf8');
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  try { return m ? parseYaml(m[1]) ?? {} : {}; } catch { return {}; }
}

const ES_PROD = process.env.NODE_ENV === 'production';

/** Índice de /contenido. En desarrollo se recalcula si tiene más de 2 s (notas nuevas sin reiniciar). */
export function obtenerIndice() {
  if (cache && (ES_PROD || Date.now() - cache.creado < 2000)) return cache;
  const porClave = new Map();   // clave normalizada → entrada | null (ambigua)
  const entradas = [];
  const poner = (k, e) => {
    const key = k.toLowerCase();
    if (!porClave.has(key)) porClave.set(key, e);
    else if (porClave.get(key) !== e) porClave.set(key, null); // ambigua: obliga a usar la ruta completa
  };
  for (const abs of recorrer(RAIZ_CONTENIDO)) {
    const rel = path.relative(RAIZ_CONTENIDO, abs).replace(/\\/g, '/').replace(/\.md$/, '');
    const fm = leerFrontmatter(abs);
    const e = { rel, id: normalizarId(rel), url: urlDeArchivo(rel), titulo: fm.titulo ?? path.basename(rel), estado: fm.estado ?? 'publicado' };
    entradas.push(e);
    // claves exactas (prioridad): ruta con y sin prefijos de orden
    porClave.set(rel.toLowerCase(), e);
    porClave.set(e.id.toLowerCase(), e);
    // claves cómodas (solo si son únicas): nombre de archivo, alias
    const base = rel.split('/').at(-1);
    if (base !== 'index') { poner(base, e); poner(normalizarId(base), e); }
    for (const a of [].concat(fm.aliases ?? [])) poner(String(a), e);
  }
  cache = { entradas, porClave, creado: Date.now() };
  return cache;
}

/** "glosario/rag", "rag", "Retrieval-Augmented Generation" → entrada o null */
export function resolverWikilink(destino) {
  const { porClave } = obtenerIndice();
  const k = destino.trim().replace(/\\$/, '').replace(/\.md$/, '').replace(/^\/+|\/+$/g, '').toLowerCase();
  return porClave.get(k) ?? null;
}

/** Limpia "[[glosario/rag|RAG]]" → "glosario/rag" */
export function destinoDeWikilink(texto) {
  const m = String(texto).match(/^\s*\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]\s*$/);
  return m ? m[1].trim() : String(texto).trim();
}
