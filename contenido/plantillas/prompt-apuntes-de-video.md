---
titulo: "Prompt: apuntes de vídeo para Obsidian"
descripcion: El prompt maestro del autor para convertir un vídeo técnico en apuntes exhaustivos de Obsidian, con callouts, glosario, marcas de tiempo y autoevaluación.
creado: 2026-10-29
tipo: prompt
formato: md
archivo: prompt-apuntes.md
tags: [plantillas, prompt, aprendizaje, obsidian, segundo-cerebro]
relacionados: ["[[recetas/apuntes-de-video-con-ia]]", "[[blog/2026-10-14-mi-ruta-para-aprender-ia-con-videos]]", "[[cursos/ruta-en-video/index]]", "[[blog/2026-10-21-treinta-minutos-al-dia]]"]
---

Este es el prompt que usa el autor para estudiar con vídeos: le das un enlace a un modelo que pueda ver el vídeo y te devuelve **un único archivo Markdown listo para Obsidian**, pensado para que alguien que no lo ha visto aprenda lo mismo que quien lo vio tomando notas. Trabaja en dos fases (un inventario interno de todo lo que aparece y la redacción de los apuntes), obliga a definir cada término antes de usarlo, a poner primero la explicación técnica y después un símil, a separar lo que dice el vídeo de lo que añade el modelo y a marcar con una advertencia cualquier dato dudoso. Se reproduce tal cual, sin generalizar: es del autor.

## Cuándo usarla

- Para convertir una charla o un tutorial técnico en apuntes de estudio que puedas repasar y enlazar en tu bóveda.
- Cuando sigues una ruta de aprendizaje con vídeos ([[cursos/ruta-en-video/index]]) y quieres que todos los apuntes tengan la misma estructura.
- No la uses como sustituto de ver el vídeo cuando el tema es nuevo para ti y lo necesitas de verdad: los apuntes son un apoyo para repasar, no una garantía de que el modelo entendió bien.

**Cómo se usa.** Copia el bloque entero, pégalo en una herramienta de IA que pueda ver vídeos y sustituye `{{URL_DEL_VIDEO}}` por el enlace. Nada más. Si tu herramienta no ve vídeo, puedes adjuntar la transcripción y pedir que trate las marcas de tiempo de la transcripción como referencia; pierdes lo visual (diagramas, código en pantalla), que el prompt pide describir.

> [!aviso] Uso responsable
> Los apuntes son para tu estudio personal. El vídeo y sus ideas son de quien lo hizo: no publiques los apuntes ni la transcripción como contenido propio. Si compartes algo, resume con tus palabras, enlaza el vídeo y cita al autor. Respeta las condiciones de la plataforma (no descargues el vídeo si no lo permiten) y no subas a una herramienta de terceros vídeos privados o de tu empresa sin permiso. Y revisa los datos: el prompt prohíbe inventar, pero un modelo puede oír mal una cifra o un comando; busca las marcas «verificar en el vídeo» y compruébalas.

## La plantilla

````markdown nocheck title="prompt-apuntes.md"
# ROL

Eres un **analista maestro de contenido técnico** y **tomador de apuntes de élite**. Tu especialidad es diseccionar vídeos con precisión **quirúrgica** y convertirlos en apuntes **maestros** de Obsidian: exhaustivos, autocontenidos y comprensibles para alguien que parte de CERO en el tema.

Tu criterio de éxito es uno solo:

> Una persona que NUNCA ha visto el vídeo debe poder leer tus apuntes y quedarse con exactamente el mismo conocimiento —y el mismo nivel de detalle— que si lo hubiera visto entero tomando notas a mano.

---

# VÍDEO A ANALIZAR

{{URL_DEL_VIDEO}}

---

# FASE 1 — ANÁLISIS QUIRÚRGICO (interno, no lo muestres)

Antes de escribir una sola línea de apuntes, visiona el vídeo COMPLETO de principio a fin y construye mentalmente un inventario exhaustivo. Analiza **quirúrgicamente**, es decir: no te quedes con la idea general, abre el vídeo en capas y extrae cada pieza.

Debes inventariar, sin excepción:

1. **Estructura real** — cada bloque temático del vídeo, en el orden en que aparece, con su marca de tiempo aproximada.
2. **Todos los conceptos** mencionados, incluso los que el autor suelta de pasada o da por sabidos.
3. **Toda la terminología** — cada palabra técnica, acrónimo, anglicismo o jerga que se pronuncie.
4. **Todos los datos duros** — cifras, fechas, versiones, precios, benchmarks, porcentajes, nombres de modelos.
5. **Todas las herramientas, productos, empresas, webs, librerías y personas** citadas.
6. **Todo el código, comandos de terminal, rutas de archivo y configuraciones** que aparezcan en pantalla o se dicten.
7. **Todo lo visual** — diagramas, esquemas, capturas, demos en vivo, resultados en pantalla. Descríbelos por escrito, porque en los apuntes no habrá imagen.
8. **Los pasos de cualquier procedimiento** mostrado, en orden y sin saltarte ninguno.
9. **Las opiniones, advertencias, recomendaciones y "esto no lo hagas"** del autor, separadas de los hechos objetivos.
10. **Los huecos** — lo que el autor menciona pero no explica, y lo que promete para otro vídeo.

Aplica este control de calidad antes de pasar a la Fase 2:

- ¿Hay algún minuto del vídeo que no esté representado en mi inventario? → vuelve a él.
- ¿He apuntado algún concepto solo por su nombre, sin su explicación? → recupérala.
- ¿Podría alguien leer mis apuntes y preguntar "¿y esto qué es?" sobre algo que yo he escrito? → esa es la pieza que me falta explicar.

---

# FASE 2 — REDACCIÓN DE LOS APUNTES MAESTROS

Ahora escribe los apuntes. Un solo archivo markdown, listo para pegar en Obsidian.

## Principio pedagógico obligatorio: "para tontos"

Escribe asumiendo que el lector es **inteligente pero no sabe absolutamente nada** del tema. Por tanto:

- **Nunca uses un término técnico sin haberlo definido antes**, aunque el autor del vídeo lo dé por sabido. Si el vídeo dice "esto se guarda en el contexto", tú primero explicas qué es el contexto.
- Para **cada concepto complejo**, aplica siempre esta secuencia de dos pasos, en este orden:
  1. **La base** — la explicación técnica correcta, en prosa clara y sin adornos.
  2. **El símil** — una analogía cotidiana que lo haga tangible (cocina, coches, oficinas, construcción, biblioteca, restaurante...). El símil va SIEMPRE después de la base, nunca en lugar de ella.
- Prefiere frases cortas. Si una frase necesita dos comas para respirar, pártela en dos.
- Si algo tiene varios pasos, es una lista numerada. Si algo tiene varias piezas sueltas, es una lista con guiones. Si algo compara opciones, es una tabla.

## Uso obligatorio de callouts de Obsidian

Usa callouts de forma generosa pero con criterio: cada uno con su tipo semántico correcto. Sintaxis exacta:

> [!TIP] Título de la nota
> Contenido de la nota.

Tipos que debes emplear y cuándo:

| Callout | Cuándo usarlo |
|---|---|
| `[!EXAMPLE] Símil` | Cada analogía. Este es el que más vas a usar. |
| `[!INFO] Definición` | Cada vez que definas un término por primera vez. |
| `[!TIP] Consejo` | Trucos y buenas prácticas que da el autor. |
| `[!WARNING] Cuidado` | Errores comunes, cosas frágiles, limitaciones. |
| `[!DANGER] Riesgo` | Algo que puede romper cosas, costar dinero o ser irreversible. |
| `[!NOTE] Contexto` | Información de fondo que el vídeo asume pero no explica. |
| `[!QUESTION] Duda abierta` | Lo que el vídeo deja sin responder. |
| `[!QUOTE] Cita` | Frase textual del autor que merezca conservarse literal. |
| `[!SUCCESS] Conclusión` | El "para qué sirve esto" al cerrar un bloque. |
| `[!TODO] Practicar` | Acción concreta que el lector debería hacer. |

Los callouts largos pueden plegarse añadiendo `-` tras el tipo: `> [!NOTE]- Título`.

---

# FORMATO EXACTO DE SALIDA

Devuelve **únicamente** el contenido markdown del archivo, sin texto introductorio ni despedida. Sigue esta estructura al pie de la letra:

---
titulo: "Título exacto del vídeo"
canal: "Nombre del canal"
url: {{URL_DEL_VIDEO}}
duracion: "HH:MM:SS"
fecha_video: AAAA-MM-DD
fecha_apuntes: AAAA-MM-DD
nivel: principiante | intermedio | avanzado
tags: [tema/subtema, herramienta, concepto]
estado: sin-repasar
---

# {Título del vídeo}

> [!ABSTRACT] De qué va esto en 3 frases
> Resumen honesto del vídeo: qué problema plantea, qué enseña y a quién le sirve.

## 🎯 Qué vas a saber al terminar estos apuntes

- Punto de aprendizaje 1
- Punto de aprendizaje 2
- (uno por cada bloque grande del vídeo)

## 🧩 Requisitos previos

Lo que conviene entender antes. Si el vídeo no lo explica, explícalo tú aquí brevemente.

> [!NOTE] Contexto
> Explicación de cualquier concepto previo que el vídeo dé por sabido.

## 🗺️ Mapa mental del vídeo

Esquema visual en bloque de código que muestre cómo se relacionan las piezas principales. Usa texto plano con flechas e indentación.

---

## 📖 Desarrollo detallado

> A partir de aquí, una sección `##` por cada bloque temático del vídeo, en el orden original. Dentro de cada una, tantos `###` como subtemas haga falta. **No agrupes ni comprimas: si el vídeo dedica cinco minutos a algo, tus apuntes le dedican su propia sección.**

### {Nombre del bloque} `⏱️ MM:SS`

Explicación en prosa clara. Base primero.

> [!INFO] Definición: {término}
> Qué es, en una o dos frases.

> [!EXAMPLE] Símil
> La analogía cotidiana que lo aterriza.

(Repite el patrón base → definición → símil por cada concepto del bloque.)

Cuando haya un procedimiento:

1. Paso uno, con el detalle exacto.
2. Paso dos.
3. Paso tres.

Cuando haya código o comandos, en bloque con su lenguaje:

```bash
comando exacto que apareció en el vídeo
```

Y explica **línea por línea** qué hace cada parte.

Cuando el autor muestre algo en pantalla que no puedas capturar, descríbelo:

> [!NOTE] En pantalla Descripción textual de lo que se ve (diagrama, resultado, interfaz).

Cierra cada bloque con:

> [!SUCCESS] Idea clave del bloque La frase que resume lo esencial de esta sección.

---

## 🛠️ Herramientas, recursos y enlaces mencionados

|Qué|Para qué sirve|Dónde encontrarlo|
|---|---|---|
||||

## 📚 Glosario completo

Todos los términos técnicos del vídeo, en orden alfabético, cada uno con definición breve. Incluye también los que el autor solo mencionó de pasada.

- **Término** — definición en una frase.

## 🔢 Datos y cifras concretas

Cualquier número, versión, fecha, precio o benchmark mencionado, con su contexto.

## ⚠️ Errores comunes y advertencias

> [!WARNING] Cuidado Todo lo que el autor avisa que suele salir mal.

## 💡 Opiniones del autor (≠ hechos)

Lo que es criterio personal del divulgador, marcado como tal para no confundirlo con verdad objetiva.

> [!QUOTE] Cita Frase textual relevante.

## ❓ Lo que queda pendiente

> [!QUESTION] Duda abierta Temas que el vídeo nombra pero no desarrolla, o que promete para otra ocasión.

## ✅ Para practicar

> [!TODO] Practicar
> 
> - [ ] Acción concreta 1
> - [ ] Acción concreta 2

## 🔗 Notas relacionadas

Enlaces internos de Obsidian a los conceptos tratados, para tejer tu bóveda:

[[Concepto 1]] · [[Concepto 2]] · [[Herramienta X]]

## 🧠 Repaso rápido (autoevaluación)

Cinco preguntas sobre el contenido. La respuesta va plegada:

**1. ¿Pregunta?**

> [!SUCCESS]- Respuesta La respuesta.

---

# REGLAS INQUEBRANTABLES

1. **Exhaustividad sobre brevedad.** Estos apuntes NO son un resumen. Si dudas entre incluir algo o dejarlo fuera, inclúyelo. La longitud correcta es la que exija el vídeo.
2. **Cero invención.** Si no estás seguro de haber oído bien un dato, un nombre o un comando, márcalo así: `⚠️ verificar en el vídeo (MM:SS)`. Jamás rellenes huecos con conocimiento general disfrazado de contenido del vídeo.
3. **Separa fuentes.** Lo que dice el vídeo va en el cuerpo. Lo que añades tú para que se entienda va siempre dentro de un callout `[!NOTE] Contexto`. El lector debe poder distinguirlo.
4. **Marcas de tiempo siempre.** Cada sección principal lleva su `⏱️ MM:SS` para poder volver al vídeo.
5. **Nada de relleno.** Prohibido "en resumen, este vídeo es muy interesante", "como hemos visto" y similares. Cada frase aporta información.
6. **Idioma:** español, conservando los términos técnicos en su forma original en inglés cuando así se usan en el sector (y explicándolos la primera vez).
7. **Nombre del archivo:** propón al final, en una última línea fuera del markdown, el nombre sugerido con el formato `AAAA-MM-DD - Canal - Título corto.md`.
8. **Salida limpia.** Devuelve solo el markdown. Sin preámbulos, sin "aquí tienes tus apuntes", sin comentarios finales.

Empieza ahora con la Fase 1.
````

## Cómo rellenarla

El único campo es `{{URL_DEL_VIDEO}}`, que aparece dos veces: en «VÍDEO A ANALIZAR» y en el frontmatter de salida. Todo lo demás se usa tal cual. El autor propone añadir al final del prompt una de estas líneas según el vídeo:

- **Vídeo muy largo (más de dos horas):** «El vídeo es largo: divide los apuntes en un archivo índice + un archivo por bloque grande, enlazados entre sí con wikilinks.»
- **Vídeo puramente teórico:** «Prioriza glosario y símiles; omite las secciones de código y comandos.»
- **Vídeo práctico o tutorial:** «Prioriza la reproducibilidad: cada comando exacto, cada ruta de archivo, cada versión. Los apuntes deben servir para repetir el tutorial sin volver a ver el vídeo.»
- **Tarjetas de repaso:** «Añade al final un bloque de flashcards en formato pregunta::respuesta compatible con el plugin Spaced Repetition de Obsidian.»

Dos detalles al pegarlo en tu bóveda:

- Los callouts del prompt usan los tipos de Obsidian en inglés (`[!TIP]`, `[!WARNING]`, `[!EXAMPLE]`…). Obsidian los reconoce sin plugins.
- Los enlaces de «Notas relacionadas» los propone el modelo con los nombres que cree que tendrán tus notas. Revísalos: un wikilink a una nota que no existe solo crea un hueco, pero conviene que apunte a tus conceptos reales.

Consejo del autor: crea una plantilla en Obsidian (por ejemplo `Templates/Apuntes de vídeo.md`) con la estructura de salida vacía. Si cambias de herramienta de IA, tus apuntes mantendrán el mismo formato y los enlaces seguirán funcionando.

## Ejemplo

El principio de unos apuntes generados con este prompt para un vídeo ficticio sobre *embeddings*:

```markdown title="2026-10-20 - Canal de ejemplo - Embeddings.md"
---
titulo: "Embeddings explicados desde cero"
canal: "Canal de ejemplo"
url: https://example.com/video-embeddings
duracion: "00:24:10"
fecha_video: 2026-10-20
fecha_apuntes: 2026-10-29
nivel: principiante
tags: [ia/rag, embeddings, concepto]
estado: sin-repasar
---

> [!ABSTRACT] De qué va esto en 3 frases
> Explica qué es un embedding, cómo se compara la similitud entre dos textos y por qué es la base de la búsqueda semántica. Sirve a quien empieza con RAG.

### Qué es un embedding `⏱️ 02:15`

Un embedding es una lista de números que representa el significado de un texto. Textos con significado parecido dan listas parecidas.

> [!EXAMPLE] Símil
> Como las coordenadas de una ciudad en un mapa: dos ciudades cercanas tienen coordenadas parecidas.

> [!SUCCESS] Idea clave del bloque
> Comparar significados se reduce a comparar listas de números.
```

## Errores típicos

- **Usar una herramienta que no ve el vídeo** sin decírselo: algunos modelos responden igual, inventando a partir del título. Si no puede verlo, dale la transcripción.
- **Publicar los apuntes.** Son un derivado del vídeo de otra persona; para compartir, escribe tu propio resumen y enlaza el original.
- **No revisar las marcas de verificación.** Cifras, versiones y comandos son lo que más se oye mal.
- **Vídeos de más de dos horas en un solo archivo.** El resultado se resume en exceso al final; usa el ajuste de vídeo largo.
- **Pedirle además un resumen corto.** El prompt está diseñado para exhaustividad: si quieres un resumen, es otro prompt.

## Relacionadas

- [[recetas/apuntes-de-video-con-ia]]: el flujo completo, del vídeo a la bóveda.
- [[blog/2026-10-14-mi-ruta-para-aprender-ia-con-videos]]: por qué el autor aprende así.
- [[blog/2026-10-21-treinta-minutos-al-dia]]: el hábito que lo sostiene.
- [[glosario/alucinacion]]: por qué hay que verificar lo que transcribe el modelo.
