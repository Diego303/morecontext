// JSON-LD por tipo de página (schema.org). Todas en español y con el editor de SITIO.
import type { CollectionEntry, CollectionKey } from 'astro:content';
import { SITIO } from '../config/sitio';
import { fechaISO, urlDe } from './contenido';

const abs = (ruta: string) => new URL(ruta, SITIO.url).href;
type Entrada = CollectionEntry<CollectionKey>;

export const editor = { '@type': 'Organization', name: SITIO.nombre, url: SITIO.url, logo: abs('/icon-512.png') };
/** Si el autor es aún un marcador («[…]»), firma la organización (sin datos inventados). */
export const autor = /\[.*\]/.test(SITIO.autor) ? editor : { '@type': 'Person', name: SITIO.autor, url: SITIO.autorUrl };

function comun(e: Entrada) {
  const d = e.data as typeof e.data & { actualizado?: Date };
  return {
    '@context': 'https://schema.org',
    name: d.titulo,
    description: d.descripcion,
    url: abs(urlDe(e)),
    inLanguage: 'es',
    datePublished: fechaISO(d.creado),
    ...(d.actualizado ? { dateModified: fechaISO(d.actualizado) } : {}),
    author: autor,
    publisher: editor,
    ...(d.tags.length ? { keywords: d.tags.join(', ') } : {}),
  };
}

export const ldArticulo = (e: Entrada) => ({ ...comun(e), '@type': 'TechArticle', headline: e.data.titulo });

export const ldBlog = (e: Entrada) => ({ ...comun(e), '@type': 'BlogPosting', headline: e.data.titulo });

/** Ficha de la biblioteca: el artículo es nuestro comentario (autor, el de SITIO); el texto original va en
 *  `about`, con sus autores tal como los escribe la ficha (`creditText`), su año y su enlace. */
export const ldBiblioteca = (e: CollectionEntry<'biblioteca'>) => ({
  ...ldArticulo(e),
  about: {
    '@type': e.data.tipo === 'paper' ? 'ScholarlyArticle' : e.data.tipo === 'libro' ? 'Book' : 'CreativeWork',
    name: e.data.titulo.replace(/\s*\([^()]*\d{4}\)$/, ''),
    creditText: e.data.autores,
    datePublished: String(e.data.anio),
    url: e.data.url,
  },
});

/** Lecciones y fichas de curso o nivel. `minutos` u `horas` → timeRequired ISO 8601. */
export const ldAprendizaje = (e: Entrada, o: { nivel?: string; minutos?: number; horas?: number }) => ({
  ...comun(e),
  '@type': 'LearningResource',
  learningResourceType: e.collection === 'lecciones' || e.collection === 'leccionesCurso' ? 'lección' : 'curso',
  ...(o.nivel ? { educationalLevel: o.nivel } : {}),
  ...(o.minutos ? { timeRequired: `PT${o.minutos}M` } : o.horas ? { timeRequired: `PT${o.horas}H` } : {}),
  isAccessibleForFree: true,
});

export const ldTermino = (e: CollectionEntry<'glosario'>) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: e.data.titulo,
  description: e.data.descripcion,
  url: abs(urlDe(e)),
  inLanguage: 'es',
  ...(e.data.aliases.length ? { alternateName: e.data.aliases } : {}),
  inDefinedTermSet: { '@type': 'DefinedTermSet', name: `Glosario de ${SITIO.nombre}`, url: abs('/glosario/') },
});

export const ldColeccion = (titulo: string, descripcion: string, ruta: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: titulo,
  description: descripcion,
  url: abs(ruta),
  inLanguage: 'es',
  isPartOf: { '@type': 'WebSite', name: SITIO.nombre, url: SITIO.url },
});
