---
titulo: Evals antes que prompts
descripcion: Un ensayo sobre por qué deberías escribir los casos de prueba de tu sistema antes de afinar su prompt, y cómo hacerlo sin montar una infraestructura enorme.
creado: 2026-09-10
estado: revision
tipo: ensayo
tags: [evals, prompting, metodo]
relacionados: ["[[disciplinas/evals]]", "[[roadmap/80-evals/01-por-que-evals]]", "[[roadmap/10-prompting/05-iterar-con-casos-de-prueba]]", "[[glosario/evals]]"]
---

Hay un orden natural en el que casi todos empezamos a trabajar con modelos: escribes un prompt, pruebas tres o cuatro entradas a mano, ajustas una frase, vuelves a probar. Cuando parece que va bien, lo das por bueno. Quiero defender el orden contrario: **primero decides cómo vas a medir, y solo después escribes el prompt.**

## El problema de probar a ojo

Probar a mano tiene tres defectos que se agravan con el tiempo.

El primero es la memoria. Cuando cambias el prompt para arreglar el caso C, no vuelves a probar A y B. Si el cambio los rompe, no te enteras hasta que lo ve un usuario. Cualquiera que haya escrito software reconoce esto: es una regresión.

El segundo es la muestra. Tres o cuatro entradas elegidas por ti son las que tú imaginas, no las que llegan. Las entradas reales son más largas, más ambiguas y más raras.

El tercero es el criterio. «Parece que va bien» no es un criterio. Si no has escrito qué significa una respuesta correcta, cada revisión depende de tu humor de ese día, y dos personas del equipo juzgarán distinto.

Los modelos añaden un cuarto: no son deterministas. La misma entrada puede dar salidas distintas. Una prueba que pasa una vez puede fallar la siguiente.

## Qué significa «evals primero»

No significa montar una plataforma antes de escribir una línea. Significa algo más modesto y más útil:

1. **Escribir qué tiene que hacer el sistema** en términos comprobables. «Clasifica el ticket en una de estas cinco categorías» se puede comprobar. «Responde de forma útil» no, hasta que lo concretas.
2. **Reunir casos.** Veinte o treinta entradas, idealmente reales, con la salida esperada o con lo que debe cumplir. Incluye los casos difíciles y los bordes. Esto es tu [[glosario/conjunto-de-evaluacion|conjunto de evaluación]].
3. **Decidir cómo se puntúa cada caso.** Con código cuando se pueda (coincidencia exacta, JSON válido, contiene la cita correcta) y con un [[glosario/modelo-juez|modelo juez]] con rúbrica cuando no.
4. **Ejecutarlo todo con un comando.** Un script que imprime una tabla basta para empezar.

Con eso, el prompt deja de ser un texto que retocas por intuición y pasa a ser una variable de un experimento. Cada cambio tiene un antes y un después medibles. El método completo está en [[roadmap/10-prompting/05-iterar-con-casos-de-prueba]] y en [[roadmap/80-evals/02-conjunto-de-prueba]].

## Por qué antes y no después

Se puede argumentar que da igual el orden: escribes el prompt, y luego las evals. Creo que no da igual, por dos motivos.

**Escribir los casos te obliga a entender la tarea.** Cuando intentas escribir la salida esperada para un ticket ambiguo, descubres que no sabes en qué categoría va. Esa ambigüedad estaba en la especificación, no en el modelo. Es mejor descubrirla antes de escribir el prompt que atribuirla después a que «el modelo se equivoca». Esta idea conecta con [[disciplinas/spec-primero]].

**Las evals escritas después tienden a confirmar el prompt.** Si ya tienes un prompt que te gusta, eliges sin querer casos que lo hacen quedar bien. Si los casos existen antes, el prompt tiene que ganarse el aprobado.

## El juez también se evalúa

Una advertencia que me parece importante. Usar un modelo como juez es práctico y a menudo necesario, pero el juez tiene sus propios sesgos. Zheng et al. (2023) documentaron varios en *Judging LLM-as-a-Judge*: preferencia por la posición, por respuestas largas o por sus propias salidas. La consecuencia práctica es que el juez necesita una rúbrica concreta y que conviene comprobar, con una muestra revisada por personas, que su veredicto coincide con el humano. La receta [[recetas/modelo-juez-con-rubrica]] lo concreta.

## Lo que ganas a medio plazo

El beneficio más claro llega cuando algo cambia fuera de tu control. Sale un modelo nuevo, cambia el precio, quieres probar un tier más barato. Sin evals, la pregunta «¿podemos cambiar?» se responde con una semana de pruebas manuales y una sensación. Con evals, se responde ejecutando el conjunto con el modelo nuevo y comparando. El método de [[modelos/05-elegir-modelo-por-tarea]] depende de esto: empieza por el modelo más capaz, mide, y baja de tier mientras la métrica aguante.

El segundo beneficio es que las evals se convierten en documentación. Un conjunto de casos con su salida esperada explica qué hace el sistema mejor que cualquier párrafo. Quien llegue nuevo al proyecto puede leerlo y entender los límites.

El tercero es que puedes automatizarlas. Cuando el conjunto existe, meterlo en CI es un paso pequeño, y cada cambio de prompt pasa a revisarse con evidencia. Hablamos de esa tendencia en [[radar/2026-10-06-evals-continuas-en-ci]].

## Por dónde empezar

Si tienes un sistema en marcha sin evals, no empieces por la herramienta. Empieza por apuntar, durante unos días, cada caso en el que el sistema falla o duda. Esa lista es el embrión de tu conjunto. Después escribe para cada uno qué habría sido correcto, y un script que los ejecute. A partir de ahí, cada cambio de prompt empieza ejecutando ese script. El nivel [[roadmap/80-evals/index]] del roadmap sigue el camino completo.

*Borrador inicial: pendiente de reescribir con la voz del autor.*
