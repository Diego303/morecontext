---
titulo: Ventana de contexto
descripcion: Número máximo de tokens que el modelo puede considerar en una petición, sumando entrada y salida.
creado: 2026-07-02
categoria: fundamentos
ingles: context window
aliases: [context window, contexto del modelo]
tags: [fundamentos, contexto]
relacionados: ["[[roadmap/00-fundamentos/03-ventana-de-contexto]]", "[[docs/contexto/01-ventana-de-contexto]]"]
---

La ventana de contexto es la cantidad máxima de [[glosario/token|tokens]] que un modelo puede manejar en una sola petición. Cuenta todo: prompt de sistema, definiciones de herramientas, historial de mensajes, documentos, resultados de herramientas y la respuesta que genera. El tamaño depende del modelo; consulta la documentación oficial para cifras actuales.

## En la práctica

El modelo no recuerda nada entre peticiones: lo que no está en la ventana, no existe para él. En un [[glosario/agente]], cada resultado de herramienta se acumula y la ventana se llena rápido. Mide con `client.messages.count_tokens(...)` y decide qué entra: recorta resultados, resume con [[glosario/compactacion]] o mueve datos a [[glosario/memoria]] externa. Que algo quepa no significa que el modelo lo aproveche bien.

## No confundir con

- **[[glosario/max-tokens]]**: limita solo la salida de una respuesta, dentro de la ventana.
- **[[glosario/contexto-largo]]**: la capacidad de trabajar con ventanas grandes y sus límites prácticos.

## Ver también

- [[roadmap/00-fundamentos/03-ventana-de-contexto]]
- [[docs/contexto/01-ventana-de-contexto]]
- [[cursos/context-engineering/01-el-contexto-como-presupuesto]]
- [[disciplinas/context-engineering]]
