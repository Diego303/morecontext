// Fuente única de verdad: archivo de /contenido → id de colección → URL pública.
// Se usa desde astro.config (plugins), content.config (generateId) y páginas.

/** Quita el prefijo de orden ("01-", "002-") del último segmento. Las carpetas lo conservan. */
export function normalizarId(relSinExt) {
  const segs = relSinExt.replace(/\\/g, '/').replace(/\.md$/, '').split('/');
  if (segs.at(-1) === 'index') segs.pop();
  else segs[segs.length - 1] = segs.at(-1).replace(/^\d{1,3}-(?=[a-z])/, '');
  return segs.join('/');
}

/** Ruta relativa a /contenido (con o sin .md) → URL pública con barra final. */
export function urlDeArchivo(relAContenido) {
  const id = normalizarId(relAContenido);
  const [seccion, ...resto] = id.split('/');
  if (seccion === 'paginas') return resto.length ? `/${resto.join('/')}/` : '/';
  return `/${[seccion, ...resto].join('/')}/`;
}

/** generateId para el glob loader: id relativo a la carpeta de la sección. */
export const generarId = ({ entry }) => normalizarId(entry);
