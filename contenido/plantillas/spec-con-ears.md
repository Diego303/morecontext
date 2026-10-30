---
titulo: Especificación con requisitos EARS
descripcion: Plantilla de especificación en cuatro partes (propuesta, requisitos en EARS, diseño y tareas) para que un agente construya sin inventar y tú apruebes sabiendo qué apruebas.
creado: 2026-10-29
tipo: spec
formato: md
archivo: requirements.md
tags: [plantillas, sdd, ears, requisitos]
relacionados: ["[[roadmap/70-flujos-con-especificacion/02-requisitos-en-ears]]", "[[glosario/ears]]", "[[disciplinas/spec-primero]]", "[[plantillas/criterios-de-aceptacion]]", "[[roadmap/70-flujos-con-especificacion/03-plan-y-tareas]]"]
---

Una especificación útil para un agente responde a cuatro preguntas en este orden: **qué problema** resolvemos y qué queda fuera (propuesta), **qué debe hacer** el sistema de forma comprobable (requisitos), **cómo** se construye (diseño) y **en qué pasos** (tareas). Los requisitos se escriben con [[glosario/ears|EARS]] (*Easy Approach to Requirements Syntax*, Mavin y otros, 2009): cinco patrones de frase que obligan a decir el disparador y la respuesta, y eliminan el «el sistema debería gestionar bien los errores». Es la estructura que produce el agente diseñador del harness del autor, generalizada para cualquier proyecto.

## Cuándo usarla

- Antes de pedir a un agente una feature de más de una tarde, o cualquier cambio que toque datos del usuario, seguridad o un contrato público.
- Cuando vas a aprobar un plan en una [[glosario/puerta-humana|puerta humana]] y quieres saber exactamente qué apruebas.
- No la uses para un arreglo de una línea: la ceremonia tiene que escalar con el cambio. Un bug pequeño cabe en un párrafo y un test.

En un proyecto pequeño, usa un solo archivo. En un harness, corta por cada título de primer nivel y guarda cada parte con el nombre de su comentario (`proposal.md`, `requirements.md`, `design.md`, `tasks.md`); la aceptación va aparte, en [[plantillas/criterios-de-aceptacion|acceptance.yaml]].

## La plantilla

```markdown title="requirements.md"
<!-- archivo: proposal.md -->
# Propuesta · <PREFIJO-NNN> <título>

## Problema
<Qué falla o falta hoy, a quién afecta y cómo se nota. 2-4 frases, sin solución.>

## Alcance
- Dentro: <lista cerrada de lo que se hace>
- Fuera: <lo que no se hace ahora, y qué feature lo hará si alguna lo hace>

## Alternativas
<Solo si hay una decisión real. Opción A y opción B con su coste. Si una regla de AGENTS.md ya decide, cítala y no inventes opciones.>

## Recomendación
<La opción elegida y por qué, en 2-3 frases.>

## Decisiones para la puerta humana
- <Decisión o supuesto que el humano aprueba de forma explícita>

## Riesgos
- <Riesgo> · <mitigación>

<!-- archivo: requirements.md -->
# Requisitos · <PREFIJO-NNN>

Un requisito por fila, atómico y comprobable, con uno de estos patrones EARS:

- Ubicuo: El <sistema> debe <respuesta>.
- Por evento: CUANDO <disparador>, el <sistema> debe <respuesta>.
- Por estado: MIENTRAS <estado>, el <sistema> debe <respuesta>.
- No deseado: SI <condición no deseada>, ENTONCES el <sistema> debe <respuesta>.
- Opcional: DONDE <característica incluida>, el <sistema> debe <respuesta>.

## Funcionales

| ID | Requisito | Fuente |
| --- | --- | --- |
| FR-01 | CUANDO <disparador>, el <sistema> debe <respuesta observable>. | <petición · AGENTS.md (regla) · context.md> |
| FR-02 | SI <condición no deseada>, ENTONCES el <sistema> debe <respuesta>. | <fuente> |

## No funcionales

| ID | Requisito | Fuente |
| --- | --- | --- |
| NFR-01 | El <sistema> debe pasar la regresión completa del proyecto. | AGENTS.md |
| NFR-02 | <rendimiento, seguridad, compatibilidad: con un umbral medible> | <fuente> |

## Supuestos
- <Lo que das por hecho y el humano debe confirmar>

## Fuera de alcance
- <Lo que alguien podría esperar y no se hace>

<!-- archivo: design.md -->
# Diseño · <PREFIJO-NNN>

## Enfoque
<La solución en un párrafo: qué piezas cambian y cómo encajan.>

## Cambios por archivo
| Archivo | Acción | Motivo |
| --- | --- | --- |
| `<ruta>` | crear · modificar · borrar | <FR-NN que cubre> |

## Contratos y datos
<Firmas, formatos de entrada y salida, esquemas, con un ejemplo concreto.>

## Errores y casos límite
- <Entrada o situación> → <comportamiento esperado> (<FR-NN>)

## Estrategia de pruebas
| Requisito | Prueba |
| --- | --- |
| FR-01 | `<tests/test_x.py::test_y>`: <qué comprueba> |

## Seguridad
<Entradas no confiables, permisos, secretos y datos personales afectados. «Ninguno» también es una respuesta.>

## Decisiones
- <Decisión técnica> · <por qué> · <alternativa descartada>

<!-- archivo: tasks.md -->
# Tareas · <PREFIJO-NNN>

| ID | Tarea | Archivos | Depende de | Cubre | Hecha cuando |
| --- | --- | --- | --- | --- | --- |
| T-01 | <verbo + objeto, una sesión como mucho> | `<ruta>` | ninguna | FR-01 | AC-002 pasa |
| T-02 | <tarea> | `<ruta>` | T-01 | FR-02 | AC-003 pasa |
```

## Cómo rellenarla

**Propuesta.** El *problema* va sin solución: si escribes «añadir un botón», ya has decidido. El *alcance* es una lista cerrada; lo que queda fuera se dice en voz alta, porque es lo primero que un agente añade «ya que estaba». En *decisiones para la puerta humana* pon solo lo que de verdad necesita tu firma, incluidos los supuestos: así el diseñador no bloquea el flujo por dudas que la puerta ya resuelve.

**Requisitos.** Cada fila, un comportamiento observable con un patrón EARS. Los originales en inglés son *WHEN*, *WHILE*, *IF … THEN*, *WHERE* y *SHALL*; usa la versión española o la inglesa, pero la misma en todo el proyecto. Reglas prácticas:

- Un requisito, una respuesta. Si hay un «y», probablemente son dos filas.
- La respuesta se puede comprobar con un test o una inspección. «Rápido» no; «en menos de 200 ms con 10 000 facturas» sí.
- La columna **Fuente** dice de dónde sale el requisito. Un requisito sin fuente es una invención del diseñador.
- Los IDs `FR-NN` y `NFR-NN` son los que cita `covers` en la aceptación: cada uno debe tener al menos un check y cada `FR` al menos una tarea.

**Diseño.** *Cambios por archivo* es la lista que usará el revisor para detectar cambios fuera de alcance. *Errores y casos límite* es donde se ganan o se pierden las features: enumera entradas vacías, duplicadas, enormes y malformadas. La *estrategia de pruebas* liga cada requisito con la prueba que lo demuestra.

**Tareas.** Pequeñas, ordenadas por dependencias, cada una con los archivos que toca, el requisito que cubre y el check que la da por hecha. «Implementar la feature» no es una tarea.

## Ejemplo

Los requisitos de `FAC-012`, la exportación a CSV que siguen [[plantillas/criterios-de-aceptacion]] y [[plantillas/veredicto-de-revision]]:

```markdown title="requirements.md"
# Requisitos · FAC-012

## Funcionales

| ID | Requisito | Fuente |
| --- | --- | --- |
| FR-01 | CUANDO el usuario ejecuta `facturas exportar --desde F1 --hasta F2`, el sistema debe escribir un CSV con cabecera y una fila por factura emitida entre F1 y F2, ambas incluidas. | petición |
| FR-02 | SI una factura es rectificativa, ENTONCES el sistema debe exportar su importe con signo negativo. | AGENTS.md (regla 4) |
| FR-03 | SI `--desde` o `--hasta` no tienen formato AAAA-MM-DD, ENTONCES el sistema debe terminar con código 2 y un mensaje que nombre el parámetro y el formato esperado. | context.md |

## No funcionales

| ID | Requisito | Fuente |
| --- | --- | --- |
| NFR-01 | El sistema debe pasar la regresión completa del proyecto. | AGENTS.md |
| NFR-02 | El sistema debe representar los importes con `Decimal`, nunca con `float`. | AGENTS.md (regla 2) |

## Fuera de alcance
- Exportar a Excel (lo cubrirá FAC-015).
```

## Errores típicos

- **Requisitos que son diseño.** «Usar pandas para el CSV» es una decisión técnica: va en *Decisiones* del diseño, no en requisitos.
- **EARS de adorno.** «CUANDO sea necesario, el sistema debe funcionar bien» tiene la forma y nada del fondo. El disparador y la respuesta tienen que ser observables.
- **Un bug pequeño convertido en cuatro historias.** Es una de las críticas documentadas al desarrollo guiado por especificación ([Böckeler, 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)): escala la plantilla al tamaño del cambio.
- **Supuestos escondidos como requisitos.** Si el diseñador supone algo, va en *Supuestos* y el humano lo confirma.
- **Cambiar la spec después de aprobarla** sin volver a la puerta humana. Para eso existe el hash que la congela ([[recetas/congelar-la-spec-con-un-hash]]).

## Relacionadas

- [[roadmap/70-flujos-con-especificacion/02-requisitos-en-ears]]: los patrones EARS, uno a uno.
- [[roadmap/70-flujos-con-especificacion/03-plan-y-tareas]]: tareas que un agente puede ejecutar.
- [[roadmap/70-flujos-con-especificacion/05-una-sola-puerta-humana]]: dónde se aprueba esta spec.
- [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]] · [[disciplinas/spec-primero]]
- Artículo original de EARS: [Mavin, Wilkinson, Harwood y Novak, RE'09](https://research.manchester.ac.uk/en/publications/easy-approach-to-requirements-syntax-ears/).
