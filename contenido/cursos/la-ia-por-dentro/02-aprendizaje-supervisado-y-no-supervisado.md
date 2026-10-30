---
titulo: Aprendizaje supervisado, no supervisado y por refuerzo
descripcion: Los paradigmas de aprendizaje según la señal que recibe el modelo, y por qué el preentrenamiento de un LLM es autosupervisado y su ajuste usa refuerzo.
creado: 2026-10-29
orden: 2
minutos: 25
tipo: teoria
objetivos:
  - Distinguir los paradigmas de aprendizaje por la señal que recibe el modelo (respuesta correcta, ninguna o recompensa).
  - Reconocer problemas de clasificación, regresión, clustering y reducción de dimensión.
  - Explicar por qué el preentrenamiento de un LLM es autosupervisado y en qué fases entran el aprendizaje supervisado y el refuerzo.
requiere: ["[[cursos/la-ia-por-dentro/01-ia-machine-learning-y-deep-learning]]"]
relacionados: ["[[glosario/aprendizaje-supervisado]]", "[[glosario/aprendizaje-no-supervisado]]", "[[glosario/aprendizaje-por-refuerzo]]", "[[glosario/preentrenamiento]]", "[[glosario/rlhf]]"]
tags: [fundamentos, machine-learning]
---

Al terminar esta lección sabrás clasificar cualquier problema de machine learning según la señal con la que aprende el modelo, y entenderás por qué un LLM pudo entrenarse con cantidades de texto que ningún equipo humano podría etiquetar. Verás los tres paradigmas clásicos funcionando en numpy, más un cuarto, en Python puro, que es la base de los LLM.

## La idea

En la lección anterior viste que entrenar es ajustar parámetros para reducir un error. La pregunta es: ¿error respecto a qué? Lo que distingue a los paradigmas de aprendizaje es **de dónde sale la señal** que le dice al modelo si lo está haciendo bien.

| Paradigma | Qué recibe el modelo | Qué aprende | Ejemplo |
|---|---|---|---|
| Supervisado | Entradas con su respuesta correcta | La relación entre entrada y respuesta | Spam o no spam, precio de un piso |
| No supervisado | Solo entradas | La estructura de los datos: grupos, ejes principales | Segmentar clientes por comportamiento |
| Por refuerzo | Una recompensa después de actuar | Qué acciones convienen en cada situación | Jugar a un juego, controlar un robot |
| Autosupervisado | Datos en bruto, de los que se fabrican las respuestas | Predecir una parte oculta a partir del resto | Preentrenamiento de un LLM |

## Supervisado: con la respuesta delante

En el [[glosario/aprendizaje-supervisado|aprendizaje supervisado]] cada ejemplo trae su etiqueta: este correo es spam, este piso costó tanto, esta radiografía tiene una fractura. El modelo aprende la relación y, si generaliza bien, la aplica a casos que no ha visto.

Hay dos tipos de problema según lo que se predice:

- **Clasificación**: una categoría entre varias (spam o no, idioma del texto, intención del cliente).
- **Regresión**: un número continuo (precio, temperatura, minutos de retraso). La recta de Celsius a Fahrenheit de la lección anterior era una regresión.

Su gran limitación es el coste de las etiquetas. Alguien tiene que revisar miles de ejemplos y poner la respuesta correcta, y en dominios como el médico o el legal ese alguien es caro.

## No supervisado: buscar estructura sin respuestas

El [[glosario/aprendizaje-no-supervisado|aprendizaje no supervisado]] recibe solo las entradas y busca estructura en ellas. Los dos problemas típicos son:

- **Clustering**: agrupar ejemplos parecidos sin saber de antemano qué grupos existen. Por ejemplo, descubrir tipos de clientes a partir de su historial de compras.
- **Reducción de dimensión**: describir cada ejemplo con menos números sin perder lo importante. Si las 200 columnas que describen a un cliente están muy relacionadas entre sí, unos pocos números pueden conservar casi toda la información. La misma idea, llevada más lejos, está detrás de los [[glosario/embeddings|embeddings]]: vectores donde la cercanía significa parecido.

El script compara los dos enfoques con los mismos 90 puntos repartidos en tres grupos. El clasificador supervisado usa las etiquetas `y`; el k-means no las mira nunca.

```python title="paradigmas.py"
import numpy as np

rng = np.random.default_rng(1)
centros = np.array([[0, 0], [5, 5], [0, 6]])
X = np.vstack([c + rng.normal(0, 0.8, size=(30, 2)) for c in centros])  # 90 puntos
y = np.repeat([0, 1, 2], 30)                                              # etiquetas puestas a mano

# Supervisado: aprende de pares (punto, etiqueta) y clasifica un punto nuevo.
medias = np.array([X[y == c].mean(axis=0) for c in range(3)])
nuevo = np.array([4.2, 5.5])
print("supervisado, clase del punto nuevo:", np.linalg.norm(medias - nuevo, axis=1).argmin())

# No supervisado: k-means con los mismos puntos, SIN mirar y.
def kmeans(X, k, pasos=10):
    centroides = X[rng.choice(len(X), size=k, replace=False)]
    for _ in range(pasos):
        dist = np.linalg.norm(X[:, None, :] - centroides[None, :, :], axis=2)  # (n, k)
        grupo = dist.argmin(axis=1)                                          # el centroide más cercano
        centroides = np.array([X[grupo == j].mean(axis=0) for j in range(k)])
    return centroides, grupo

centroides, grupo = kmeans(X, k=3)
print("no supervisado, centroides encontrados:")
print(centroides[np.argsort(centroides.sum(axis=1))].round(2))
print("puntos por grupo:", np.bincount(grupo))
```

```text
supervisado, clase del punto nuevo: 1
no supervisado, centroides encontrados:
[[ 0.03 -0.1 ]
 [-0.15  5.96]
 [ 4.92  5.  ]]
puntos por grupo: [30 30 30]
```

El clasificador supervisado es el más simple posible: calcula con las etiquetas el centro de cada clase y asigna el punto nuevo a la clase cuyo centro tiene más cerca. El punto (4,2; 5,5) cae en la clase 1, la del grupo de (5, 5).

El k-means ha encontrado los tres centros reales, (0, 0), (0, 6) y (5, 5), con 30 puntos en cada grupo, sin ver una sola etiqueta. Lo que no sabe es qué significa cada grupo: ponerles nombre te toca a ti. Y hay otra decisión que tomaste tú: `k=3`. Sin etiquetas no hay una respuesta correcta con la que comparar, y por eso evaluar un modelo no supervisado es más difícil que evaluar uno supervisado.

## Por refuerzo: aprender de las consecuencias

En el [[glosario/aprendizaje-por-refuerzo|aprendizaje por refuerzo]] nadie dice cuál era la respuesta correcta. Un agente actúa en un entorno, recibe una recompensa (o nada) y ajusta su forma de actuar para conseguir más recompensa con el tiempo. El dilema central es **explorar o explotar**: probar opciones nuevas por si son mejores o repetir la mejor que conoce.

El ejemplo más pequeño posible son tres máquinas tragaperras con probabilidades de premio distintas que el agente desconoce.

```python title="refuerzo.py"
import numpy as np

rng = np.random.default_rng(7)
prob_premio = np.array([0.2, 0.5, 0.8])  # el agente NO conoce estos valores
estimado = np.zeros(3)                   # lo que el agente cree que vale cada acción
veces = np.zeros(3)

for paso in range(1000):
    if rng.random() < 0.1:                   # 10 % de las veces explora al azar
        accion = rng.integers(3)
    else:                                    # el resto, explota la mejor que conoce
        accion = estimado.argmax()
    recompensa = float(rng.random() < prob_premio[accion])   # 1 o 0: solo una señal
    veces[accion] += 1
    estimado[accion] += (recompensa - estimado[accion]) / veces[accion]  # media incremental

print("valor estimado por acción:", estimado.round(2))
print("veces que eligió cada acción:", veces.astype(int))
```

```text
valor estimado por acción: [0.15 0.45 0.81]
veces que eligió cada acción: [ 40  40 920]
```

Solo con premios de 0 o 1, el agente ha descubierto que la tercera máquina es la mejor y la ha elegido 920 veces de 1.000. Sus estimaciones de las otras dos son más bastas porque apenas las probó: es el precio de explotar.

> [!nota] Dos sentidos de «agente»
> En refuerzo, «agente» es el sistema que aprende actuando. En esta web, un [[glosario/agente|agente]] suele ser un programa que llama a un LLM en bucle y ejecuta herramientas. Comparten la idea de actuar, observar el resultado y decidir el siguiente paso, pero un agente con LLM no ajusta sus pesos mientras trabaja.

## Autosupervisado: la base de los LLM

Queda un truco que cambió la escala de todo. En el aprendizaje autosupervisado las etiquetas salen de los propios datos: escondes una parte y pides al modelo que la prediga. Con texto es inmediato. Cada trozo inicial de una frase es una entrada, y la palabra que viene después es su respuesta correcta.

```python title="autosupervisado.py"
texto = "el gato duerme en el sofá"
palabras = texto.split()

# Cada prefijo del texto es una entrada; la palabra que sigue es su etiqueta.
for i in range(1, len(palabras)):
    print(f"{' '.join(palabras[:i]):<22} → {palabras[i]}")
```

```text
el                     → gato
el gato                → duerme
el gato duerme         → en
el gato duerme en      → el
el gato duerme en el   → sofá
```

Una frase de seis palabras da cinco ejemplos etiquetados sin que intervenga ninguna persona. Cualquier texto se convierte en datos de entrenamiento supervisado, sin coste de etiquetado. Eso es el [[glosario/preentrenamiento|preentrenamiento]] de un LLM: esta misma tarea, con [[glosario/token|tokens]] en lugar de palabras y con cantidades enormes de texto.

## Qué tiene que ver con los LLM y los agentes

Un LLM moderno combina tres de estos paradigmas, en este orden:

1. **Preentrenamiento autosupervisado**: predecir el siguiente token en grandes cantidades de texto. De aquí sale casi todo lo que el modelo sabe.
2. **Ajuste supervisado con instrucciones**: pares de instrucción y respuesta escritos o revisados por personas, para que aprenda a seguir órdenes y a conversar.
3. **Refuerzo**: en el [[glosario/rlhf|RLHF]] se entrena un modelo de recompensa con preferencias humanas entre varias respuestas y el LLM se ajusta para maximizar esa recompensa. Ouyang et al. (2022) lo describen en [*Training language models to follow instructions with human feedback*](https://arxiv.org/abs/2203.02155). Los [[glosario/modelo-de-razonamiento|modelos de razonamiento]] añaden más refuerzo encima.

El detalle de estas fases está en [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]].

Para quien construye agentes hay tres consecuencias directas:

- **Los ejemplos *few-shot* se parecen al aprendizaje supervisado sin tocar los pesos.** Pones pares de entrada y salida en el prompt y el modelo imita el patrón dentro de esa llamada. Es la técnica de [[roadmap/10-prompting/02-ejemplos-few-shot]], y Brown et al. (2020) mostraron en [*Language Models are Few-Shot Learners*](https://arxiv.org/abs/2005.14165) que funciona mejor cuanto más grande es el modelo.
- **Tus evals son un conjunto supervisado.** Un [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] es una lista de entradas con su salida esperada o con un criterio para juzgarla. Necesitas construirlo igual que se construye un dataset etiquetado ([[roadmap/80-evals/02-conjunto-de-prueba]]).
- **El clustering sirve para operar agentes.** Agrupar las preguntas reales de tus usuarios o los fallos de tu agente por parecido, con embeddings, te dice qué casos son frecuentes y dónde fallas más.

## Ejercicio

> [!ejercicio] Juega con las señales
> 1. En `paradigmas.py`, ejecuta el k-means con `k=2` y con `k=4`. Mira qué pasa con los grupos.
> 2. En `refuerzo.py`, cambia la exploración de `0.1` a `0.0` y vuelve a ejecutar.
> 3. Clasifica cada problema por paradigma y tipo: predecir cuántos minutos tardará un pedido, detectar transacciones raras sin ejemplos de fraude, decidir cuándo lanzar una promoción según la respuesta de los clientes, agrupar tickets de soporte por tema.
>
> Está bien si: ves que con `k=2` el algoritmo fusiona dos grupos reales y con `k=4` parte uno en dos; con exploración cero el agente se queda atascado en la primera máquina (la elige las 1.000 veces y nunca prueba las otras); y en la clasificación justificas cada caso por la señal disponible.

> [!ejercicio]- Pistas
> Con exploración cero, todas las estimaciones empiezan en 0 y `argmax` elige la primera. Si esa máquina da algún premio, su estimación sube por encima de 0 y ya nunca cambia de opinión. Para la clasificación, pregúntate si existe una respuesta correcta conocida para cada ejemplo.

## Resumen

- El paradigma depende de la señal: respuesta correcta (supervisado), ninguna (no supervisado) o recompensa (refuerzo).
- Supervisado se divide en clasificación y regresión; no supervisado, en clustering y reducción de dimensión.
- El autosupervisado fabrica las etiquetas a partir de los datos, y por eso permitió entrenar con todo el texto disponible.
- Un LLM se preentrena de forma autosupervisada, se ajusta con instrucciones (supervisado) y se pule con refuerzo.
- Tus ejemplos *few-shot* y tus evals son, en el fondo, datos supervisados.

## Para seguir

- [[cursos/la-ia-por-dentro/03-de-las-reglas-a-las-probabilidades]]: qué hace el modelo con todo lo aprendido cuando genera una respuesta.
- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[glosario/aprendizaje-por-refuerzo]] y [[glosario/rlhf]].
