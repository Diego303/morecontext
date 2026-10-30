---
titulo: Open source AI
descripcion: Sistema de IA que cumple la definición de la OSI, con libertad para usarlo, estudiarlo, modificarlo y compartirlo, más información de datos, código y parámetros.
creado: 2026-10-29
categoria: fundamentos
ingles: Open Source AI Definition
aliases: [Open Source AI Definition, OSAID, IA de código abierto, open source AI]
tags: [fundamentos, licencias, modelos-abiertos]
relacionados: ["[[glosario/pesos-abiertos]]", "[[cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias]]", "[[modelos/11-modelos-abiertos]]", "[[paginas/licencia]]"]
---

Un sistema de IA es *open source* cuando cumple la Open Source AI Definition (OSAID) de la Open Source Initiative, cuya versión 1.0 aprobó su junta el [27 de octubre de 2024](https://opensource.org/meeting-minutes/2024-10-27). Exige las libertades de usarlo para cualquier fin, estudiarlo, modificarlo y compartirlo, y para eso pide tres cosas: información suficiente sobre los datos de entrenamiento, el código completo de procesado y entrenamiento, y los parámetros.

## En la práctica

La definición no obliga a publicar los datos en sí, sino [información detallada](https://www.infoq.com/news/2024/11/open-source-ai-definition) sobre su origen, selección y procesado. Aun así, casi ningún modelo conocido la cumple: la mayoría publica solo los pesos. De los revisados en MoreContext en octubre de 2026, el más cercano es OLMo 3 de Ai2, que publica datos, código y *checkpoints* bajo Apache 2.0.

Por eso en esta web decimos «de [[glosario/pesos-abiertos]]» por defecto y reservamos «open source» para casos como ese. Que los pesos tengan una licencia Apache 2.0 no convierte al modelo en open source AI: puedes usarlo y modificarlo, pero no reproducir su entrenamiento.

## No confundir con

- **[[glosario/pesos-abiertos]]**: publicar los parámetros, con la licencia que sea.
- **Software open source**: la definición clásica de la OSI para código; la OSAID la extiende a sistemas de IA.

## Ver también

- [[cursos/agentes-con-modelos-abiertos/index]]
- [[docs/modelos-abiertos/index]]
