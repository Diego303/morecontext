---
titulo: Técnicas avanzadas de recuperación
descripcion: Reescritura de consulta, multi-query, HyDE, compresión, documento padre, descomposición, self-querying y recuperación adaptativa, con cuándo compensa cada una y cuántas llamadas cuesta.
creado: 2026-10-29
orden: 5
minutos: 40
tipo: practica
objetivos:
  - Implementar multi-query con salida estructurada y fusionar sus resultados con RRF.
  - Convertir una pregunta en consulta semántica más filtros de metadatos validados en código.
  - Estimar el coste en llamadas y latencia de cada técnica antes de añadirla.
  - Elegir la técnica según el síntoma observado en las trazas.
requiere: ["[[cursos/rag-a-fondo/03-recuperar-bien]]", "[[recetas/fusionar-rankings-con-rrf]]"]
relacionados: ["[[glosario/reescritura-de-consulta]]", "[[glosario/hyde]]", "[[glosario/rrf]]", "[[recetas/chunks-padre-hijo]]", "[[glosario/multi-hop]]"]
tags: [rag, recuperacion, multi-query, hyde, consultas]
---

Al terminar sabrás qué hacer cuando la pregunta del usuario no es una buena consulta de búsqueda: reescribirla, multiplicarla, convertirla en un documento hipotético, partirla o extraer de ella filtros. También sabrás lo que cuesta cada técnica, porque casi todas añaden una llamada a un modelo antes de buscar, y esa latencia la paga el usuario en cada pregunta.

## La idea

La pregunta del usuario y el texto del documento se escriben de forma distinta. El usuario dice «¿cómo pido días libres?»; el manual dice «las vacaciones se solicitan en el portal de RRHH». Las técnicas de esta lección trabajan **antes de buscar** (transforman la consulta) o **después** (recortan o amplían lo recuperado). Ninguna arregla un índice malo: si la evidencia no está bien extraída y troceada, vuelve a [[cursos/rag-a-fondo/06-el-corpus-manda]].

```mermaid
flowchart LR
  P[Pregunta] --> T[Transformar consulta]
  T --> B[Buscar una o varias veces]
  B --> F[Fusionar RRF]
  F --> A[Ampliar o comprimir]
  A --> M[Modelo]
```

## Reescritura de consulta

En una conversación, «¿y cuánto sería en ese caso?» es una consulta inútil. La [[glosario/reescritura-de-consulta|reescritura]] le pide a un modelo (uno pequeño y rápido basta) que la convierta en una pregunta autónoma con el historial: «¿cuántos días de vacaciones corresponden a un empleado contratado el 1 de octubre?».

Es la técnica más rentable para asistentes conversacionales y la primera que deberías añadir si fallan las preguntas de seguimiento. Cuesta una llamada por turno. Dos cuidados: conserva literalmente códigos, nombres y números (díselo en el prompt y compruébalo), y registra en la traza la consulta reescrita junto a la original para poder depurar ([[recetas/depurar-un-rag]]).

## Multi-query y fusión

En vez de una consulta, generas varias reformulaciones, buscas con todas y fusionas con [[glosario/rrf|RRF]]. Ganas cobertura: si una reformulación usa el vocabulario del documento, lo encuentra. La pregunta original entra siempre, para no depender de que el modelo reformule bien.

```python title="multi_query.py"
import json

import anthropic
import numpy as np

from embed import embed            # embed() de juguete; en producción, tu modelo
from rrf import rrf                # la fusión de la receta de RRF

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

FRAGMENTOS = {
    "vac-solicitud": "Las vacaciones se solicitan en el portal de RRHH con 15 días de antelación.",
    "vac-dias": "Cada empleado dispone de 23 días laborables de vacaciones al año.",
    "permisos": "Los días libres por mudanza o matrimonio se piden en el portal como permiso retribuido.",
    "soporte": "El horario de soporte técnico es de 9:00 a 18:00.",
    "tele": "El teletrabajo se acuerda con el responsable del equipo.",
}
IDS = list(FRAGMENTOS)
MATRIZ = np.array(embed(list(FRAGMENTOS.values())), dtype=np.float32)


def buscar(consulta: str, k: int = 3) -> list[str]:
    sims = MATRIZ @ np.array(embed([consulta])[0], dtype=np.float32)
    return [IDS[i] for i in np.argsort(-sims)[:k]]


ESQUEMA = {
    "type": "object",
    "properties": {"consultas": {"type": "array", "items": {"type": "string"}}},
    "required": ["consultas"],
    "additionalProperties": False,
}


def variantes(pregunta: str, n: int = 3) -> list[str]:
    resp = client.messages.create(
        model=MODEL, max_tokens=300,
        system=(f"Reformula la pregunta en {n} consultas de búsqueda distintas para una base documental "
                "de RRHH. Usa sinónimos y el vocabulario de un documento oficial. No respondas la pregunta."),
        messages=[{"role": "user", "content": pregunta}],
        output_config={"format": {"type": "json_schema", "schema": ESQUEMA}},
    )
    if resp.stop_reason != "end_turn":
        return []                                   # sin variantes: se busca solo con la original
    texto = next(b.text for b in resp.content if b.type == "text")
    return [c for c in json.loads(texto)["consultas"] if c.strip()][:n]


def multi_query(pregunta: str, k: int = 3) -> list[tuple[str, float]]:
    consultas = [pregunta] + variantes(pregunta)    # la original siempre entra
    rankings = [buscar(c, k=10) for c in consultas]
    return rrf(rankings, top=k)


if __name__ == "__main__":
    pregunta = "¿Cómo pido días libres?"
    print("solo la original:", buscar(pregunta))
    print("multi-query + RRF:", [(d, round(p, 4)) for d, p in multi_query(pregunta)])
```

Con el simulador de la API devolviendo tres reformulaciones («procedimiento para solicitar vacaciones», «solicitud de vacaciones en el portal de RRHH», «permiso retribuido días libres»), la salida real es:

```text
solo la original: ['permisos', 'vac-dias', 'vac-solicitud']
multi-query + RRF: [('vac-solicitud', 0.0645), ('vac-dias', 0.0645), ('permisos', 0.0638)]
```

El fragmento que explica cómo se solicitan las vacaciones pasa del tercer puesto al primero. La salida estructurada (`output_config.format`) garantiza que la respuesta es una lista; aun así se valida en código, y si el modelo no termina bien se busca solo con la original. El coste: una llamada más y N búsquedas (baratas, y se pueden lanzar en paralelo). El riesgo: reformulaciones que derivan del tema y meten ruido. Por eso RRF y no la unión sin más.

## HyDE: buscar con una respuesta inventada

**[[glosario/hyde|HyDE]]** (*Hypothetical Document Embeddings*; Gao, Ma, Lin y Callan, [arXiv 2212.10496](https://arxiv.org/abs/2212.10496), 2022) pide al modelo un párrafo que *respondería* a la pregunta y vectoriza ese párrafo en lugar de la pregunta. La idea es que un documento hipotético se parece más a los documentos reales que una pregunta corta. El párrafo puede contener datos falsos; da igual, porque **solo se usa para buscar y nunca se muestra**.

Ayuda cuando las preguntas son cortas y los documentos largos y con un estilo muy marcado (técnico, legal). Falla cuando el modelo no sabe nada del dominio y su párrafo inventado apunta a otra parte, y con identificadores exactos (para eso, BM25). Cuesta una llamada con generación de texto antes de buscar: es de las técnicas más lentas de esta lista.

```python title="hyde_compresion.py"
import re

import anthropic
import numpy as np

from embed import embed

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()


def hyde(pregunta: str) -> list[float]:
    """HyDE: vectoriza un documento hipotético en lugar de la pregunta."""
    resp = client.messages.create(
        model=MODEL, max_tokens=200,
        system=("Escribe un párrafo breve con el estilo de un documento interno que respondería a la "
                "pregunta. Puede contener datos inventados: solo se usa para buscar, nunca se muestra."),
        messages=[{"role": "user", "content": pregunta}],
    )
    hipotetico = "".join(b.text for b in resp.content if b.type == "text")
    return embed([hipotetico])[0]


def comprimir(pregunta: str, fragmento: str, umbral: float = 0.2, max_frases: int = 3) -> str:
    """Compresión extractiva y barata: conserva las frases más parecidas a la pregunta, en su orden."""
    frases = [f for f in re.split(r"(?<=[.!?])\s+", fragmento) if f.strip()]
    sims = np.array(embed(frases), dtype=np.float32) @ np.array(embed([pregunta])[0], dtype=np.float32)
    mejores = sorted(i for i in np.argsort(-sims)[:max_frases] if sims[i] >= umbral)
    return " ".join(frases[i] for i in mejores) or fragmento    # si nada supera el umbral, no recortes


if __name__ == "__main__":
    seccion = ("La empresa revisa la política cada año. Las vacaciones se solicitan en el portal de RRHH "
               "con 15 días de antelación. El comité de empresa participa en la revisión. "
               "El responsable aprueba la solicitud en 5 días laborables.")
    print(comprimir("¿Con cuánta antelación solicito las vacaciones?", seccion, max_frases=2))
```

## Compresión contextual

Recuperas una sección de 1.500 tokens y solo 100 responden. La **compresión** recorta antes de llamar al modelo generador: menos tokens, menos coste y menos ruido. Hay dos formas:

- **Extractiva y barata** (la función `comprimir` de arriba): conserva las frases más parecidas a la pregunta, en su orden original. Salida real con una sección de cuatro frases: «Las vacaciones se solicitan en el portal de RRHH con 15 días de antelación. El responsable aprueba la solicitud en 5 días laborables.»
- **Con un modelo**: le pides que extraiga solo lo relevante. Más precisa y una llamada más por fragmento (o una por lote).

El riesgo es recortar la excepción que cambia la respuesta («salvo en el periodo de prueba»). Comprime solo si el contexto es grande de verdad y mide la [[glosario/fidelidad|fidelidad]] antes y después.

## Documento padre: ampliar después de buscar

La técnica contraria a comprimir: buscas con fragmentos pequeños y precisos y entregas la sección completa a la que pertenecen. Resuelve el caso «el fragmento es muy preciso pero está incompleto». Sin llamadas extra, solo más tokens de contexto. Está entera, con código, en [[recetas/chunks-padre-hijo]].

## Descomposición y preguntas multi-hop

«Compara la política de vacaciones de España con la de Portugal para empleados nuevos» son varias búsquedas: política España, política Portugal, condiciones de empleados nuevos. La **descomposición** pide al modelo las subpreguntas, recupera evidencia para cada una y entrega todo junto para la comparación final.

Las preguntas **[[glosario/multi-hop|multi-hop]]** son más difíciles porque la segunda búsqueda depende del resultado de la primera: «¿quién dirigía el departamento cuando se aprobó la política X?» exige encontrar la política, leer su fecha y buscar quién dirigía en esa fecha. Un top-k único no lo resuelve; hace falta un bucle en el que el modelo decide la siguiente búsqueda, que es el [[glosario/rag-agentico|RAG agéntico]] de [[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]].

## Self-querying: filtros a partir del lenguaje

Parte de una pregunta no es semántica: «contratos **de 2026** del departamento **legal**» contiene dos filtros de [[glosario/metadatos|metadatos]]. El *self-querying* pide al modelo que separe la consulta semántica de los filtros, con un esquema cerrado.

```python title="self_query.py"
import json

import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

DEPARTAMENTOS = ["legal", "rrhh", "ventas", "soporte"]
ESQUEMA = {
    "type": "object",
    "properties": {
        "consulta": {"type": "string"},                                   # lo que se busca por similitud
        "departamento": {"type": "string", "enum": DEPARTAMENTOS + ["ninguno"]},
        "anio": {"type": "integer"},                                      # 0 = sin filtro de año
    },
    "required": ["consulta", "departamento", "anio"],
    "additionalProperties": False,
}


def self_query(pregunta: str, filtros_obligatorios: dict) -> tuple[str, dict]:
    resp = client.messages.create(
        model=MODEL, max_tokens=200,
        system=("Separa la pregunta en una consulta de búsqueda semántica y filtros de metadatos. "
                "Si la pregunta no fija departamento usa \"ninguno\"; si no fija año, 0. No inventes filtros."),
        messages=[{"role": "user", "content": pregunta}],
        output_config={"format": {"type": "json_schema", "schema": ESQUEMA}},
    )
    if resp.stop_reason != "end_turn":
        return pregunta, dict(filtros_obligatorios)
    datos = json.loads(next(b.text for b in resp.content if b.type == "text"))
    filtros = {}
    if datos["departamento"] in DEPARTAMENTOS:      # valida en código aunque el esquema ya acote
        filtros["departamento"] = datos["departamento"]
    if 2000 <= datos["anio"] <= 2100:
        filtros["anio"] = datos["anio"]
    # los filtros de seguridad NO salen del modelo: se imponen siempre y no se pueden pisar
    return datos["consulta"] or pregunta, {**filtros, **filtros_obligatorios}


if __name__ == "__main__":
    print(self_query("¿Qué contratos de 2026 tiene el departamento legal?", {"tenant_id": "acme"}))
```

```text
('contratos', {'departamento': 'legal', 'anio': 2026, 'tenant_id': 'acme'})
```

> [!peligro] Los filtros del modelo afinan; los de seguridad se imponen
> El modelo puede proponer filtros de tema, fecha o departamento, siempre de una lista cerrada y validados en código. El cliente, el usuario y sus permisos **nunca** salen de la pregunta ni del modelo: vienen de la sesión autenticada y se aplican por encima. Si no, «muéstrame los contratos de la empresa B» se convierte en un filtro. Lo ves a fondo en [[cursos/rag-a-fondo/07-permisos-y-multi-tenant]].

## Recuperación adaptativa

No todas las preguntas necesitan el mismo pipeline. «¿Cuál es el horario de soporte?» se resuelve con un top-3; una comparación entre países necesita descomposición, varias búsquedas y reranking. La **recuperación adaptativa** decide la ruta por pregunta: con reglas baratas (longitud, palabras como «compara» o «diferencia», presencia de un código) o con un clasificador pequeño. Es el patrón de [[patrones/04-enrutado]] aplicado a la recuperación. Ahorra latencia en las preguntas fáciles, que suelen ser la mayoría, y concentra el gasto donde hace falta.

## Cuánto cuesta cada técnica

| Técnica | Llamadas extra al modelo | Cuándo compensa |
|---|---|---|
| Reescritura con historial | 1 por turno | asistentes conversacionales; fallan los seguimientos |
| Multi-query | 1 (y N búsquedas) | vocabulario del usuario lejos del documento |
| HyDE | 1 con generación de un párrafo | preguntas cortas, documentos largos y especializados |
| Compresión con modelo | 1 por fragmento o lote | contextos grandes con poca densidad útil |
| Compresión extractiva | 0 | lo mismo, cuando basta con quitar frases |
| Documento padre | 0 (más tokens de contexto) | fragmentos precisos pero incompletos |
| Descomposición | 1 (y una búsqueda por subpregunta) | comparaciones y preguntas compuestas |
| Self-querying | 1 | preguntas con fechas, categorías o tipos explícitos |
| Recuperación adaptativa | 0 o 1 (el enrutado) | tráfico mixto de preguntas fáciles y difíciles |

Cada llamada previa a la búsqueda suma su latencia completa antes de que empiece la generación. Para las transformaciones de consulta usa un modelo rápido (Haiku 5.5 o un modelo abierto pequeño) y mide con el banco de [[cursos/rag-a-fondo/10-evaluar-un-rag]] si la mejora de [[glosario/recall-at-k|recall@k]] paga la latencia.

## Errores frecuentes

- **Añadir técnicas sin síntoma.** Cada una tiene coste; elige por lo que ves en las trazas.
- **Perder la consulta original.** En multi-query y reescritura, la original siempre entra y siempre se registra.
- **Mostrar el documento hipotético de HyDE** o el contexto generado como si fueran fuentes.
- **Dejar que el modelo ponga los filtros de seguridad.** Afinar sí; autorizar, nunca.
- **Comprimir sin medir.** Una frase recortada puede ser la excepción que cambia la respuesta.

## Ejercicio

> [!ejercicio] Elige con datos
> Con tu banco de evaluación, ejecuta cuatro variantes: búsqueda simple, reescritura (si tienes preguntas de seguimiento), multi-query con tres reformulaciones y HyDE. Para cada una, mide recall@5 y la latencia media añadida antes de la búsqueda.
>
> Está bien si tienes una tabla con recall@5 y latencia por variante, si identificas al menos dos preguntas que mejoran y una que empeora con cada técnica, y si decides qué técnica dejas activa justificándolo con la tabla.

> [!ejercicio]- Pistas
> Lanza las búsquedas de multi-query en paralelo para no multiplicar la latencia. Si HyDE empeora con preguntas que contienen códigos, combínalo con BM25 sobre la pregunta original en lugar de sustituirla.

## Resumen

- Las técnicas actúan antes de buscar (transformar la consulta) o después (comprimir o ampliar).
- Reescritura y multi-query suelen ser las primeras en rendir; la original siempre entra.
- HyDE busca con una respuesta inventada que nunca se muestra.
- Self-querying saca filtros de la pregunta, de listas cerradas; los permisos vienen de la sesión.
- Casi todas cuestan una llamada más: mide si el recall que ganas paga la latencia.

## Para seguir

- [[cursos/rag-a-fondo/06-el-corpus-manda]]
- [[recetas/chunks-padre-hijo]]
- [[recetas/fusionar-rankings-con-rrf]]
- [[cursos/rag-a-fondo/09-cuando-el-rag-vectorial-no-basta]]
