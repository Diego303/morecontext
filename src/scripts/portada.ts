// Portada: al escribir en el buscador grande, la búsqueda pasa a la paleta con lo escrito (como la referencia).
const form = document.querySelector<HTMLFormElement>('form.qbox[data-form-buscar]');
const campo = form?.querySelector<HTMLInputElement>('input[name="q"]');
campo?.addEventListener('input', () => {
  if (!campo.value.trim()) return;
  form!.requestSubmit();          // buscador.ts abre la paleta con el texto
  campo.value = '';
});
// Safari de iOS solo aplica :active (el [+] del hero baja al pulsarlo) si la página escucha toques.
document.addEventListener('touchstart', () => {}, { passive: true });
export {};
