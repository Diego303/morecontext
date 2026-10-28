// Envuelve cada bloque de código en <div class="code"> y agrupa en pestañas los bloques
// consecutivos con tab="…". Los bloques ```mermaid pasan como <pre class="mermaid">.
//   ```python tab="Python" title="agente.py"
const leerMeta = (meta) => Object.fromEntries(
  [...(meta ?? '').matchAll(/(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g)].map((m) => [m[1], m[2] ?? m[3] ?? m[4]]));
const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const panel = (code, meta) => ({
  type: 'panelCodigo',
  data: { hName: 'div', hProperties: { className: ['code__panel'], dataTab: meta.tab ?? '', dataFile: meta.title ?? '', dataLang: code.lang ?? 'text' } },
  children: [code],
});
const contenedor = (paneles, conPestanas) => ({
  type: 'bloqueCodigo',
  data: { hName: 'div', hProperties: { className: conPestanas ? ['code', 'code--tabs'] : ['code'] } },
  children: paneles,
});

function transformar(parent) {
  if (!parent.children) return;
  const out = [];
  for (let i = 0; i < parent.children.length; i++) {
    const n = parent.children[i];
    if (n.type !== 'code') { transformar(n); out.push(n); continue; }
    if (n.lang === 'mermaid') { out.push({ type: 'html', value: `<pre class="mermaid">${escapar(n.value)}</pre>` }); continue; }
    const meta = leerMeta(n.meta);
    if (meta.tab) {
      const grupo = [panel(n, meta)];
      while (parent.children[i + 1]?.type === 'code' && leerMeta(parent.children[i + 1].meta).tab) {
        const sig = parent.children[++i];
        grupo.push(panel(sig, leerMeta(sig.meta)));
      }
      out.push(contenedor(grupo, true));
    } else out.push(contenedor([panel(n, meta)], false));
  }
  parent.children = out;
}

export default function remarkBloquesCodigo() {
  return (tree) => transformar(tree);
}
