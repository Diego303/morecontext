// Fichas de /plantillas/: botón «Descargar» junto a «Copiar» en el bloque de «## La plantilla».
// Baja el texto del bloque con el nombre del campo `archivo` (AGENTS.md, acceptance.yaml…).
const ficha = document.querySelector<HTMLElement>('[data-plantilla-archivo]');
const titulo = document.getElementById('la-plantilla');

/** Primer bloque de código entre «La plantilla» y el siguiente h2. */
function bloqueDe(h: HTMLElement): HTMLElement | null {
  for (let el = h.nextElementSibling; el && el.tagName !== 'H2'; el = el.nextElementSibling) {
    const b = el.matches('.code') ? el : el.querySelector('.code');
    if (b) return b as HTMLElement;
  }
  return null;
}

const bloque = titulo && bloqueDe(titulo);
if (ficha && bloque) {
  // `archivo` puede ser una ruta con marcadores («.claude/agents/<nombre>.md»): se descarga con el último tramo, sin
  // los caracteres que un nombre de archivo no admite («nombre.md»). La ruta completa está en la cabecera de la ficha.
  const nombre = ficha.dataset.plantillaArchivo!.split('/').pop()!.replace(/[<>:"\\|?*]/g, '') || 'plantilla.txt';
  const boton = document.createElement('button');
  boton.type = 'button'; boton.className = 'code__copy'; boton.textContent = 'Descargar';
  boton.setAttribute('aria-label', `Descargar la plantilla como ${nombre}`);
  boton.addEventListener('click', () => {
    const pre = [...bloque.querySelectorAll<HTMLElement>('.code__panel')].find((p) => !p.hidden)?.querySelector('pre') ?? bloque.querySelector('pre');
    if (!pre) return;
    const texto = (pre.textContent ?? '').replace(/\n?$/, '\n');
    const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  // La barra del bloque la crea codigo.ts: se espera a que exista.
  const poner = () => {
    const copiar = bloque.querySelector('.code__bar .code__copy');
    if (copiar) copiar.before(boton);
    return Boolean(copiar);
  };
  if (!poner()) new MutationObserver((_, o) => { if (poner()) o.disconnect(); }).observe(bloque, { childList: true, subtree: true });
}

export {};
