# MoreContext · Guía de marca y diseño (v1.1)

> **Más contexto, menos ruido.**
> La referencia abierta en español para entender y construir agentes de IA, sin humo.

Este documento reúne todo lo necesario para diseñar la marca, el icono y cualquier pieza de MoreContext: identidad, voz, logotipo, color, tipografía, componentes, diagramas, movimiento y reglas de uso. Parte del *Cookbooks Design System v2.1* y de la web ya construida (`assets/site.css`), en su edición minimalista.

---

## 0. Índice

1. Esencia de marca
2. Nombre y eslogan
3. Voz y tono
4. Logotipo e icono
5. Color
6. Tipografía
7. Retícula, espacio y layout
8. Forma: bordes, radios y sombras
9. Componentes de interfaz
10. Código y sintaxis
11. Diagramas e ilustración
12. Iconografía
13. Notas manuscritas
14. Movimiento
15. Accesibilidad
16. Aplicaciones de marca (redes, OG, favicon, slides)
17. Qué sí / qué no
18. Entregables de branding (checklist)
19. Anexo: tokens CSS

---

## 1. Esencia de marca

### Qué es
Una web de consulta y aprendizaje sobre agentes de IA: curso de 0 a 100, documentación, guías de uso de modelos, patrones de arquitectura, recetas con código, glosario y un radar de lo que cambia de verdad. Pensada para que una comunidad hispanohablante aprenda con criterio.

### El problema que resuelve
Cada día salen modelos, herramientas, hilos y titulares. La mayoría es ruido. Quien quiere aprender no sabe qué importa, qué es moda y qué funciona. Le falta **contexto**.

### La promesa
*¿No entiendes algo? Búscalo en MoreContext y tendrás el contexto que te falta.* Explicado desde la base, con código que funciona y sin perderte en la locura del día a día.

### Personalidad
| Es | No es |
|---|---|
| Un cuaderno de ingeniería bien cuidado | Una revista de tendencias |
| Un compañero que sabe y explica | Un gurú que vende |
| Preciso, sereno, práctico | Épico, urgente, eufórico |
| Abierto y de comunidad | Exclusivo o de pago escondido |
| Opinado cuando hay motivo | Neutro por miedo a equivocarse |

### Valores (por orden de prioridad)
1. **Verdad.** Si no se sabe, se dice. Nada de cifras inventadas.
2. **Utilidad.** Cada página deja algo que puedes hacer hoy.
3. **Claridad.** De lo simple a lo complejo, sin jerga gratuita.
4. **Calma.** Lo importante cambia despacio; aquí se explica eso.
5. **Comunidad.** Contenido abierto (CC BY-SA), código MIT, aportaciones bienvenidas.

### Metáfora visual
**El cuaderno de ingeniería en la oscuridad.** Fondo profundo, retícula apenas visible, tinta técnica precisa, un subrayador amarillo para lo que importa y alguna nota a mano en el margen. El contexto es lo que se ve cuando enciendes la lámpara sobre la página correcta.

---

## 2. Nombre y eslogan

### Escritura del nombre
| Uso | Forma |
|---|---|
| Nombre de marca en texto | **MoreContext** (una palabra, M y C mayúsculas) |
| Logotipo (wordmark) | `morecontext` en minúsculas, monoespaciada |
| Dominio | **morecontextai.com** (escrito en textos como MoreContextAI.com para que se lea bien) |
| Redes / handle | @morecontextai |
| Correo | hola@morecontextai.com |
| Nunca | More Context, Morecontext, MORECONTEXT, MC (salvo en el icono) |

### Eslogan principal
**Más contexto, menos ruido.**

### Eslóganes secundarios (campañas y secciones)
- Entiende antes de construir.
- El contexto que te falta, sin humo.
- Lo que las noticias no te explican.
- De la primera llamada a producción.

### Descriptor (para SEO y presentaciones)
*MoreContext · la guía abierta de agentes de IA en español.*

### El doble sentido, bien usado
En IA, "contexto" es lo que el modelo ve. Para un modelo, más contexto no siempre es mejor: le conviene el justo. Para una persona que aprende, sí le falta más. La marca abraza ese guiño de forma explícita en la guía de contexto:

> Irónicamente, a los modelos no siempre les conviene *más* contexto: les conviene el justo. A ti, en cambio, sí.

---

## 3. Voz y tono

### Principios de escritura
- **Directo.** Frases cortas. Voz activa. Segunda persona (tú).
- **Concreto.** Un ejemplo vale más que tres adjetivos.
- **Honesto.** "Depende" seguido de *de qué depende*. Si algo no funciona, se dice.
- **Sin hype.** Prohibido: *revolucionario, potente, mágico, el futuro es ahora, 10x, game changer, imprescindible*.
- **Sin muletillas.** Evitar incisos con guiones largos, "no es X, es Y", "cabe destacar", "en este sentido".
- **Español de España**, neutro y técnico. Los términos técnicos en inglés se dejan en inglés cuando así se usan en el código (`tool_use`, `stop_reason`) y se explican la primera vez.

### Tono por contexto
| Contexto | Tono | Ejemplo |
|---|---|---|
| Curso / lecciones | Profesor paciente | "Al terminar, puedes comprobar por ti mismo que tu agente para cuando debe." |
| Documentación | Preciso, impersonal-amable | "Devuelve un `tool_result` por cada `tool_use`, en un único mensaje." |
| Guías | Colega con experiencia | "Si tu prompt necesita mayúsculas para funcionar, el problema está en otra parte." |
| Radar | Sereno, filtrador | "Qué es. Qué cambia en la práctica. Qué hacer." |
| Errores de UI | Claro y útil | "Revisa el email: falta la @ o el dominio." |
| Comunidad | Cercano, inclusivo | "Pregunta lo que sea. Aquí nadie empezó sabiendo." |

### Microcopy de referencia
- Botón primario: `$ Empezar el curso`
- Buscador: *busca un concepto, una lección, un patrón…*
- Vacío de búsqueda: *Nada con «x». Prueba con otro término o mira el glosario.*
- Copiado: *Copiado al portapapeles*
- Suscripción: *¡Apuntado! Te llegará el próximo envío.*
- Boletín: *Un correo cada dos semanas con lo que ha cambiado y una receta. Sin relleno.*

---

## 4. Logotipo e icono

### 4.1 Concepto principal del icono: `[+]`
Los **corchetes** representan la *ventana de contexto* (lo que el modelo ve; también las listas y bloques de código). El **+** es *más*. Juntos: **más contexto**, leído en clave técnica.

```
┌──────────┐
│          │
│   [+]    │   cara blanca con borde negro
│          │▒  sombra dura amarilla integrada, abajo a la derecha
└──────────┘▒
 ▒▒▒▒▒▒▒▒▒▒▒
```

Versión 1 del icono (kit `morecontext-icono-v1`, su `README` está en `docs/marca/morecontext-icono-v1/`). Imita el botón principal de la web: **cara blanca con borde negro y una sombra dura amarilla desplazada abajo a la derecha**. La sombra forma parte del propio icono (está dibujada en el SVG), **no se añade con CSS**: con `box-shadow` saldría doble.

**Construcción** (retícula de 26 × 26 unidades)
| Elemento | Medida |
|---|---|
| Cara `#fafafa` | 23,6 × 23,6, desde (0, 0) |
| Borde `#000` | 1,2 (1,6 en la versión pequeña) |
| Sombra `#fde047` | desplazada 3 unidades a la derecha y 3 hacia abajo |
| Corchetes | 3 de ancho × 14 de alto, trazo 2,2 (2,8 en la versión pequeña), terminaciones rectas |
| `+` | brazos de 6, trazo 2,2, bajado unas 0,25 unidades para compensar los corchetes |

- La cara ocupa 23,6 de las 26 unidades: al mismo tamaño de caja se ve un 9 % más pequeña que un icono sin sombra. El logo del header mide 31 px para que la cara mida 28.
- Colores fijos de marca, escritos en el SVG: cara `#fafafa`, tinta `#000`, sombra `#fde047`. Solo los estados animados de la web cambian la sombra (verde al copiar, §14).
- Área de respeto: al menos el 25 % del lado del icono alrededor.
- **La sombra va siempre abajo a la derecha.** No se cambia de lado, no se desenfoca y no se cambia de color (salvo los estados animados).
- No se escribe `[+]` con una fuente: siempre los SVG del kit.

**Archivos** (kit `morecontext-icono-v1`)
| Archivo | Uso |
|---|---|
| `morecontext-icon.svg` | Icono principal, desde 24 px (en la web: `Icono.astro`, OG de cada página) |
| `morecontext-icon-small.svg` | Por debajo de 24 px: borde y trazos más gruesos |
| `morecontext-icon-mono-black.svg` / `-mono-white.svg` | Una tinta: impresión, fondos fotográficos |
| `morecontext-logo-dark.svg` / `-light.svg` | Logotipo `[+] morecontext` (nombre convertido en trazos) para fondo oscuro / claro; la OG por defecto usa el oscuro |
| `web/` | `favicon.ico` (16, 32, 48), `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `site.webmanifest`: van tal cual en `public/` |

**Icono animado.** En la portada (hero), la paleta de búsqueda y el botón Copiar el icono va en línea, con sus piezas como clases `mc-*` para que el CSS pueda moverlas: `svgMarca()` en `src/scripts/icono-marca.ts` y los estados en `src/styles/icono-marca.css` (kit `morecontext-animaciones-v1`, §14). A 14 y 18 px usa la geometría normal: la pequeña se empasta animada.

**Tamaños mínimos**
- 16 px con la versión pequeña (favicon); 24 px con el principal. El logotipo completo, a no menos de 20 px de alto.
- UI: el header y el pie usan 31 px (cara de 28 px).
- App / avatar: 512 px de máster, exportar 180, 192, 256, 512.

### 4.2 Conceptos alternativos del icono (para explorar)
1. **Cursor de terminal:** `mc_` con el guion bajo parpadeando en amarillo. Muy "cuaderno técnico", menos simbólico.
2. **Subrayador:** la palabra *context* con el trazo amarillo del efecto resaltador por debajo. Más editorial, peor a tamaños pequeños.
3. **Lupa sobre corchetes:** `[🔍]` dibujado en línea: "buscar dentro del contexto". Riesgo de parecer genérico.
4. **Ventana con foco:** un rectángulo de retícula con un único cuadrado iluminado en amarillo: "el dato que necesitas, en su sitio".

Recomendación: `[+]`. Legible a 16 px, se escribe con el teclado y explica el nombre.

> **Antes de registrar la marca.** Un `+` dentro de corchetes es un glifo de interfaz común (iconos de «añadir» o «desplegar»), así que por sí solo es poco distintivo. Pide al diseñador que lo haga propio (corchetes dibujados a medida, sombra dura integrada, «+» reinterpretado) y registra el **logotipo completo** `[+] morecontext`, no el icono suelto. Haz antes una búsqueda por imagen (Google Lens, TinEye) y de marcas figurativas en TMview/OEPM, clases 41 y 42.

### 4.3 Wordmark
```
[+] morecontext
```
- Tipografía: **JetBrains Mono Bold 700**, minúsculas, tracking −0.01 em.
- Color: `--text #f4f4f5` sobre oscuro; `#000` sobre claro.
- Opción con énfasis: `more` en `--text-muted #a1a1aa` y `context` en `--text`, o `context` con el efecto subrayador amarillo. Usar solo en piezas grandes (hero, portada, merchandising), nunca en el header.
- Lockup horizontal: icono + 10 px (a 16 px de cuerpo) + wordmark. Proporción icono/altura de x ≈ 1,75.
- Lockup con eslogan: wordmark arriba, eslogan debajo en **Patrick Hand** 0,7× el cuerpo, color `--accent-pink` o `--text-muted`, rotación −2°. Solo en piezas promocionales.

### 4.4 Usos incorrectos del logo
- Cambiar los colores del icono (rosa, cian, degradados).
- Redondear el cuadrado o convertirlo en círculo.
- Añadir sombras difusas, brillos o efecto neón borroso.
- Escribir el wordmark en otra fuente o en mayúsculas.
- Rotar o deformar el icono o el wordmark.
- Añadir una sombra con CSS (`box-shadow`) al icono: ya la lleva dentro.
- Cambiar la sombra de lado, desenfocarla o cambiarle el color fuera de los estados animados.
- Sobre fondo blanco, usar el logotipo oscuro: va el claro (`morecontext-logo-light.svg`), cuyo borde negro separa la cara del fondo.

---

## 5. Color

Paleta **oscura por defecto** (single dark theme). La marca vive en "el vacío" y usa el neón como luz puntual, nunca como relleno.

### 5.1 Base (The Void)
| Token | Hex | Uso |
|---|---|---|
| `--bg-void` | `#0f0f11` | Fondo de página. No es negro puro: tinte cálido imperceptible. |
| `--bg-surface` | `#18181b` | Tarjetas, paneles, cabeceras de tabla. |
| `--bg-surface-hover` | `#27272a` | Hover de superficies. |
| `--bg-overlay` | `rgba(15,15,17,.8)` | Header fijo y modales con blur. |
| `--callout-bg` | `#1f1f23` | Fondo de avisos (callouts). |
| `--code-bg` | `#0a0a0a` | Bloques de código, inputs, buscador. |

### 5.2 Texto y líneas
| Token | Hex | Uso |
|---|---|---|
| `--text` | `#f4f4f5` | Títulos y texto principal. |
| `--text-2` | `#d4d4d8` | Texto de lectura larga (docs, lecciones). |
| `--text-muted` | `#a1a1aa` | Secundario, descripciones, etiquetas. |
| `--text-faint` | `#71717a` | Metadatos, fechas, rutas. |
| `--text-ghost` | `#52525b` | Placeholders. Nunca para texto que haya que leer. |
| `--border` | `#27272a` | Bordes y separadores. |
| `--border-2` | `#3f3f46` | Bordes en hover / énfasis. |

### 5.3 Acentos neón (significado fijo)
| Token | Hex | Significado | Dónde |
|---|---|---|---|
| `--accent-yellow` | `#fde047` | **Marca**, foco, activo, lo importante | Icono, subrayador, pestaña activa, foco de teclado, chip activo |
| `--accent-cyan` | `#22d3ee` | Enlaces, flujo de datos, arquitectura | Links, nodo activo de diagramas, sidebar activo |
| `--accent-pink` | `#f472b6` | Hover, notas, marcador | Hover de enlaces, marcador del índice, notas manuscritas |
| `--accent-green` | `#86efac` | Éxito | Copiado, tests pasados, suscripción correcta |
| `--accent-red` | `#fb7185` | Error, peligro | Errores, avisos de seguridad, "antes" en comparativas |

### 5.4 Sintaxis de código
| Token | Hex | Elemento |
|---|---|---|
| `--code-keyword` | `#c678dd` | `import`, `def`, `return`, `while` |
| `--code-func` | `#61afef` | Nombres de función |
| `--code-string` | `#98c379` | Cadenas |
| `--code-number` | `#d19a66` | Números |
| `--code-comment` | `#71717a` | Comentarios (en Patrick Hand) |
| `--code-text` | `#e4e4e7` | Resto del código |

### 5.5 Proporciones de uso
- **~90 %** neutros oscuros (void, surface, code-bg).
- **~8 %** texto y líneas.
- **≤ 2 %** acentos. En una misma zona de pantalla, **máximo dos acentos** visibles.
- El amarillo es el color de la marca: si algo es amarillo, es lo más importante de esa vista.

### 5.6 Versión clara (solo para impresión y documentos)
Para PDFs, presentaciones impresas o merchandising sobre fondo claro: fondo `#fafaf9`, texto `#0f0f11`, bordes `#e4e4e7`. El amarillo pasa a usarse solo como subrayador (`rgba(253,224,71,.45)`) o fondo del icono; enlaces en `#0e7490` (cian oscuro) para contraste. La web no tiene modo claro.

---

## 6. Tipografía

Tres familias, cada una con un papel. Todas en Google Fonts.

| Rol | Familia | Pesos | Fallback |
|---|---|---|---|
| **Display técnico / UI / datos** | JetBrains Mono | 400, 500, 700 | ui-monospace, SFMono-Regular, Menlo, Consolas, monospace |
| **Lectura / títulos de documento** | Inter | 300, 400, 500, 600, 700 | system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif |
| **Notas a mano** | Patrick Hand | 400 | Bradley Hand, Segoe Print, cursive |

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Patrick+Hand&display=swap">
```

### Escala
| Elemento | Fuente | Tamaño | Peso | Tracking | Interlineado |
|---|---|---|---|---|---|
| H1 hero (`.display`) | JetBrains Mono | 34–56 px (`clamp(34px,5vw,56px)`) | 700 | −0.02 em | 1.08 |
| H1 de página interior | JetBrains Mono | 32–48 px | 700 | −0.02 em | 1.08 |
| H1 de documento (`.h1-doc`) | Inter | 28–36 px | 700 | −0.01 em | 1.15 |
| H2 | Inter | 24–30 px | 600 | −0.01 em | 1.3 |
| H3 | Inter | 20 px | 600 | normal | 1.35 |
| H4 | Inter | 16 px | 600 | normal | 1.4 |
| Lead | Inter | 18 px | 300 | normal | 1.6 |
| Cuerpo | Inter | 16 px | 400 (300 en docs) | normal | 1.6 |
| Código bloque | JetBrains Mono | 13.5 px | 400 | normal | 1.75 |
| Código en línea | JetBrains Mono | 0.875 em | 400 | normal | — |
| Etiqueta (`.label`) | JetBrains Mono | 12 px, MAYÚSCULAS | 500 | 0.05 em | — |
| Tag | JetBrains Mono | 11 px, MAYÚSCULAS | 500 | 0.05 em | 1.5 |
| Nota manuscrita | Patrick Hand | 18–20 px | 400 | 0.02 em | 1.25 |

### Reglas
- Ancho máximo de texto corrido: **65 caracteres**.
- Títulos con `text-wrap: balance`.
- Cifras alineadas en tablas con `font-variant-numeric: tabular-nums`.
- Mono para todo lo que sea "dato de máquina": rutas, comandos, nombres de campo, fechas, metadatos, botones.
- Inter para todo lo que se lee como prosa.
- Patrick Hand **solo** en notas al margen, comentarios de código y placeholders. Nunca en títulos, botones ni párrafos.

---

## 7. Retícula, espacio y layout

### Retícula de ingeniería (fondo)
Solo en la cabecera de cada página (hero o page-head). Nunca a pantalla completa.
```css
.grid-bg::before{
  background-size:40px 40px;
  background-image:
    linear-gradient(to right,#27272a 1px,transparent 1px),
    linear-gradient(to bottom,#27272a 1px,transparent 1px);
  mask-image:radial-gradient(circle at center,black 40%,transparent 100%);
  opacity:.15;
}
```

### Contenedores y medidas
| Medida | Valor |
|---|---|
| Ancho máximo | 1200 px |
| Ancho de lectura | 820 px (`.wrap.narrow`) |
| Margen lateral | mínimo 16 px (`max(16px, env(safe-area-inset-*))`) |
| Altura del header | 60 px |
| Sidebar de docs | 260 px |
| Índice lateral (TOC) | 240 px |

### Escala de espaciado (base 4)
`4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 88`
- Entre secciones: 88 px (64 px en móvil).
- Entre cabecera de sección y contenido: 40 px.
- Separación en rejillas: 24 px.
- Padding de tarjetas: 22 px.

### Layouts tipo
1. **Home / landing:** secciones a ancho completo separadas por una línea de 1 px, alternando anchuras y alineaciones (texto + tabla, rejilla de tarjetas, código + anotaciones).
2. **Documentación y lecciones:** tres columnas: sidebar (árbol) · artículo · índice "En esta página" con marcador rosa que sigue el scroll.
3. **Guías y patrones:** dos columnas: contenido · índice lateral.
4. **Listados (recetas, radar, glosario):** cabecera + filtros con chips + rejilla o línea temporal.

### Puntos de ruptura
| Ancho | Cambio |
|---|---|
| ≤ 1240 px | Se oculta el índice lateral (TOC) |
| ≤ 1120 px | La navegación pasa a menú desplegable |
| ≤ 900 px | Se oculta el sidebar de docs (aparece un desplegable "Índice") |
| ≤ 680 px | Todo a una columna |
| ≤ 420 px | Header compacto |

---

## 8. Forma: bordes, radios y sombras

### Radios
| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 2 px | Botones, inputs, tags, icono |
| `--radius-md` | 4 px | Tarjetas, bloques de código, tablas |
| `--radius-sketch` | `2px 255px 3px 25px / 255px 5px 225px 5px` | Botón secundario "a mano alzada" y subrayados de pestañas |

Nada por encima de 4 px salvo el radio *sketch*. Nunca píldoras ni tarjetas muy redondeadas.

### Sombras duras (sin desenfoque)
| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `2px 2px 0 0 #27272a` | Icono, chips activos, botón copiar |
| `--shadow-md` | `4px 4px 0 0 #27272a` | Hover de tarjetas-enlace |
| `--shadow-lg` | `8px 8px 0 0 #000` | Bloques de código principales, buscador Ctrl+K |
| `--shadow-neon` | `0 0 10px 0 rgba(34,211,238,.3)` | Solo nodo "encendido" de un diagrama |

**Regla minimalista:** las sombras aparecen como respuesta a la interacción (hover) o para marcar el objeto principal de una vista. Nunca en todas las tarjetas a la vez.

### Bordes
- 1 px sólido `--border` para contenedores.
- 1 px **discontinuo** para separadores internos (filas de tabla, listas, notas).
- 4 px a la izquierda en avisos (callouts), del color de su tipo.

---

## 9. Componentes de interfaz

### Botón primario "Terminal"
- Fondo blanco `#fff`, texto negro, borde 2 px negro, JetBrains Mono 700, 14 px, radio 2 px.
- Prefijo opcional `$` en gris (`--text-ghost`).
- Hover: `translate(-2px,-2px)` + `box-shadow: 4px 4px 0 var(--accent-yellow)`.
- Activo: vuelve a `translate(0,0)` y pierde la sombra (pulsación mecánica).
- Variante oscura: fondo negro, borde y texto blancos, sombra blanca en hover.

### Botón secundario "Sketch"
- Transparente, borde 2 px `--text-muted` con `radius-sketch`, JetBrains Mono 500.
- Hover: borde y texto en amarillo, rotación −1°.

### Enlace con flecha
JetBrains Mono 13 px, cian, flecha `→` que se desplaza 3 px en hover.

### Buscador (Ctrl+K)
- Fondo `--code-bg`, borde 1 px `--border`; en foco, borde amarillo y sin outline nativo.
- Lupa a la izquierda; tecla física `Ctrl K` / `⌘ K` a la derecha (borde inferior de 3 px).
- Placeholder en Patrick Hand, color `--text-ghost`.
- Atajos: `Ctrl/⌘ + K` y `/` abren la paleta en cualquier página.
- Paleta: modal centrado arriba, fondo `--bg-surface`, sombra `--shadow-lg`, resultado activo con borde izquierdo cian y degradado sutil.

### Callouts (cinta adhesiva)
- Fondo `--callout-bg`, borde izquierdo 4 px del color del tipo.
- "Cinta" superior: rectángulo 96 × 24 px, color del tipo al 20 %, `rotate(1deg) skewX(12deg)`.
- Tipos: **Aviso** amarillo · **Info** cian · **Consejo** verde · **Peligro** rojo.
- Etiqueta en mono 11 px mayúsculas con icono de línea de 16 px.

### Comparativa antes / después
Dos cajas de código: "Antes" con borde discontinuo y etiqueta roja; "Después" con borde sólido verde tenue y etiqueta verde.

### Tablas
- Sin bordes verticales.
- Cabecera: fondo `--bg-surface`, mono 12 px mayúsculas, `--text-muted`.
- Filas separadas por línea discontinua; hover con fondo `--bg-surface`.
- Celdas `12px 16px`, Inter 14 px.

### Pestañas de código
- Pestaña inactiva gris; activa en amarillo con subrayado de 2 px dibujado (`radius-sketch`, `rotate(-.8deg)`).
- Python / TypeScript sincronizadas en todo el sitio y recordadas.
- Botón **Copiar** → estado **Copiado** en verde durante 1,6 s.

### Tarjetas
- Fondo `--bg-surface`, borde 1 px, radio 4 px, sin sombra en reposo.
- Si son enlace: en hover se desplazan −2 px y ganan `--shadow-md`.
- Metadatos arriba (tags), título H3 17 px, descripción `--text-muted`, pie con stack / tiempo / dificultad.

### Tags y chips
- Tag: mono 11 px mayúsculas, borde 1 px; versión de color con borde al 35 %.
- Chip de filtro: igual pero clicable; activo con fondo amarillo y texto negro.
- Dificultad: tres cuadraditos de 7 px (`.dots`), llenos en amarillo.

### Sidebar e índice
- Sidebar: enlace activo en cian, borde izquierdo 2 px cian, degradado `rgba(34,211,238,.1) → transparente`.
- Índice "En esta página": línea vertical gris; marcador rosa de 3 × 20 px que se mueve con el scroll.

### Pasos numerados
Solo para secuencias reales. Número en caja mono de 31 px, línea discontinua vertical uniendo los pasos.

### Progreso y checklist
- Barra con rayado diagonal amarillo (`repeating-linear-gradient(-45deg, #fde047 0 6px, #facc15 6px 12px)`).
- Checkbox cuadrado de 18 px; marcado en verde, texto tachado en gris.

### Quiz
Opciones como botones de código; la correcta se marca en verde, la elegida incorrecta en rojo, y aparece la explicación.

---

## 10. Código y sintaxis

- Tema oscuro tipo Dracula/Monokai modificado (tokens en §5.4).
- **Comentarios en Patrick Hand** a 1.18× para que parezcan anotaciones a mano.
- Barra superior del bloque: pestañas · nombre de archivo en mono gris · botón Copiar.
- Las salidas de terminal se muestran en una caja con borde discontinuo y siempre se etiquetan como **"salida de ejemplo"** si no son reales.
- El código de ejemplo debe ser correcto y ejecutable. Una constante `MODEL` arriba del snippet, nunca nombres de modelo repartidos por el código.

---

## 11. Diagramas e ilustración

MoreContext **no usa fotos ni ilustraciones decorativas**. La ilustración de la marca es el **diagrama técnico**.

### Estilo de diagrama
- Cajas: fondo `--code-bg`, borde 1.5 px `--border-2`, radio 4 px.
- Texto de caja: JetBrains Mono 13 px; subtexto 10.5 px `--text-muted`.
- Flechas: 1.3 px `--text-faint`; punta triangular rellena.
- **Un único nodo "encendido" por diagrama**: borde cian, fondo `#0b1416`, `shadow-neon`. Es el foco de la explicación.
- Flujo activo: línea discontinua cian `5 5` animada lentamente.
- Anotaciones: Patrick Hand rosa, 16 px, con flecha dibujada a mano.
- Siempre con margen interno suficiente para que nada se recorte.

### Motivos gráficos de marca
- **Corchetes `[ ]`**: encuadran un concepto ("lo que importa, en contexto").
- **Subrayador amarillo**: marca una palabra clave por titular, como mucho.
- **Retícula**: el papel del cuaderno.
- **Trazas**: líneas de log tipo `[1] stop_reason="tool_use" → buscar_docs()` como textura tipográfica.

---

## 12. Iconografía

- Iconos de **línea**, trazo 1.5 px, extremos redondeados, cuadrícula de 16 o 24 px.
- Color heredado del texto (`currentColor`); en avisos, del color del tipo.
- Sin iconos rellenos, sin iconos de colores, **sin emojis**.
- Set base: lupa, flecha, check, aviso (triángulo), info (círculo con i), bombilla (consejo), escudo (seguridad), código `</>`, terminal `>_`, libro, nodo/grafo, reloj, copiar.
- Fuente recomendada si se necesita un set completo: Lucide (estilo coherente con estas reglas).

---

## 13. Notas manuscritas

Son la firma humana del cuaderno. Por eso hay que usarlas poco.

- Fuente: Patrick Hand 18–20 px, color rosa (por defecto), amarillo o cian.
- Rotación entre −3° y +4°, nunca más.
- Con flecha dibujada a mano (SVG, trazo 1.6 px, extremos redondeados) apuntando a lo que comentan.
- **Máximo una por sección.** Deben aportar información real: un aviso ("aquí se gasta el dinero"), un atajo ("empieza aquí si nunca has usado una API"). Nunca decorativas.

---

## 14. Movimiento

Movimiento **mecánico y breve**, como piezas de un instrumento.

| Interacción | Animación |
|---|---|
| Hover de botón / tarjeta | `translate(-2px,-2px)` + sombra dura, 120–150 ms, `ease` |
| Pulsación | vuelve a 0 sin sombra, inmediato |
| Botón sketch | rotación −1°, 150 ms |
| Flujo en diagramas | `stroke-dashoffset` continuo, 1.4 s lineal |
| Marcador del índice | `top` 250 ms `ease` |
| Llegar a un ancla | contorno discontinuo amarillo que se desvanece en 1.6 s |

### Icono `[+]` animado

Tres animaciones del kit `morecontext-animaciones-v1` (su `README` está en `docs/marca/morecontext-animaciones-v1/`), y ninguna más: ni giro, ni pulsación, ni «sin resultados». El icono va en línea (`svgMarca()` en `src/scripts/icono-marca.ts`) y los estados están en `src/styles/icono-marca.css`. Los desplazamientos van en unidades del `viewBox` (26 × 26), así que escalan con el tamaño del icono.

| Animación | Dónde | Disparador | Duración |
|---|---|---|---|
| **Elevación** (`.mc-lift`) | `[+]` del hero de la portada | `:hover` (solo con `@media (hover: hover)`): la cara sube 1,2 u y la sombra baja 0,8 u. `:active`: la cara baja 2,4 u sobre su sombra y vuelve al soltar. Es decorativo: ni botón, ni enlace, ni foco | 140 ms (`ease`); al pulsar, inmediato |
| **Buscando** (`.is-searching`) | Icono del cuadro de la paleta de búsqueda | Búsqueda en curso que tarda más de 150 ms (con `aria-busy` en los resultados); se apaga al llegar los resultados, si no hay o al cerrar la paleta | 900 ms en bucle: los corchetes se abren 1,6 u y el `+` gira un cuarto |
| **Copiado** `[+] → [✓]` (`.is-copied`) | Botón Copiar de los bloques de código | Copia correcta (si solo se selecciona el texto, no se anima) | 1,6 s: el `+` gira y desaparece, aparece el `✓`, la sombra pasa a `--accent-green` y todo vuelve |

El color nunca va solo: el copiado se acompaña del texto «Copiado» (anunciado con `aria-live`).

Reglas:
- Nada aparece desde `opacity:0`. El contenido se ve completo al cargar.
- Sin parallax, sin rebotes, sin transiciones de página.
- Con `prefers-reduced-motion: reduce` se desactiva todo. Al copiar se sigue viendo `[✓]` con la sombra verde, sin animar.

---

## 15. Accesibilidad

- Contraste mínimo AA: texto principal `#f4f4f5` y secundario `#a1a1aa` sobre `#0f0f11` cumplen; `--text-ghost` solo para placeholders.
- El color nunca es la única señal: estados con texto ("Correcto", "Copiado") o forma (tachado, icono).
- Foco de teclado visible: `outline: 2px solid #fde047; outline-offset: 3px`.
- Navegación completa por teclado: paleta Ctrl+K con flechas, Enter y Esc; pestañas con flechas.
- Enlace "Saltar al contenido" al inicio de cada página.
- Diagramas con texto alternativo o explicación equivalente en el texto.
- Áreas táctiles de 36 px mínimo en móvil.

---

## 16. Aplicaciones de marca

### Favicon y app
- Del kit `morecontext-icono-v1` (`web/`), tal cual en `public/`: `favicon.ico` (16, 32, 48), `favicon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` y `site.webmanifest`. No se generan: `scripts/og.mjs` solo hace la imagen OG por defecto.
- En el `<head>`: `favicon.ico` con `sizes="48x48"`, `favicon.svg`, `apple-touch-icon`, el manifiesto y `theme-color` `#0f0f11`.

### Imagen para compartir (Open Graph, 1200 × 630)
- Fondo `#0f0f11` con retícula al 15 %.
- Arriba izquierda: lockup `[+] morecontext`.
- Centro: título de la página en JetBrains Mono 700, 64 px, blanco, máximo 3 líneas; una palabra con subrayador amarillo.
- Abajo: sección en mono 20 px mayúsculas (`DOCS · USO DE HERRAMIENTAS`) y `morecontextai.com`.
- Opcional: un diagrama mínimo con un nodo cian encendido a la derecha.

### Redes sociales
- Avatar: icono `[+]` principal.
- Banner: fondo void + retícula + eslogan "Más contexto, menos ruido." con "contexto" subrayado + nota manuscrita rosa con flecha ("sin humo").
- Publicaciones: plantillas con cabecera mono, un bloque de código o un diagrama, y una sola idea por pieza.

### Presentaciones
- Portada oscura con retícula, título mono, subtítulo Inter 300.
- Diapositivas de contenido: título Inter 600, un único acento por diapositiva.
- Código siempre en el bloque de marca con sombra dura `8px 8px 0 #000`.

### Merchandising (opcional)
- Camiseta negra con `[+]` amarillo pequeño en el pecho y `más contexto, menos ruido.` en Patrick Hand en la espalda.
- Pegatina cuadrada del icono con sombra dura impresa.

---

## 17. Qué sí / qué no

| Sí | No |
|---|---|
| Un acento amarillo por vista para lo importante | Neón por todas partes o con brillo difuso |
| Sombras duras como respuesta al hover | Sombras suaves, desenfocadas o en todas las tarjetas |
| Diagramas técnicos como ilustración | Fotos de stock, robots, cerebros brillantes, manos humanas tocando circuitos |
| Código real y probado | Pseudo-código presentado como real |
| Cifras con fuente o marcadas como ejemplo | Cifras de alumnos, % de mejora o testimonios inventados |
| Mono para datos, Inter para leer | Más de tres familias tipográficas |
| Radios de 2–4 px | Píldoras, radios grandes, glassmorphism |
| Una nota manuscrita útil | Notas decorativas o en cada bloque |
| "Qué cambia en la práctica" | "Esto lo cambia todo" |
| Degradados solo como reflejo sutil (sidebar activo) | Degradados morado→azul o de colores vivos |

---

## 18. Entregables de branding (checklist)

**Identidad**
- [ ] Icono `[+]` en SVG (principal, invertido, línea, mono blanco, mono negro)
- [ ] Wordmark `morecontext` en SVG (oscuro y claro)
- [ ] Lockups: horizontal, con eslogan, solo icono
- [ ] Construcción del icono sobre cuadrícula 26 × 26 (v1, `docs/marca/morecontext-icono-v1/README.md`)
- [ ] Área de respeto y tamaños mínimos

**Web**
- [ ] `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest`
- [ ] Plantilla Open Graph 1200 × 630 (home + una por sección)
- [ ] Sustituir el logo `A_` de la web actual por `[+]` y el nombre por `morecontext`

**Comunicación**
- [ ] Avatar y banner para redes (X, LinkedIn, YouTube, GitHub, Discord)
- [ ] Plantilla de publicación (código / diagrama / cita)
- [ ] Plantilla de slides
- [ ] Cabecera del boletín por email

**Documentación**
- [ ] Este documento en PDF
- [ ] Kit descargable (`/brand`) con logos y colores para la comunidad

---

## 19. Anexo: tokens CSS

```css
:root{
  color-scheme: dark;
  /* Base */
  --bg-void:#0f0f11;
  --bg-surface:#18181b;
  --bg-surface-hover:#27272a;
  --bg-overlay:rgba(15,15,17,.8);
  --callout-bg:#1f1f23;
  /* Código */
  --code-bg:#0a0a0a;
  --code-keyword:#c678dd;
  --code-func:#61afef;
  --code-string:#98c379;
  --code-number:#d19a66;
  --code-comment:#71717a;
  --code-text:#e4e4e7;
  /* Acentos */
  --accent-yellow:#fde047;  /* marca */
  --accent-cyan:#22d3ee;
  --accent-pink:#f472b6;
  --accent-green:#86efac;
  --accent-red:#fb7185;
  /* Texto y líneas */
  --text:#f4f4f5;
  --text-2:#d4d4d8;
  --text-muted:#a1a1aa;
  --text-faint:#71717a;
  --text-ghost:#52525b;
  --border:#27272a;
  --border-2:#3f3f46;
  /* Sombras duras */
  --shadow-sm:2px 2px 0 0 #27272a;
  --shadow-md:4px 4px 0 0 #27272a;
  --shadow-lg:8px 8px 0 0 #000;
  --shadow-neon:0 0 10px 0 rgba(34,211,238,.3);
  /* Radios */
  --radius-sm:2px;
  --radius-md:4px;
  --radius-sketch:2px 255px 3px 25px / 255px 5px 225px 5px;
  /* Tipos */
  --font-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --font-sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
  --font-hand:"Patrick Hand","Bradley Hand","Segoe Print",cursive;
  /* Medidas */
  --header-h:60px;
  --maxw:1200px;
  --sidebar-w:260px;
  --toc-w:240px;
}
```

### Icono `[+]` de referencia (SVG, v1)
`morecontext-icon.svg` del kit `morecontext-icono-v1` (`docs/marca/`):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="208" height="208">
  <!-- sombra amarilla en L, desplazada 3 u abajo a la derecha -->
  <path d="M23.6 3H26V26H3V23.6H23.6Z" fill="#fde047"/>
  <!-- cara blanca con borde negro -->
  <rect x="0.6" y="0.6" width="22.4" height="22.4" fill="#fafafa" stroke="#000000" stroke-width="1.2"/>
  <!-- corchetes y más -->
  <path d="M7.8 4.8H4.8v14h3M15.8 4.8h3v14h-3M11.8 9.05v6M8.8 12.05h6" fill="none" stroke="#000000" stroke-width="2.2" stroke-linecap="square"/>
</svg>
```

---

*MoreContext · Guía de marca y diseño v1.1 · octubre 2026. Basada en Cookbooks Design System v2.1, edición minimalista. La implementación de estos tokens en Astro está en `docs/PLAN-IMPLEMENTACION.md` (fase 2).*
