---
titulo: max_tokens
descripcion: Parámetro obligatorio que fija el máximo de tokens que el modelo puede generar en una respuesta; es un límite duro.
creado: 2026-07-05
categoria: fundamentos
aliases: [límite de tokens de salida, tokens máximos]
tags: [fundamentos, parametros, costes]
relacionados: ["[[modelos/06-parametros]]", "[[glosario/stop-reason]]"]
---

`max_tokens` es el número máximo de [[glosario/token|tokens]] que el modelo puede generar en una respuesta. En la API de Mensajes es obligatorio. Es un límite duro: si el modelo lo alcanza, la generación se corta donde esté, aunque sea a mitad de frase o de un JSON, y la respuesta llega con `stop_reason == "max_tokens"`.

## En la práctica

No es un objetivo de longitud: el modelo no escribe más porque le des margen, y para respuestas cortas es mejor pedirlo en las instrucciones. Fíjalo con holgura para la salida esperada y trata siempre el caso `max_tokens` como respuesta incompleta. Con el [[glosario/razonamiento-extendido]] activado, los tokens de razonamiento también cuentan dentro de este límite, así que necesitas más margen. Es tu control de coste más fiable por llamada; el [[glosario/esfuerzo]] solo orienta.

## No confundir con

- **[[glosario/ventana-de-contexto]]**: el total de entrada más salida que admite el modelo.
- **Límites de tasa**: cuántos tokens o peticiones puedes enviar por minuto a la API.

## Ver también

- [[modelos/06-parametros]]
- [[glosario/stop-reason]]
- [[docs/produccion/02-costes-y-limites]]
- [[roadmap/00-fundamentos/04-primera-llamada-api]]
