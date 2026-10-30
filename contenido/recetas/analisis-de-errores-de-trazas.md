---
titulo: Análisis de errores con cien trazas
descripcion: Lee cien trazas reales, anota el primer fallo de cada una, agrúpalos en una taxonomía y cuéntalos para saber qué arreglar y qué evals construir primero.
creado: 2026-10-29
nivel: intermedio
minutos: 90
tema: evals
stack: [Python]
tags: [evals, analisis-de-errores, trazas, taxonomia]
relacionados: ["[[glosario/analisis-de-errores]]", "[[recetas/validar-un-modelo-juez]]", "[[roadmap/40-primer-agente/06-depurar-con-trazas]]", "[[cursos/evals-para-agentes/02-datasets-de-evaluacion]]", "[[disciplinas/evals]]"]
---

## Problema

Tienes un agente en producción, o casi, y la sensación de que «a veces falla». Puedes empezar a escribir evals a ciegas, con métricas genéricas o con lo primero que se te ocurre, o puedes mirar antes qué falla de verdad. El **[[glosario/analisis-de-errores|análisis de errores]]** es lo segundo: leer trazas, anotar lo que va mal, agruparlo y contarlo.

Hamel Husain y Shreya Shankar lo llaman la actividad más importante de las evals y piden no saltársela ([*Why is "error analysis" so important in AI evals?*](https://hamel.dev/blog/posts/evals-faq/why-is-error-analysis-so-important-in-llm-evals-and-how-is-it-performed.html), 27 de junio de 2025, actualizado el 1 de septiembre de 2026). Esta receta sigue su método con unos scripts que te ahorran la parte mecánica: muestrear, preparar la hoja y contar.

## Ingredientes

- Trazas de tu agente en un JSONL, una por línea, con al menos `id`, `entrada`, `salida` y los pasos o herramientas usadas. Si tienes un campo que separe tipos de uso (intención, canal, cliente) y la valoración del usuario, mejor. Si no tienes datos reales todavía, empieza con datos sintéticos.
- Python 3.10 o superior. Los scripts de muestreo y recuento solo usan la biblioteca estándar; el paso opcional con modelo usa `anthropic`.
- **Una persona experta en el dominio**, con 90 minutos sin interrupciones. Husain y Shankar recomiendan que una sola persona con criterio (su «dictador benevolente») tome las decisiones.
- Una hoja de cálculo para anotar.

## Pasos

1. **Muestrea unas cien trazas diversas.** La guía habla de unas 100 trazas variadas y de seguir más allá si aún aprendes cosas. Diversas significa que salgan todos los tipos de uso, no solo el más frecuente. El script reparte por turnos entre los valores de un campo (`intencion`), mete hasta un 20 % de trazas con queja del usuario y baraja el resultado para que el orden de anotación sea aleatorio.

```python title="muestrear.py"
"""Muestrea N trazas diversas de un JSONL y genera la hoja de anotación (CSV)."""
import csv
import json
import random
import sys
from collections import defaultdict

N, SEMILLA = 100, 42
CAMPO_ESTRATO = "intencion"          # el campo que mejor separa tipos de uso en tus trazas


def resumen(t: dict, largo: int = 300) -> str:
    pasos = " → ".join(p["herramienta"] + ("" if p.get("ok", True) else " (error)") for p in t.get("pasos", []))
    return f"IN: {t['entrada'][:largo]} | PASOS: {pasos} | OUT: {t['salida'][:largo]}"


def muestrear(trazas: list[dict], n: int) -> list[dict]:
    rnd = random.Random(SEMILLA)
    negativas = [t for t in trazas if t.get("feedback") == "negativo"]
    elegidas = rnd.sample(negativas, min(len(negativas), n // 5))      # hasta un 20 % con queja del usuario
    resto = [t for t in trazas if t not in elegidas]
    por_estrato = defaultdict(list)
    for t in resto:
        por_estrato[t.get(CAMPO_ESTRATO, "?")].append(t)
    for grupo in por_estrato.values():
        rnd.shuffle(grupo)
    while len(elegidas) < n and any(por_estrato.values()):             # reparto por turnos: todos los estratos salen
        for grupo in por_estrato.values():
            if grupo and len(elegidas) < n:
                elegidas.append(grupo.pop())
    rnd.shuffle(elegidas)                                              # orden aleatorio para medir saturación
    return elegidas


if __name__ == "__main__":
    origen = sys.argv[1] if len(sys.argv) > 1 else "trazas.jsonl"
    trazas = [json.loads(l) for l in open(origen, encoding="utf-8") if l.strip()]
    muestra = muestrear(trazas, N)
    with open("anotacion.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["orden", "id", CAMPO_ESTRATO, "feedback", "traza", "pasa", "primer_fallo", "categoria"])
        for i, t in enumerate(muestra, 1):
            w.writerow([i, t["id"], t.get(CAMPO_ESTRATO), t.get("feedback") or "", resumen(t), "", "", ""])
    reparto = defaultdict(int)
    for t in muestra:
        reparto[t.get(CAMPO_ESTRATO)] += 1
    print(f"{len(muestra)} de {len(trazas)} trazas → anotacion.csv · {dict(reparto)}")
```

Con 400 trazas de ejemplo de un agente de soporte:

```text
100 de 400 trazas → anotacion.csv · {'devolucion': 26, 'factura': 16, 'producto': 18, 'envio': 22, 'cuenta': 18}
```

2. **Open coding: anota con notas libres.** Abre `anotacion.csv` y lee cada traza entera, de arriba abajo. Para cada una rellena `pasa` (`si` o `no`) y, si falla, `primer_fallo`: una frase concreta sobre **el primer error** que ves. Un fallo temprano provoca los siguientes; si anotas todos, cuentas tres veces el mismo problema. Escribe lo que observas («dice 60 días; la política dice 30»), no diagnósticos («alucina»). Deja `categoria` vacía todavía. La guía pide anotar al menos 30 trazas a mano antes de usar ayuda de un modelo.

3. **Axial coding: agrupa las notas en una taxonomía.** Es el paso que la guía considera más importante. Lee todas las notas y júntalas en categorías de fallo concretas y observables: «plazo de devolución inventado», «no consulta el pedido antes de responder». Ni demasiado amplias («error del modelo») ni una por nota. Escribe el nombre de la categoría en la columna `categoria` de cada traza fallida.

   Un modelo puede proponer un primer borrador de agrupación. Trátalo como sugerencia: la taxonomía es tuya.

```python title="proponer_taxonomia.py"
"""Borrador de taxonomía a partir de las notas libres (open coding). Lo revisa una persona."""
import csv
import json
import sys

import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()
ESQUEMA = {"type": "object", "additionalProperties": False, "required": ["categorias"],
           "properties": {"categorias": {"type": "array", "items": {
               "type": "object", "additionalProperties": False, "required": ["nombre", "definicion", "ids"],
               "properties": {"nombre": {"type": "string"}, "definicion": {"type": "string"},
                              "ids": {"type": "array", "items": {"type": "string"}}}}}}}

filas = [f for f in csv.DictReader(open(sys.argv[1], encoding="utf-8")) if f["primer_fallo"].strip()]
notas = "\n".join(f'<nota id="{f["id"]}">{f["primer_fallo"]}</nota>' for f in filas)
resp = client.messages.create(
    model=MODEL, max_tokens=8000,
    system=("Agrupas notas de análisis de errores en una taxonomía de modos de fallo. Cada categoría "
            "describe un fallo concreto y observable, con un nombre corto. Cada nota va en una sola "
            "categoría. No inventes categorías sin notas."),
    messages=[{"role": "user", "content": notas}],
    output_config={"format": {"type": "json_schema", "schema": ESQUEMA}},
)
taxonomia = json.loads(next(b.text for b in resp.content if b.type == "text"))["categorias"]
asignados = [i for c in taxonomia for i in c["ids"]]
huerfanas = {f["id"] for f in filas} - set(asignados)
duplicadas = {i for i in asignados if asignados.count(i) > 1}
for c in taxonomia:
    print(f"{len(c['ids']):>3}  {c['nombre']}: {c['definicion']}")
if huerfanas or duplicadas:
    print("Revisa a mano:", {"sin categoría": sorted(huerfanas), "en varias": sorted(duplicadas)})
```

   El script comprueba lo que el esquema no garantiza: que cada nota esté en una sola categoría y que no se quede ninguna fuera.

4. **Cuenta y mira la saturación.** Con la hoja completa, el recuento ordena las categorías por frecuencia y calcula cuántas categorías nuevas aparecieron en cada lote de diez trazas, en el orden en que las anotaste.

```python title="recuento.py"
"""Recuento de la hoja anotada: fallos por categoría y curva de saturación."""
import csv
import sys
from collections import Counter

LOTE = 10
filas = list(csv.DictReader(open(sys.argv[1] if len(sys.argv) > 1 else "anotacion.csv", encoding="utf-8")))
anotadas = [f for f in filas if f["pasa"] in ("si", "no")]
fallos = [f for f in anotadas if f["pasa"] == "no"]
sin_categoria = [f["id"] for f in fallos if not f["categoria"].strip()]
if sin_categoria:
    sys.exit(f"Faltan categorías (axial coding) en: {sin_categoria}")

print(f"{len(anotadas)} trazas anotadas · {len(fallos)} con fallo ({len(fallos) / len(anotadas):.0%})\n")
print(f"{'categoría':45} {'n':>3} {'% fallos':>8} {'% trazas':>8}")
for cat, n in Counter(f["categoria"] for f in fallos).most_common():
    print(f"{cat:45} {n:>3} {n / len(fallos):>8.0%} {n / len(anotadas):>8.0%}")

print("\nSaturación (categorías nuevas por lote de", LOTE, "trazas, en orden de anotación):")
vistas, curva = set(), []
for i in range(0, len(anotadas), LOTE):
    lote = {f["categoria"] for f in anotadas[i:i + LOTE] if f["pasa"] == "no"}
    curva.append(len(lote - vistas))
    vistas |= lote
print(" ".join(str(c) for c in curva))
print("Saturado: los dos últimos lotes no aportan modos nuevos." if curva[-2:] == [0, 0]
      else "Aún aparecen modos nuevos: anota otro lote.")
```

   Salida real con una hoja de 100 trazas anotadas (datos de ejemplo):

```text
100 trazas anotadas · 32 con fallo (32%)

categoría                                       n % fallos % trazas
plazo de devolución inventado                  13      41%      13%
no consulta el pedido antes de responder        9      28%       9%
escala a humano sin necesidad                   4      12%       4%
factura con datos fiscales erróneos             3       9%       3%
ignora el idioma del cliente                    2       6%       2%
tono frío ante una queja                        1       3%       1%

Saturación (categorías nuevas por lote de 10 trazas, en orden de anotación):
2 0 1 1 1 0 0 1 0 0
Saturado: los dos últimos lotes no aportan modos nuevos.
```

   La **saturación teórica** es el punto en que nuevas revisiones dejan de revelar modos de fallo o de cambiar los existentes. Si el último lote todavía trae categorías nuevas, muestrea y anota otro.

5. **Prioriza.** El recuento no es la prioridad, pero la ordena. Para cada categoría pregúntate cuánto daña (un plazo inventado puede costar dinero; un tono frío, menos) y cuánto cuesta arreglarlo:
   - **Arreglos directos**: instrucciones que faltan, una herramienta mal descrita, un dato que no llega al contexto. Arréglalos ya; no necesitan una eval elaborada.
   - **Fallos persistentes o subjetivos**: constrúyeles una eval. Si se comprueban con código (¿llamó a `buscar_pedido` antes de responder?), con código; si no, con un [[glosario/modelo-juez|modelo juez]] binario para esa categoría, validado como en [[recetas/validar-un-modelo-juez]].

## Cómo comprobar que funciona

- Repite el análisis con otra muestra al cabo de unos cambios. Las categorías que arreglaste deben bajar; si aparecen otras nuevas, la taxonomía estaba incompleta o los cambios han movido el problema.
- Pide a una segunda persona que anote 20 de las mismas trazas sin ver tus notas. Si discrepáis mucho en `pasa`, el criterio de qué es un fallo no está claro todavía: escríbelo.
- Las categorías deben servir para actuar. Si una no te dice qué cambiar ni qué medir, divídela.

## Variaciones

- **Muestreo dirigido.** Además del aleatorio, ordena por valoración negativa del usuario, por número de pasos o por errores de herramienta, o agrupa trazas parecidas y toma una de cada grupo. La guía menciona estas opciones para cuando el muestreo aleatorio ya no encuentra fallos nuevos.
- **Ayuda de un agente tras las primeras 30.** Una vez descritos los fallos, un modelo puede buscar en el resto de trazas candidatas a cada categoría; tú aceptas o rechazas cada sugerencia.
- **Agentes con trayectorias largas.** Resume la traza con los pasos y sus resultados (el `resumen()` del script) y anota en qué paso está el primer fallo. Ver [[roadmap/80-evals/04-evals-de-trayectoria]].
- **Como rutina.** Repite el análisis cada cierto tiempo y tras cada cambio grande de *prompt*, modelo o herramientas: los modos de fallo cambian.

## Errores típicos

- **Saltarse el análisis e ir directo a métricas genéricas.** Medirás algo, pero no lo que falla en tu producto.
- **Anotar todos los fallos de cada traza.** Inflas las categorías que son consecuencia de un error anterior.
- **Notas vagas.** «Respuesta mala» no se agrupa. «Da un plazo que no está en la política», sí.
- **Dejar que el modelo haga la taxonomía sin revisar.** Agrupa por parecido de palabras, no por causa.
- **Parar en 30 trazas porque «ya se ve».** Los modos de fallo raros, a menudo los caros, aparecen tarde. Mira la curva de saturación.
- **Anotar por comité.** Sin una persona que decida, cada uno anota con su criterio y el recuento no significa nada.
