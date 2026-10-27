// Dibuja los ```mermaid solo en las páginas que los tienen (carga diferida de la librería).
// La librería se descarga y cada diagrama se dibuja cuando está a punto de entrar en pantalla:
// así no bloquea la carga ni desplaza contenido visible.
const nodos = document.querySelectorAll<HTMLElement>('pre.mermaid');
type Mermaid = typeof import('mermaid')['default'];
let cargada: Promise<Mermaid> | null = null;

function cargar(): Promise<Mermaid> {
  cargada ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      layout: 'dagre',   // el motor clásico; ELK (1,4 MB) no hace falta para estos diagramas
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: {
        darkMode: true,
        background: '#0f0f11',
        fontFamily: '"JetBrains Mono Variable", ui-monospace, monospace',
        fontSize: '13px',
        primaryColor: '#0a0a0a',
        primaryTextColor: '#f4f4f5',
        primaryBorderColor: '#3f3f46',
        secondaryColor: '#18181b',
        tertiaryColor: '#18181b',
        lineColor: '#71717a',
        textColor: '#d4d4d8',
        edgeLabelBackground: '#0f0f11',
        clusterBkg: '#18181b',
        clusterBorder: '#27272a',
        noteBkgColor: '#1f1f23',
        noteTextColor: '#f4f4f5',
        noteBorderColor: '#fde047',
        actorBkg: '#0a0a0a',
        actorBorder: '#3f3f46',
        actorTextColor: '#f4f4f5',
        signalColor: '#a1a1aa',
        signalTextColor: '#d4d4d8',
      },
    });
    return mermaid;
  });
  return cargada;
}

if (nodos.length) {
  const io = new IntersectionObserver((entradas) => {
    const visibles = entradas.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
    if (!visibles.length) return;
    visibles.forEach((n) => io.unobserve(n));
    void cargar().then((mermaid) => mermaid.run({ nodes: visibles }));
  }, { rootMargin: '200px 0px' });
  nodos.forEach((n) => io.observe(n));
}
export {};
