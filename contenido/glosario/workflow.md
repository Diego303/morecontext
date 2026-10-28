---
titulo: Workflow
descripcion: Sistema en el que los modelos y las herramientas siguen pasos fijados por tu código, sin que el modelo decida el camino.
creado: 2026-07-10
categoria: agentes
aliases: [flujo de trabajo, flujo predefinido, pipeline]
tags: [agentes, patrones]
relacionados: ["[[patrones/01-workflows-vs-agentes]]", "[[blog/2026-10-12-tu-primer-agente-deberia-ser-un-workflow]]"]
---

Un *workflow* es un sistema con LLM en el que la secuencia de pasos está definida de antemano en código: primero clasificar, luego extraer, luego validar. Cada paso puede usar un modelo, pero el modelo no decide qué paso viene después. Es la distinción que hace Anthropic en *Building effective agents* (2024) frente a los agentes.

## En la práctica

Es la opción por defecto cuando la tarea tiene pasos conocidos: más predecible, más barato, más fácil de evaluar y de depurar. Los patrones clásicos son el [[patrones/03-encadenado|encadenado]], el [[patrones/04-enrutado|enrutado]], la [[patrones/05-paralelizacion|paralelización]], el [[patrones/06-orquestador-trabajadores|orquestador y trabajadores]] y el [[patrones/07-evaluador-optimizador|evaluador-optimizador]]. Pasa a un [[glosario/agente]] solo cuando no puedas prever los pasos y la flexibilidad compense el coste y el riesgo extra.

## No confundir con

- **[[glosario/agente]]**: el modelo decide los pasos y las herramientas en un bucle.

## Ver también

- [[patrones/01-workflows-vs-agentes]]
- [[roadmap/40-primer-agente/01-que-es-un-agente]]
- [[patrones/09-elegir-patron]]
- [[blog/2026-10-12-tu-primer-agente-deberia-ser-un-workflow]]
