---
titulo: Chain-of-thought prompting (Wei et al., 2022)
descripcion: El paper que mostró que dar ejemplos con el razonamiento escrito paso a paso mejora a los modelos grandes en problemas de varios pasos, y qué queda de ello con los modelos de razonamiento.
creado: 2026-10-29
tags: [biblioteca, prompting, razonamiento, few-shot]
relacionados: ["[[glosario/cadena-de-pensamiento]]", "[[modelos/04-dejar-pensar-al-modelo]]", "[[biblioteca/deepseek-r1]]", "[[biblioteca/react]]"]
autores: Wei et al.
anio: 2022
url: https://arxiv.org/abs/2201.11903
tipo: paper
tema: prompting
nivel: intermedio
---

*Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*, de un equipo de Google, propone un cambio pequeño en los ejemplos que pones en el prompt: en lugar de pregunta y respuesta, pregunta, **razonamiento intermedio** y respuesta. Con eso, los modelos grandes mejoran mucho en aritmética, sentido común y manipulación simbólica. Es el origen de la [[glosario/cadena-de-pensamiento|cadena de pensamiento]] y un antecedente de los [[glosario/modelo-de-razonamiento|modelos de razonamiento]] actuales.

## La idea clave

La figura 1 lo resume con un problema de aritmética escolar. Con un prompt [[glosario/few-shot|few-shot]] normal, los ejemplos muestran solo la respuesta y el modelo se equivoca. Con *chain-of-thought prompting*, los ejemplos muestran cómo se llega a la respuesta («tenía 5, compra 2 latas de 3, 5 + 6 = 11») y el modelo imita ese formato: escribe sus pasos y acierta más.

El paper no entrena nada. Todo ocurre en el prompt, con unos pocos ejemplos escritos a mano. Según el [resumen](https://arxiv.org/abs/2201.11903), con solo ocho ejemplos de este tipo, PaLM 540B alcanzó el mejor resultado de entonces en GSM8K, un conjunto de problemas de matemáticas, por encima de un GPT-3 ajustado con un verificador.

Tres hallazgos sostienen la idea:

- **Depende de la escala.** La mejora aparece en los modelos más grandes de los que probaron. Con modelos pequeños, el razonamiento escrito suena fluido pero es ilógico, y puede empeorar el resultado.
- **La longitud por sí sola no explica la mejora.** En la ablación de la sección 3.3 prueban a pedir solo la ecuación, a rellenar con puntos para dar «tiempo de cálculo» y a poner el razonamiento después de la respuesta. Ninguna variante iguala al razonamiento en lenguaje natural antes de responder.
- **Es robusto a quién escribe los ejemplos.** Distintos autores, con estilos distintos, obtienen mejoras parecidas.

## Por qué importa hoy

Con un modelo actual rara vez escribirás ejemplos con razonamiento: los modelos de razonamiento piensan solos, y en la API de Anthropic activas el [[glosario/razonamiento-extendido|razonamiento extendido]] con `thinking={"type": "adaptive"}` y regulas cuánto con el [[glosario/esfuerzo|esfuerzo]]. Pero las conclusiones del paper siguen guiando decisiones:

- **Razonar antes de responder.** Si pides razonamiento en el texto, que vaya antes de la respuesta y separado de ella, para poder extraer solo la respuesta con código.
- **No en todas las tareas.** En tareas simples, razonar añade tokens y [[glosario/latencia|latencia]] sin mejorar nada. Elige el esfuerzo según la tarea.
- **El razonamiento escrito no es una explicación fiable.** Los autores advierten que no hay garantía de que la cadena sea correcta, ni de que el modelo esté «razonando» en sentido humano. Una cadena convincente puede acabar en una respuesta mala: verifica el resultado aunque el relato convenza.
- **Razonar y actuar.** [[biblioteca/react|ReAct]] intercala esta cadena de pensamiento con llamadas a herramientas. Es la base del [[glosario/bucle-agentico|bucle agéntico]].

## Qué leer primero

1. **La figura 1 y la sección 2**, donde definen qué es un ejemplo con cadena de pensamiento y por qué debería ayudar.
2. **La sección 3.3**, la ablación. Es la parte que más enseña sobre por qué funciona.
3. **La sección 6, Discussion**, con las limitaciones que reconocen los autores.
4. **El apéndice con los ejemplos completos** usados en los prompts: ver ocho ejemplos reales ayuda más que cualquier descripción.

Las secciones 4 y 5, sentido común y razonamiento simbólico, repiten el patrón con otras tareas. Ojéalas.

## Qué ha envejecido

- **Los ejemplos escritos a mano.** Poco después, Kojima et al. (2022) mostraron que bastaba con pedir que razonase paso a paso, sin ejemplos ([[glosario/zero-shot|zero-shot]]). Hoy el razonamiento se entrena directamente en el modelo.
- **El umbral de tamaño.** El paper sitúa el efecto en modelos muy grandes. Hoy hay modelos pequeños que razonan bien porque se entrenaron o se destilaron para ello.
- **Más ejemplos no siempre ayudan.** Con modelos de razonamiento, el paper de [[biblioteca/deepseek-r1|DeepSeek-R1]] recomienda el zero-shot porque el few-shot empeora su rendimiento. Prueba con tus casos antes de añadir ejemplos.
- **Los modelos y los benchmarks.** Los modelos evaluados son de 2022 y los conjuntos de pruebas que usan están hoy muy por debajo de lo que resuelven los modelos actuales.

## Dónde lo ves en MoreContext

- [[modelos/04-dejar-pensar-al-modelo]]: cuándo y cómo dejar que el modelo piense.
- [[docs/prompting/04-razonamiento]]: razonamiento y esfuerzo en la API.
- [[glosario/cadena-de-pensamiento]], [[glosario/razonamiento-extendido]] y [[glosario/esfuerzo]].
- [[roadmap/10-prompting/02-ejemplos-few-shot]]: elegir ejemplos que enseñan.
