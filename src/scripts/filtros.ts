// Filtros de listados (chips combinables), filtro en vivo del glosario y test de nivel de /empieza-aqui/.
const sinTildes = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ---------- 1) Chips: un valor por grupo; los grupos se combinan ----------
document.querySelectorAll<HTMLElement>('[data-filtros]').forEach((caja) => {
  const lista = document.getElementById(caja.dataset.filtros!);
  if (!lista) return;
  const items = [...lista.querySelectorAll<HTMLElement>('li[data-filtrable]')];
  const contenedores = [...lista.querySelectorAll<HTMLElement>('[data-contenedor]')];
  const cuenta = caja.querySelector<HTMLElement>('[data-cuenta]');
  const vacio = caja.querySelector<HTMLElement>('[data-vacio]');
  const nombre = caja.dataset.nombre ?? 'entradas';
  const grupos = [...caja.querySelectorAll<HTMLElement>('[data-clave]')];

  function aplicar() {
    const activos = grupos.map((g) => [g.dataset.clave!, g.querySelector<HTMLElement>('[aria-pressed="true"]')?.dataset.valor ?? ''] as const);
    let n = 0;
    for (const li of items) {
      const ok = activos.every(([k, v]) => !v || (li.dataset[k] ?? '').split(' ').includes(v));
      li.hidden = !ok;
      if (ok) n++;
    }
    for (const c of contenedores) c.hidden = !c.querySelector('li[data-filtrable]:not([hidden])');
    if (cuenta) cuenta.textContent = `${n} de ${items.length} ${nombre}`;
    if (vacio) vacio.hidden = n > 0;
  }
  grupos.forEach((g) => g.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-valor]');
    if (!b) return;
    g.querySelectorAll('button[data-valor]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    aplicar();
  }));
  caja.querySelector('[data-ver-todo]')?.addEventListener('click', () => {
    grupos.forEach((g) => g.querySelectorAll<HTMLButtonElement>('button[data-valor]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.valor === ''))));
    aplicar();
  });
});

// ---------- 2) Glosario: filtro en vivo (título, alias y descripción, sin tildes) ----------
const campo = document.querySelector<HTMLInputElement>('[data-filtro-glosario]');
if (campo) {
  const terminos = [...document.querySelectorAll<HTMLElement>('[data-termino]')];
  const letras = [...document.querySelectorAll<HTMLElement>('[data-letra]')];
  const cuenta = document.querySelector<HTMLElement>('[data-cuenta-glosario]');
  const vacio = document.querySelector<HTMLElement>('[data-vacio-glosario]');
  const enTodo = vacio?.querySelector<HTMLElement>('[data-buscar]');
  const indice = terminos.map((t) => sinTildes(t.dataset.termino ?? ''));
  const filtrar = () => {
    const q = sinTildes(campo.value.trim());
    let n = 0;
    terminos.forEach((t, i) => { const ok = !q || indice[i].includes(q); t.hidden = !ok; if (ok) n++; });
    letras.forEach((l) => { l.hidden = !l.querySelector('[data-termino]:not([hidden])'); });
    if (cuenta) cuenta.textContent = q ? `${n} de ${terminos.length} términos` : `${terminos.length} términos`;
    if (vacio) vacio.hidden = n > 0;
    if (enTodo) enTodo.dataset.buscar = campo.value.trim();
    document.querySelectorAll<HTMLAnchorElement>('[data-az] a').forEach((a) => {
      const sec = document.getElementById(a.hash.slice(1));
      a.classList.toggle('atenuada', !sec || sec.hidden === true);
    });
  };
  campo.addEventListener('input', filtrar);
  campo.form?.addEventListener('submit', (e) => e.preventDefault());
  if (campo.value) filtrar();
}

// ---------- 3) Test de nivel (/empieza-aqui/) ----------
const plantilla = document.querySelector<HTMLTemplateElement>('template[data-test-nivel]');
const titulo = document.getElementById('test-de-nivel');
if (plantilla && titulo) {
  // Se coloca justo después de la lista de preguntas del texto (sin JS, el test sigue legible en el texto)
  let ancla: Element | null = titulo;
  while (ancla?.nextElementSibling && ancla.tagName !== 'OL') ancla = ancla.nextElementSibling;
  const test = plantilla.content.firstElementChild!.cloneNode(true) as HTMLElement;
  (ancla && ancla.tagName === 'OL' ? ancla : titulo).after(test);
  const respuestas: Record<string, string> = {};
  const resultados = [...test.querySelectorAll<HTMLElement>('[data-resultado]')];
  const decidir = (): string | null => {
    const [a, b, c] = ['1', '2', '3'].map((k) => respuestas[k]);
    if (a === 'no') return 'A';
    if (a === 'si' && b === 'no') return 'B1';
    if (a === 'si' && b === 'si' && c === 'no') return 'B2';
    if (a === 'si' && b === 'si' && c === 'si') return 'C';
    return null;
  };
  test.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-p]');
    if (!b) return;
    respuestas[b.dataset.p!] = b.dataset.v!;
    b.parentElement?.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const r = decidir();
    resultados.forEach((x) => { x.hidden = x.dataset.resultado !== r; });
    test.querySelectorAll<HTMLElement>('[data-pregunta]').forEach((p) => {
      // si la 1 es «no», las demás ya no cambian el resultado
      p.classList.toggle('inactiva', respuestas['1'] === 'no' && p.dataset.pregunta !== '1');
    });
  });
}

export {};
