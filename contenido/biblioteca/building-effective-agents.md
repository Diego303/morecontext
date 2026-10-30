---
titulo: Building effective agents (Anthropic, 2024)
descripcion: El ensayo que separó workflows de agentes, puso nombre a cinco patrones y defendió empezar por lo más simple. Qué sigue vigente y qué ha cambiado desde 2024.
creado: 2026-10-29
tags: [biblioteca, agentes, patrones, workflows]
relacionados: ["[[patrones/01-workflows-vs-agentes]]", "[[patrones/09-elegir-patron]]", "[[roadmap/40-primer-agente/01-que-es-un-agente]]", "[[disciplinas/diseno-de-herramientas]]"]
autores: Erik Schluntz y Barry Zhang (Anthropic)
anio: 2024
url: https://www.anthropic.com/engineering/building-effective-agents
tipo: ensayo
tema: agentes
nivel: intermedio
---

*Building effective agents* (Anthropic, 19 de diciembre de 2024) resume lo que el equipo aprendió trabajando con decenas de equipos que construían agentes. Su tesis cabe en una línea: los sistemas que mejor funcionaban usaban **patrones simples y combinables**, no frameworks complejos. Es el texto que más ha influido en cómo se enseña a diseñar agentes, y la sección de [[patrones/index|patrones]] de MoreContext parte de él.

## La idea clave

El ensayo llama **sistemas agénticos** a todo y distingue dos familias:

- **[[glosario/workflow|Workflow]]**: los LLM y las herramientas se coordinan por rutas de código predefinidas. Tú escribes el orden de los pasos.
- **[[glosario/agente|Agente]]**: el LLM dirige su propio proceso y el uso de herramientas, y decide cómo completar la tarea.

Sobre esa distinción construye una escalera. La pieza base es la **llamada aumentada**: un LLM con recuperación, herramientas y memoria. Encima, cinco workflows: encadenado, enrutado, paralelización (por secciones o por votación), orquestador-trabajadores y evaluador-optimizador. Arriba, el agente: un LLM que usa herramientas en bucle guiado por el *feedback* del entorno.

**La regla que atraviesa todo el texto es buscar la solución más simple y añadir complejidad solo cuando mejora resultados de forma demostrable.** A veces eso significa no construir un agente. Los sistemas agénticos cambian latencia y coste por rendimiento, y ese intercambio hay que medirlo.

El ensayo cierra con tres principios para agentes: diseño simple, transparencia (que se vean los pasos de planificación) y una **interfaz agente-ordenador** (ACI) cuidada, con herramientas bien documentadas y probadas.

## Por qué importa hoy

Casi dos años después, el vocabulario se ha quedado. Cuando alguien dice «esto es un orquestador-trabajadores» o «aquí basta un enrutado», usa los nombres de este texto. Tres ideas siguen siendo las que más errores evitan:

- **Empieza por llamar a la API directamente.** El texto avisa de que los frameworks pueden ocultar prompts y respuestas y tientan a añadir complejidad. Si usas uno, entiende el código que hay debajo: las suposiciones erróneas sobre lo que hace por dentro son una fuente habitual de errores.
- **Las herramientas merecen tanto trabajo como el prompt.** En el apéndice 2 cuentan que, para su agente de SWE-bench, dedicaron más tiempo a optimizar herramientas que el prompt general. El ejemplo es memorable: el modelo se equivocaba con rutas relativas al salir del directorio raíz, y exigir rutas absolutas lo arregló.
- **Un agente necesita *ground truth* en cada paso.** Resultados de herramientas, ejecución de código, tests. Sin ese *feedback* del entorno, el bucle se basa en suposiciones del modelo.

> [!consejo] El *poka-yoke* de herramientas
> El apéndice 2 propone diseñar los argumentos para que el error sea difícil de cometer. Es la idea más barata y rentable del texto: antes de corregir al modelo con instrucciones, cambia la herramienta para que la instrucción no haga falta.

## Qué leer primero

1. **«What are agents?» y «When (and when not) to use agents»**: la distinción y la regla de la simplicidad.
2. **«Building blocks, workflows, and agents»**: cada patrón con cuándo usarlo y ejemplos. Es la parte de referencia.
3. **Apéndice 2, «Prompt engineering your tools»**: formatos que el modelo produce bien, la ACI y el ejemplo de las rutas absolutas.

El apéndice 1 (soporte al cliente y agentes de código) es una lectura rápida sobre dónde encajan bien los agentes: tareas con criterios de éxito claros, *feedback* y supervisión humana.

## Qué ha envejecido

- **Las herramientas concretas.** La propia página avisa hoy, al principio, de que buena parte de las herramientas descritas han cambiado desde diciembre de 2024, y se ha ido actualizando: la lista de frameworks y los modelos del ejemplo de enrutado ya no son los del original. Lee los patrones como conceptos y busca las herramientas actuales en la documentación.
- **El agente como cima.** En 2024 el agente era el peldaño más alto. En 2025 y 2026 el problema se desplazó a lo que rodea al agente durante horas: estado, verificación y entorno. Eso es el [[glosario/harness|harness]], y lo cuentan [[biblioteca/effective-harnesses]] y [[biblioteca/harness-engineering-openai]].
- **La transparencia como texto visible.** Mostrar el plan sigue siendo útil, pero hoy buena parte del razonamiento ocurre con [[glosario/razonamiento-extendido|razonamiento extendido]] y la transparencia se consigue sobre todo con trazas y [[glosario/observabilidad|observabilidad]].

Lo que no ha envejecido es el criterio de fondo: mide y sube un peldaño solo cuando los fallos que ves los resuelve el siguiente.

## Dónde lo ves en MoreContext

- [[patrones/01-workflows-vs-agentes]]: la escalera completa y el vocabulario.
- [[patrones/02-llamada-aumentada]], [[patrones/03-encadenado]], [[patrones/04-enrutado]], [[patrones/05-paralelizacion]], [[patrones/06-orquestador-trabajadores]], [[patrones/07-evaluador-optimizador]] y [[patrones/08-agente-autonomo]]: un patrón por página, con código.
- [[patrones/09-elegir-patron]]: cómo decidir.
- [[roadmap/40-primer-agente/01-que-es-un-agente]] y [[blog/2026-10-12-tu-primer-agente-deberia-ser-un-workflow]]: la regla de la simplicidad aplicada.
- [[disciplinas/diseno-de-herramientas]]: la ACI y el *poka-yoke* desarrollados.
- [[docs/frameworks/01-elegir-framework]]: cuándo un framework compensa.
