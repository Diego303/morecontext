// Retroenlaces («enlazado desde»): quién apunta a cada URL con [[wikilinks]] o relacionados.
import type { CollectionKey } from 'astro:content';
import { publicados, urlDe } from './contenido';
import { resolverWikilink, destinoDeWikilink } from './indice-contenido.mjs';

const COLECCIONES: CollectionKey[] = ['secciones', 'niveles', 'lecciones', 'cursos', 'leccionesCurso', 'docsGrupos', 'docs',
  'modelos', 'sistemas', 'patrones', 'disciplinas', 'recetas', 'glosario', 'radar', 'blog', 'boletin', 'paginas',
  'problemas', 'plantillas', 'biblioteca', 'herramientas', 'comunidad'];
const RE = /(?<!!)\[\[([^\]|#\\]+)(?:#[^\]|\\]+)?\\?(?:\|[^\]]+)?\]\]/g; // admite \| en tablas

type Ref = { url: string; titulo: string; seccion: string };
let mapa: Map<string, Ref[]> | null = null;

export async function retroenlaces(urlDestino: string): Promise<Ref[]> {
  if (!mapa) {
    mapa = new Map();
    for (const col of COLECCIONES) {
      for (const e of await publicados(col)) {
        const origen: Ref = { url: urlDe(e), titulo: e.data.titulo, seccion: urlDe(e).split('/')[1] ?? '' };
        const cuerpo = (e.body ?? '').replace(/```[\s\S]*?```/g, '');
        const destinos = new Set<string>();
        for (const m of cuerpo.matchAll(RE)) destinos.add(m[1].trim());
        for (const v of (e.data as { relacionados?: string[] }).relacionados ?? []) destinos.add(destinoDeWikilink(v));
        for (const d of destinos) {
          const r = resolverWikilink(d);
          if (!r || r.url === origen.url) continue;
          const lista = mapa.get(r.url) ?? [];
          if (!lista.some((x) => x.url === origen.url)) lista.push(origen);
          mapa.set(r.url, lista);
        }
      }
    }
  }
  return (mapa.get(urlDestino) ?? []).sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
}
