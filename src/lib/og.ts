// Imagen para compartir de cada página (1200×630, DISENO §16), generada en el build con satori + sharp.
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import type { CollectionKey } from 'astro:content';
import { urlDe } from './contenido';

/** Ruta pública de la imagen OG de una entrada: /glosario/rag/ → /og/glosario/rag.png */
export const ogDe = (e: { collection: CollectionKey; id: string }) => `/og/${urlDe(e).slice(1, -1)}.png`;

// Colores de src/styles/tokens.css (satori no lee CSS)
const C = { void: '#0f0f11', border: '#27272a', text: '#f4f4f5', muted: '#a1a1aa', faint: '#80808a', yellow: '#fde047', ink: '#000000' };
const FUENTES = path.resolve('node_modules/@fontsource/jetbrains-mono/files');
let fuentes: { name: string; data: Buffer; weight: 500 | 700; style: 'normal' }[] | null = null;
const cargarFuentes = () => (fuentes ??= ([500, 700] as const).map((weight) => ({
  name: 'JetBrains Mono', weight, style: 'normal' as const,
  data: fs.readFileSync(path.join(FUENTES, `jetbrains-mono-latin-${weight}-normal.woff`)),
})));

// Icono [+] v1 del kit de marca (scripts/marca/): la sombra amarilla ya forma parte del SVG.
const MARCA = `data:image/svg+xml;base64,${fs.readFileSync(path.resolve('scripts/marca/morecontext-icon.svg')).toString('base64')}`;
// La cara ocupa 23,6 de las 26 unidades: a 62 px mide unos 56 px, como el [+] anterior
const LADO_MARCA = 62;

type Nodo = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Nodo =>
  ({ type, props: { style, children, ...extra } });

/** PNG de 1200×630 con el título, la sección y el dominio. */
export async function imagenOg(titulo: string, seccion: string): Promise<Buffer> {
  // La fuente (subconjunto latino) no trae «→»: se sustituye para que no salga un hueco
  const t = titulo.replace(/→/g, '–');
  const tam = t.length > 70 ? 50 : t.length > 42 ? 58 : 66;
  // Retícula al 15 % ya mezclada sobre el fondo (#27272a al 15 % sobre #0f0f11 = #131316)
  const linea = '#131316';
  const arbol = h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'JetBrains Mono',
    // satori mide en content-box por defecto: sin border-box el relleno agranda el lienzo y la franja inferior queda fuera
    boxSizing: 'border-box', paddingTop: 78, paddingRight: 88, paddingBottom: 72, paddingLeft: 88,
    backgroundColor: C.void, backgroundSize: '40px 40px',
    backgroundImage: `linear-gradient(to right, ${linea} 1px, transparent 1px), linear-gradient(to bottom, ${linea} 1px, transparent 1px)` }, [
    h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
      h('img', { width: LADO_MARCA, height: LADO_MARCA }, undefined, { src: MARCA, width: LADO_MARCA, height: LADO_MARCA }),
      h('div', { fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: -0.36 }, 'morecontext'),
    ]),
    h('div', { display: 'flex', fontSize: tam, fontWeight: 700, color: C.text, lineHeight: 1.12, letterSpacing: -tam * 0.02, maxWidth: 1024, lineClamp: 3 }, t),
    h('div', { display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 500 }, [
      h('div', { color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }, seccion),
      h('div', { color: C.faint }, 'morecontextai.com'),
    ]),
  ]);
  const svg = await satori(arbol as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: cargarFuentes() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
