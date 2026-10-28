// Paleta de búsqueda (Ctrl/⌘+K y «/») sobre el índice de Pagefind generado en el build.
// En `pnpm dev` no existe /pagefind/: la paleta lo explica y ofrece el glosario.
type Resultado = { url: string; meta: { title?: string }; excerpt: string; filters: { seccion?: string[] } };
type Pagefind = {
  options: (o: object) => Promise<void>;
  debouncedSearch: (q: string, o?: object, ms?: number) => Promise<{ results: { data: () => Promise<Resultado> }[] } | null>;
};

let pagefind: Pagefind | null = null;
let fallo = false;
async function cargar(): Promise<Pagefind | null> {
  if (pagefind || fallo) return pagefind;
  try {
    const ruta = '/pagefind/pagefind.js';
    pagefind = (await import(/* @vite-ignore */ ruta)) as Pagefind;
    await pagefind.options({ excerptLength: 16 });
  } catch { fallo = true; }
  return pagefind;
}

const dlg = document.querySelector<HTMLDialogElement>('#buscador');
const input = dlg?.querySelector<HTMLInputElement>('input[type=search]');
const lista = dlg?.querySelector<HTMLUListElement>('[data-resultados]');
let sel = 0;

function abrir(texto = '') {
  if (!dlg || !input) return;
  if (!dlg.open) dlg.showModal();
  input.value = texto; input.focus();
  void buscar(texto);
}
function pintar(html: string) { if (lista) { lista.innerHTML = html; sel = 0; marcar(); } }
function marcar() { lista?.querySelectorAll('a').forEach((a, i) => a.classList.toggle('is-sel', i === sel)); }
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

async function buscar(q: string) {
  if (!q.trim()) { pintar('<li class="bus-vacio">Escribe un concepto: <em>tool use</em>, <em>RAG</em>, <em>evals</em>…</li>'); return; }
  const pf = await cargar();
  if (!pf) { pintar('<li class="bus-vacio">La búsqueda se genera al construir la web (<code>pnpm build &amp;&amp; pnpm preview</code>). Mientras, prueba el <a href="/glosario/">glosario</a>.</li>'); return; }
  const r = await pf.debouncedSearch(q, {}, 150);
  if (!r) return; // superada por otra búsqueda
  const datos = await Promise.all(r.results.slice(0, 12).map((x) => x.data()));
  if (!datos.length) { pintar(`<li class="bus-vacio">Nada con «${esc(q)}». Prueba otro término o mira el <a href="/glosario/">glosario</a>.</li>`); return; }
  pintar(datos.map((d) => `<li><a href="${d.url}"><span class="bus-t">${esc(d.meta.title ?? d.url)}</span>` +
    `<span class="bus-s">${esc(d.filters.seccion?.[0] ?? '')}</span><span class="bus-e">${d.excerpt}</span></a></li>`).join(''));
}

input?.addEventListener('input', () => void buscar(input.value));
input?.addEventListener('keydown', (e) => {
  const enlaces = lista?.querySelectorAll('a') ?? [];
  if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, enlaces.length - 1); marcar(); enlaces[sel]?.scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); marcar(); enlaces[sel]?.scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter' && enlaces[sel]) { e.preventDefault(); location.href = (enlaces[sel] as HTMLAnchorElement).href; }
});
dlg?.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  const escribiendo = /input|textarea|select/i.test(t.tagName) || t.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg?.open ? dlg.close() : abrir(); }
  else if (e.key === '/' && !escribiendo) { e.preventDefault(); abrir(); }
});
document.querySelectorAll<HTMLElement>('[data-buscar]').forEach((b) => b.addEventListener('click', () => abrir(b.dataset.buscar ?? '')));
document.querySelectorAll<HTMLFormElement>('form[data-form-buscar]').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault(); abrir(new FormData(f).get('q')?.toString() ?? '');
}));
const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
document.querySelectorAll('[data-kbd]').forEach((k) => { k.textContent = mac ? '⌘ K' : 'Ctrl K'; });
