---
titulo: Introducción a la documentación
descripcion: Qué cubre la documentación de MoreContext, sus convenciones de código y cómo preparar tu entorno para seguir los ejemplos.
creado: 2026-07-14
orden: 1
nivel: inicial
tags: [api, fundamentos, entorno]
relacionados: ["[[docs/fundamentos/02-tu-primera-llamada]]", "[[roadmap/index]]", "[[roadmap/00-fundamentos/04-primera-llamada-api]]"]
---

La documentación de MoreContext es una **referencia por temas** para construir aplicaciones y [[glosario/agente|agentes]] con modelos de lenguaje. Cada artículo responde a cuatro preguntas: qué es, cómo se usa, qué parámetros tiene y dónde suele fallar. Está pensada para consultarla con el editor abierto, no para leerla de principio a fin.

## Documentación frente a roadmap

MoreContext tiene dos formas de contar lo mismo. Elige según lo que necesites ahora.

| | Documentación (`/docs/`) | Roadmap y cursos |
|---|---|---|
| Objetivo | Consultar un dato concreto | Aprender un tema desde cero |
| Orden | Por temas, se lee en cualquier orden | Secuencial, cada lección se apoya en la anterior |
| Forma | Definición, tablas de parámetros, ejemplo completo, errores | Explicación guiada, ejercicio y criterio de aceptación |
| Cuándo | Ya sabes lo que buscas | No sabes aún qué preguntar |

Cada artículo enlaza a las lecciones que enseñan su tema. Por ejemplo, [[docs/herramientas/01-uso-de-herramientas]] remite a [[roadmap/20-herramientas/01-ciclo-tool-use]]. Si una tabla de parámetros te resulta opaca, la lección es el sitio donde se entiende.

## Grupos

| Grupo | Qué cubre |
|---|---|
| [[docs/fundamentos/index]] | Peticiones, mensajes, bloques, streaming |
| [[docs/prompting/index]] | Prompt de sistema, ejemplos, salida estructurada, razonamiento |
| [[docs/herramientas/index]] | Uso de herramientas, MCP, herramientas del servidor, uso del ordenador |
| [[docs/contexto/index]] | Ventana de contexto, prompt caching, RAG, memoria |
| [[docs/agentes/index]] | Bucle agéntico, subagentes, humano en el bucle |
| [[docs/evals/index]] | Diseño de evals y modelo como juez |
| [[docs/produccion/index]] | Observabilidad, costes, latencia |
| [[docs/seguridad/index]] | Inyección de prompt y permisos |

## Convenciones del código

Todo el código de la documentación sigue las mismas reglas. Así puedes copiar un fragmento de un artículo y pegarlo junto a otro sin sorpresas.

- **Implementación de referencia**: la API de Mensajes de Anthropic. Los conceptos sirven con cualquier proveedor; los nombres de campos cambian.
- **Python primero**, con TypeScript en pestañas en el ejemplo central de cada artículo.
- **Una constante `MODEL`** al principio de cada archivo. Los nombres de modelo cambian con frecuencia; cámbialos en un solo sitio.
- **La clave de API sale del entorno**, nunca del código.
- **Salidas inventadas** se marcan con `# salida de ejemplo` en un bloque de texto. Lo demás es código que funciona.
- **Se maneja siempre `stop_reason`**. Ignorarlo es la causa más común de respuestas cortadas o bucles que no terminan.

> [!aviso] Nombres de modelo, precios y límites
> Cambian rápido. La documentación explica el concepto y usa `MODEL = "claude-sonnet-5-5"` como marcador. Consulta los valores vigentes en la [documentación oficial de la API](https://platform.claude.com/docs).

## Preparar el entorno

Necesitas una clave de API del proveedor y el SDK de tu lenguaje.

```bash tab="Python"
pip install anthropic
export ANTHROPIC_API_KEY="sk-ant-..."   # mejor en un .env que no subas al repositorio
```

```bash tab="TypeScript"
npm install @anthropic-ai/sdk
export ANTHROPIC_API_KEY="sk-ant-..."
```

Comprueba que todo funciona con el mínimo posible:

```python tab="Python" title="comprobar.py"
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()  # lee ANTHROPIC_API_KEY del entorno

resp = client.messages.create(
    model=MODEL,
    max_tokens=64,
    messages=[{"role": "user", "content": "Responde solo: ok"}],
)
print(resp.content[0].text, resp.stop_reason)
```

```ts tab="TypeScript" title="comprobar.ts"
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

const resp = await client.messages.create({
  model: MODEL,
  max_tokens: 64,
  messages: [{ role: "user", content: "Responde solo: ok" }],
});
const first = resp.content[0];
if (first.type === "text") console.log(first.text, resp.stop_reason);
```

```text
# salida de ejemplo
ok end_turn
```

Si ves un error de autenticación, la variable de entorno no está llegando al proceso. Si ves un error de modelo no encontrado, cambia `MODEL` por uno vigente según la documentación oficial.

## Conceptos que se dan por sabidos

Los artículos usan estos términos sin volver a explicarlos. Si alguno no te suena, empieza por su entrada del glosario.

| Término | En una línea |
|---|---|
| [[glosario/token]] | Unidad en la que el modelo lee, escribe y factura. |
| [[glosario/ventana-de-contexto]] | Máximo de tokens que caben en una petición más su respuesta. |
| [[glosario/prompt-de-sistema]] | Instrucciones fijas que enmarcan toda la conversación. |
| [[glosario/max-tokens]] | Límite duro de tokens de salida por respuesta. |
| [[glosario/stop-reason]] | Por qué dejó de generar el modelo. |
| [[glosario/tool-use]] | El modelo pide a tu código que ejecute una función. |

## Cómo leer un artículo

Todos tienen la misma estructura para que encuentres rápido lo que buscas:

1. **Definición** en el primer párrafo.
2. **Secciones de referencia**: cómo funciona y qué opciones hay.
3. **Ejemplo completo**, ejecutable, con pestañas Python y TypeScript.
4. **Tabla de parámetros o casos**.
5. **Errores frecuentes**, con su causa y su arreglo.
6. **Ver también**: glosario, lecciones, recetas y sistemas relacionados.

Puedes enlazar a una sección concreta con su título, por ejemplo [[docs/fundamentos/02-tu-primera-llamada#Errores frecuentes|los errores de la primera llamada]].

## Ver también

- [[docs/fundamentos/02-tu-primera-llamada]]: anatomía de una petición y su respuesta.
- [[roadmap/00-fundamentos/index]]: el mismo terreno, enseñado paso a paso.
- [[paginas/empieza-aqui]]: rutas según tu punto de partida.
- [[glosario/index]]: todos los términos.
