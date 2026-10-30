---
titulo: Modelo fundacional
descripcion: Modelo entrenado a gran escala con datos amplios que después se adapta a muchas tareas distintas, como los LLM que usas.
creado: 2026-10-29
categoria: fundamentos
ingles: Foundation model
aliases: [Foundation model, modelos fundacionales, modelo de propósito general]
tags: [fundamentos, llm]
relacionados: ["[[glosario/preentrenamiento]]", "[[roadmap/00-fundamentos/07-empresa-modelo-herramienta]]", "[[modelos/10-prompting-rag-o-fine-tuning]]"]
---

Un modelo fundacional es un modelo entrenado con datos muy amplios, casi siempre de forma autosupervisada y a gran escala, que después se adapta a muchas tareas distintas. El término lo propuso el Center for Research on Foundation Models de Stanford en *On the Opportunities and Risks of Foundation Models* ([Bommasani et al., 2021](https://crfm.stanford.edu/report.html)). Los [[glosario/llm|LLM]] son el caso más conocido; también los hay de imagen, audio o multimodales.

## En la práctica

Casi nunca entrenas uno. Es lo que usas por API o descargas como [[glosario/pesos-abiertos|pesos abiertos]], y lo adaptas por orden de coste: con el prompt y ejemplos, con contexto ([[glosario/rag|RAG]], herramientas) y, rara vez, con [[glosario/fine-tuning|fine-tuning]]. Que un mismo modelo sirva de base a tantas aplicaciones tiene contrapartida: sus fallos y sesgos se heredan en todo lo que se construye encima, así que compruébalo en tu caso con tus [[glosario/evals|evals]].

## No confundir con

- **Modelo base**: el resultado del [[glosario/preentrenamiento|preentrenamiento]], antes del ajuste con instrucciones. «Fundacional» se fija en el papel del modelo como base de muchas aplicaciones, esté ajustado o no.
- **[[glosario/llm|LLM]]**: un tipo concreto de modelo fundacional, el de texto.

## Ver también

- [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]]
- [[roadmap/00-fundamentos/07-empresa-modelo-herramienta]]
- [[modelos/10-prompting-rag-o-fine-tuning]]
