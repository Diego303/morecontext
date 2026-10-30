---
titulo: "Benchmarks públicos: qué miden y cómo leerlos"
descripcion: Qué mide cada benchmark de agentes vigente, por qué SWE-bench Verified dejó de servir, cuánto ruido mete la infraestructura y por qué ninguno sustituye a tus evals.
creado: 2026-10-29
orden: 3
nivel: intermedio
tags: [evals, benchmarks, agentes]
aliases: [Benchmarks de agentes, Leaderboards]
relacionados: ["[[glosario/contaminacion-de-benchmark]]", "[[docs/evals/01-disenar-evals]]", "[[radar/2026-10-24-swe-bench-verified-retirado]]", "[[biblioteca/demystifying-evals]]", "[[glosario/pass-k]]"]
---

Un **benchmark público** es un conjunto fijo de tareas, con su forma de puntuar, que cualquiera puede ejecutar para comparar modelos o agentes en las mismas condiciones. Sirve para hacerse una idea del estado del arte y para filtrar candidatos. No sirve para decidir qué modelo va mejor en tu producto: mide otra tarea, con otro arnés, en otra infraestructura, y a veces con tareas que el modelo ya vio al entrenarse. Este artículo te da el mapa de los benchmarks de agentes vigentes en octubre de 2026 y cinco preguntas para leer una tabla de resultados sin engañarte.

## Qué se evalúa en realidad

Cuando lees «el modelo X saca tanto en el benchmark Y», lo que se evaluó es un sistema: modelo + [[glosario/harness|arnés]] + entorno. La guía de Anthropic [*Demystifying evals for AI agents* (9 ene. 2026)](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) lo dice así: se evalúan juntos el modelo y el arnés del agente. Cambia el arnés y cambia la cifra. LangChain lo mostró con su propio agente: [subió de 52,8 % a 66,5 % en Terminal-Bench 2.0](https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering) (17 feb. 2026) cambiando solo el arnés, con el modelo fijo. Por eso dos cifras del mismo benchmark solo son comparables si comparten arnés, recursos y número de intentos.

## El mapa de benchmarks vigentes

Sin puntuaciones a propósito: cambian cada mes y cada laboratorio las mide a su manera. Lo útil es saber **qué** mide cada uno.

| Benchmark | Qué mide | Referencia | A tener en cuenta |
|---|---|---|---|
| **SWE-bench Pro** | Resolver issues largos de software, a menudo multiarchivo: 1.865 problemas de 41 repositorios, divididos en público (731), reservado (858) y comercial (276) | [Deng et al., Scale AI, sept. 2025](https://arxiv.org/abs/2509.16941) | OpenAI lo recomienda como sustituto de SWE-bench Verified, «no perfecto» pero con menos contaminación |
| **Terminal-Bench 2.0** | Tareas realistas en una terminal (89 tareas, formato Harbor) | [Merrill, Shaw, Carlini et al., ene. 2026](https://arxiv.org/abs/2601.11868) | Muy sensible a los recursos del contenedor (ver ruido) |
| **τ-bench / τ²-bench** | Conversaciones agente-usuario-herramientas con políticas de negocio; τ² añade **control dual**: el usuario simulado también actúa sobre el entorno (dominio telecomunicaciones) | [Yao et al., 2024](https://arxiv.org/abs/2406.12045); [Barres et al., ICML 2026](https://arxiv.org/abs/2506.07982) | De aquí viene [[glosario/pass-k|pass^k]]: que acierte las k veces, no una de k |
| **MCP-Atlas** | Uso de herramientas reales vía MCP: 36 servidores, 220 herramientas, 1.000 tareas (500 públicas y 500 privadas) | [Bandi et al., ene. 2026](https://arxiv.org/abs/2602.00933) | Separa errores de llamada (argumentos, herramienta equivocada) de errores de razonamiento |
| **OSWorld** | Uso del ordenador en sistemas operativos reales | Web del proyecto | Mide [[glosario/uso-del-ordenador|uso del ordenador]], no código |
| **GAIA** | Preguntas para asistentes generales que necesitan herramientas (buscar, leer archivos, calcular) | [Mialon et al., ICLR 2024](https://arxiv.org/abs/2311.12983) | Respuesta corta y verificable |
| **BrowseComp** | Encontrar información difícil de localizar navegando | [Wei et al., OpenAI, abr. 2025](https://arxiv.org/abs/2504.12516) | Respuestas fáciles de comprobar y difíciles de encontrar |
| **METR time horizon** | Duración de las tareas humanas que el modelo completa con un 50 % de éxito | [Kwa, West et al., METR (v3, feb. 2026)](https://arxiv.org/abs/2503.14499) | No es una tabla de aciertos: es una tendencia (ver abajo) |

El horizonte temporal de METR merece una nota. No dice «el modelo resuelve el 60 %», sino «completa al 50 % tareas que a una persona le llevan tanto tiempo». Según los autores, ese horizonte se ha duplicado aproximadamente cada 7 meses (207 días, IC 95 % 166–240), y el horizonte con un 80 % de éxito es entre 4 y 6 veces más corto que el del 50 %. La segunda cifra es la que importa para producción: lo que un modelo hace «a veces» en una hora lo hace «casi siempre» solo en tareas mucho más cortas.

## Por qué SWE-bench Verified dejó de servir

Durante mucho tiempo, SWE-bench Verified (500 issues reales de Python con tests) fue la cifra de referencia en agentes de código. El 23 de febrero de 2026, [OpenAI dejó de reportarlo](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) y pidió al resto que hiciera lo mismo, por dos motivos:

1. **Tareas defectuosas.** Auditaron los 138 problemas que o3 no resolvía de forma consistente en 64 intentos, y el 59,4 % tenía fallos materiales en los tests o en el enunciado: un 35,5 % con tests demasiado estrechos, que exigen detalles de implementación concretos y rechazan soluciones correctas; un 18,8 % con tests demasiado amplios, que comprueban funcionalidad que el enunciado no pedía; y un 5,1 % con otros problemas.
2. **[[glosario/contaminacion-de-benchmark|Contaminación]].** Todos los modelos frontera que probaron fueron capaces de reproducir, en algunas tareas, el arreglo original escrito por humanos o detalles literales del problema. Es decir, los habían visto al entrenarse. Y los modelos contaminados aprueban más a menudo justo los tests mal especificados.

La consecuencia práctica: no uses SWE-bench Verified para elegir modelo en 2026, y desconfía de cualquier comparativa reciente que lo use como argumento principal.

### Contaminación: el problema general

Cualquier benchmark público acaba en Internet, y lo que está en Internet acaba en los datos de entrenamiento. Cuando un modelo ha visto las tareas, su puntuación mide memoria más que capacidad. Las defensas que verás en los benchmarks nuevos son conjuntos reservados que no se publican (SWE-bench Pro, MCP-Atlas) y tareas que se renuevan con el tiempo. Ninguna es perfecta. Tus propias tareas, sacadas de tus datos y fallos, son las únicas que seguro no estaban en el entrenamiento.

## El ruido de la infraestructura

En agentes, el resultado depende también de la máquina donde corren. Anthropic lo midió en [*Quantifying infrastructure noise in agentic coding evals* (Gian Segato, 5 feb. 2026)](https://www.anthropic.com/engineering/infrastructure-noise):

- En Terminal-Bench 2.0, la diferencia entre la configuración con más recursos y la de menos fue de **6 puntos porcentuales** (p < 0,01), con el mismo modelo.
- Con límites estrictos (1×), el 5,8 % de las tareas falló por errores de infraestructura; sin límites, el 0,5 %.
- Hasta 3× de recursos, los resultados se movían dentro del ruido; por encima, el agente aprovecha los recursos extra para resolver tareas que antes no podía, y el benchmark pasa a medir otra cosa.

Sus recomendaciones: declarar dos parámetros de recursos por tarea (asignación garantizada y umbral de corte), publicar cómo se aplican, repetir en días distintos y una regla para lectores: **las diferencias de menos de 3 puntos en una tabla merecen escepticismo** mientras la configuración no esté documentada y sea la misma.

> [!consejo] Regla de lectura
> Si el modelo A saca 2 puntos más que el B en un benchmark agéntico, trátalo como un empate. Si no sabes con qué arnés, qué recursos y cuántos intentos se midió cada uno, ni siquiera sabes si es un empate.

## Cinco preguntas antes de creerte una tabla

1. **¿Quién midió y con qué arnés?** Una cifra del propio laboratorio con su arnés no es comparable con otra medida por terceros con uno genérico.
2. **¿Cuántos intentos y qué métrica?** pass@1 con un intento, pass@k con varios o pass^k exigiendo todos. Ver [[glosario/pass-k]].
3. **¿Qué conjunto?** Público, verificado, reservado. Y si el público lleva años en Internet.
4. **¿La diferencia supera el ruido?** Menos de 3 puntos en agentes, empate salvo prueba en contrario.
5. **¿Se parece la tarea a la tuya?** Un benchmark de terminal no dice nada de tu agente de soporte con políticas de devolución.

## El benchmark no es tu caso

Un benchmark responde «¿qué modelos merece la pena probar?». La pregunta «¿cuál uso?» solo la responden tus [[glosario/evals|evals]]: entre 20 y 50 tareas sacadas de fallos reales, como recomienda Anthropic, graders deterministas sobre el estado final, varios ensayos por tarea y lectura de trazas. El flujo razonable:

1. Usa los benchmarks públicos para reducir la lista a dos o tres candidatos que cubran tu tipo de tarea (código, herramientas, navegación, conversación).
2. Ejecuta tu propio conjunto con tu arnés y tu infraestructura, varios ensayos por tarea.
3. Mira coste y latencia junto a la tasa de acierto, no solo la tasa.
4. Lee las trazas de los fallos antes de decidir. A veces el «fallo» es un bug de tu grader.

Cómo construir ese conjunto lo cuentan [[docs/evals/01-disenar-evals]] y [[roadmap/80-evals/02-conjunto-de-prueba]].

## Errores frecuentes

- **Elegir modelo por el leaderboard.** Contaminación y ruido pueden explicar toda la diferencia.
- **Comparar cifras de arneses distintos** como si fueran del mismo experimento.
- **Citar SWE-bench Verified** como medida vigente de capacidad de código.
- **Leer «60 %» como «funciona 6 de cada 10 veces en mi caso».** Es la tasa en esas tareas, con ese arnés.
- **No repetir.** Un solo ensayo por tarea en un agente es una muestra, no una medida.

## Ver también

- [[docs/evals/01-disenar-evals]]: diseñar tu propio conjunto.
- [[biblioteca/demystifying-evals]]: la guía de Anthropic, comentada.
- [[cursos/evals-para-agentes/01-que-medir]]: pass@k y pass^k con código.
- [[radar/2026-10-24-swe-bench-verified-retirado]]: la retirada de SWE-bench Verified en dos minutos.
