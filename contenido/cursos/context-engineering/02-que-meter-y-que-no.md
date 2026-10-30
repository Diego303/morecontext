---
titulo: Qué meter en el contexto y qué no
descripcion: Criterios para el prompt de sistema, las herramientas, los ejemplos y los resultados de herramientas, y cómo cargar información bajo demanda en lugar de precargarla.
creado: 2026-10-07
actualizado: 2026-10-29
orden: 2
minutos: 45
tipo: practica
objetivos:
  - Aplicar el criterio del mínimo conjunto de tokens de alta señal a cada componente del contexto
  - Implementar resultados de herramientas recortados, filtrados y paginados
  - Decidir entre precargar información y recuperarla bajo demanda con referencias ligeras y herramientas diferidas
  - Aplicar las lecciones de Manus sobre caché KV, herramientas enmascaradas y compresión restaurable
requiere: ["[[cursos/context-engineering/01-el-contexto-como-presupuesto]]"]
relacionados: ["[[modelos/02-ingenieria-de-contexto]]", "[[disciplinas/diseno-de-herramientas]]", "[[docs/prompting/01-prompt-de-sistema]]", "[[glosario/rag]]", "[[docs/herramientas/05-busqueda-y-carga-diferida]]"]
tags: [contexto, herramientas, prompting]
---

Al terminar esta lección sabrás revisar cada componente del contexto de un agente con un criterio único y aplicarlo: qué sobra en el prompt de sistema, qué herramientas quitar, qué ejemplos dejar y cómo hacer que los resultados de herramientas ocupen una fracción de lo que ocupan hoy.

## La idea

*[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)* (Anthropic, 29 sept. 2025) resume el objetivo en una frase: encontrar **el conjunto más pequeño posible de tokens de alta señal** que maximice la probabilidad del resultado que buscas. Cada token que entra debe ganarse el sitio. Si quitarlo no cambiaría el comportamiento, sobra; si añade ruido, resta.

Ese criterio se aplica de forma distinta a cada componente.

## El prompt de sistema: la altura correcta

El artículo describe dos fallos opuestos. Por un lado, prompts que codifican lógica rígida con reglas tipo «si pasa X, haz Y», frágiles y difíciles de mantener. Por otro, prompts vagos que dan orientación de alto nivel y presuponen un contexto compartido que el modelo no tiene. La altura correcta está entre los dos: **lo bastante concreto para guiar, lo bastante flexible para que el modelo aplique criterio**.

En la práctica:

- Organiza en secciones con etiquetas XML o títulos Markdown (`<instrucciones>`, `<contexto>`, `## Herramientas`).
- Empieza por lo mínimo con el mejor modelo disponible, prueba, y añade instrucciones solo para los fallos que observes.
- Explica el porqué de cada regla. Una regla con motivo generaliza a casos que no previste.

Lo tienes desarrollado en [[docs/prompting/01-prompt-de-sistema]] y [[modelos/02-ingenieria-de-contexto]].

## Herramientas: pocas y sin solapamiento

Cada herramienta ocupa contexto en todas las llamadas y es una decisión que el modelo puede tomar mal. El artículo de Anthropic señala como fallo frecuente los conjuntos de herramientas inflados, con funciones que se solapan o que no dejan claro cuál usar. La prueba que propone es útil: **si un ingeniero humano no sabría decir con seguridad qué herramienta usar en una situación, el agente tampoco**.

- Fusiona herramientas que hacen casi lo mismo (`buscar_cliente_por_email` y `buscar_cliente_por_id` → `buscar_cliente` con un campo de filtro).
- Quita las que el agente no usa en tus trazas.
- Escribe descripciones que digan cuándo usarla y qué devuelve, no solo qué hace ([[disciplinas/diseno-de-herramientas]]).

### Herramientas bajo demanda

¿Y si de verdad necesitas muchas? Con varios [[glosario/servidor-mcp|servidores MCP]] conectados es fácil tener decenas de herramientas y miles de tokens de definiciones en cada llamada, se usen o no. La [[glosario/carga-diferida-de-herramientas|carga diferida]] lo resuelve: marcas las herramientas con `defer_loading: true`, dejas sin diferir una herramienta de búsqueda y las tres a cinco que más se usan, y el modelo busca las demás cuando las necesita. La API inserta la definición en ese momento sin tocar el prefijo de `tools`, así que la caché se conserva.

```python nocheck title="herramientas diferidas (fragmento)"
tools = [
    {"type": "tool_search_tool_bm25_20251119", "name": "tool_search_tool_bm25"},  # nunca diferida
    {"name": "buscar_cliente", ...},                         # de uso constante: sin diferir
    {"name": "anular_factura", ..., "defer_loading": True},  # se carga solo si el modelo la busca
    # ...cientos más con defer_loading
]
```

Anthropic publicó en *[Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use)* (nov. 2025) una reducción del 85 % en tokens de definiciones en su evaluación interna. Compensa a partir de unas 10 herramientas o 10.000 tokens de definiciones; con pocas herramientas que se usan siempre, no. El detalle está en [[docs/herramientas/05-busqueda-y-carga-diferida]] y el caso práctico en [[recetas/carga-diferida-de-herramientas]].

Un paso más es no exponer las herramientas como llamadas sino como código. En *[Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)* (4 nov. 2025), Anthropic propone presentar cada servidor MCP como archivos de una API en un *sandbox* (`./servers/google-drive/getDocument.ts`): el agente lista y lee solo lo que necesita, escribe un programa que encadena llamadas y filtra los datos, y al contexto llega el resultado final en lugar de cada respuesta intermedia. Su ejemplo pasa de unos 150.000 tokens a unos 2.000. El precio es un entorno de ejecución que tienes que aislar y vigilar. En la API de Claude, la versión gestionada de esta idea es la [[glosario/llamada-programatica|llamada programática de herramientas]] ([[docs/herramientas/06-llamada-programatica]]).

## Ejemplos: canónicos, no exhaustivos

Los ejemplos *few-shot* funcionan muy bien ([[roadmap/10-prompting/02-ejemplos-few-shot]]). El error es usarlos para cubrir todos los casos límite: una lista larga de ejemplos dispersos ocupa mucho y el modelo puede copiar detalles superficiales. Elige pocos ejemplos diversos y representativos del comportamiento que quieres.

## Resultados de herramientas: donde está el gasto

Como viste en la lección anterior, los resultados de herramientas suelen ser la mayor parte del contexto. Aquí está la palanca más grande, y la controlas tú en el código de la herramienta. Cuatro técnicas:

1. **Devuelve solo los campos útiles.** Una API devuelve 40 campos por registro; el agente necesita 5.
2. **Limita y pagina.** Devuelve los primeros N resultados y una forma de pedir más.
3. **Recorta con sentido.** En logs, el final; en documentos, el fragmento relevante; nunca un corte arbitrario sin avisar.
4. **Di qué has recortado.** «Mostrando 20 de 1.340; usa `pagina=2` o afina el filtro». El modelo puede actuar con esa información.

```python tab="Python" title="resultados.py"
import json

MAX_CARACTERES = 6000
CAMPOS = ("id", "titulo", "estado", "actualizado", "responsable")

def formatear(registros: list[dict], pagina: int = 1, por_pagina: int = 20,
              campos: tuple[str, ...] = CAMPOS) -> str:
    total = len(registros)
    inicio = (pagina - 1) * por_pagina
    trozo = [{k: r.get(k) for k in campos} for r in registros[inicio:inicio + por_pagina]]
    texto = "\n".join(json.dumps(r, ensure_ascii=False) for r in trozo)
    if len(texto) > MAX_CARACTERES:
        texto = texto[:MAX_CARACTERES] + "\n[recortado por longitud]"
    fin = min(inicio + por_pagina, total)
    pie = f"\nMostrando {inicio + 1}-{fin} de {total}."
    if fin < total:
        pie += f" Pide pagina={pagina + 1} para ver más, o afina el filtro."
    return (texto or "Sin resultados.") + pie

def recortar_log(salida: str, max_lineas: int = 80) -> str:
    lineas = salida.splitlines()
    errores = [l for l in lineas if any(p in l for p in ("ERROR", "FAILED", "Traceback"))]
    final = lineas[-max_lineas:]
    cabecera = f"[{len(lineas)} líneas; se muestran las líneas de error y las últimas {len(final)}]"
    return "\n".join([cabecera, *errores[:20], "...", *final])
```

```ts tab="TypeScript" title="resultados.ts"
const MAX_CARACTERES = 6000;
const CAMPOS = ["id", "titulo", "estado", "actualizado", "responsable"];

export function formatear(registros: Record<string, unknown>[], pagina = 1, porPagina = 20): string {
  const total = registros.length;
  const inicio = (pagina - 1) * porPagina;
  const trozo = registros.slice(inicio, inicio + porPagina)
    .map((r) => Object.fromEntries(CAMPOS.map((k) => [k, r[k] ?? null])));
  let texto = trozo.map((r) => JSON.stringify(r)).join("\n");
  if (texto.length > MAX_CARACTERES) texto = texto.slice(0, MAX_CARACTERES) + "\n[recortado por longitud]";
  const fin = Math.min(inicio + porPagina, total);
  let pie = `\nMostrando ${inicio + 1}-${fin} de ${total}.`;
  if (fin < total) pie += ` Pide pagina=${pagina + 1} para ver más, o afina el filtro.`;
  return (texto || "Sin resultados.") + pie;
}
```

Expón `pagina` como parámetro opcional en el `input_schema` de la herramienta para que el modelo pueda pedir más. Elige el formato con criterio: una línea JSON por registro es compacta y fácil de leer para el modelo; una tabla Markdown también funciona. Lo que no funciona es el JSON indentado de una API devuelto tal cual.

## Precargar o recuperar bajo demanda

Hay dos estrategias para dar información al agente, y el artículo de Anthropic las contrasta. La tradicional precarga todo lo que podría ser relevante, por ejemplo con [[glosario/rag|RAG]] antes de la llamada. La alternativa es la recuperación **justo a tiempo**: el agente mantiene identificadores ligeros (rutas de archivos, consultas guardadas, enlaces) y carga los datos con herramientas cuando los necesita. Los propios metadatos orientan: un archivo llamado `tests/test_facturas.py` dice mucho antes de abrirlo.

| | Precargar | Bajo demanda |
|---|---|---|
| Velocidad | Respuesta en una llamada | Varios pasos |
| Contexto | Ocupa aunque no se use | Crece con lo necesario |
| Riesgo | Ruido, información irrelevante | El agente no busca lo que necesita |
| Encaja con | Información pequeña y casi siempre necesaria; tareas de un paso | Corpus grandes; agentes que exploran |

El artículo sugiere que lo más eficaz suele ser un **híbrido**: precargar algo de información para ir rápido (como hace un archivo de memoria del proyecto, [[cursos/agentes-de-codigo/02-contexto-del-repositorio]]) y dejar que el agente explore el resto.

## Lo que enseñó Manus en producción

Yichao «Peak» Ji contó en *[Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)* (jul. 2025) lo que aprendieron tras rehacer varias veces el agente de Manus. Tres lecciones cambian cómo montas el contexto:

- **Diseña para la caché KV.** En un agente la entrada pesa mucho más que la salida (en su caso, del orden de 100 a 1), así que el porcentaje de aciertos de caché decide coste y latencia. Prefijo estable (nada de la hora al principio del prompt de sistema), contexto que solo crece por el final y serialización determinista: un JSON con las claves en otro orden ya es otro prefijo ([[glosario/kv-cache|caché KV]], [[docs/contexto/02-prompt-caching]]).
- **Enmascara, no quites.** Añadir o quitar herramientas a mitad de tarea invalida la caché de todo lo que va detrás de ellas y confunde al modelo si el historial menciona herramientas que ya no existen. En lugar de cambiar la lista, restringe qué puede elegir en cada paso. En la API de Claude tienes `tool_choice: none` para un paso sin herramientas, la carga diferida de arriba y los [[glosario/mensaje-de-sistema-intermedio|mensajes de sistema a mitad de conversación]], que cambian instrucciones sin tocar el prefijo ([[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]).
- **Compresión restaurable.** Cuando saques algo del contexto, deja con qué recuperarlo: la URL de una página, la ruta de un archivo. El sistema de archivos pasa a ser memoria ilimitada que el agente consulta. Es lo que hacen el marcador de `limpiar_resultados` de la lección siguiente y el «Pide pagina=2» de `formatear`.

Otras dos de su lista que verás en el curso: recitar el plan con un `todo.md` que el agente reescribe al final del contexto, para que el objetivo no se pierda en medio, y **dejar los errores en el contexto**, porque ver la acción fallida y su error es lo que evita que el modelo la repita.

## Orden y estructura

Lo que entra también tiene que estar bien colocado. Documentos largos arriba y la pregunta al final; cada documento en su etiqueta con metadatos (`<documento fuente="..." fecha="...">`); instrucciones separadas de datos. Esto ayuda al modelo a localizar cada cosa y reduce el efecto de la posición que viste en la lección anterior ([[modelos/07-documentos-largos]]).

> [!aviso] Datos no son instrucciones
> Todo lo que llega de herramientas (páginas web, correos, documentos) es dato, y puede contener texto que parece una orden. Mantén la separación con etiquetas y no des a esos datos la autoridad del prompt de sistema ([[docs/seguridad/01-prompt-injection]]).

## Errores frecuentes

- **Añadir una regla por cada fallo sin revisar las anteriores.** El prompt crece hasta contradecirse.
- **Herramientas que devuelven la respuesta cruda de una API.** El contexto se llena de campos que nadie usa.
- **Recortar sin avisar.** El modelo cree que tiene todos los datos y concluye mal.
- **Precargar «por si acaso».** Ruido que paga cada llamada.

## Ejercicio

> [!ejercicio] Adelgazar un agente
> Toma el desglose de tokens de tu agente de la lección anterior. Aplica tres cambios: elimina o fusiona al menos una herramienta, pasa la herramienta más cara por `formatear` o `recortar_log`, y reescribe el prompt de sistema en secciones etiquetadas. Repite la medición con la misma tarea.
> Está bien si: el total de tokens del paso final baja de forma clara, la tarea se sigue resolviendo correctamente en al menos tres ejecuciones, y en la traza el agente usa la paginación cuando necesita más resultados.

> [!ejercicio]- Pistas
> Para saber qué campos necesita el agente, mira en las trazas qué campos cita en sus pasos siguientes. Lo que nunca cita es candidato a desaparecer.

## Resumen

- Criterio único: el mínimo conjunto de tokens de alta señal.
- Prompt de sistema a la altura correcta: concreto, con motivos y por secciones.
- Pocas herramientas, sin solapamiento; ejemplos canónicos.
- Resultados de herramientas filtrados, paginados y con aviso de recorte.
- Híbrido entre precarga y recuperación bajo demanda; datos separados de instrucciones.
- Muchas herramientas: carga diferida o código. Prefijo estable, enmascarar en vez de quitar y compresión restaurable.

## Para seguir

- [[cursos/context-engineering/03-compactacion-y-memoria]]
- [[disciplinas/diseno-de-herramientas]]
- [[cursos/rag-a-fondo/index]]
- [[recetas/carga-diferida-de-herramientas]]
