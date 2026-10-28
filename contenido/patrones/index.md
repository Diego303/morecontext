---
titulo: Patrones de agentes
descripcion: Los patrones para construir con modelos, de la llamada aumentada al agente autónomo, ordenados de lo más simple a lo más complejo.
creado: 2026-07-08
orden: 6
tags: [patrones, agentes]
relacionados: ["[[glosario/workflow]]", "[[glosario/agente]]", "[[sistemas/index]]"]
---

Los patrones son **formas probadas de organizar llamadas a un modelo**. Esta sección sigue la clasificación de [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) (Anthropic, 2024), que distingue entre [[glosario/workflow|workflows]], donde tu código decide los pasos, y [[glosario/agente|agentes]], donde los decide el modelo.

## La regla: empieza por lo más simple

Cada paso hacia la derecha añade coste, latencia y formas de fallar. Súbelo solo cuando tengas pruebas de que el anterior no basta.

```mermaid
flowchart LR
  A[Llamada aumentada] --> B[Workflow]
  B --> C[Agente]
```

## Los patrones

**Fundamentos**

- [[patrones/01-workflows-vs-agentes]]: la diferencia y la escalera de complejidad. Léelo primero.
- [[patrones/02-llamada-aumentada]]: el bloque básico, un modelo con recuperación, herramientas y memoria.

**Workflows**

- [[patrones/03-encadenado]]: pasos fijos con comprobaciones entre ellos.
- [[patrones/04-enrutado]]: clasificar la entrada y mandarla al flujo adecuado.
- [[patrones/05-paralelizacion]]: dividir en partes independientes o votar entre varias respuestas.
- [[patrones/06-orquestador-trabajadores]]: un modelo divide la tarea sobre la marcha y delega.
- [[patrones/07-evaluador-optimizador]]: generar, criticar con un criterio claro y mejorar.

**Agentes**

- [[patrones/08-agente-autonomo]]: el modelo elige pasos y herramientas en un bucle.

**Para decidir**

- [[patrones/09-elegir-patron]]: árbol de decisión y tabla comparativa.

## Cómo leer cada patrón

Cada página explica qué es, muestra un diagrama, dice cuándo usarlo y cuándo no, da un ejemplo concreto y un esqueleto de código, y puntúa de 1 a 3 su coste y su latencia. Al final enlaza los patrones relacionados y los [[sistemas/index|sistemas]] que lo usan.
