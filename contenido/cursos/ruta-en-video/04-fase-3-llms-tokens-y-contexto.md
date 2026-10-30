---
titulo: "Fase 3 · LLMs: tokens, contexto y prompting"
descripcion: "Cómo se usa un LLM en la práctica: genera token a token la respuesta más probable, trabaja con lo que cabe en su contexto y responde según cómo le pidas."
creado: 2026-10-29
revisado: 2026-10-29
orden: 4
minutos: 55
tipo: teoria
profundidad: imprescindible
objetivos:
  - Explicar por qué un LLM devuelve la respuesta más probable y no necesariamente la correcta.
  - Distinguir token, contexto, ventana de contexto, memoria y fine-tuning con un ejemplo de cada uno.
  - Escribir un prompt con objetivo, contexto, restricciones y formato, y comprobar que un prompt de sistema se puede saltar con una inyección.
requiere: ["[[cursos/ruta-en-video/01-fase-0-que-es-la-ia]]"]
relacionados: ["[[roadmap/00-fundamentos/01-que-es-un-llm]]", "[[roadmap/00-fundamentos/02-tokens]]", "[[blog/2026-10-15-la-respuesta-mas-probable]]", "[[roadmap/10-prompting/index]]"]
tags: [ruta-en-video, llm, tokens, contexto, prompting]
---

Al terminar esta fase sabrás cómo genera texto un LLM, en qué unidad se mide todo lo que hace y por qué la calidad de su respuesta depende tanto de lo que le das. Aquí la ruta pasa de la teoría al uso: todo lo de las fases 0 a 2 explicaba cómo funcionaba la IA antes; a partir de los LLM, el software empieza a integrarlos y la gente los usa a diario en chats.

## Qué vas a ver

| Vídeo | Canal | Duración | Idioma | Profundidad |
|---|---|---|---|---|
| [Qué son los LLM (1 de 3)](https://www.youtube.com/watch?v=Sz4qacFBHLk) | DotCSV | — | español | a fondo |
| [Qué son los LLM (2 de 3)](https://www.youtube.com/watch?v=yAF3bopYMGk) | DotCSV | — | español | a fondo |
| [Qué son los LLM (3 de 3)](https://www.youtube.com/watch?v=4mkudbx-1qI) | DotCSV | — | español | a fondo |
| [Curso de IA para programadores: contexto, prompt de sistema e inyección (9:30–17:30)](https://www.youtube.com/watch?v=2aN_-m1uU4k) | midudev | 8 min | español | a fondo |
| [Curso de IA para programadores: tokens (17:30–24:30)](https://www.youtube.com/watch?v=2aN_-m1uU4k) | midudev | 7 min | español | a fondo |

Los títulos describen el tema según la ruta del autor; «—» indica una duración sin confirmar. El tiempo de la lección suma los dos tramos de midudev (15 minutos), una estimación por lo bajo de 10 minutos por cada vídeo de DotCSV y 10 minutos de lectura. Si viste el curso de midudev entero en la fase 0, estos tramos son un repaso rápido.

## Lo que importa

La nota del autor para esta fase gira alrededor de una idea que repite en toda la ruta. Un LLM trabaja con [[glosario/token|tokens]]: genera el siguiente token, lo añade al texto y vuelve a generar, uno a uno, hasta completar la respuesta. Lo que ves aparecer en un chat no es magia, es inferencia, y cada token se elige por probabilidad. **Un LLM no te da la respuesta correcta: te da la respuesta más probable** según el contexto que recibe y lo que aprendió en el entrenamiento.

Los modelos actuales se entrenan con cantidades enormes de datos y casi no fallan en lo sencillo, pero a veces «deliran»: devuelven algo flojo o directamente falso con el mismo tono seguro que una respuesta buena. A eso se le llama [[glosario/alucinacion|alucinación]]. La razón es la de antes: la respuesta más probable no tiene por qué ser la correcta para tu problema, sea cual sea.

Para verlo, imagina el paso en el que el modelo continúa «El perro corre por el…». Calcula una distribución sobre los tokens posibles, algo así (valores inventados para ilustrar):

```text title="Distribución ilustrativa del siguiente token"
# salida de ejemplo
parque   0.42
campo    0.21
jardín   0.12
bosque   0.08
...
```

El token elegido se añade y el proceso se repite. Nada en ese mecanismo comprueba que la frase final sea verdad. Por eso, cuando construyes con LLM, verificas: le das el contexto que necesita, le pides que cite, validas la salida con código y mides con evals.

El resto de la fase son las piezas con las que controlas esa probabilidad:

| Concepto | Pregunta que responde | Ejemplo |
|---|---|---|
| Token | ¿En qué unidades se trocea el texto? | Una palabra larga puede ser varios tokens; el español suele usar más que el inglés |
| Contexto | ¿Qué información tiene el modelo ahora? | Prompt de sistema, historial, documentos, resultados de herramientas |
| [[glosario/ventana-de-contexto\|Ventana de contexto]] | ¿Cuánto cabe? | Un límite en tokens; lo que no entra, no existe para el modelo |
| Memoria | ¿Qué se conserva entre sesiones? | Un mecanismo aparte que guarda y recupera; el contexto se borra al acabar |
| Prompting | ¿Qué le pides y cómo? | Objetivo, contexto, restricciones, formato y ejemplos |
| [[glosario/fine-tuning\|Fine-tuning]] | ¿Cómo cambio el modelo? | Entrenamiento extra que modifica los parámetros |

Una distinción de los apuntes del autor que ahorra muchos errores: si le dices al modelo «mi color favorito es el verde» y luego se lo preguntas, acierta porque está en el contexto, no porque haya aprendido nada. Sus parámetros no cambian. **Prompting cambia la entrada; fine-tuning cambia el modelo**; y RAG, que verás en la fase 3.5, cambia qué información recibe.

El tramo de midudev añade el [[glosario/prompt-de-sistema|prompt de sistema]], las reglas fijas que pone quien construye la aplicación, y su punto débil: la [[glosario/inyeccion-de-prompt|inyección de prompt]]. Como el modelo no ejecuta reglas sino que predice texto, un usuario puede redactar una entrada que haga más probable desobedecerlas. Ningún prompt de sistema está blindado: la seguridad se diseña fuera del prompt.

## Cómo verlo

1. **Los tres vídeos de DotCSV, en orden.** Apunta la definición de LLM, cómo se entrena y qué es el preentrenamiento.
2. **Los dos tramos de midudev.** Vuelve al minuto 9:30 y llega hasta el 24:30. Fíjate en la demostración del tokenizador con la misma frase en dos idiomas.
3. **Qué apuntar:** las seis filas de la tabla con tus palabras, y la frase de la respuesta más probable.
4. **Qué saltarte:** los precios por millón de tokens y los tamaños de ventana de modelos concretos. Consulta los vigentes en la documentación de cada proveedor.
5. **Complemento opcional.** midudev recomienda el curso gratuito de Cursor sobre fundamentos de IA (modelos, tokens, alucinaciones, agentes, MCP, skills, contexto). Es útil, pero el autor lo considera prescindible: el resto de la ruta cubre lo mismo.

> [!aviso] La aleatoriedad ya no se ajusta igual en todos los modelos
> Muchos tutoriales enseñan a bajar la `temperature` para que el modelo sea «más determinista». En la API actual de Claude ese parámetro ya no se acepta; la consistencia se busca con salidas estructuradas, validación y evals. Lo explica [[modelos/06-parametros]].

## Practícalo en MoreContext

- [[roadmap/00-fundamentos/01-que-es-un-llm]], [[roadmap/00-fundamentos/02-tokens]] y [[roadmap/00-fundamentos/03-ventana-de-contexto]]: los mismos conceptos, con código.
- [[roadmap/00-fundamentos/04-primera-llamada-api]] y [[roadmap/00-fundamentos/05-coste-y-latencia]]: tu primera llamada, midiendo tokens, coste y latencia.
- [[roadmap/10-prompting/01-instrucciones-claras]] y [[roadmap/10-prompting/04-prompt-de-sistema]]: prompts con objetivo, contexto y formato, y un prompt de sistema que puedes probar.
- [[cursos/la-ia-por-dentro/03-de-las-reglas-a-las-probabilidades]]: por qué un modelo probabilístico alucina.
- [[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]: la inyección en serio, cuando el agente lee contenido externo.
- [[docs/contexto/01-ventana-de-contexto]] y [[glosario/tokenizador]] como referencia.

## Ejercicio

> [!ejercicio] Mide y rompe
> Con lo que aprendas en [[roadmap/00-fundamentos/04-primera-llamada-api]], cuenta los tokens de entrada de un mismo párrafo en español y en inglés. Después escribe un prompt de sistema que limite al asistente a un tema (por ejemplo, solo preguntas sobre Python) e intenta saltártelo con tres mensajes distintos.
>
> Está bien si anotas los dos recuentos de tokens y la diferencia en porcentaje, si al menos uno de tus tres intentos consigue que el asistente se salga del tema o casi, y si explicas en dos frases por qué el modelo cede usando la idea de la respuesta más probable.

> [!ejercicio]- Pistas
> Las inyecciones que mejor funcionan cambian el marco: un rol nuevo, una supuesta urgencia o una tarea que mezcla el tema permitido con el prohibido. Si ninguna funciona, prueba a pedir el contenido prohibido como ejemplo dentro de una pregunta de Python.

## Resumen

- Un LLM genera token a token la continuación más probable; no comprueba que sea cierta.
- Las alucinaciones son la consecuencia natural de ese mecanismo: se mitigan con contexto, citas, validación y evals.
- Contexto es lo que el modelo tiene ahora; memoria es lo que se guarda fuera; fine-tuning cambia los parámetros.
- El prompt de sistema orienta, pero no protege: una inyección puede saltárselo.

## Para seguir

- [[cursos/ruta-en-video/05-fase-3-5-ia-en-la-empresa]]
- [[roadmap/00-fundamentos/index]]
- [[blog/2026-10-15-la-respuesta-mas-probable]]
