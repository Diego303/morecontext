---
titulo: "Ruta en vídeo: de cero a agentes"
descripcion: "La ruta del autor con vídeos y cursos gratuitos, casi todos en español, desde qué es la IA hasta agentes, MCP, skills y harness, con su criterio de qué ver a fondo."
creado: 2026-10-29
revisado: 2026-10-29
orden: 14
nivel: inicial
horas: 19
objetivo: "Pasar de no saber qué es la IA a entender y usar agentes, MCP, skills y harness con vídeos gratuitos, practicando cada fase en MoreContext."
requiere: []
relacionados: ["[[roadmap/index]]", "[[blog/2026-10-14-mi-ruta-para-aprender-ia-con-videos]]", "[[paginas/empieza-aqui]]", "[[cursos/la-ia-por-dentro/index]]"]
tags: [ruta-en-video, videos, aprendizaje]
---

Esta es la ruta con la que el autor aprendió IA: vídeos y cursos gratuitos de DotCSV, midudev, MoureDev y BettaTech, más cursos de Anthropic Academy y de Google, ordenados de «¿qué es la IA?» a agentes, MCP, skills y harness engineering. Casi todo está en español; algunos cursos de Anthropic están en inglés. Cada fase recoge su criterio: qué ver a fondo, qué por encima y qué es extra.

## Para quién

Para quien aprende mejor viendo a alguien explicar y quiere una ruta ordenada en lugar de saltar de vídeo en vídeo. Empieza desde cero: no necesitas saber de IA, aunque sí ayuda programar algo. Si ya usas agentes a diario, puedes empezar en la fase 5 y volver atrás cuando te falte una base.

## Cómo combinarla con el roadmap

Los vídeos dan la explicación con otra voz; MoreContext da el código, los ejercicios y la referencia. Cada lección termina con **Practícalo en MoreContext**, que te lleva a las lecciones, cursos, recetas y sistemas donde construyes lo que acabas de ver. La correspondencia general:

| Fases | Dónde se practica |
|---|---|
| 0 a 2 | [[cursos/la-ia-por-dentro/index]] |
| 3 | [[roadmap/00-fundamentos/index]] y [[roadmap/10-prompting/index]] |
| 3.5 | [[cursos/ia-en-la-empresa/index]], [[roadmap/30-contexto-y-rag/index]] y [[cursos/rag-a-fondo/index]] |
| 4 y 5 | [[cursos/agentes-de-codigo/index]] y [[roadmap/40-primer-agente/index]] |
| 6 y 7 | [[cursos/mcp-de-cero-a-servidor/index]] y [[roadmap/50-skills/index]] |
| 8 y 9 | [[roadmap/70-flujos-con-especificacion/index]], [[roadmap/60-multiagente/index]], [[roadmap/90-harness/index]] y [[cursos/harness-engineering/index]] |
| 10 | [[sistemas/index]] y [[roadmap/100-produccion/index]] |

## Quién es quién

| Canal | Enfoque | Nivel típico |
|---|---|---|
| DotCSV (Carlos Santana) | Teoría de IA, machine learning y deep learning, y análisis del estado del arte: papers y modelos nuevos. Sus vídeos de fundamentos son de 2017 a 2019 y no han caducado | fundamentos a intermedio |
| midudev y midulive (Miguel Ángel Durán) | Programación web que ha volcado buena parte de su contenido en IA aplicada: LLM, MCP, Claude Code, Agent Skills. midulive son sus directos completos; sus cursos gratuitos están en midu.dev | fundamentos para desarrolladores a avanzado práctico |
| MoureDev (Brais Moure) | Canal de programación con rutas de estudio completas y cursos gratuitos de desarrollo con IA: agentes, multiagente y SDD | principiante a avanzado práctico |
| BettaTech (Martí Cristóbal) | Calidad, arquitectura y buenas prácticas: cómo no perder criterio de ingeniería al programar con agentes | intermedio a avanzado |
| Anthropic Academy | Cursos de la propia Anthropic sobre MCP y Agent Skills, con certificado al terminar | intermedio |
| Google for Developers | Cursos de machine learning en profundidad, para quien quiere crear modelos | intermedio, extra en esta ruta |

**Orden recomendado por el autor:** los fundamentos con DotCSV, los fundamentos para desarrolladores con midudev, construir con MoureDev y afinar el criterio de ingeniería con BettaTech.

## Profundidad y tiempo

Cada lección lleva una marca de profundidad: `imprescindible` (míralo a fondo y toma apuntes), `por-encima` (entiende la idea sin apuntes exhaustivos; es el caso de las redes neuronales si vas a usar modelos y no a crearlos) y `extra` (solo si el tema es tu objetivo). Dentro de cada lección, la tabla marca cada vídeo como «a fondo», «por encima» o «extra».

El tiempo de cada lección suma los vídeos que no son extra y 10 minutos de lectura. En total salen **unas 19 horas**: algo más de 6 horas de vídeo con duración conocida, 2 h 20 min de lectura y unas 11 horas estimadas por lo bajo para los vídeos sin duración confirmada (10 minutos por vídeo suelto y 60 por curso o directo completo). Los directos largos pueden alargar bastante esa cifra.

## Temario

1. [[cursos/ruta-en-video/01-fase-0-que-es-la-ia]]. El mapa IA, machine learning y deep learning, y el curso de midudev entero como primera vuelta.
2. [[cursos/ruta-en-video/02-fase-1-redes-neuronales]]. Neurona, red, gradiente, backpropagation y sobreajuste, por encima.
3. [[cursos/ruta-en-video/03-fase-2-de-las-rnn-a-los-transformers]]. El salto a los Transformers y a GPT.
4. [[cursos/ruta-en-video/04-fase-3-llms-tokens-y-contexto]]. Tokens, contexto, prompting y la idea central: la respuesta más probable no es la correcta.
5. [[cursos/ruta-en-video/05-fase-3-5-ia-en-la-empresa]]. La pirámide prompt, RAG, fine-tuning y modelo propio.
6. [[cursos/ruta-en-video/06-fase-3-5-rag]]. RAG con tus documentos y su regla de oro.
7. [[cursos/ruta-en-video/07-fase-4-herramientas-para-programar]]. Del autocompletado al agente en el editor.
8. [[cursos/ruta-en-video/08-fase-5-que-es-un-agente]]. El bucle del agente y por qué las instrucciones importan más que nunca.
9. [[cursos/ruta-en-video/09-fase-6-mcp]]. MCP como API común para las herramientas.
10. [[cursos/ruta-en-video/10-fase-7-agent-skills]]. Procedimientos que el agente carga cuando hace falta.
11. [[cursos/ruta-en-video/11-fase-8-multiagente-y-sdd]]. Especificar antes de programar y repartir entre agentes.
12. [[cursos/ruta-en-video/12-fase-9-harness-engineering]]. Todo lo que rodea al modelo.
13. [[cursos/ruta-en-video/13-fase-10-sistemas-y-plataformas]]. Guía de estudio para diseñar plataformas.
14. [[cursos/ruta-en-video/14-ecosistema-y-estar-al-dia]]. Alternativas y el hábito de estar al día.

> [!aviso] Enlaces con fecha
> Los enlaces se recopilaron en septiembre de 2026 y se revisaron en la fecha de `revisado` de cada lección. Los canales actualizan sus cursos, cambian títulos y a veces retiran vídeos. Si un enlace falla, busca el título en el canal del divulgador.
