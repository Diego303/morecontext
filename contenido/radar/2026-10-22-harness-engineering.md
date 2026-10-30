---
titulo: El arnés pasa a ser una disciplina
descripcion: En 2026 «harness engineering» se asienta como el trabajo de diseñar todo lo que rodea al modelo, con casos públicos, un vocabulario común y la primera medición de su coste.
creado: 2026-10-22
categoria: practicas
tags: [harness, agentes, practicas]
fuente:
  titulo: "Birgitta Böckeler (martinfowler.com), 2 abr. 2026 · Harness engineering for coding agent users"
  url: https://martinfowler.com/articles/harness-engineering.html
relacionados: ["[[disciplinas/harness-engineering]]", "[[glosario/harness-engineering]]", "[[roadmap/90-harness/index]]", "[[blog/2026-10-27-el-arnes-importa-y-cuesta]]"]
---

## Qué es

El [[glosario/harness|arnés]] es todo lo que en un agente no es el modelo: instrucciones, herramientas, sandbox, hooks, verificación y orquestación. El término se popularizó en febrero de 2026. [OpenAI (Ryan Lopopolo, 11 feb. 2026)](https://openai.com/index/harness-engineering/) contó cómo construyó un producto sin escribir código a mano, con `AGENTS.md` como índice corto, documentación versionada como fuente de verdad y linters cuyos mensajes dicen cómo arreglar el fallo. LangChain lo resumió en «Agente = Modelo + Arnés» ([mar. 2026](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)). Birgitta Böckeler (2 abr. 2026) le dio vocabulario: **guías** que actúan antes (specs, ejemplos, reglas) y **sensores** que dan feedback después (tests, linters, revisores), computacionales o inferenciales.

## Qué cambia en la práctica

- El arnés se diseña, se mide y se mejora como cualquier otro sistema. Cada fallo repetido es una pieza que falta.
- Cambiar solo el arnés mueve resultados: LangChain pasó de 52,8 % a 66,5 % en Terminal-Bench 2.0 con el modelo fijo.
- Y cuesta. [Naresh Jain (13 oct. 2026)](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html) midió que con un modelo frontera el arnés multiplicó el coste por unas 7 sin mejorar el acierto, mientras que con un modelo barato lo llevó de 3/10 a 10/10.

## Qué hacer

1. Mide primero sin arnés extra. Si el modelo ya acierta siempre, añade solo una puerta de aceptación final independiente.
2. Prefiere sensores deterministas (tests, linters con instrucción de arreglo) y usa los inferenciales donde no lleguen.
3. Retira piezas cuando un modelo nuevo las haga innecesarias.
4. Empieza por [[roadmap/90-harness/01-que-es-un-harness]] y la disciplina [[disciplinas/harness-engineering]]; para construir uno completo, [[cursos/harness-engineering/index]].
