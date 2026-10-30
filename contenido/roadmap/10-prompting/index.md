---
titulo: "Nivel 10 · Prompting que funciona"
descripcion: "Instrucciones claras, ejemplos, JSON validado, prompt de sistema y casos de prueba: cómo escribir prompts que dan resultados repetibles y comprobables."
creado: 2026-09-10
actualizado: 2026-10-29
nivel: 10
horas: 4
objetivo: "Escribir prompts que producen salidas correctas y con formato estable, y demostrarlo con un conjunto de casos de prueba que se ejecuta con un comando."
prerrequisitos: ["[[roadmap/00-fundamentos/index]]"]
proyecto:
  titulo: "Clasificador de tickets de soporte con JSON validado"
  descripcion: "Un programa que recibe el texto de un ticket y devuelve un JSON con categoría, prioridad y un resumen de una línea, validado con un esquema, más un conjunto de casos de prueba que mide cuántos acierta."
  entregable: "Un repositorio con clasificar.py (prompt de sistema, ejemplos few-shot y validación con Pydantic), casos.jsonl con al menos 20 tickets etiquetados a mano y evaluar.py, que imprime la tasa de acierto por campo; más una tabla con los resultados de al menos tres versiones del prompt y qué cambió en cada una."
tags: [prompting]
relacionados: ["[[roadmap/index]]", "[[docs/prompting/index]]", "[[modelos/01-principios-de-prompting]]", "[[recetas/clasificar-y-enrutar-tickets]]"]
---

Un [[glosario/prompt|prompt]] es el texto con el que le dices al modelo qué hacer. En este nivel aprenderás a escribirlo como escribirías una especificación para un compañero competente que no conoce tu proyecto: con el contexto necesario, ejemplos y un formato de salida que tu código pueda comprobar. Y aprenderás a demostrar que funciona con casos de prueba en vez de con impresiones.

## Para quién es

- Has terminado el [[roadmap/00-fundamentos/index|nivel 00]] o ya sabes llamar a la API y leer `stop_reason` y `usage`.
- Usas modelos a diario pero tus prompts «a veces fallan» y no sabes por qué.
- Vas a integrar un modelo en un producto y necesitas que la salida sea parseable siempre.

## Qué vas a saber hacer

Al terminar sabrás redactar instrucciones sin ambigüedad, enseñar con [[glosario/few-shot|ejemplos few-shot]], pedir y validar JSON, separar en el [[glosario/prompt-de-sistema|prompt de sistema]] lo que es fijo de lo que cambia en cada petición, y medir el efecto de cada cambio con un pequeño [[glosario/conjunto-de-evaluacion|conjunto de evaluación]].

## Lecciones

1. [[roadmap/10-prompting/01-instrucciones-claras]]. Qué contexto necesita el modelo, cómo estructurar una instrucción y por qué las etiquetas XML ayudan a separar datos de órdenes.
2. [[roadmap/10-prompting/02-ejemplos-few-shot]]. Enseñar con casos: cuántos, cuáles y cómo evitar que el modelo copie lo que no debe.
3. [[roadmap/10-prompting/03-formato-de-salida]]. Pedir JSON, validarlo con un esquema y usar salidas estructuradas garantizadas cuando la API lo permite.
4. [[roadmap/10-prompting/04-prompt-de-sistema]]. Rol, reglas fijas y qué va en el sistema frente a qué va en cada mensaje.
5. [[roadmap/10-prompting/05-iterar-con-casos-de-prueba]]. Un bucle de mejora con casos etiquetados, una métrica y un cambio cada vez.

## El proyecto del nivel

Construirás un **clasificador de tickets de soporte**. Recibe un texto como «Me habéis cobrado dos veces la suscripción de octubre» y devuelve:

```json
{"categoria": "facturacion", "prioridad": "alta", "resumen": "Cobro duplicado de la suscripción de octubre"}
```

Está terminado si cumple todo esto:

- El prompt de sistema define el rol, las categorías permitidas y los criterios de prioridad.
- Incluye entre tres y cinco ejemplos que cubren casos difíciles.
- La salida se valida con un modelo Pydantic (o Zod en TypeScript); si falla la validación, el programa reintenta una vez y después devuelve un error claro.
- `casos.jsonl` tiene al menos 20 tickets etiquetados a mano, incluidos algunos ambiguos.
- `evaluar.py` ejecuta todos los casos y muestra el acierto en categoría y en prioridad.
- Entregas una tabla con al menos tres versiones del prompt, qué cambiaste en cada una y su resultado.

> [!consejo] Lo que importa es la tabla
> La tasa de acierto final depende de tus casos, así que no hay una cifra objetivo. Lo valioso es que cada versión tenga un motivo y un resultado medido. Ese hábito es la base del [[roadmap/80-evals/index|nivel de evals]].

## Después de este nivel

Sigue con [[roadmap/20-herramientas/index]], donde el modelo deja de solo escribir texto y empieza a pedir acciones. Para consultar detalles sueltos, tienes [[docs/prompting/index]] y la [[modelos/index|guía de modelos]].

Si algo se te atasca durante el proyecto, hay páginas para los dos tropiezos más comunes: [[problemas/el-modelo-ignora-instrucciones]] y [[problemas/json-invalido-del-modelo]]. Y cuando quieras automatizar la tabla de versiones con una herramienta abierta en lugar de tu `evaluar.py`, mira [[recetas/evals-con-promptfoo]].
