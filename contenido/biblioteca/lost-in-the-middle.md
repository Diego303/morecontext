---
titulo: Lost in the Middle (Liu et al., 2023)
descripcion: El estudio que mostró que los modelos aprovechan peor la información situada en mitad de un contexto largo, y qué cambia eso al ordenar documentos en un RAG o un agente.
creado: 2026-10-29
tags: [biblioteca, contexto, rag, contexto-largo]
relacionados: ["[[glosario/lost-in-the-middle]]", "[[glosario/context-rot]]", "[[modelos/07-documentos-largos]]", "[[biblioteca/rag-lewis-2020]]"]
autores: Liu et al.
anio: 2023
url: https://arxiv.org/abs/2307.03172
tipo: paper
tema: contexto
nivel: intermedio
---

*Lost in the Middle: How Language Models Use Long Contexts*, de investigadores de Stanford y colaboradores, se pregunta algo que daban por hecho quienes celebraban ventanas cada vez más grandes: si un modelo admite un contexto largo, ¿usa bien todo lo que hay dentro? Con dos experimentos sencillos muestran que no. **La posición importa**: los modelos aprovechan mejor lo que está al principio o al final y peor lo que queda en medio.

## La idea clave

El experimento principal es de preguntas con varios documentos. El modelo recibe una pregunta y una lista de documentos (10, 20 o 30): uno contiene la respuesta y el resto son distractores que se parecen pero no la tienen. Los autores mueven el documento bueno de posición y miden el acierto.

El resultado es una **curva en U**. El acierto es alto cuando el documento útil está al principio, baja cuando está en medio y vuelve a subir cuando está al final. En algunos ajustes, con el documento útil en medio, un modelo acierta menos que respondiendo sin ningún documento. Según el [resumen](https://arxiv.org/abs/2307.03172), el efecto aparece también en modelos diseñados para contextos largos.

El segundo experimento es sintético: un objeto JSON con pares clave-valor aleatorios y la petición de devolver el valor de una clave. Es una tarea de copiar, sin razonamiento, y aun así varios modelos muestran la misma U al crecer el número de pares.

La sección 4 busca causas. Prueban la arquitectura (los modelos codificador-decodificador son más robustos dentro de las longitudes con que se entrenaron), poner la pregunta antes y después de los documentos (ayuda mucho en la tarea sintética y poco en la de documentos) y el ajuste con instrucciones (el modelo base ya muestra la U). La sección 5 cierra con un caso práctico: en un sistema de preguntas abiertas con recuperación, añadir más documentos recuperados mejora poco el resultado mucho antes de que deje de mejorar la recuperación.

## Por qué importa hoy

Es uno de los papers que más explican la [[disciplinas/context-engineering|ingeniería de contexto]]. Lo que te llevas para construir:

- **Recupera menos y ordena mejor.** Meter veinte fragmentos «por si acaso» puede empeorar la respuesta. Un [[glosario/reranking|reranker]] que ponga lo relevante arriba y un corte en pocos fragmentos suelen ganar a un contexto lleno.
- **Coloca lo importante en los extremos.** Documentos largos arriba, instrucciones y pregunta al final, y etiquetas que separen cada fuente. Lo detalla [[modelos/07-documentos-largos]].
- **El historial de un agente también es contexto largo.** Un resultado de herramienta clave que quedó en medio de cincuenta turnos corre el mismo riesgo. Resumir, guardar notas fuera y repetir el objetivo al final del contexto responde a este problema.
- **La ventana grande no sustituye a la recuperación.** Que quepa no significa que se use bien. Es lo que recoge [[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]].

## Qué leer primero

1. **La sección 1** y la figura 1, con la curva en U. Con eso tienes el mensaje.
2. **La sección 2**: montaje del experimento con documentos y resultados por modelo y número de documentos.
3. **La sección 4.2**, sobre poner la pregunta antes y después: es la más accionable.
4. **La sección 5**, el caso práctico con recuperación, si construyes RAG.

La sección 3 (clave-valor) se entiende con sus figuras. El trabajo relacionado puedes saltarlo.

## Qué ha envejecido

- **Los modelos.** Se evaluaron modelos de 2023, como GPT-3.5-Turbo, Claude 1.3 y varios abiertos. Los actuales resuelven mucho mejor la recuperación literal en contextos largos, y la U concreta del paper puede no reproducirse con ellos.
- **Las longitudes.** Los contextos del paper son cortos comparados con los de hoy. El problema de fondo se ha desplazado a longitudes mayores.
- **La forma del problema.** Estudios posteriores, como el de *context rot* de Chroma (2025), muestran que el rendimiento cae con la longitud y con distractores parecidos incluso en tareas simples. Ya no es solo cuestión de posición: importa cuánto ruido acompaña a lo útil. Lo comenta [[biblioteca/context-rot]].

La recomendación práctica sigue siendo la misma: **mide con tus documentos y tu modelo** antes de decidir cuánto contexto meter.

## Dónde lo ves en MoreContext

- [[cursos/context-engineering/02-que-meter-y-que-no]]: qué meter en el contexto y qué no.
- [[roadmap/30-contexto-y-rag/04-reranking]]: reordenar antes de responder.
- [[problemas/el-rag-encuentra-pero-responde-mal]]: cuando el documento llega pero la respuesta falla.
- [[glosario/lost-in-the-middle]], [[glosario/contexto-largo]] y [[glosario/context-rot]].
