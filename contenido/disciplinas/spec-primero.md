---
titulo: Spec primero
descripcion: Escribir una especificación corta antes de pedirle código o una tarea larga a un agente, con una plantilla que puedes copiar.
creado: 2026-09-15
actualizado: 2026-10-29
orden: 7
tipo: forma-de-trabajar
tags: [forma-de-trabajar, agentes-de-codigo, planificacion]
relacionados: ["[[disciplinas/explorar-planificar-implementar-verificar]]", "[[disciplinas/cambios-pequenos-y-revisables]]", "[[roadmap/40-primer-agente/04-planificar-antes-de-actuar]]", "[[cursos/agentes-de-codigo/index]]", "[[roadmap/70-flujos-con-especificacion/index]]"]
---

Spec primero significa que, antes de que un agente escriba una línea, existe un documento breve que dice qué hay que construir, por qué, qué queda fuera y cómo sabrás que está terminado. El agente trabaja contra ese documento, y tú revisas contra él.

## Qué es

Una *spec* (especificación) es un texto de media página a dos páginas. Algo que puedas leer en tres minutos. Tiene objetivo, contexto, requisitos, lo que no se hace, criterios de aceptación y riesgos. Puedes escribirla tú, o pedirle al agente que la redacte a partir de una conversación y luego corregirla.

Encaja con el primer paso de [[disciplinas/explorar-planificar-implementar-verificar]]: después de explorar el código, la spec fija qué se va a hacer antes de implementarlo.

En 2025 y 2026 esta forma de trabajar se ha convertido en un movimiento con nombre, el *spec-driven development* ([[glosario/sdd|SDD]]), con herramientas como Spec Kit de GitHub o Kiro de AWS. Birgitta Böckeler distingue tres grados ([martinfowler.com, oct. 2025](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)): la spec se escribe antes de la tarea (*spec-first*), se mantiene viva junto al código (*spec-anchored*) o es lo único que se edita y el código se genera (*spec-as-source*). Esta página va del primero.

## Por qué importa

Un agente de código hace lo que entiende, y entiende lo que le escribes. Con un encargo de una línea («añade exportación a CSV») rellena los huecos con suposiciones: qué columnas, qué codificación, qué pasa con 100 000 filas, si hay que tocar la API. Cada suposición equivocada es trabajo tirado o, peor, un cambio que parece bueno y no lo es.

La spec también te obliga a pensar. Muchas ambigüedades salen al escribir la sección «Fuera de alcance». Y te da un criterio objetivo para revisar: el cambio cumple los criterios de aceptación o no.

## Prácticas concretas

- **Escribe los criterios de aceptación como comprobaciones.** «El endpoint devuelve 400 si falta `fecha_desde`» se puede convertir en un test. «Debe ser robusto» no. La sintaxis [[glosario/ears|EARS]] ayuda a escribirlos sin ambigüedad: «CUANDO falte `fecha_desde`, EL SISTEMA DEBERÁ responder 400 con un mensaje que nombre el campo» ([[roadmap/70-flujos-con-especificacion/02-requisitos-en-ears]]).
- **La sección «Fuera de alcance» es obligatoria.** Es la que más evita que el agente se exceda.
- **Nombra archivos y piezas existentes.** «Reutiliza `serializar_pedido()` de `pedidos/serializers.py`» ahorra que el agente invente una segunda versión.
- **Pide al agente que te haga preguntas sobre la spec** antes de implementar. Si pregunta algo que no habías pensado, añádelo.
- **Guarda la spec en el repositorio** (`docs/specs/2026-09-exportar-csv.md`) y enlázala en el PR. Sirve de contexto para el siguiente agente o persona.
- **Una spec, un cambio revisable.** Si la spec da para tres PR, divídela ([[disciplinas/cambios-pequenos-y-revisables]]).
- **Escala la ceremonia al cambio.** La crítica más repetida al SDD es que convierte un arreglo pequeño en páginas de Markdown que nadie quiere revisar. Para un cambio de una línea basta un criterio de aceptación; la plantilla completa es para tareas de horas.

### Plantilla

```markdown title="spec.md"
## Objetivo
Una o dos frases: qué cambia para quién y por qué.

## Contexto
- Dónde vive el código relacionado (archivos, módulos).
- Decisiones previas que hay que respetar.
- Enlaces a issues, conversaciones o diseños.

## Requisitos
1. …
2. …

## Fuera de alcance
- Lo que NO se hace en este cambio, aunque parezca relacionado.

## Criterios de aceptación
- [ ] Comprobación concreta 1 (idealmente, un test).
- [ ] Comprobación concreta 2.
- [ ] Los tests existentes siguen pasando.

## Riesgos y preguntas abiertas
- Lo que no sabes todavía y cómo lo vas a resolver.
```

> [!ejemplo] Criterios de aceptación de «exportar pedidos a CSV»
> - `GET /pedidos/export?desde=2026-01-01` devuelve `text/csv` en UTF-8 con BOM.
> - Columnas en este orden: `id, fecha, cliente, importe, estado`.
> - Con más de 50 000 filas devuelve 413 y un mensaje que sugiere acotar fechas.
> - Hay un test por cada uno de los puntos anteriores.

### Así lo hace un harness: la spec en archivos

En el harness SDD del autor para Claude Code ([[sistemas/harness-sdd-claude-code]]) la spec no es un documento, sino un conjunto de archivos por feature, cada uno con un único autor:

| Artefacto | Lo escribe | Qué contiene |
|---|---|---|
| `context.md` | El explorador | Cómo funciona hoy el código relacionado, con archivo y línea |
| `proposal.md` | El diseñador | Qué se propone y por qué, con decisiones y supuestos a aprobar |
| `requirements.md` | El diseñador | Requisitos funcionales y no funcionales numerados (FR-01, NFR-01), atómicos y comprobables, con su origen, supuestos y fuera de alcance; EARS es una buena forma de redactarlos |
| `design.md` | El diseñador | Cómo se construye: módulos, interfaces, riesgos |
| `tasks.md` | El diseñador | Pasos pequeños que el constructor sigue en orden |
| `acceptance.yaml` | El diseñador | Los comandos que demuestran que está hecho, ejecutables tal cual |

La persona aprueba exactamente esos archivos en una única puerta (GATE#1). Al aprobar, el harness guarda la huella de cada archivo en `spec.lock.json`: la spec queda **congelada**, y cualquier cambio posterior bloquea el flujo hasta que alguien vuelva a planificar y a aprobar. El constructor no puede rediseñar sobre la marcha, y el revisor juzga contra lo aprobado, no contra lo que el código acabó haciendo. Las piezas se cuentan en [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]], [[recetas/congelar-la-spec-con-un-hash]] y [[recetas/criterios-de-aceptacion-ejecutables]], y las plantillas listas en [[plantillas/spec-con-ears]] y [[plantillas/criterios-de-aceptacion]].

## Señales de que lo haces mal

- Tus encargos al agente caben en un tuit y luego reescribes la mitad del resultado.
- La spec tiene cinco páginas y nadie la lee entera, ni tú.
- Los criterios de aceptación son adjetivos («rápido», «limpio», «escalable»).
- El agente toca archivos que no tenían nada que ver y no tienes un documento con el que decirle que no.
- Escribes la spec después del código, para el PR.
- La spec cambia a mitad de implementación sin que nadie la vuelva a aprobar.

## Cómo empezar mañana

1. Copia la plantilla en `docs/specs/` de tu repositorio.
2. En tu próxima tarea de más de una hora, rellénala en diez minutos antes de abrir el agente.
3. Pásasela al agente con esta instrucción: «Lee la spec, explora el código relacionado y hazme las preguntas que necesites antes de proponer un plan».
4. Al revisar el resultado, marca las casillas de los criterios de aceptación. Lo que no esté marcado, no está hecho.

## Para seguir

- [[roadmap/70-flujos-con-especificacion/index]]: el nivel del roadmap sobre flujos con especificación.
- [[cursos/agentes-de-codigo/02-contexto-del-repositorio]]
- [[cursos/agentes-de-codigo/04-revisar-y-confiar]]
- [[sistemas/agente-de-codigo]]
