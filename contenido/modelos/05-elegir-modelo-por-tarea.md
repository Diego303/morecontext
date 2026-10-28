---
titulo: Elegir modelo por tarea
descripcion: Qué tier de modelo (grande, mediano o rápido) encaja con cada tipo de tarea y un método para bajar de tier midiendo con evals sin perder calidad.
creado: 2026-10-12
orden: 5
tags: [modelos, coste, latencia, evals]
relacionados: ["[[docs/produccion/02-costes-y-limites]]", "[[docs/produccion/03-latencia]]", "[[docs/evals/01-disenar-evals]]", "[[patrones/04-enrutado]]"]
---

**Principio**: empieza con el modelo más capaz para saber qué calidad es posible, y baja de tier solo cuando tus evals demuestren que el más pequeño basta.

## Los tiers

Los proveedores ofrecen familias de modelos en varios tamaños. Los nombres y versiones cambian a menudo, así que aquí hablamos de **tiers** genéricos. Consulta los modelos concretos de cada tier en la [documentación oficial](https://platform.claude.com/docs).

| Tier | Qué ofrece | Contrapartida |
|---|---|---|
| Grande | El mejor razonamiento, más fiable en tareas largas y ambiguas. | El más caro y el más lento. |
| Mediano | Buen equilibrio; resuelve la mayoría de tareas de producción. | Puede fallar en los casos más difíciles. |
| Rápido | Respuesta casi inmediata y coste bajo. | Se pierde antes con instrucciones complejas o mucho contexto. |

## Por qué funciona el método

Si empiezas por el modelo pequeño y falla, no sabes si el problema es el modelo o tu prompt. Si empiezas por el grande, obtienes el techo de calidad. A partir de ahí, cada bajada de tier es un experimento con una pregunta clara: ¿se mantiene la calidad en mi conjunto de prueba? El ahorro sale de datos, no de intuiciones.

## Tarea por tier

| Tarea | Tier de partida | Por qué |
|---|---|---|
| Clasificar tickets, detectar idioma, etiquetar | Rápido | Tarea acotada, salida corta, mucho volumen. |
| Extraer campos de documentos a JSON | Rápido o mediano | El esquema hace casi todo; el mediano ayuda con documentos desordenados. |
| Responder con documentos recuperados ([[glosario/rag]]) | Mediano | Necesita leer bien y no inventar; el rápido puede bastar con buena recuperación. |
| Redactar textos con criterios de estilo | Mediano | Equilibrio entre calidad y coste. |
| Agente con varias herramientas | Mediano o grande | Debe decidir pasos; los errores se acumulan. |
| Orquestador que planifica y delega | Grande | La calidad del plan condiciona todo lo demás. |
| Subagentes de búsqueda o lectura | Mediano o rápido | Tareas acotadas, muchas en paralelo. |
| Código complejo, depuración, arquitectura | Grande | Razonamiento largo con muchas restricciones. |
| Modelo juez en evals | Igual o mayor que el evaluado | Debe detectar errores del modelo que juzga. |
| Autocompletado, voz, respuestas en tiempo real | Rápido | La latencia manda. |

Esta tabla es un punto de partida. Tu tarea concreta puede comportarse distinto; por eso existe el método.

## El método, paso a paso

1. **Construye un conjunto de prueba** con 30–100 casos reales y un grader para cada criterio ([[docs/evals/01-disenar-evals]]).
2. **Ejecuta con el modelo grande** y ajusta el prompt hasta que la calidad sea la que necesitas. Ese es tu techo.
3. **Ejecuta lo mismo con el tier mediano** sin cambiar nada más. Compara aciertos, coste por caso y latencia.
4. **Lee los casos que empeoran**. A veces basta con un ejemplo más en el prompt o una instrucción más explícita para que el modelo pequeño los resuelva.
5. **Repite con el tier rápido** si el mediano aguantó.
6. **Decide con números**: quédate con el tier más pequeño que cumpla tu umbral de calidad.

```python title="comparar_tiers.py"
import anthropic

MODEL = "claude-sonnet-5-5"  # modelo actual
CANDIDATOS: list[str] = []   # añade modelos de otros tiers con los nombres de la documentación oficial
client = anthropic.Anthropic()

CASOS = [{"entrada": "Me cobrasteis dos veces", "esperado": "facturacion"}]  # tu conjunto real
SYSTEM = "Clasifica el ticket: facturacion, envio, devolucion u otro. Responde solo la categoría."

def evaluar(modelo: str) -> dict:
    aciertos, tokens_salida = 0, 0
    for c in CASOS:
        r = client.messages.create(model=modelo, max_tokens=20, system=SYSTEM,
                                   messages=[{"role": "user", "content": c["entrada"]}])
        salida = "".join(b.text for b in r.content if b.type == "text").strip().lower()
        aciertos += salida == c["esperado"]
        tokens_salida += r.usage.output_tokens
    return {"modelo": modelo, "acierto": aciertos / len(CASOS), "tokens_salida": tokens_salida}

for m in [MODEL, *CANDIDATOS]:
    print(evaluar(m))
```

Registra también la latencia y el coste por caso con `usage`, como se explica en [[docs/produccion/02-costes-y-limites]].

## Mezclar tiers

No tienes que elegir un solo modelo para todo el sistema:

- **[[patrones/04-enrutado|Enrutado]]**: un modelo rápido clasifica la petición y la manda al tier que corresponde. Las preguntas sencillas no pagan precio de modelo grande.
- **Orquestador grande, subagentes medianos**: el plan lo hace el más capaz; la ejecución de cada parte, uno más barato ([[docs/agentes/02-subagentes]]).
- **Escalado ante duda**: el modelo rápido responde y, si su confianza es baja o la validación falla, se reintenta con el mediano.

## Antes y después

```text title="Antes"
Todo el sistema usa el modelo grande «para ir sobre seguro».
Clasificación, extracción y respuestas comparten modelo y precio.
```

```text title="Después"
Clasificación de entrada: tier rápido (acierto igual al grande en 200 casos).
Respuestas con documentos: tier mediano (mismo resultado del juez de fidelidad).
Casos marcados como complejos por el clasificador: tier grande.
```

## Cuándo no aplica

- **Prototipos y bajo volumen**: si haces cien llamadas al día, el ahorro de bajar de tier no compensa el tiempo de medir. Usa el modelo que funcione.
- **Sin evals**: si no tienes forma de medir, no bajes. Mejor pagar de más que degradar sin saberlo.
- **Tareas donde un error es caro**: diagnósticos, decisiones legales o financieras. El coste del modelo grande es pequeño frente al de un error.

Cuando el proveedor publique modelos nuevos, repite el método: un modelo nuevo de un tier menor puede igualar al grande de la generación anterior, o no. Solo tus evals lo dicen.

## Para seguir

- [[modelos/04-dejar-pensar-al-modelo]]: el esfuerzo también se ajusta por tarea.
- [[patrones/09-elegir-patron]]: elegir arquitectura además de modelo.
- [[roadmap/00-fundamentos/05-coste-y-latencia]]: medir coste y latencia desde la base.
