// Configuración del sitio: lo que no es contenido. Todo lo editorial vive en /contenido.
export const SITIO = {
  nombre: 'MoreContext',
  dominio: 'morecontextai.com',
  url: 'https://morecontextai.com',
  eslogan: 'Más contexto, menos ruido.',
  descripcion: 'La guía abierta y gratuita en español para entender y construir agentes de IA.',
  idioma: 'es-ES',
  autor: '[Tu nombre]',
  repo: 'https://github.com/Diego303/morecontext',
  ramaEdicion: 'main',
  redes: { github: 'https://github.com/Diego303/morecontext', x: '', linkedin: '' },
  boletin: {
    // Proveedor de email (Buttondown, Brevo, MailerLite…). Vacío = el formulario muestra «Próximamente» y enlaza al RSS.
    action: '',
    campoEmail: 'email',
  },
  licencias: { contenido: 'CC BY-SA 4.0', codigo: 'MIT' },
} as const;

/** Navegación principal. Las partes I–V son las mismas que en el índice de la portada. */
export const PARTES = [
  { num: 'I', nombre: 'Aprender', enlaces: [
    { href: '/empieza-aqui/', texto: 'Empieza aquí', nota: 'Rutas por perfil y test de nivel' },
    { href: '/roadmap/', texto: 'Roadmap 0→100', nota: 'De la primera llamada a producción' },
    { href: '/cursos/', texto: 'Cursos específicos', nota: 'Monográficos cortos' },
  ] },
  { num: 'II', nombre: 'Consultar', enlaces: [
    { href: '/docs/', texto: 'Documentación' }, { href: '/modelos/', texto: 'Guía de modelos' }, { href: '/glosario/', texto: 'Glosario' },
  ] },
  { num: 'III', nombre: 'Construir', enlaces: [
    { href: '/sistemas/', texto: 'Sistemas' }, { href: '/patrones/', texto: 'Patrones' }, { href: '/recetas/', texto: 'Recetas' },
  ] },
  { num: 'IV', nombre: 'Trabajar', enlaces: [{ href: '/disciplinas/', texto: 'Disciplinas y formas de trabajar' }] },
  { num: 'V', nombre: 'Estar al día', enlaces: [
    { href: '/radar/', texto: 'Radar' }, { href: '/blog/', texto: 'Blog y ensayos' }, { href: '/boletin/', texto: 'Boletín' },
  ] },
] as const;

/** Enlaces visibles en la barra superior (escritorio). «Aprender» es desplegable con PARTES[0]. */
export const NAV = [
  { href: '/docs/', texto: 'Docs' }, { href: '/modelos/', texto: 'Modelos' }, { href: '/sistemas/', texto: 'Sistemas' },
  { href: '/patrones/', texto: 'Patrones' }, { href: '/disciplinas/', texto: 'Disciplinas' }, { href: '/recetas/', texto: 'Recetas' },
  { href: '/radar/', texto: 'Radar' }, { href: '/blog/', texto: 'Blog' },
] as const;

/** Nombre visible de cada sección (para migas, filtros de búsqueda y etiquetas). */
export const NOMBRE_SECCION: Record<string, string> = {
  roadmap: 'Roadmap', cursos: 'Cursos', docs: 'Docs', modelos: 'Guía de modelos', sistemas: 'Sistemas', patrones: 'Patrones',
  disciplinas: 'Disciplinas', recetas: 'Recetas', glosario: 'Glosario', radar: 'Radar', blog: 'Blog', boletin: 'Boletín', '': 'Páginas',
};
