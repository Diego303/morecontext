---
titulo: Función de activación
descripcion: Función no lineal que aplica cada neurona a su suma ponderada; sin ella, apilar capas no añade capacidad.
creado: 2026-10-29
categoria: fundamentos
ingles: Activation function
aliases: [Activation function, activación, ReLU, sigmoide]
tags: [fundamentos, redes-neuronales]
relacionados: ["[[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]", "[[glosario/red-neuronal]]", "[[glosario/descenso-del-gradiente]]"]
---

La función de activación es la que aplica cada neurona a su suma ponderada para dar su salida. Su papel es romper la linealidad: sin ella, cada capa es una multiplicación por una matriz, y cien capas seguidas equivalen a una sola. Las más conocidas son la **sigmoide** (lleva cualquier número a un valor entre 0 y 1), la **tanh** (entre −1 y 1) y la **ReLU** (`max(0, z)`: deja pasar los positivos y anula los negativos).

## En la práctica

Necesita tener pendiente para que el [[glosario/descenso-del-gradiente|descenso del gradiente]] pueda trabajar: por eso el escalón del [[glosario/perceptron|perceptrón]], plano en todas partes salvo en el salto, se sustituyó por curvas suaves. Elegirla es trabajo de quien diseña y entrena la red; como usuario de un LLM nunca la tocas. Te basta con saber qué hace y que la red densa de cada bloque del [[glosario/transformer|Transformer]] la lleva.

## No confundir con

- **Softmax**: convierte un vector de puntuaciones en probabilidades que suman 1. Se aplica a una capa entera, en la salida de un LLM y en la [[glosario/atencion|atención]], no neurona a neurona.

## Ver también

- [[cursos/la-ia-por-dentro/04-la-neurona-y-la-red]]
- [[cursos/la-ia-por-dentro/05-como-aprende-una-red]]
- [[cursos/la-ia-por-dentro/03-de-las-reglas-a-las-probabilidades]]
- [[glosario/red-neuronal]]
