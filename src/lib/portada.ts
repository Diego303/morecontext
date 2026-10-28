// Datos de la portada «El índice»: todo se calcula del contenido (nada de cifras escritas a mano).
import { getEntry, render, type CollectionEntry, type CollectionKey } from 'astro:content';
import { esNuevo, fecha, minutosLectura, porFechaDesc, porOrden, porTitulo, publicados, urlDe } from './contenido';
import { resolverWikilink } from './indice-contenido.mjs';
import { COLECCIONES, indiceTags, urlDeTag } from './etiquetas';
import { numNivel, temarioCursos, temarioDocs, temarioRoadmap } from './navegacion';
import { apendicesVisibles, datoDe } from './apendices';

export type Linea = { n: string; t: string; href: string; d?: string; dots?: { valor: number; etiqueta: string }; nuevo?: boolean; k?: string };
export type Capitulo = { n: string; t: string; href: string; d: string; lineas: Linea[]; nota?: string };
export type Parte = { id: string; num: string; titulo: string; texto: string; capitulos: Capitulo[] };

const corta = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fechaCorta = (d: Date) => corta.format(d).replace('.', '');
const claves = (e: CollectionEntry<CollectionKey>) => [...e.data.tags, ...e.data.aliases].join(' ').toLowerCase();

/** Markdown en línea → texto plano (wikilinks con su texto o título, sin énfasis ni código). */
export function textoPlano(md: string): string {
  return md
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?\]\]/g, (_, d: string) => resolverWikilink(d)?.titulo ?? d)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g, (_, a, b, c) => a ?? b ?? c)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Párrafos de la sección que empieza en `## titulo` o `### titulo` (hasta el siguiente encabezado). */
export function seccion(cuerpo: string, titulo: string): string[] {
  const lineas = cuerpo.split('\n');
  const i = lineas.findIndex((l) => /^#{2,3} /.test(l) && l.replace(/^#+ /, '').trim() === titulo);
  if (i < 0) return [];
  const fin = lineas.findIndex((l, j) => j > i && /^#{2,3} /.test(l));
  return lineas.slice(i + 1, fin < 0 ? undefined : fin).join('\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
const primeraFrase = (s: string) => (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).trim();

export async function datosPortada() {
  // ---------- Cifras ----------
  const roadmap = await temarioRoadmap();
  const cursos = await temarioCursos();
  const docs = await temarioDocs();
  const modelos = (await publicados('modelos')).sort(porOrden);
  const glosario = (await publicados('glosario')).sort(porTitulo);
  const sistemas = (await publicados('sistemas')).sort(porOrden);
  const patrones = (await publicados('patrones')).sort(porOrden);
  const recetas = (await publicados('recetas')).sort(porTitulo);
  const disciplinas = (await publicados('disciplinas')).sort(porOrden);
  const radar = (await publicados('radar')).sort(porFechaDesc);
  const blog = (await publicados('blog')).sort(porFechaDesc);
  const boletin = (await publicados('boletin')).sort((a, b) => b.data.numero - a.data.numero);
  const lecciones = roadmap.reduce((n, t) => n + t.lecciones.length, 0);
  const horas = roadmap.reduce((n, t) => n + t.nivel.data.horas, 0);

  // Fecha de la última revisión: el máximo de «actualizado» o «creado» de todo el contenido
  let revisado = new Date(0);
  for (const col of COLECCIONES)
    for (const e of await publicados(col)) {
      const f = (e.data as { actualizado?: Date }).actualizado ?? e.data.creado;
      if (f > revisado) revisado = f;
    }

  // ---------- Empieza aquí: rutas del texto real ----------
  const empieza = (await getEntry('paginas', 'empieza-aqui'))!;
  const { headings } = await render(empieza);
  const iRutas = headings.findIndex((h) => h.depth === 2 && h.text === 'Rutas por perfil');
  const rutasH = headings.slice(iRutas + 1).filter((h, i, a) => h.depth === 3 && !a.slice(0, i).some((x) => x.depth === 2));
  // Secuencias según los pasos de cada ruta en contenido/paginas/empieza-aqui.md
  const SECUENCIA = [['00', '10'], ['20', 'patrones', '40'], ['80', 'recetas', '100'], ['costes', 'patrones', 'disciplinas']];
  const rutas = rutasH.slice(0, 4).map((h, i) => ({
    letra: 'ABCD'[i],
    titulo: h.text,
    href: `${urlDe(empieza)}#${h.slug}`,
    secuencia: SECUENCIA[i] ?? [],
    texto: textoPlano(seccion(empieza.body ?? '', h.text)[0] ?? ''),
  }));
  const test = headings.find((h) => h.depth === 2 && h.text === 'Test de nivel');
  const urlTest = test ? `${urlDe(empieza)}#${test.slug}` : urlDe(empieza);

  // ---------- Partes I–V ----------
  const nombreNivel = (t: string) => t.replace(/^Nivel \d+ · /, '');
  const CATEGORIAS: Record<string, string> = { fundamentos: 'Fundamentos', prompting: 'Prompting', herramientas: 'Herramientas', contexto: 'Contexto', agentes: 'Agentes', evals: 'Evals', produccion: 'Producción', seguridad: 'Seguridad' };
  const TIPO_BLOG: Record<string, string> = { ensayo: 'ensayo', analisis: 'análisis', 'nota-de-campo': 'nota de campo', tutorial: 'tutorial' };
  const disc = disciplinas.filter((e) => e.data.tipo === 'disciplina');
  const formas = disciplinas.filter((e) => e.data.tipo === 'forma-de-trabajar');

  const partes: Parte[] = [
    {
      id: 'parte-1', num: 'I', titulo: 'Aprender',
      texto: 'De cero a construir con criterio, en orden. Cada nivel acaba en un proyecto que funciona.',
      capitulos: [
        {
          n: '1', t: 'Empieza aquí', href: urlDe(empieza), d: `${rutas.length + 1} entradas`,
          lineas: [
            { n: '1.1', t: 'Test de nivel', href: urlTest, d: '3 preguntas', k: 'nivel test examen' },
            ...rutas.map((r, i) => ({ n: `1.${i + 2}`, t: r.titulo, href: r.href, d: `ruta ${r.letra}`, k: 'ruta empezar' })),
          ],
        },
        {
          n: '2', t: 'Roadmap 0→100', href: '/roadmap/', d: `${lecciones} lec · ~${horas} h`,
          nota: 'no te saltes el 20: todo lo que viene después son herramientas',
          lineas: roadmap.map(({ nivel, lecciones: l }) => ({
            n: numNivel(nivel.data.nivel), t: nombreNivel(nivel.data.titulo), href: urlDe(nivel),
            d: `${l.length} lec · ${nivel.data.horas} h`, nuevo: esNuevo(nivel), k: claves(nivel),
          })),
        },
        {
          n: '3', t: 'Cursos específicos', href: '/cursos/', d: `${cursos.length} cursos`,
          lineas: cursos.map(({ curso, lecciones: l }, i) => ({
            n: `3.${i + 1}`, t: curso.data.titulo, href: urlDe(curso), d: `${l.length} lec · ${curso.data.horas} h`, nuevo: esNuevo(curso), k: claves(curso),
          })),
        },
      ],
    },
    {
      id: 'parte-2', num: 'II', titulo: 'Consultar',
      texto: 'Referencia para volver cuando te haga falta. No se lee de corrido: se busca.',
      capitulos: [
        {
          n: '4', t: 'Documentación', href: '/docs/', d: `${docs.length} temas`,
          lineas: docs.map(({ grupo, docs: d }, i) => ({ n: `4.${i + 1}`, t: grupo.data.titulo, href: urlDe(grupo), d: `${d.length} artículos`, nuevo: esNuevo(grupo), k: claves(grupo) })),
        },
        {
          n: '5', t: 'Guía de modelos', href: '/modelos/', d: `${modelos.length} guías`,
          lineas: modelos.map((e, i) => ({ n: `5.${i + 1}`, t: e.data.titulo, href: urlDe(e), d: `${minutosLectura(e.body)} min`, nuevo: esNuevo(e), k: claves(e) })),
        },
        {
          n: '6', t: 'Glosario', href: '/glosario/', d: `${glosario.length} términos`,
          lineas: Object.entries(CATEGORIAS)
            .map(([c, nombre], i) => ({ n: `6.${i + 1}`, t: nombre, href: `/glosario/#cat-${c}`, d: `${glosario.filter((g) => g.data.categoria === c).length} términos`, k: glosario.filter((g) => g.data.categoria === c).map((g) => g.data.titulo).join(' ').toLowerCase() }))
            .filter((l) => !l.d.startsWith('0 ')),
        },
      ],
    },
    {
      id: 'parte-3', num: 'III', titulo: 'Construir',
      texto: `Arquitecturas completas, los ${patrones.length} patrones de agentes y recetas con código para copiar.`,
      capitulos: [
        {
          n: '7', t: 'Sistemas de referencia', href: '/sistemas/', d: `${sistemas.length} arquitecturas`,
          lineas: sistemas.map((e, i) => ({ n: `7.${i + 1}`, t: e.data.titulo, href: urlDe(e), d: e.data.tiempo, dots: { valor: e.data.complejidad, etiqueta: 'Complejidad' }, nuevo: esNuevo(e), k: claves(e) })),
        },
        {
          n: '8', t: 'Patrones de agentes', href: '/patrones/', d: `${patrones.length} patrones`,
          lineas: patrones.map((e, i) => ({ n: `8.${i + 1}`, t: e.data.titulo, href: urlDe(e), d: e.data.tipo, nuevo: esNuevo(e), k: claves(e) })),
        },
        {
          n: '9', t: 'Recetas', href: '/recetas/', d: `${recetas.length} recetas`,
          lineas: recetas.map((e, i) => ({ n: `9.${i + 1}`, t: e.data.titulo, href: urlDe(e), d: `${e.data.minutos} min`, nuevo: esNuevo(e), k: claves(e) })),
        },
      ],
    },
    {
      id: 'parte-4', num: 'IV', titulo: 'Trabajar',
      texto: 'Las disciplinas que separan una demo de un sistema, y formas de trabajar con un agente al lado.',
      capitulos: [
        {
          n: '10', t: 'Disciplinas', href: '/disciplinas/#h-disciplina', d: `${disc.length} disciplinas`,
          lineas: disc.map((e, i) => ({ n: `10.${i + 1}`, t: e.data.titulo, href: urlDe(e), nuevo: esNuevo(e), k: claves(e) })),
        },
        {
          n: '11', t: 'Formas de trabajar', href: '/disciplinas/#h-forma-de-trabajar', d: `${formas.length} formas`,
          lineas: formas.map((e, i) => ({ n: `11.${i + 1}`, t: e.data.titulo, href: urlDe(e), nuevo: esNuevo(e), k: claves(e) })),
        },
      ],
    },
    {
      id: 'parte-5', num: 'V', titulo: 'Estar al día',
      texto: 'Solo lo que cambia cómo construyes. Qué es, qué cambia y qué hacer.',
      capitulos: [
        {
          n: '12', t: 'Radar', href: '/radar/', d: `${radar.length} notas`,
          lineas: radar.slice(0, 5).map((e, i) => ({ n: `12.${i + 1}`, t: e.data.titulo, href: urlDe(e), d: fechaCorta(e.data.creado), nuevo: esNuevo(e), k: claves(e) })),
        },
        {
          n: '13', t: 'Blog y ensayos', href: '/blog/', d: `${blog.length} entradas`,
          lineas: blog.slice(0, 5).map((e, i) => ({ n: `13.${i + 1}`, t: e.data.titulo, href: urlDe(e), d: `${fechaCorta(e.data.creado)} · ${TIPO_BLOG[e.data.tipo]}`, nuevo: esNuevo(e), k: claves(e) })),
        },
        {
          n: '14', t: 'Boletín', href: '/boletin/', d: `${boletin.length} envíos`,
          lineas: boletin.slice(0, 3).map((e, i) => ({ n: `14.${i + 1}`, t: e.data.titulo, href: urlDe(e), d: `n.º ${e.data.numero} · ${fechaCorta(e.data.creado)}`, nuevo: esNuevo(e), k: 'boletin correo newsletter' })),
        },
      ],
    },
  ];

  // ---------- Apéndices: solo páginas que existen ----------
  const secciones = async (id: string) => {
    const e = await getEntry('paginas', id);
    if (!e) return null;
    const { headings: hs } = await render(e);
    return { e, hs: hs.filter((h) => h.depth === 2) };
  };
  const apendicesPaginas = (await Promise.all(['manifiesto', 'contribuir', 'sobre', 'licencia'].map(secciones))).filter((x) => x !== null);
  const tags = [...(await indiceTags())].sort((a, b) => b[1].entradas.length - a[1].entradas.length);
  const visibles = await apendicesVisibles();
  let notas = 0;
  for (const col of COLECCIONES) notas += (await publicados(col)).length;
  const letras = 'ABCDEFGHIJKLMNOP';
  // Sin letra: se numeran al final, en orden
  const sinLetra: Omit<Capitulo, 'n'>[] = [
    ...apendicesPaginas.map(({ e, hs }) => ({
      t: e.data.titulo, href: urlDe(e), d: `${minutosLectura(e.body)} min`,
      lineas: hs.slice(0, 4).map((h) => ({ n: '', t: h.text, href: `${urlDe(e)}#${h.slug}`, k: claves(e) })),
    })),
    // Secciones del backlog con contenido publicado (fase 13)
    ...visibles.map(({ portadilla, entradas }) => ({
      t: portadilla.data.titulo, href: urlDe(portadilla), d: `${entradas.length} ${entradas.length === 1 ? 'entrada' : 'entradas'}`,
      lineas: entradas.slice(0, 4).map((e) => ({ n: '', t: e.data.titulo, href: urlDe(e), d: datoDe(e), nuevo: esNuevo(e), k: claves(e) })),
    })),
    { t: 'Laboratorio', href: '/laboratorio/', d: 'en el navegador', lineas: [{ n: '', t: 'Calculadora de tokens y costes', href: '/laboratorio/', d: 'tus precios', k: 'tokens costes precio calculadora' }] },
    { t: 'Mapa de notas', href: '/mapa/', d: `${notas} notas`, lineas: [] },
    {
      t: 'Etiquetas', href: '/tags/', d: `${tags.length} etiquetas`,
      lineas: tags.slice(0, 4).map(([slug, g]) => ({ n: '', t: `#${g.nombre}`, href: urlDeTag(slug), d: `${g.entradas.length} páginas`, k: g.nombre })),
    },
    { t: 'RSS', href: '/rss.xml', d: 'blog · radar · boletín', lineas: [] },
  ];
  const apendices: Capitulo[] = sinLetra.map((c, i) => ({ ...c, n: letras[i], lineas: c.lineas.map((l, j) => ({ ...l, n: `${letras[i]}.${j + 1}` })) }));

  // ---------- Manifiesto en corto (texto de contenido/paginas/manifiesto.md) ----------
  const mani = (await getEntry('paginas', 'manifiesto'))!;
  const principios = seccion(mani.body ?? '', 'Principios').join('\n').split('\n').filter((l) => /^\d+\. /.test(l));
  const principio = (nombre: string) => {
    const l = principios.find((x) => x.includes(`**${nombre}.**`));
    return l ? textoPlano(l.replace(/^\d+\. \*\*[^*]+\*\*\s*/, '')) : '';
  };
  const financia = seccion(mani.body ?? '', 'Cómo se financia').map((p) => primeraFrase(textoPlano(p))).slice(0, 2).join(' ');
  const manifiesto = [
    { n: '§1', t: 'Gratis', p: 'Todo se lee sin registro y sin muro de pago. Tu progreso se guarda en tu navegador, no en una cuenta.' },
    { n: '§2', t: 'Abierto', p: principio('Abierto') },
    { n: '§3', t: 'Sin humo', p: principio('Sin humo') },
    { n: '§4', t: 'Cómo se financia', p: financia },
  ].filter((b) => b.p);

  // ---------- Últimos escritos ----------
  const destacado = blog.find((e) => e.data.destacado) ?? blog[0];
  const anteriores = blog.filter((e) => e !== destacado).slice(0, 3);

  const capitulos = partes.reduce((n, p) => n + p.capitulos.length, 0);
  const entradas = [...partes.flatMap((p) => p.capitulos), ...apendices].reduce((n, c) => n + c.lineas.length, 0);

  return {
    cifras: { niveles: roadmap.length, lecciones, horas, terminos: glosario.length, revisado, revisadoTexto: fecha(revisado) },
    rutas, urlTest, partes, apendices, manifiesto, urlManifiesto: urlDe(mani),
    escritos: { destacado, anteriores, tipo: TIPO_BLOG, ultimoBoletin: boletin[0] },
    colofon: { capitulos, apendices: apendices.length, entradas },
    fechaCorta,
  };
}
