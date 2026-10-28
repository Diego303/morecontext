# MoreContext · Plan de implementación

> Web estática con **Astro 7** publicada en **GitHub Pages** (dominio `morecontextai.com`), cuyo contenido completo vive en **`contenido/`** como archivos Markdown: una bóveda de Obsidian que es a la vez tu segundo cerebro y la fuente de cada página.
>
> Este plan está pensado para ejecutarlo con Claude Code fase a fase. Cada fase tiene objetivo, tareas con archivos exactos, criterios de aceptación y comandos de verificación. **No se avanza de fase sin cumplir sus criterios.**

**Material de partida (en `docs/`):**

| Archivo | Qué es |
|---|---|
| `DISENO.md` | Guía de marca y diseño: tokens, tipografía, componentes, movimiento, qué sí / qué no. |
| `GUIA-CONTENIDO.md` | Convenciones de `contenido/`: frontmatter por colección, wikilinks, avisos, código, Mermaid, voz. |
| `MAPA-CONTENIDO.md` | Árbol canónico de los 269 archivos de contenido. |
| `referencia/landing-indice.html` | Portada aprobada («El índice») en HTML estático: referencia visual y de comportamiento. |
| `referencia/componentes.css` | CSS de componentes ya diseñados (botones, avisos, tablas, código, docs, paleta…) de la maqueta anterior. |
| `codigo-verificado/` | Código ya probado en un build real de Astro 7.4.2 con los 269 archivos de contenido (270 páginas, 0 enlaces rotos, `astro check` sin errores, pestañas, Mermaid y búsqueda probados en navegador, `pnpm install` con pnpm 12.15.0): `package.json`, configuración, colecciones, plugins de Markdown, utilidades, scripts de cliente, scripts de validación y workflows. **Se copia tal cual.** |

---

## 0. Decisiones de arquitectura

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | **Astro 7.4** (la plantilla trae 5.17: se actualiza en la fase 0) | Proyecto nuevo: empezar en la versión mayor actual evita una migración a corto plazo. Content Layer, Rust compiler, Vite 8. | Quedarse en 5.x y migrar dos versiones mayores después. |
| D2 | **Salida 100 % estática** (`output` por defecto) en GitHub Pages | Gratis, rápido, sin servidor que mantener; encaja con un sitio de contenido. | SSR en Vercel/Netlify: innecesario. |
| D3 | **Contenido en `contenido/` (raíz), fuera de `src/`** | Es una bóveda de Obsidian independiente del código: se edita sin tocar Astro. | `src/content/`: mezcla código y notas. |
| D4 | **Content Layer con `glob()` y `generateId` propio** (`src/lib/rutas.mjs`) | Una única regla archivo → id → URL para colecciones, wikilinks y validador. Quita prefijos de orden (`01-`) de la URL. | Slugs en frontmatter: frágil y duplicado. |
| D5 | **Procesador `unified()` de `@astrojs/markdown-remark`** | En Astro 7 el procesador por defecto es Sätteri; los plugins remark/rehype necesitan `unified()`. | Portar los plugins a Sätteri: sin necesidad hoy. |
| D6 | **3 plugins remark propios + 1 rehype** (wikilinks, avisos, bloques de código, enlaces externos) | Markdown estilo Obsidian/GitHub sin MDX: `[[enlaces]]`, `> [!consejo]`, pestañas Python/TS. | MDX con componentes: rompe la compatibilidad con Obsidian. |
| D7 | **Shiki con tema propio** (`shiki-morecontext.json`) | Colores exactos del design system en build, sin JS en cliente. | Prism / resaltado en cliente. |
| D8 | **Mermaid en cliente, carga diferida** | Diagramas escritos en Markdown; la librería solo se descarga en páginas con diagramas. | Render en build con Playwright: más lento y frágil en CI. |
| D9 | **Pagefind** para la búsqueda | Índice estático generado tras el build; funciona en GitHub Pages sin servicios externos. | Algolia (externo), Fuse (todo el índice en cliente). |
| D10 | **Fuentes autoalojadas con Fontsource** | Sin peticiones a Google (RGPD) y sin dependencia externa. | Google Fonts. |
| D11 | **CSS propio con tokens**, sin framework de UI ni Tailwind | El design system ya está definido; JS solo en scripts pequeños. | Tailwind / React: peso y complejidad sin beneficio. |
| D12 | **pnpm + Node ≥ 22.23.4** (CI en Node 24) | Requisito de Astro 7.4. | — |
| D13 | **Validación antes del build** (`scripts/validar-contenido.mjs`) y comprobación de enlaces después (`scripts/comprobar-enlaces.mjs`) | El segundo cerebro puede tener huecos; la web publicada no puede tener enlaces rotos. | Confiar en revisión manual. |
| D14 | **`trailingSlash: 'always'`** y `build.format: 'directory'` | URLs canónicas `/glosario/rag/`, compatibles con GitHub Pages. | Mezclar con y sin barra. |

---

## 1. Estructura final del repositorio

```
morecontext/
├── .github/workflows/
│   ├── deploy.yml                 # publica en GitHub Pages al hacer push a main
│   └── ci.yml                     # valida PRs y ramas
├── .nvmrc                         # 24
├── CLAUDE.md                      # memoria del proyecto para Claude Code
├── README.md
├── LICENSE                        # MIT (código)
├── LICENSE-CONTENIDO.md           # CC BY-SA 4.0 (contenido)
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── contenido/                     # ← TODO el contenido (bóveda Obsidian)
│   ├── .obsidian/  _plantillas/  _borradores/  _adjuntos/
│   ├── paginas/ roadmap/ cursos/ docs/ modelos/ sistemas/ patrones/
│   └── disciplinas/ recetas/ glosario/ radar/ blog/ boletin/
├── docs/                          # documentación del proyecto (no se publica)
├── public/
│   ├── CNAME                      # morecontextai.com
│   ├── favicon.svg  favicon.ico  apple-touch-icon.png  icon-192.png  icon-512.png
│   ├── site.webmanifest
│   ├── robots.txt
│   └── og/default.png             # imagen para compartir 1200×630
├── scripts/
│   ├── validar-contenido.mjs      # frontmatter, nombres, wikilinks, URLs duplicadas
│   ├── comprobar-enlaces.mjs      # enlaces internos en dist/
│   ├── nueva-nota.mjs             # crea una nota desde _plantillas
│   └── og.mjs                     # genera public/og/default.png desde un SVG
└── src/
    ├── content.config.ts          # 17 colecciones
    ├── config/sitio.ts            # nombre, URL, repo, navegación, boletín
    ├── lib/
    │   ├── rutas.mjs              # archivo → id → URL (fuente única)
    │   ├── indice-contenido.mjs   # índice para resolver wikilinks
    │   ├── contenido.ts           # helpers de páginas (publicados, orden, URL, fechas…)
    │   └── retroenlaces.ts        # «enlazado desde»
    ├── plugins/
    │   ├── remark-wikilinks.mjs
    │   ├── remark-callouts.mjs
    │   ├── remark-bloques-codigo.mjs
    │   └── rehype-enlaces-externos.mjs
    ├── scripts/                   # JS de cliente (módulos que Astro empaqueta)
    │   ├── codigo.ts  mermaid.ts  buscador.ts  progreso.ts  toc.ts  menu.ts  filtros.ts
    ├── styles/
    │   ├── shiki-morecontext.json
    │   ├── tokens.css  base.css  componentes.css  prosa.css  portada.css
    │   └── global.css             # importa fuentes y los anteriores
    ├── components/
    │   ├── base/      Cabecera  Pie  Icono  Buscador  SaltarContenido
    │   ├── entrada/   Migas  MetaEntrada  TablaContenidos  Relacionados  Retroenlaces
    │   │              Paginador  Etiquetas  EditarEnGitHub  Dificultad  AvisoRevision
    │   ├── listados/  TarjetaEntrada  FilaLeccion  FiltroChips  ListaPorLetra
    │   ├── aprender/  ProgresoNivel  MarcarHecha  BarraCurso  FichaProyecto
    │   ├── portada/   Hero  EmpiezaAqui  IndiceGeneral  CapituloIndice  UltimosEscritos  Manifiesto
    │   └── boletin/   FormularioBoletin
    ├── layouts/
    │   ├── BaseLayout.astro       # <head>, cabecera, pie, buscador, scripts globales
    │   ├── PaginaLayout.astro     # páginas sueltas y portadillas
    │   ├── LecturaLayout.astro    # artículo + índice lateral (2 columnas)
    │   └── DocsLayout.astro       # navegación + artículo + índice (3 columnas)
    └── pages/
        ├── index.astro            # portada «El índice»
        ├── [pagina].astro         # /empieza-aqui/ /manifiesto/ /contribuir/ /sobre/ /licencia/
        ├── roadmap/index.astro    roadmap/[...slug].astro
        ├── cursos/index.astro     cursos/[...slug].astro
        ├── docs/index.astro       docs/[...slug].astro
        ├── modelos/index.astro    modelos/[slug].astro
        ├── sistemas/index.astro   sistemas/[slug].astro
        ├── patrones/index.astro   patrones/[slug].astro
        ├── disciplinas/index.astro disciplinas/[slug].astro
        ├── recetas/index.astro    recetas/[slug].astro
        ├── glosario/index.astro   glosario/[slug].astro
        ├── radar/index.astro      radar/[slug].astro
        ├── blog/index.astro       blog/[slug].astro
        ├── boletin/index.astro    boletin/[slug].astro
        ├── tags/index.astro       tags/[tag].astro
        ├── rss.xml.ts
        └── 404.astro
```

> `src/fetch.ts` es un nombre reservado en Astro 7: no lo uses.

---

## 2. Mapa de rutas

| URL | Archivo de página | Colección | Layout |
|---|---|---|---|
| `/` | `index.astro` | todas (recuentos) | `BaseLayout` + componentes de portada |
| `/empieza-aqui/`, `/manifiesto/`, `/contribuir/`, `/sobre/`, `/licencia/` | `[pagina].astro` | `paginas` | `PaginaLayout` |
| `/roadmap/` | `roadmap/index.astro` | `secciones` (`roadmap`), `niveles`, `lecciones` | `PaginaLayout` |
| `/roadmap/00-fundamentos/` | `roadmap/[...slug].astro` | `niveles` | `PaginaLayout` |
| `/roadmap/00-fundamentos/que-es-un-llm/` | `roadmap/[...slug].astro` | `lecciones` | `DocsLayout` (navegación = temario) |
| `/cursos/`, `/cursos/rag-a-fondo/`, `/cursos/rag-a-fondo/anatomia-de-un-rag/` | `cursos/…` | `secciones`, `cursos`, `leccionesCurso` | igual que roadmap |
| `/docs/`, `/docs/herramientas/`, `/docs/herramientas/uso-de-herramientas/` | `docs/…` | `secciones`, `docsGrupos`, `docs` | `PaginaLayout` / `DocsLayout` |
| `/modelos/…` `/sistemas/…` `/patrones/…` `/disciplinas/…` `/recetas/…` | `<seccion>/index.astro`, `<seccion>/[slug].astro` | su colección | listado + `LecturaLayout` |
| `/glosario/` | `glosario/index.astro` | `glosario` | `PaginaLayout` con A–Z y filtro |
| `/glosario/rag/` | `glosario/[slug].astro` | `glosario` | `LecturaLayout` (estrecho) |
| `/radar/`, `/radar/2026-10-20-…/` | `radar/…` | `radar` | línea temporal + `LecturaLayout` |
| `/blog/`, `/blog/2026-10-12-…/` | `blog/…` | `blog` | listado + `LecturaLayout` |
| `/boletin/`, `/boletin/001/` | `boletin/…` | `boletin` | archivo + `LecturaLayout` |
| `/tags/`, `/tags/rag/` | `tags/…` | todas | listado |
| `/rss.xml` | `rss.xml.ts` | `blog` + `radar` + `boletin` | — |
| `/404.html` | `404.astro` | — | `PaginaLayout` |
| `/sitemap-index.xml` | `@astrojs/sitemap` | — | — |

Toda URL se obtiene con `urlDe(entrada)` (`src/lib/contenido.ts`) o `urlDeArchivo(ruta)` (`src/lib/rutas.mjs`). **Nunca construyas URLs a mano.**

---

## 3. Fases

### Fase 0 · Preparar el proyecto

**Objetivo:** plantilla limpia en Astro 7.4 con todas las dependencias.

1. Clona tu repo con la plantilla (`website-test`) y crea la rama `feat/base`.
2. Sustituye `package.json` por `docs/codigo-verificado/package.json` (nombre, `engines` Node ≥ 22.23.4, `packageManager` pnpm 12.15.0, scripts y dependencias ya probados con `pnpm install`). Los scripts:
   ```json
   "scripts": {
     "dev": "astro dev",
     "dev:limpio": "astro dev --force",
     "validar": "node scripts/validar-contenido.mjs",
     "check": "astro check",
     "build": "node scripts/validar-contenido.mjs && astro build --force && pagefind --site dist",
     "preview": "astro preview",
     "enlaces": "node scripts/comprobar-enlaces.mjs",
     "nuevo": "node scripts/nueva-nota.mjs",
     "og": "node scripts/og.mjs",
     "astro": "astro"
   }
   ```
   > `--force` en el build es **obligatorio**: Astro guarda en caché el HTML de cada nota según su propio contenido, pero un wikilink depende de que exista *otra* nota. Sin `--force`, una página puede seguir mostrando «aún no existe» después de crear su destino.
3. Instala (equivale a lo anterior; si prefieres hacerlo a mano, estas son las versiones verificadas en octubre de 2026):
   ```bash
   pnpm add astro@^7.4.2 @astrojs/markdown-remark@^7.3.4 @astrojs/sitemap@^3.7.4 @astrojs/rss@^4.0.19 \
            pagefind@^1.5.2 mermaid@^12.2.0 unist-util-visit@^5.2.0 github-slugger@^2.0.0 yaml@^2.9.1 \
            @fontsource-variable/inter@^5.3.0 @fontsource-variable/jetbrains-mono@^5.3.0 @fontsource/patrick-hand@^5.3.0
   pnpm add -D @astrojs/check@^0.9.12 typescript@^6.0.3
   ```
   > `@astrojs/check` 0.9 trabaja con TypeScript 6; no instales TypeScript 7 todavía.
   > Si pnpm avisa de *build scripts* bloqueados (esbuild, sharp), ejecuta `pnpm approve-builds` y apruébalos.
4. Borra `src/components/Welcome.astro`, `src/assets/astro.svg`, `src/assets/background.svg` y el contenido de `src/layouts/Layout.astro` (se sustituye en la fase 3).
5. Crea `.nvmrc` con `24`. Añade a `.gitignore`:
   ```
   # Obsidian: estado personal de la bóveda
   contenido/.obsidian/workspace*.json
   contenido/.obsidian/cache
   contenido/.trash/
   ```
6. `tsconfig.json`: añade `"compilerOptions": { "allowJs": true }` (los plugins son `.mjs`).
7. `public/CNAME` con una sola línea: `morecontextai.com`. Borra `public/favicon.ico` y `public/favicon.svg` de Astro (se crean en la fase 2).
8. `LICENSE` (MIT, titular «[Tu nombre]») y `LICENSE-CONTENIDO.md` (texto corto CC BY-SA 4.0 con enlace a https://creativecommons.org/licenses/by-sa/4.0/deed.es).

**Aceptación:** `pnpm install` sin errores; `pnpm astro --version` muestra 7.4.x; `node -v` ≥ 22.23.4.
**Commit:** `chore: proyecto base en Astro 7 con dependencias`

---

### Fase 1 · El contenido como fuente

**Objetivo:** las 17 colecciones cargan los 269 archivos y cada uno tiene URL.

1. Copia `contenido/` del kit a la raíz del repo. Copia `docs/` y `CLAUDE.md`.
2. Copia **tal cual** desde `docs/codigo-verificado/` a la raíz (mismas rutas):
   `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`, `src/lib/rutas.mjs`, `src/lib/indice-contenido.mjs`, `src/lib/contenido.ts`, `src/lib/retroenlaces.ts`, `src/config/sitio.ts`, `src/plugins/*.mjs`, `src/styles/shiki-morecontext.json`, `src/scripts/*.ts`, `scripts/*.mjs`, `.github/workflows/*.yml`.
3. En `src/config/sitio.ts` cambia `USUARIO` por tu usuario u organización de GitHub y `[Tu nombre]` por tu nombre.
4. Página provisional `src/pages/index.astro` que lista, por colección, el número de entradas y sus URLs (`urlDe`). Sirve para comprobar la carga; se sustituye en la fase 5.
5. Ejecuta `pnpm validar` y `pnpm astro build`.

**Cómo funciona (lee antes de tocar nada):**
- `rutas.mjs` decide id y URL: `roadmap/40-primer-agente/02-el-bucle-agentico.md` → id `40-primer-agente/el-bucle-agentico` (colección `lecciones`) → URL `/roadmap/40-primer-agente/el-bucle-agentico/`.
- `content.config.ts` define 17 colecciones con esquema Zod (`astro/zod`). Los `index.md` de carpeta van a colecciones propias (`secciones`, `niveles`, `cursos`, `docsGrupos`); el resto, a su colección.
- `indice-contenido.mjs` recorre `contenido/` (ignora `_*` y `.*`) y construye el índice que usan los wikilinks, el validador y los retroenlaces. En desarrollo se recalcula cada 2 s.
- `remark-wikilinks` convierte `[[ruta|texto]]`, `![[imagen.png]]` y enlaces `.md` relativos; si no existe, pinta `<span class="wikilink wikilink--roto">`. En producción, un enlace a un `borrador` también sale como roto.
- `remark-callouts` convierte `> [!tipo] título` en `<aside class="callout callout--tipo">` (o `<details>` si lleva `-`/`+`).
- `remark-bloques-codigo` envuelve cada bloque en `<div class="code">` con `<div class="code__panel" data-tab data-file data-lang>`, agrupa los bloques consecutivos con `tab="…"` en `code--tabs`, y convierte ```` ```mermaid ```` en `<pre class="mermaid">`.
- Los encabezados reciben `id` automáticamente (`render(entrada)` devuelve `headings`).

**Aceptación:**
- `pnpm validar` → `269 archivos · 0 errores`.
- `pnpm astro build --force` genera **269 páginas de contenido** (más la provisional) sin avisos de esquema. (Verificado: 270 páginas en ~15 s.)
- Tras `pnpm build`, `pnpm enlaces` → `0 enlaces internos rotos` y ningún `wikilink--roto` en `dist/` (`grep -r 'class="wikilink wikilink--roto"' dist` vacío).
- En la página provisional aparecen las 17 colecciones con estos recuentos: secciones 12 · niveles 8 · lecciones 43 · cursos 8 · leccionesCurso 32 · docsGrupos 8 · docs 27 · modelos 9 · sistemas 7 · patrones 9 · disciplinas 12 · recetas 12 · glosario 59 · radar 10 · blog 7 · boletin 2 · paginas 5.
- `pnpm check` → 0 errores.

**Commit:** `feat(contenido): colecciones, plugins de Markdown y validación`

---

### Fase 2 · Sistema de diseño en CSS

**Objetivo:** todos los tokens y componentes de `docs/DISENO.md` disponibles como CSS, más los estilos del contenido Markdown.

Archivos en `src/styles/`, importados en este orden desde `global.css`:

```css
/* src/styles/global.css */
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';
@import '@fontsource/patrick-hand';
@import './tokens.css';
@import './base.css';
@import './componentes.css';
@import './prosa.css';
```

1. **`tokens.css`**: el bloque `:root` del anexo 19 de `DISENO.md` con estos cambios de familia:
   `--font-sans: "Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;`
   `--font-mono: "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;`
   `--font-hand: "Patrick Hand", "Bradley Hand", "Segoe Print", cursive;`
   Añade `--header-h: 60px; --maxw: 1200px; --lectura: 720px; --sidebar-w: 260px; --toc-w: 220px;` y la escala de espaciado `--s1: 4px` … `--s10: 88px`. Tema oscuro único: `color-scheme: dark`.
2. **`base.css`**: reset, `body` (fondo `--bg-void`, Inter 16/1.6, antialiasing), `::selection`, enlaces (cian → rosa en hover), `:focus-visible` (2 px amarillo, offset 3 px), `.sr-only`, `.wrap` (máx. 1200 px, padding lateral `max(16px, env(safe-area-inset-*))`), `.grid-bg` (retícula con máscara radial al 15 %), `html{scroll-padding-top: calc(var(--header-h) + 24px)}`, `@media (prefers-reduced-motion: reduce)` que anula animaciones.
3. **`componentes.css`**: porta desde `docs/referencia/componentes.css` y `docs/referencia/landing-indice.html` (y ajusta a tokens) estas clases: `.btn` (Terminal), `.btn.dark`, `.btn.sm`, `.btn-sketch`, `.link`, `.label`, `.tag` (+ variantes de color), `.chip[aria-pressed]`, `.dots`, `.note` (manuscrita), `.card` / `a.card`, `.panel`, `.table-wrap` + `table.dg`, `.search-xl`, `.input`, `.key`/`kbd`, `.progress`, `.check`, `.pager`, `details.faq`, `.steps`, cabecera (`.hdr`, `.nav`, `.dd`, `.mnav`, `.menu-btn`, `.search-mini`), pie (`.site-foot`), paleta (`dialog.buscador`), `.toast`, layouts (`.docs-layout`, `.side-nav`, `.toc`, `.lectura-layout`), y los de la portada (`.wm`, `.qbox`, `.quick`, `.routes`, `.ix-*`, `.lead-line`) en un `portada.css` aparte que solo importa `index.astro`.
4. **`prosa.css`** (todo bajo `.prosa`, el contenedor del Markdown renderizado):
   - `h2` 24 px Inter 600 con borde inferior 1 px y `margin-top: 56px`; `h3` 19 px; `p, li` color `--text-2` peso 300, máx. 65ch; `strong` `--text` 500; listas con marcador mono gris; `hr` discontinua; `blockquote` simple (borde izquierdo 2 px `--border-2`).
   - Anclas de encabezado: el script `toc.ts` añade un `#` al pasar el ratón.
   - `code` en línea: fondo `--code-bg`, borde 1 px, cian, radio 2 px.
   - Tablas: `.prosa table { display:block; overflow-x:auto; }` + estilo `.dg`.
   - **Wikilinks**: `.wikilink` cian con subrayado discontinuo; `.wikilink--roto` gris `--text-faint`, subrayado punteado, `cursor: help`.
   - **Enlaces externos**: `a.ext::after { content: "↗"; font-size: .8em; margin-left: 2px; }`.
   - **Avisos**: `.callout` según `DISENO.md` §9 (fondo `--callout-bg`, borde izquierdo 4 px del color del tipo, cinta adhesiva con `::before`), `.callout__titulo`, `.callout__tipo` (mono 11 px mayúsculas con el color del tipo, seguido del título). Colores: `info`/`pregunta` cian, `consejo` verde, `aviso`/`ejercicio` amarillo, `peligro` rojo, `ejemplo`/`cita` gris. `details.callout > summary` con cursor y marcador `+`/`−` en mono.
   - **Código**: `.code` (fondo `--code-bg`, borde, radio 4 px, margen 24 px 0), `.code__bar` (pestañas, nombre de archivo mono 12 px, botón Copiar con sombra dura pequeña), `.code__tab[aria-selected=true]` amarillo con subrayado a mano (`radius-sketch`, `rotate(-.8deg)`), `.code__copy.is-ok` verde, `.code__panel[hidden]{display:none}`, `pre.astro-code` (padding 18 px 20 px, 13.5 px / 1.75, `overflow-x:auto`, sin fondo propio). Comentarios manuscritos: `.astro-code span[style*="color:#71717A"] { font-family: var(--font-hand); font-size: 1.12em; letter-spacing: .02em; }`. El primer bloque de cada lección o doc puede llevar `.code.lg` (sombra dura 8 px) desde el layout si quieres destacarlo.
   - **Mermaid**: `pre.mermaid { background: none; border: 1px solid var(--border); border-radius: 4px; padding: 24px; text-align: center; overflow-x: auto; }` y `pre.mermaid:not([data-processed]) { color: transparent; min-height: 120px; }` para no mostrar el código mientras carga.
   - Imágenes: `max-width: 100%`, borde 1 px, radio 4 px.
5. **Favicon y marca** en `public/`: `favicon.svg` (el SVG `[+]` de `DISENO.md` §19), `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `site.webmanifest` (`name`, `short_name: "MoreContext"`, `theme_color` y `background_color` `#0f0f11`, `display: "standalone"`). Genera los PNG con `sharp` (ya viene con Astro) desde el SVG en `scripts/og.mjs`, que también crea `public/og/default.png` (1200×630, fondo void con retícula, `[+] morecontext` y el eslogan).
6. **Componente `Icono.astro`** con `nombre` ∈ `marca | buscar | flecha | externo | copiar | check | aviso | info | consejo | peligro | menu | cerrar | github | rss | reloj | nivel`: SVG inline de trazo 1.5 px, `currentColor`, `aria-hidden="true"`.

**Aceptación:** una página `/_estilos/` temporal (bórrala al final de la fase) que muestre cada componente y un fragmento Markdown real (`render()` de `roadmap/40-primer-agente/02-el-bucle-agentico`) con avisos, pestañas, Mermaid, tablas, wikilinks y un wikilink roto. Se ve igual que la referencia, sin desbordes a 400 px.
**Commit:** `feat(estilos): tokens, componentes y prosa del design system`

---

### Fase 3 · Layouts y componentes base

**Objetivo:** la carcasa común de todas las páginas.

#### 3.1 `BaseLayout.astro`
Props: `titulo: string`, `descripcion: string`, `seccion?: string` (clave de `NOMBRE_SECCION`), `tipo?: 'website' | 'article'`, `imagen?: string`, `noindex?: boolean`, `jsonld?: object | object[]`, `fecha?: Date`, `actualizado?: Date`.
- `<html lang="es">`; `<head>`: charset, viewport (`width=device-width, initial-scale=1, viewport-fit=cover`), `<title>` = `titulo === SITIO.nombre ? "MoreContext · Más contexto, menos ruido" : \`${titulo} · MoreContext\``, `description`, `canonical` (`new URL(Astro.url.pathname, Astro.site)`), Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:image` → `/og/default.png` absoluto, `og:locale` `es_ES`, `og:site_name`), Twitter `summary_large_image`, `article:published_time` / `modified_time` si hay fechas, `theme-color` `#0f0f11`, `color-scheme` `dark`, iconos y manifest, `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`, `<link rel="sitemap" href="/sitemap-index.xml">`, JSON-LD (`<script type="application/ld+json" set:html={JSON.stringify(jsonld)}>`), `noindex` si procede.
- `import '../styles/global.css'`.
- `<body>`: `<a class="sr-only" href="#main">Saltar al contenido</a>`, `<Cabecera />`, `<slot />` (cada layout pone su `<main id="main">`), `<Pie />`, `<Buscador />`.
- Scripts globales (Astro los empaqueta como módulos): `import '../scripts/codigo.ts'`, `'../scripts/mermaid.ts'`, `'../scripts/buscador.ts'`, `'../scripts/menu.ts'`, `'../scripts/progreso.ts'` dentro de un `<script>`.

#### 3.2 `Cabecera.astro`
- Sticky (`top: env(safe-area-inset-top, 0px)`), fondo `--bg-overlay` con blur, borde inferior.
- Logo: `<Icono nombre="marca" />` (28 px) + `morecontext` en mono 700, enlace a `/`.
- Navegación de escritorio: botón desplegable **Aprender** (`PARTES[0].enlaces` con nota y dato a la derecha: nº de niveles, horas, nº de cursos calculados con colecciones) + `NAV`. `aria-current="page"` si `Astro.url.pathname.startsWith(href)`.
- Derecha: botón buscar (`data-buscar`, placeholder manuscrito «buscar…», `<kbd data-kbd>Ctrl K</kbd>`), `.btn.sm` «$ Empezar» → `/empieza-aqui/`, botón menú (≤ 1120 px).
- Menú móvil (`<nav id="mnav" hidden>`): las 5 `PARTES` en columnas con su número romano.
- `menu.ts`: abre/cierra desplegable y menú móvil (aria-expanded, Escape, clic fuera).

#### 3.3 `Pie.astro`
Rejilla: logo + eslogan + descripción · una columna por parte (I–V) · columna «Proyecto» con `/manifiesto/`, `/contribuir/`, `/sobre/`, `/licencia/`, `/tags/`, `/rss.xml`, repo GitHub. Franja legal: «© 2026 MoreContext · contenido CC BY-SA 4.0 · código MIT» y «Pulsa <kbd>/</kbd> para buscar».

#### 3.4 `Buscador.astro`
`<dialog id="buscador" class="buscador" aria-label="Buscar en MoreContext">` con input `type=search`, lista `<ul data-resultados>`, pie con atajos. Lógica en `src/scripts/buscador.ts` (ya escrita). Ver fase 6.

#### 3.5 Componentes de entrada (`src/components/entrada/`)
| Componente | Props | Qué hace |
|---|---|---|
| `Migas` | `items: {href?, texto}[]` | Ruta mono 12 px separada por `/`; último sin enlace con `aria-current="page"`. Emite JSON-LD `BreadcrumbList` (opcional vía prop). |
| `MetaEntrada` | `entrada` | Fila mono 12 px: fecha (creado/actualizado con `fecha()`), minutos de lectura (`minutosLectura(entrada.body)`) o `minutos` del frontmatter, nivel (`Dificultad`), tags (`Etiquetas`). |
| `TablaContenidos` | `headings`, `max?=3` | «En esta página», `h2` y `h3` (sangrado), marcador rosa que sigue el scroll (`toc.ts` con `IntersectionObserver`); oculto < 1240 px. |
| `Relacionados` | `lista: string[]` | `resolverEnlaces()` → lista con flecha. Título «Relacionado». No se pinta si está vacía. |
| `Retroenlaces` | `url` | `await retroenlaces(url)` → «Enlazado desde» (máx. 12, con sección en mono). No se pinta si está vacía. |
| `Paginador` | `anterior?`, `siguiente?` (`{href, titulo, etiqueta?}`) | Dos tarjetas «Anterior» / «Siguiente». |
| `Etiquetas` | `tags` | `.tag` enlazados a `/tags/<tag>/`. |
| `EditarEnGitHub` | `filePath` | `${SITIO.repo}/edit/${SITIO.ramaEdicion}/${filePath}` · «Editar en GitHub» + «Ver historial». |
| `Dificultad` | `valor: 1–3 \| 'inicial'…` | `.dots` con 3 cuadritos + texto accesible. |
| `AvisoRevision` | `estado` | Si `revision`: aviso amarillo «En revisión: este texto puede cambiar». |

#### 3.6 Layouts
- **`PaginaLayout`** (props de Base + `migas?`, `lead?`, `ancho?: 'lectura' | 'completo'`): `<main id="main">` con cabecera de página (`.grid-bg`, migas, `h1.display` mono 32–48 px, `lead`), `<div class="prosa" data-pagefind-body>` con `<slot />`, y slots `antes` / `despues`.
- **`LecturaLayout`** (props: `entrada`, `headings`, `migas`, `seccion`): 2 columnas (`minmax(0,1fr) var(--toc-w)`), cabecera con migas, `h1.h1-doc` (Inter 700), descripción como lead, `MetaEntrada`, `AvisoRevision`; cuerpo `.prosa`; al final `Relacionados`, `Retroenlaces`, `Paginador` (slot), `EditarEnGitHub`. TOC sticky a la derecha.
- **`DocsLayout`** (igual + `navegacion: {titulo, items: {href, titulo, actual, hecho?, grupo?}[]}`): 3 columnas (`var(--sidebar-w) minmax(0,1fr) var(--toc-w)`). La navegación es sticky, agrupada, con el enlace activo en cian + degradado; < 900 px se convierte en un `<details>` «Índice de la sección» encima del artículo.
- En los tres: `data-pagefind-body` en el contenedor del contenido, `<h1 data-pagefind-meta="title">` y `<span hidden data-pagefind-filter="seccion">{NOMBRE_SECCION[seccion]}</span>`.

**Aceptación:** una página de prueba con cada layout se ve correcta a 400, 768, 1024 y 1440 px; teclado (Tab, Escape en menús); sin errores en consola.
**Commit:** `feat(layouts): carcasa, cabecera, pie y componentes de entrada`

---

### Fase 4 · Páginas de contenido

**Objetivo:** todas las rutas del mapa (§2) generadas con su plantilla.

Patrón común de cada `[slug].astro` / `[...slug].astro`:

```astro
---
import { render } from 'astro:content';
import LecturaLayout from '../../layouts/LecturaLayout.astro';
import { publicados, porOrden, vecinos, urlDe } from '../../lib/contenido';

export async function getStaticPaths() {
  const todos = (await publicados('patrones')).sort(porOrden);
  return todos.map((e) => ({ params: { slug: e.id }, props: { e, ...vecinos(todos, e.id) } }));
}
const { e, anterior, siguiente } = Astro.props;
const { Content, headings } = await render(e);
---
<LecturaLayout entrada={e} headings={headings} seccion="patrones"
  migas={[{ href: '/', texto: 'Inicio' }, { href: '/patrones/', texto: 'Patrones' }, { texto: e.data.titulo }]}>
  <Content />
  <Paginador slot="paginador"
    anterior={anterior && { href: urlDe(anterior), titulo: anterior.data.titulo }}
    siguiente={siguiente && { href: urlDe(siguiente), titulo: siguiente.data.titulo }} />
</LecturaLayout>
```

Las portadillas (`<seccion>/index.astro`) cargan su texto de la colección `secciones`: `const s = await getEntry('secciones', 'patrones'); const { Content } = await render(s);`.

| Página | Contenido específico |
|---|---|
| `[pagina].astro` | `PaginaLayout` con el Markdown. `/empieza-aqui/` lleva además un **test de nivel** interactivo (3 preguntas con botones; `filtros.ts` muestra la ruta A/B/C/D recomendada y enlaza a su ancla). |
| `roadmap/index.astro` | Portadilla + tarjeta de progreso global (`ProgresoNivel` con todos los ids) + **filas de nivel**: número grande mono (`00`…`100`), título, objetivo, horas, nº de lecciones, progreso del nivel; enlace a la ficha. Nota manuscrita: «no te saltes el 20». |
| `roadmap/[...slug].astro` | Si es nivel: ficha (objetivo, horas, prerrequisitos con `resolverEnlaces`, `FichaProyecto` con título/descripción/entregable), Markdown, lista de lecciones con `MarcarHecha` + minutos + tipo, `Paginador` entre niveles. Si es lección: `DocsLayout` con navegación = todos los niveles y lecciones (nivel actual abierto, ✓ si hecha), cabecera con «Lección 40.2» (`nivel.data.nivel` + `orden`), objetivos en `.panel`, Markdown, `MarcarHecha`, `Paginador` a la lección anterior/siguiente **cruzando niveles**. |
| `cursos/*` | Igual que roadmap: índice de cursos en tarjetas (nivel, horas, nº lecciones, objetivo), ficha de curso, lección con navegación del curso. |
| `docs/index.astro` | Portadilla + `.search-xl` (`data-form-buscar`) + rejilla de 8 grupos con sus artículos (orden). |
| `docs/[...slug].astro` | Grupo: intro + lista de artículos. Artículo: `DocsLayout` con navegación de toda la documentación por grupos. |
| `modelos/index.astro` | Lista **numerada** (el orden importa): título, descripción, minutos. |
| `sistemas/index.astro` | Tarjetas: complejidad (`Dificultad`), tiempo, `stack` (tags), componentes (lista corta), patrones usados. Ficha: además una cabecera de datos con esos campos. |
| `patrones/index.astro` | Tres bloques por `tipo` (fundamento, workflow, agente) y tabla comparativa: patrón · cuándo usar · coste · latencia. |
| `disciplinas/index.astro` | Dos columnas: Disciplinas · Formas de trabajar. |
| `recetas/index.astro` | `FiltroChips` por `tema` y por `nivel` (combinables, contador «N de 12», estado vacío con «Ver todas») + tarjetas con minutos, nivel y stack. |
| `glosario/index.astro` | Índice A–Z (letras sin términos atenuadas), filtro en vivo (`filtros.ts`: busca en título, alias y descripción sin tildes; contador; vacío con botón «Buscar en todo» que abre la paleta), términos agrupados por letra (`ListaPorLetra`) con `descripcion` y enlace «ampliar». Cada término con `id` = su id para enlazar `/glosario/#rag`. |
| `glosario/[slug].astro` | `LecturaLayout` estrecho: categoría, término inglés, definición, «Ver también», retroenlaces (muy útiles aquí). |
| `radar/index.astro` | Criterio editorial (de la portadilla) + filtro por `categoria` + línea temporal agrupada por mes: fecha mono, categoría, título, descripción. |
| `blog/index.astro` | Destacado arriba (`destacado: true`) + lista por fecha con `tipo` y minutos. |
| `boletin/index.astro` | `FormularioBoletin` + archivo de números (n.º, fecha, título). |
| `tags/index.astro`, `tags/[tag].astro` | Nube/lista de etiquetas con recuento; listado de todas las entradas (de cualquier colección) con ese tag, agrupadas por sección. |
| `rss.xml.ts` | `@astrojs/rss`: blog + radar + boletín, orden por fecha, `link: urlDe(e)`, `description`, `pubDate: creado`. Título «MoreContext», descripción el eslogan. |
| `404.astro` | «Esta página no existe (todavía)» + buscador + enlaces a `/`, `/empieza-aqui/`, `/glosario/`. |

**JSON-LD por tipo:** lecciones y fichas de curso/nivel → `LearningResource` (`educationalLevel`, `timeRequired` ISO 8601 `PT25M`); docs, modelos, patrones, sistemas, disciplinas, recetas → `TechArticle`; glosario → `DefinedTerm` con `inDefinedTermSet` (`/glosario/`); blog y radar → `BlogPosting`; todas con `inLanguage: "es"`, `author`/`publisher` desde `SITIO`.

**Aceptación:**
- `pnpm build` genera ≥ 290 páginas (269 de contenido + portadillas + tags + 404 + home).
- `pnpm enlaces` → 0 enlaces internos rotos.
- Revisión visual de una página de cada tipo a 400 y 1440 px.

**Commit:** `feat(paginas): rutas de todas las secciones`

---

### Fase 5 · Portada «El índice»

**Objetivo:** `docs/referencia/landing-indice.html` convertida en `src/pages/index.astro`, **con todos los datos sacados del contenido**.

1. Divide la referencia en componentes de `src/components/portada/` y su CSS en `src/styles/portada.css`:
   - `Hero`: línea de edición («la guía abierta de agentes de IA · en español · revisado el {fecha}»: fecha = máximo de `actualizado ?? creado` de todo el contenido), wordmark grande `[+] morecontext` con «context» subrayado, eslogan, frase de gratuidad, buscador `qbox` (`<form data-form-buscar>`, placeholder manuscrito «¿qué no entiendes todavía?», pistas `/` y `Ctrl K`), chips `data-buscar="tool use"`, etc., pie con cifras **calculadas**: «{n} niveles · {lecciones} lecciones · ~{horas} h», «{términos} términos», «CC BY-SA · MIT».
   - `EmpiezaAqui`: 4 rutas A–D (texto y secuencia de la referencia) que enlazan a las anclas reales de `paginas/empieza-aqui.md` (verificadas en el build; Astro conserva las tildes): `#nunca-he-usado-la-api-de-un-modelo`, `#ya-uso-llms-y-quiero-construir-agentes`, `#quiero-llevar-algo-a-producción`, `#trabajo-en-producto-o-gestión`. Botón «Haz el test de nivel» → `/empieza-aqui/#test-de-nivel`. Si el autor cambia esos encabezados, `pnpm enlaces` detectará el ancla rota.
   - `IndiceGeneral` + `CapituloIndice`: cinco partes (I Aprender, II Consultar, III Construir, IV Trabajar, V Estar al día) con número romano y título fijo a la izquierda (sticky) y capítulos numerados con **líneas de puntos** hasta el dato (`.lead-line`). Fuente de cada capítulo:

     | Capítulo | Entradas | Dato a la derecha |
     |---|---|---|
     | Empieza aquí | Test de nivel + rutas A–D | «3 preguntas», «ruta A»… |
     | Roadmap 0→100 | 8 niveles (`niveles` por `nivel`) | «{n} lec · {horas} h» |
     | Cursos específicos | 8 cursos (`porOrden`) | «{n} lec · {horas} h» |
     | Documentación | 8 grupos | «{n} artículos» |
     | Guía de modelos | 9 guías | «{min} min» |
     | Glosario | términos por categoría (8 categorías) | «{n} términos» |
     | Sistemas | 7 sistemas | complejidad en `.dots` + tiempo |
     | Patrones | 9 patrones | `tipo` |
     | Recetas | 12 recetas | «{minutos} min» |
     | Disciplinas | 6 disciplinas | — |
     | Formas de trabajar | 6 formas | — |
     | Radar | 5 últimas | fecha corta |
     | Blog y ensayos | 5 últimos | fecha + `tipo` |
     | Boletín | últimos números | n.º y fecha |

     Marca `nuevo` (`esNuevo(e, 30)`) en la entrada. Cada línea lleva `data-k` con tags y aliases (para el filtrado local de la referencia si lo mantienes).
   - **Apéndices**: solo páginas que existan: Manifiesto, Cómo contribuir, Sobre, Licencia, Etiquetas (`/tags/`), RSS. Los apéndices de la referencia sin contenido (Plantillas, Herramientas, Biblioteca, Laboratorio, Problemas frecuentes, Comunidad) **no se muestran** hasta que existan (fase 13). Nunca enlaces a algo que no existe.
   - `UltimosEscritos`: ensayo destacado (o el más reciente) + 3 anteriores + `FormularioBoletin`.
   - `Manifiesto`: 4 bloques (Gratis · Abierto · Sin humo · Cómo se financia) con texto de `paginas/manifiesto.md` (`descripcion`) y enlace a la página.
2. Conserva el comportamiento de la referencia: partes con título sticky, chips que abren la paleta, `/` y `Ctrl K`.
3. La portada no lleva `data-pagefind-body` (no se indexa como resultado).

**Aceptación:** comparada lado a lado con la referencia a 1440 y 400 px, misma composición; todas las cifras coinciden con el contenido (prueba añadiendo una lección: los recuentos cambian solos); `pnpm enlaces` 0 rotos.
**Commit:** `feat(portada): El índice conectado al contenido`

---

### Fase 6 · Búsqueda

1. `pnpm build` ya ejecuta `pagefind --site dist` (crea `dist/pagefind/`).
2. Atributos (fase 3): `data-pagefind-body` solo en contenido; `data-pagefind-meta="title"` en el `h1`; `data-pagefind-filter="seccion"`; `data-pagefind-ignore` en navegación, TOC, retroenlaces, paginador y pie de entrada.
3. En el glosario, añade `data-pagefind-weight="2"` al `h1` de cada término (las definiciones deben salir primero).
4. `buscador.ts` (copiado en la fase 1): import dinámico de `/pagefind/pagefind.js`, `debouncedSearch`, 12 resultados con título, sección y extracto, navegación con flechas, Enter, Escape (el `<dialog>` lo cierra), clic fuera, `/` y `Ctrl/⌘+K`. En `pnpm dev` muestra un aviso y enlaza al glosario.
5. Estilos `dialog.buscador`: modal centrado a 10vh, ancho máx. 640 px, fondo `--bg-surface`, sombra `--shadow-lg`; `::backdrop` `--bg-overlay` con blur; resultado activo con borde izquierdo cian y degradado; `mark` en amarillo.

**Aceptación:** tras `pnpm build && pnpm preview`, buscar «rag», «tool_use», «inyección», «mcp» devuelve resultados relevantes con el glosario primero; teclado completo; móvil usable.
**Commit:** `feat(busqueda): paleta con Pagefind`

---

### Fase 7 · Segundo cerebro

1. **Retroenlaces** en todas las páginas de contenido (`Retroenlaces`).
2. **Etiquetas** (`/tags/`).
3. **Editar en GitHub** en todas las páginas de contenido.
4. **Notas nuevas**: `scripts/nueva-nota.mjs` → `pnpm nuevo <tipo> <ruta> "<Título>"`: copia `contenido/_plantillas/<tipo>.md` a `contenido/<ruta>.md`, sustituye `{{title}}` y `{{date:YYYY-MM-DD}}`, deja `estado: borrador` y avisa si la ruta ya existe o el nombre no cumple las reglas. Tipos = nombres de archivo de `_plantillas/`.
5. **Borradores**: con `estado: borrador` no se publican en producción (filtro de `publicados()` y del plugin de wikilinks); en `pnpm dev` se ven con un aviso «Borrador».
6. **Obsidian**: abre `contenido/` como bóveda. La configuración incluida usa enlaces con ruta completa, plantillas en `_plantillas` y adjuntos en `_adjuntos`. Documenta el flujo en `README.md`.

**Aceptación:** crear un término con `pnpm nuevo termino glosario/prueba "Prueba"`, enlazarlo desde una lección, verlo en dev con su retroenlace, comprobar que en build no aparece mientras sea borrador y que `pnpm validar` avisa del enlace a un borrador.
**Commit:** `feat(cerebro): retroenlaces, etiquetas, edición y notas nuevas`

---

### Fase 8 · Progreso de aprendizaje

1. `MarcarHecha` (`<label class="check"><input type="checkbox" data-leccion="roadmap/40-primer-agente/el-bucle-agentico"> Marcar como hecha</label>`). El id es `<carpeta>/<id>` para que roadmap y cursos no choquen.
2. `ProgresoNivel` (`data-progreso-de="id1,id2,…"` con `[data-barra]` y `[data-texto]`) en: ficha de nivel, `/roadmap/` (global y por nivel), fichas de curso, navegación lateral (✓ por lección).
3. «Continúa donde lo dejaste» en `/roadmap/`: primera lección no hecha (script pequeño que lee `mc.progreso`).
4. Botón «Borrar progreso» con doble confirmación (ya en `progreso.ts`).
5. Texto visible: «Tu progreso se guarda solo en este navegador.»

**Aceptación:** marcar lecciones en una página se refleja en las demás tras recargar; funciona en modo privado sin errores (sin persistencia).
**Commit:** `feat(aprender): progreso local`

---

### Fase 9 · Boletín

1. `FormularioBoletin`: si `SITIO.boletin.action` tiene URL, `<form method="post" action={action} target="_blank">` con `input[type=email][name={campoEmail}]` y botón; si está vacío, texto «Próximamente. Mientras, sigue el RSS» con enlace a `/rss.xml`. Sin JavaScript obligatorio.
2. Escoge proveedor (Buttondown, Brevo, MailerLite…), crea la lista, pega la URL del formulario en `sitio.ts`.
3. Cada número se escribe en `contenido/boletin/NNN.md` y se envía desde el proveedor (copiando el HTML de la página publicada o importando el RSS).

**Commit:** `feat(boletin): formulario y archivo`

---

### Fase 10 · SEO, rendimiento y accesibilidad

1. `public/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://morecontextai.com/sitemap-index.xml`.
2. `@astrojs/sitemap` ya configurado; excluye `/404/` y páginas `noindex`.
3. Comprueba JSON-LD con el validador de schema.org en 5 páginas de tipos distintos.
4. Rendimiento: Lighthouse móvil ≥ 95 en Rendimiento, Accesibilidad, Buenas prácticas y SEO en portada, una lección, un doc y el glosario. Fuentes con `font-display: swap` (Fontsource lo trae). Mermaid solo carga si hay diagrama.
5. Accesibilidad: contraste AA (usa los tokens), foco visible, `aria-current`, `<dialog>` del buscador accesible, encabezados en orden, `lang="es"`, textos alternativos, áreas táctiles ≥ 36 px, `prefers-reduced-motion`.

**Commit:** `chore(seo): metadatos, sitemap, robots y auditoría`

---

### Fase 11 · Publicación en GitHub Pages

1. Workflows (copiados en la fase 1):
   - `deploy.yml`: en push a `main`, `withastro/action@v6` (Node 24, pnpm) ejecuta `pnpm build` (que valida, construye e indexa) y `actions/deploy-pages@v5` publica.
   - `ci.yml`: en PR y ramas: `pnpm validar`, `pnpm check`, `pnpm build`, `pnpm enlaces`.
2. En GitHub: **Settings → Pages → Source: GitHub Actions**.
3. DNS en tu proveedor del dominio:
   - 4 registros **A** para `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - (Opcional IPv6) 4 registros **AAAA**: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
   - **CNAME** `www` → `USUARIO.github.io`.
4. **Settings → Pages → Custom domain**: `morecontextai.com`; espera a que verifique y marca **Enforce HTTPS**.
5. **Verifica el dominio** en la configuración de tu cuenta u organización (Settings → Pages → Verified domains) para que nadie pueda usarlo en otro repo.
6. `astro.config.mjs` ya tiene `site: 'https://morecontextai.com'` y **no** usa `base`.

**Aceptación:** `https://morecontextai.com` sirve la portada con HTTPS; `https://www.morecontextai.com` redirige; una URL inexistente muestra el 404 propio; el buscador funciona en producción.

---

### Fase 12 · Control de calidad final

Checklist (todo en verde antes de anunciar la web):

- [ ] `pnpm validar` 0 errores · `pnpm check` 0 errores · `pnpm build` sin avisos · `pnpm enlaces` 0 rotos · `grep -r 'class="wikilink wikilink--roto"' dist` vacío.
- [ ] Sin scroll horizontal a 360, 400, 768, 1024, 1280 y 1440 px en: portada, `/roadmap/`, una lección, `/docs/`, un doc, `/glosario/`, un término, `/recetas/`, una receta, `/patrones/`, un sistema, `/radar/`, `/blog/`.
- [ ] Consola sin errores en esas páginas.
- [ ] Pestañas Python/TypeScript sincronizadas entre páginas; Copiar funciona y muestra «Copiado».
- [ ] Mermaid se dibuja con los colores de la marca (lección 40.2, un sistema, un patrón).
- [ ] Avisos de los 8 tipos y uno plegable se ven bien.
- [ ] Wikilink roto se ve en gris y `pnpm validar` lo detecta.
- [ ] Búsqueda en producción; teclado completo.
- [ ] Progreso: marcar, ver en otra página, borrar.
- [ ] Lighthouse ≥ 95 (fase 10).
- [ ] Prueba con lector de pantalla (VoiceOver o NVDA) de la portada y una lección.
- [ ] Revisa los textos marcados con `[Tu nombre]` y la financiación en `paginas/manifiesto.md` y `paginas/sobre.md`.
- [ ] Reescribe con tu voz los 7 textos del blog (`estado: revision`).

Opcional: `scripts/smoke.mjs` con Playwright (`pnpm add -D playwright`) que abra esas páginas a 400 y 1440 px tras `pnpm preview`, compruebe `scrollWidth`, errores de consola, que hay `svg` dentro de `pre.mermaid` y que Ctrl+K abre el diálogo.

---

### Fase 13 · Después del lanzamiento (backlog ordenado)

1. **Problemas frecuentes** (`contenido/problemas/`): síntoma → causa → arreglo, con enlaces. Alta demanda en buscadores.
2. **Plantillas** descargables (`contenido/plantillas/`): prompts de sistema, specs, checklists, sets de evals.
3. **Biblioteca**: papers comentados (`contenido/biblioteca/`).
4. **Herramientas**: directorio curado del ecosistema, sin afiliados.
5. **Laboratorio**: calculadora de tokens y costes (precios introducidos por el usuario), ejercicios en el navegador.
6. **Comunidad**: comentarios con Giscus (GitHub Discussions) en lecciones y blog; página de proyectos de la comunidad.
7. **Imágenes OG por página** generadas en build (satori + sharp).
8. **Grafo** de notas (vista tipo Obsidian) en `/mapa/`.
9. **Versión en inglés** (i18n de Astro) cuando el contenido en español esté estable.

Cada uno: nueva colección en `content.config.ts`, carpeta en `contenido/`, plantilla en `_plantillas/`, sección en `rutas`/`NOMBRE_SECCION`, `SECCIONES` del validador, página índice y de detalle, entrada en la portada (apéndices) y en el pie.

---

## 4. Riesgos conocidos y cómo evitarlos

| Riesgo | Síntoma | Cómo evitarlo |
|---|---|---|
| Astro 7 usa Sätteri por defecto | Los plugins no hacen nada | `markdown.processor: unified({…})` (ya en `astro.config.mjs`). |
| `compressHTML` en Astro 7 usa reglas JSX | Espacios que desaparecen entre elementos en línea | Configurado `compressHTML: true` (reglas HTML). |
| Compilador Rust más estricto | Error de build por etiqueta sin cerrar o `<div>` dentro de `<p>` | HTML válido siempre; revisa el error, no lo silencies. |
| `src/fetch.ts` reservado | Comportamiento extraño de rutas | No uses ese nombre. |
| Barras finales | 404 en enlaces sin `/` final | Usa siempre `urlDe()` / `urlDeArchivo()`; `trailingSlash: 'always'`. |
| Pagefind en `dev` | La paleta «no encuentra nada» | Normal: el índice se crea en `pnpm build`. Prueba con `pnpm preview`. |
| Caché de contenido de Astro | Una página sigue mostrando un wikilink en gris aunque ya creaste la nota destino | El build usa `astro build --force`. En desarrollo, guarda la página que enlaza o reinicia con `pnpm dev:limpio`. |
| Doble normalización de URLs | Fichas de nivel en `/roadmap/primer-agente/` en vez de `/roadmap/40-primer-agente/` | `urlDe()` usa el id tal cual (ya normalizado por `generarId`). No lo pases por `urlDeArchivo()`. |
| `astro preview` en Astro 7 | «Preview server already running» | Se queda en segundo plano: `pnpm astro preview stop`. |
| Fechas en YAML | `creado` como texto | Escribe `creado: 2026-10-20` sin comillas. |
| Nombres con tildes o ñ | `pnpm validar` falla | Minúsculas, sin tildes ni ñ, guiones. |
| Anclas de encabezados | `[[nota#Sección]]` no salta | El plugin usa `github-slugger`, igual que Astro; escribe el texto exacto del encabezado. |
| Dominio sin verificar | Alguien podría apuntar tu dominio a otro repo | Verifícalo (fase 11, paso 5). |
| `base` configurado | CSS y enlaces rotos en producción | Con dominio propio, **no** uses `base`. |
| Mermaid pesado | Lighthouse baja en páginas con diagramas | Carga diferida (ya hecho); diagramas pequeños. |
| pnpm bloquea scripts de instalación | Avisos al instalar | `pnpm approve-builds`. |

---

## 5. Cómo trabajar con Claude Code en este plan

- Una fase por sesión. Al empezar: «Lee `CLAUDE.md` y la fase N de `docs/PLAN-IMPLEMENTACION.md`. Hazla entera.»
- Al terminar cada fase: ejecuta los comandos de aceptación, enseña capturas a 400 y 1440 px (Playwright) y propone el commit.
- Si algo del plan no encaja con la realidad (una API cambió, un paquete no existe), Claude Code debe **parar y explicarlo** con la alternativa propuesta, no improvisar en silencio.
- El contenido de `contenido/` no se reescribe salvo petición expresa: es tuyo. Claude Code puede corregir frontmatter o enlaces si el validador lo exige, y debe decir qué cambió.
