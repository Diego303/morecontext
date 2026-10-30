// Icono [+] de MoreContext en línea, con las piezas mc-* que anima src/styles/icono-marca.css.
// Basado en morecontext-animaciones-v1 (solo elevación, buscando y copiado).

const TINTA = '#000';
export function svgMarca(tamano = 28, { check = false } = {}): string {
  const trazo = (clase: string, d: string) =>
    `<path class="${clase}" d="${d}" fill="none" stroke="${TINTA}" stroke-width="2.2" stroke-linecap="square"/>`;
  return `<svg class="mc-icon" viewBox="0 0 26 26" width="${tamano}" height="${tamano}" aria-hidden="true" focusable="false">`
    + `<rect class="mc-shadow" x="3" y="3" width="23" height="23" fill="#fde047"/>`
    + `<g class="mc-front">`
    + `<rect x="0.6" y="0.6" width="22.4" height="22.4" fill="#fafafa" stroke="${TINTA}" stroke-width="1.2"/>`
    + trazo('mc-bl', 'M7.8 4.8H4.8v14h3')
    + trazo('mc-br', 'M15.8 4.8h3v14h-3')
    + trazo('mc-plus', 'M11.8 9.05v6M8.8 12.05h6')
    + (check ? trazo('mc-check', 'M8.2 12.4l2.6 2.6 4.9-5.4') : '')
    + `</g></svg>`;
}

const temporizadores = new WeakMap<Element, number>();

/** [+] → [✓] durante 1,6 s. Se puede repetir sin esperar: reinicia la animación. */
export function marcarCopiado(svg: SVGElement | null | undefined): void {
  if (!svg) return;
  clearTimeout(temporizadores.get(svg));
  svg.classList.remove('is-copied');
  void svg.getBoundingClientRect();   // reflow para reiniciar la animación
  svg.classList.add('is-copied');
  temporizadores.set(svg, window.setTimeout(() => svg.classList.remove('is-copied'), 1600));
}

export function marcarBuscando(svg: SVGElement | null | undefined, activo: boolean): void {
  svg?.classList.toggle('is-searching', activo);
}
