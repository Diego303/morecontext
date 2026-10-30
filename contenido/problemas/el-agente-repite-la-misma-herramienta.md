---
titulo: El agente repite la misma herramienta en bucle
descripcion: Por qué un agente llama una y otra vez a la misma herramienta con los mismos argumentos y cómo cortarlo con errores útiles, is_error y un detector de repeticiones.
creado: 2026-10-29
sintoma: El agente repite la misma herramienta en bucle
tema: agentes
nivel: intermedio
tags: [agentes, herramientas, is-error, depuracion]
relacionados: ["[[roadmap/20-herramientas/03-errores-e-is-error]]", "[[problemas/el-agente-no-para]]", "[[disciplinas/diseno-de-herramientas]]", "[[glosario/trayectoria]]"]
---

En la traza ves la misma línea cinco, diez, veinte veces: `leer_archivo({"ruta": "config.yaml"})`, resultado, otra vez `leer_archivo({"ruta": "config.yaml"})`. A veces con una variación mínima (`"./config.yaml"`, `"config.yml"`). El agente no avanza ni se rinde, y entre llamada y llamada escribe cosas como «voy a intentarlo de nuevo». No hay mensaje de error: el bucle solo se corta cuando salta tu límite de pasos, si lo tienes ([[problemas/el-agente-no-para]]).

## Causas

- **El fallo no parece un fallo.** La herramienta devuelve `""`, `None`, `"error"` o un traceback de 40 líneas, sin `is_error: true`. El modelo no distingue «no hay datos» de «se rompió» y vuelve a probar.
- **El mensaje de error no dice qué hacer.** «Permission denied» deja abierta la opción de reintentar. «Solo puedes leer dentro de /docs» la cierra.
- **Resultados truncados en silencio.** Cortas la salida a N caracteres sin avisar. El modelo no encuentra lo que busca en el trozo y pide lo mismo esperando el resto.
- **Descripción ambigua.** Si la descripción no dice qué devuelve la herramienta, ni sus límites ni cómo paginar, el modelo no sabe qué esperar ni cuándo ya lo tiene ([[disciplinas/diseno-de-herramientas]]).
- **En LangChain, la excepción no vuelve al modelo.** Una excepción dentro de una herramienta rompe el agente salvo con `ToolErrorMiddleware` o con `ToolException` y `handle_tool_error = True`; si la capturas tú y devuelves un texto ambiguo, caes en la primera causa.

## Cómo confirmarlo

Agrupa la [[glosario/trayectoria|trayectoria]] por `(herramienta, argumentos)` y cuenta. Más de dos llamadas idénticas en una tarea casi nunca son intencionadas. Después lee el `tool_result` que recibió el modelo, no el que crees que recibió: suele ser vacío, sin `is_error` o cortado sin aviso ([[roadmap/40-primer-agente/06-depurar-con-trazas]]).

## Arreglo

Pasa toda ejecución por una función que convierta cualquier salida o fallo en un resultado que el modelo pueda usar, y que detecte la repetición:

```python title="ejecutar.py"
import json

MAX_CARACTERES = 8_000
_vistas: dict[tuple, int] = {}


def ejecutar(nombre: str, entrada: dict, funciones: dict) -> dict:
    """Convierte cualquier resultado o fallo en un tool_result que el modelo pueda usar."""
    firma = (nombre, json.dumps(entrada, sort_keys=True))
    _vistas[firma] = _vistas.get(firma, 0) + 1
    if _vistas[firma] > 2:
        return {"content": f"Ya llamaste a {nombre} con estos mismos argumentos {_vistas[firma] - 1} veces y el "
                           "resultado no va a cambiar. Usa lo que tienes o cambia de enfoque.", "is_error": True}
    try:
        salida = funciones[nombre](**entrada)
    except KeyError:
        return {"content": f"No existe la herramienta {nombre}. Disponibles: {', '.join(funciones)}.", "is_error": True}
    except Exception as e:                                   # el error, explicado y con qué hacer
        return {"content": f"{type(e).__name__}: {e}. Revisa los argumentos; no repitas la misma llamada.",
                "is_error": True}
    texto = salida if isinstance(salida, str) else json.dumps(salida, ensure_ascii=False)
    if not texto.strip():
        return {"content": "Sin resultados para esos argumentos (la búsqueda funcionó, no hay coincidencias)."}
    if len(texto) > MAX_CARACTERES:                          # truncado, y diciéndolo
        texto = texto[:MAX_CARACTERES] + f"\n[…recortado: {len(texto)} caracteres en total. Pide una página concreta.]"
    return {"content": texto}
```

Cada resultado se añade al mensaje `user` como `{"type": "tool_result", "tool_use_id": b.id, **ejecutar(b.name, b.input, FUNCIONES)}`. Probado con una herramienta `leer` que lanza `PermissionError` fuera de `/docs` y devuelve 9000 caracteres dentro:

```text
True  PermissionError: solo se puede leer dentro de /docs, no /etc/passwd. Revisa los argumentos; no repitas la misma llamada.
False xxxx…[…recortado: 9000 caracteres en total. Pide una página concreta.]
True  Ya llamaste a leer con estos mismos argumentos 2 veces y el resultado no va a cambiar. Usa lo que tienes o cambia de enfoque.
```

El detector avisa en lugar de abortar: el modelo suele corregir el rumbo con ese texto. Si aun así insiste, que salte el límite duro del bucle. Las variaciones mínimas (`./config.yaml`) no las cuenta como repetición; normaliza los argumentos que lo necesiten (rutas, mayúsculas) antes de calcular la firma.

En LangChain, el equivalente es `ToolErrorMiddleware(on_error=…)` para los errores y `ToolCallLimitMiddleware(tool_name="leer", run_limit=5)` para el tope por herramienta ([[cursos/langchain-y-langgraph/04-middleware]]).

## Cómo evitarlo

- Toda herramienta devuelve tres cosas distinguibles: datos, «no hay datos» y error con `is_error` ([[roadmap/20-herramientas/03-errores-e-is-error]]).
- Escribe los errores para el modelo: qué pasó y qué puede hacer ahora.
- Pagina en lugar de truncar, y di cuánto queda.
- En la descripción, di qué devuelve y cuándo no hace falta volver a llamarla ([[roadmap/20-herramientas/02-definir-herramientas]]).
- Añade a tus evals un caso con la herramienta fallando y comprueba la trayectoria, no solo la respuesta ([[roadmap/80-evals/04-evals-de-trayectoria]]).

## Ver también

- [[problemas/el-agente-no-para]]
- [[docs/herramientas/01-uso-de-herramientas]]
- [[roadmap/40-primer-agente/05-agente-con-varias-herramientas]]
- [[glosario/tool-result]]
