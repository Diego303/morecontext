// Mapa: resalta las conexiones de la nota bajo el ratón y filtra por sección.
const svg = document.querySelector<SVGSVGElement>('svg[data-mapa]');
if (svg) {
  const lineas = [...svg.querySelectorAll<SVGLineElement>('.aristas line')];
  const nodos = [...svg.querySelectorAll<SVGAElement>('.nodos a')];
  const vecinos = new Map<string, Set<string>>();
  for (const l of lineas) {
    const { a, b } = l.dataset as { a: string; b: string };
    (vecinos.get(a) ?? vecinos.set(a, new Set()).get(a)!).add(b);
    (vecinos.get(b) ?? vecinos.set(b, new Set()).get(b)!).add(a);
  }
  const limpiar = () => { svg.classList.remove('foco'); svg.querySelectorAll('.on').forEach((x) => x.classList.remove('on')); };
  svg.addEventListener('pointerover', (e) => {
    const a = (e.target as Element).closest<SVGAElement>('.nodos a');
    if (!a) return;
    limpiar();
    const url = a.dataset.url!;
    const cerca = vecinos.get(url) ?? new Set();
    svg.classList.add('foco');
    a.classList.add('on');
    nodos.forEach((n) => { if (cerca.has(n.dataset.url!)) n.classList.add('on'); });
    lineas.forEach((l) => { if (l.dataset.a === url || l.dataset.b === url) l.classList.add('on'); });
  });
  svg.addEventListener('pointerleave', limpiar);

  document.querySelector('[data-mapa-filtros]')?.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-s]');
    if (!b) return;
    b.parentElement?.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const s = b.dataset.s!;
    svg.classList.toggle('filtrado', s !== '');
    nodos.forEach((n) => n.classList.toggle('sel', s !== '' && n.dataset.s === s));
  });
}
export {};
