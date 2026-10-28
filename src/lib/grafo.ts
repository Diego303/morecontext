// Grafo de notas para /mapa/: nodos = entradas publicadas, aristas = [[wikilinks]] del cuerpo y «relacionados».
// La disposición se calcula en el build con una simulación de fuerzas determinista (Fruchterman–Reingold).
import { CARPETA, publicados, urlDe } from './contenido';
import { COLECCIONES } from './etiquetas';
import { destinoDeWikilink, resolverWikilink } from './indice-contenido.mjs';

const RE = /(?<!!)\[\[([^\]|#\\]+)(?:#[^\]|\\]+)?\\?(?:\|[^\]]+)?\]\]/g;
export type Nodo = { url: string; titulo: string; seccion: string; x: number; y: number; grado: number };

export async function grafo(ancho = 1000, alto = 680) {
  const nodos = new Map<string, Nodo>();
  const pares = new Set<string>();
  const cuerpos: [string, string, string[]][] = [];
  for (const col of COLECCIONES) for (const e of await publicados(col)) {
    const url = urlDe(e);
    const seccion = col === 'secciones' ? e.id : col === 'paginas' ? '' : CARPETA[col];
    nodos.set(url, { url, titulo: e.data.titulo, seccion, x: 0, y: 0, grado: 0 });
    cuerpos.push([url, (e.body ?? '').replace(/```[\s\S]*?```/g, ''), (e.data as { relacionados?: string[] }).relacionados ?? []]);
  }
  for (const [origen, cuerpo, rel] of cuerpos) {
    const destinos = new Set([...cuerpo.matchAll(RE)].map((m) => m[1].trim()).concat(rel.map(destinoDeWikilink)));
    for (const d of destinos) {
      const r = resolverWikilink(d);
      if (!r || r.url === origen || !nodos.has(r.url)) continue;
      pares.add([origen, r.url].sort().join('|'));
    }
  }
  const lista = [...nodos.values()];
  const aristas = [...pares].map((p) => p.split('|') as [string, string]);
  for (const [a, b] of aristas) { nodos.get(a)!.grado++; nodos.get(b)!.grado++; }

  // Posición inicial: cada sección en su sector de un círculo (determinista)
  const secciones = [...new Set(lista.map((n) => n.seccion))].sort();
  lista.forEach((n, i) => {
    const s = secciones.indexOf(n.seccion);
    const ang = (2 * Math.PI * (s + (i % 7) / 8)) / secciones.length;
    const rad = 120 + ((i * 37) % 160);
    n.x = ancho / 2 + rad * Math.cos(ang);
    n.y = alto / 2 + rad * Math.sin(ang);
  });

  // Fruchterman–Reingold
  const k = Math.sqrt((ancho * alto) / lista.length) * 0.9;
  const idx = new Map(lista.map((n, i) => [n.url, i]));
  const ar = aristas.map(([a, b]) => [idx.get(a)!, idx.get(b)!]);
  let temp = ancho / 8;
  for (let it = 0; it < 320; it++) {
    const dx = new Float64Array(lista.length), dy = new Float64Array(lista.length);
    for (let i = 0; i < lista.length; i++) for (let j = i + 1; j < lista.length; j++) {
      let ex = lista[i].x - lista[j].x, ey = lista[i].y - lista[j].y;
      const d = Math.max(0.01, Math.hypot(ex, ey)), f = (k * k) / d;
      ex /= d; ey /= d;
      dx[i] += ex * f; dy[i] += ey * f; dx[j] -= ex * f; dy[j] -= ey * f;
    }
    for (const [i, j] of ar) {
      let ex = lista[i].x - lista[j].x, ey = lista[i].y - lista[j].y;
      const d = Math.max(0.01, Math.hypot(ex, ey)), f = (d * d) / k;
      ex /= d; ey /= d;
      dx[i] -= ex * f; dy[i] -= ey * f; dx[j] += ex * f; dy[j] += ey * f;
    }
    for (let i = 0; i < lista.length; i++) {
      // gravedad suave hacia el centro para que los nodos sueltos no se escapen
      dx[i] += (ancho / 2 - lista[i].x) * 0.02 * k / 10; dy[i] += (alto / 2 - lista[i].y) * 0.02 * k / 10;
      const d = Math.max(0.01, Math.hypot(dx[i], dy[i])), paso = Math.min(d, temp);
      lista[i].x += (dx[i] / d) * paso; lista[i].y += (dy[i] / d) * paso;
    }
    temp *= 0.985;
  }
  // Encajar en el lienzo con margen
  const m = 24, xs = lista.map((n) => n.x), ys = lista.map((n) => n.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (const n of lista) {
    n.x = m + ((n.x - x0) / (x1 - x0 || 1)) * (ancho - 2 * m);
    n.y = m + ((n.y - y0) / (y1 - y0 || 1)) * (alto - 2 * m);
  }
  return { nodos: lista, aristas, secciones };
}
