---
titulo: De las reglas a las probabilidades
descripcion: Por qué la IA modela el mundo con probabilidades en lugar de reglas, cómo elige un LLM cada token y por qué la respuesta más probable no siempre es la correcta.
creado: 2026-10-29
orden: 3
minutos: 25
tipo: teoria
objetivos:
  - Explicar por qué un modelo probabilístico escala mejor que una lista de reglas con excepciones.
  - Convertir frecuencias o puntuaciones en una distribución de probabilidad, incluida la función softmax.
  - Relacionar la elección del token más probable con cómo genera texto un LLM y con las alucinaciones.
requiere: ["[[cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning]]"]
relacionados: ["[[glosario/alucinacion]]", "[[glosario/temperatura]]", "[[roadmap/00-fundamentos/01-que-es-un-llm]]", "[[blog/2026-10-15-la-respuesta-mas-probable]]"]
tags: [fundamentos, probabilidad, llm]
---

Al terminar esta lección entenderás la idea que más vas a repetir trabajando con LLM: el modelo te da la respuesta más probable según su entrenamiento y el contexto que le pasas, y esa respuesta no siempre es la correcta. Lo verás construyendo un modelo de lenguaje de juguete en numpy que comete, a propósito, el mismo tipo de error que un LLM.

## La idea

Intenta escribir con reglas cuándo un pedido llegará tarde. «Si es festivo, llega tarde.» Pero no si el envío es urgente. Salvo que nieve. Excepto en las ciudades donde el almacén está al lado. Cada observación nueva añade una excepción, y cada excepción tiene sus propias excepciones. Un sistema así crece sin fin y se rompe con el primer caso que nadie previó.

La alternativa es dejar de prometer certezas. Un **modelo probabilístico** no dice «llegará tarde», dice «de los pedidos parecidos a este, llegó tarde una proporción alta». La probabilidad resume todo lo que no sabemos o no merece la pena modelar en detalle: el tráfico, el humor del repartidor, el estado de la furgoneta. Con ese número tú decides qué hacer: avisar al cliente si la probabilidad pasa de un umbral, por ejemplo.

Gran parte del machine learning funciona así: en lugar de una respuesta, el modelo devuelve un reparto de probabilidad entre las respuestas posibles. Lo que haces con ese reparto (quedarte con la más probable, sortear entre las mejores o pedir ayuda a una persona si ninguna destaca) es otra decisión.

## Un modelo de lenguaje en miniatura

Un modelo de lenguaje aprende, para cada contexto, qué palabra suele venir después. La forma más simple de hacerlo es contar. El script siguiente «entrena» con seis frases contando qué palabra sigue a cada par de palabras. El corpus incluye una confusión frecuente: decir que la capital de Australia es Sídney (es Canberra).

```python title="lenguaje_de_juguete.py"
import numpy as np
from collections import Counter, defaultdict

corpus = [
    "la capital de francia es parís",
    "la capital de francia es parís",
    "la capital de italia es roma",
    "la capital de australia es sídney",   # error frecuente en textos reales
    "la capital de australia es sídney",
    "la capital de australia es canberra",
]

# «Entrenar»: contar qué palabra sigue a cada par de palabras.
siguientes = defaultdict(Counter)
for frase in corpus:
    p = frase.split()
    for a, b, c in zip(p, p[1:], p[2:]):
        siguientes[(a, b)][c] += 1

def distribucion(contexto):
    cuenta = siguientes[contexto]
    palabras = list(cuenta)
    frec = np.array([cuenta[w] for w in palabras], dtype=float)
    return palabras, frec / frec.sum()   # frecuencias → probabilidades que suman 1

for pais in ("francia", "australia", "portugal"):
    palabras, prob = distribucion((pais, "es"))
    if not palabras:
        print(f"{pais}: sin datos, el modelo no sabe qué decir")
        continue
    reparto = ", ".join(f"{w} {pr:.2f}" for w, pr in zip(palabras, prob))
    print(f"{pais}: {reparto} → más probable: {palabras[prob.argmax()]}")

rng = np.random.default_rng(0)
palabras, prob = distribucion(("australia", "es"))
print("10 muestras:", " ".join(rng.choice(palabras, size=10, p=prob)))
```

```text
francia: parís 1.00 → más probable: parís
australia: sídney 0.67, canberra 0.33 → más probable: sídney
portugal: sin datos, el modelo no sabe qué decir
10 muestras: sídney sídney sídney sídney canberra canberra sídney canberra sídney canberra
```

Tres ideas en cuatro líneas de salida:

1. **Lo más probable sale de los datos, sean ciertos o no.** El modelo responde «sídney» con dos tercios de probabilidad porque eso es lo que más vio. No tiene forma de saber que es falso.
2. **Muestrear da respuestas distintas con la misma entrada.** Si en lugar de quedarte siempre con la más probable sorteas según las probabilidades, unas veces sale una y otras la otra.
3. **Sin datos, este modelo se calla.** Nunca vio «portugal es», así que no tiene nada que contar. Un LLM no funciona así, y ahí está el problema que viene a continuación.

## De puntuaciones a probabilidades: softmax

Contar no escala: casi ninguna frase larga se repite exactamente, así que la mayoría de contextos no tendrían datos. Una red neuronal resuelve esto de otra forma. En lugar de buscar el contexto en una tabla, lo convierte en números y calcula una **puntuación** (en inglés, *logit*) para cada palabra candidata. Como trabaja con representaciones parecidas para cosas parecidas, puede puntuar contextos que nunca vio.

Las puntuaciones pueden ser cualquier número, positivo o negativo. Para convertirlas en probabilidades se usa la función **softmax**:

```text
p_i = exp(z_i) / suma de exp(z_j) para todos los candidatos j
```

La exponencial vuelve positivos todos los valores y agranda las diferencias; dividir por la suma hace que todo sume 1. Dividir antes las puntuaciones por un número `T`, la temperatura, controla cuánto se concentra el reparto.

```python title="softmax.py"
import numpy as np

def softmax(z):
    e = np.exp(z - z.max())   # restar el máximo evita desbordes y no cambia el resultado
    return e / e.sum()

candidatos = ["parís", "lyon", "madrid"]
logits = np.array([4.0, 1.5, 0.5])        # puntuaciones brutas que daría una red

for t in (0.5, 1.0, 2.0):
    p = softmax(logits / t)
    print(f"T={t}: " + ", ".join(f"{c} {x:.2f}" for c, x in zip(candidatos, p)))
```

```text
T=0.5: parís 0.99, lyon 0.01, madrid 0.00
T=1.0: parís 0.90, lyon 0.07, madrid 0.03
T=2.0: parís 0.68, lyon 0.20, madrid 0.12
```

Con temperatura baja casi siempre sale la primera opción; con temperatura alta, las otras ganan peso. Si tu proveedor permite ajustar la [[glosario/temperatura|temperatura]], es exactamente este divisor; qué parámetros de muestreo acepta cada modelo depende del proveedor y conviene mirarlo en su documentación. Volverás a ver softmax en la [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer|lección 7]], dentro de la atención.

## Cómo genera texto un LLM

Un [[glosario/llm|LLM]] repite este proceso en bucle, un [[glosario/token|token]] cada vez: lee todo el texto que tiene delante, calcula una puntuación para cada token de su vocabulario, aplica softmax, elige uno y lo añade al texto. Después vuelve a empezar con el texto un token más largo. Lo tienes explicado paso a paso en [[roadmap/00-fundamentos/01-que-es-un-llm]].

No hay ninguna consulta a una base de datos de hechos en ese bucle. Cuando responde bien a «¿cuál es la capital de Francia?», es porque «París» es, con muchísima diferencia, la continuación más probable después de esa pregunta.

## Por qué alucina

Una [[glosario/alucinacion|alucinación]] es una respuesta fluida y segura que no se corresponde con los hechos. Con el modelo de juguete delante, sus causas se ven claras:

- **Lo probable no es lo cierto.** Si los datos contienen un error frecuente, el modelo lo aprende. Los textos de entrenamiento de un LLM son enormes, y con ellos llegan también errores, mitos y datos desactualizados.
- **Siempre hay una continuación.** A diferencia del contador, una red puntúa cualquier contexto, incluso uno sobre algo que no conoce. Un modelo de lenguaje sin ajustar continúa «la capital de Valdoria es…» con una ciudad cualquiera, con la misma fluidez que ante Francia. El ajuste posterior enseña a los modelos a reconocer muchos de estos casos y a decir que no lo saben, pero no todos. La fluidez no depende del conocimiento.
- **El error se arrastra.** Cada token nuevo se elige condicionado por los anteriores. Si un token temprano es incorrecto, lo que sigue intenta ser coherente con él y construye una explicación plausible sobre una base falsa.

Los modelos actuales suelen acertar en lo frecuente y simple. Donde más fallan es en lo raro, lo reciente y lo privado: el precio de tu producto, una ley del mes pasado, el nombre de una función de una librería interna.

> [!aviso] Seguridad no es exactitud
> El tono de una respuesta no te dice nada sobre si es cierta. Si importa, compruébalo con datos, con código o con una persona.

## Qué tiene que ver con los LLM y los agentes

El autor lo resume en una idea que conviene llevar siempre encima: un LLM da la respuesta más probable, y la más probable puede no ser la correcta. Todo lo que construyes alrededor de un modelo existe para que esas dos cosas coincidan más a menudo.

- **El contexto mueve las probabilidades.** Si pones en el prompt el documento con la respuesta, la respuesta correcta pasa a ser la más probable. Esa es la idea de [[glosario/rag|RAG]] y del [[disciplinas/context-engineering|context engineering]], y la razón de pedir citas verificables ([[roadmap/30-contexto-y-rag/05-respuestas-con-citas]]).
- **En un agente, cada decisión es una muestra.** Qué herramienta llamar, con qué argumentos y cuándo dar la tarea por terminada son continuaciones probables, no certezas. Por eso validas los argumentos de las herramientas, devuelves los errores al modelo ([[roadmap/20-herramientas/03-errores-e-is-error]]), pones límites de pasos ([[roadmap/40-primer-agente/03-condiciones-de-parada]]) y compruebas el resultado antes de darlo por bueno ([[disciplinas/verificar-antes-de-dar-por-hecho]]).
- **La misma entrada puede dar salidas distintas.** Un eval que ejecutas una sola vez puede engañarte. Repite los casos importantes y mide la proporción de aciertos ([[roadmap/80-evals/01-por-que-evals]]).
- **Las reglas no desaparecen.** Donde la respuesta es exacta y conocida, una línea de código gana a cualquier probabilidad. El modelo es para lo que no cabe en reglas.

## Ejercicio

> [!ejercicio] Cambia lo que cree el modelo
> Añade frases «la capital de australia es canberra» al corpus de `lenguaje_de_juguete.py`, de una en una, y ejecuta el script cada vez.
>
> Está bien si: encuentras cuántas frases hacen falta para que la respuesta más probable pase a ser «canberra» (con 2 frases de cada, empatan a 0,50 y `argmax` se queda con la primera que vio; con una más, canberra gana con 0,60), y puedes explicar con tus palabras qué tiene que ver esto con poner el dato correcto en el contexto de un LLM.

> [!ejercicio]- Pistas
> En un empate, `argmax` devuelve la primera posición, y el orden de las palabras en el `Counter` es el orden en que aparecieron en el corpus. Para el paralelo con un LLM, piensa que el prompt es el único sitio donde puedes añadir «frases» sin reentrenar.

## Resumen

- Las reglas fijas no escalan ante las excepciones del mundo real; la probabilidad resume la incertidumbre.
- Un modelo devuelve un reparto de probabilidad; quedarte con lo más probable o muestrear es una decisión aparte.
- Softmax convierte puntuaciones en probabilidades, y la temperatura regula cuánto se concentran.
- Un LLM genera token a token eligiendo continuaciones probables, sin consultar hechos.
- Alucina porque lo probable no siempre es cierto, porque siempre produce algo y porque arrastra sus errores; el contexto y la verificación son las palancas.

## Para seguir

- [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]: la pieza que calcula esas puntuaciones.
- [[blog/2026-10-15-la-respuesta-mas-probable]]: la idea contada por el autor.
- [[glosario/alucinacion]] y [[glosario/grounding]].
