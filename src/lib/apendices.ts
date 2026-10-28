// Secciones del backlog (fase 13): problemas, plantillas, biblioteca, herramientas y comunidad.
// Solo existen en la web (rutas, portada, pie, sitemap) si su portadilla está publicada y tienen
// al menos una entrada publicada. En `pnpm dev` se ven también los borradores.
import { getEntry, type CollectionEntry } from 'astro:content';
import { ES_PROD, porTitulo, publicados } from './contenido';

export const APENDICES = ['problemas', 'plantillas', 'biblioteca', 'herramientas', 'comunidad'] as const;
export type Apendice = (typeof APENDICES)[number];
export type EntradaApendice = CollectionEntry<Apendice>;

/** Dato corto de cada entrada para listados y para el índice de la portada. */
export function datoDe(e: EntradaApendice): string {
  const d = e.data as Record<string, unknown>;
  switch (e.collection) {
    case 'problemas': return 'problema';
    case 'plantillas': return `.${d.formato}`;
    case 'biblioteca': return `${d.autores} · ${d.anio}`;
    case 'herramientas': return [d.categoria, d.licencia].filter(Boolean).join(' · ');
    case 'comunidad': return String(d.autor);
  }
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
