// Portada: al escribir en el buscador grande, la búsqueda pasa a la paleta con lo escrito (como la referencia).
const form = document.querySelector<HTMLFormElement>('form.qbox[data-form-buscar]');
const campo = form?.querySelector<HTMLInputElement>('input[name="q"]');
campo?.addEventListener('input', () => {
  if (!campo.value.trim()) return;
  form!.requestSubmit();          // buscador.ts abre la paleta con el texto
  campo.value = '';
});
export {};
