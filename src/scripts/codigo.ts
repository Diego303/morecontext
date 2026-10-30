// Bloques de código generados por remark-bloques-codigo: barra con pestañas/archivo + botón Copiar.
// Las pestañas se sincronizan en toda la web por su etiqueta («Python», «TypeScript», «LangGraph»…).
// Se recuerdan varias etiquetas por orden de uso (la más reciente primero): así elegir «LangGraph» en un
// grupo de frameworks no hace olvidar que preferías «TypeScript» en los grupos de lenguajes.
import { marcarCopiado, svgMarca } from './icono-marca';

const CLAVE = 'mc.pestanas';
const CLAVE_ANTIGUA = 'mc.pestana';
const MAX_RECORDADAS = 12;
function leer(): string[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo !== null) {
      const v = JSON.parse(crudo);
      if (Array.isArray(v)) return v.filter((x) => typeof x === 'string');
    }
  } catch { /* modo privado o valor corrupto */ }
  try { const a = localStorage.getItem(CLAVE_ANTIGUA); return a ? [a] : []; } catch { return []; }
}
function guardar(etiqueta: string) {
  const lista = [etiqueta, ...leer().filter((x) => x !== etiqueta)].slice(0, MAX_RECORDADAS);
  try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* modo privado */ }
}

function activar(bloque: HTMLElement, etiqueta: string) {
  const paneles = [...bloque.querySelectorAll<HTMLElement>(':scope > .code__panel')];
  if (!paneles.some((p) => p.dataset.tab === etiqueta)) return false;
  for (const p of paneles) p.hidden = p.dataset.tab !== etiqueta;
  for (const b of bloque.querySelectorAll<HTMLButtonElement>('.code__tab')) {
    const on = b.dataset.tab === etiqueta;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
  }
  const actual = paneles.find((p) => !p.hidden);
  const archivo = bloque.querySelector<HTMLElement>('.code__file');
  if (archivo && actual) archivo.textContent = actual.dataset.file || actual.dataset.lang || '';
  return true;
}

function montar(bloque: HTMLElement) {
  if (bloque.dataset.montado) return;
  bloque.dataset.montado = '1';
  const paneles = [...bloque.querySelectorAll<HTMLElement>(':scope > .code__panel')];
  const barra = document.createElement('div');
  barra.className = 'code__bar';

  if (bloque.classList.contains('code--tabs')) {
    const tabs = document.createElement('div');
    tabs.className = 'code__tabs';
    tabs.setAttribute('role', 'tablist');
    for (const p of paneles) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'code__tab'; b.setAttribute('role', 'tab');
      b.dataset.tab = p.dataset.tab!; b.textContent = p.dataset.tab!;
      b.addEventListener('click', () => {
        guardar(b.dataset.tab!);
        document.querySelectorAll<HTMLElement>('.code--tabs').forEach((x) => activar(x, b.dataset.tab!));
      });
      b.addEventListener('keydown', (ev) => {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        const todos = [...tabs.querySelectorAll<HTMLButtonElement>('.code__tab')];
        const i = todos.indexOf(b) + (ev.key === 'ArrowRight' ? 1 : -1);
        const sig = todos[(i + todos.length) % todos.length]; sig.click(); sig.focus();
      });
      tabs.append(b);
    }
    barra.append(tabs);
  }
  const archivo = document.createElement('span');
  archivo.className = 'code__file';
  archivo.textContent = paneles[0]?.dataset.file || paneles[0]?.dataset.lang || '';
  // Botón Copiar: [+] animado (pasa a [✓] al copiar) y etiqueta. Solo cambia el texto de la etiqueta,
  // nunca el del botón, que borraría el icono.
  const copiar = document.createElement('button');
  copiar.type = 'button'; copiar.className = 'code__copy';
  copiar.innerHTML = svgMarca(14, { check: true }) + '<span class="code__copy-t" aria-live="polite">Copiar</span>';
  const etiqueta = copiar.querySelector<HTMLElement>('.code__copy-t')!;
  const icono = copiar.querySelector<SVGElement>('.mc-icon');
  let vuelta = 0;
  copiar.addEventListener('click', async () => {
    const visible = paneles.find((p) => !p.hidden)?.querySelector('pre');
    if (!visible) return;
    try {
      await navigator.clipboard.writeText(visible.innerText);
      etiqueta.textContent = 'Copiado'; copiar.classList.add('is-ok');
      marcarCopiado(icono);
    } catch {
      // Sin portapapeles: se selecciona el texto, sin animación ni check (no se ha copiado nada)
      const r = document.createRange(); r.selectNodeContents(visible);
      const s = getSelection(); s?.removeAllRanges(); s?.addRange(r);
      etiqueta.textContent = 'Seleccionado';
    }
    clearTimeout(vuelta);   // dos clics seguidos: cuenta desde el último
    vuelta = window.setTimeout(() => { etiqueta.textContent = 'Copiar'; copiar.classList.remove('is-ok'); }, 1600);
  });
  barra.append(archivo, copiar);
  bloque.prepend(barra);
  if (bloque.classList.contains('code--tabs')) {
    // La etiqueta usada más recientemente que exista en este grupo; si ninguna, la primera.
    const elegida = leer().find((e) => paneles.some((p) => p.dataset.tab === e));
    activar(bloque, elegida ?? paneles[0].dataset.tab!);
  }
}

document.querySelectorAll<HTMLElement>('.code').forEach(montar);
