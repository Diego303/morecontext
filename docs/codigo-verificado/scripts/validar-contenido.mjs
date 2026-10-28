#!/usr/bin/env node
// Valida /contenido antes de construir: nombres de archivo, frontmatter mínimo,
// wikilinks y enlaces .md rotos, URLs duplicadas y órdenes repetidos.
// Uso: node scripts/validar-contenido.mjs [--estricto]   (--estricto: los avisos también fallan)
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { obtenerIndice, resolverWikilink, RAIZ_CONTENIDO } from '../src/lib/indice-contenido.mjs';

const estricto = process.argv.includes('--estricto');
const errores = [], avisos = [];
const err = (f, m) => errores.push(`✗ ${f}: ${m}`);
const avi = (f, m) => avisos.push(`! ${f}: ${m}`);

const SECCIONES = ['roadmap', 'cursos', 'docs', 'modelos', 'sistemas', 'patrones', 'disciplinas',
  'recetas', 'glosario', 'radar', 'blog', 'boletin', 'paginas'];
const RE_WIKI = /(!?)\[\[([^\]|#\\]+)(?:#[^\]|\\]+)?\\?(?:\|[^\]]+)?\]\]/g; // admite \| dentro de tablas
const RE_NOMBRE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

const { entradas } = obtenerIndice();
const urls = new Map();
const ordenes = new Map();

for (const e of entradas) {
  const archivo = `contenido/${e.rel}.md`;
  const abs = path.join(RAIZ_CONTENIDO, `${e.rel}.md`);
  const txt = fs.readFileSync(abs, 'utf8');
  const seccion = e.rel.split('/')[0];
  const nombre = path.basename(abs);

  if (!SECCIONES.includes(seccion)) err(archivo, `carpeta de sección desconocida "${seccion}"`);
  if (!RE_NOMBRE.test(nombre)) err(archivo, 'nombre de archivo: solo minúsculas, números y guiones, sin tildes');
  for (const seg of e.rel.split('/').slice(0, -1)) if (!/^[a-z0-9-]+$/.test(seg)) err(archivo, `carpeta "${seg}" con caracteres no válidos`);

  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) { err(archivo, 'falta el frontmatter (--- … ---)'); continue; }
  let fm;
  try { fm = parseYaml(m[1]) ?? {}; } catch (x) { err(archivo, `YAML inválido: ${x.message.split('\n')[0]}`); continue; }
  const cuerpo = m[2];

  for (const k of ['titulo', 'descripcion', 'creado']) if (fm[k] === undefined || fm[k] === '') err(archivo, `falta "${k}"`);
  if (typeof fm.descripcion === 'string' && (fm.descripcion.length < 20 || fm.descripcion.length > 220))
    err(archivo, `"descripcion" debe tener 20–220 caracteres (tiene ${fm.descripcion.length})`);
  if (fm.estado && !['borrador', 'revision', 'publicado'].includes(fm.estado)) err(archivo, `estado "${fm.estado}" no válido`);
  if (fm.estado === 'borrador') continue; // los borradores pueden tener enlaces pendientes

  // URL única
  if (urls.has(e.url)) err(archivo, `URL duplicada ${e.url} (también ${urls.get(e.url)})`); else urls.set(e.url, archivo);

  // orden único dentro de su carpeta
  if (typeof fm.orden === 'number' && nombre !== 'index.md') {
    const k = `${path.dirname(e.rel)}#${fm.orden}`;
    if (ordenes.has(k)) avi(archivo, `orden ${fm.orden} repetido con ${ordenes.get(k)}`); else ordenes.set(k, archivo);
  }

  // wikilinks en el cuerpo (ignorando bloques de código) y en propiedades
  const sinCodigo = cuerpo.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const destinos = [...sinCodigo.matchAll(RE_WIKI)].filter((x) => !x[1]).map((x) => x[2]);
  for (const prop of ['relacionados', 'requiere', 'prerrequisitos', 'patrones'])
    for (const v of [].concat(fm[prop] ?? [])) {
      const mm = String(v).match(/\[\[([^\]|#]+)/);
      if (mm) destinos.push(mm[1]); else err(archivo, `"${prop}" debe usar wikilinks: "[[ruta]]" (encontrado: ${v})`);
    }
  for (const d of destinos) {
    const r = resolverWikilink(d);
    if (!r) err(archivo, `wikilink roto [[${d}]]`);
    else if (r.estado === 'borrador') avi(archivo, `enlaza a un borrador: [[${d}]]`);
  }

  // enlaces .md relativos
  for (const x of sinCodigo.matchAll(/\]\((?!https?:|#|\/)([^)\s]+?\.md)(?:#[^)]*)?\)/g)) {
    const destino = path.resolve(path.dirname(abs), decodeURI(x[1]));
    if (!fs.existsSync(destino)) err(archivo, `enlace .md roto (${x[1]})`);
  }

  // estilo: sin H1 en el cuerpo (el título sale del frontmatter)
  if (/^# /m.test(sinCodigo)) avi(archivo, 'no uses "# H1" en el cuerpo: el título ya sale de "titulo"');
}

for (const l of [...errores, ...avisos]) console.log(l);
console.log(`\n${entradas.length} archivos · ${errores.length} errores · ${avisos.length} avisos`);
process.exit(errores.length || (estricto && avisos.length) ? 1 : 0);
