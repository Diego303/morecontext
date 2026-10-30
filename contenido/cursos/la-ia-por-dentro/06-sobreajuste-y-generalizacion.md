---
titulo: Sobreajuste y generalización
descripcion: Cuándo un modelo memoriza en lugar de aprender, cómo detectarlo con datos de validación, cómo corregirlo y por qué lo mismo te pasa al evaluar un agente.
creado: 2026-10-29
orden: 6
minutos: 30
tipo: teoria
objetivos:
  - Distinguir subajuste y sobreajuste comparando el error de entrenamiento con el de validación.
  - Explicar para qué sirven los conjuntos de entrenamiento, validación y test, y qué es una fuga de datos.
  - Elegir un remedio adecuado entre más datos, un modelo más simple, regularización, early stopping y dropout.
  - Aplicar la misma lógica a los evals de un agente separando los ejemplos del prompt de los casos de evaluación.
requiere: ["[[cursos/la-ia-por-dentro/05-como-aprende-una-red]]"]
relacionados: ["[[glosario/sobreajuste]]", "[[glosario/conjunto-de-evaluacion]]", "[[roadmap/80-evals/02-conjunto-de-prueba]]", "[[cursos/evals-para-agentes/02-datasets-de-evaluacion]]"]
tags: [fundamentos, machine-learning, evals]
---

Al terminar esta lección sabrás reconocer cuándo un modelo ha memorizado sus datos en lugar de aprender el patrón, y tendrás la regla que más vas a usar al construir agentes: nunca midas la calidad con los mismos ejemplos con los que ajustaste. Lo verás con polinomios en numpy, donde el problema se dispara de forma muy visible.

## La idea

Lo que quieres de un modelo es que acierte con casos que no ha visto. Eso se llama **generalizar**. Bajar el error con los datos de entrenamiento es fácil; lo difícil es que esa mejora se mantenga fuera.

Un ejemplo que cualquier desarrollador reconoce: una función que pasa todos los tests porque comprueba si la entrada es la del test y devuelve el resultado esperado escrito a mano. Los tests salen en verde y la función no sirve para nada más. Eso es **[[glosario/sobreajuste|sobreajuste]]**: el modelo se ha aprendido los ejemplos, incluido su ruido, en lugar de la regla.

El fallo contrario es el **subajuste**: el modelo es demasiado simple para el patrón y falla en todas partes, también en entrenamiento. Una recta intentando seguir una curva.

## Una curva de sobreajuste con polinomios

El script genera 15 puntos de entrenamiento a partir de una curva con ruido y 200 puntos de validación del mismo origen. Después ajusta polinomios cada vez más flexibles y mide el error en los dos conjuntos.

```python title="sobreajuste.py"
import numpy as np

rng = np.random.default_rng(0)

def muestra(n):
    x = rng.uniform(-1, 1, size=n)
    return x, np.sin(3 * x) + rng.normal(0, 0.2, size=n)   # patrón real + ruido

x_ent, y_ent = muestra(15)     # entrenamiento: lo único que ve el ajuste
x_val, y_val = muestra(200)    # validación: datos nuevos del mismo origen

def ajustar(grado, lam=0.0):
    A = np.vander(x_ent, grado + 1)                          # columnas x^grado … x^0
    if lam == 0:
        return np.linalg.lstsq(A, y_ent, rcond=None)[0]      # mínimos cuadrados
    return np.linalg.solve(A.T @ A + lam * np.eye(grado + 1), A.T @ y_ent)  # con penalización L2

def mse(coef, x, y):
    return ((np.polyval(coef, x) - y) ** 2).mean()

print("grado  entrenamiento  validación")
for grado in (1, 3, 5, 9, 14):
    c = ajustar(grado)
    print(f"{grado:>5}  {mse(c, x_ent, y_ent):>13.3f}  {mse(c, x_val, y_val):>10.4g}")

print("\ngrado 14 con regularización")
for lam in (0.0, 0.01, 1.0):
    c = ajustar(14, lam)
    print(f"λ={lam:<5} {mse(c, x_ent, y_ent):>13.3f}  {mse(c, x_val, y_val):>10.4g}")
```

```text
grado  entrenamiento  validación
    1          0.129      0.3156
    3          0.020     0.05048
    5          0.015     0.05404
    9          0.010      0.8238
   14          0.000   1.774e+08

grado 14 con regularización
λ=0.0           0.000   1.774e+08
λ=0.01          0.015     0.08036
λ=1.0           0.109       0.248
```

Lee la primera tabla columna a columna:

- **El error de entrenamiento solo baja.** Cuanto más flexible es el modelo, mejor se adapta a los puntos que ve. Con grado 14 y 15 puntos, el polinomio pasa exactamente por todos: error 0,000.
- **El error de validación baja y luego sube.** Grado 1 es una recta y se queda corta (subajuste). Grados 3 y 5 capturan la curva. Con grado 9 el error ya se multiplica, y con grado 14 se dispara a cifras absurdas, porque entre punto y punto el polinomio oscila como loco para poder tocarlos todos.

Esa forma de U en la validación es la firma del sobreajuste, y solo se ve si mides con datos que el ajuste no ha visto. Con millones de dimensiones no puedes dibujar la curva y mirarla: la única forma de saberlo es separar datos.

## Entrenamiento, validación y test

En un proyecto real se separan tres conjuntos:

| Conjunto | Para qué | Quién lo mira |
|---|---|---|
| Entrenamiento | Ajustar los parámetros | El algoritmo, todo el tiempo |
| Validación | Elegir hiperparámetros (grado, λ, épocas) y detectar sobreajuste | Tú, mientras iteras |
| Test | Una medida final honesta | Nadie hasta el final |

El test tiene una trampa. Si lo consultas cada vez que pruebas algo y eliges según su resultado, se convierte en otro conjunto de validación y acabas sobreajustando también a él. Úsalo poco, al final.

La otra trampa es la **fuga de datos**: que información del conjunto de evaluación se cuele en el de entrenamiento. Pasa con duplicados y casi duplicados (dos fotogramas seguidos de un vídeo, dos mensajes del mismo cliente), y con series temporales barajadas, donde el modelo entrena con datos del futuro. El remedio es separar por grupos (por vídeo, por cliente) o por fecha, no fila a fila al azar. Y si los datos vienen ordenados, por ejemplo por gravedad o por fecha, no cortes el primer 80 % para entrenar: barájalos o estratifica antes.

Al entrenar una red se vigila lo mismo a lo largo del tiempo. La pérdida de entrenamiento sigue bajando época tras época; la de validación baja, se aplana y empieza a subir. Ese punto de giro es donde el modelo empieza a memorizar.

## Remedios

- **Más datos.** Es el remedio más fiable. Con 100 puntos de entrenamiento en lugar de 15, el polinomio de grado 14 de este mismo script baja a un error de validación de 0,05, igual que el de grado 3.
- **Un modelo más simple.** Menos parámetros, menos capacidad para memorizar.
- **Regularización.** Se añade a la pérdida un castigo por tener pesos grandes: `pérdida + λ · suma(w²)`. La segunda tabla lo muestra: con `λ = 0,01`, el mismo polinomio de grado 14 pasa de un error de validación de cientos de millones a 0,08. Con `λ = 1` el castigo es excesivo y el modelo vuelve a quedarse corto (0,248). `λ` es otro hiperparámetro que se elige con validación.
- **Early stopping.** Parar el entrenamiento cuando la pérdida de validación deja de mejorar, y quedarse con los pesos de ese momento.
- **Dropout.** Durante el entrenamiento se apaga al azar una parte de las neuronas en cada paso, de modo que la red no puede depender de ninguna en concreto. Al usar el modelo, se encienden todas.

## Qué tiene que ver con los LLM y los agentes

Los LLM también memorizan. Un texto que aparece muchas veces en los datos de entrenamiento puede salir casi literal. Y si las preguntas de un benchmark público acaban en esos datos, el modelo puntúa alto por haberlas visto, no por saber resolverlas. Por eso una buena nota en un benchmark no garantiza que un modelo resuelva tu caso: pruébalo con el tuyo ([[modelos/05-elegir-modelo-por-tarea]]).

La lección más útil para ti está en tus propios [[glosario/evals|evals]]. Cuando iteras un prompt mirando unos casos, haces a mano lo que hace un algoritmo con el conjunto de entrenamiento: ajustas hasta que esos casos salen bien. Si luego mides con los mismos casos, mides memoria. Algunas reglas que salen directamente de esta lección:

- **No evalúes con tus ejemplos del prompt.** Si un caso está como ejemplo [[glosario/few-shot|few-shot]], el modelo lo tiene delante y lo acertará. Sácalo del [[glosario/conjunto-de-evaluacion|conjunto de evaluación]].
- **Ten un conjunto reservado.** Itera con unos casos y guarda otros que no mires hasta antes de publicar un cambio. Es tu conjunto de test ([[roadmap/80-evals/02-conjunto-de-prueba]], [[cursos/evals-para-agentes/02-datasets-de-evaluacion]]).
- **Separa por origen.** Si tus casos vienen de conversaciones reales, que las variantes de una misma conversación no queden repartidas entre los casos que usas para iterar y los que reservas.
- **Cuidado con el prompt lleno de excepciones.** Añadir una regla especial por cada caso que falla es sobreajustar el prompt: los casos vistos mejoran y los nuevos no. Es la lista de reglas infinitas de la [[cursos/la-ia-por-dentro/03-de-las-reglas-a-las-probabilidades|lección 3]] con otro disfraz ([[roadmap/10-prompting/05-iterar-con-casos-de-prueba]]).
- **Vigila al agente que programa.** Un agente de código puede hacer pasar los tests escribiendo casos especiales, igual que la función del principio. Criterios de aceptación ejecutables y una revisión del cambio lo detectan ([[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]).

> [!aviso] El verde engaña
> Un eval que siempre pasa no demuestra que tu agente funcione. Puede demostrar que tus casos son los mismos que ya ajustaste. Renueva el conjunto con casos reales de producción.

## Ejercicio

> [!ejercicio] Más datos frente a más castigo
> 1. En `sobreajuste.py`, cambia `muestra(15)` por `muestra(100)` en el conjunto de entrenamiento y vuelve a ejecutar.
> 2. Toma un prompt tuyo con ejemplos few-shot y la lista de casos con la que lo evalúas. Busca solapes y crea un conjunto reservado.
>
> Está bien si: con 100 puntos el error de validación de grado 14 baja a un valor parecido al de grado 3 (en torno a 0,05) sin necesidad de regularización, y puedes explicar por qué; y si en tu prompt no queda ningún caso de evaluación que coincida, ni casi, con un ejemplo del prompt, y tienes al menos un 20 % de casos que no usas para iterar.

> [!ejercicio]- Pistas
> Con más puntos, el polinomio tiene muchas más restricciones que parámetros y ya no puede pasar por todos: tiene que seguir el patrón de fondo. Para los solapes, compara textos normalizados (minúsculas, sin espacios repetidos) o, si tienes muchos casos, la similitud entre sus embeddings.

## Resumen

- Generalizar es acertar con datos nuevos; el error de entrenamiento por sí solo no lo mide.
- Subajuste: falla en todo. Sobreajuste: acierta en entrenamiento y falla fuera; se ve en la U del error de validación.
- Entrenamiento para ajustar, validación para decidir, test para una medida final; vigila las fugas entre ellos.
- Remedios: más datos, modelos más simples, regularización, early stopping y dropout.
- En agentes, separa los ejemplos del prompt de los casos de evaluación y guarda un conjunto reservado.

## Para seguir

- [[cursos/la-ia-por-dentro/07-de-las-rnn-al-transformer]]: la arquitectura que hizo posibles los LLM.
- [[roadmap/80-evals/02-conjunto-de-prueba]]: cómo construir tu conjunto de evaluación.
- [[glosario/sobreajuste]] y [[glosario/conjunto-de-evaluacion]].
