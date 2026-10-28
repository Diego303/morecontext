// Etiquetas (tags): única regla de URL para /tags/<tag>/ y recuento en todo el contenido.
import type { CollectionKey } from 'astro:content';
import { publicados, urlDe } from './contenido';

export const COLECCIONES: CollectionKey[] = ['secciones', 'niveles', 'lecciones', 'cursos', 'leccionesCurso', 'docsGrupos', 'docs',
  'modelos', 'sistemas', 'patrones', 'disciplinas', 'recetas', 'glosario', 'radar', 'blog', 'boletin', 'paginas',
  'problemas', 'plantillas', 'biblioteca', 'herramientas', 'comunidad'];

/** Normaliza una etiqueta para su URL: minúsculas, sin tildes, espacios a guiones. */
export const slugTag = (tag: string) =>
  tag.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '-');

export const urlDeTag = (tag: string) => `/tags/${slugTag(tag)}/`;

export type EntradaTag = { url: string; titulo: string; descripcion: string; coleccion: CollectionKey; seccion: string };

/** Mapa slug → { nombre, entradas } con todo el contenido publicado. */
export async function indiceTags() {
  const mapa = new Map<string, { nombre: string; entradas: EntradaTag[] }>();
  for (const col of COLECCIONES) {
    for (const e of await publicados(col)) {
      const url = urlDe(e);
      for (const tag of e.data.tags) {
        const slug = slugTag(tag);
        if (!slug) continue;
        const grupo = mapa.get(slug) ?? { nombre: tag, entradas: [] };
        grupo.entradas.push({ url, titulo: e.data.titulo, descripcion: e.data.descripcion, coleccion: col, seccion: url.split('/')[1] ?? '' });
        mapa.set(slug, grupo);
      }
    }
  }
  return mapa;
}
