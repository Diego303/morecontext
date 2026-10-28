// Imagen OG de cada entrada publicada: /og/<ruta>.png (la portada y las páginas sin entrada usan /og/default.png).
import type { APIRoute, GetStaticPaths } from 'astro';
import { NOMBRE_SECCION } from '../../config/sitio';
import { CARPETA, publicados, urlDe } from '../../lib/contenido';
import { COLECCIONES } from '../../lib/etiquetas';
import { imagenOg } from '../../lib/og';

export const getStaticPaths = (async () => {
  const rutas = [];
  for (const col of COLECCIONES) for (const e of await publicados(col)) {
    const clave = col === 'secciones' ? e.id : col === 'paginas' ? '' : CARPETA[col];
    rutas.push({ params: { ruta: urlDe(e).slice(1, -1) }, props: { titulo: e.data.titulo, seccion: (clave && NOMBRE_SECCION[clave]) || 'MoreContext' } });
  }
  return rutas;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await imagenOg(props.titulo as string, props.seccion as string);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
