---
titulo: Medir el valor de la IA
descripcion: Cómo medir si un caso de uso de IA mejora el negocio, con línea base antes del piloto, métricas de negocio frente a métricas del modelo y una ficha de métricas lista para usar.
creado: 2026-10-29
orden: 4
minutos: 25
tipo: teoria
objetivos:
  - Elegir para un caso de uso una métrica de negocio principal y al menos dos guardarraíles.
  - Medir una línea base antes del piloto y compararla con el piloto usando mediana y percentiles.
  - Distinguir las métricas de producto de las métricas del modelo y conectar estas últimas con evals.
requiere: ["[[cursos/ia-en-la-empresa/03-donde-esta-el-valor]]"]
tags: [empresa, metricas, evals]
relacionados: ["[[roadmap/80-evals/01-por-que-evals]]", "[[cursos/evals-para-agentes/01-que-medir]]", "[[disciplinas/evals]]", "[[docs/produccion/02-costes-y-limites]]"]
---

Al terminar esta lección sabrás responder con datos a la única pregunta que importa después de un piloto: ¿qué ha mejorado en el negocio? Tendrás una ficha de métricas para tu caso y sabrás leer una comparación sin engañarte.

## La idea

Una IA es valiosa cuando puedes decir qué ha mejorado y cuánto, comparado con antes. Si la respuesta es «la gente está contenta» o «se nota más ágil», no lo sabes.

La percepción engaña incluso a expertos. En un ensayo aleatorizado de METR con desarrolladores experimentados de proyectos de código abierto, las tareas hechas con ayuda de IA tardaron un 19 % más; los participantes esperaban ir más rápido y, al terminar, seguían creyendo que lo habían hecho ([METR, julio de 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)). En febrero de 2026, METR cambió el diseño de su experimento y advirtió de lo difícil que es medir esto bien: muchos desarrolladores ya no querían trabajar sin IA ([We are Changing our Developer Productivity Experiment Design](https://evals.alignment.org/blog/2026-02-24-uplift-update/)). Quédate con la lección y no con el porcentaje, que corresponde a un contexto muy concreto: **medir y preguntar dan resultados distintos**.

## Qué medir: cinco familias

| Familia | Ejemplos | Trampa habitual |
|---|---|---|
| Tiempo | Minutos por caso, horas de búsqueda | Contar «horas ahorradas» por encuesta en vez de medir el tiempo por caso |
| Coste | Coste por operación (ticket, factura, propuesta) | Olvidar el coste del sistema y el de la revisión humana |
| Calidad | Errores, reprocesos, tickets reabiertos, quejas | Medir solo la velocidad y no ver que la calidad cae |
| Velocidad | Tiempo de respuesta y de resolución para el cliente | Confundir lo que tarda el empleado con lo que espera el cliente |
| Ingresos | Conversión, retención, ventas | Atribuir a la IA lo que fue estacionalidad o una campaña |

El coste por operación tiene que incluir todo: el tiempo de las personas, los [[glosario/token|tokens]] del sistema ([[roadmap/00-fundamentos/05-coste-y-latencia]]), la infraestructura y los minutos de quien revisa. Un borrador que ahorra cinco minutos de redacción y añade cuatro de revisión ahorra uno.

## Una forma de pensarlo

```text title="Valor de un caso de uso"
valor ≈ capacidad del modelo × calidad de los datos × calidad de la integración × importancia del proceso
```

Sirve para pensar, no para calcular. Es una multiplicación, así que un factor cerca de cero anula los demás. Un modelo extraordinario conectado a un proceso irrelevante produce poco; un modelo bueno con datos limpios, bien integrado en un proceso importante, produce mucho. Casi siempre, el factor más débil es la calidad de los datos o la integración, no el modelo.

## La línea base, antes del piloto

Sin línea base, cualquier cifra del piloto flota en el vacío. Antes de construir:

1. **Define la unidad**: ticket resuelto, factura procesada, propuesta enviada.
2. **Define la métrica con precisión**: desde qué evento hasta qué evento se mide el tiempo, qué cuenta como reapertura.
3. **Mide el proceso actual** durante un periodo comparable al del piloto, con la misma definición y de la misma fuente de datos.
4. **Segmenta**: por tipo de caso, canal o complejidad. Una mejora en los fáciles puede esconder un empeoramiento en los difíciles.
5. **Busca un grupo de control** si puedes: parte del equipo con la herramienta y parte sin ella, en las mismas semanas. Así separas el efecto de la IA del de la estacionalidad o del efecto novedad.

Decide también, antes de empezar, el umbral de éxito y los guardarraíles. La guía de OpenAI [*Optimizing LLM Accuracy*](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy) propone una idea útil para fijarlo: asignar un coste a cada tipo de error y un valor a cada acierto, y calcular a partir de qué precisión el sistema compensa. Así «suficientemente bueno» deja de ser una opinión.

## Métricas de producto frente a métricas del modelo

Hay dos familias de métricas y necesitas las dos.

| Nivel | Pregunta | Ejemplos | Cuándo se mide |
|---|---|---|---|
| Negocio | ¿Mejoró el proceso? | Tiempo de resolución, coste por ticket, reaperturas | En el piloto y en producción |
| Uso | ¿Se usa y cómo? | Borradores aceptados sin cambios, ediciones, abandono | En el piloto y en producción |
| Modelo y sistema | ¿Responde bien? | Fidelidad a las fuentes, citas válidas, acierto de clasificación, recuperación | Antes de cada cambio, con [[glosario/evals\|evals]] |
| Operación | ¿Cuánto cuesta y tarda? | Coste por llamada, [[glosario/latencia\|latencia]], errores, `stop_reason` | Siempre, con [[glosario/observabilidad\|observabilidad]] |

Las métricas del modelo se miden con un [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] antes de desplegar: te dicen si un cambio de prompt, de modelo o de índice mejora o empeora ([[roadmap/80-evals/index]]; para RAG, [[cursos/rag-a-fondo/10-evaluar-un-rag]]). Las de negocio solo se ven con usuarios reales. Una no sustituye a la otra: un modelo puede mejorar en las evals sin mover el negocio, porque el cuello de botella estaba en otro paso del proceso. Y el negocio puede mejorar con un modelo mediocre si el resto del proceso acompaña.

Los **guardarraíles** son métricas que no deben empeorar mientras optimizas la principal: calidad, quejas, escalados, incidentes de seguridad. Resolver más rápido con más reaperturas no es un éxito.

## La ficha de métricas

Rellénala antes de empezar el piloto y que la firmen quien construye y quien decide.

```yaml title="ficha-metricas.yaml"
caso_de_uso: Copiloto de respuestas para soporte de nivel 1
responsable: Responsable del equipo de soporte
unidad: ticket de nivel 1 resuelto

metrica_principal:
  nombre: minutos hasta la resolución
  definicion: desde que el agente abre el ticket hasta que lo marca como resuelto
  fuente: exportación semanal del sistema de tickets
  linea_base: medir 4 semanas antes del piloto, mismo equipo y mismos tipos de ticket
  objetivo: mediana al menos un 20 % por debajo de la línea base
  como_se_resume: [mediana, p90]

guardarrailes:
  - nombre: tasa de tickets reabiertos en 7 días
    regla: no sube más de un 20 % sobre la línea base
  - nombre: quejas por respuesta incorrecta
    regla: ninguna atribuible a una cita falsa del sistema

metricas_del_modelo:          # evals antes de cada cambio
  - fidelidad a las fuentes (modelo juez con rúbrica)
  - citas válidas (comprobación en código)
  - recall@5 de la recuperación sobre 50 preguntas reales

operacion:
  - coste por ticket (tokens a la tarifa vigente + minutos de revisión)
  - latencia p90 del borrador

periodo_del_piloto: 4 semanas, con un grupo de control del mismo equipo
decision: seguir si cumple el objetivo sin romper guardarraíles; ajustar si está cerca con causa identificada; parar en otro caso
```

El objetivo del ejemplo es una decisión de quien firma la ficha, no una cifra de referencia del sector. Pon el tuyo a partir de tu línea base y del coste de tus errores.

## Comparar con honestidad

La media engaña cuando hay casos largos. Usa la mediana para el caso típico y un percentil alto (p90) para los difíciles, y mira siempre los guardarraíles.

```python title="comparar.py"
from statistics import median, quantiles

# Minutos por ticket de nivel 1, mismo tipo de tickets y mismo equipo (datos de ejemplo)
antes   = [12, 15, 9, 22, 14, 11, 35, 13, 16, 10, 18, 41, 12, 14, 17, 13, 20, 11, 15, 38]
durante = [8, 10, 7, 21, 9, 8, 39, 10, 11, 7, 12, 44, 9, 10, 11, 9, 14, 8, 10, 40]
reabiertos = {"antes": (9, 150), "durante": (16, 150)}   # (reabiertos, total)

def resumen(minutos: list[int]) -> dict:
    return {"mediana": median(minutos), "p90": round(quantiles(minutos, n=10)[-1], 1)}

base, piloto = resumen(antes), resumen(durante)
print("línea base:", base)
print("piloto:    ", piloto)
print(f"mediana: {piloto['mediana'] / base['mediana'] - 1:+.0%}")
print(f"p90:     {piloto['p90'] / base['p90'] - 1:+.0%}")

tasa = {k: r / t for k, (r, t) in reabiertos.items()}
print(f"reabiertos: {tasa['antes']:.1%} -> {tasa['durante']:.1%}")
if tasa["durante"] > tasa["antes"] * 1.2:      # guardarraíl definido antes del piloto
    print("Guardarraíl roto: no escales el piloto; revisa qué tickets se reabren.")
```

```text title="Salida"
línea base: {'mediana': 14.5, 'p90': 37.7}
piloto:     {'mediana': 10.0, 'p90': 39.9}
mediana: -31%
p90:     +6%
reabiertos: 6.0% -> 10.7%
Guardarraíl roto: no escales el piloto; revisa qué tickets se reabren.
```

Con estos datos de ejemplo, el titular «los tickets se resuelven un 31 % más rápido» sería verdad y engañoso a la vez. Los tickets difíciles no mejoran y se reabren más. La decisión correcta es **ajustar**: leer los tickets reabiertos, ver si el borrador se equivoca en un tipo concreto y corregir antes de ampliar. Con muestras pequeñas como esta, trata cualquier diferencia como una pista, no como una conclusión.

## Errores frecuentes

- Empezar el piloto sin línea base y reconstruirla después de memoria.
- Medir por encuesta lo que se puede medir en los sistemas.
- Celebrar la métrica principal sin mirar los guardarraíles.
- Comparar semanas distintas (campaña, vacaciones) como si fueran equivalentes.
- Confundir «el modelo acierta más en las evals» con «el negocio va mejor».

## Ejercicio

> [!ejercicio] La ficha de tu caso
> Copia la ficha y rellénala para el caso que elegiste en la lección 3: unidad, métrica principal con definición exacta y fuente, cómo medirás la línea base, objetivo, dos guardarraíles, dos métricas del modelo, el coste por operación y la regla de decisión.
>
> Está bien si la métrica principal se puede sacar hoy de un sistema sin preguntar a nadie, si cada guardarraíl tiene una regla numérica decidida antes del piloto y si el coste por operación incluye el tiempo de revisión humana.

> [!ejercicio]- Pistas
> Si no encuentras una fuente automática para tu métrica, puede que la unidad esté mal elegida. Prueba con una unidad que ya registre algún sistema: tickets, pedidos, facturas, propuestas enviadas.

## Resumen

- Mide antes y después con la misma definición; la percepción no sirve como medida.
- Cinco familias: tiempo, coste, calidad, velocidad e ingresos; el coste incluye la revisión humana.
- Métricas del modelo (evals) antes de cada cambio; métricas de negocio en el piloto. Necesitas las dos.
- Decide umbral, guardarraíles y regla de decisión antes de empezar.
- Usa mediana y p90, y lee los casos que empeoran.

## Para seguir

- [[cursos/ia-en-la-empresa/05-errores-tipicos]]
- [[cursos/evals-para-agentes/01-que-medir]]: las métricas del sistema con más detalle.
- [[roadmap/80-evals/02-conjunto-de-prueba]]: cómo construir el conjunto de evaluación.
