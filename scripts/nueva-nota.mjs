#!/usr/bin/env node
// Crea una nota nueva desde una plantilla de contenido/_plantillas.
// Uso: pnpm nuevo <plantilla> <ruta-sin-.md> "<Título>"
//   pnpm nuevo termino glosario/agente-de-voz "Agente de voz"
//   pnpm nuevo leccion roadmap/40-primer-agente/07-memoria-de-trabajo "Memoria de trabajo"
import fs from 'node:fs';
import path from 'node:path';

const [plantilla, ruta, ...resto] = process.argv.slice(2);
const titulo = resto.join(' ').trim();
const DIR = path.resolve('contenido');
const PLANTILLAS = path.join(DIR, '_plantillas');
const disponibles = fs.existsSync(PLANTILLAS) ? fs.readdirSync(PLANTILLAS).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];

const salir = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
if (!plantilla || !ruta || !titulo)
  salir(`Uso: pnpm nuevo <plantilla> <ruta> "<Título>"\n  Plantillas: ${disponibles.join(', ')}`);
if (!disponibles.includes(plantilla)) salir(`No existe la plantilla "${plantilla}". Disponibles: ${disponibles.join(', ')}`);
const rel = ruta.replace(/\.md$/, '').replace(/^\/+|\/+$/g, '');
if (!rel.split('/').every((s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)))
  salir(`"${rel}": usa minúsculas, números y guiones, sin tildes ni ñ (p. ej. glosario/agente-de-voz).`);
const destino = path.join(DIR, `${rel}.md`);
if (fs.existsSync(destino)) salir(`Ya existe contenido/${rel}.md`);

const hoy = new Date().toISOString().slice(0, 10);
const texto = fs.readFileSync(path.join(PLANTILLAS, `${plantilla}.md`), 'utf8')
  .replace(/\{\{\s*title\s*\}\}/g, titulo.replace(/"/g, '\\"'))
  .replace(/\{\{\s*date(?::[^}]*)?\s*\}\}/g, hoy);
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, texto);
console.log(`✓ contenido/${rel}.md creado (estado: borrador). Ábrelo, escríbelo y ejecuta pnpm validar.`);
