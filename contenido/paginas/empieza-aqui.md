---
titulo: Empieza aquí
descripcion: Elige tu ruta según lo que ya sabes, haz el test de nivel de tres preguntas y aprende a moverte por MoreContext sin perderte.
creado: 2026-07-01
actualizado: 2026-10-29
tags: [inicio, rutas]
relacionados: ["[[roadmap/index]]", "[[cursos/ruta-en-video/index]]", "[[cursos/langchain-y-langgraph/index]]", "[[glosario/index]]", "[[paginas/manifiesto]]"]
---

MoreContext tiene mucho contenido y no hace falta leerlo todo. Esta página te dice **por dónde empezar según tu punto de partida**, con pasos concretos y en orden. Si no sabes qué perfil eres, haz primero el test de nivel de más abajo.

## Rutas por perfil

### Nunca he usado la API de un modelo

Sabes programar, pero no has llamado a un modelo desde código. Tu objetivo es entender qué tienes entre manos y hacer tu primera llamada con criterio.

1. Lee [[roadmap/00-fundamentos/01-que-es-un-llm]] para saber qué hace bien un [[glosario/llm|LLM]] y dónde falla.
2. Entiende la unidad de todo en [[roadmap/00-fundamentos/02-tokens]] y el límite de memoria en [[roadmap/00-fundamentos/03-ventana-de-contexto]].
3. Haz [[roadmap/00-fundamentos/04-primera-llamada-api]] con tu clave. Ten a mano [[docs/fundamentos/03-api-de-mensajes]] como referencia de roles y bloques.
4. Mide antes de seguir con [[roadmap/00-fundamentos/05-coste-y-latencia]].
5. Sigue con el [[roadmap/10-prompting/index|nivel 10 de prompting]]. Empieza por [[roadmap/10-prompting/01-instrucciones-claras]].

### Ya uso LLMs y quiero construir agentes

Has escrito *prompts* y quizá una pequeña aplicación. Ahora quieres que el modelo use herramientas y decida pasos.

1. Aprende el ciclo base en [[roadmap/20-herramientas/01-ciclo-tool-use]] y cómo describir herramientas en [[roadmap/20-herramientas/02-definir-herramientas]].
2. Antes de escribir un agente, lee [[patrones/01-workflows-vs-agentes]]. Muchas veces un [[glosario/workflow|workflow]] basta.
3. Construye el bucle en [[roadmap/40-primer-agente/02-el-bucle-agentico]] y ponle límites con [[roadmap/40-primer-agente/03-condiciones-de-parada]].
4. Aprende a ver qué ha hecho tu agente en [[roadmap/40-primer-agente/06-depurar-con-trazas]].
5. Mira un caso completo en [[sistemas/soporte-con-aprobacion-humana]] y conecta herramientas estándar con [[cursos/mcp-de-cero-a-servidor/index]].

### Quiero llevar algo a producción

Tienes un prototipo que funciona en tu máquina. Te preocupan la calidad, el coste y la seguridad.

1. Monta tu red de seguridad: [[roadmap/80-evals/01-por-que-evals]] y [[roadmap/80-evals/02-conjunto-de-prueba]].
2. Automatízala con la receta [[recetas/evals-de-regresion-en-ci]].
3. Haz visible lo que pasa con [[roadmap/100-produccion/01-observabilidad-y-trazas]].
4. Baja la factura con [[roadmap/100-produccion/02-costes-y-prompt-caching]] y [[recetas/reintentos-y-limites-de-tasa]].
5. Revisa riesgos con [[roadmap/100-produccion/04-seguridad-y-prompt-injection]] y pasa la lista de [[modelos/09-checklist-produccion]] antes de desplegar.
6. Si tu agente trabaja solo durante horas o toca código, dale un entorno controlado: procedimientos en [[roadmap/50-skills/index|skills]] (nivel 50), trabajo guiado por [[roadmap/70-flujos-con-especificacion/index|especificaciones]] (nivel 70) y un [[roadmap/90-harness/index|harness]] con permisos, hooks y presupuesto (nivel 90). Para construir el tuyo paso a paso, sigue el curso [[cursos/harness-engineering/index]].

### Trabajo en producto o gestión

No vas a escribir el código, pero decides qué se construye y cómo se mide.

1. Entiende qué cuesta cada llamada en [[roadmap/00-fundamentos/05-coste-y-latencia]].
2. Aprende a distinguir un workflow de un agente en [[patrones/01-workflows-vs-agentes]] y usa [[patrones/09-elegir-patron]] para las conversaciones de diseño.
3. Lee [[disciplinas/evals]]: sin un conjunto de prueba no hay forma de decir si una versión es mejor que otra.
4. Diseña la experiencia con [[disciplinas/ux-de-agentes]] y decide dónde aprueba una persona con [[disciplinas/humano-en-el-bucle]].
5. Repasa riesgos con [[disciplinas/seguridad]]. Para decidir dónde invertir y cómo medir el resultado, sigue el curso [[cursos/ia-en-la-empresa/index]].

## Otras formas de recorrerlo

### Si prefieres aprender con vídeos

La [[cursos/ruta-en-video/index|ruta en vídeo]] ordena vídeos públicos en fases, de qué es la IA hasta harness engineering y plataformas de agentes. Cada fase dice qué ver entero, qué ver por encima y qué es opcional, y te manda a la lección de MoreContext donde lo practicas en código.

### Si quieres hacerlo con open source

Todo lo que se enseña con el SDK de Anthropic se puede hacer con piezas abiertas. Aprende antes el mecanismo con una ruta de arriba y luego elige:

1. Frameworks: el curso [[cursos/langchain-y-langgraph/index]] (MIT) y la referencia [[docs/frameworks/index]], que empieza por [[docs/frameworks/01-elegir-framework|cuándo merece la pena un framework]].
2. Modelos de pesos abiertos en tu máquina o tu servidor: el curso [[cursos/agentes-con-modelos-abiertos/index]] y la referencia [[docs/modelos-abiertos/index]].
3. Para elegir piezas (inferencia, bases vectoriales, trazas, evals), el directorio de [[herramientas/index|herramientas]] indica la licencia de cada una y si es open source, de pesos abiertos o comercial.

## Test de nivel

Responde con sinceridad. Vale «sí» solo si lo has hecho en código, no si lo has leído.

1. **¿Has llamado a la API de un modelo desde código y has leído el campo [[glosario/stop-reason|stop_reason]] de la respuesta?**
2. **¿Has implementado el ciclo de [[glosario/tool-use|tool use]]: recibir una petición de herramienta, ejecutarla y devolver un [[glosario/tool-result|tool_result]] por cada una?**
3. **¿Tienes un conjunto de casos de prueba que ejecutas cada vez que cambias un prompt?**

A dónde ir según tus respuestas:

| Respuestas | Empieza en |
|---|---|
| No a la 1 | [[roadmap/00-fundamentos/index]] |
| Sí a la 1, no a la 2 | [[roadmap/10-prompting/index]] si tus prompts fallan a menudo; si no, [[roadmap/20-herramientas/index]] |
| Sí a la 1 y la 2, no a la 3 | [[roadmap/40-primer-agente/index]] y, en paralelo, [[roadmap/80-evals/index]] |
| Sí a las tres | [[roadmap/100-produccion/index]] y, después, los [[cursos/index]] que te toquen |

> [!consejo] Saltar niveles está bien
> Si empiezas en un nivel avanzado y te encuentras un concepto que no conoces, sigue el enlace al glosario o a la lección previa. Cada lección indica qué requiere.

## Cómo usar la web

- **Buscador.** Busca por término o por problema («reintentos», «citas», «JSON»). Encuentra lecciones, docs, recetas y términos del glosario a la vez.
- **Glosario.** Cada término técnico enlaza la primera vez a su definición en el [[glosario/index|glosario]]. Si una palabra te frena, síguela, lee la definición y vuelve.
- **Progreso.** Puedes marcar como completadas las lecciones del roadmap y de los cursos. Se guarda en tu navegador, sin cuenta.
- **Secciones.** El [[roadmap/index|roadmap]] y los cursos se leen en orden. La [[docs/index|documentación]], las [[recetas/index|recetas]] y los [[patrones/index|patrones]] se consultan cuando los necesitas.
- **Cuando algo falla.** En [[problemas/index|problemas frecuentes]] buscas por el síntoma (un error 400, un agente que no para) y llegas a la causa y el arreglo. Las [[plantillas/index|plantillas]] te dan prompts, specs y configuraciones listas para copiar.
- **Como bóveda de Obsidian.** Todo el contenido son archivos markdown enlazados. Si quieres usarlo como segundo cerebro o proponer cambios, mira [[paginas/contribuir]].
