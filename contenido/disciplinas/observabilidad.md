---
titulo: Observabilidad
descripcion: Registrar cada llamada, herramienta y decisión de tu agente para poder explicar qué hizo, cuánto costó y por qué falló.
creado: 2026-08-18
orden: 3
tipo: disciplina
tags: [produccion, trazas, observabilidad]
relacionados: ["[[roadmap/100-produccion/01-observabilidad-y-trazas]]", "[[docs/produccion/01-observabilidad]]", "[[roadmap/40-primer-agente/06-depurar-con-trazas]]", "[[glosario/observabilidad]]"]
---

La [[glosario/observabilidad|observabilidad]] de un sistema con modelos es la capacidad de responder, después de los hechos, a tres preguntas: qué vio el modelo, qué decidió y qué pasó al ejecutarlo. Si no puedes reconstruir una ejecución paso a paso, no puedes depurarla ni mejorarla.

## Qué es

En software clásico registras peticiones, errores y métricas. En un [[glosario/agente|agente]] eso no basta, porque el mismo código puede tomar caminos distintos según lo que decida el modelo. Necesitas una **traza**: el registro ordenado de cada paso de una ejecución.

Una traza útil guarda, por cada llamada al modelo:

| Campo | Para qué |
|---|---|
| Petición completa (sistema, mensajes, herramientas) | Reproducir el caso |
| Respuesta y `stop_reason` | Saber por qué paró. Ver [[glosario/stop-reason]] |
| `usage` (entrada, salida, caché) | Coste por paso y por tarea |
| Latencia | Encontrar el paso lento |
| Versión del prompt y del modelo | Comparar antes y después de un cambio |

Y por cada herramienta: nombre, argumentos, resultado (o un resumen si es enorme), si fue error (`is_error`) y cuánto tardó. Todo colgado de un identificador de tarea para poder ver la ejecución entera.

```mermaid
flowchart TD
  T[Tarea id=7f3] --> L1[Llamada 1 · tool_use]
  L1 --> H1[buscar_pedido · 120 ms]
  H1 --> L2[Llamada 2 · tool_use]
  L2 --> H2[reembolsar · is_error]
  H2 --> L3[Llamada 3 · end_turn]
```

## Por qué importa

Cuando un usuario dice «el agente me ha contestado una barbaridad», la traza te dice si el modelo tuvo el dato correcto y lo ignoró, si la herramienta devolvió basura o si el documento no llegó a recuperarse. Cada caso se arregla en un sitio distinto. Sin traza, adivinas.

La traza también es la materia prima de tus [[disciplinas/evals|evals]]: los fallos reales que encuentras se convierten en casos de prueba. Y es la única forma seria de controlar costes, porque el gasto de un agente depende de cuántas vueltas da, y eso solo se ve ejecución a ejecución.

## Prácticas concretas

- **Traza desde el primer día.** Aunque sea un JSONL por tarea en disco. Es mucho más barato que añadirla después de un incidente.
- **Un id por tarea, un id por paso.** Propágalos a los logs de tus herramientas y servicios para cruzar información.
- **Guarda `usage` en cada respuesta.** Incluye `cache_read_input_tokens` y `cache_creation_input_tokens` para saber si el caché funciona ([[recetas/recortar-costes-con-prompt-caching]]).
- **Registra las versiones.** Hash del prompt de sistema, nombre del modelo, versión de las definiciones de herramientas. Si cambias algo, lo verás en la traza.
- **Mide por tarea, no solo por llamada.** Vueltas por tarea, coste por tarea, tiempo hasta respuesta, tasa de errores de herramienta. Son las métricas que se mueven cuando algo se rompe.
- **Alerta sobre síntomas propios de agentes.** Tareas que llegan al límite de pasos, `stop_reason == "max_tokens"`, la misma herramienta llamada cinco veces seguidas con los mismos argumentos.
- **Protege los datos.** Las trazas contienen lo que escriben los usuarios. Enmascara datos personales, limita quién las lee y define cuánto tiempo se guardan.
- **Usa estándares si ya los tienes.** Si tu empresa usa OpenTelemetry, emite cada llamada como un *span*. Si no, empieza con JSONL y una herramienta sencilla para leerlo.

Un esqueleto mínimo para registrar cada llamada:

```python title="traza.py"
import json, os, time, uuid

os.makedirs("trazas", exist_ok=True)

def llamar_con_traza(client, tarea_id: str, **kwargs):
    inicio = time.monotonic()
    resp = client.messages.create(**kwargs)
    registro = {
        "tarea": tarea_id,
        "paso": str(uuid.uuid4()),
        "modelo": kwargs["model"],
        "stop_reason": resp.stop_reason,
        "usage": resp.usage.model_dump(),
        "ms": round((time.monotonic() - inicio) * 1000),
        "herramientas": [b.name for b in resp.content if b.type == "tool_use"],
    }
    with open(f"trazas/{tarea_id}.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(registro, ensure_ascii=False) + "\n")
    return resp
```

## Señales de que lo haces mal

- Para depurar un fallo, intentas reproducirlo a mano porque no tienes registro.
- Sabes el gasto mensual total pero no el coste medio por tarea.
- Los logs dicen «error en el agente» sin indicar en qué paso ni con qué herramienta.
- No puedes decir qué versión del prompt estaba activa cuando ocurrió un incidente.
- Las trazas guardan datos personales en claro y cualquiera del equipo puede leerlas.

> [!consejo] Lee trazas cada semana
> Elige diez ejecuciones al azar y léelas enteras. Encontrarás vueltas inútiles, herramientas mal usadas y prompts ignorados que ninguna métrica agregada te mostraría. Cómo hacerlo: [[blog/2026-07-15-como-leer-una-traza]].

## Cómo empezar mañana

1. Envuelve tu llamada al modelo con una función como `llamar_con_traza` y escribe un JSONL por tarea.
2. Añade el registro de cada herramienta (nombre, argumentos, `is_error`, milisegundos).
3. Calcula una vez al día tres números: coste medio por tarea, vueltas medias y tasa de errores de herramienta.
4. Lee diez trazas y apunta el primer problema que veas. Ese es tu siguiente arreglo.

## Para seguir

- [[roadmap/100-produccion/01-observabilidad-y-trazas]]
- [[roadmap/40-primer-agente/06-depurar-con-trazas]]
- [[docs/produccion/02-costes-y-limites]]
