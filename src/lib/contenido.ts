// Ayudantes para leer el contenido desde las páginas. Toda URL se calcula aquí o en rutas.mjs.
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { resolverWikilink, destinoDeWikilink } from './indice-contenido.mjs';

export const ES_PROD = import.meta.env.PROD;

/** Carpeta de /contenido de cada colección ('' = raíz). */
export const CARPETA: Record<CollectionKey, string> = {
  secciones: '', niveles: 'roadmap', lecciones: 'roadmap', cursos: 'cursos', leccionesCurso: 'cursos',
  docsGrupos: 'docs', docs: 'docs', modelos: 'modelos', sistemas: 'sistemas', patrones: 'patrones',
  disciplinas: 'disciplinas', recetas: 'recetas', glosario: 'glosario', radar: 'radar', blog: 'blog',
  boletin: 'boletin', paginas: 'paginas',
  problemas: 'problemas', plantillas: 'plantillas', biblioteca: 'biblioteca', herramientas: 'herramientas', comunidad: 'comunidad',
};

type Entrada = CollectionEntry<CollectionKey>;

/** URL pública de cualquier entrada (misma regla que los wikilinks).
 *  El id ya viene normalizado por generarId: aquí NO se vuelve a normalizar
 *  (si no, «40-primer-agente» perdería su número). */
export function urlDe(e: { collection: CollectionKey; id: string }): string {
  if (e.collection === 'secciones' || e.collection === 'paginas') return `/${e.id}/`;
  return `/${CARPETA[e.collection]}/${e.id}/`;
}

/** Todas las entradas publicables de una colección (los borradores solo se ven en `pnpm dev`). */
export async function publicados<C extends CollectionKey>(col: C): Promise<CollectionEntry<C>[]> {
  return getCollection(col, (e: CollectionEntry<C>) => !(ES_PROD && (e.data as { estado?: string }).estado === 'borrador'));
}

export const porOrden = (a: Entrada, b: Entrada) =>
  ((a.data as { orden?: number }).orden ?? 0) - ((b.data as { orden?: number }).orden ?? 0) ||
  a.data.titulo.localeCompare(b.data.titulo, 'es');
export const porFechaDesc = (a: Entrada, b: Entrada) => +b.data.creado - +a.data.creado;
export const porTitulo = (a: Entrada, b: Entrada) => a.data.titulo.localeCompare(b.data.titulo, 'es', { sensitivity: 'base' });

/** id del padre: '40-primer-agente/el-bucle-agentico' → '40-primer-agente' */
export const padreDe = (id: string) => id.split('/').slice(0, -1).join('/');

/** Minutos de lectura a 200 palabras/min, sin contar bloques de código. */
export function minutosLectura(cuerpo = ''): number {
  const palabras = cuerpo.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

/** Anterior y siguiente dentro de una lista ya ordenada. */
export function vecinos<T extends { id: string }>(lista: T[], id: string) {
  const i = lista.findIndex((e) => e.id === id);
  return { anterior: i > 0 ? lista[i - 1] : undefined, siguiente: i >= 0 ? lista[i + 1] : undefined };
}

/** ["[[glosario/rag]]", …] → [{ url, titulo }] (los que no existen se omiten) */
export function resolverEnlaces(lista: string[] = []): { url: string; titulo: string }[] {
  return lista
    .map((v) => resolverWikilink(destinoDeWikilink(v)))
    .filter((r): r is NonNullable<typeof r> => Boolean(r) && !(ES_PROD && r!.estado === 'borrador'))
    .map((r) => ({ url: r.url, titulo: r.titulo }));
}

const FMT = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fecha = (d: Date) => FMT.format(d);
export const fechaISO = (d: Date) => d.toISOString().slice(0, 10);

/** ¿Creado o actualizado en los últimos `dias` días respecto a la fecha de build? */
export function esNuevo(e: Entrada, dias = 30): boolean {
  const ref = (e.data as { actualizado?: Date }).actualizado ?? e.data.creado;
  return Date.now() - +ref < dias * 864e5;
}
