#!/usr/bin/env node
// Genera la imagen para compartir por defecto, public/og/default.png (1200×630, docs/DISENO.md §16),
// con el logotipo del kit de marca (scripts/marca/morecontext-logo-dark.svg).
// El favicon, los iconos de app y site.webmanifest vienen tal cual del kit del icono [+] v1 (docs/marca/):
// este script no los toca.
// Uso: pnpm og   (el PNG generado se versiona; no forma parte del build)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const PUBLIC = path.resolve('public');
const FUENTES = path.resolve('node_modules/@fontsource/jetbrains-mono/files');

// Colores de src/styles/tokens.css (sharp no lee CSS)
const C = { void: '#0f0f11', border: '#27272a', text: '#f4f4f5', muted: '#a1a1aa', faint: '#71717a', yellow: '#fde047' };

/** WOFF 1.0 → TTF. El FreeType de sharp no lee WOFF/WOFF2; un WOFF1 son tablas sfnt comprimidas con zlib. */
function woffATtf(woff) {
  if (woff.toString('ascii', 0, 4) !== 'wOFF') throw new Error('No es WOFF 1.0');
  const n = woff.readUInt16BE(12);
  const tablas = Array.from({ length: n }, (_, i) => {
    const o = 44 + i * 20;
    const [tag, offset, comp, orig, checksum] = [0, 4, 8, 12, 16].map((d) => woff.readUInt32BE(o + d));
    const crudo = woff.subarray(offset, offset + comp);
    return { tag, checksum, datos: comp < orig ? zlib.inflateSync(crudo) : crudo };
  });
  const potencia = 2 ** Math.floor(Math.log2(n));
  const cab = Buffer.alloc(12 + 16 * n);
  cab.writeUInt32BE(woff.readUInt32BE(4), 0);
  cab.writeUInt16BE(n, 4); cab.writeUInt16BE(potencia * 16, 6); cab.writeUInt16BE(Math.log2(potencia), 8); cab.writeUInt16BE(n * 16 - potencia * 16, 10);
  let offset = cab.length;
  const cuerpos = tablas.map((t, i) => {
    const r = 12 + i * 16;
    cab.writeUInt32BE(t.tag, r); cab.writeUInt32BE(t.checksum, r + 4); cab.writeUInt32BE(offset, r + 8); cab.writeUInt32BE(t.datos.length, r + 12);
    const relleno = Buffer.alloc((4 - (t.datos.length % 4)) % 4);
    offset += t.datos.length + relleno.length;
    return Buffer.concat([t.datos, relleno]);
  });
  return Buffer.concat([cab, ...cuerpos]);
}

// La imagen OG usa JetBrains Mono (500 y 700): se convierten a TTF en un directorio temporal
// y fontconfig se apunta allí antes de cargar sharp.
const dirFuentes = fs.mkdtempSync(path.join(os.tmpdir(), 'morecontext-og-'));
for (const peso of [500, 700])
  fs.writeFileSync(path.join(dirFuentes, `jetbrains-mono-${peso}.ttf`), woffATtf(fs.readFileSync(path.join(FUENTES, `jetbrains-mono-latin-${peso}-normal.woff`))));
const conf = path.join(dirFuentes, 'fonts.conf');
fs.writeFileSync(conf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${dirFuentes}</dir><cachedir>${dirFuentes}/cache</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE = conf;
const { default: sharp } = await import('sharp');

// Logotipo [+] morecontext (viewBox 155,25 × 26, nombre ya convertido en trazos): se incrusta sin <svg> ni <title>
const LOGO = fs.readFileSync(path.resolve('scripts/marca/morecontext-logo-dark.svg'), 'utf8').replace(/<svg[^>]*>|<\/svg>|<title>[^<]*<\/title>/g, '');
// La cara del icono ocupa 23,6 de las 26 unidades: con 57 px de alto mide unos 52 px, como el [+] anterior
const ALTO_LOGO = 57;

// ---------- Imagen para compartir (1200×630) ----------
const W = 1200, H = 630, X = 88;
const T = 76, AVANCE = T * 0.6 - T * 0.02; // JetBrains Mono: 600 unidades por glifo; tracking −0,02 em
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="reticula" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${C.border}" stroke-width="1"/>
    </pattern>
    <radialGradient id="foco" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="#fff"/><stop offset="100%" stop-color="#000"/>
    </radialGradient>
    <mask id="mascara"><rect width="${W}" height="${H}" fill="url(#foco)"/></mask>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.void}"/>
  <rect width="${W}" height="${H}" fill="url(#reticula)" mask="url(#mascara)" opacity=".15"/>

  <g transform="translate(${X} 78) scale(${ALTO_LOGO / 26})">${LOGO}</g>

  <rect x="${X + 4 * AVANCE}" y="${300 - T * 0.36}" width="${8 * AVANCE}" height="${T * 0.36}" fill="${C.yellow}" opacity=".3"/>
  <text font-family="JetBrains Mono" font-weight="700" font-size="${T}" letter-spacing="${-T * 0.02}" fill="${C.text}">
    <tspan x="${X}" y="300">Más contexto,</tspan>
    <tspan x="${X}" y="${300 + T * 1.12}">menos ruido.</tspan>
  </text>

  <text x="${X}" y="${H - 72}" font-family="JetBrains Mono" font-weight="500" font-size="20" letter-spacing="1" fill="${C.muted}">LA GUÍA ABIERTA DE AGENTES DE IA · EN ESPAÑOL</text>
  <text x="${W - X}" y="${H - 72}" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="20" fill="${C.faint}">morecontextai.com</text>
</svg>`;
fs.mkdirSync(path.join(PUBLIC, 'og'), { recursive: true });
await sharp(Buffer.from(og)).png().toFile(path.join(PUBLIC, 'og', 'default.png'));

fs.rmSync(dirFuentes, { recursive: true, force: true });
console.log('✓ public/og/default.png');
