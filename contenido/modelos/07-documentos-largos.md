---
titulo: Trabajar con documentos largos
descripcion: Dónde colocar los documentos en el prompt, cómo pedir citas, por qué extraer antes de razonar y cuándo trocear frente a usar contexto largo.
creado: 2026-10-14
actualizado: 2026-10-29
orden: 7
tags: [documentos, contexto-largo, citas, modelos]
relacionados: ["[[glosario/contexto-largo]]", "[[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]", "[[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]]", "[[modelos/02-ingenieria-de-contexto]]"]
---

**Principio**: pon los documentos al principio, la pregunta al final, y pide al modelo que localice las citas relevantes antes de responder.

## Por qué funciona

Con documentos largos, el reto es que el modelo encuentre y use la parte que importa. Tres hechos explican las técnicas de esta página:

- **La posición importa.** [Liu et al. (2023)](https://arxiv.org/abs/2307.03172), en *Lost in the Middle* ([[biblioteca/lost-in-the-middle]]), mostraron que los modelos aprovechan mejor la información al principio y al final del contexto que la situada en medio. Los modelos han mejorado, pero el efecto de la posición sigue siendo una buena razón para ordenar bien.
- **La pregunta al final ayuda.** Con la consulta detrás de los documentos, el modelo los lee sabiendo ya qué contienen y responde con todo a la vista justo antes de generar.
- **Extraer antes de razonar reduce el ruido.** Si el modelo primero copia los fragmentos relevantes, razona sobre un texto corto en lugar de sobre cien páginas.

## Ubicación y estructura

Envuelve cada documento en etiquetas con sus metadatos y coloca todos arriba:

```text title="Antes"
Responde a la pregunta del cliente sobre su contrato.
Pregunta: ¿puedo cancelar sin penalización en el primer año?
Contrato: [40 páginas]
Anexo de tarifas: [10 páginas]
```

```text title="Después"
<documentos>
<documento id="contrato">
<fuente>Contrato de servicio, versión 2026-03</fuente>
<contenido>[40 páginas]</contenido>
</documento>
<documento id="anexo">
<fuente>Anexo de tarifas</fuente>
<contenido>[10 páginas]</contenido>
</documento>
</documentos>

Primero, copia en <citas> los fragmentos literales de los documentos que traten sobre
cancelación o penalizaciones, cada uno como <cita doc="id">texto literal</cita>.
Después, responde en <respuesta> usando solo esas citas. Si no bastan, dilo.

Pregunta del cliente: ¿puedo cancelar sin penalización en el primer año?
```

Los identificadores permiten citar y comprobar. Las etiquetas `<citas>` y `<respuesta>` separan la extracción de la respuesta, y te dejan mostrar solo la segunda al usuario.

## Citas verificables

Pedir citas literales tiene una ventaja que va más allá de la calidad: **puedes comprobarlas con código**. Si la cita no aparece tal cual en el documento, el modelo se la ha inventado.

```python title="verificar_citas.py"
import re

def citas_no_encontradas(salida: str, documentos: dict[str, str]) -> list[str]:
    bloque = re.search(r"<citas>(.*?)</citas>", salida, re.S)
    if not bloque:
        return ["No hay bloque <citas>"]
    fallos = []
    for doc_id, cita in re.findall(r'<cita doc="([^"]+)">(.*?)</cita>', bloque.group(1), re.S):
        texto = documentos.get(doc_id, "")
        if " ".join(cita.split()) not in " ".join(texto.split()):  # normaliza espacios
            fallos.append(f"{doc_id}: {cita[:60]}…")
    return fallos
```

La función espera el formato `<cita doc="id">…</cita>` que pide el prompt de arriba. La API también ofrece una función de citas nativa para documentos (`"citations": {"enabled": true}` en el bloque `document`); no se puede combinar con salidas estructuradas. Consulta los detalles en la [documentación oficial](https://platform.claude.com/docs). La lección [[roadmap/30-contexto-y-rag/05-respuestas-con-citas]] y el sistema [[sistemas/rag-con-citas]] desarrollan el flujo completo.

## Trocear o usar contexto largo

Las ventanas de contexto actuales admiten documentos muy largos: los modelos de Claude de la familia 5.x tienen 1M de tokens, y una petición admite hasta 600 imágenes o páginas de PDF. Que quepan no significa que meterlos enteros sea siempre lo mejor: el rendimiento baja a medida que crece la entrada ([[glosario/context-rot]]), y la comparación entre contexto largo y recuperación no tiene un ganador fijo ([Li et al., 2024](https://arxiv.org/abs/2407.16833); [LaRA, 2025](https://arxiv.org/abs/2502.09977)).

| Situación | Mejor opción | Por qué |
|---|---|---|
| Un documento que hay que entender entero (un contrato, un informe) | Contexto largo | Las relaciones entre secciones importan. |
| Pocas consultas sobre un documento | Contexto largo con [[glosario/prompt-caching]] | Sencillo; la caché abarata las consultas repetidas. |
| Muchos documentos, cada pregunta toca pocos | [[glosario/rag]] con [[glosario/chunking]] | Solo entra lo relevante: menos coste y menos ruido. |
| Corpus que cambia a menudo | RAG | Reindexas lo nuevo; no reenvías todo. |
| Resumir algo más largo que la ventana | Trocear y resumir por partes, luego combinar | No hay otra forma. |

La entrada del radar [[radar/2026-09-22-contexto-largo-no-sustituye-recuperacion]] explica por qué las ventanas grandes no hacen innecesaria la recuperación.

## Preguntas sobre varios documentos

Cuando la tarea compara o combina documentos, pide que los trate por separado antes de cruzarlos:

```text title="Después"
Para cada documento de <documentos>, extrae en <hallazgos id="..."> lo que dice sobre plazos de entrega.
Después, en <comparacion>, señala dónde coinciden y dónde se contradicen.
```

Así evitas que el modelo mezcle lo que dice un documento con lo que dice otro.

## Cuándo no aplica

- **Documentos cortos**: con una página, el orden importa poco y extraer citas antes es un paso de más.
- **Respuestas creativas** inspiradas en un texto, donde no buscas fidelidad literal.
- **Latencia crítica**: la extracción previa añade tokens de salida. Valora si basta con pedir la respuesta directa con referencias al documento.

## Para seguir

- [[modelos/02-ingenieria-de-contexto]]: el orden del contexto en general.
- [[docs/contexto/03-rag]]: cuándo y cómo recuperar.
- [[cursos/rag-a-fondo/index]]: el curso completo de recuperación.
- [[recetas/rag-minimo-viable]]: un RAG funcionando en una tarde, cuando trocear gana.
