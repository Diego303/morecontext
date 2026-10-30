# CLAUDE.md · MoreContext

Memoria del proyecto para Claude Code. Léela entera al empezar cada sesión.

## Qué es

**MoreContext** (morecontextai.com): la referencia abierta y gratuita en español para entender y construir agentes de IA. Eslogan: «Más contexto, menos ruido». Web estática en **Astro 7** publicada en **GitHub Pages**. Todo el contenido son archivos Markdown en `contenido/`, que también es una bóveda de Obsidian (el segundo cerebro del autor).

## Documentos de referencia (en `docs/`)

- `PLAN-IMPLEMENTACION.md`: plan por fases. **Es la fuente de verdad de qué construir y en qué orden.**
- `DISENO.md`: marca y design system (tokens, tipografía, componentes, qué sí / qué no).
- `GUIA-CONTENIDO.md`: convenciones de `contenido/` (frontmatter, wikilinks, avisos, código, Mermaid, voz).
- `MAPA-CONTENIDO.md`: árbol canónico del contenido.
- `referencia/landing-indice.html`: portada aprobada; `referencia/componentes.css`: componentes ya diseñados.
- `codigo-verificado/`: código probado en build real; se copia tal cual en la fase 1.
- `integracion/`: integración del paquete de contenido v2 (`INVENTARIO.md`: reglas, mapeo de campos, plan y registro por fase).
- `investigacion/`: informes de investigación (vanguardia y open source) en los que se basa el contenido v2, con sus ejemplos. No se publican.
- `marca/`: README de los kits de marca (`morecontext-icono-v1`, icono [+] y favicon; `morecontext-animaciones-v1`, icono animado).

## Comandos

```bash
pnpm dev            # http://localhost:4321 (la búsqueda no funciona en dev: necesita build)
pnpm dev:limpio     # dev borrando la caché de contenido (wikilinks recién resueltos)
pnpm validar        # frontmatter, nombres de archivo, wikilinks, URLs duplicadas
pnpm check          # tipos (astro check)
pnpm build          # validar + astro build --force + pagefind
pnpm preview        # sirve dist/ (con búsqueda)
pnpm enlaces        # enlaces internos rotos en dist/
pnpm nuevo <plantilla> <ruta> "<Título>"   # nota nueva desde contenido/_plantillas
```

Node ≥ 22.23.4 (CI en Node 24). Gestor: pnpm.

## Arquitectura en una pantalla

- `contenido/<seccion>/…md` → colección (`src/content.config.ts`, 22 colecciones, Zod de `astro/zod`, loader `glob`).
- **Una sola regla de URLs**: `src/lib/rutas.mjs` (`normalizarId`, `urlDeArchivo`, `generarId`) y `urlDe()` en `src/lib/contenido.ts`. Nunca construyas URLs a mano. Todas acaban en `/`.
- Markdown con `unified()` de `@astrojs/markdown-remark` (Astro 7 usa Sätteri por defecto; aquí no):
  `remark-wikilinks` (`[[ruta|texto]]`, `![[img]]`, enlaces `.md`), `remark-callouts` (`> [!consejo]`), `remark-bloques-codigo` (marco `.code`, pestañas `tab="…"`, Mermaid), `rehype-enlaces-externos`.
- Shiki con tema propio `src/styles/shiki-morecontext.json`. Mermaid en cliente con carga diferida. Búsqueda con Pagefind (`data-pagefind-body`).
- `urlDe(entrada)` usa el id tal cual (ya normalizado): no lo pases otra vez por `urlDeArchivo()`.
- Astro cachea el HTML de cada nota: el build siempre con `--force` (los wikilinks dependen de otras notas).
- Helpers: `publicados()` (oculta `estado: borrador` en producción), `porOrden`, `porFechaDesc`, `vecinos`, `resolverEnlaces`, `minutosLectura`, `fecha`, `esNuevo`, `retroenlaces()`.
- Configuración no editorial en `src/config/sitio.ts` (URL, repo, navegación, boletín).

## Reglas

1. **El contenido es del autor.** No reescribas textos de `contenido/` salvo que te lo pidan. Si el validador exige un cambio (frontmatter, enlace), hazlo mínimo y dilo.
2. **Nada de humo** en ningún texto de interfaz: sin cifras inventadas, testimonios, «revolucionario», «potente». Las cifras de la web (lecciones, horas, términos) se **calculan** del contenido.
3. **Interfaz en español de España**, tuteo, frases cortas. Microcopy de `DISENO.md` §3.
4. **Design system**: solo tokens de `src/styles/tokens.css`; radios 2–4 px; sombras duras solo en hover u objeto principal; máximo 2 acentos por zona; amarillo = lo más importante de la vista. Tema oscuro único.
5. **Sin frameworks de UI ni Tailwind.** Componentes `.astro` + scripts TS pequeños en `src/scripts/`.
6. **Accesibilidad**: HTML semántico y válido (el compilador Rust de Astro 7 no corrige anidamientos), foco visible, `aria-current`, teclado completo, `prefers-reduced-motion`, contraste AA.
7. **Nunca enlaces a algo que no existe.** Si una sección del plan aún no tiene contenido, no la enlaces.
8. **Responsive real**: sin scroll horizontal de 360 a 1440 px; tablas y código con scroll propio.
9. `src/fetch.ts` es un nombre reservado en Astro 7. Con dominio propio, **no** uses `base`.
10. Si el plan choca con la realidad (API cambiada, paquete distinto), **para y explica** la alternativa; no improvises en silencio.

## Cómo trabajar

- Una fase del plan por sesión. Usa la lista de tareas para seguirla.
- Antes de dar algo por terminado: `pnpm validar && pnpm check && pnpm build && pnpm enlaces`, y capturas con Playwright a 400 y 1440 px de las páginas tocadas (míralas y corrige).
- Commits pequeños con el mensaje que propone cada fase (`feat(...)`, `fix(...)`, `chore(...)`).
- Cuando termines una fase, resume en 3–5 líneas qué hiciste, qué verificaste y qué queda.
