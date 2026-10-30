---
titulo: Antipatrones
descripcion: Ocho errores habituales al trabajar con modelos de lenguaje, por qué fallan y cómo arreglarlos, con ejemplos antes y después.
creado: 2026-10-15
actualizado: 2026-10-29
orden: 8
tags: [prompting, antipatrones, modelos, buenas-practicas]
relacionados: ["[[modelos/01-principios-de-prompting]]", "[[modelos/09-checklist-produccion]]", "[[patrones/01-workflows-vs-agentes]]"]
---

**Principio**: la mayoría de los fallos con modelos vienen de unos pocos errores repetidos; reconocerlos te ahorra semanas de iteración a ciegas.

Cada antipatrón tiene la misma estructura: qué es, por qué falla y cómo se arregla.

## 1. Gritar al modelo

Prompts llenos de `MUY IMPORTANTE`, `NUNCA`, `CRÍTICO` y mayúsculas. Venía de modelos antiguos que ignoraban instrucciones. Los actuales las siguen con atención y, ante tanto énfasis, **sobrerreaccionan**: aplican la regla donde no toca o se vuelven rígidos.

```text title="Antes"
CRÍTICO: SIEMPRE usa la herramienta buscar_docs. NUNCA respondas sin buscar.
```

```text title="Después"
Usa buscar_docs cuando la pregunta trate sobre nuestro producto,
porque la documentación cambia a menudo y tu conocimiento puede estar desactualizado.
Para saludos o preguntas generales, responde directamente.
```

**Arreglo**: tono normal y el porqué de la regla ([[modelos/01-principios-de-prompting]]). En agentes, obligar a usar una herramienta tampoco se arregla en la API: en los modelos actuales de Claude, `tool_choice` forzado devuelve 400.

## 2. El prompt de parches

Cada fallo en producción añade una línea al prompt. Tras unos meses hay reglas que se contradicen («sé breve», «explica con detalle») y nadie sabe cuáles siguen haciendo falta.

**Arreglo**: reescribe el prompt de vez en cuando desde cero, con tu conjunto de [[glosario/evals|evals]] como red de seguridad. Si una regla no cambia ningún resultado de la eval, sobra. Agrupa las reglas por tema y resuelve las contradicciones de forma explícita («sé breve salvo si el usuario pide detalle»).

## 3. Volcar todo en el contexto

Meter el manual entero, las veinte herramientas y el historial completo «por si acaso». El modelo tiene más donde perderse, cada llamada cuesta más y tarda más.

```text title="Antes"
[manual de 200 páginas] + [30 herramientas] + pregunta
```

```text title="Después"
[5 fragmentos recuperados del manual] + [4 herramientas de esta tarea] + pregunta
```

**Arreglo**: el contexto mínimo suficiente ([[modelos/02-ingenieria-de-contexto]]).

## 4. Ejemplos clónicos

Tres ejemplos *[[glosario/few-shot|few-shot]]* casi idénticos: misma longitud, misma estructura, mismo tema. El modelo copia esos rasgos en todas las respuestas, aunque no vengan al caso.

**Arreglo**: ejemplos variados que cubran los tipos de entrada reales, incluido algún caso límite. Y nunca uses como ejemplos los casos de tu eval: la eval dejaría de medir.

## 5. Parsear texto libre

Pedir «responde en JSON» y hacer `json.loads()` sobre la respuesta. Funciona casi siempre, hasta el día en que llega con una frase delante o un campo con otro nombre.

```diff
- texto = resp.content[0].text
- datos = json.loads(texto)  # rezar
+ resp = client.messages.create(..., output_config={"format": {"type": "json_schema", "schema": ESQUEMA}})
+ datos = json.loads(resp.content[0].text)
+ errores = validar_reglas_de_negocio(datos)
```

**Arreglo**: salidas estructuradas por esquema y validación del contenido en código ([[modelos/03-formato-y-salidas-estructuradas]]). Si ya te pasa en producción, sigue [[problemas/json-invalido-del-modelo]].

## 6. Pedir que no alucine

«No te inventes nada», «sé preciso», temperatura a cero (en la API de Claude ya ni existe: ver [[modelos/06-parametros]]). Ninguna de estas cosas le da al modelo la información que le falta. Si no sabe la respuesta y nadie le ha dicho que puede decir «no lo sé», tenderá a completar.

```text title="Antes"
Responde con precisión y NO te inventes nada.
```

```text title="Después"
Responde solo con la información de <documentos>.
Si la respuesta no está ahí, di «No tengo esa información» y sugiere a quién preguntar.
Cita el id del documento de cada dato.
```

**Arreglo**: [[glosario/grounding|grounding]], permiso explícito para abstenerse y citas verificables ([[modelos/07-documentos-largos]]).

## 7. Un agente para todo

Construir un [[glosario/agente|agente]] autónomo para una tarea que siempre sigue los mismos pasos. El agente es más lento, más caro, más difícil de depurar y a veces se salta un paso.

```text title="Antes"
Agente con herramientas: leer_factura, extraer_campos, validar, guardar.
El modelo decide el orden en cada ejecución.
```

```text title="Después"
Workflow en código: leer → extraer (llamada al modelo con esquema) → validar → guardar.
El modelo solo interviene en el paso que necesita lenguaje.
```

**Arreglo**: si conoces los pasos, escríbelos en código. Reserva los agentes para tareas donde los pasos dependen de lo que se va encontrando ([[patrones/01-workflows-vs-agentes]]). Lo mismo vale para los frameworks: un encadenado de tres llamadas no necesita un grafo de LangGraph ([[docs/frameworks/01-elegir-framework]]).

## 8. Iterar a ojo

Cambiar el prompt, probar con dos ejemplos, «parece que va mejor», desplegar. Una semana después aparece una regresión en un caso que antes funcionaba.

**Arreglo**: un conjunto de prueba fijo, aunque sea pequeño, y ejecutarlo antes de cada cambio. Veinte casos bien elegidos bastan para empezar ([[docs/evals/01-disenar-evals]]).

## Señales de alarma

> [!aviso] Si reconoces alguna de estas frases, revisa el antipatrón correspondiente
> «Le he añadido otra regla al prompt» (2) · «Le paso todo para que tenga contexto» (3) · «Lo he probado con un par de ejemplos» (8) · «Es que a veces devuelve el JSON raro» (5) · «Le he puesto que no se invente cosas» (6).

## Cuándo no aplica

En exploración rápida, todo vale: escribir un prompt torpe para ver si una idea funciona es razonable. Los antipatrones importan cuando el prompt va a vivir en producción, lo van a mantener otras personas o se ejecuta miles de veces.

## Para seguir

- [[modelos/09-checklist-produccion]]: la lista para comprobar antes de desplegar.
- [[modelos/01-principios-de-prompting]]: la versión en positivo.
- [[roadmap/10-prompting/05-iterar-con-casos-de-prueba]]: iterar con método.
