---
titulo: "ReAct: razonar y actuar (Yao et al., 2022)"
descripcion: El paper que unió razonamiento y acciones en un mismo bucle, qué fallaba en sus experimentos y cómo vive hoy dentro de cada bucle con tool_use.
creado: 2026-10-29
tags: [biblioteca, agentes, react, razonamiento]
relacionados: ["[[glosario/react]]", "[[roadmap/40-primer-agente/02-el-bucle-agentico]]", "[[biblioteca/chain-of-thought]]", "[[biblioteca/toolformer]]"]
autores: Yao et al.
anio: 2022
url: https://arxiv.org/abs/2210.03629
tipo: paper
tema: agentes
nivel: intermedio
---

*ReAct: Synergizing Reasoning and Acting in Language Models* (Shunyu Yao y otros seis autores; primera versión en arXiv en octubre de 2022, versión final para ICLR) propone que un modelo de lenguaje alterne dos cosas que hasta entonces se estudiaban por separado: razonar en voz alta y actuar sobre un entorno. De ahí sale el bucle pensamiento → acción → observación que hoy reconoces en cualquier [[glosario/agente|agente]].

## La idea clave

Antes de ReAct había dos líneas. La [[glosario/cadena-de-pensamiento|cadena de pensamiento]] hacía razonar al modelo paso a paso, pero solo con lo que ya sabía: si le faltaba un dato, lo inventaba. Los agentes que solo actuaban (buscar, hacer clic, comprar) sí tocaban el mundo, pero sin un plan explícito se perdían en tareas largas.

**ReAct añade al espacio de acciones los «pensamientos»: texto libre que no cambia el entorno y solo sirve para decidir la siguiente acción.** Cada acción devuelve una observación real que corrige el razonamiento. En las preguntas sobre Wikipedia (HotpotQA y FEVER) el modelo tenía tres acciones: `search[entidad]`, `lookup[texto]` y `finish[respuesta]`. Los prompts eran trayectorias escritas a mano: seis en HotpotQA, tres en FEVER y una o dos en las tareas interactivas.

```text
# salida de ejemplo
Pensamiento: Primero necesito saber dónde nació Cervantes.
Acción: search[Miguel de Cervantes]
Observación: Miguel de Cervantes Saavedra (Alcalá de Henares, 1547 – Madrid, 1616)…
Pensamiento: Nació en Alcalá de Henares. Ahora busco qué río pasa por allí.
Acción: search[Alcalá de Henares]
Observación: …ciudad situada a orillas del río Henares…
Acción: finish[el río Henares]
```

Los resultados [del paper](https://arxiv.org/abs/2210.03629), con PaLM-540B, merecen leerse con matiz. En las tareas interactivas (ALFWorld y WebShop) ReAct supera a los métodos de imitación y de aprendizaje por refuerzo por 34 y 10 puntos absolutos de tasa de éxito. En HotpotQA, en cambio, ReAct solo (27,4 de coincidencia exacta) queda ligeramente por debajo de la cadena de pensamiento (29,4). Lo mejor fue combinarlos: pasar a *self-consistency* cuando ReAct no termina en un número de pasos, o recurrir a ReAct cuando las muestras de la cadena de pensamiento no se ponen de acuerdo.

Lo más valioso es el análisis de errores sobre 200 trayectorias de HotpotQA. La alucinación explica el 56 % de los fallos de la cadena de pensamiento y ninguno de los de ReAct. Los fallos de ReAct son otros: errores de razonamiento (47 %), entre ellos **bucles que repiten el mismo pensamiento y la misma acción**, y búsquedas que no devuelven nada útil (23 %).

## Por qué importa hoy

Tu [[glosario/bucle-agentico|bucle agéntico]] es un ReAct. El modelo razona (en texto o con [[glosario/razonamiento-extendido|razonamiento extendido]]), emite un bloque `tool_use`, tu código lo ejecuta y le devuelve un `tool_result`. Lo que el paper resolvía con un formato de texto y un *parser* hoy lo resuelve la API.

Las lecciones de fondo siguen vigentes:

- **Anclar el razonamiento en observaciones reduce la invención.** Por eso un agente con buenas herramientas de consulta alucina menos que uno que responde de memoria.
- **La trayectoria se puede leer.** Los autores destacan que las trazas son interpretables. Esa es la base de [[roadmap/40-primer-agente/06-depurar-con-trazas|depurar un agente leyendo sus trazas]].
- **Los modos de fallo son los de hoy.** El bucle repetitivo y la herramienta que devuelve basura siguen siendo las dos averías más comunes. Si tu herramienta responde con un error vago, el razonamiento descarrila igual que con una búsqueda vacía en Wikipedia.

## Qué leer primero

1. **Sección 2**, la formulación. Es corta y basta para entender el mecanismo.
2. **Sección 3.3**, resultados y análisis de errores. Es la parte que más enseña.
3. **Apéndices C y D**, los prompts y trayectorias completas. Ver el formato original ayuda a entender qué hace hoy la API por ti.

Puedes saltarte el detalle del *finetuning* y de las tareas de ALFWorld si no trabajas con entornos simulados.

## Qué ha envejecido

- **El formato de texto parseado.** «Thought / Action / Observation» extraído con expresiones regulares era frágil. Con `tool_use` nativo y [[glosario/salida-estructurada|salidas estructuradas]] no tiene sentido imponerlo.
- **Los ejemplos escritos a mano.** El paper necesitaba trayectorias de demostración; los modelos actuales vienen entrenados para usar herramientas y les basta una buena definición de cada una.
- **El límite de contexto.** Los autores avisan de que las tareas con muchas acciones necesitan más demostraciones de las que caben en la entrada. La tensión sigue con decenas de herramientas, y hoy se ataca con [[recetas/carga-diferida-de-herramientas|carga diferida]].
- **La decodificación voraz.** Los autores sospechan que contribuía a los bucles. Hoy el remedio está en el harness: límites de pasos y detección de repeticiones.

> [!consejo] Lo que no ha envejecido
> Lee tus trazas como los autores leyeron las suyas: clasifica cada fallo (razonamiento, herramienta, dato ambiguo) antes de tocar el prompt.

## Dónde lo ves en MoreContext

- [[roadmap/40-primer-agente/02-el-bucle-agentico]]: el bucle ReAct escrito a mano con el SDK.
- [[docs/agentes/01-el-bucle-agentico]] y [[patrones/08-agente-autonomo]]: la referencia y el patrón.
- [[roadmap/40-primer-agente/03-condiciones-de-parada]]: el límite de pasos que el paper no tenía.
- [[problemas/el-agente-repite-la-misma-herramienta]]: el bucle repetitivo del análisis de errores, con arreglo.
- [[cursos/langchain-y-langgraph/03-tu-primer-agente-con-create-agent]]: el mismo bucle dentro de un framework.
- [[glosario/react]], [[biblioteca/chain-of-thought]] y [[biblioteca/toolformer]]: el término y sus vecinos.
