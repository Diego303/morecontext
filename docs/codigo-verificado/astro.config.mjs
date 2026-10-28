// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkWikilinks from './src/plugins/remark-wikilinks.mjs';
import remarkCallouts from './src/plugins/remark-callouts.mjs';
import remarkBloquesCodigo from './src/plugins/remark-bloques-codigo.mjs';
import rehypeEnlacesExternos from './src/plugins/rehype-enlaces-externos.mjs';

const SITIO = 'https://morecontextai.com';
const temaShiki = JSON.parse(readFileSync(new URL('./src/styles/shiki-morecontext.json', import.meta.url), 'utf8'));

export default defineConfig({
  site: SITIO,
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  integrations: [sitemap()],
  // Mermaid se carga solo en páginas con diagramas: sus trozos grandes no afectan al resto.
  vite: { build: { chunkSizeWarningLimit: 2000 } },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkWikilinks, remarkCallouts, remarkBloquesCodigo],
      rehypePlugins: [[rehypeEnlacesExternos, { sitio: SITIO }]],
    }),
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { theme: temaShiki, wrap: false },
  },
});
