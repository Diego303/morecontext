---
titulo: Ingeniería de contexto
descripcion: Qué meter en el contexto del modelo y qué dejar fuera, en qué orden colocarlo, cómo estructurarlo con etiquetas y por qué el contexto es un recurso finito.
creado: 2026-10-09
actualizado: 2026-10-29
orden: 2
tags: [contexto, prompting, modelos]
aliases: [Context engineering]
relacionados: ["[[disciplinas/context-engineering]]", "[[cursos/context-engineering/index]]", "[[glosario/ventana-de-contexto]]", "[[modelos/07-documentos-largos]]", "[[biblioteca/context-engineering-anthropic]]"]
---

**Principio**: el modelo solo razona con lo que tiene delante, así que tu trabajo es darle el contexto más pequeño que contenga todo lo necesario.

La ingeniería de contexto amplía el prompting. El prompt es una parte; el contexto es todo lo que entra en la llamada: [[glosario/prompt-de-sistema|prompt de sistema]], definiciones de herramientas, documentos recuperados, historial de la conversación, resultados de herramientas y memoria. En un agente, la mayor parte del contexto no la escribes tú: la va acumulando el propio bucle. Anthropic lo desarrolla en [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (29 de septiembre de 2025), comentado en [[biblioteca/context-engineering-anthropic]].

## Por qué el contexto es finito

La [[glosario/ventana-de-contexto|ventana de contexto]] tiene un límite en tokens, pero el problema aparece antes de llegar a él. Cuanto más contenido hay, más le cuesta al modelo encontrar lo relevante y más fácil es que una información secundaria pese en la respuesta. [Liu et al. (2023)](https://arxiv.org/abs/2307.03172) mostraron que los modelos aprovechan peor la información situada en mitad de contextos largos ([[glosario/lost-in-the-middle]]). Chroma midió después que el rendimiento baja a medida que crece la entrada, aunque la tarea no cambie: lo llamó [[glosario/context-rot|context rot]] ([Hong, Troynikov y Huber, 14 de julio de 2025](https://www.trychroma.com/research/context-rot)). Que los modelos actuales tengan 1M de tokens de ventana no cambia esto. Además, cada token cuesta dinero y tiempo en cada llamada.

Piensa en el contexto como un presupuesto: cada elemento tiene que ganarse su sitio.

## Qué meter y qué no

| Mete | Deja fuera |
|---|---|
| Las instrucciones y el porqué | Instrucciones repetidas de tres formas distintas |
| Los fragmentos de documento que responden a la pregunta | El documento entero cuando bastaban dos secciones |
| Ejemplos que fijan el formato | Ejemplos casi idénticos entre sí |
| Herramientas que la tarea necesita | Veinte herramientas «por si acaso» |
| Resultados de herramienta resumidos a lo útil | JSON de 5.000 tokens con campos que nadie lee |
| Estado actual de la tarea | Todo el historial de intentos fallidos |

Para documentos, la [[glosario/rag|recuperación]] selecciona qué fragmentos entran. Para historiales largos, la [[glosario/compactacion|compactación]] resume lo antiguo y conserva lo reciente. Para herramientas, el diseño importa: una herramienta que devuelve solo los campos necesarios ahorra contexto en cada llamada ([[disciplinas/diseno-de-herramientas]]). Y si tienes muchas, no hace falta cargarlas todas: la [[glosario/carga-diferida-de-herramientas|carga diferida]] deja que el modelo busque las que necesita ([[recetas/carga-diferida-de-herramientas]]).

```text title="Antes"
[prompt de sistema]
[30 herramientas, de las que la tarea usa 4]
[resultado de buscar_pedidos: JSON completo de 12 pedidos con 40 campos cada uno]
[historial de 25 turnos]
¿Cuándo llega mi último pedido?
```

```text title="Después"
[prompt de sistema]
[4 herramientas relevantes para soporte de pedidos]
[resultado de buscar_pedidos: último pedido con id, estado, fecha estimada y transportista]
[resumen del historial: el cliente ya verificó su identidad]
¿Cuándo llega mi último pedido?
```

## Orden: lo estable arriba, lo variable abajo

El orden del contexto afecta a dos cosas: a la calidad y al coste.

- **Calidad**: con documentos largos, colócalos al principio y la pregunta o la instrucción al final. En la práctica mejora las respuestas, sobre todo con varios documentos. Ver [[modelos/07-documentos-largos]].
- **Coste**: el [[glosario/prompt-caching|prompt caching]] cachea prefijos en el orden `tools` → `system` → `messages`. Si pones al principio algo que cambia en cada llamada (la fecha y hora, un identificador de sesión), invalidas la caché de todo lo que va detrás. Lo estable va primero; lo que cambia, al final. Si necesitas cambiar instrucciones a mitad de conversación, los modelos actuales de Claude admiten un mensaje `system` intermedio que no rompe la caché ([[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]).

```diff
- system: "Hoy es 2026-10-24 15:32:07. Eres el asistente de… [3.000 tokens de reglas]"
+ system: "Eres el asistente de… [3.000 tokens de reglas]"
+ (la fecha va en el último mensaje del usuario, si de verdad hace falta)
```

## Estructura: etiquetas XML

Cuando el contexto mezcla instrucciones, documentos, ejemplos y datos del usuario, separa cada cosa con etiquetas descriptivas. El modelo distingue mejor qué es cada parte y tú puedes referirte a ellas por su nombre.

```text title="Después"
<instrucciones>
Responde a la pregunta usando solo <documentos>. Si no está ahí, dilo.
</instrucciones>

<documentos>
<documento id="1" titulo="Política de devoluciones">…</documento>
<documento id="2" titulo="Envíos internacionales">…</documento>
</documentos>

<pregunta>¿Puedo devolver un pedido enviado a Portugal?</pregunta>
```

Las etiquetas también ayudan a separar contenido no fiable de instrucciones, una de las capas de defensa frente a la [[docs/seguridad/01-prompt-injection|inyección de prompt]].

## El contexto en agentes

En un agente el contexto crece solo. Cada vuelta añade la respuesta del modelo y los resultados de las herramientas. Tres técnicas lo mantienen bajo control:

1. **Resultados de herramienta compactos**. Devuelve lo que el modelo necesita para decidir el siguiente paso; si necesita más, que lo pida.
2. **Compactación**. Cuando el historial supera un umbral, resume lo antiguo (decisiones tomadas, datos confirmados, pendientes) y sigue con el resumen. Puedes hacerlo en tu código o, con Claude, dejar que lo haga el servidor (en beta): [[docs/contexto/05-compactacion-y-limpieza-en-el-servidor]].
3. **[[glosario/subagente|Subagentes]]**. Delega exploraciones ruidosas en un agente con contexto propio que devuelve solo la conclusión. Ver [[docs/agentes/02-subagentes]].

Para tareas largas, una nota de estado externa (un archivo o una tabla con el progreso) evita depender de que todo siga en el historial. Ver [[cursos/context-engineering/04-contexto-para-agentes-largos]].

## Cuándo no aplica

Para una llamada única con una pregunta corta y sin documentos, no hay mucho que gestionar: escribe una instrucción clara y listo. La ingeniería de contexto empieza a pagar cuando hay documentos, herramientas o conversaciones de muchos turnos. Y no recortes por recortar: quitar un dato que el modelo necesitaba empeora la respuesta más de lo que ahorra. Mide con tus [[glosario/evals|evals]] antes y después.

## Para seguir

- [[cursos/context-engineering/01-el-contexto-como-presupuesto]]: el curso completo empieza aquí.
- [[docs/contexto/01-ventana-de-contexto]]: referencia técnica de la ventana.
- [[modelos/08-antipatrones]]: errores habituales, varios de contexto.
