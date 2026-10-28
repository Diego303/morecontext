---
titulo: Cómo leer la traza de un agente
descripcion: Un tutorial para leer la traza de un agente paso a paso, con un ejemplo comentado y las preguntas que conviene hacerse en cada vuelta del bucle.
creado: 2026-07-15
estado: revision
tipo: tutorial
tags: [agentes, trazas, depuracion, observabilidad]
relacionados: ["[[roadmap/40-primer-agente/06-depurar-con-trazas]]", "[[roadmap/100-produccion/01-observabilidad-y-trazas]]", "[[docs/produccion/01-observabilidad]]", "[[glosario/trayectoria]]"]
---

Cuando un agente falla, la respuesta final rara vez te dice por qué. La explicación está en la traza: la secuencia de llamadas al modelo, herramientas pedidas, resultados devueltos y motivos de parada. Leerla bien es, a mi juicio, la habilidad más infravalorada de quien construye agentes. En este tutorial te propongo un método y lo aplico a una traza de ejemplo.

## Qué es una traza

Una traza registra cada vuelta del [[glosario/bucle-agentico|bucle agéntico]]. Como mínimo debería guardar, por cada llamada al modelo:

- Qué entró: mensajes, herramientas disponibles y parámetros relevantes.
- Qué salió: los bloques de `content` (`text`, `tool_use`, `thinking` si lo hay).
- El [[glosario/stop-reason|stop_reason]].
- El uso de tokens de `resp.usage`, incluidos los de caché.
- La latencia.

Y por cada herramienta ejecutada: los argumentos, el resultado que se devolvió como [[glosario/tool-result|tool_result]], si fue un error (`is_error`) y cuánto tardó. Cómo instrumentarlo está en [[roadmap/100-produccion/01-observabilidad-y-trazas]].

## El método: cuatro lecturas

No leo una traza de arriba abajo una sola vez. La leo cuatro veces con preguntas distintas.

1. **Forma.** Cuántos pasos, qué herramientas, en qué orden y cómo terminó. Sin leer contenido. Esto ya delata bucles, pasos de más o paradas raras.
2. **Decisiones.** En cada `tool_use`, ¿tenía sentido esa herramienta con esos argumentos dado lo que el modelo sabía en ese momento?
3. **Resultados.** En cada `tool_result`, ¿qué recibió realmente el modelo? Muchos fallos que parecen de razonamiento son resultados vacíos, truncados o confusos.
4. **Coste.** Tokens por paso y cómo crecen. Si la entrada crece mucho en cada vuelta, algo está inflando el contexto.

## Una traza de ejemplo

> [!nota] Traza inventada
> Esta traza es un ejemplo construido para el tutorial. No procede de un sistema real. Los números de tokens son ilustrativos.

El agente es de soporte. Tiene tres herramientas: `buscar_pedido(email)`, `estado_envio(pedido_id)` y `buscar_docs(consulta)`. El usuario pregunta: «Mi pedido no ha llegado, ¿dónde está? Mi correo es ana@ejemplo.com».

```text
# salida de ejemplo
[1] modelo  stop_reason=tool_use   in=1840  out=62
    tool_use buscar_pedido {"email": "ana@ejemplo.com"}
    tool_result (34 ms) {"pedidos": [{"id": "P-1021", "fecha": "2026-06-30"}, {"id": "P-0877", "fecha": "2026-05-02"}]}

[2] modelo  stop_reason=tool_use   in=1951  out=48
    tool_use estado_envio {"pedido_id": "P-0877"}
    tool_result (51 ms) {"estado": "entregado", "fecha_entrega": "2026-05-06"}

[3] modelo  stop_reason=tool_use   in=2030  out=55
    tool_use buscar_docs {"consulta": "pedido entregado pero no recibido"}
    tool_result (210 ms) "…12 fragmentos, 3900 tokens…"

[4] modelo  stop_reason=end_turn   in=6012  out=210
    text "Según nuestros registros, tu pedido P-0877 se entregó el 6 de mayo. Si no lo recibiste, puedes abrir una reclamación..."
```

## Comentario paso a paso

**Primera lectura, la forma.** Cuatro llamadas, tres herramientas, terminó con `end_turn`. A simple vista parece un caso sano. No hay bucles ni errores. Esta es justo la razón por la que no basta con mirar la forma.

**Paso 1.** El modelo llama a `buscar_pedido` con el correo que dio el usuario. Decisión correcta. El resultado trae **dos** pedidos. Aquí está la bifurcación que decide todo lo demás: ¿cuál es «mi pedido»? El usuario dijo que no ha llegado, lo que apunta al más reciente, `P-1021`.

**Paso 2.** El modelo consulta `P-0877`, el antiguo. Este es el error. Con lo que sabía (dos pedidos, uno de hace dos meses ya probablemente entregado y otro reciente), lo razonable era consultar el reciente o preguntar. La segunda lectura, la de decisiones, lo detecta. Ahora toca preguntarse por qué. Hay varias hipótesis que puedes comprobar:

- El resultado de la herramienta no deja claro el orden. Las fechas están, pero nada indica cuál es el más reciente o cuál está pendiente.
- El [[glosario/prompt-de-sistema|prompt de sistema]] no dice qué hacer cuando hay varios pedidos.
- El modelo eligió el último de la lista por posición.

**Paso 3.** Con un pedido «entregado» en la mano, el modelo busca documentación sobre pedidos entregados y no recibidos. Es coherente con su error: razona bien sobre una premisa falsa. Por eso digo que muchos fallos no están donde se ven. La tercera lectura, la de resultados, añade otra cosa: `buscar_docs` devolvió doce fragmentos y unos 3900 tokens. Probablemente el modelo necesitaba dos.

**Paso 4.** La respuesta final es fluida y educada, y responde a una pregunta que el usuario no hizo. Si solo evaluaras la respuesta con un juez que mira el tono, pasaría.

**Cuarta lectura, el coste.** La entrada pasa de unos 2000 tokens a más de 6000 en el último paso, casi todo por el resultado de `buscar_docs`. En una conversación más larga, ese bloque viajaría en cada llamada siguiente.

## Qué cambiaría tras leerla

Cada hallazgo se traduce en un cambio concreto:

- Que `buscar_pedido` devuelva el estado de cada pedido y los ordene del más reciente al más antiguo. Es diseño de herramienta: [[disciplinas/diseno-de-herramientas]].
- Añadir al sistema una regla: si hay varios pedidos y la pregunta es ambigua, pregunta antes de consultar.
- Limitar `buscar_docs` a los mejores fragmentos tras [[glosario/reranking|reranking]].
- Añadir este caso al [[glosario/conjunto-de-evaluacion|conjunto de evaluación]], con una comprobación de [[glosario/trayectoria|trayectoria]]: «debe consultar P-1021 o preguntar». Lo explicamos en [[roadmap/80-evals/04-evals-de-trayectoria]].

> [!consejo] La traza como caso de prueba
> Cada traza que te enseña un fallo es un caso de eval gratis. Guárdala con la conducta esperada antes de arreglar nada.

## Lo que me llevo

Leer trazas tiene poco de técnica y mucho de hábito. Primero la forma, luego las decisiones, luego lo que el modelo recibió y por último el coste. Casi siempre el fallo está un paso antes de donde aparece. Si quieres practicarlo con tu propio agente, sigue la lección [[roadmap/40-primer-agente/06-depurar-con-trazas]].

*Borrador inicial: pendiente de reescribir con la voz del autor.*
