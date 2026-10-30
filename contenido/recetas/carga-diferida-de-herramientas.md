---
titulo: Muchas herramientas sin llenar el contexto
descripcion: Mide cuánto ocupan las definiciones de tus herramientas y, si son muchas, cárgalas bajo demanda con la búsqueda de herramientas de la API o con un índice propio.
creado: 2026-10-29
nivel: intermedio
minutos: 30
tema: herramientas
stack: [Python]
tags: [herramientas, contexto, tool-search, defer-loading, coste]
relacionados: ["[[glosario/carga-diferida-de-herramientas]]", "[[docs/herramientas/05-busqueda-y-carga-diferida]]", "[[disciplinas/diseno-de-herramientas]]", "[[docs/herramientas/06-llamada-programatica]]", "[[cursos/context-engineering/02-que-meter-y-que-no]]"]
---

## Problema

Tu agente tiene treinta herramientas, o conecta tres servidores MCP con doscientas. Todas sus definiciones viajan en **cada** petición, antes de que el usuario diga nada: pagas esos tokens siempre, llenan la ventana y, con muchas herramientas parecidas, al modelo le cuesta más elegir la correcta.

La solución es la **[[glosario/carga-diferida-de-herramientas|carga diferida]]**: el modelo ve solo unas pocas herramientas y un buscador, y las demás se cargan cuando las necesita. En [*Introducing advanced tool use*](https://www.anthropic.com/engineering/advanced-tool-use) (noviembre de 2025), Anthropic cuenta que la búsqueda de herramientas redujo un 85 % los tokens de definiciones en su ejemplo (de unos 77.000 a unos 8.700; con esas cifras la bajada sería de cerca del 89 %, así que toma el 85 % como orden de magnitud) y mejoró la precisión en sus evals de MCP: Opus 4 pasó del 49 % al 74 % y Opus 4.5 del 79,5 % al 88,1 %.

## Ingredientes

- Python 3.10 o superior, `pip install anthropic` (y `rank-bm25` para el índice propio).
- La variable `ANTHROPIC_API_KEY`.
- Tu catálogo de herramientas. Los ejemplos usan 30 herramientas de tres servicios con prefijo (`crm_`, `facturas_`, `calendario_`), definidas en `catalogo.py`.

```python title="catalogo.py"
"""Un catálogo de herramientas de ejemplo: 3 servicios con espacios de nombres."""
SERVICIOS = {
    "crm": ["buscar_cliente", "crear_cliente", "actualizar_cliente", "historial_cliente", "fusionar_clientes",
            "etiquetar_cliente", "notas_cliente", "listar_oportunidades", "crear_oportunidad", "cerrar_oportunidad"],
    "facturas": ["buscar_factura", "emitir_factura", "anular_factura", "enviar_factura", "pagos_pendientes",
                 "registrar_pago", "abono_parcial", "exportar_contabilidad", "impuestos_trimestre", "recordatorio_pago"],
    "calendario": ["ver_agenda", "crear_evento", "mover_evento", "cancelar_evento", "buscar_hueco",
                   "invitar_asistentes", "recordatorios", "zona_horaria", "salas_libres", "reservar_sala"],
}
MAS_USADAS = {"crm_buscar_cliente", "facturas_buscar_factura", "calendario_ver_agenda"}


def herramienta(servicio: str, accion: str) -> dict:
    return {"name": f"{servicio}_{accion}",
            "description": f"{accion.replace('_', ' ').capitalize()} en el servicio de {servicio}. "
                           f"Úsala cuando el usuario pida {accion.replace('_', ' ')}.",
            "input_schema": {"type": "object", "additionalProperties": False, "required": ["consulta"],
                             "properties": {"consulta": {"type": "string", "description": "Qué buscar o hacer"},
                                            "limite": {"type": "integer", "description": "Máximo de resultados"}}}}


CATALOGO = [herramienta(s, a) for s, acciones in SERVICIOS.items() for a in acciones]
```

## Pasos

1. **Mide antes de optimizar.** `count_tokens` acepta `tools`: la diferencia con y sin herramientas es lo que cuestan las definiciones en cada petición. Midiendo cada herramienta sola ves cuáles pesan más (descripciones largas, esquemas con muchos campos).

```python title="medir.py"
"""¿Cuántos tokens cuestan tus definiciones de herramientas? Antes de optimizar, mide."""
import anthropic

from catalogo import CATALOGO

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()
MENSAJE = [{"role": "user", "content": "Hola"}]


def tokens(tools: list[dict] | None = None) -> int:
    extra = {"tools": tools} if tools else {}
    return client.messages.count_tokens(model=MODEL, messages=MENSAJE, **extra).input_tokens


base = tokens()
total = tokens(CATALOGO) - base
por_herramienta = sorted(((tokens([t]) - base, t["name"]) for t in CATALOGO), reverse=True)
print(f"{len(CATALOGO)} herramientas · {total:,} tokens de definiciones en cada petición")
for n, nombre in por_herramienta[:5]:
    print(f"  {n:>5}  {nombre}")
print("Carga diferida recomendable" if len(CATALOGO) >= 10 or total > 10_000 else "No compensa todavía")
```

```text
# salida de ejemplo
30 herramientas · 4,512 tokens de definiciones en cada petición
    188  facturas_exportar_contabilidad
    171  calendario_invitar_asistentes
  …
Carga diferida recomendable
```

2. **Decide si compensa.** La documentación de la búsqueda de herramientas la recomienda con **10 herramientas o más**, definiciones de más de **10.000 tokens**, precisión que cae al crecer el catálogo, varios servidores MCP o un catálogo que no para de crecer. No compensa con menos de 10 herramientas que se usan en casi todas las peticiones: ahí la búsqueda añade un paso sin ahorrar nada.

3. **Activa la búsqueda de la API.** Añade la herramienta de búsqueda (variante BM25, que recibe lenguaje natural, o regex, que recibe patrones de Python) y marca con `defer_loading: True` las demás, **salvo las 3–5 que más se usan**. Reglas de la [documentación](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool):
   - Envía **todas** las definiciones en cada petición, también las diferidas.
   - Al menos una herramienta sin diferir (normalmente, el buscador). La búsqueda nunca se difiere.
   - Responde con `tool_result` solo a los bloques `tool_use`; el `server_tool_use` de la búsqueda y su `tool_search_tool_result` los resuelve la API y se devuelven intactos en el historial.

```python title="agente_diferido.py"
import anthropic

from catalogo import CATALOGO, MAS_USADAS

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

BUSQUEDA = {"type": "tool_search_tool_bm25_20251119", "name": "tool_search_tool_bm25"}   # o la variante regex
TOOLS = [BUSQUEDA] + [dict(t, defer_loading=t["name"] not in MAS_USADAS) for t in CATALOGO]
SISTEMA = ("Tienes herramientas de tres servicios: crm_*, facturas_* y calendario_*. Si no ves la que "
           "necesitas, búscala con la herramienta de búsqueda antes de responder.")


def ejecutar(nombre: str, entrada: dict) -> str:
    return f"{nombre}: sin resultados para {entrada.get('consulta')!r}"    # aquí despachas de verdad


def agente(pregunta: str, max_pasos: int = 15) -> str:
    mensajes = [{"role": "user", "content": pregunta}]
    for _ in range(max_pasos):
        resp = client.messages.create(model=MODEL, max_tokens=4096, system=SISTEMA,
                                      tools=TOOLS, messages=mensajes)        # siempre el catálogo entero
        for b in resp.content:
            if b.type == "tool_search_tool_result" and b.content.type == "tool_search_tool_search_result":
                print("descubiertas:", [r.tool_name for r in b.content.tool_references])
        mensajes.append({"role": "assistant", "content": resp.content})     # el resultado de búsqueda, intacto
        if resp.stop_reason == "pause_turn":
            continue
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")
        mensajes.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b.id, "content": ejecutar(b.name, b.input)}
            for b in resp.content if b.type == "tool_use"]})                # nunca para server_tool_use
    return "Límite de pasos."
```

   En una respuesta típica verás tres bloques seguidos: la búsqueda (`server_tool_use` con `query`), su resultado (`tool_search_tool_result` con una lista de `tool_reference`) y la llamada a la herramienta descubierta (`tool_use`). La búsqueda devuelve 5 referencias por defecto y admite hasta 10.000 herramientas diferidas por petición.

4. **Cuida la caché.** Las herramientas diferidas no forman parte del prefijo, así que añadir o quitar una no invalida el [[glosario/prompt-caching|prompt caching]]. Pero una herramienta con `defer_loading: True` **no puede llevar `cache_control`** (da 400): pon el punto de corte en una herramienta sin diferir o en el sistema.

5. **Ayuda a que la búsqueda acierte.** Nombres con prefijo por servicio (`facturas_`), para que una búsqueda encuentre el grupo; descripciones con las palabras que usaría quien pide la tarea; y una línea en el *prompt* de sistema con las categorías disponibles.

6. **Alternativa: tu propio índice.** Si quieres controlar la búsqueda (con embeddings, permisos por usuario o tu ranking), define una herramienta normal que busque y devuelva bloques `tool_reference` dentro de un `tool_result`. La API carga esas definiciones igual que con su buscador; cada herramienta referenciada debe estar en `tools`, normalmente diferida.

```python title="busqueda_propia.py"
"""Búsqueda de herramientas propia: tu índice decide y la API carga lo que devuelves como tool_reference."""
import re

from rank_bm25 import BM25Okapi

from catalogo import CATALOGO, MAS_USADAS


def palabras(texto: str) -> list[str]:
    return re.findall(r"\w+", texto.lower().replace("_", " "))


indice = BM25Okapi([palabras(f"{t['name']} {t['description']}") for t in CATALOGO])
BUSCAR = {"name": "buscar_herramientas",
          "description": "Busca herramientas por lo que quieres hacer (p. ej. «anular una factura»). "
                         "Devuelve las más relevantes y las deja disponibles.",
          "input_schema": {"type": "object", "additionalProperties": False, "required": ["consulta"],
                           "properties": {"consulta": {"type": "string"}}}}
TOOLS = [BUSCAR] + [dict(t, defer_loading=t["name"] not in MAS_USADAS) for t in CATALOGO]


def buscar_herramientas(tool_use_id: str, consulta: str, k: int = 4) -> dict:
    puntos = indice.get_scores(palabras(consulta))
    mejores = sorted(range(len(CATALOGO)), key=lambda i: puntos[i], reverse=True)[:k]
    return {"type": "tool_result", "tool_use_id": tool_use_id,
            "content": [{"type": "tool_reference", "tool_name": CATALOGO[i]["name"]}
                        for i in mejores if puntos[i] > 0]}


if __name__ == "__main__":
    print(buscar_herramientas("toolu_1", "anular la factura de marzo"))
```

```text
{'type': 'tool_result', 'tool_use_id': 'toolu_1', 'content': [{'type': 'tool_reference', 'tool_name': 'facturas_anular_factura'}, {'type': 'tool_reference', 'tool_name': 'facturas_buscar_factura'}, {'type': 'tool_reference', 'tool_name': 'facturas_emitir_factura'}, {'type': 'tool_reference', 'tool_name': 'facturas_enviar_factura'}]}
```

   El BM25 sale de [`rank-bm25`](https://pypi.org/project/rank-bm25/) y la herramienta correcta sale primera. Es la misma técnica de la [[recetas/busqueda-hibrida-con-bm25|búsqueda híbrida]], aplicada a un catálogo de herramientas.

## Cómo comprobar que funciona

- Compara `usage.input_tokens` del primer turno con y sin carga diferida, sobre las mismas preguntas.
- Registra qué herramientas descubre en cada búsqueda (el agente del paso 3 las imprime). Si una herramienta necesaria no aparece nunca, mejora su nombre y su descripción.
- Monta un conjunto de 20–30 peticiones con la herramienta correcta anotada y mide la tasa de acierto en la elección antes y después. Una carga diferida que ahorra tokens pero elige peor no te sirve.
- Los scripts de esta receta se probaron con el simulador de la API (respuestas con búsqueda, resultado y llamada; y la búsqueda propia con `tool_reference`); los números de `medir.py` dependen de tus definiciones, por eso la salida es de ejemplo.

## Variaciones

- **Servidores MCP con el conector de la API.** No marques `defer_loading` en cada herramienta: ponlo en `default_config` de la entrada `mcp_toolset` o por herramienta en `configs` ([[docs/herramientas/07-mcp-desde-la-api]]).
- **Otro proveedor o un modelo abierto.** Sin búsqueda en el servidor, elige tú las herramientas: busca las k más relevantes para la petición y pasa solo esas en `tools`. Funciona con cualquier modelo, pero cambiar `tools` entre peticiones rompe la caché del prefijo.
- **Código en lugar de herramientas.** Con muchas llamadas encadenadas o resultados grandes, que el modelo escriba código que llama a las herramientas. La [llamada programática](https://www.anthropic.com/engineering/advanced-tool-use) redujo un 37 % los tokens en tareas de investigación complejas, y presentar servidores MCP como API de código redujo un ejemplo de 150.000 a 2.000 tokens ([*Code execution with MCP*](https://www.anthropic.com/engineering/code-execution-with-mcp), noviembre de 2025). Ver [[docs/herramientas/06-llamada-programatica]].
- **Skills.** Para instrucciones y procedimientos (no herramientas), la divulgación progresiva de las skills sigue la misma idea: solo nombre y descripción hasta que hacen falta ([[glosario/divulgacion-progresiva]]).

## Errores típicos

- **Diferirlo todo.** La API exige al menos una herramienta sin diferir, y las de uso constante deben estar siempre visibles: buscarlas en cada petición es un paso más.
- **Enviar solo las herramientas descubiertas.** Hay que enviar el catálogo completo en cada petición; la API resuelve las referencias contra él (una referencia a una herramienta que no está da 400).
- **Responder al `server_tool_use`.** No lleva `tool_result`; solo los `tool_use` de tus herramientas.
- **`cache_control` en una herramienta diferida.** 400. Muévelo.
- **Descripciones crípticas.** Si la búsqueda no entiende para qué sirve una herramienta, no la encontrará. Ver [[disciplinas/diseno-de-herramientas]].
- **Optimizar sin medir.** Con ocho herramientas cortas, la carga diferida solo añade latencia.
