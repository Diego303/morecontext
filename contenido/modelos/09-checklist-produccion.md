---
titulo: Checklist antes de producción
descripcion: Lista accionable para revisar un prompt o un agente antes de desplegarlo, desde las instrucciones y el contexto hasta evals, costes, seguridad y trazas.
creado: 2026-10-16
actualizado: 2026-10-29
orden: 9
tags: [produccion, checklist, prompting, modelos]
relacionados: ["[[modelos/08-antipatrones]]", "[[roadmap/100-produccion/06-despliegue]]", "[[docs/produccion/index]]", "[[docs/seguridad/index]]"]
---

**Principio**: un prompt que va a producción se revisa como el código: con una lista, sin confiar en la memoria.

## Por qué funciona

Los fallos de producción casi nunca son exóticos: un `max_tokens` corto, un `stop_reason` sin manejar, un caso que nadie probó, una herramienta con más permisos de los necesarios. Una lista los convierte en preguntas de sí o no. Copia esta lista en la descripción de tu propuesta de cambio y marca cada punto, o explica por qué no aplica.

## 1. Instrucciones

- [ ] Un compañero que no conoce el proyecto entendería qué se pide y para qué.
- [ ] Cada regla importante lleva su motivo.
- [ ] No hay reglas contradictorias; si hay excepciones, están explícitas.
- [ ] El tono es normal, sin mayúsculas ni «CRÍTICO» innecesarios.
- [ ] El prompt dice qué hacer cuando falta información o la petición está fuera de alcance.

Referencia: [[modelos/01-principios-de-prompting]].

## 2. Contexto

- [ ] Solo entra lo que la tarea necesita: herramientas, documentos, historial.
- [ ] Los documentos largos van arriba y la pregunta al final.
- [ ] Las partes están separadas con etiquetas descriptivas.
- [ ] El contenido no fiable (webs, correos, documentos de terceros) está marcado como datos.
- [ ] Lo estable va al principio y lo variable al final, para aprovechar la caché.

Referencia: [[modelos/02-ingenieria-de-contexto]].

## 3. Salida

- [ ] Si la lee un programa, hay esquema (`output_config.format` o herramienta con `strict`).
- [ ] El contenido se valida en código: rangos, fechas, reglas de negocio.
- [ ] Hay plan para cuando la validación falla: reintento con el error o revisión humana.
- [ ] Las respuestas para personas tienen formato y longitud definidos.

Referencia: [[modelos/03-formato-y-salidas-estructuradas]].

## 4. Llamada a la API

- [ ] El nombre del modelo está en una constante o en configuración, no repartido por el código, y es un ID concreto (`claude-sonnet-5-5`), revisado contra el calendario de retiradas.
- [ ] El código usa el SDK y la versión de API actuales; no envía `temperature`, `top_p`, `top_k` ni `budget_tokens` a Claude ([[docs/fundamentos/05-versiones-de-api-y-sdks]]).
- [ ] `max_tokens` deja margen, incluido el razonamiento, que en los modelos actuales está activo por defecto.
- [ ] Se maneja cada `stop_reason`: `end_turn`, `tool_use`, `max_tokens`, `stop_sequence`, `pause_turn`, `refusal` y `model_context_window_exceeded`. Uno desconocido lanza error ([[docs/fundamentos/06-motivos-de-parada-y-rechazos]]).
- [ ] Si hay herramientas: un `tool_result` por cada `tool_use`, errores devueltos con `is_error`, y sin `tool_choice` forzado (400 en Opus 5.5, Sonnet 5.5 y Fable 5.1).
- [ ] Si usas un framework: `max_tokens` explícito, límite de pasos explícito (`recursion_limit` o un *middleware* de límite) y los errores de herramienta vuelven al modelo en lugar de romper el agente ([[docs/frameworks/04-langchain]]).
- [ ] Hay reintentos con *backoff* para 429, 529 y errores 5xx, y no se reintentan los 4xx.
- [ ] `effort` y razonamiento están ajustados a la dificultad, no al máximo por defecto.

Referencias: [[docs/agentes/01-el-bucle-agentico]], [[docs/produccion/02-costes-y-limites]], [[modelos/06-parametros]].

## 5. Evals

- [ ] Existe un conjunto de prueba con casos reales, casos límite e intentos de inyección.
- [ ] Cada criterio de calidad tiene grader: código donde se pueda, juez calibrado donde no.
- [ ] Los resultados de esta versión son iguales o mejores que los de la anterior.
- [ ] Se ha probado el tier de modelo más pequeño que podría servir.
- [ ] Las evals se ejecutan en CI ante cambios de prompt, modelo o herramientas.

Referencias: [[docs/evals/01-disenar-evals]], [[modelos/05-elegir-modelo-por-tarea]], [[recetas/evals-de-regresion-en-ci]].

## 6. Agentes

- [ ] Hay límite de pasos, de tokens por tarea y de tiempo ([[problemas/el-agente-no-para]]).
- [ ] Al saltar un límite, el usuario recibe lo conseguido y sabe que quedó a medias.
- [ ] Las acciones con impacto pasan por aprobación humana con los argumentos exactos.
- [ ] Se ha valorado si un workflow fijo bastaba.

Referencias: [[docs/agentes/03-humano-en-el-bucle]], [[patrones/01-workflows-vs-agentes]].

## 7. Seguridad

- [ ] Cada herramienta tiene el mínimo privilegio: solo lectura donde se pueda, credenciales acotadas.
- [ ] Los identificadores de usuario salen de la sesión, no de los argumentos del modelo.
- [ ] Ningún flujo combina contenido no fiable, datos privados y salida al exterior sin control.
- [ ] El código generado o la navegación se ejecutan en sandbox.
- [ ] El prompt de sistema no contiene secretos.

Referencias: [[docs/seguridad/01-prompt-injection]], [[docs/seguridad/02-permisos-y-minimo-privilegio]].

## 8. Coste, latencia y observabilidad

- [ ] Sabes cuánto cuesta una tarea típica y una de las caras.
- [ ] El *prompt caching* está activo donde hay prefijos repetidos y lo confirmas en `usage`.
- [ ] Las interfaces con personas usan streaming.
- [ ] Cada llamada y cada herramienta quedan registradas con `trace_id`, `usage`, `stop_reason` y latencia, idealmente con las convenciones GenAI de OpenTelemetry ([[docs/produccion/04-opentelemetry-genai]]).
- [ ] Los logs respetan la política de datos personales.
- [ ] Hay alertas para picos de errores, de coste y de latencia.

Referencias: [[docs/produccion/01-observabilidad]], [[docs/produccion/03-latencia]].

## Antes y después

```text title="Antes"
«Lo he probado en el playground y va bien. Lo subo.»
```

```text title="Después"
Prompt v7 · 48 casos de eval: 46 aciertos (v6: 43).
Tier mediano probado: 41 aciertos, se descarta.
stop_reason manejados, reintentos con backoff, límite de 12 pasos.
Herramienta reembolsar con aprobación humana. Trazas activas.
```

## Cuándo no aplica

Para un prototipo interno o un script que usas tú solo, basta con los puntos 3 y 4. La lista completa es para lo que van a usar otras personas, lo que ejecuta acciones o lo que se paga por volumen. Si un punto no aplica a tu caso, escribe por qué: esa frase también es documentación.

## Para seguir

- [[roadmap/100-produccion/06-despliegue]]: el despliegue paso a paso.
- [[modelos/08-antipatrones]]: los errores que esta lista intenta atrapar.
- [[disciplinas/cambios-pequenos-y-revisables]]: cómo revisar cambios de prompt.
- [[plantillas/index]]: plantillas de prompts, specs y checklists listas para copiar.
