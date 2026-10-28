// Navegación lateral (DocsLayout) y orden de lectura de roadmap, cursos y documentación.
import type { CollectionEntry } from 'astro:content';
import { publicados, porOrden, padreDe, urlDe } from './contenido';
import type { NavegacionSeccion } from '../components/entrada/NavSeccion.astro';

/** Niveles del roadmap ordenados por número, cada uno con sus lecciones en orden. */
export async function temarioRoadmap() {
  const niveles = (await publicados('niveles')).sort((a, b) => a.data.nivel - b.data.nivel);
  const lecciones = (await publicados('lecciones')).sort(porOrden);
  return niveles.map((nivel) => ({ nivel, lecciones: lecciones.filter((l) => padreDe(l.id) === nivel.id) }));
}

/** Cursos en orden, cada uno con sus lecciones. */
export async function temarioCursos() {
  const cursos = (await publicados('cursos')).sort(porOrden);
  const lecciones = (await publicados('leccionesCurso')).sort(porOrden);
  return cursos.map((curso) => ({ curso, lecciones: lecciones.filter((l) => padreDe(l.id) === curso.id) }));
}

/** Grupos de documentación en orden, con sus artículos. */
export async function temarioDocs() {
  const grupos = (await publicados('docsGrupos')).sort(porOrden);
  const docs = (await publicados('docs')).sort(porOrden);
  return grupos.map((grupo) => ({ grupo, docs: docs.filter((d) => padreDe(d.id) === grupo.id) }));
}

/** Id de progreso de una lección: «roadmap/40-primer-agente/el-bucle-agentico» (roadmap y cursos no chocan). */
export const idLeccion = (e: CollectionEntry<'lecciones' | 'leccionesCurso'>) =>
  `${e.collection === 'lecciones' ? 'roadmap' : 'cursos'}/${e.id}`;

/** Número de nivel con dos cifras como en las carpetas: 0 → «00», 100 → «100». */
export const numNivel = (n: number) => String(n).padStart(2, '0');

export async function navRoadmap(): Promise<NavegacionSeccion> {
  const temario = await temarioRoadmap();
  return {
    titulo: 'Roadmap 0→100',
    grupos: temario.map(({ nivel, lecciones }) => ({
      titulo: `${numNivel(nivel.data.nivel)} · ${nivel.data.titulo.replace(/^Nivel \d+ · /, '')}`,
      href: urlDe(nivel),
      hrefTexto: 'Ficha del nivel',
      items: lecciones.map((l) => ({ href: urlDe(l), titulo: l.data.titulo, leccion: idLeccion(l) })),
    })),
  };
}

export async function navCurso(cursoId: string): Promise<NavegacionSeccion> {
  const t = (await temarioCursos()).find((x) => x.curso.id === cursoId);
  if (!t) throw new Error(`Curso desconocido: ${cursoId}`);
  return {
    titulo: t.curso.data.titulo,
    grupos: [{
      titulo: t.curso.data.titulo,
      href: urlDe(t.curso),
      items: t.lecciones.map((l) => ({ href: urlDe(l), titulo: l.data.titulo, leccion: idLeccion(l) })),
    }],
  };
}

export async function navDocs(): Promise<NavegacionSeccion> {
  const temario = await temarioDocs();
  return {
    titulo: 'Documentación',
    grupos: temario.map(({ grupo, docs }) => ({
      titulo: grupo.data.titulo,
      href: urlDe(grupo),
      hrefTexto: 'Introducción',
      items: docs.map((d) => ({ href: urlDe(d), titulo: d.data.titulo })),
    })),
  };
}
