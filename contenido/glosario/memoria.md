---
titulo: Memoria
descripcion: Información que un agente guarda fuera de la ventana de contexto para recuperarla en pasos o sesiones posteriores.
creado: 2026-08-20
categoria: contexto
ingles: memory
aliases: [memory, memoria a largo plazo, memoria del agente]
tags: [contexto, agentes]
relacionados: ["[[docs/contexto/04-memoria]]", "[[roadmap/30-contexto-y-rag/06-memoria-entre-sesiones]]"]
---

En un sistema con LLM, memoria es todo lo que el agente conserva fuera de la [[glosario/ventana-de-contexto]] y vuelve a meter en ella cuando lo necesita. El modelo no recuerda nada entre llamadas: la memoria la construye tu aplicación, guardando datos en archivos, bases de datos o un [[glosario/vector-store]].

## En la práctica

Distingue dos niveles. La **memoria de trabajo** es el propio historial de la conversación; se gestiona recortando y con [[glosario/compactacion]]. La **memoria persistente** sobrevive entre sesiones: preferencias del usuario, decisiones tomadas, notas de progreso de una tarea larga. Lo habitual es darle al agente herramientas para leer y escribir esa memoria, y decidir con criterio qué se guarda: memorizarlo todo llena el contexto de ruido.

## No confundir con

- **Conocimiento del modelo**: lo que aprendió en el entrenamiento; no se actualiza al usarlo.
- **[[glosario/rag|RAG]]**: recupera documentos de una base de conocimiento. La memoria guarda lo que el propio agente vive y decide.

## Ver también

- [[docs/contexto/04-memoria]]
- [[roadmap/30-contexto-y-rag/06-memoria-entre-sesiones]]
- [[cursos/context-engineering/03-compactacion-y-memoria]]
- [[patrones/02-llamada-aumentada]]
