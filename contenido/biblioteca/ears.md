---
titulo: "EARS: requisitos sin ambigüedad (Mavin et al., 2009)"
descripcion: Cinco plantillas para escribir requisitos que una persona, un test o un agente entienden igual. Por qué un método de la industria aeronáutica de 2009 se usa hoy en specs para agentes.
creado: 2026-10-29
tags: [biblioteca, agentes, ears, especificacion, sdd]
relacionados: ["[[glosario/ears]]", "[[roadmap/70-flujos-con-especificacion/02-requisitos-en-ears]]", "[[plantillas/spec-con-ears]]", "[[disciplinas/spec-primero]]"]
autores: Mavin, Wilkinson, Harwood y Novak
anio: 2009
url: https://research.manchester.ac.uk/en/publications/easy-approach-to-requirements-syntax-ears/
tipo: paper
tema: agentes
nivel: intermedio
---

*Easy Approach to Requirements Syntax (EARS)* (Alistair Mavin, Philip Wilkinson, Adrian Harwood y Mark Novak; congreso RE'09 del IEEE, Atlanta, 2009, páginas 317 a 322) nace lejos de la IA: en los requisitos de sistemas de control de motores de avión. Su punto de partida es que los requisitos escritos en lenguaje natural libre son imprecisos, y que esos defectos se arrastran a las fases siguientes del desarrollo y añaden coste y riesgo. Hoy herramientas de *spec-driven development* como Kiro lo usan para que un agente sepa exactamente qué tiene que cumplir.

## La idea clave

Los autores identificaron ocho problemas frecuentes en los requisitos, como la ambigüedad, la complejidad y la vaguedad, y propusieron un conjunto pequeño de reglas de estructura para evitarlos. **Cada requisito se escribe con una de cinco plantillas sencillas**, cada una con una palabra clave que dice cuándo aplica:

```text
Ubicuo         The <sistema> shall <respuesta>.
Por evento     WHEN <disparador>, the <sistema> shall <respuesta>.
Por estado     WHILE <estado>, the <sistema> shall <respuesta>.
No deseado     IF <condición no deseada>, THEN the <sistema> shall <respuesta>.
Opcional       WHERE <la función está incluida>, the <sistema> shall <respuesta>.
```

Los requisitos complejos combinan palabras clave («WHILE … WHEN …»). En español funciona igual:

```text
CUANDO el usuario envíe el formulario con un email sin @, el sistema DEBERÁ mostrar «Email no válido» junto al campo.
SI el servicio de pagos no responde en 5 segundos, ENTONCES el sistema DEBERÁ cancelar la operación y registrar el error.
```

La forma obliga a decir tres cosas: la condición, el sistema que actúa y la respuesta observable. Eso es lo que elimina la ambigüedad. Los autores lo aplicaron para extraer requisitos de control de un motor a partir de un documento de normativa de aeronavegabilidad, y describen mejoras cualitativas y cuantitativas frente a una especificación textual convencional.

## Por qué importa hoy

Un agente de código hace exactamente lo que entiende de tu petición. «Valida el email» deja abiertas mil decisiones; un requisito EARS las cierra. Y tiene una ventaja que en 2009 no era el foco: **un requisito con disparador y respuesta observable se convierte casi directamente en un test**. El «CUANDO…» es la preparación; el «DEBERÁ…», la aserción. Por eso encaja con la [[glosario/aceptacion-ejecutable|aceptación ejecutable]]: la spec y la prueba dicen lo mismo.

Kiro, el entorno de AWS, escribe los criterios de aceptación de su `requirements.md` con la plantilla «WHEN [condición] THE SYSTEM SHALL [comportamiento]», y la plantilla de MoreContext [[plantillas/spec-con-ears]] sigue la misma idea.

> [!aviso] Escala la ceremonia al cambio
> Birgitta Böckeler criticó en 2025 que algunas herramientas de SDD conviertan un fallo pequeño en muchas historias: Kiro transformó uno en 4 historias con 16 criterios. EARS sirve para precisar; si un cambio cabe en una frase clara, no necesita diez requisitos.

## Qué leer primero

El paper es corto (seis páginas). Lee:

1. **La introducción**: los problemas del lenguaje natural libre.
2. **La presentación de las plantillas**, con sus ejemplos.
3. **El caso de aplicación**, para ver el antes y el después.

## Qué ha envejecido

- **El contexto.** Está escrito para sistemas embebidos críticos, con requisitos revisados por ingenieros durante meses. En un proyecto con agentes, la spec se escribe y revisa en minutos y cambia a menudo: usa EARS para los criterios de aceptación, no para todo el documento.
- **El inglés controlado.** Las palabras clave se pensaron en inglés. En español, decide una traducción (CUANDO, MIENTRAS, SI… ENTONCES, DONDE, DEBERÁ) y úsala siempre igual.
- **Lo que no cubre.** EARS dice *qué* debe pasar, no *cómo* construirlo ni por qué. El diseño y las decisiones van en otra parte de la spec.

## Dónde lo ves en MoreContext

- [[roadmap/70-flujos-con-especificacion/02-requisitos-en-ears]]: la lección para escribirlos bien.
- [[plantillas/spec-con-ears]]: una especificación lista para copiar.
- [[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]] y [[recetas/criterios-de-aceptacion-ejecutables]]: de requisito a prueba.
- [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]: la spec congelada en un harness real.
- [[disciplinas/spec-primero]] y [[glosario/sdd]]: la forma de trabajar que lo rodea.
- [[glosario/ears]]: la definición corta.
