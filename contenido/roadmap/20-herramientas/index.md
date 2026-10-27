---
titulo: "Nivel 20 · Uso de herramientas"
descripcion: "El ciclo tool_use → tool_result, herramientas definidas con JSON Schema, errores con is_error, tool_choice y un servidor MCP propio conectado a tu aplicación."
creado: 2026-09-22
nivel: 20
horas: 5
objetivo: "Dar al modelo herramientas que ejecuta tu código, completar el ciclo de petición y resultado sin errores de protocolo y exponerlas como un servidor MCP reutilizable."
prerrequisitos: ["[[roadmap/10-prompting/index]]"]
proyecto:
  titulo: "Asistente de pedidos con un servidor MCP"
  descripcion: "Un servidor MCP con tres herramientas sobre los pedidos de una tienda ficticia y un cliente de línea de comandos que conecta el modelo a ese servidor y responde preguntas de clientes ejecutando las herramientas necesarias."
  entregable: "servidor_tienda.py (MCPServer, transporte stdio, tres herramientas con docstrings y tipos), cliente.py (bucle tool_use → tool_result con is_error y límite de pasos) y un archivo trazas.txt con tres conversaciones reales: una que usa una herramienta, una que encadena dos y una en la que una herramienta falla y el modelo se recupera."
tags: [herramientas, tool-use, mcp]
relacionados: ["[[roadmap/index]]", "[[docs/herramientas/index]]", "[[glosario/tool-use]]", "[[cursos/mcp-de-cero-a-servidor/index]]"]
---

Hasta ahora el modelo solo escribía texto. En este nivel aprenderás a darle **herramientas**: funciones de tu código que el modelo puede pedir que ejecutes, como consultar un pedido, buscar en una base de datos o enviar un correo. Es la pieza que permite a un modelo actuar sobre el mundo y la base directa de los [[glosario/agente|agentes]] del [[roadmap/40-primer-agente/index|nivel 40]].

## Para quién es

- Has terminado el [[roadmap/10-prompting/index|nivel 10]] o ya sabes escribir prompts con formato validado.
- Quieres conectar un modelo a tus APIs o datos internos.
- Has oído hablar de *function calling* o de MCP y quieres entender cómo funcionan por dentro.

## Qué vas a saber hacer

Al terminar sabrás implementar el ciclo completo de [[glosario/tool-use|tool use]], definir herramientas que el modelo usa bien, devolver errores de forma que el modelo se recupere, controlar cuándo y cuáles usa con [[glosario/tool-choice|tool_choice]], y empaquetar tus herramientas en un [[glosario/servidor-mcp|servidor MCP]] que puedes conectar a tu propio código o a aplicaciones como Claude Desktop.

## Lecciones

1. [[roadmap/20-herramientas/01-ciclo-tool-use]]. El protocolo: el modelo pide, tu código ejecuta, le devuelves el resultado. Con un bucle completo en Python y TypeScript.
2. [[roadmap/20-herramientas/02-definir-herramientas]]. Nombres, descripciones y JSON Schema: lo que decide si el modelo elige bien la herramienta y le pasa bien los argumentos.
3. [[roadmap/20-herramientas/03-errores-e-is-error]]. Qué hacer cuando la herramienta falla, cuándo marcar `is_error` y cómo evitar bucles infinitos.
4. [[roadmap/20-herramientas/04-tool-choice]]. Dejar decidir al modelo, obligarle a usar una herramienta concreta o prohibírselo, y cuándo conviene cada opción.
5. [[roadmap/20-herramientas/05-mcp-conectar-un-servidor]]. Escribir un servidor MCP con MCPServer, probarlo y conectarlo a tu aplicación.

## El proyecto del nivel

Construirás un **asistente de pedidos** para una tienda ficticia. Los datos pueden vivir en un diccionario o en un SQLite pequeño; lo importante es el protocolo.

Está terminado si cumple todo esto:

- `servidor_tienda.py` expone con MCPServer tres herramientas: `buscar_pedido(id_pedido)`, `pedidos_de_cliente(email)` y `solicitar_devolucion(id_pedido, motivo)`.
- Cada herramienta tiene docstring con qué hace, cuándo usarla y qué devuelve, y tipos en todos los parámetros.
- `solicitar_devolucion` rechaza pedidos inexistentes o fuera de plazo con un error claro.
- `cliente.py` lanza el servidor por stdio, convierte sus herramientas al formato de la API y ejecuta el bucle hasta `end_turn`, con un máximo de 10 pasos.
- Cada `tool_use` recibe exactamente un `tool_result`, con `is_error` cuando corresponde.
- `trazas.txt` muestra las tres conversaciones pedidas, con cada llamada a herramienta y su resultado.

> [!consejo] Reutiliza lo anterior
> El registro de tokens y latencia del [[roadmap/00-fundamentos/index|nivel 00]] te servirá para ver cuánto añade cada paso con herramientas. Y los casos de prueba del nivel 10 se adaptan bien: pregunta, herramientas que debería usar y respuesta esperada.

## Después de este nivel

Sigue con [[roadmap/30-contexto-y-rag/index]] para darle al modelo acceso a tus documentos, o salta a [[roadmap/40-primer-agente/index]] si quieres convertir este bucle en un agente. Como referencia rápida tienes [[docs/herramientas/01-uso-de-herramientas]] y [[docs/herramientas/02-mcp]].
