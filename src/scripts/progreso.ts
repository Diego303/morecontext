// Progreso del curso guardado en este navegador (localStorage). Nada sale del dispositivo.
const CLAVE = 'mc.progreso';
type Progreso = Record<string, true>;
const leer = (): Progreso => { try { return JSON.parse(localStorage.getItem(CLAVE) ?? '{}'); } catch { return {}; } };
const guardar = (p: Progreso) => { try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch { /* sin almacenamiento */ } };

let progreso = leer();
function pintar() {
  document.querySelectorAll<HTMLInputElement>('input[data-leccion]').forEach((c) => { c.checked = !!progreso[c.dataset.leccion!]; });
  document.querySelectorAll<HTMLElement>('[data-progreso-de]').forEach((el) => {
    const ids = (el.dataset.progresoDe ?? '').split(',').filter(Boolean);
    const hechas = ids.filter((id) => progreso[id]).length;
    const pct = ids.length ? Math.round((hechas / ids.length) * 100) : 0;
    el.querySelector<HTMLElement>('[data-barra]')?.style.setProperty('width', `${pct}%`);
    const txt = el.querySelector<HTMLElement>('[data-texto]');
    if (txt) txt.textContent = `${hechas} de ${ids.length} · ${pct} %`;
  });
}
document.addEventListener('change', (e) => {
  const c = e.target as HTMLInputElement;
  if (!c.matches?.('input[data-leccion]')) return;
  if (c.checked) progreso[c.dataset.leccion!] = true; else delete progreso[c.dataset.leccion!];
  guardar(progreso); pintar();
});
document.querySelectorAll<HTMLButtonElement>('[data-borrar-progreso]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.confirmar !== '1') { b.dataset.confirmar = '1'; b.textContent = 'Pulsa otra vez para borrar'; return; }
  progreso = {}; guardar(progreso); pintar(); b.dataset.confirmar = ''; b.textContent = 'Progreso borrado';
}));
pintar();
export {};
