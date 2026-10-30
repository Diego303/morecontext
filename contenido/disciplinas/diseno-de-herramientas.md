---
titulo: Diseño de herramientas
descripcion: Cómo definir herramientas que un modelo entienda, elija bien y use sin gastar contexto de más, con nombres, descripciones, parámetros y respuestas pensados para un agente.
creado: 2026-09-01
actualizado: 2026-10-29
orden: 5
tipo: disciplina
tags: [herramientas, agentes, diseno]
relacionados: ["[[roadmap/20-herramientas/02-definir-herramientas]]", "[[docs/herramientas/01-uso-de-herramientas]]", "[[glosario/tool-use]]", "[[disciplinas/context-engineering]]"]
---

Diseñar herramientas es escribir la interfaz entre tu sistema y un modelo. Quien la usa es un modelo que solo ve el nombre, la descripción y el esquema. No puede preguntarte ni leer tu código, y en cada vuelta decide si llamarla y con qué argumentos.

## Qué es

Una herramienta, en la API de Mensajes, es un nombre, una descripción y un `input_schema` en JSON Schema. Cuando el modelo quiere usarla, responde con un bloque `tool_use`; tu código la ejecuta y devuelve un [[glosario/tool-result|`tool_result`]]. El ciclo completo está en [[roadmap/20-herramientas/01-ciclo-tool-use]].

La disciplina va más allá del formato. Anthropic recoge lo aprendido en [*Writing effective tools for agents — with agents*](https://www.anthropic.com/engineering/writing-tools-for-agents) (11 sept. 2025), y la idea de fondo es esta: las herramientas son un contrato entre un sistema determinista y un agente que no lo es. Lo que funciona bien para un programador (una API con muchos endpoints finos) suele funcionar mal para un agente.

## Por qué importa

Una herramienta mal diseñada produce fallos que parecen del modelo. El agente llama a `buscar` cuando debería llamar a `buscar_cliente`. Pasa un nombre donde iba un id. Pide la lista completa de pedidos, recibe 40 000 [[glosario/token|tokens]] y pierde el hilo de la tarea. Recibe un `Error 500` y lo reintenta igual cinco veces.

Cambiar el prompt de sistema rara vez arregla esto. Cambiar la herramienta, casi siempre.

## Prácticas concretas

**Elige pocas herramientas y que hagan trabajo completo.** El artículo de Anthropic pone un ejemplo: en vez de `listar_usuarios`, `listar_eventos` y `crear_evento`, una herramienta `programar_reunion` que busca disponibilidad y crea el evento. Menos pasos, menos contexto, menos ocasiones de error.

**Nombres claros y con espacio de nombres.** Si conectas varios servicios, prefija: `crm_buscar_cliente`, `facturas_buscar`. Evita dos herramientas cuyo nombre se pueda confundir.

**Describe como si se lo explicaras a alguien nuevo en el equipo.** Qué hace, cuándo usarla, cuándo no, qué devuelve y qué formato tienen los datos. Lo implícito para ti (qué es un «cliente activo», cómo se escriben las fechas) no lo es para el modelo.

```python title="herramienta.py"
buscar_pedidos = {
    "name": "pedidos_buscar",
    "description": (
        "Busca pedidos de UN cliente. Úsala cuando el usuario pregunte por el "
        "estado, la fecha o el importe de sus pedidos. No sirve para buscar "
        "clientes: para eso usa crm_buscar_cliente. Devuelve como máximo "
        "`limite` pedidos, del más reciente al más antiguo."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "cliente_id": {"type": "string", "description": "Id del cliente, p. ej. 'C-10293'. Obtenlo con crm_buscar_cliente."},
            "estado": {"type": "string", "enum": ["pendiente", "enviado", "entregado", "devuelto"]},
            "limite": {"type": "integer", "description": "Entre 1 y 50. Por defecto 10."},
        },
        "required": ["cliente_id"],
    },
}
```

**Parámetros sin ambigüedad.** `cliente_id` mejor que `cliente`. Usa `enum` cuando los valores son cerrados. Pon ejemplos de formato en la descripción.

**Devuelve lo que el agente necesita, no lo que tiene tu base de datos.** Nombres legibles en vez de UUID sueltos, solo los campos útiles. Una opción `formato: "resumen" | "detalle"` deja al agente pedir más solo cuando lo necesita.

**Cuida los tokens de la respuesta.** Pagina, filtra y trunca con un aviso que diga cómo seguir: «Mostrando 10 de 248. Usa `pagina=2` o filtra por `estado`». Es [[disciplinas/context-engineering|context engineering]] aplicado a la herramienta.

**Errores que enseñan.** Devuelve `is_error: True` con un mensaje accionable: «cliente_id 'Ana López' no tiene el formato C-NNNNN; busca primero el id con crm_buscar_cliente». Un buen mensaje de error hace que el siguiente intento salga bien. Ver [[roadmap/20-herramientas/03-errores-e-is-error]]. En un servidor MCP, ese mensaje se lanza con `ToolError`; en LangChain, una excepción dentro de la herramienta corta el agente salvo que añadas `ToolErrorMiddleware`, así que el mismo diseño de errores necesita esa pieza ([[cursos/langchain-y-langgraph/02-modelos-mensajes-y-herramientas]]).

**Garantiza el esquema cuando importa.** Con `strict: True` en la definición, los argumentos cumplen el `input_schema`. El modo estricto no admite `minimum`, `maximum` ni límites de longitud, por eso el ejemplo de arriba dice el rango de `limite` en la descripción. Valida en tu código lo que el esquema no puede expresar (rangos, permisos).

**Enseña con ejemplos de uso.** Para parámetros complejos (filtros anidados, formatos con convenciones propias), unos pocos ejemplos de llamada correcta ayudan más que otro párrafo de descripción; la API de Claude los admite como `input_examples` en la definición ([[docs/herramientas/01-uso-de-herramientas]]).

**Si son muchas, que no estén todas a la vez.** Con decenas de herramientas o varios servidores MCP, las definiciones llenan el contexto y el modelo elige peor. La búsqueda de herramientas con `defer_loading: true` carga solo las que necesita ([[recetas/carga-diferida-de-herramientas]]). Y no fuerces una herramienta para obtener un resultado final: en Opus 5.5 y Sonnet 5.5, `tool_choice` `any` o `tool` devuelve 400 ([[recetas/entregar-resultado-sin-forzar-herramienta]]).

**Evalúa las herramientas con tareas reales.** Escribe tareas realistas que requieran varias llamadas, ejecútalas y lee las [[glosario/trayectoria|trayectorias]]: dónde dudó el agente, qué herramienta confundió, qué parámetro rellenó mal. Ese es tu backlog de mejoras.

## Señales de que lo haces mal

- Has convertido cada endpoint de tu API REST en una herramienta.
- Tienes dos herramientas con descripciones casi iguales.
- Las descripciones tienen una línea y no dicen cuándo no usar la herramienta.
- Una herramienta devuelve el objeto completo de la base de datos, con campos internos y UUID.
- Los errores llegan al modelo como trazas de excepción de Python.
- El agente necesita cuatro llamadas encadenadas para una acción que el usuario pide en una frase.
- El agente repite la misma llamada con los mismos argumentos porque el resultado no le dice qué hacer ([[problemas/el-agente-repite-la-misma-herramienta]]).

> [!consejo] Lee la herramienta como la lee el modelo
> Imprime solo el nombre, la descripción y el esquema, sin tu código al lado. Si con eso no sabrías cuándo usarla, el modelo tampoco.

## Cómo empezar mañana

1. Lista tus herramientas y, para cada una, escribe en una frase cuándo debe usarse y cuándo no. Mételo en la descripción.
2. Busca en tus trazas el resultado de herramienta más largo. Recórtalo a los campos que el modelo usó y añade paginación.
3. Reescribe tres mensajes de error para que digan qué hacer a continuación.
4. Si dos herramientas se confunden a menudo, fusiónalas o renómbralas.

## Para seguir

- [[roadmap/20-herramientas/02-definir-herramientas]]
- [[roadmap/20-herramientas/04-tool-choice]]
- [[cursos/mcp-de-cero-a-servidor/03-tu-primer-servidor]]
- [[problemas/modelo-local-no-llama-herramientas]]: cuando el diseño está bien y el modelo abierto no llama a nada.
