---
titulo: "acceptance.yaml: criterios ejecutables"
descripcion: Plantilla del esquema v1 de acceptance.yaml con checks de tipo command, file e inspection, trazados a requisitos y listos para que un runner los ejecute.
creado: 2026-10-29
tipo: spec
formato: yaml
archivo: acceptance.yaml
tags: [plantillas, sdd, aceptacion, harness]
relacionados: ["[[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]", "[[recetas/criterios-de-aceptacion-ejecutables]]", "[[glosario/aceptacion-ejecutable]]", "[[plantillas/spec-con-ears]]", "[[plantillas/veredicto-de-revision]]"]
---

`acceptance.yaml` es la definición de «terminado» escrita para que la compruebe una máquina. Cada check dice qué requisito demuestra y cómo: un comando que debe salir con un código concreto, un archivo que debe existir con (o sin) cierto contenido, o una inspección que sigue una persona o el revisor y deja evidencia. Se aprueba junto a la especificación en la [[glosario/puerta-humana|puerta humana]], queda congelado y el revisor decide su [[glosario/veredicto|veredicto]] con lo que produce. Es la pieza que convierte un «ya está» del agente en [[glosario/aceptacion-ejecutable|aceptación ejecutable]].

## Cuándo usarla

- Cuando un agente implementa una feature y quieres decidir con evidencia, no con su opinión, si está hecha.
- En un flujo con especificación ([[glosario/sdd|SDD]]): se escribe en la fase de diseño y se aprueba antes de construir.
- Para no perder la regresión: el primer check siempre ejecuta la suite completa del proyecto.
- No compensa en una exploración o un prototipo que vas a tirar: ahí no hay un resultado estable que comprobar.

## La plantilla

```yaml title="acceptance.yaml"
# Criterios de aceptación ejecutables (esquema v1).
# Se aprueban con la especificación y no se tocan después: si hay que cambiarlos, se vuelve a diseñar.
# kind: command     comando no interactivo; pasa si sale con expected_exit_code
#       file        el archivo existe (o no); contains / not_contains son regex opcionales
#       inspection  procedimiento que sigue una persona o el revisor, con evidencia escrita
# Entrecomilla los valores que contengan ": " o " #".
version: 1
feature_id: "<PREFIJO-NNN>"
checks:
  - id: AC-001
    title: "La regresión del proyecto sigue pasando"
    covers: [NFR-01]
    kind: command
    required: true
    command: "bash .claude/bootstrap/verify.sh"
    cwd: .
    timeout_seconds: 600
    expected_exit_code: 0
  - id: AC-002
    title: "<Comportamiento nuevo que demuestra FR-01>"
    covers: [FR-01]
    kind: command
    required: true
    command: "<comando de test concreto, p. ej. pytest -q tests/test_x.py::test_y>"
    cwd: .
    timeout_seconds: 120
    expected_exit_code: 0
  - id: AC-003
    title: "<Artefacto que debe existir con un contenido concreto>"
    covers: [FR-02]
    kind: file
    required: true
    path: "<ruta/relativa/al/repo>"
    expected: exists
    contains: "<regex que demuestra que no está vacío>"
  - id: AC-004
    title: "<Algo que no debe aparecer en el código>"
    covers: [NFR-02]
    kind: file
    required: true
    path: "<ruta/relativa/al/repo>"
    expected: exists
    not_contains: "<regex prohibida>"
  - id: AC-005
    title: "<Aspecto que solo se comprueba mirando: un texto, una pantalla>"
    covers: [FR-03]
    kind: inspection
    required: false
    procedure: "<pasos reproducibles: qué ejecutar y qué leer>"
    expected: "<resultado observable que cualquiera reconocería>"
```

## Cómo rellenarla

- **`version`** y **`feature_id`**: `1` y el ID real de la feature (`FAC-012`, `AUTH-003`). El runner rechaza un archivo de otra feature.
- **`id`**: `AC-NNN`, único en el archivo. Las tareas de `tasks.md` lo citan como «hecha cuando AC-NNN pasa».
- **`title`**: lo que el check demuestra, en una frase que entienda quien aprueba. «Tests en verde» no dice nada; «El CSV tiene una fila por factura» sí.
- **`covers`**: IDs `FR-NN` y `NFR-NN` de los requisitos. Cada requisito tiene que aparecer en al menos un check, y solo se citan IDs que existen. Es la trazabilidad que permite saber qué requisito falla cuando falla un check.
- **`kind`**: prefiere `command` que ejecute pruebas del comportamiento. Usa `file` para artefactos (documentación, configuración, migraciones) y para patrones prohibidos. Deja `inspection` para lo que no se puede automatizar.
- **`required`**: `true` solo si su fallo debe impedir cerrar la feature. Tiene que haber al menos un check obligatorio de tipo `command` o `file`.
- **`command`**: no interactivo (sin esperar teclado), determinista, repetible sin efectos acumulados, rápido, sin red salvo necesidad real, sin efectos destructivos y sin leer secretos. Prefiere un test o un script versionado del proyecto antes que código en línea (`python -c`, `bash -c`): quien aprueba lee un nombre de test, no veinte caracteres crípticos. La red y el código en línea son **sensibles**: valen, pero solo un humano debería aprobarlos.
- **`cwd`**: relativo a la raíz del repositorio y sin `..`.
- **`timeout_seconds`**: entre 1 y 3600. Dale margen a la regresión: si varias sesiones comparten máquina, un timeout justo da falsos bloqueos.
- **`path`**, **`expected`**: ruta relativa y `exists` o `absent`. Con `exists`, añade `contains` o `not_contains`: un archivo que el builder puede crear vacío no demuestra nada.
- **`contains`** / **`not_contains`**: expresiones regulares. Dentro de comillas dobles, escapa la barra invertida (`"def nueva\\("`).
- **`procedure`** y **`expected`** (inspección): pasos que otra persona repetiría igual y un resultado observable. El revisor anota la evidencia en su [[plantillas/veredicto-de-revision|veredicto]].

La regla que resume todo: **un buen check falla hoy y pasa cuando la feature está hecha**. La regresión es la excepción, porque ya pasa y debe seguir pasando.

## Ejemplo

Feature `FAC-012`: exportar facturas a CSV desde la línea de comandos. Es el ejemplo que siguen también [[plantillas/spec-con-ears]] y [[plantillas/veredicto-de-revision]].

```yaml title="acceptance.yaml"
version: 1
feature_id: FAC-012
checks:
  - id: AC-001
    title: La regresión del proyecto sigue pasando
    covers: [NFR-01]
    kind: command
    required: true
    command: bash .claude/bootstrap/verify.sh
    timeout_seconds: 600
    expected_exit_code: 0
  - id: AC-002
    title: El CSV tiene cabecera, una fila por factura y signo negativo en las rectificativas
    covers: [FR-01, FR-02]
    kind: command
    required: true
    command: uv run pytest -q tests/test_exportar.py
    timeout_seconds: 120
    expected_exit_code: 0
  - id: AC-003
    title: Los importes se formatean con Decimal y nunca con float
    covers: [NFR-02]
    kind: file
    required: true
    path: src/facturas/exportar.py
    expected: exists
    contains: "Decimal"
    not_contains: "float\\("
  - id: AC-004
    title: El error de fecha inválida dice qué parámetro falla y qué formato espera
    covers: [FR-03]
    kind: inspection
    required: false
    procedure: "Ejecuta uv run facturas exportar --desde 31-02-2026 y lee el mensaje de error."
    expected: "El mensaje nombra --desde y el formato AAAA-MM-DD."
```

## Errores típicos

- **Checks triviales.** `echo ok`, `true` o «el archivo existe» sin `contains` pasan siempre. El validador del harness del autor los rechaza; si el tuyo no lo hace, revísalos en la puerta humana.
- **Requisitos sin cubrir.** Un `FR-04` que no aparece en ningún `covers` es un requisito que nadie comprobará.
- **Editar la aceptación para que pase.** Tras la aprobación, el archivo está congelado ([[recetas/congelar-la-spec-con-un-hash]]). Si un check está mal, se vuelve a diseñar y a aprobar.
- **Comandos que esperan entrada** o que dependen de un servicio externo: se cuelgan o fallan por causas ajenas a la feature.
- **Todo obligatorio.** Si cualquier detalle de estilo bloquea el cierre, el equipo aprende a saltarse la aceptación.
- **YAML roto por dos puntos.** `title: Error: campo vacío` no parsea; entrecomíllalo.

## Relacionadas

- [[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]: la lección que explica el porqué.
- [[recetas/criterios-de-aceptacion-ejecutables]]: un runner mínimo que ejecuta este archivo.
- [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]: cómo encaja con la spec congelada.
- [[recetas/un-verify-para-toda-la-regresion]]: el `verify.sh` del check AC-001.
- [[plantillas/spec-con-ears]] · [[plantillas/veredicto-de-revision]] · [[plantillas/peticion-de-reparacion]]
