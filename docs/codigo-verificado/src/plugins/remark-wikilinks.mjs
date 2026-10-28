// [[ruta]], [[ruta|texto]], [[ruta#ancla|texto]], ![[imagen.png]] y enlaces .md relativos → URLs del sitio.
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import { visit, SKIP } from 'unist-util-visit';
import { resolverWikilink, RAIZ_CONTENIDO } from '../lib/indice-contenido.mjs';
import { urlDeArchivo } from '../lib/rutas.mjs';

const ES_PROD = process.env.NODE_ENV === 'production';
const RE = /(!?)\[\[([^\]|#]+)(#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;
const anclaASlug = (a) => '#' + new GithubSlugger().slug(a.replace(/^#/, ''));

export default function remarkWikilinks() {
  return (tree, file) => {
    // 1) Enlaces markdown a archivos .md relativos (estilo Obsidian/GitHub)
    visit(tree, 'link', (node) => {
      if (/^[a-z]+:|^#|^\//i.test(node.url)) return;
      const [ruta, ancla] = node.url.split('#');
      if (!ruta.endsWith('.md') || !file.path) return;
      const abs = path.resolve(path.dirname(file.path), decodeURI(ruta));
      const rel = path.relative(RAIZ_CONTENIDO, abs);
      if (rel.startsWith('..')) return;
      node.url = urlDeArchivo(rel) + (ancla ? anclaASlug(ancla) : '');
    });

    // 2) Wikilinks dentro de texto (no dentro de enlaces ni código)
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined || parent.type === 'link' || !node.value.includes('[[')) return;
      const nuevos = [];
      let ultimo = 0, m;
      RE.lastIndex = 0;
      while ((m = RE.exec(node.value))) {
        const [todo, bang, destino, ancla, alias] = m;
        if (m.index > ultimo) nuevos.push({ type: 'text', value: node.value.slice(ultimo, m.index) });
        if (bang && /\.(png|jpe?g|gif|svg|webp|avif)$/i.test(destino)) {
          // ![[archivo.png]] → imagen en contenido/_adjuntos
          const absImg = path.join(RAIZ_CONTENIDO, '_adjuntos', destino.trim());
          const relImg = path.relative(path.dirname(file.path ?? RAIZ_CONTENIDO), absImg).replace(/\\/g, '/');
          nuevos.push({ type: 'image', url: relImg.startsWith('.') ? relImg : './' + relImg, alt: alias?.trim() ?? '' });
        } else {
          const encontrado = resolverWikilink(destino);
          // en producción, un enlace a un borrador se muestra como «aún no existe»
          const r = encontrado && !(ES_PROD && encontrado.estado === 'borrador') ? encontrado : null;
          const texto = alias?.trim() || r?.titulo || destino.trim();
          if (r) {
            nuevos.push({ type: 'link', url: r.url + (ancla ? anclaASlug(ancla) : ''),
              data: { hProperties: { className: ['wikilink'] } }, children: [{ type: 'text', value: texto }] });
          } else {
            file.message(`Wikilink sin destino: [[${destino}]]`, node);
            nuevos.push({ type: 'text', value: texto,
              data: { hName: 'span', hProperties: { className: ['wikilink', 'wikilink--roto'], title: `Aún no existe: ${destino}` } } });
          }
        }
        ultimo = m.index + todo.length;
      }
      if (!nuevos.length) return;
      if (ultimo < node.value.length) nuevos.push({ type: 'text', value: node.value.slice(ultimo) });
      parent.children.splice(index, 1, ...nuevos);
      return [SKIP, index + nuevos.length];
    });
  };
}
