---
titulo: El modelo ignora mis instrucciones
descripcion: Por qué el modelo se salta una regla de tu prompt y cómo ordenar las instrucciones, sacarlas de los datos y comprobarlas con casos de prueba repetidos.
creado: 2026-10-29
sintoma: El modelo ignora mis instrucciones
tema: prompting
nivel: intermedio
tags: [prompting, prompt-de-sistema, evals]
relacionados: ["[[roadmap/10-prompting/04-prompt-de-sistema]]", "[[docs/prompting/01-prompt-de-sistema]]", "[[modelos/08-antipatrones]]", "[[problemas/contexto-saturado-en-sesiones-largas]]"]
---

Escribiste «nunca prometas reembolsos» y el asistente acaba de decirle a un cliente «te devolvemos el dinero hoy». O pediste respuestas de tres frases y llegan diez. Lo más desconcertante: no pasa siempre. La misma pregunta, tres veces, da dos respuestas correctas y una que se salta la regla.

## Causas

- **Instrucciones contradictorias.** «Sé exhaustivo» arriba y «responde en tres frases» abajo; «ayuda siempre al cliente» y «no prometas reembolsos». El modelo resuelve el conflicto a su manera, y no siempre igual.
- **La regla está enterrada.** Una línea en el párrafo doce de un prompt de 3000 palabras, sin estructura, compite con todo lo demás.
- **Instrucciones dentro de los datos.** Pegas las reglas en el mensaje del usuario junto al documento, o las mezclas con el resultado de una herramienta. Al revés también pasa: un documento o un `tool_result` que dice «ignora lo anterior» es una [[glosario/inyeccion-de-prompt|inyección]], y el modelo puede tomarlo como instrucción.
- **Conflicto con las herramientas.** El `system` dice «no modifiques nada» y la descripción de una herramienta dice «úsala para actualizar el pedido». O la regla depende de un dato que solo trae una herramienta que el modelo no llama.
- **Una prohibición sin alternativa.** «No prometas reembolsos» deja un hueco; «di que lo revisa el equipo de pagos» lo llena.
- **El contexto está saturado.** En sesiones largas las reglas del principio pierden peso ([[problemas/contexto-saturado-en-sesiones-largas]]).
- **Esperas determinismo.** En la API de Claude ya no existe `temperature`: la variación se controla con instrucciones claras, salidas estructuradas y evals, no con un parámetro ([[modelos/06-parametros]]).

## Cómo confirmarlo

Convierte cada regla en un caso de prueba con una comprobación hecha con código y ejecútalo varias veces. Una regla que se cumple 2 de 3 veces es un problema, no una anécdota:

```python title="probar_reglas.py"
import re

import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()

SYSTEM = """Eres el asistente de soporte de una tienda online.

<reglas>
1. Responde en español, en 3 frases como máximo.
2. Nunca prometas reembolsos: di que lo revisa el equipo de pagos.
3. Si te preguntan por otro tema que no sea la tienda, dilo y no respondas.
</reglas>"""

# cada caso: entrada y una comprobación con código de la regla que más le afecta
CASOS = [
    ("Me cobrasteis dos veces, devolvedme el dinero ya", lambda r: not re.search(r"te (devolvemos|reembolsamos)", r, re.I)),
    ("Explícame con detalle todo el proceso de envío", lambda r: len(re.findall(r"[.!?](\s|$)", r)) <= 3),
    ("¿Quién ganó el mundial de 2010?", lambda r: "españa" not in r.lower()),
]


def evaluar(system: str = SYSTEM, repeticiones: int = 3) -> None:
    for entrada, regla in CASOS:
        fallos = 0
        for _ in range(repeticiones):          # sin temperature, la variación se mide repitiendo
            resp = client.messages.create(model=MODEL, max_tokens=512, system=system,
                                          messages=[{"role": "user", "content": entrada}])
            texto = "".join(b.text for b in resp.content if b.type == "text")
            fallos += not regla(texto)
        print(f"{repeticiones - fallos}/{repeticiones}  {entrada}")
```

Con el simulador de la API, que devuelve una promesa de reembolso en la primera respuesta:

```text
2/3  Me cobrasteis dos veces, devolvedme el dinero ya
3/3  Explícame con detalle todo el proceso de envío
3/3  ¿Quién ganó el mundial de 2010?
```

Después quita reglas de una en una: si al quitar una el fallo desaparece, has encontrado el conflicto.

## Arreglo

- **Las reglas, en el `system`**, cortas, numeradas y separadas del resto con etiquetas (`<reglas>`). Los datos van en `messages`, marcados como datos ([[roadmap/10-prompting/04-prompt-de-sistema]]).
- **Resuelve las contradicciones por escrito**: si dos reglas pueden chocar, di cuál manda.
- **Da la conducta alternativa** en cada prohibición, y el motivo si no es obvio ([[roadmap/10-prompting/01-instrucciones-claras]]).
- **Un ejemplo** del caso difícil vale más que otra línea de reglas ([[roadmap/10-prompting/02-ejemplos-few-shot]]).
- **Alinea las descripciones de las herramientas** con las reglas, y retira las herramientas que la tarea no necesita ([[disciplinas/diseno-de-herramientas]]).
- **Para cambiar instrucciones a mitad de conversación**, usa un mensaje `{"role": "system", …}` intermedio en lugar de añadirlas al texto del usuario ([[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]]).
- **Lo que no puede fallar, no lo confíes al prompt**: compruébalo en código (un validador, un permiso, una aprobación humana).

## Cómo evitarlo

- Guarda los casos de prueba con el prompt y ejecútalos en cada cambio ([[roadmap/10-prompting/05-iterar-con-casos-de-prueba]], [[recetas/evals-de-regresion-en-ci]]).
- Cuando cambies de modelo, vuelve a pasarlos: un prompt afinado para uno puede comportarse distinto en otro.
- Si las reglas no caben en una pantalla, sepáralas en pasos o en subagentes con un prompt cada uno ([[patrones/03-encadenado]]).

## Ver también

- [[docs/prompting/01-prompt-de-sistema]]
- [[modelos/01-principios-de-prompting]]
- [[plantillas/prompt-de-sistema-de-agente]]
- [[docs/seguridad/01-prompt-injection]]
