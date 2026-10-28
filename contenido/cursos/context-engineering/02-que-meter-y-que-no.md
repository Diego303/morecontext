---
titulo: Qué meter en el contexto y qué no
descripcion: Criterios para el prompt de sistema, las herramientas, los ejemplos y los resultados de herramientas, y cómo cargar información bajo demanda en lugar de precargarla.
creado: 2026-10-07
orden: 2
minutos: 45
tipo: practica
objetivos:
  - Aplicar el criterio del mínimo conjunto de tokens de alta señal a cada componente del contexto
  - Implementar resultados de herramientas recortados, filtrados y paginados
  - Decidir entre precargar información y recuperarla bajo demanda con referencias ligeras
requiere: ["[[cursos/context-engineering/01-el-contexto-como-presupuesto]]"]
relacionados: ["[[modelos/02-ingenieria-de-contexto]]", "[[disciplinas/diseno-de-herramientas]]", "[[docs/prompting/01-prompt-de-sistema]]", "[[glosario/rag]]"]
tags: [contexto, herramientas, prompting]
---

Al terminar esta lección sabrás revisar cada componente del contexto de un agente con un criterio único y aplicarlo: qué sobra en el prompt de sistema, qué herramientas quitar, qué ejemplos dejar y cómo hacer que los resultados de herramientas ocupen una fracción de lo que ocupan hoy.

## La idea

*[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)* (Anthropic, 2025) resume el objetivo en una frase: encontrar **el conjunto más pequeño posible de tokens de alta señal** que maximice la probabilidad del resultado que buscas. Cada token que entra debe ganarse el sitio. Si quitarlo no cambiaría el comportamiento, sobra; si añade ruido, resta.

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

## Para seguir

- [[cursos/context-engineering/03-compactacion-y-memoria]]
- [[disciplinas/diseno-de-herramientas]]
- [[cursos/rag-a-fondo/index]]
