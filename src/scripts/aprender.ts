// Complementa a progreso.ts (que guarda y pinta casillas y barras): ✓ en la navegación lateral
// y «Continúa donde lo dejaste». Lee el mismo almacenamiento local; nada sale del navegador.
const CLAVE = 'mc.progreso';
type Leccion = { id: string; url: string; titulo: string; numero: string };
const leer = (): Record<string, true> => { try { return JSON.parse(localStorage.getItem(CLAVE) ?? '{}'); } catch { return {}; } };

function pintar() {
  const hechas = leer();
  document.querySelectorAll<HTMLElement>('[data-hecha]').forEach((el) => { el.hidden = !hechas[el.dataset.hecha!]; });
  document.querySelectorAll<HTMLElement>('[data-continuar]').forEach((caja) => {
    let lista: Leccion[] = [];
    try { lista = JSON.parse(caja.dataset.continuar ?? '[]'); } catch { /* datos corruptos: no se muestra */ }
    const n = lista.filter((l) => hechas[l.id]).length;
    const siguiente = lista.find((l) => !hechas[l.id]);
    const enlace = caja.querySelector<HTMLAnchorElement>('[data-continuar-enlace]');
    const texto = caja.querySelector<HTMLElement>('[data-continuar-texto]');
    caja.hidden = n === 0;
    if (!enlace || !texto) return;
    if (siguiente) {
      enlace.hidden = false;
      enlace.href = siguiente.url;
      enlace.textContent = `Lección ${siguiente.numero} · ${siguiente.titulo}`;
      texto.textContent = `Llevas ${n} de ${lista.length}. La siguiente sin marcar:`;
    } else {
      enlace.hidden = true;
      texto.textContent = `Has marcado las ${lista.length} lecciones.`;
    }
  });
}

// progreso.ts guarda en el mismo evento: se pinta en la siguiente vuelta del bucle
document.addEventListener('change', (e) => { if ((e.target as Element).matches?.('input[data-leccion]')) setTimeout(pintar); });
document.addEventListener('click', (e) => { if ((e.target as Element).closest?.('[data-borrar-progreso]')) setTimeout(pintar); });
addEventListener('storage', (e) => { if (e.key === CLAVE) pintar(); });
pintar();
export {};
