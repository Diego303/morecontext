// Anclas «#» en los encabezados, marcador del índice «En esta página» que sigue el scroll
// y contorno que se desvanece al llegar a un ancla.

// 1) Anclas visibles al pasar el ratón (y con el foco)
document.querySelectorAll<HTMLElement>('.prosa :is(h2, h3)[id]').forEach((h) => {
  const a = document.createElement('a');
  a.className = 'ancla';
  a.href = `#${h.id}`;
  a.textContent = '#';
  a.setAttribute('aria-label', `Enlace a «${h.textContent?.trim()}»`);
  h.append(a);
});

// 2) Índice: resalta la sección visible y mueve el marcador
const toc = document.querySelector<HTMLElement>('.toc .toc-l');
const marcador = toc?.querySelector<HTMLElement>('.marker');
const enlaces = toc ? [...toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')] : [];
if (toc && marcador && enlaces.length) {
  const porId = new Map(enlaces.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const objetivos = [...porId.keys()].map((id) => document.getElementById(id)).filter((x): x is HTMLElement => !!x);
  const visibles = new Set<string>();
  const activar = (id: string) => {
    const a = porId.get(id);
    if (!a) return;
    enlaces.forEach((x) => x.classList.toggle('on', x === a));
    marcador.hidden = false;
    marcador.style.top = `${a.offsetTop + (a.offsetHeight - marcador.offsetHeight) / 2}px`;
  };
  const io = new IntersectionObserver((entradas) => {
    for (const en of entradas) en.isIntersecting ? visibles.add(en.target.id) : visibles.delete(en.target.id);
    // El primero visible; si no hay ninguno, el último que quedó por encima
    const primero = objetivos.find((o) => visibles.has(o.id))
      ?? [...objetivos].reverse().find((o) => o.getBoundingClientRect().top < 120);
    if (primero) activar(primero.id);
  }, { rootMargin: '-80px 0px -60% 0px' });
  objetivos.forEach((o) => io.observe(o));
}

// Tablas con scroll horizontal: enfocables para poder moverlas con el teclado
document.querySelectorAll<HTMLElement>('.prosa table').forEach((t) => { if (t.scrollWidth > t.clientWidth) t.tabIndex = 0; });

// 3) Llegar a un ancla: contorno discontinuo que se desvanece (DISENO §14)
function destacar(hash: string) {
  if (hash.length < 2) return;
  const t = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!t || t.id === 'main') return;
  t.classList.remove('fade');
  t.classList.add('is-target');
  setTimeout(() => t.classList.add('fade'), 400);
  setTimeout(() => t.classList.remove('is-target', 'fade'), 2100);
}
addEventListener('hashchange', () => destacar(location.hash));
if (location.hash) destacar(location.hash);

export {};
