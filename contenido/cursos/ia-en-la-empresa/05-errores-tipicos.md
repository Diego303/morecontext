---
titulo: Seis errores típicos al llevar la IA a una empresa
descripcion: Las seis ideas que más proyectos de IA tuercen en una empresa, por qué aparecen, cómo detectarlas en una reunión y qué proponer en su lugar.
creado: 2026-10-29
orden: 5
minutos: 20
tipo: teoria
objetivos:
  - Reconocer los seis errores típicos en una propuesta de proyecto de IA.
  - Explicar por qué aparece cada uno y qué alternativa proponer.
  - Reescribir una propuesta con errores para convertirla en un caso de uso defendible.
requiere: ["[[cursos/ia-en-la-empresa/04-medir-el-valor]]"]
tags: [empresa, estrategia, antipatrones]
relacionados: ["[[modelos/08-antipatrones]]", "[[modelos/10-prompting-rag-o-fine-tuning]]", "[[disciplinas/humano-en-el-bucle]]", "[[cursos/ia-en-la-empresa/02-la-piramide-de-personalizacion]]"]
---

Al terminar esta lección podrás detectar en una reunión las seis ideas que más proyectos de IA tuercen, explicar por qué no funcionan sin descalificar a nadie y proponer una alternativa concreta. Todas nacen de una intuición razonable; por eso se repiten tanto.

## La idea

Los errores de esta lección son de planteamiento: aparecen antes de escribir una línea de código y deciden el resultado: qué se construye, con qué nivel de personalización y cómo se mide. Cada uno tiene una pregunta que lo desactiva.

| Error | Señal en la reunión | Pregunta que lo desactiva |
|---|---|---|
| «Vamos a poner un chatbot» | La solución llega antes que el problema | ¿Qué tarea concreta mejora y cómo lo mediremos? |
| «Entrenemos nuestro propio modelo» | Se habla de modelo, no de datos | ¿Qué falla con un modelo existente, RAG y herramientas? |
| «Fine-tuning con todos los documentos» | Se quiere que el modelo «se aprenda» la intranet | ¿El problema es de conocimiento o de comportamiento? |
| «La IA ya sabe nuestra información» | Se evalúa sin dar documentos | ¿De dónde sale cada dato de esta respuesta? |
| «Cuanto más grande el modelo, más valor» | El debate es qué modelo comprar | ¿Cuál es el factor más débil: datos, integración o proceso? |
| «La IA sustituye al proceso» | Se automatiza todo de golpe | ¿Qué paso concreto mejora y quién decide al final? |

## Error 1: «Vamos a poner un chatbot»

**Por qué pasa.** Un chat es lo que todo el mundo ha visto, la demo sale en una tarde y da sensación de avance. Pero un chat genérico, sin documentos ni herramientas, responde lo mismo que cualquier asistente público. Nadie sabe para qué usarlo, el uso cae a las pocas semanas y el proyecto se da por fallido.

**Qué hacer en su lugar.** Empieza por un proceso y una métrica ([[cursos/ia-en-la-empresa/03-donde-esta-el-valor]]). Muchas veces la mejor interfaz ni siquiera es un chat: es una clasificación automática de tickets ([[recetas/clasificar-y-enrutar-tickets]]), un borrador que aparece en la herramienta que el equipo ya usa o un resumen que llega solo al cerrar una reunión.

## Error 2: «Tenemos que entrenar nuestro propio modelo»

**Por qué pasa.** Se confunde tener una IA propia con tener un modelo propio. Detrás suele haber preocupaciones legítimas: control, privacidad, diferenciación o dependencia de un proveedor.

**Qué hacer en su lugar.** Recuerda dónde está la ventaja: en el conocimiento y los procesos, no en el modelo ([[cursos/ia-en-la-empresa/01-lo-que-un-modelo-no-sabe-de-tu-empresa]]). Un modelo existente con RAG y herramientas resuelve la gran mayoría de casos. Si la preocupación real es la privacidad o la soberanía, la alternativa es un modelo de [[glosario/pesos-abiertos|pesos abiertos]] desplegado en tu infraestructura, que se compara en [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]. Entrenar desde cero queda para los pocos casos de la [[cursos/ia-en-la-empresa/02-la-piramide-de-personalizacion|lección 2]].

## Error 3: «Vamos a hacer fine-tuning con todos nuestros documentos»

**Por qué pasa.** Se imagina el entrenamiento como una forma de memorizar: si el modelo «estudia» la intranet, la sabrá. Lo que se consigue es otra cosa. El modelo aprende sobre todo el estilo y la forma de las respuestas, y retiene hechos concretos de forma poco fiable. Peor aún: puede responder con más seguridad y el tono de la casa sobre datos que no recuerda bien. No puede citar la fuente, no respeta qué puede ver cada usuario y se queda desactualizado el día que cambia un documento.

**Qué hacer en su lugar.** RAG para el conocimiento, con citas y permisos ([[sistemas/rag-con-citas]]). Fine-tuning, si acaso y más adelante, para el comportamiento: formato, tono o una clasificación muy específica. La decisión completa está en [[modelos/10-prompting-rag-o-fine-tuning]].

## Error 4: «La IA ya sabe nuestra información»

**Por qué pasa.** El asistente contesta con fluidez preguntas sobre la empresa y parece que sabe. O se ha contratado un asistente corporativo y se da por hecho que ha leído la intranet. Un modelo sin acceso a tus fuentes rellena los huecos con lo más probable: una [[glosario/alucinacion|alucinación]] bien redactada.

**Qué hacer en su lugar.** Prueba con preguntas cuya respuesta solo conoce tu empresa y compruébala. Exige que cada respuesta indique de dónde sale cada dato. Si hay conectores a tus sistemas, revisa a qué fuentes llegan y con qué permisos. Y cuando no haya fuente, la respuesta correcta es «no lo encuentro».

## Error 5: «Cuanto más grande el modelo, más valor»

**Por qué pasa.** El modelo es la parte visible y la más fácil de comparar en titulares. Pero el valor se multiplica por la calidad de los datos, la integración y la importancia del proceso ([[cursos/ia-en-la-empresa/04-medir-el-valor]]). Si la recuperación falla, un modelo más capaz recibe los mismos fragmentos equivocados, y solo cuesta más y tarda más.

**Qué hacer en su lugar.** Arregla primero el factor más débil, que casi nunca es el modelo. Para elegir modelo, empieza por uno capaz para conocer el techo de calidad y baja a uno más pequeño cuando tus evals demuestren que basta ([[modelos/05-elegir-modelo-por-tarea]]). No elijas por una clasificación pública: elige por tus casos.

## Error 6: «La IA sustituye al proceso»

**Por qué pasa.** La promesa de automatizar de principio a fin es atractiva y fácil de vender. En la práctica, automatizar un proceso que no se entiende bien solo produce errores más rápido, y sin nadie que los vea.

**Qué hacer en su lugar.** Piensa en «proceso actual + la IA mejora un paso». Deja las reglas de negocio en código, las decisiones con efectos en manos de una persona ([[glosario/humano-en-el-bucle|humano en el bucle]]) y mide cada paso. Cuando las métricas lo justifiquen, amplía la autonomía por partes, como en [[sistemas/soporte-con-aprobacion-humana]], donde el agente propone y una persona aprueba.

> [!aviso] El riesgo regulatorio también es un riesgo del proceso
> Si tu caso de uso toca decisiones sobre personas (contratación, crédito, acceso a servicios), revisa si cae en la categoría de alto riesgo del Reglamento de IA de la UE. El Omnibus digital aplazó esas obligaciones: las del anexo III se aplican desde el 2 de diciembre de 2027 ([Future of Privacy Forum, 2026](https://fpf.org/blog/the-ai-act-implementation-timeline-what-changes-under-the-ai-omnibus)). Aplazado no es eliminado: diseña desde ya con supervisión humana y trazabilidad.

## Errores frecuentes

Los seis tienen algo en común: ponen la tecnología delante del problema. Si en una reunión notas que se habla más del modelo que del proceso, de la demo que de la métrica o del chat que del usuario, alguno de ellos está presente.

## Ejercicio

> [!ejercicio] Reescribe la propuesta
> Lee esta propuesta interna e identifica qué errores contiene. Después reescríbela en no más de diez líneas como un caso de uso defendible: problema, usuarios, nivel de personalización, métrica y riesgos.
>
> «Proponemos lanzar este trimestre un chatbot corporativo con el modelo más grande disponible. Para que conozca nuestros productos, haremos fine-tuning con todos los PDF de la intranet. Así podrá atender directamente a los clientes y sustituirá al equipo de soporte de primer nivel.»
>
> Está bien si identificas al menos cuatro de los seis errores con la frase que los delata, y si tu versión nombra un proceso concreto, usa RAG para el conocimiento, mantiene a una persona en las decisiones con efectos y propone una métrica con línea base.

> [!ejercicio]- Pistas
> Busca en cada frase la palabra que delata el error: «chatbot» (1), «el más grande» (5), «fine-tuning con todos los PDF» (3 y, de fondo, 4) y «sustituirá» (6).

## Resumen

- Cada error pone la tecnología delante del problema; cada uno se desactiva con una pregunta.
- El chat genérico y el modelo propio rara vez son la respuesta; el proceso y el conocimiento sí.
- El fine-tuning no es la forma de meter documentos: para eso está RAG.
- Más modelo no compensa malos datos ni mala integración.
- La IA mejora pasos de un proceso; las personas siguen decidiendo lo que tiene consecuencias.

## Para seguir

- [[cursos/ia-en-la-empresa/06-de-la-idea-al-piloto]]: un caso completo sin estos errores.
- [[modelos/08-antipatrones]]: los antipatrones a nivel de prompt.
- [[disciplinas/humano-en-el-bucle]]
