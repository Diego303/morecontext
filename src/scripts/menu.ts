// Cabecera: desplegable «Aprender» y menú móvil (aria-expanded, Escape, clic fuera, foco).
const ddBoton = document.querySelector<HTMLButtonElement>('.dd > button');
const ddMenu = document.getElementById('dd-aprender');
const menuBoton = document.querySelector<HTMLButtonElement>('.menu-btn');
const mnav = document.getElementById('mnav');

function abrirDd(abrir: boolean) {
  if (!ddBoton || !ddMenu) return;
  ddBoton.setAttribute('aria-expanded', String(abrir));
  ddMenu.hidden = !abrir;
}
function abrirMenu(abrir: boolean) {
  if (!menuBoton || !mnav) return;
  menuBoton.setAttribute('aria-expanded', String(abrir));
  mnav.hidden = !abrir;
}

ddBoton?.addEventListener('click', (e) => {
  e.stopPropagation();
  const abrir = ddBoton.getAttribute('aria-expanded') !== 'true';
  abrirDd(abrir);
  if (abrir) ddMenu?.querySelector('a')?.focus();
});
// Flechas dentro del desplegable
ddMenu?.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  e.preventDefault();
  const enlaces = [...ddMenu.querySelectorAll<HTMLAnchorElement>('a')];
  const i = enlaces.indexOf(document.activeElement as HTMLAnchorElement);
  enlaces[(i + (e.key === 'ArrowDown' ? 1 : -1) + enlaces.length) % enlaces.length]?.focus();
});
// Si el foco sale del desplegable, se cierra
ddMenu?.parentElement?.addEventListener('focusout', (e) => {
  if (!ddMenu.parentElement?.contains(e.relatedTarget as Node)) abrirDd(false);
});

menuBoton?.addEventListener('click', () => abrirMenu(menuBoton.getAttribute('aria-expanded') !== 'true'));

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (!t.closest('.dd')) abrirDd(false);
  if (mnav && !mnav.hidden && !t.closest('#mnav, .menu-btn')) abrirMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (ddMenu && !ddMenu.hidden) { abrirDd(false); ddBoton?.focus(); }
  if (mnav && !mnav.hidden) { abrirMenu(false); menuBoton?.focus(); }
});

// Paleta de búsqueda: en un input type=search con texto, Chrome gasta el primer Escape en vaciarlo.
// La paleta promete «Esc cerrar»: se cierra a la primera.
const paleta = document.getElementById('buscador') as HTMLDialogElement | null;
paleta?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && paleta.open) { e.preventDefault(); paleta.close(); }
});

// Al pasar a escritorio, el menú móvil se cierra
matchMedia('(min-width: 1181px)').addEventListener('change', (m) => { if (m.matches) abrirMenu(false); });

export {};
