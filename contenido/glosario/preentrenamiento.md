---
titulo: Preentrenamiento
descripcion: Primera fase del entrenamiento de un LLM, en la que aprende a predecir el siguiente token con cantidades enormes de texto sin etiquetas humanas.
creado: 2026-10-29
categoria: fundamentos
ingles: Pretraining
aliases: [Pretraining, pre-training, modelo base, aprendizaje autosupervisado, self-supervised learning]
tags: [fundamentos, entrenamiento, llm]
relacionados: ["[[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]", "[[glosario/modelo-fundacional]]", "[[glosario/leyes-de-escalado]]"]
---

El preentrenamiento es la primera fase del entrenamiento de un LLM, y la más cara: el modelo lee cantidades enormes de texto (web, libros, código) y aprende a predecir el siguiente [[glosario/token|token]]. Es aprendizaje autosupervisado, porque la respuesta correcta de cada paso es el token que de verdad viene después y nadie tiene que etiquetar nada. El resultado es un **modelo base**.

## En la práctica

De aquí sale casi todo lo que el modelo sabe, y también tres cosas que gestionas tú. El **corte de conocimiento**: no sabe lo posterior a sus datos, así que dáselo en el contexto con [[glosario/rag|RAG]] o herramientas. Los **sesgos**: reproduce lo frecuente en el corpus, así que evalúa en tu idioma y tu dominio. Y la capacidad de aprender del prompt con ejemplos [[glosario/few-shot|few-shot]]. Un modelo base continúa texto en lugar de seguir órdenes: si usas uno de pesos abiertos para chatear, busca la versión *instruct* o *chat*. La idea de preentrenar un modelo generativo y adaptarlo después la popularizó el primer GPT ([Radford et al., 2018](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)).

## No confundir con

- **[[glosario/fine-tuning|Fine-tuning]]**: seguir entrenando un modelo ya preentrenado con pocos datos propios.
- **[[glosario/rlhf|RLHF]]**: una fase posterior, de alineamiento con preferencias.

## Ver también

- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[cursos/la-ia-por-dentro/02-aprendizaje-supervisado-y-no-supervisado]]
- [[glosario/modelo-fundacional]]
- [[glosario/leyes-de-escalado]]
