---
titulo: IA en la empresa
descripcion: Cómo convertir un modelo de lenguaje general en valor para una organización, elegir cuánto personalizarlo, encontrar casos de uso, medirlos y llegar a un piloto.
creado: 2026-10-29
orden: 10
nivel: inicial
horas: 3
objetivo: Elegir el nivel de personalización adecuado para un problema de negocio concreto y defenderlo en una ficha de caso de uso con métrica, riesgos y plan de piloto.
requiere: []
tags: [empresa, estrategia, casos-de-uso, rag, fine-tuning]
relacionados: ["[[modelos/10-prompting-rag-o-fine-tuning]]", "[[sistemas/soporte-con-aprobacion-humana]]", "[[sistemas/rag-con-citas]]", "[[cursos/ruta-en-video/05-fase-3-5-ia-en-la-empresa]]"]
---

Contratar un asistente de chat no cambia por sí solo cómo trabaja una empresa. El valor aparece cuando conectas un modelo general con lo que solo tu organización tiene: su documentación, sus datos, sus reglas y sus procesos. Este curso te da el criterio para decidir cómo hacer esa conexión, cuánto personalizar y cómo demostrar que ha servido.

Es un curso de criterio, con muy poco código. Al terminar podrás defender una propuesta delante de un equipo técnico y de dirección: qué problema resuelve, con qué nivel de personalización, qué datos y herramientas necesita, cómo se mide y qué riesgos tiene.

## Para quién

- **Desarrolladores que diseñan soluciones** con [[glosario/llm|LLM]] y tienen que justificar la arquitectura, además de construirla.
- **Producto y negocio**: quien decide qué casos de uso abordar y necesita saber qué es barato, qué es caro y qué es una mala idea con buena prensa.
- **Dirección técnica**: responsables de arquitectura y de equipo que reciben propuestas del tipo «entrenemos nuestro propio modelo» y tienen que contestar con argumentos.

No necesitas programar. Basta con saber qué es un LLM y haber usado un asistente de chat. Si quieres afianzar la base, lee antes [[roadmap/00-fundamentos/01-que-es-un-llm]] y [[roadmap/00-fundamentos/06-como-se-entrena-un-llm]].

## Temario

1. [[cursos/ia-en-la-empresa/01-lo-que-un-modelo-no-sabe-de-tu-empresa]]. Qué es un [[glosario/modelo-fundacional|modelo fundacional]], qué cambia frente al aprendizaje automático clásico y qué parte del conocimiento de tu empresa queda fuera de cualquier modelo general.
2. [[cursos/ia-en-la-empresa/02-la-piramide-de-personalizacion]]. Prompt, [[glosario/rag|RAG]], [[glosario/fine-tuning|fine-tuning]] y modelo propio: qué exige cada nivel, cuánto cuesta en términos relativos, qué límites tiene y por qué casi siempre conviene empezar por arriba.
3. [[cursos/ia-en-la-empresa/03-donde-esta-el-valor]]. Señales de que un proceso se presta, ejemplos por área y un método para priorizar con impacto, viabilidad y riesgo.
4. [[cursos/ia-en-la-empresa/04-medir-el-valor]]. Línea base antes del piloto, métricas de negocio frente a métricas del modelo y una ficha de métricas lista para copiar.
5. [[cursos/ia-en-la-empresa/05-errores-tipicos]]. Seis ideas que llevan a proyectos caros o inútiles, por qué aparecen y qué proponer en su lugar.
6. [[cursos/ia-en-la-empresa/06-de-la-idea-al-piloto]]. Una empresa de soporte recorrida nivel a nivel y tu propio caso de uso convertido en un piloto con criterio de salida.

## Qué te llevas

Una ficha de caso de uso de una o dos páginas que podrías presentar mañana:

- el problema, quién lo sufre y con qué volumen;
- el nivel de personalización elegido y por qué no uno más costoso;
- los datos y las herramientas que necesita, con su responsable;
- la métrica de negocio, su línea base y el umbral que cuenta como éxito;
- los riesgos y cómo los controlas: revisión humana, permisos, [[glosario/evals|evals]];
- un piloto de 4 a 6 semanas con un criterio claro para seguir, ajustar o parar.

> [!nota] Sin cifras de ROI de catálogo
> Aquí no encontrarás porcentajes de ahorro genéricos ni tablas de inversión. El coste y el valor dependen de tu proceso, tus datos y tu volumen. Lo que sí aprenderás es a comparar opciones en escala relativa y a medir el resultado en tu caso, que es lo único que convence a quien paga.

## Después de este curso

Para construir lo que hayas diseñado, sigue con [[cursos/rag-a-fondo/index]] para el conocimiento, [[roadmap/20-herramientas/index]] para conectar tus sistemas y [[cursos/evals-para-agentes/index]] para medir. El resumen de la decisión técnica cabe en una página: [[modelos/10-prompting-rag-o-fine-tuning]].
