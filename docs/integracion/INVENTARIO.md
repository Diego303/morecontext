# Integración v2 · Fase I0: inventario y plan de adaptación

Reglas de la integración (del autor, literales):

1. El proyecto manda. Si mi esquema o mis componentes difieren del paquete, se adapta el paquete (frontmatter, rutas), no mi código, salvo que haga falta para que el contenido valide y se vea bien.
2. No se pierde ninguna edición mía. Solo se sustituye un archivo si su sha256 coincide con el original del kit; si no, fusión a tres bandas y, ante conflicto, mi texto más las correcciones del paquete.
3. Nunca un enlace roto: pnpm validar y pnpm enlaces a 0 antes de cada commit.
4. El contenido del paquete ya está revisado: no lo reescribas. Adaptaciones mínimas y listadas.
5. Si algo del plan choca con lo que encuentres (un campo que no existe, una sección hecha de otra forma, una versión distinta), para, explícamelo con la alternativa que propones y espera.

Paquete: `../morecontext-v2` (686 entradas en `docs/manifiesto.json`: 427 nuevas, 258 modificadas, 1 renombrada).
Proyecto: rama `develop`, commit `bf61e5e`. Fecha: 30 de octubre de 2026.

## Tareas de I0

- [x] Leer `CLAUDE.md`, `LEEME.md`, `PLAN-INTEGRACION.md`, `CAMBIOS-ESQUEMA.md` y `GUIA-CONTENIDO.md` v2 (§1–§8).
- [x] Estado de partida: `pnpm validar && pnpm check && pnpm build && pnpm enlaces` y páginas en `dist/`.
- [x] Inventario de colecciones, secciones de la fase 13 y registros (§2–§3).
- [x] Tabla de mapeo de campos (§4).
- [x] Clasificación sin `--aplicar` y decisión por cada `CONFLICTO` y `FUSIONAR` (§5).
- [x] Comparar `docs/GUIA-CONTENIDO.md` y `docs/MAPA-CONTENIDO.md` con `base/docs/` (§6).
- [x] Ensayo completo en una copia desechable fuera del repositorio (§7).
- [x] Plan de adaptación I1–I5 con archivos concretos (§8).
- [x] Preguntas al autor (§9).

Archivos de esta fase, todos en `docs/integracion/`:

| Archivo | Qué es |
|---|---|
| `INVENTARIO.md` | Este documento. |
| `clasificacion.md` / `.json` | Clasificación válida (ejecutada sobre un clon con finales LF; ver §1.2). |
| `clasificacion-crlf.md` / `.json` | Clasificación ejecutada sobre `/mnt/d` con finales CRLF: **no válida**, se guarda como prueba del problema de §1.2. |
| `mapear-frontmatter.mjs` | Script de mapeo de frontmatter para I2 (§4). Sin `--aplicar` solo lista. Probado en el ensayo. |

---

## 1. Estado de partida

### 1.1 Versiones y comprobaciones

| | |
|---|---|
| Astro | 7.4.2 (`@astrojs/markdown-remark` 7.3.4, `@astrojs/check` 0.9.12) |
| Node | 24.21.0 en local (`engines`: ≥ 22.23.4); CI en Node 24 |
| pnpm | 12.15.0 (`packageManager`) |
| Otras | Pagefind 1.5.2 · Mermaid 12.2.0 · satori 0.63.2 · sharp 0.35.5 · Playwright 1.64.1 · TypeScript 6.0.3 · yaml 2.9.1 |

El paquete se probó con Astro 7.4: misma versión mayor y menor. Sin choque.

Comprobaciones sobre `develop` (`bf61e5e`), en un clon en disco Linux (mismo árbol; la única diferencia con `/mnt/d` es tu línea `TMP/` en `.gitignore`, sin commit):

| Comando | Resultado |
|---|---|
| `pnpm validar` | 279 archivos · 0 errores · 0 avisos |
| `pnpm check` | 0 errors · 0 warnings · 0 hints |
| `pnpm build` | correcto: **435 páginas HTML** en `dist/` (270 indexadas por Pagefind, 270 imágenes OG) en 55 s; solo el aviso esperado «data store cleared (force)» |
| `pnpm enlaces` | 435 páginas · 0 enlaces internos rotos |
| `wikilink--roto` en `dist` | 0 |

### 1.2 Hallazgo: finales de línea y el clasificador (choque con el plan, regla 5)

`clasificar.mjs` compara el `sha256` de los **bytes en disco** con los hashes del manifiesto, que están calculados sobre archivos con finales **LF**. En `/mnt/d` los archivos tienen **CRLF** (GitHub Desktop en Windows con `core.autocrlf=true`); en el repositorio git están en LF.

Prueba con `contenido/glosario/rag.md`: en disco tiene CRLF y su hash no coincide con el original del kit; quitando los CR, coincide.

| Ejecución | CONFLICTO | COPIAR | SUSTITUIR | FUSIONAR | MOVER |
|---|---:|---:|---:|---:|---|
| Sobre `/mnt/d` (CRLF), `clasificacion-crlf.md` | 9 | 418 | 0 | **258** | 1 · MOVER+FUSIONAR |
| Sobre un clon LF de `develop`, `clasificacion.md` | 9 | 418 | **255** | **3** | 1 · MOVER+SUSTITUIR |

Con `--aplicar` sobre `/mnt/d` pasarían dos cosas:

- 255 archivos que no editaste irían a fusión a tres bandas en vez de sustituirse.
- El paso previo `git status --porcelain -- contenido` del script, ejecutado con el git de WSL sin `autocrlf`, ve todo `contenido/` como modificado y aborta.

**Alternativa propuesta (pregunta 1):** hacer I2 en un clon LF de `develop` en disco Linux y traer la rama `integracion-v2` a `/mnt/d` con `git fetch`. GitHub Desktop la verá normal: los objetos de git están en LF. Además, el build y `pnpm enlaces` van unas cinco veces más rápido allí.

---

## 2. Inventario del proyecto

### 2.1 Colecciones (`src/content.config.ts`): 22

Las 17 del kit sin cambios de esquema: `secciones`, `niveles`, `lecciones`, `cursos`, `leccionesCurso`, `docsGrupos`, `docs`, `modelos`, `sistemas`, `patrones`, `disciplinas`, `recetas`, `glosario`, `radar`, `blog`, `boletin` y `paginas`.

Las 5 de la fase 13:

| Colección | Campos propios (además de `base`) |
|---|---|
| `problemas` | `orden?`, `sintoma` (string, mín. 10) |
| `plantillas` | `orden?`, `formato` (`md` · `txt` · `json` · `jsonl` · `yaml`) |
| `biblioteca` | `autores`, `anio` (1950–2100), `url` |
| `herramientas` | `url`, `categoria` (string libre), `licencia?` |
| `comunidad` | `autor`, `url` |

`base`: `titulo`, `descripcion` (20–220), `estado`, `creado`, `actualizado?`, `tags`, `aliases`, `relacionados`.

Zod no es estricto: las claves desconocidas se descartan sin error.

Diferencias con `codigo-referencia/content.config.v2.ts` (todo lo demás es idéntico):

- Lecciones: faltan `profundidad` y `revisado`.
- `recetas.tema`: falta `seguridad`.
- Plantillas, herramientas, biblioteca y problemas: campos distintos (ver §4).
- Yo tengo `comunidad`; el paquete no.

`CLAUDE.md` todavía dice «17 colecciones»: se corrige en I1.

### 2.2 Secciones de la fase 13

| Sección | ¿Hecha? | Carpeta · colección | Páginas y componentes | Listado y filtros |
|---|---|---|---|---|
| Problemas | Sí, esqueleto en borrador | `contenido/problemas/` · `problemas` | Rutas genéricas `src/pages/[apendice]/index.astro` y `[slug].astro`, con lógica en `src/lib/apendices.ts`. La ficha usa `LecturaLayout` con una caja `ficha-datos` (Síntoma) | Lista simple con `datoDe()` («problema»), ordenada por `orden` y título. Sin filtros. |
| Plantillas | Sí, esqueleto | `plantillas/` · `plantillas` | Las mismas rutas genéricas; ficha con Formato `.md` | Lista simple (`.formato`). Sin filtros ni Descargar. |
| Biblioteca | Sí, esqueleto | `biblioteca/` · `biblioteca` | Rutas genéricas; ficha con Autores, Año y enlace externo ↗ (`url`) | Lista simple («autores · año»). |
| Herramientas | Sí, esqueleto | `herramientas/` · `herramientas` | Rutas genéricas; ficha con Categoría, Licencia y enlace ↗ (`url`) | Lista simple («categoría · licencia»). Sin filtros. |
| Comunidad | Sí, esqueleto | `comunidad/` · `comunidad` | Rutas genéricas; ficha con Autor y enlace | Lista simple. **No está en el paquete.** |
| Laboratorio | Sí | `src/pages/laboratorio/index.astro` y `src/scripts/laboratorio.ts` | Calculadora de tokens y costes: **los precios los escribe el usuario y no hay lista de modelos** | — |
| Comentarios (Giscus) | Sí, inactivo | `src/components/entrada/Comentarios.astro` | No pinta nada mientras `SITIO.comentarios.repoId` y `categoriaId` estén vacíos. Lo usan las lecciones del roadmap y de los cursos y el blog (prop `comentarios`) | — |
| Imágenes OG | Sí | `src/lib/og.ts` y `src/pages/og/[...ruta].png.ts` (satori + sharp) | Una PNG por entrada publicada (270 hoy) | — |
| Grafo | Sí | `/mapa/`: `src/lib/grafo.ts` (Fruchterman–Reingold, O(N²) × 320 iteraciones, en build) y `src/scripts/mapa.ts` | Un nodo por nota publicada | — |
| i18n | **No** | — | El README documenta el aplazamiento | **I6 no aplica.** |

Visibilidad: una sección del backlog solo existe en la web (rutas, portada, pie y sitemap) si su portadilla está publicada y tiene al menos una entrada publicada. Hoy todas están en borrador, así que ninguna se publica.

Esqueletos en borrador creados en la fase 13 (ningún commit tuyo los ha tocado; su texto dice «Escríbela con tu voz o bórrala»):

- Portadillas: `problemas/index.md`, `plantillas/index.md`, `biblioteca/index.md`, `herramientas/index.md` y `comunidad/index.md`.
- Entradas: `problemas/agente-en-bucle.md`, `plantillas/prompt-de-sistema.md`, `biblioteca/react.md`, `herramientas/model-context-protocol.md` y `comunidad/proyecto-de-ejemplo.md`.
- Plantillas de Obsidian en `_plantillas/`: `problema.md`, `plantilla.md`, `paper.md`, `herramienta.md` y `proyecto.md`.

### 2.3 Registros y piezas transversales

| Pieza | Estado actual | ¿Hay que tocarlo? |
|---|---|---|
| `SECCIONES` (`scripts/validar-contenido.mjs`) | Ya incluye `problemas`, `plantillas`, `biblioteca`, `herramientas` y `comunidad` | No |
| `CARPETA` (`src/lib/contenido.ts`) | Ya incluye las 5 | No |
| `NOMBRE_SECCION` (`src/config/sitio.ts`) | Ya: «Problemas frecuentes», «Plantillas», «Biblioteca», «Herramientas», «Comunidad», «Laboratorio», «Mapa» | No |
| `COLECCIONES` (`src/lib/etiquetas.ts`, `src/lib/retroenlaces.ts`) | Incluyen las 22 | No |
| `PARTES` (`sitio.ts`) | Las del kit: II = Docs, Modelos, Glosario; III = Sistemas, Patrones, Recetas | Sí, en I4 (pregunta 3) |
| `NAV` (`sitio.ts`) | 8 enlaces del kit | Propuesta: añadir «Herramientas» en I4 (pregunta 3) |
| Portada (`src/lib/portada.ts`) | Partes I–V con capítulos 1–14 fijos. Apéndices dinámicos con letras: manifiesto, contribuir, sobre y licencia, más las secciones del backlog **visibles**, Laboratorio, Mapa, Etiquetas y RSS | Sí, en I4 |
| Pie (`Pie.astro`) | Columnas de `PARTES` y lista «Proyecto» con las secciones del backlog visibles, Laboratorio, Mapa, Etiquetas y RSS | Sí, en I4: evitar duplicados si pasan a `PARTES` |
| Buscador | Pagefind con filtro `seccion` sacado de `NOMBRE_SECCION`, en `LecturaLayout`, `DocsLayout` y `PaginaLayout`; `buscador.ts` pone el Glosario primero. El síntoma no tiene peso propio | Sí, en I5 (peso del síntoma) |
| RSS (`src/pages/rss.xml.ts`) | Blog, radar y boletín | No: entran solos los 12 posts y 16 radares nuevos |
| JSON-LD (`src/lib/jsonld.ts`) | Las fichas del backlog usan `ldArticulo` (`TechArticle`), con autor `Person` Diego | Plantillas, herramientas y problemas ya cumplen. Biblioteca: pregunta 5 |
| `scripts/nueva-nota.mjs` | Lista `_plantillas/` dinámicamente y sustituye `{{title}}` y `{{date:…}}` en todo el archivo (también `revisado:`) | No |
| `_plantillas/` | 19 plantillas, 4 de ellas con el mismo nombre que las del paquete | En I2 (§5) |
| `src/scripts/codigo.ts` | Idéntico al del kit: el diff con `codigo.v2.ts` son solo los dos bloques del cambio v2 | Sí, en I1: se sustituye por `codigo.v2.ts` tal cual |
| Recetas | `TEMA` escrito a mano en `src/pages/recetas/index.astro` y `[slug].astro`, sin `seguridad` | Sí, en I1 |
| Tablas anchas | `.prosa table { display:block; overflow-x:auto }` ya evita el scroll de página | Comprobar en I3 |
| `/empieza-aqui/` | La portada lee los H3 de «Rutas por perfil» (A–D) y el H2 «Test de nivel» | Comprobado en el paquete: los 4 H3 y «Test de nivel» no cambian. El H2 nuevo «Otras formas de recorrerlo» no entra en las rutas, porque el filtro corta en el siguiente H2 |
| Manifiesto en la portada | `principio('Abierto')` y `principio('Sin humo')` buscan por nombre | El paquete inserta el principio 5 «Primero el mecanismo…» y «Abierto» pasa a ser el 6: sigue funcionando |

---

## 3. Contenido del paquete por sección

| Sección | Nuevos | Modificados | Notas |
|---|---:|---:|---|
| `_plantillas` | 4 | 0 | Los 4 chocan con plantillas mías (§5) |
| `biblioteca` | 28 | 0 | 27 fichas + portadilla. `react.md` choca con mi esqueleto |
| `blog` | 12 | 5 | Los 16 posts (12 nuevos + 4 revisados; el quinto es `index.md`) van en `estado: revision`: se publican con el aviso «En revisión» y en primera persona, para que los reescribas (I7) |
| `boletin` | 0 | 1 | `002.md`: FUSIONAR |
| `cursos` | 70 | 40 (+1 renombrado) | 6 cursos nuevos (orden 9–14). `rag-a-fondo/04-evaluar-un-rag` → `10-…` (la URL no cambia) |
| `disciplinas` | 3 | 13 | |
| `docs` | 50 | 35 | 4 grupos nuevos (orden 9–12) |
| `glosario` | 98 | 60 | |
| `herramientas` | 43 | 0 | 42 fichas + portadilla |
| `modelos` | 3 | 10 | |
| `paginas` | 1 | 4 | `manifiesto` y `sobre`: FUSIONAR. `contribuir` y `empieza-aqui`: SUSTITUIR. Nueva: `fuentes` (sale en `/fuentes/`, pero no en los apéndices ni en el pie: I4) |
| `patrones` | 4 | 10 | 10–12 de tipo `agente`, 13 de tipo `workflow` |
| `plantillas` | 15 | 0 | 14 fichas + portadilla |
| `problemas` | 17 | 0 | 16 fichas + portadilla |
| `radar` | 16 | 7 | |
| `recetas` | 39 | 13 | Tema nuevo `seguridad` |
| `roadmap` | 20 | 52 | Niveles 50, 70 y 90 (de 8 a 11) |
| `sistemas` | 4 | 8 | |

Marcadores de nombre:

- `[Tu nombre]` del boletín: la fusión conserva tu «Diego».
- `<TU NOMBRE> ·`: canario del harness, en 10 archivos (pregunta 4).

---

## 4. Mapeo de campos (paquete → proyecto)

Valores reales contados en el frontmatter del paquete (índices excluidos). Criterio, según la regla 1:

- Si el campo ya existe con otro nombre o con otros valores, **se adapta el frontmatter del paquete**.
- Si el campo no existe y hace falta para mostrar o filtrar la sección (plan I3), **se crea en mi esquema**.

### Plantillas (14 fichas)

| Campo del paquete | Valores en el paquete | Campo del proyecto | Acción |
|---|---|---|---|
| `tipo` | `spec` ×5 · `prompt` ×3 · `configuracion` ×3 · `checklist` ×1 · `skill` ×1 · `agente` ×1 | — | **Crear** `tipo: z.enum(['prompt','spec','checklist','configuracion','agente','skill'])` (agrupa el listado en I3) |
| `formato` | `markdown` ×10 · `yaml` ×4 | `formato` (`md` · `txt` · `json` · `jsonl` · `yaml`) | **Adaptar el paquete**: `markdown` → `md` (10 fichas + `_plantillas/plantilla.md`); `yaml` no cambia. `texto` → `txt` si apareciera. `toml` no se usa |
| `archivo` | presente en las 14 («AGENTS.md», «acceptance.yaml»…) | — | **Crear** `archivo: z.string()` (nombre del botón Descargar) |
| — | — | `orden?` | Sin cambio (el paquete no lo usa) |

### Herramientas (42 fichas)

| Campo del paquete | Valores en el paquete | Campo del proyecto | Acción |
|---|---|---|---|
| `categoria` | 12 valores: framework ×14, agente-de-codigo ×6, base-vectorial ×4, evals ×4, inferencia ×4, sdk ×3, observabilidad ×2, ingesta, pasarela, guardrails, protocolo, interfaz | `categoria: z.string()` | Sin cambio de esquema (lo acepta). Etiquetas visibles en I3 |
| `licencia` | presente en las 42 (MIT ×18, Apache-2.0 ×16, propietaria ×3…) | `licencia?` | Sin cambio |
| `open_source` | `true` ×36 · `false` ×6 | — | **Crear** `open_source: z.boolean()` (filtro abierto/propietario en I3) |
| `lenguajes` | Python ×34, TypeScript ×23… | — | **Crear** `lenguajes: z.array(z.string()).default([])` |
| `web` | presente en las 42 | `url: z.url()` (obligatorio) | **Adaptar el paquete**: `web:` → `url:` (42 fichas + `_plantillas/herramienta.md`). La ficha ya pinta `url` como enlace ↗ |
| `repositorio` | 41 de 42 | — | **Crear** `repositorio: z.url().optional()` |
| `version` | presente en las 42 | — | **Crear** `version: z.string().optional()` |
| `revisado` | presente en las 42 | — | **Crear** `revisado: z.coerce.date()` |

### Biblioteca (27 fichas)

| Campo del paquete | Valores en el paquete | Campo del proyecto | Acción |
|---|---|---|---|
| `autores` | | `autores` | Igual |
| `anio` | 1958–2026 | `anio` (1950–2100) | Igual: todos entran en el rango |
| `url` | | `url: z.url()` | Igual |
| `tipo` | `paper` ×20 · `ensayo` ×7 | — | **Crear** `tipo: z.enum(['paper','ensayo','especificacion','libro'])` |
| `tema` | fundamentos ×9, agentes ×6, contexto ×4, seguridad ×3, prompting ×2, evals ×2, herramientas ×1 | — | **Crear** `tema`, reutilizando el enum de `glosario.categoria` (se extrae a `categoriaGlosario`) |
| `nivel` | `intermedio` ×27 | — | **Crear** `nivel: nivelDificultad.default('intermedio')` (`MetaEntrada` ya lo pinta) |

### Problemas (16 fichas)

| Campo del paquete | Valores en el paquete | Campo del proyecto | Acción |
|---|---|---|---|
| `sintoma` | de 23 a 50 caracteres | `sintoma` (mín. 10) | Igual |
| `tema` | agentes ×5, produccion ×3, herramientas ×3, prompting ×2, rag ×2, seguridad ×1 | — | **Crear** `tema`, con el mismo enum que `recetas.tema` incluido `seguridad` (se extrae a `temaReceta`) |
| `nivel` | `intermedio` ×16 | — | **Crear** `nivel: nivelDificultad.default('intermedio')` |
| — | — | `orden?` | Sin cambio |

### Resto

| Dónde | Paquete | Proyecto | Acción |
|---|---|---|---|
| Portadillas | `orden` 13 (plantillas), 14 (herramientas), 15 (biblioteca), 16 (problemas) | Mis esqueletos: 20–23 | Se aceptan los del paquete sin tocarlos. `secciones.orden` no ordena nada en estas secciones (manda el orden de `APENDICES`, o de `PARTES` tras I4) y no hay duplicados |
| Lecciones (`lecciones`, `leccionesCurso`) | `profundidad`, `revisado` (14 lecciones de `cursos/ruta-en-video/`) | — | **Crear** ambos opcionales, como en el paquete |
| `recetas.tema` | `seguridad` | enum sin `seguridad` | **Ampliar** el enum (sin esto el build falla) |
| Comunidad | — | `comunidad` | Sin cambios: se queda en borrador e invisible |

`docs/integracion/mapear-frontmatter.mjs` aplica las dos adaptaciones de frontmatter. En el ensayo cambió 54 archivos (42 + 1 de herramientas, 10 + 1 de plantillas) con 0 errores. Solo toca el bloque de frontmatter y respeta LF o CRLF.

---

## 5. Clasificación del contenido y decisión por archivo

Resumen válido (`clasificacion.md`, clon LF):

| Acción | Archivos | Qué se hará |
|---|---:|---|
| COPIAR | 418 | Copiar |
| SUSTITUIR | 255 | Sustituir: no los editaste, su sha256 coincide con el original del kit |
| MOVER+SUSTITUIR | 1 | `git mv cursos/rag-a-fondo/04-evaluar-un-rag.md → 10-evaluar-un-rag.md` y sustituir. Tras aplicar, ningún archivo enlaza ya a la ruta vieja: el paquete actualiza los 8 que lo hacían |
| FUSIONAR | 3 | Fusión a tres bandas (abajo) |
| CONFLICTO | 9 | A mano (abajo) |

### FUSIONAR: los tres con tu nombre

Las tres fusiones se probaron en seco con `git merge-file` sobre copias LF: **0 conflictos en las tres**.

| Archivo | Tu edición frente al kit | Cambios del paquete | Resultado |
|---|---|---|---|
| `boletin/002.md` | `[Tu nombre]` → `Diego` (firma) | `actualizado`; fecha exacta y enlace a `[[biblioteca/context-engineering-anthropic]]` en la lectura recomendada | Fusión limpia: conserva «Diego» y añade lo del paquete |
| `paginas/manifiesto.md` | `[Tu nombre]` → `Diego` (2 líneas) | `actualizado`; principio nuevo 5 «Primero el mecanismo, después el framework» (Abierto pasa a 6); regla de no reescribir entradas fechadas | Fusión limpia |
| `paginas/sobre.md` | `[Tu nombre]` → `[Diego](https://diego303.github.io/Portfolio/)` | `actualizado`; «once niveles»; cursos y docs nuevos; línea de plantillas, herramientas, biblioteca y problemas; bloque sobre el harness y la ruta en vídeo del autor | Fusión limpia: conserva tu enlace al portfolio |

### CONFLICTO: archivos de la fase 13 en rutas nuevas del paquete

Los 9 son esqueletos o plantillas en borrador que creé en la fase 13. No llevan texto tuyo: son marcadores para escribir o borrar.

| Archivo | Mío | Paquete | Propuesta (pregunta 2) |
|---|---|---|---|
| `problemas/index.md` | Esqueleto en borrador, `orden: 20` | Portadilla completa, `orden: 16` | Versión del paquete |
| `plantillas/index.md` | Esqueleto en borrador, 21 | Portadilla completa (con Mermaid), 13 | Versión del paquete |
| `biblioteca/index.md` | Esqueleto en borrador, 22 | Portadilla completa, 15 | Versión del paquete |
| `herramientas/index.md` | Esqueleto en borrador, 23 | Portadilla con criterio de inclusión y «Sin afiliados», 14 | Versión del paquete |
| `biblioteca/react.md` | Esqueleto en borrador (mismos `autores`, `anio` y `url`) | Ficha completa | Versión del paquete |
| `_plantillas/problema.md` | Secciones Síntoma, Causa, Arreglo, Comprobar y Ver también | Secciones de la guía v2 §6 + `tema`, `nivel` | Versión del paquete (las fichas nuevas siguen esa estructura) |
| `_plantillas/plantilla.md` | `formato: md` | `tipo`, `formato: markdown`, `archivo` | Versión del paquete, con `formato: md` (mapeo) |
| `_plantillas/paper.md` | Autores, año, url | + `tipo`, `tema`, `nivel` y las secciones de la guía v2 | Versión del paquete |
| `_plantillas/herramienta.md` | `url`, `categoria`, `licencia` | + `open_source`, `lenguajes`, `repositorio`, `version`, `revisado`; `web` | Versión del paquete, con `url:` (mapeo) |

Esqueletos míos que **no** chocan pero quedan como duplicados en borrador de fichas del paquete:

- `problemas/agente-en-bucle.md` ≈ `problemas/el-agente-no-para.md`.
- `plantillas/prompt-de-sistema.md` ≈ `plantillas/prompt-de-sistema-de-agente.md`.
- `herramientas/model-context-protocol.md` ≈ `herramientas/mcp-sdks.md`.

Propuesta: borrarlos (pregunta 2). En borrador no se publican, pero `pnpm validar` avisaría si alguien los enlaza. `comunidad/` y `_plantillas/proyecto.md` se quedan como están.

---

## 6. Documentos del proyecto

| Documento | ¿Lo editaste? | Kit → v2 | Acción en I2 |
|---|---|---|---|
| `docs/GUIA-CONTENIDO.md` | **No**: idéntico al original del kit, quitando los CRLF | 218 líneas distintas | Sustituir por el v2, adaptando lo mínimo y listándolo: en §3.2, `web` → `url` y los valores de `formato` a los míos (`md`, `txt`…), para que la guía describa el esquema real |
| `docs/MAPA-CONTENIDO.md` | **No**: idéntico | 1102 líneas distintas | Sustituir por el v2 |
| `docs/investigacion/` | No existe | 4 informes + ejemplos | Copiar (no se publica: está fuera de `contenido/`) |
| `CLAUDE.md` | — | — | En I1: «22 colecciones» y nuevas referencias (`docs/integracion/`, `docs/investigacion/`) |

---

## 7. Ensayo completo fuera del repositorio

Para no dejar nada a la suposición, apliqué todo en una **copia desechable** del clon LF, en `/tmp`, nunca en el repositorio:

1. `clasificar.mjs --aplicar`: 418 + 255 + 1 + 3, con las fusiones limpias.
2. Los 9 CONFLICTO con la versión del paquete y los 3 esqueletos duplicados borrados.
3. `mapear-frontmatter.mjs --aplicar`: 54 archivos.
4. Prototipo del esquema de I1 (§8) y `seguridad` en `TEMA` de recetas.

Resultados:

- `pnpm validar` sin los cambios de esquema da **0 errores**: no comprueba Zod. Sin I1 y el mapeo, `astro sync` falla en `herramientas/aider.md` (`url: Required`). Por eso la aceptación de I2 tiene que incluir `pnpm check` y `pnpm build`, no solo `validar`.
- Con los 9 conflictos sin resolver, `validar` da 30 avisos «enlaza a un borrador» (páginas que enlazan a mis portadillas en borrador). Con la versión del paquete, 0.

Con el esquema de I1 y el mapeo (disco Linux):

| Comprobación | Hoy (`develop`) | Ensayo v2 |
|---|---:|---:|
| `pnpm validar` | 279 archivos · 0 errores · 0 avisos | 694 archivos · 0 errores · 0 avisos |
| `pnpm check` | 0 · 0 · 0 | 0 · 0 · 0 |
| `pnpm build` | 435 páginas en 55 s | **1083 páginas** en 2 min 30 s (sin avisos salvo «data store cleared») |
| Páginas de contenido (HTML sin `/tags/`) | 273 | 696 (**+423**: las 427 nuevas menos las 4 `_plantillas`) |
| Páginas de etiquetas | 162 | 387 (+225) |
| Imágenes OG | 270 | 693 (unos 65 s del build) |
| Pagefind | 270 páginas | 693 páginas |
| `pnpm enlaces` | 0 rotos | **0 rotos** |
| `class="wikilink wikilink--roto"` en `dist` | 0 | 0 |
| `/mapa/` | 403 KB, se genera al momento | **1,2 MB** de HTML y 5 s de cálculo del grafo |

Conclusiones para el plan:

- El esquema de I1 de §8, más el mapeo y la versión del paquete en los conflictos, bastan para que todo valide y construya sin enlaces rotos.
- Hay que vigilar dos cosas en I3:
  - El peso de `/mapa/`: 1,2 MB de HTML.
  - El tiempo total de build: unos 2,5 min en disco Linux. En `/mnt/d` será bastante más; el CI corre en Linux.
- Faltan pantallas por diseñar: listados, filtros, Descargar e insignias de I3, y la portada de I4. Hoy esas secciones se ven con la lista genérica del backlog.

---

## 8. Plan de adaptación I1–I5

### I1 · Esquema y código base (sin copiar contenido; ningún cambio visual)

| Archivo | Cambio |
|---|---|
| `src/content.config.ts` | Extraer `temaReceta` (con `seguridad`) y `categoriaGlosario`. Usar el primero en `recetas` y `problemas`, el segundo en `glosario` y `biblioteca`. Lecciones: `profundidad?` y `revisado?`. `problemas`: + `tema`, `nivel`. `plantillas`: + `tipo`, `archivo`. `biblioteca`: + `tipo`, `tema`, `nivel`. `herramientas`: + `open_source`, `lenguajes`, `repositorio?`, `version?`, `revisado`. **Sin renombrar** nada mío (`url`, `formato`, `categoria` libre) |
| `src/pages/recetas/index.astro`, `src/pages/recetas/[slug].astro` | `seguridad: 'Seguridad'` en `TEMA` |
| `src/scripts/codigo.ts` | Sustituir por `docs/codigo-referencia/codigo.v2.ts` (mi archivo es idéntico al del kit: el cambio aplica entero) |
| `src/lib/jsonld.ts`, `src/pages/[apendice]/[slug].astro` | JSON-LD de biblioteca según la pregunta 5. El resto sigue en `TechArticle` |
| Contenido existente | Mis esqueletos en borrador no tienen los campos nuevos obligatorios (`tipo`, `archivo`, `tema`, `open_source`, `revisado`): para que I1 construya con el contenido actual, se añaden esos campos a los esqueletos (mínimo, listado) o se borran ya los esqueletos y plantillas del §5 (según la pregunta 2) |
| `CLAUDE.md` | «22 colecciones»; referencias a `docs/integracion/` y `docs/investigacion/` |
| Sin cambios | `CARPETA`, `SECCIONES`, `NOMBRE_SECCION`, `COLECCIONES` y `scripts/nueva-nota.mjs`: ya cubren las secciones y las plantillas nuevas |

Aceptación: `pnpm validar && pnpm check && pnpm build && pnpm enlaces` en verde con 435 páginas, como hoy.

### I2 · Contenido (en `develop`)

| Paso | Detalle |
|---|---|
| Dónde | Clon LF de `develop` en disco Linux (pregunta 1); los commits se traen a `/mnt/d` con `pull --ff-only` |
| Aplicar | `clasificar.mjs --aplicar` (418 COPIAR, 255 SUSTITUIR, 1 MOVER+SUSTITUIR, 3 FUSIONAR limpias) |
| CONFLICTO | Los 9 del §5 con la versión del paquete; borrar los 3 esqueletos duplicados (pregunta 2) |
| Mapeo | `pnpm exec node docs/integracion/mapear-frontmatter.mjs --aplicar`: 54 archivos (`web` → `url`, `formato: markdown` → `md`) |
| Docs | `docs/GUIA-CONTENIDO.md` (v2 con §3.2 adaptada) y `docs/MAPA-CONTENIDO.md` (v2); copiar `docs/investigacion/` y `docs/SIN-VERIFICAR.md` (a `docs/integracion/`, para I8) |
| Aceptación | `validar` 0 · `check` 0 · `build` sin avisos · `enlaces` 0 · sin `wikilink--roto` · unas 1083 páginas (+423 de contenido y +225 de etiquetas, como en el ensayo de §7) |

### I3 · Páginas de las secciones nuevas

Decisión técnica: las cuatro secciones pasan de la ruta genérica `[apendice]` a **páginas propias**, como el resto de secciones. Así cada una tiene su listado, filtros y ficha.

- Rutas nuevas: `src/pages/{plantillas,herramientas,biblioteca,problemas}/index.astro` y `[slug].astro`.
- `[apendice]` se queda solo para `comunidad`. Si siguieran en `APENDICES`, Astro generaría la misma URL desde dos rutas.
- `apendicesVisibles()` se mantiene para comunidad.

| Archivo | Cambio |
|---|---|
| `src/lib/apendices.ts` | `APENDICES = ['comunidad']`; `datoDe()` pasa a una función por sección reutilizable en la portada |
| `src/pages/plantillas/index.astro`, `[slug].astro` | Lista agrupada por `tipo` con `FiltroChips` por tipo. Ficha: tipo, formato y `archivo`. El bloque de `## La plantilla` con Copiar (ya existe en el marco `.code`) y **Descargar** |
| `src/scripts/plantilla.ts` (nuevo) | Descargar: `Blob` con el texto del primer bloque de código de la sección, con el nombre de `archivo` |
| `src/pages/herramientas/index.astro`, `[slug].astro` | `FiltroChips` por `categoria` y por abierto/propietario, contador y estado vacío. Tarjeta: categoría, licencia, lenguajes y «revisada el». Ficha: licencia, open source, lenguajes, versión, revisado, web (`url`) y repositorio. «Sin afiliados» sale del texto de la portadilla, no de un texto nuevo |
| `src/pages/biblioteca/index.astro`, `[slug].astro` | Lista por `tema` con autores y año. Ficha: autores, año, tipo y enlace ↗ arriba |
| `src/pages/problemas/index.astro`, `[slug].astro` | `sintoma` en mono como segunda línea; `FiltroChips` por `tema`. Ficha con el síntoma destacado y `data-pagefind-weight` |
| `src/pages/cursos/[...slug].astro`, `src/components/aprender/FilaLeccion.astro` | Insignia de `profundidad` (imprescindible = amarillo, por encima = neutro, extra = cian, con tokens) y «enlaces revisados el {revisado}» en la cabecera de la lección |
| `src/lib/grafo.ts`, `src/pages/mapa/index.astro` | Con 693 notas el grafo tarda 5 s y `/mapa/` pesa 1,2 MB (§7): bajar el HTML (coordenadas redondeadas, atributos más cortos o datos en JSON aparte) y, si hace falta, usar una rejilla para la repulsión |
| `src/pages/og/[...ruta].png.ts` | Sin cambio de código; medir el tiempo de build con las imágenes nuevas |
| Laboratorio | **No aplica** la lista de modelos del plan: la calculadora no tiene lista y los precios los escribe el usuario. No se toca |
| `/docs/`, `/cursos/`, `/roadmap/`, `/patrones/`, `/sistemas/`, `/disciplinas/` | Sin código: capturas a 400 y 1440 px con 12 grupos, 14 cursos, 11 niveles y patrones 10–13 |

### I4 · Portada, navegación y pie

| Archivo | Cambio |
|---|---|
| `src/lib/portada.ts` | Según la pregunta 3: capítulos nuevos en II (Biblioteca y Problemas frecuentes) y III (Plantillas y Herramientas), con recuentos calculados («{n} textos», «{n} problemas», «{n} plantillas», «{n} herramientas»). Renumerar capítulos y sacar esas secciones de los apéndices |
| `src/config/sitio.ts` | `PARTES` II: + Biblioteca y Problemas frecuentes; III: + Plantillas y Herramientas. `NAV`: + «Herramientas» (pregunta 3) |
| `src/components/base/Pie.astro` | `extra` sin las secciones que ya estén en `PARTES` (solo quedaría Comunidad si se publica). Añadir «Fuentes» (`/fuentes/`, página nueva del paquete) junto a Manifiesto y Licencia |
| `src/lib/portada.ts` (apéndices) | Añadir `fuentes` a la lista fija de páginas de los apéndices (`['manifiesto', 'contribuir', 'sobre', 'licencia']`) |
| `/empieza-aqui/` y `/roadmap/` | Sin código: comprobar anclas A–D con `pnpm enlaces` y «Continúa donde lo dejaste» con 11 niveles |

### I5 · Búsqueda, filtros y pestañas

| Archivo | Cambio |
|---|---|
| Layouts | El filtro `seccion` ya usa `NOMBRE_SECCION`: sin cambios |
| `src/pages/problemas/[slug].astro` | Síntoma con `data-pagefind-weight` alto dentro de `data-pagefind-body` |
| `src/scripts/buscador.ts` | Revisar el orden de resultados (hoy prioriza Glosario) con las búsquedas de aceptación: «tool_result sin tool_use», «LangGraph interrupt», «worktree», «HNSW», «Ollama» |
| Prueba con Playwright | Pestañas: TypeScript → LangGraph → vuelta: sigue TypeScript. Mermaid en las 3 páginas del plan |

### I6 · No aplica

No hay i18n.

---

## 9. Preguntas al autor

Respuestas del autor (30 de octubre de 2026), anotadas antes de empezar I1.

| # | Pregunta | Recomendación | Respuesta |
|---|---|---|---|
| 1 | Dónde aplicar I2 (finales CRLF en `/mnt/d`) | Clon LF en disco Linux y traer la rama con `git fetch` | **Trabajar en `develop`, sin rama nueva.** Cómo: un clon LF de `develop` en disco Linux; cada commit se trae a `/mnt/d` con `git -c core.autocrlf=true pull --ff-only <clon> develop` (misma rama, los archivos quedan en CRLF como el resto) |
| 2 | Esqueletos de la fase 13: 9 CONFLICTO + 3 duplicados | Versión del paquete en los 9 y borrar los 3 | Lo recomendado. En I1 se borran las 4 fichas esqueleto (3 duplicadas + `biblioteca/react`); en I2 entra `react` del paquete como COPIAR y las 4 portadillas y 4 `_plantillas` del paquete sustituyen a las mías |
| 3 | Portada y `NAV` | Capítulos en II y III según el plan + «Herramientas» en `NAV` | Lo recomendado |
| 4 | Canario `<TU NOMBRE> ·` | Dejarlo como marcador para el lector | Se deja el marcador |
| 5 | JSON-LD de biblioteca | `TechArticle` (tu ficha) con `about` → `ScholarlyArticle`/`CreativeWork` del original | Lo recomendado |

---

## Fase I1 · hecho

Cambios:

| Archivo | Cambio |
|---|---|
| `src/content.config.ts` | `temaReceta` (con `seguridad`; recetas y problemas) y `categoriaGlosario` (glosario y biblioteca) extraídos. Lecciones: `profundidad?` y `revisado?`. `problemas`: + `tema`, `nivel`. `plantillas`: + `tipo`, `archivo`. `biblioteca`: + `tipo`, `tema`, `nivel`. `herramientas`: + `open_source`, `lenguajes`, `repositorio?`, `version?`, `revisado`. No se renombra nada (`url`, `formato` y `categoria` siguen como estaban) |
| `src/pages/recetas/index.astro`, `[slug].astro` | `seguridad: 'Seguridad'` en `TEMA` |
| `src/scripts/codigo.ts` | `codigo.v2.ts` del paquete tal cual: mi archivo era idéntico al del kit. Memoria de hasta 12 etiquetas en `mc.pestanas`, por orden de uso; lee `mc.pestana` como valor inicial |
| `src/lib/jsonld.ts` | `ldBiblioteca`: `TechArticle` (nuestra ficha, autor Diego) con `about` → `ScholarlyArticle` (paper), `Book` (libro) o `CreativeWork` (ensayo, especificación), con `creditText` = `autores` (texto tal cual, sin inventar personas), `datePublished` = `anio` y `url` |
| `src/pages/[apendice]/[slug].astro` | Usa `ldBiblioteca` en las fichas de biblioteca |
| `contenido/` | Borradas las 4 fichas esqueleto en borrador: `problemas/agente-en-bucle`, `plantillas/prompt-de-sistema`, `herramientas/model-context-protocol` y `biblioteca/react` (pregunta 2) |
| `CLAUDE.md` | «22 colecciones» y `docs/integracion/` en los documentos de referencia. `docs/investigacion/` se añade en I2, cuando exista |

Aceptación:

- `pnpm validar`: 275 archivos · 0 errores · 0 avisos.
- `pnpm check`: 0 · 0 · 0.
- `pnpm build`: **435 páginas**, como en I0.
- `pnpm enlaces`: 0 rotos.
- Mismo conjunto de archivos en `dist/` (sin contar `_astro/` y `pagefind/`) y **0 HTML distintos** del de I0, una vez normalizados los nombres con hash de los assets.
- Capturas a 400 y 1440 px (portada, una lección, un curso y `/recetas/`): **idénticas byte a byte** a las de antes.

Aviso nuevo en el build, transitorio: «The collection "biblioteca" / "herramientas" / "plantillas" / "problemas" does not exist or is empty». Esas colecciones se quedan sin entradas al borrar los esqueletos; desaparece en I2.

---

## Fase I2 · hecho

Todo en `develop`, en el clon LF (pregunta 1). Pasos:

1. `clasificar.mjs --aplicar`: 419 COPIAR (`biblioteca/react` pasa de CONFLICTO a COPIAR porque su esqueleto se borró en I1), 255 SUSTITUIR, 1 MOVER+SUSTITUIR (`cursos/rag-a-fondo/04-evaluar-un-rag.md` → `10-evaluar-un-rag.md`) y 3 FUSIONAR, las tres limpias. `clasificacion.md` y `.json` son ahora el informe de la aplicación; el de I0, «solo informe», está en el historial (`076d526`).
2. Los 8 CONFLICTO restantes se resolvieron con la versión del paquete (pregunta 2): las 4 portadillas (`problemas`, `plantillas`, `biblioteca`, `herramientas`) y las 4 `_plantillas` (`problema`, `plantilla`, `paper`, `herramienta`).
3. `mapear-frontmatter.mjs --aplicar`: 54 archivos, listados en `mapeo-frontmatter.txt`.
   - `web:` → `url:` en 42 fichas de herramientas y en `_plantillas/herramienta.md`.
   - `formato: markdown` → `md` en 10 plantillas y en `_plantillas/plantilla.md`.
4. Ninguna marca de conflicto en `contenido/`. Las dos líneas que empiezan por `<<<<<<<` y `>>>>>>>` en `recetas/integrar-features-en-paralelo.md` son el ejemplo del propio texto, idéntico al del paquete.
5. Tus ediciones siguen: «Diego» en `boletin/002`, «Diego» ×2 en `paginas/manifiesto` y `[Diego](https://diego303.github.io/Portfolio/)` en `paginas/sobre`.
6. Docs:
   - `docs/GUIA-CONTENIDO.md` y `docs/MAPA-CONTENIDO.md` pasan a la v2.
   - Adaptaciones de la guía, solo en la tabla §3.2, para que describa el esquema real: `formato` (md · txt · json · jsonl · yaml), `url` en lugar de `web` en herramientas y una fila para `comunidad/`.
   - `docs/investigacion/` copiada del paquete. Está excluida de `astro check` por `tsconfig`, porque `docs` ya estaba excluido.
   - `docs/integracion/SIN-VERIFICAR.md` copiado para I8.
   - `CLAUDE.md`: añadido `investigacion/` a los documentos de referencia.
7. Ningún ajuste de contenido fue necesario: el validador no se quejó de nada del paquete.

Aceptación:

- `pnpm validar`: 694 archivos · 0 errores · 0 avisos.
- `pnpm check`: 0 · 0 · 0.
- `pnpm build`: **1083 páginas**, sin avisos (solo «data store cleared»).
- `pnpm enlaces`: 0 rotos.
- `wikilink--roto` en el HTML de `dist`: 0.

Recuento: de 435 a 1083 páginas (+648).

- **+423 páginas de contenido**: las 427 nuevas del manifiesto menos las 4 `_plantillas`, que no se publican.
- **+225 páginas de etiquetas** (`/tags/…`): de 162 a 387.

Hay 693 imágenes OG y Pagefind indexa 693 páginas. Coincide con el ensayo de I0.

También: `build.log` entró por error en el commit de I1. Se quitó en un commit aparte. Los logs se guardan ahora fuera del repositorio.
