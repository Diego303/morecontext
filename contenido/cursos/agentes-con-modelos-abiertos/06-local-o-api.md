---
titulo: "Local, autoalojado o API: cómo decidir"
descripcion: Un marco para elegir entre API propietaria, modelo abierto autoalojado o local según privacidad, calidad medida, coste total, latencia, operación y licencia, y cómo combinarlos enrutando por tarea.
creado: 2026-10-29
orden: 6
minutos: 25
tipo: teoria
objetivos:
  - Evaluar un caso de uso con los ocho criterios del marco (privacidad, calidad, coste, latencia, operación, funcionalidades, licencia y dependencia).
  - Diseñar la prueba que decide si un modelo abierto es suficiente para una tarea, usando las mismas evals que con la API.
  - Implementar un enrutador que envíe cada tarea a un modelo local o a la API según reglas explícitas.
requiere: ["[[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion]]"]
relacionados: ["[[patrones/04-enrutado]]", "[[modelos/05-elegir-modelo-por-tarea]]", "[[docs/modelos-abiertos/03-apis-compatibles-y-litellm]]", "[[glosario/inferencia-local]]"]
tags: [decision, coste, privacidad, enrutado, modelos-abiertos]
---

Después de cinco lecciones sabes servir un modelo abierto y construir encima. Falta la pregunta que te harán en cualquier reunión: ¿merece la pena? Al terminar esta lección sabrás responderla con un procedimiento, no con una opinión, y sabrás que la respuesta más frecuente no es «todo local» ni «todo API», sino una mezcla.

## La idea

Hay tres opciones, y cada una cambia quién carga con qué:

- **A · API propietaria** (Claude u otra). El proveedor opera, escala y actualiza. Pagas por token.
- **B · Modelo abierto autoalojado**: vLLM o SGLang en tus GPU, en tu nube o en un proveedor de inferencia que sirve modelos abiertos. Pagas infraestructura y operación.
- **C · Local** en la máquina del usuario o del equipo: Ollama, LM Studio, llama.cpp. Pagas el hardware que ya tienes y tu tiempo.

Ninguna gana en todo. La forma de decidir es mirar los criterios en orden y dejar que **tus evals** pongan los números que ningún artículo puede darte.

## Los ocho criterios

| Criterio | Pregunta que decide | A · API | B · Autoalojado | C · Local |
|---|---|---|---|---|
| Privacidad y soberanía | ¿Pueden salir los datos de tu red? ¿Hay requisitos de residencia o de contrato? | Depende del contrato y la región del proveedor | Tú eliges dónde; con GPU propias, nada sale | Nada sale (salvo `:cloud` o herramientas que llamen fuera) |
| Calidad | ¿El modelo abierto pasa **tus** evals con el umbral que necesitas? | Suele ser el techo de partida | Mídelo: varía mucho por tarea y modelo | Limitada por la memoria: modelos menores o más cuantizados |
| Coste | Volumen × tokens por tarea frente a coste fijo más operación | Variable por token; el *prompt caching* lo reduce mucho | Fijo; compensa con volumen alto y estable | Casi nulo por token con volumen bajo |
| Latencia | ¿Respuesta interactiva? ¿Cuántos usuarios a la vez? | Red más cola del proveedor | Controlable (*batching*, cercanía) | Sin red, pero una GPU de consumo atiende a pocos a la vez |
| Operación | ¿Quién actualiza, monitoriza y escala? | El proveedor | Tú: drivers, versiones, *parsers*, memoria | Tú, con alcance pequeño |
| Funcionalidades | ¿Necesitas `tool_choice` forzado, *prompt caching*, citas, *batches*? | Completas en la API nativa | vLLM: `tool_choice`, salidas estructuradas y caché de prefijo | Ollama: sin `tool_choice`; salidas con `format` |
| Licencia | ¿Tu uso cumple la licencia del modelo (umbrales, Model as a Service, no comercial)? | Términos del proveedor | Revisa el `LICENSE` | Revisa el `LICENSE` |
| Dependencia | ¿Quieres poder cambiar de modelo sin reescribir? | Atado a la API salvo con capa de compatibilidad | Formato OpenAI o Anthropic intercambiable | Igual |

Dos criterios funcionan como **filtros**, no como pesos. Si los datos no pueden salir de tu red, A queda fuera aunque gane en todo lo demás. Y si la licencia del modelo no cubre tu caso, ese modelo queda fuera aunque pase las evals.

## Cómo decidir en la práctica

1. **Empieza por la API para fijar el techo de calidad.** Construye las evals de la tarea con el mejor modelo disponible, como enseña [[modelos/05-elegir-modelo-por-tarea]]. Sin techo no sabes cuánto pierdes al bajar.
2. **Si hay requisito duro de privacidad**, salta a C para prototipar o a B para producción, y mide con las mismas evals.
3. **Si no lo hay**, prueba un modelo abierto con **las mismas evals y el mismo umbral**. Si lo cumple y el volumen justifica GPU dedicadas, pasa a B.
4. **Mezcla.** El [[patrones/04-enrutado|enrutado]] manda las tareas baratas o sensibles a un modelo local y las complejas a la API.
5. **Repite la medición en cada cambio** de modelo, de motor o de cuantización. Un *parser* de herramientas nuevo o una plantilla de chat distinta cambian la calidad sin que cambie el modelo.

> [!aviso] Un juez local débil infla las notas
> Si evalúas un modelo abierto con un modelo juez más pequeño que él, las notas salen más altas de lo que son. Usa un juez igual o mejor que el evaluado, y valida al juez contra etiquetas humanas (ver [[docs/evals/02-modelo-como-juez]]).

## El coste total, sin cifras inventadas

No hay una cifra de «a partir de N tokens compensa autoalojar» que valga para ti. Hay una cuenta que puedes hacer con tus datos:

- **API**: tokens de entrada y salida por tarea (los tienes en `usage`) × tareas al mes × precio vigente, descontando lo que ahorra el *prompt caching* en tu patrón real.
- **Autoalojado**: coste mensual de las GPU (aunque estén ociosas de noche) + almacenamiento y red + horas de operación de las personas que lo mantienen + el coste de las evals que repites en cada actualización.
- **Divide** el total autoalojado entre las tareas que de verdad procesas y compáralo con el de la API **a calidad igual**. Si el modelo abierto necesita más reintentos o más pasos para la misma tarea, cuéntalos.

Las únicas cifras aceptables son las que salen de tus evals y de tu `usage`.

## Híbridos: enrutar por tarea

En la mayoría de equipos la decisión correcta es por tarea, no por empresa. Un enrutador con reglas explícitas es más fácil de auditar que uno que decide con otro modelo:

```python title="enrutador.py"
from dataclasses import dataclass
from langchain.chat_models import init_chat_model

LOCAL = "ollama:qwen3.6:27b"
API = "anthropic:claude-sonnet-5-5"

@dataclass
class Tarea:
    tipo: str                 # "clasificar", "extraer", "redactar", "razonar"…
    texto: str
    datos_sensibles: bool     # lo marca tu código (origen del dato, etiqueta del cliente), no el modelo

TAREAS_LOCALES = {"clasificar", "extraer"}       # las que tu modelo local aprueba en tus evals

def elegir_modelo(t: Tarea) -> str:
    if t.datos_sensibles:
        return LOCAL                               # requisito duro: no sale de tu red
    return LOCAL if t.tipo in TAREAS_LOCALES else API

_modelos = {}
def modelo(nombre: str):
    if nombre not in _modelos:                     # tope de salida explícito en los dos
        if nombre.startswith("ollama:"):           # ChatOllama ignora max_tokens: su tope es num_predict
            _modelos[nombre] = init_chat_model(nombre, num_predict=1024, num_ctx=32768, reasoning=False)
        else:
            _modelos[nombre] = init_chat_model(nombre, max_tokens=1024)
    return _modelos[nombre]

def resolver(t: Tarea) -> tuple[str, str]:
    nombre = elegir_modelo(t)
    return nombre, modelo(nombre).invoke(t.texto).text
```

Probado con un servidor que imita Ollama para la ruta local y un modelo simulado de LangChain (`FakeMessagesListChatModel`) en lugar de la API:

```text
clasificar sensible=False → ('ollama:qwen3.6:27b', 'facturacion')
redactar   sensible=False → ('anthropic:claude-sonnet-5-5', 'Lamentamos el retraso de tu pedido…')
redactar   sensible=True  → ('ollama:qwen3.6:27b', 'Resumen: tres consultas en 2025, sin alergias registradas.')
peticiones a Ollama: 2
tipo del modelo local: ChatOllama · options: {'num_ctx': 32768, 'num_predict': 1024}
```

Tres detalles del diseño:

- **La sensibilidad la decide tu código**, a partir del origen del dato. Si la decide un modelo, una inyección puede convencerlo de que nada es sensible.
- **`TAREAS_LOCALES` sale de las evals**, no de la intuición. Una tarea entra en la lista cuando el modelo local pasa su umbral.
- **Cada proveedor tiene su tope de salida.** La prueba lo destapó: `init_chat_model("ollama:…", max_tokens=1024)` se construye sin error, pero `ChatOllama` no usa `max_tokens`; su tope es `num_predict`, que por defecto no tiene límite. Comprueba siempre qué llega a la petición.

Si prefieres que el enrutado viva fuera del código, [[herramientas/litellm|LiteLLM]] expone ambos modelos bajo un mismo endpoint y tu enrutador solo cambia el nombre (`model="local"` o `model="claude"`), como en la [[cursos/agentes-con-modelos-abiertos/03-servir-modelos-en-produccion|lección 3]].

## Señales de que has elegido mal

- **Local o autoalojado**: las evals que pasaban empiezan a fallar tras una actualización del motor; el equipo dedica más tiempo a la infraestructura que al producto; las GPU están ociosas la mayor parte del día.
- **API**: el coste crece más rápido que el uso porque no aprovechas el *prompt caching*; aparece un requisito de residencia de datos que el contrato no cubre; necesitas trabajar sin conexión.
- **Híbrido**: nadie sabe qué tareas van a qué modelo, o la lista de tareas locales no se ha revisado desde que la escribiste.

## Ejercicio

> [!ejercicio] Decide con datos
> Elige una tarea real de tu equipo (clasificar tickets, extraer campos de facturas, responder con RAG). Escribe 20 casos de evaluación con su respuesta esperada. Ejecútalos con un modelo de API y con dos modelos abiertos en Ollama de tamaños distintos. Rellena la tabla de los ocho criterios para tu caso y escribe la decisión en un párrafo.
>
> Está bien si la decisión cita la tasa de acierto de cada modelo en tus 20 casos, el `usage` medio por tarea, la licencia exacta de los modelos abiertos y qué criterio actuó como filtro (si alguno).

> [!ejercicio]- Pistas
> Para la tasa de acierto, una comparación exacta o una lista de valores válidos basta en clasificación y extracción. La lección [[cursos/evals-para-agentes/02-datasets-de-evaluacion]] explica cómo elegir los casos.

## Resumen

- Tres opciones: API, autoalojado y local; ninguna gana en todos los criterios.
- Privacidad y licencia son filtros; calidad, coste, latencia y operación se miden.
- Fija el techo con la API, mide los modelos abiertos con las mismas evals y repite en cada actualización.
- El coste total incluye GPU ociosas, operación y reintentos; las cifras salen de tu `usage`.
- Lo habitual es un híbrido que enruta por tarea con reglas explícitas.

## Para seguir

- [[sistemas/asistente-100-local]]: el proyecto completo del curso.
- [[patrones/04-enrutado]]: el patrón de enrutado en detalle.
- [[docs/modelos-abiertos/index]]: la referencia de toda la infraestructura abierta.
