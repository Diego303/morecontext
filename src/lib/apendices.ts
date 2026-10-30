// Secciones del backlog (fase 13) que aún usan las rutas genéricas [apendice]: hoy, solo comunidad.
// Problemas, plantillas, biblioteca y herramientas tienen páginas propias desde la integración v2.
// Solo existen en la web (rutas, portada, pie, sitemap) si su portadilla está publicada y tienen
// al menos una entrada publicada. En `pnpm dev` se ven también los borradores.
import { getEntry, type CollectionEntry } from 'astro:content';
import { ES_PROD, porTitulo, publicados } from './contenido';

export const APENDICES = ['comunidad'] as const;
export type Apendice = (typeof APENDICES)[number];
export type EntradaApendice = CollectionEntry<Apendice>;

/** Dato corto de cada entrada para listados y para el índice de la portada. */
export function datoDe(e: EntradaApendice): string {
  return e.data.autor;
}

export async function apendicesVisibles() {
  const lista = [];
  for (const id of APENDICES) {
    const portadilla = await getEntry('secciones', id);
    if (!portadilla || (ES_PROD && portadilla.data.estado === 'borrador')) continue;
    const entradas = ((await publicados(id)) as EntradaApendice[]).sort((a, b) =>
      ((a.data as { orden?: number }).orden ?? 999) - ((b.data as { orden?: number }).orden ?? 999) || porTitulo(a, b));
    if (entradas.length) lista.push({ id, portadilla, entradas });
  }
  return lista;
}
