---
titulo: Versiones de la API y de los SDK
descripcion: Qué fija la cabecera anthropic-version, qué rompe la versión 2026-10-21, qué SDK la envían y cómo migrar paso a paso con un diff de antes y después.
creado: 2026-10-29
orden: 5
nivel: intermedio
tags: [api, sdk, versiones, migracion]
aliases: [anthropic-version, Migrar a 2026-10-21]
relacionados: ["[[radar/2026-10-23-api-2026-10-21-sin-temperatura]]", "[[docs/fundamentos/03-api-de-mensajes]]", "[[herramientas/anthropic-sdk]]", "[[modelos/06-parametros]]"]
---

La **versión de la API** es la fecha que viaja en la cabecera `anthropic-version` de cada petición y fija el contrato de la API de Mensajes: qué parámetros acepta y qué forma tiene la respuesta. La versión vigente es `2026-10-21`, la primera desde `2023-06-01`, y rompe compatibilidad: elimina `temperature`, `top_p` y `top_k`. Los SDK no te piden la versión: la fija la **versión mayor del SDK** que instales. Por eso migrar de API es, en la práctica, subir de versión mayor el SDK y arreglar lo que deja de compilar.

Este artículo es la referencia para esa migración. El aviso corto está en [[radar/2026-10-23-api-2026-10-21-sin-temperatura]].

## Qué garantiza una versión

Según la [página de versiones](https://platform.claude.com/docs/en/api/versioning) (consultada el 29 oct. 2026), dentro de una misma versión Anthropic **conserva** los parámetros de entrada y de salida que ya existen. Lo que sí puede cambiar sin versión nueva:

- añadir parámetros de entrada **opcionales**;
- añadir campos nuevos en la salida;
- cambiar las condiciones de un tipo de error concreto;
- añadir valores nuevos a campos tipo enumeración (por ejemplo, tipos de evento de *streaming* o un `stop_reason` nuevo).

La consecuencia para tu código: **no trates como error un valor de enumeración que no conoces** y no valides la respuesta con un esquema cerrado que rechace campos nuevos. Un bucle que lanza excepción ante un [[glosario/stop-reason|stop_reason]] desconocido está bien; uno que se cuelga, no. Ver [[docs/fundamentos/06-motivos-de-parada-y-rechazos]].

## Qué cambia en 2026-10-21

| Cambio | Antes (`2023-06-01`) | Ahora (`2026-10-21`) |
|---|---|---|
| `temperature`, `top_p`, `top_k` | Aceptados (los modelos 4.7 y posteriores ya solo admitían el valor por defecto) | **400 en cualquier modelo**, aunque envíes el valor por defecto |
| Bloque `document` directamente en un mensaje `assistant` | Aceptado | 400. Los documentos van en mensajes `user` |
| Bloque `text` con `citations` no vacías en un mensaje `user` (también dentro de `search_result`) | Aceptado | 400. Las citas en mensajes `assistant` que reenvías siguen valiendo |

Sin los parámetros de muestreo, la petición usa sus valores por defecto. La [guía de migración](https://platform.claude.com/docs/en/api/migration-2026-10-21) lo dice sin rodeos: si bajabas `temperature` para tener salidas más estables en un modelo que lo admitía, pierdes ese efecto y ningún ajuste lo sustituye. La consistencia se busca de otra forma: [[docs/prompting/03-salida-estructurada|salidas estructuradas]], rúbricas cerradas, varias muestras con voto y [[glosario/evals|evals]]. El razonamiento detrás está en [[modelos/06-parametros]].

> [!nota] Otros proveedores sí los tienen
> `temperature` y `top_p` siguen existiendo en otras APIs y en modelos de [[glosario/pesos-abiertos|pesos abiertos]] servidos con Ollama o vLLM. La eliminación es de la API de Claude, no del concepto.

## Qué SDK envían cada versión

Cada SDK envía la versión que era vigente cuando salió su versión mayor. Las primeras que envían `2026-10-21` (y que debes instalar como mínimo):

| Lenguaje | Paquete | Primera versión con `2026-10-21` |
|---|---|---|
| Python | `anthropic` | 2.0.0 (hoy 2.3.0) |
| TypeScript | `@anthropic-ai/sdk` | 1.0.0 (hoy 1.3.0) |
| C# | `Anthropic` | 13.0.0 |
| Go | `github.com/anthropics/anthropic-sdk-go/v2` | 2.0.0 (cambia la ruta de importación) |
| Java | `com.anthropic:anthropic-java` | 3.0.0 |
| PHP | `anthropic-ai/sdk` | 1.0.0 |
| Ruby | `anthropic` | 2.0.0 |
| CLI | `ant` | 2.0.0 (`go install …/anthropic-cli/v2/cmd/ant@latest`) |

En TypeScript, los paquetes de plataforma (`@anthropic-ai/bedrock-sdk`, `vertex-sdk`, `foundry-sdk`, `aws-sdk`, `google-cloud-sdk`) deben subir a su v1 a la vez; si no, el gestor de paquetes instala una segunda copia antigua del SDK. Los SDK nuevos pasan además de licencia MIT a **Apache 2.0**.

Dos casos en los que **no** debes subir todavía:

- **Amazon Bedrock con modelos anteriores a Claude 4.7**: allí `2026-10-21` solo existe para 4.7 y posteriores. Cambia antes de modelo o quédate en tu SDK actual.
- **Una petición que depende de verdad de `temperature`** en un modelo que aún la acepta (por ejemplo, Sonnet 4.6): puedes dejar esa llamada en `2023-06-01` mientras la rehaces.

## Cambios del SDK de Python 2.x

| Cambio | Qué rompe | Qué hacer |
|---|---|---|
| Sin `temperature`, `top_p` ni `top_k` en `messages.create` | `TypeError: Messages.create() got an unexpected keyword argument 'temperature'` | Quítalos. No los cueles con `extra_body`: la API devuelve 400 |
| La clave va en `Authorization: Bearer <clave>` en vez de `X-Api-Key` | Proxies, pasarelas, filtros de logs o *stubs* de test que leen `X-Api-Key` | Cámbialos para leer `Authorization`. La API acepta las dos cabeceras |
| Un cliente admite **una sola credencial** | `Anthropic(api_key=…, auth_token=…)` lanza `ValueError` | Pasa solo una. Sin ninguna, se usa la primera definida de `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`… |
| `MessageParam` es la unión `UserMessageParam \| AssistantMessageParam \| SystemMessageParam` | `MessageParam(role=…, content=…)` lanza `TypeError` | Escribe el mensaje como dict. El nombre sigue valiendo en anotaciones (`list[MessageParam]`) |
| Transporte HTTP en `httpx2` (desde la 1.0) y Python 3.10 o superior | Un `http_client=httpx.Client(...)` propio | Pásalo de `httpx2` (`httpx2.Client`, o `DefaultHttpxClient` del propio SDK) |
| `client.models.list()` y `retrieve()` sin `betas` | `TypeError` | Usa `client.beta.models.list(betas=[…])` |

El tercer tipo del `MessageParam` no es decorativo: `role: "system"` dentro de `messages` existe de verdad en los modelos actuales. Ver [[docs/contexto/06-mensajes-de-sistema-a-mitad-de-conversacion]].

En TypeScript los cambios equivalentes son menores: los tipos ya no tienen `temperature`, `MessageParam` es la misma unión (un literal con `role` sigue compilando) y pasar `apiKey` y `authToken` a la vez lanza `TypeError`. El SDK de TypeScript y el de Ruby pierden además la compactación en cliente del *tool runner*: se sustituye por la del servidor ([[docs/contexto/05-compactacion-y-limpieza-en-el-servidor]]).

## Ejemplo completo: comprobar qué envía tu SDK

Antes de desplegar, mira qué cabeceras y qué cuerpo salen de verdad. Este script sustituye la red por un transporte falso de `httpx2`, así que corre sin clave.

```python title="comprobar_version.py"
import json
import anthropic
import httpx2

MODEL = "claude-sonnet-5-5"

def capturar(peticion: httpx2.Request) -> httpx2.Response:
    """Transporte falso: enseña lo que el SDK enviaría y responde como la API."""
    print("anthropic-version:", peticion.headers["anthropic-version"])
    print("authorization:", peticion.headers["authorization"][:13] + "…")
    print("x-api-key presente:", "x-api-key" in peticion.headers)
    print("cuerpo:", json.loads(peticion.content))
    return httpx2.Response(200, json={
        "id": "msg_1", "type": "message", "role": "assistant", "model": MODEL,
        "content": [{"type": "text", "text": "ok"}], "stop_reason": "end_turn",
        "stop_sequence": None, "usage": {"input_tokens": 10, "output_tokens": 1},
    })

client = anthropic.Anthropic(api_key="sk-prueba", http_client=httpx2.Client(transport=httpx2.MockTransport(capturar)))
print("SDK", anthropic.__version__)
resp = client.messages.create(model=MODEL, max_tokens=1024, messages=[{"role": "user", "content": "Hola"}])
print("stop_reason:", resp.stop_reason)

try:
    client.messages.create(model=MODEL, max_tokens=1024, temperature=0, messages=[{"role": "user", "content": "Hola"}])
except TypeError as e:
    print("TypeError:", e)

try:
    anthropic.Anthropic(api_key="sk-prueba", auth_token="otro")
except ValueError as e:
    print("ValueError:", str(e)[:80])

from anthropic.types import MessageParam
try:
    MessageParam(role="user", content="Hola")
except TypeError as e:
    print("TypeError:", str(e)[:80])
```

Salida real con `anthropic` 2.3.0:

```text
SDK 2.3.0
anthropic-version: 2026-10-21
authorization: Bearer sk-pru…
x-api-key presente: False
cuerpo: {'max_tokens': 1024, 'messages': [{'role': 'user', 'content': 'Hola'}], 'model': 'claude-sonnet-5-5'}
stop_reason: end_turn
TypeError: Messages.create() got an unexpected keyword argument 'temperature'
ValueError: Pass at most one of `api_key=`, `auth_token=`, `credentials=`, `config=`, or `pr
TypeError: Cannot instantiate typing.Union
```

El mismo truco te sirve en los tests de tu aplicación: un transporte falso comprueba la forma de la petición sin gastar tokens.

## Migración: antes y después

Un juez de evals típico escrito para el SDK 1.x. Cada línea marcada rompe con el 2.x:

```diff
 import anthropic
-import httpx
-from anthropic.types import MessageParam
+import httpx2

 MODEL = "claude-sonnet-5-5"
-client = anthropic.Anthropic(api_key=CLAVE, auth_token=TOKEN_PASARELA,
-                             http_client=httpx.Client(timeout=30))
+client = anthropic.Anthropic(api_key=CLAVE, http_client=httpx2.Client(timeout=30))

 def juzgar(respuesta: str) -> str:
     resp = client.messages.create(
         model=MODEL,
         max_tokens=1024,
-        temperature=0,
-        messages=[MessageParam(role="user", content=f"¿Cumple la rúbrica?\n{respuesta}")],
+        output_config={"format": {"type": "json_schema", "schema": VEREDICTO}},
+        messages=[{"role": "user", "content": f"¿Cumple la rúbrica?\n{respuesta}"}],
     )
-    return resp.content[0].text
+    return next(b.text for b in resp.content if b.type == "text")
```

`temperature=0` desaparece y su intención (un veredicto estable) pasa a un esquema de salida cerrado. El texto se busca por tipo de bloque: con el razonamiento adaptativo por defecto de los 5.x, el primer bloque puede ser `thinking`. Por lo mismo, no aprietes `max_tokens`: el razonamiento cuenta dentro de ese tope aunque no se devuelva, y un límite de pocos cientos de tokens puede cortar la respuesta con `stop_reason: "max_tokens"`. Si tu pasarela necesitaba su propio token, la guía de migración propone pasarlo como `auth_token` y poner la clave en `default_headers` como `X-Api-Key`, con la pasarela quitando su `Authorization` antes de reenviar.

## Lista de comprobación

1. Busca en el código `temperature`, `top_p`, `top_k` (también en `extra_body` y en lotes de Batch) y decide qué los sustituye.
2. Busca `MessageParam(` y `BetaMessageParam(` llamados como constructor; pásalos a dict.
3. Busca `X-Api-Key` en proxies, *middleware*, filtros de logs y *stubs* de test.
4. Comprueba que ningún cliente recibe dos credenciales (código y variables de entorno).
5. Cambia cualquier `http_client` propio a `httpx2` y revisa que usas Python 3.10 o superior.
6. Mueve los bloques `document` de mensajes `assistant` a mensajes `user` y quita `citations` de los bloques `text` que envías como `user`.
7. Si usas Bedrock, confirma que el modelo es 4.7 o posterior.
8. Sube el SDK (`anthropic>=2`, `@anthropic-ai/sdk>=1`) **en el mismo despliegue** que los arreglos y pasa tus evals antes de publicar.
9. Aprovecha para revisar lo que no depende de la versión pero rompe en los modelos 5.5: `tool_choice` forzado da 400 ([[radar/2026-10-23-no-se-puede-forzar-herramienta]]) y `budget_tokens` también ([[docs/prompting/04-razonamiento]]).

## Errores frecuentes

- **Pensar que fijar `anthropic-version` a mano en `extra_headers` migra el código.** El SDK sigue teniendo los tipos de su versión mayor. Migra el SDK.
- **Subir el SDK sin probar.** El cambio de cabecera de autenticación rompe pasarelas que nadie recordaba.
- **Sustituir `temperature=0` por nada.** El juez se vuelve menos estable sin que lo notes. Mide la concordancia del juez antes y después ([[recetas/validar-un-modelo-juez]]).
- **Mezclar dos copias del SDK** en TypeScript por no subir los paquetes de plataforma a la vez.

## Ver también

- [[docs/fundamentos/03-api-de-mensajes]]: roles y bloques.
- [[docs/fundamentos/06-motivos-de-parada-y-rechazos]]: los `stop_reason` actuales.
- [[herramientas/anthropic-sdk]]: la ficha del SDK.
- [[modelos/06-parametros]]: qué parámetros quedan y para qué sirve cada uno.
