---
titulo: Principios de prompting
descripcion: Ocho principios para escribir prompts que funcionan con los modelos actuales, cada uno con su porqué y un ejemplo antes y después.
creado: 2026-10-08
orden: 1
tags: [prompting, modelos, buenas-practicas]
relacionados: ["[[glosario/prompt]]", "[[roadmap/10-prompting/01-instrucciones-claras]]", "[[docs/prompting/01-prompt-de-sistema]]", "[[modelos/08-antipatrones]]"]
---

Un [[glosario/prompt|prompt]] funciona cuando el modelo tiene todo lo que necesita para hacer la tarea como tú la harías: qué hacer, para qué, con qué datos y cómo entregarlo. Estos ocho principios cubren la mayoría de los casos. Ninguno es un truco: todos consisten en quitar ambigüedad.

## 1. Escribe para un colega brillante que no sabe nada de tu proyecto

**Principio**: el modelo es capaz, pero solo conoce lo que pones en el prompt.

**Por qué funciona**: lo que para ti es obvio (quién es el público, qué se hizo antes, qué cuenta como éxito) el modelo lo tiene que adivinar. Una prueba útil: si un compañero recién llegado no entendería la instrucción sin preguntarte, el modelo tampoco.

```text title="Antes"
Escribe un resumen del informe.
```

```text title="Después"
Escribe un resumen del informe trimestral para el comité de dirección.
Lo leerán en dos minutos antes de una reunión donde decidirán si amplían el presupuesto de soporte.
Quieren saber: qué ha pasado con el volumen de tickets, el tiempo de resolución y la satisfacción.
Máximo 150 palabras. Sin jerga técnica.
```

**Cuándo no aplica**: en tareas triviales y autocontenidas («traduce esta frase al inglés») el contexto extra no aporta.

## 2. Explica el porqué de cada regla

**Principio**: una regla con su motivo se aplica mejor que una regla sola.

**Por qué funciona**: si el modelo entiende la intención, generaliza a casos que no previste la regla. Si solo tiene la orden, la aplica al pie de la letra o la ignora cuando no encaja.

```text title="Antes"
NUNCA uses puntos suspensivos.
```

```text title="Después"
Tu respuesta se leerá en voz alta con un sintetizador de voz,
así que no uses puntos suspensivos: el sintetizador no sabe pronunciarlos.
```

Con el motivo, el modelo evitará también otros símbolos que un sintetizador no lee bien.

**Cuándo no aplica**: reglas puramente formales sin motivo que explicar (un nombre de campo exacto).

## 3. Pide de forma explícita lo que quieres

**Principio**: si quieres un resultado ambicioso o un comportamiento concreto, dilo.

**Por qué funciona**: los modelos actuales siguen las instrucciones con precisión y tienden a hacer lo que pides, no más. Si pides «sugiere cambios», sugerirá; si quieres que los aplique, pídelo.

```text title="Antes"
¿Puedes mirar esta función y ver qué se puede mejorar?
```

```text title="Después"
Refactoriza esta función para que sea legible y aplica los cambios directamente.
Mantén la firma pública. Añade tests para los casos límite que encuentres.
Al final, lista en tres viñetas qué cambiaste y por qué.
```

**Cuándo no aplica**: cuando de verdad quieres solo una opinión o un análisis sin acción.

## 4. Di qué hacer, no solo qué evitar

**Principio**: formula las instrucciones en positivo.

**Por qué funciona**: «no hagas X» deja abierto qué hacer en su lugar. «Haz Y» da un objetivo concreto. Además, nombrar lo prohibido a veces lo pone más presente.

```text title="Antes"
No uses markdown. No hagas listas.
```

```text title="Después"
Responde en párrafos de prosa corrida, de dos a cuatro frases cada uno.
```

**Cuándo no aplica**: prohibiciones de seguridad claras («no reveles el número de tarjeta completo»), que conviene dejar explícitas. Y recuerda que las prohibiciones importantes se aplican también en el código ([[docs/seguridad/02-permisos-y-minimo-privilegio]]).

## 5. Enseña con ejemplos variados

**Principio**: tres o cinco ejemplos bien elegidos valen más que un párrafo de explicación.

**Por qué funciona**: los ejemplos fijan el formato, el tono y los casos límite de una vez. Es la técnica *[[glosario/few-shot|few-shot]]* que describieron [Brown et al. (2020)](https://arxiv.org/abs/2005.14165). Deben ser variados: si todos se parecen, el modelo copiará detalles que no querías.

```text title="Antes"
Extrae el sentimiento de la reseña (positivo, negativo o mixto).
```

```text title="Después"
Extrae el sentimiento de la reseña: positivo, negativo o mixto.

<ejemplos>
<ejemplo><resena>Llegó rápido y funciona perfecto.</resena><sentimiento>positivo</sentimiento></ejemplo>
<ejemplo><resena>La pantalla es preciosa, pero la batería no dura nada.</resena><sentimiento>mixto</sentimiento></ejemplo>
<ejemplo><resena>Devuelto. Ni se encendía.</resena><sentimiento>negativo</sentimiento></ejemplo>
</ejemplos>
```

**Cuándo no aplica**: cuando quieres respuestas creativas y variadas; los ejemplos tiran hacia ellos. Más en [[docs/prompting/02-ejemplos-few-shot]].

## 6. Separa las partes con etiquetas XML

**Principio**: marca qué es instrucción, qué es contexto y qué es dato.

**Por qué funciona**: las etiquetas evitan que el modelo confunda un documento con una orden, y te permiten referirte a cada parte por su nombre («usa solo lo que hay en `<contrato>`»). Ningún nombre de etiqueta funciona mejor que otro: elige nombres descriptivos y mantenlos en todo el prompt.

```text title="Antes"
Aquí está el contrato: [texto]. Y estas son las cláusulas estándar: [texto]. Compara.
```

```text title="Después"
<contrato>[texto]</contrato>
<clausulas_estandar>[texto]</clausulas_estandar>

Compara <contrato> con <clausulas_estandar>.
Lista las cláusulas del contrato que se desvían del estándar y explica el riesgo de cada una.
```

**Cuándo no aplica**: prompts de una línea sin datos que separar. Más en [[modelos/02-ingenieria-de-contexto]].

## 7. Da un rol y un objetivo en el prompt de sistema

**Principio**: dile al modelo quién es en esta aplicación y para quién trabaja.

**Por qué funciona**: un rol concreto ajusta el vocabulario, el nivel de detalle y lo que el modelo considera relevante. El [[glosario/prompt-de-sistema|prompt de sistema]] es el sitio natural para las reglas fijas.

```text title="Antes"
Eres un asistente útil.
```

```text title="Después"
Eres el asistente de soporte técnico de una tienda online de material de fotografía.
Atiendes a clientes no expertos. Tu objetivo es resolver la duda en el primer mensaje
y, si no puedes, recoger los datos para que un técnico responda en 24 horas.
```

**Cuándo no aplica**: un rol no sustituye a las instrucciones. «Eres un experto en X» sin más contexto apenas cambia nada.

## 8. Divide lo complejo en pasos

**Principio**: si una tarea tiene varias fases distintas, sepáralas en el prompt o en varias llamadas.

**Por qué funciona**: cada paso recibe toda la atención del modelo y puedes comprobar el resultado intermedio. Es la base del [[patrones/03-encadenado|encadenado de prompts]].

```text title="Antes"
Lee estos 20 tickets, agrúpalos por tema, prioriza y escribe un plan de acción.
```

```text title="Después"
Llamada 1: Clasifica cada ticket en un tema. Devuelve JSON {id, tema}.
Llamada 2: Para cada tema, cuenta tickets y estima impacto (alto, medio, bajo) con una frase de motivo.
Llamada 3: Con esa tabla, escribe un plan de acción de cinco puntos, priorizado por impacto.
```

**Cuándo no aplica**: tareas que el modelo resuelve bien de una vez; dividir añade latencia y coste. Prueba primero en una llamada, con [[modelos/04-dejar-pensar-al-modelo|razonamiento]] si hace falta.

## Y siempre: comprueba con casos

Ningún principio garantiza nada por sí solo. Prepara un puñado de entradas reales, ejecuta el prompt, lee las salidas y ajusta. Cuando el prompt importe, conviértelo en una eval: [[roadmap/10-prompting/05-iterar-con-casos-de-prueba]].
