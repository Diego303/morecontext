---
titulo: Toolformer (Schick et al., 2023)
descripcion: Cómo un modelo aprendió solo cuándo llamar a una calculadora, un buscador o un traductor, y qué queda de esa idea en el tool use de las APIs actuales.
creado: 2026-10-29
tags: [biblioteca, herramientas, tool-use, entrenamiento]
relacionados: ["[[glosario/tool-use]]", "[[roadmap/20-herramientas/01-ciclo-tool-use]]", "[[biblioteca/react]]", "[[disciplinas/diseno-de-herramientas]]"]
autores: Schick et al.
anio: 2023
url: https://arxiv.org/abs/2302.04761
tipo: paper
tema: herramientas
nivel: intermedio
---

*Toolformer: Language Models Can Teach Themselves to Use Tools* (Schick y colaboradores, febrero de 2023) parte de una paradoja: los modelos de lenguaje resuelven tareas nuevas con pocos ejemplos, pero fallan en cosas que un programa minúsculo hace bien, como una multiplicación, consultar un dato o saber qué día es hoy. La propuesta es que el modelo aprenda por sí mismo a delegar esas tareas en herramientas externas.

## La idea clave

Toolformer no se limita a enseñar *cómo* se llama a una herramienta. **Lo difícil es enseñarle *cuándo* merece la pena llamarla, con qué argumentos y cómo usar el resultado en lo que escribe a continuación.** Y quiere hacerlo sin miles de ejemplos anotados por personas.

El método es autosupervisado y tiene cuatro pasos:

1. **Proponer.** Con un prompt de pocos ejemplos por herramienta, el propio modelo inserta llamadas candidatas en un corpus de texto normal, en los puntos donde cree que una herramienta ayudaría.
2. **Ejecutar.** Se lanzan esas llamadas de verdad y se recoge su resultado.
3. **Filtrar.** Se conserva una llamada solo si su resultado hace más fácil predecir el texto que viene después. Si saber el resultado no reduce la pérdida del modelo, la llamada sobra.
4. **Ajustar.** Se hace *[[glosario/fine-tuning|fine-tuning]]* del modelo con el corpus aumentado con las llamadas que pasaron el filtro.

Las llamadas viven dentro del texto, con marcas especiales que separan la petición y su resultado. Las herramientas del paper son una calculadora, un sistema de preguntas y respuestas, dos buscadores (uno sobre Wikipedia), un traductor y un calendario.

El filtro del paso 3 es la parte elegante. El criterio de utilidad lo pone la propia tarea de predecir texto, así que nadie tiene que decidir a mano qué llamada era buena.

## Por qué importa hoy

Cuando defines una herramienta con JSON Schema y el modelo decide emitir un bloque `tool_use`, estás usando una capacidad que alguien entrenó. Los proveedores no publican cómo entrenan el *[[glosario/function-calling|function calling]]* de sus modelos comerciales, pero el problema que Toolformer formuló es el mismo: decidir cuándo una herramienta aporta y cuándo estorba.

Ese problema sigue abierto en tu código, con dos caras:

- **Infrallamar.** El modelo responde de memoria cuando debería consultar. Se combate con descripciones que digan *cuándo* usar la herramienta, una lección central de [[disciplinas/diseno-de-herramientas]].
- **Sobrellamar.** El modelo consulta cuando no hace falta y gasta tiempo y tokens. Anthropic cuenta en [[biblioteca/demystifying-evals]] que tuvo que equilibrar justo esto en la búsqueda web de Claude.ai, con evals de los dos lados.

También ayuda a entender un problema práctico con modelos abiertos: si un modelo no se entrenó para llamar a herramientas, el prompt rara vez basta para que las use bien. Lo ves en [[problemas/modelo-local-no-llama-herramientas]].

## Qué leer primero

1. **La introducción**, con la paradoja y el planteamiento.
2. **La sección del método**: cómo se muestrean, ejecutan y filtran las llamadas. Es la parte que vale la pena entender bien.
3. **Las limitaciones**, que los autores escriben con franqueza y que anticipan casi todo lo que vino después.

Las tablas por tarea las puedes hojear: comparan modelos de 2023 en benchmarks que hoy no usarías para elegir.

## Qué ha envejecido

- **Una llamada cada vez y sin encadenar.** Los propios autores reconocen que el modelo no encadena herramientas (usar la salida de una como entrada de otra), porque cada herramienta se anotó por separado. Tampoco las usa de forma interactiva, por ejemplo refinando una búsqueda. Los agentes actuales hacen ambas cosas en un [[glosario/bucle-agentico|bucle]], y la llamada programática a herramientas encadena varias en código.
- **Herramientas fijadas en el entrenamiento.** Toolformer sabe usar las herramientas con las que se entrenó. Hoy defines las tuyas en cada petición, o las conectas por [[glosario/mcp|MCP]], y el modelo generaliza a herramientas que nunca vio.
- **Llamadas incrustadas en el texto.** Hoy son bloques estructurados con su propio identificador, separados del texto.
- **El coste no cuenta.** Los autores señalan que el modelo no tiene en cuenta lo que cuesta cada llamada. En tu sistema ese control vive en el harness: límites, presupuesto y [[recetas/carga-diferida-de-herramientas|carga diferida]] de definiciones.

> [!nota] Toolformer y ReAct
> Salieron con meses de diferencia y se complementan. [[biblioteca/react]] enseña a razonar y actuar en bucle con prompts; Toolformer, a decidir cuándo llamar a una herramienta mediante entrenamiento. Los agentes actuales combinan las dos ideas.

## Dónde lo ves en MoreContext

- [[roadmap/20-herramientas/01-ciclo-tool-use]] y [[docs/herramientas/01-uso-de-herramientas]]: el ciclo `tool_use` → `tool_result` que sustituye a las llamadas incrustadas.
- [[roadmap/20-herramientas/02-definir-herramientas]]: cómo escribir descripciones que digan cuándo usar cada herramienta.
- [[roadmap/20-herramientas/04-tool-choice]]: forzar o impedir la llamada cuando no quieres que decida el modelo.
- [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]: qué modelos abiertos llaman bien a herramientas y cómo comprobarlo.
- [[glosario/tool-use]] y [[glosario/function-calling]].
