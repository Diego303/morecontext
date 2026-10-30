---
titulo: Usar bien modelos abiertos
descripcion: Qué cambia al escribir prompts para modelos de pesos abiertos (plantilla de chat, tamaño, contexto efectivo, herramientas, razonamiento, muestreo e idioma) y cómo adaptar un prompt pensado para Claude.
creado: 2026-10-29
orden: 11
tags: [modelos-abiertos, prompting, ollama, local]
relacionados: ["[[cursos/agentes-con-modelos-abiertos/index]]", "[[modelos/12-inferencia-local]]", "[[glosario/plantilla-de-chat]]", "[[modelos/01-principios-de-prompting]]"]
---

**Principio**: con un modelo abierto, lo que antes resolvía el proveedor (plantilla, contexto, *parser* de herramientas, muestreo) pasa a ser configuración tuya; comprueba esa configuración antes de tocar el *prompt*, y luego escribe más explícito y más corto.

## Por qué funciona

Los principios de [[modelos/01-principios-de-prompting]] valen igual: instrucciones claras, contexto suficiente, ejemplos y formato definido. Lo que cambia es todo lo que rodea al *prompt*. Con una API, el texto que escribes llega al modelo tal como esperas. Con un modelo de [[glosario/pesos-abiertos|pesos abiertos]] servido por ti, pasa por piezas que puedes tener mal configuradas sin que nada dé error. Por eso muchos «el modelo abierto es malo» son en realidad un contexto truncado o una plantilla equivocada.

### La plantilla de chat

El modelo no ve mensajes con roles: ve una cadena de texto con tokens especiales que delimitan el sistema, el usuario, el asistente y las herramientas. La **[[glosario/plantilla-de-chat|plantilla de chat]]** (normalmente un archivo Jinja dentro del modelo) hace esa conversión. Si el motor usa otra plantilla, el modelo recibe un formato con el que no se entrenó y rinde peor, sin error.

- Ollama trae la plantilla dentro del modelo descargado; puedes verla y cambiarla en el Modelfile (`TEMPLATE`).
- llama.cpp necesita `--jinja` (activado por defecto desde v0.7.0) para usar la plantilla del GGUF.
- DeepSeek V4 y V4.1 **no traen plantilla Jinja**: el formato se construye con `encoding.py` o `deepseek-recipe`, y servirlos bien depende de que el motor lo soporte. gpt-oss exige el formato *harmony*.

Antes de culpar al *prompt*, prueba el mismo modelo en otro motor o con la plantilla oficial.

### El contexto efectivo

Hay tres números distintos: el contexto que **anuncia el modelo** (262 144 en Qwen 3.6), el que **reserva el motor** (`num_ctx` en Ollama, `--max-model-len` en vLLM) y el que **el modelo usa bien**. El segundo es el traicionero: en Ollama el valor por defecto es pequeño y, si lo superas, descarta el principio de la conversación **sin avisar**. En un agente eso es el *prompt* de sistema y las herramientas. El tercero suele ser bastante menor que el anunciado, sobre todo en modelos pequeños y cuantizados, igual que ocurre con cualquier modelo ([[glosario/context-rot]]).

Consecuencias para el *prompt*: fija `num_ctx` de forma explícita, mantén el sistema y las herramientas cortos, y pon lo importante al final del contexto, cerca de la pregunta.

### El tamaño

Un modelo de 4B, 12B o 27B cuantizado no infiere lo que no dices. Con Claude puedes confiar en que «responde como un agente de soporte» implique tono, formato y límites razonables; con un modelo pequeño, cada expectativa implícita es una oportunidad de fallo. Por eso funcionan mejor los *prompts* **más explícitos y más cortos**: una tarea por llamada, reglas numeradas, un ejemplo de salida y nada que no se use.

### Herramientas

- Solo modelos que documentan *tool calling* (ver [[cursos/agentes-con-modelos-abiertos/04-herramientas-con-modelos-abiertos]]).
- **Menos herramientas y con nombres inequívocos.** Diez herramientas parecidas confunden a un modelo de 12B mucho antes que a uno de frontera.
- Valida los argumentos en tu código: el servidor no garantiza que cumplan el esquema.
- No cuentes con forzar una herramienta: Ollama no implementa `tool_choice`. Para el resultado final usa el esquema del servidor (`format` en Ollama, `response_format` en vLLM).

### Razonamiento y muestreo

Casi todos los modelos abiertos de 2026 traen razonamiento **activado por defecto** y lo controlan con parámetros que no coinciden entre familias: `enable_thinking` en Qwen 3.5/3.6, `reasoning_effort` con `xhigh`/`medium`/`low` en Qwen 3.8 o `"none"`/`"high"` en Mistral Small 4, `<|think|>` en el sistema de Gemma 4, `think` en Ollama para cualquiera. Si no lo regulas, el razonamiento consume el tope de salida antes de la respuesta.

Y al contrario que en la API de Claude, donde `temperature` ya no existe, aquí el muestreo es tuyo. Usa el que recomienda la *model card*: DeepSeek V4 recomienda temperatura 1.0 y top_p 1.0; Mistral Small 4 con `high`, 0.7. `temperature=0` está bien para clasificar con un modelo sin razonamiento, pero puede empeorar uno que se entrenó para razonar con muestreo.

### Idioma

Que un modelo sea multilingüe no dice cuánto pierde en español frente a inglés, y la diferencia puede crecer al bajar de tamaño. Escribe el *prompt* en el idioma de la tarea, incluye ejemplos en español y mide con casos en español. En embeddings, filtra el *leaderboard* de MTEB por tu idioma y por recuperación, no por la media global.

## Ejemplo antes/después

Un *prompt* de sistema escrito para Claude que funciona bien en la API y mal en un modelo local de 12B:

```text title="Antes"
Eres el asistente de soporte de Tiendalia. Ayuda a los clientes con sus pedidos
de forma cercana y profesional, usando las herramientas cuando haga falta.
Ten en cuenta nuestras políticas habituales y escala a una persona si el caso
lo requiere. Responde de forma concisa.
[12 herramientas: buscar_pedido, buscar_pedidos, consultar_envio, ver_cliente, …]
```

```text title="Después"
Eres el asistente de soporte de Tiendalia. Respondes en español.

Reglas:
1. Para cualquier dato de un pedido, llama a buscar_pedido con el id (formato A-123).
   Si el cliente no da el id, pídeselo. No inventes estados ni fechas.
2. Devoluciones: hay 30 días desde la entrega. Si han pasado más, dilo y no prometas nada.
3. Escala a una persona (herramienta escalar) si el cliente pide un reembolso
   de más de 100 € o si está enfadado tras dos respuestas.
4. Responde en 3 frases como máximo.

Ejemplo:
Cliente: ¿Dónde está mi pedido A-881?
Tú: [llamas a buscar_pedido con "A-881"] Tu pedido A-881 salió ayer y llegará el jueves.
[3 herramientas: buscar_pedido, escalar, buscar_ayuda]
```

Y la configuración que acompaña al *prompt*, que pesa tanto como él:

```diff
- chat(model=MODEL, messages=messages, tools=TOOLS)
+ chat(model=MODEL, messages=messages, tools=TOOLS, think=False,
+      options={"num_ctx": 32768, "num_predict": 1024, "temperature": 0.7})   # valores de la model card
```

Qué cambió: las «políticas habituales» se escribieron (el modelo no las conoce), «cuando haga falta» pasó a reglas concretas, el formato del id está en el *prompt* y en la validación, hay un ejemplo de la llamada esperada y de doce herramientas quedan tres. En la configuración, contexto y tope de salida explícitos, razonamiento regulado y muestreo de la card. Mide las dos versiones con las mismas evals: así sabrás qué parte del cambio aportó.

## Cuándo no aplica

- **Con un modelo abierto grande servido por un proveedor que gestiona plantilla, contexto y *parser*.** Muchas de estas precauciones las cubre el proveedor; las de muestreo, razonamiento y licencia siguen siendo tuyas.
- **Si el *prompt* ya pasa tus evals.** No lo reescribas por estilo: cada cambio es una regresión potencial.
- **Para decidir si usar un modelo abierto o una API.** Eso no se resuelve con *prompting*; ver [[cursos/agentes-con-modelos-abiertos/06-local-o-api]].

## Para seguir

- [[modelos/12-inferencia-local]]: memoria, cuantización y contexto.
- [[docs/modelos-abiertos/01-ollama]]: `num_ctx`, `think`, `format` y Modelfile.
- [[modelos/06-parametros]]: los parámetros en la API de Claude, para comparar.
