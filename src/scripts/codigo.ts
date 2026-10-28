// Bloques de código generados por remark-bloques-codigo: barra con pestañas/archivo + botón Copiar.
// Las pestañas se sincronizan en toda la web por su etiqueta («Python», «TypeScript») y se recuerdan.
const CLAVE = 'mc.pestana';
const leer = () => { try { return localStorage.getItem(CLAVE); } catch { return null; } };
const guardar = (v: string) => { try { localStorage.setItem(CLAVE, v); } catch { /* modo privado */ } };

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
  const copiar = document.createElement('button');
  copiar.type = 'button'; copiar.className = 'code__copy'; copiar.textContent = 'Copiar';
  copiar.addEventListener('click', async () => {
    const visible = paneles.find((p) => !p.hidden)?.querySelector('pre');
    if (!visible) return;
    try {
      await navigator.clipboard.writeText(visible.innerText);
      copiar.textContent = 'Copiado'; copiar.classList.add('is-ok');
    } catch {
      const r = document.createRange(); r.selectNodeContents(visible);
      const s = getSelection(); s?.removeAllRanges(); s?.addRange(r);
      copiar.textContent = 'Seleccionado';
    }
    setTimeout(() => { copiar.textContent = 'Copiar'; copiar.classList.remove('is-ok'); }, 1600);
  });
  barra.append(archivo, copiar);
  bloque.prepend(barra);
  if (bloque.classList.contains('code--tabs')) {
    const guardada = leer();
    if (!guardada || !activar(bloque, guardada)) activar(bloque, paneles[0].dataset.tab!);
  }
}

document.querySelectorAll<HTMLElement>('.code').forEach(montar);
