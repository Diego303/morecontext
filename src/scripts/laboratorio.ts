// Calculadora del laboratorio: coste = tokens × precio por millón. Los valores se recuerdan en este navegador.
const CLAVE = 'mc.laboratorio';
const calc = document.querySelector<HTMLFormElement>('form[data-calculadora]');
const est = document.querySelector<HTMLFormElement>('form[data-estimador]');
const num = (f: HTMLFormElement, n: string) => {
  const v = (f.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '';
  return v === '' ? NaN : Number(v);
};
const dinero = (n: number) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 6 : 2 }).format(n);

function calcular() {
  if (!calc) return;
  const v = (n: string) => num(calc, n);
  const extra = (t: number, p: number) => (Number.isFinite(t) && Number.isFinite(p) ? (t * p) / 1e6 : 0);
  const base = [v('entrada'), v('salida'), v('pEntrada'), v('pSalida')];
  const listo = base.every(Number.isFinite);
  const falta = calc.querySelector<HTMLElement>('[data-falta]');
  if (falta) falta.hidden = listo;
  const poner = (k: string, t: string) => { const el = calc.querySelector(`[data-r="${k}"]`); if (el) el.textContent = t; };
  if (!listo) { ['llamada', 'dia', 'mes'].forEach((k) => poner(k, '—')); return; }
  const llamada = (v('entrada') * v('pEntrada') + v('salida') * v('pSalida')) / 1e6
    + extra(v('cacheLectura'), v('pCacheLectura')) + extra(v('cacheEscritura'), v('pCacheEscritura'));
  const llamadas = Number.isFinite(v('llamadas')) ? v('llamadas') : NaN;
  const dias = Number.isFinite(v('dias')) ? v('dias') : 30;
  poner('llamada', dinero(llamada));
  poner('dia', Number.isFinite(llamadas) ? dinero(llamada * llamadas) : '—');
  poner('mes', Number.isFinite(llamadas) ? dinero(llamada * llamadas * dias) : '—');
}

function guardar() {
  if (!calc) return;
  const datos = Object.fromEntries([...new FormData(calc)].map(([k, v]) => [k, String(v)]));
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* sin almacenamiento */ }
}
function restaurar() {
  if (!calc) return;
  let datos: Record<string, string> = {};
  try { datos = JSON.parse(localStorage.getItem(CLAVE) ?? '{}'); } catch { /* nada guardado */ }
  for (const [k, val] of Object.entries(datos)) {
    const el = calc.elements.namedItem(k) as HTMLInputElement | null;
    if (el && val !== '') el.value = val;
  }
}

function estimar() {
  if (!est) return 0;
  const texto = (est.querySelector('#texto') as HTMLTextAreaElement).value;
  const ratio = Math.max(1, num(est, 'ratio') || Number((est.querySelector('#ratio') as HTMLInputElement).value) || 4);
  const tokens = Math.ceil(texto.length / ratio);
  const salida = est.querySelector('[data-est]');
  if (salida) salida.textContent = `${texto.length.toLocaleString('es-ES')} caracteres · ~${tokens.toLocaleString('es-ES')} tokens`;
  return tokens;
}

restaurar();
calcular();
calc?.addEventListener('input', () => { calcular(); guardar(); });
calc?.addEventListener('submit', (e) => e.preventDefault());
est?.addEventListener('input', () => void estimar());
est?.addEventListener('submit', (e) => e.preventDefault());
est?.querySelector('[data-usar]')?.addEventListener('click', () => {
  const entrada = calc?.elements.namedItem('entrada') as HTMLInputElement | null;
  if (!entrada) return;
  entrada.value = String(estimar());
  calcular(); guardar();
  entrada.focus();
});
export {};
