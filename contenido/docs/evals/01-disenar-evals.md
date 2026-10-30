---
titulo: Diseñar evals
descripcion: Cómo definir criterios de éxito, construir un conjunto de prueba, elegir el grader adecuado para cada criterio y montar un arnés de evals mínimo.
creado: 2026-10-18
actualizado: 2026-10-29
orden: 1
nivel: intermedio
tags: [evals, calidad, testing]
relacionados: ["[[glosario/evals]]", "[[glosario/conjunto-de-evaluacion]]", "[[roadmap/80-evals/02-conjunto-de-prueba]]", "[[cursos/evals-para-agentes/03-graders]]"]
---

Una **eval** es una prueba repetible que mide si un sistema con modelos hace bien su trabajo: un conjunto de entradas, una forma de puntuar cada salida y un agregado que comparas entre versiones. Diseñarla bien consiste en decidir qué significa «bien» para tu caso antes de tocar el prompt. Las [[glosario/evals|evals]] cumplen el papel de los tests en el software clásico, con una diferencia: la salida varía entre ejecuciones y muchas veces no hay una única respuesta correcta.

## El proceso

```mermaid
flowchart LR
  A[Criterios de éxito] --> B[Casos de prueba]
  B --> C[Graders]
  C --> D[Ejecutar y puntuar]
  D --> E[Leer fallos]
  E -- cambiar prompt o modelo --> D
  E -- casos nuevos --> B
```

### 1. Escribe criterios de éxito medibles

«Que responda bien» no se puede medir. Traduce la intención a criterios concretos:

| Intención vaga | Criterio medible |
|---|---|
| Que clasifique bien los tickets | La categoría coincide con la etiqueta humana en el 95 % de los casos del conjunto. |
| Que no se invente cosas | Cada afirmación de la respuesta está respaldada por un fragmento citado. |
| Que el tono sea adecuado | Un juez con rúbrica puntúa el tono como «profesional» en al menos 4 de 5. |
| Que el agente no gaste de más | Resuelve la tarea en 8 pasos o menos. |

Los umbrales los pones tú según lo que tu producto necesita. Lo importante es que existan antes de empezar a iterar, para no moverlos a conveniencia.

### 2. Construye el [[glosario/conjunto-de-evaluacion|conjunto de prueba]]

Las mejores fuentes de casos, por orden:

1. **Tráfico real**: preguntas de usuarios, tickets, documentos que de verdad procesa tu sistema.
2. **Fallos conocidos**: cada error reportado se convierte en un caso. Así no vuelve.
3. **Casos límite escritos a mano**: entradas vacías, idiomas mezclados, peticiones fuera de alcance, intentos de [[glosario/inyeccion-de-prompt|inyección]].
4. **Casos sintéticos** generados con un modelo, revisados por una persona antes de entrar.

Empieza con 20–50 casos bien elegidos, sacados sobre todo de fallos reales; es también la recomendación de Anthropic en [*Demystifying evals for AI agents*](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (2026). Un conjunto pequeño que cubre los tipos de entrada importantes es más útil que mil casos parecidos entre sí. Para cada caso guarda la entrada, la salida esperada o los criterios que debe cumplir, y una etiqueta de tipo para poder ver resultados por categoría. La lección [[roadmap/80-evals/02-conjunto-de-prueba]] profundiza en esto.

### 3. Elige un grader por criterio

Un grader es lo que puntúa una salida. Hay tres tipos y conviene usar el más simple que funcione:

| Grader | Úsalo para | Ventajas | Limitaciones |
|---|---|---|---|
| Código | Coincidencia exacta, JSON válido, campos presentes, regex, llamadas a herramientas esperadas | Rápido, barato, determinista | Solo mide lo que se puede comprobar mecánicamente |
| [[glosario/modelo-juez]] | Tono, fidelidad a las fuentes, completitud, utilidad | Escala a criterios subjetivos | Cuesta tokens, tiene sesgos, hay que calibrarlo |
| Humano | Calibrar los otros dos, casos ambiguos, decisiones finales | Es la referencia | Lento y caro |

Muchos criterios que parecen subjetivos se pueden convertir en código. «Que cite la fuente» se comprueba buscando el identificador del documento en la respuesta. Haz esa conversión siempre que puedas. Para lo que no se puede, lee [[docs/evals/02-modelo-como-juez]].

## Un arnés mínimo

```python tab="Python" title="evals.py"
import json
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

SYSTEM = ("Clasifica el ticket en una categoría: facturacion, envio, devolucion u otro. "
          "Responde solo con la categoría.")

CASOS = [  # en la práctica, cárgalos de un archivo JSONL versionado
    {"id": "t1", "tipo": "claro", "entrada": "No me ha llegado el pedido 4411", "esperado": "envio"},
    {"id": "t2", "tipo": "claro", "entrada": "Me cobrasteis dos veces", "esperado": "facturacion"},
    {"id": "t3", "tipo": "ambiguo", "entrada": "Quiero devolverlo y que me reembolséis", "esperado": "devolucion"},
]

def sistema(entrada: str) -> str:
    resp = client.messages.create(
        model=MODEL, max_tokens=1024, system=SYSTEM,  # margen: el razonamiento adaptativo gasta salida
        output_config={"effort": "low"},              # tarea simple; fija el esfuerzo para comparar
        messages=[{"role": "user", "content": entrada}],
    )
    if resp.stop_reason != "end_turn":
        return f"<{resp.stop_reason}>"                # cuenta como fallo y se ve en el informe
    return "".join(b.text for b in resp.content if b.type == "text").strip().lower()

def grader(salida: str, caso: dict) -> bool:
    return salida == caso["esperado"]

def evaluar() -> None:
    resultados = []
    for caso in CASOS:
        salida = sistema(caso["entrada"])
        resultados.append({**caso, "salida": salida, "ok": grader(salida, caso)})
    aciertos = sum(r["ok"] for r in resultados)
    print(f"Aciertos: {aciertos}/{len(resultados)}")
    for r in resultados:
        if not r["ok"]:
            print(json.dumps(r, ensure_ascii=False))  # lee siempre los fallos

if __name__ == "__main__":
    evaluar()
```

```text
# salida de ejemplo
Aciertos: 2/3
{"id": "t3", "tipo": "ambiguo", "entrada": "Quiero devolverlo y que me reembolséis", "esperado": "devolucion", "salida": "facturacion", "ok": false}
```

El arnés tiene cuatro piezas separadas a propósito: los casos, el sistema bajo prueba, el grader y el informe. Así puedes cambiar el prompt o el modelo sin tocar lo demás, y añadir graders nuevos sin reescribir el bucle. Fija también el modelo (su ID completo) y el `effort`: son parte de lo que estás midiendo.

Antes de escribir un arnés propio, mira las herramientas abiertas: promptfoo (configuración en YAML), DeepEval (estilo pytest) e Inspect AI (tareas y *scorers* en Python) resuelven la ejecución, el informe y la comparación entre versiones ([[docs/modelos-abiertos/08-evals-abiertas]], [[recetas/evals-con-promptfoo]]). Para probar la lógica de un agente sin llamar a la API, usa modelos simulados ([[recetas/probar-agentes-sin-api]]).

## Medir agentes

En un agente no basta con mirar la respuesta final. Mide también la [[glosario/trayectoria|trayectoria]]: qué herramientas llamó, en qué orden, cuántos pasos dio y cuántos tokens gastó. Dos agentes pueden acertar la respuesta y uno haberlo hecho en 4 pasos y el otro en 25. Aun así, califica sobre todo **lo que produjo**, no el camino exacto: un agente puede encontrar una ruta válida que no previste. Guarda la traza completa de cada caso de eval; es lo que leerás cuando algo falle. Ver [[roadmap/80-evals/04-evals-de-trayectoria]].

Para encontrar qué medir, el método más eficaz es leer trazas: anota el primer fallo de cada una, agrupa los fallos por tipo y cuenta. Los tipos más frecuentes se convierten en criterios y en casos. Paso a paso en [[recetas/analisis-de-errores-de-trazas]].

## La variabilidad

La misma entrada puede dar salidas distintas, y en la API de Claude ya no hay `temperature` que bajar (se eliminó en la versión `2026-10-21`). La variabilidad se mide en lugar de esconderse. Para decisiones importantes:

- Ejecuta cada caso varias veces y mira la tasa de acierto, no un único resultado.
- Distingue dos métricas: **pass@k** (al menos uno de *k* intentos acierta; Chen et al., 2021, [*Evaluating Large Language Models Trained on Code*](https://arxiv.org/abs/2107.03374)) y **pass^k** (los *k* intentos aciertan; Yao et al., 2024, [*τ-bench*](https://arxiv.org/abs/2406.12045)). Para un agente en producción importa la segunda: un 75 % de acierto por intento da un 0,75³ ≈ 42 % de que tres intentos seguidos salgan bien. Ver [[glosario/pass-k]].
- Compara versiones sobre el mismo conjunto y en las mismas condiciones.
- Desconfía de diferencias pequeñas en conjuntos pequeños: dos aciertos más en 30 casos pueden ser ruido. En evals de agentes, el entorno también mete ruido: Anthropic midió que la infraestructura sola mueve los resultados lo bastante como para que diferencias de menos de 3 puntos no signifiquen nada ([*Quantifying infrastructure noise in agentic coding evals*](https://www.anthropic.com/engineering/infrastructure-noise), 2026).

> [!consejo] Lee los fallos, no solo el número
> El agregado te dice si vas mejor o peor. Los fallos individuales te dicen por qué. Dedica más tiempo a lo segundo.

## Errores frecuentes

- **Iterar el prompt sin conjunto fijo**: cada prueba se hace con casos distintos y no puedes comparar.
- **Conjunto contaminado**: copiar los casos de prueba como ejemplos *[[glosario/few-shot|few-shot]]* en el prompt. La eval sale perfecta y no mide nada.
- **Solo casos fáciles**: si todo pasa al 100 %, el conjunto no está buscando los límites.
- **No versionar**: guarda casos, prompts y resultados en el repositorio para poder comparar con versiones anteriores.
- **Fiarse de un benchmark público** en lugar de medir tu caso: miden otra cosa y algunos están contaminados. Ver [[docs/evals/03-benchmarks-publicos]].

## Ver también

- [[docs/evals/02-modelo-como-juez]]: graders con modelo.
- [[recetas/evals-de-regresion-en-ci]]: ejecutar esto en cada cambio.
- [[roadmap/80-evals/01-por-que-evals]]: la motivación, paso a paso.
- [[cursos/evals-para-agentes/01-que-medir]]: qué medir en un agente.
- [[biblioteca/demystifying-evals]]: el artículo de Anthropic sobre evals de agentes, comentado.
