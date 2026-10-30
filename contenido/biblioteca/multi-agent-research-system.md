---
titulo: Cómo construyó Anthropic su sistema multiagente de investigación (2025)
descripcion: "Orquestador y subagentes en producción: cuándo compensa multiplicar agentes, cuánto cuesta en tokens, cómo enseñar a delegar y cómo evaluar un sistema que no sigue siempre el mismo camino."
creado: 2026-10-29
tags: [biblioteca, agentes, multiagente, subagentes]
relacionados: ["[[sistemas/investigacion-multiagente]]", "[[roadmap/60-multiagente/01-cuando-no-usar-multiagente]]", "[[patrones/06-orquestador-trabajadores]]", "[[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]"]
autores: Hadfield, Zhang, Lien, Scholz, Fox y Ford (Anthropic)
anio: 2025
url: https://www.anthropic.com/engineering/multi-agent-research-system
tipo: ensayo
tema: agentes
nivel: intermedio
---

*How we built our multi-agent research system* (Jeremy Hadfield y otros cinco autores, Anthropic, 13 de junio de 2025) cuenta cómo llevaron a producción la función Research de Claude, que busca en la web y en servicios conectados. Es uno de los casos públicos más detallados de un sistema [[glosario/orquestador|orquestador]] más [[glosario/subagente|subagentes]], con sus cifras, sus errores y lo que costó pasar del prototipo a producción.

## La idea clave

Un agente principal analiza la pregunta, decide una estrategia, guarda el plan en memoria (porque el contexto se trunca pasados los 200.000 tokens) y lanza subagentes que buscan en paralelo, cada uno con su propia ventana. Los subagentes devuelven lo importante; el principal decide si hace falta más. Al final, un agente de citas marca qué afirmación sale de qué fuente.

**El argumento central es la compresión: cada subagente explora mucho en su contexto y entrega poco al principal.** En sus palabras, la esencia de buscar es destilar ideas a partir de un corpus enorme.

Las cifras del [artículo](https://www.anthropic.com/engineering/multi-agent-research-system), todas sobre evaluaciones internas, explican cuándo compensa:

- Opus 4 como principal con subagentes Sonnet 4 superó a un solo Opus 4 en un 90,2 % en su eval de investigación.
- En BrowseComp, tres factores explicaban el 95 % de la varianza del rendimiento, y solo el uso de tokens, el 80 %. De ahí la frase más citada: los sistemas multiagente funcionan sobre todo porque ayudan a gastar suficientes tokens en el problema.
- El precio: un agente usa unas 4 veces los tokens de un chat y un sistema multiagente unas 15 veces.

Por eso el texto acota el terreno. Encaja con mucha paralelización, información que no cabe en una ventana y muchas herramientas, en tareas de valor alto. **No encaja cuando los agentes necesitan compartir contexto o dependen mucho unos de otros.** Tampoco en la mayoría de tareas de código, que tienen menos partes paralelizables que una investigación.

## Por qué importa hoy

Sus lecciones de prompting siguen siendo la mejor lista práctica para diseñar subagentes. Las que más aplicarás:

- **Enseña al orquestador a delegar.** Cada subagente necesita un objetivo, un formato de salida, guía sobre herramientas y fuentes, y límites claros. Con encargos vagos, duplicaban trabajo o dejaban huecos.
- **Escala el esfuerzo a la complejidad.** Un dato simple: un agente y de 3 a 10 llamadas. Una comparación: de 2 a 4 subagentes. Una investigación compleja: más de 10. Sin esta regla, las primeras versiones llegaban a lanzar 50 subagentes para preguntas sencillas.
- **Empieza amplio y luego estrecha.** Los agentes tienden a búsquedas largas y específicas que devuelven poco.
- **Paraleliza las llamadas.** Lanzar de 3 a 5 subagentes a la vez, y que cada uno use varias herramientas en paralelo, recortó hasta un 90 % el tiempo en preguntas complejas.

La parte de evaluación es igual de útil. Con unas 20 consultas representativas bastaba para ver los cambios grandes del principio. Un juez con una rúbrica (exactitud, citas, completitud, calidad de fuentes, eficiencia con las herramientas) fue lo más consistente, y las personas encontraron lo que el juez no veía, como la preferencia por granjas de contenido optimizadas para buscadores.

> [!aviso] El coste va primero
> Antes de multiplicar agentes, calcula unas 15 veces los tokens de un chat y pregúntate si la tarea lo vale. Si no lo vale, un solo agente con buenas herramientas suele ser la opción correcta.

## Qué leer primero

1. **«Benefits of a multi-agent system»**: las cifras y cuándo encaja.
2. **«Prompt engineering and evaluations for research agents»**: los ocho principios.
3. **«Effective evaluation of agents»**: empezar pequeño y juez con rúbrica.
4. **«Production reliability and engineering challenges»**: errores con estado que se acumulan, despliegues graduales para no cortar agentes a mitad de tarea y el cuello de botella de esperar a todos los subagentes.

El apéndice tiene una idea muy aprovechable: que los subagentes escriban sus resultados en archivos y pasen al principal solo una referencia.

## Qué ha envejecido

- **Los modelos.** Opus 4 y Sonnet 4 ya no son la referencia; las cifras de mejora son de ese momento y de una eval interna que no puedes reproducir.
- **El debate sobre escritores en paralelo** ha avanzado. Cognition, que en 2025 desaconsejaba construir multiagente, revisó su postura en abril de 2026: funcionan los agentes extra que aportan inteligencia (revisar, investigar), con las escrituras en un solo hilo. Lo resume [[radar/2026-10-28-multiagente-un-solo-escritor]].
- **La ejecución síncrona** que el texto señala como límite sigue siendo el diseño más sencillo; la asíncrona trae problemas de coordinación que ellos mismos describen.

## Dónde lo ves en MoreContext

- [[sistemas/investigacion-multiagente]]: un sistema como este, construido paso a paso.
- [[roadmap/60-multiagente/01-cuando-no-usar-multiagente]] y [[roadmap/60-multiagente/05-coste-de-multiplicar-agentes]]: cuándo no compensa y cuánto cuesta.
- [[roadmap/60-multiagente/02-orquestador-y-subagentes]] y [[roadmap/60-multiagente/04-paralelismo]]: el orquestador y las llamadas en paralelo.
- [[cursos/sistemas-multiagente/02-disenar-subagentes]] y [[plantillas/subagente]]: el encargo de cada subagente.
- [[patrones/06-orquestador-trabajadores]]: el patrón base.
- [[recetas/coste-por-subagente]]: medir el gasto por rol.
