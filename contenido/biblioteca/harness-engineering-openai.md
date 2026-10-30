---
titulo: Harness engineering (OpenAI, 2026)
descripcion: "Cinco meses construyendo un producto sin escribir código a mano: AGENTS.md como índice, docs/ como fuente de verdad, linters que enseñan y limpieza continua de la deriva."
creado: 2026-10-29
tags: [biblioteca, agentes, harness, agentes-de-codigo]
relacionados: ["[[disciplinas/harness-engineering]]", "[[glosario/harness-engineering]]", "[[roadmap/90-harness/01-que-es-un-harness]]", "[[glosario/agents-md]]"]
autores: Ryan Lopopolo (OpenAI)
anio: 2026
url: https://openai.com/index/harness-engineering/
tipo: ensayo
tema: agentes
nivel: intermedio
---

*Harness engineering: leveraging Codex in an agent-first world* (Ryan Lopopolo, OpenAI, 11 de febrero de 2026) es el relato de un equipo que pasó unos cinco meses construyendo un producto interno con cero líneas escritas a mano: código, tests, CI, documentación y herramientas internas los escribió Codex. Es uno de los textos que popularizaron la expresión [[glosario/harness-engineering|harness engineering]] ese mes, y su valor está en las prácticas concretas, más que en la cifra de líneas.

## La idea clave

Las cifras del [experimento](https://openai.com/index/harness-engineering/) son llamativas: del orden de un millón de líneas, unos 1.500 *pull requests*, de tres a siete ingenieros, 3,5 PR por ingeniero y día al principio y ejecuciones de Codex de más de seis horas en una sola tarea. Pero la tesis va por otro lado. **Al principio avanzaban despacio porque el entorno estaba poco especificado; el modelo no era el cuello de botella.** Cuando algo fallaba, la pregunta era qué herramienta, guía o documento le faltaba al agente, y se le pedía a Codex que lo construyera. El texto lo resume así: «Humans steer. Agents execute.»

De ahí salen cuatro prácticas:

- **AGENTS.md como índice.** Un único archivo de instrucciones enorme falló: el contexto es escaso, las guías se vuelven ruido y se pudren. Lo sustituyeron por un [[glosario/agents-md|AGENTS.md]] de unas 100 líneas que actúa como tabla de contenidos y apunta a un directorio `docs/` versionado: diseños, planes de ejecución, specs de producto, referencias y documentos de calidad y seguridad. Linters y CI comprueban que esa documentación está al día y enlazada.
- **Hacer la aplicación legible para el agente.** La aplicación arranca por cada [[glosario/worktree|worktree]], con su propia pila local de logs, métricas y trazas que el agente consulta, y Chrome DevTools conectado para reproducir fallos y validar arreglos. Lo que el agente no puede ver mientras trabaja, para él no existe: una decisión tomada en un chat hay que llevarla al repositorio.
- **Imponer invariantes y dejar libre la implementación.** Cada dominio tiene capas fijas (Types → Config → Repo → Service → Runtime → UI) con dependencias solo hacia delante, comprobadas con linters propios y tests estructurales. Los mensajes de error de esos linters incluyen la instrucción de cómo arreglarlo, así que el sensor también enseña.
- **Recoger la basura de forma continua.** El agente copia los patrones que ve, también los malos. Dedicaban los viernes (un 20 % de la semana) a limpiar y no escalaba. Lo sustituyeron por «principios dorados» escritos en el repositorio y tareas de fondo que buscan desviaciones y abren PR pequeños de refactorización.

## Por qué importa hoy

Cambia la pregunta de «cómo escribo mejor el prompt» a «qué le falta al entorno». Las cuatro prácticas se trasladan a cualquier proyecto con agentes de código, con cualquier herramienta:

- Un `AGENTS.md` o `CLAUDE.md` corto que apunta a documentación versionada.
- Sensores deterministas (linters, tests estructurales) con mensajes que dicen qué hacer, la idea que Birgitta Böckeler ordena como [[glosario/guias-y-sensores|guías y sensores]].
- Un entorno por cambio, aislado, donde el agente ve logs y la interfaz.
- Cada fallo repetido se convierte en una mejora del harness.

> [!aviso] Un caso con su contexto
> El propio texto avisa de que la autonomía que describe depende de la estructura y las herramientas de ese repositorio, y de que su filosofía de fusionar con puertas mínimas sería irresponsable con poco volumen de cambios.

## Qué leer primero

1. **«Redefining the role of the engineer»**: el cambio de mentalidad.
2. **«We made repository knowledge the system of record»** y **«Agent legibility is the goal»**: lo más aplicable.
3. **«Enforcing architecture and taste»** y **«Entropy and garbage collection»**: cómo mantener la coherencia sin revisar cada línea.
4. **«What we're still learning»**: lo que no saben, que es mucho.

## Qué ha envejecido

Tiene meses, así que lo que hay que revisar es la lectura crítica:

- **Es una fuente interesada.** OpenAI cuenta un éxito con su propio producto. Birgitta Böckeler, en martinfowler.com, lo señaló y añadió que el texto no aborda cómo verificar el comportamiento de lo construido.
- **El coste del harness no aparece.** Naresh Jain, en [*Are Harnesses Worth the Cost?*](https://martinfowler.com/articles/are-harnesses-worth-the-cost.html) (octubre de 2026), encontró que con un modelo de frontera el harness multiplicó el coste por siete sin ganar fiabilidad (10 aciertos de 10 con y sin él), mientras que con un modelo barato pasó de 3 a 10 aciertos de 10. Mide antes de copiar.
- **La coherencia a años vista** es una pregunta abierta que el propio texto reconoce.

## Dónde lo ves en MoreContext

- [[disciplinas/harness-engineering]] y [[roadmap/90-harness/01-que-es-un-harness]]: la disciplina y su nivel del roadmap.
- [[cursos/harness-engineering/01-del-prompt-al-harness]]: el curso para construir el tuyo.
- [[plantillas/agents-md]] y [[docs/claude-code/01-memoria-claude-md-y-agents-md]]: el archivo de instrucciones como índice.
- [[recetas/features-en-paralelo-con-worktrees]]: un entorno aislado por cambio.
- [[radar/2026-10-22-harness-engineering]] y [[radar/2026-10-22-arnes-de-codex-en-abierto]]: cómo evolucionó el tema.
- [[blog/2026-10-27-el-arnes-importa-y-cuesta]]: el coste, en primera persona.
