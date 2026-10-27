// RSS: blog, radar y boletín, del más reciente al más antiguo.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITIO } from '../config/sitio';
import { porFechaDesc, publicados, urlDe } from '../lib/contenido';

export async function GET(context: APIContext) {
  const entradas = [...(await publicados('blog')), ...(await publicados('radar')), ...(await publicados('boletin'))].sort(porFechaDesc);
  return rss({
    title: SITIO.nombre,
    description: SITIO.eslogan,
    site: context.site ?? SITIO.url,
    trailingSlash: true,
    customData: '<language>es-es</language>',
    items: entradas.map((e) => ({
      title: e.data.titulo,
      description: e.data.descripcion,
      link: urlDe(e),
      pubDate: e.data.creado,
      categories: e.data.tags,
    })),
  });
}
