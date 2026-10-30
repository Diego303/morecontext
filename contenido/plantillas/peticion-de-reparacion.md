---
titulo: Petición de reparación acotada
descripcion: Plantilla de repair-request.yaml para pedir al builder un único arreglo con alcance permitido y prohibido, fallo reproducible y aceptación intacta.
creado: 2026-10-29
tipo: spec
formato: yaml
archivo: repair-request.yaml
tags: [plantillas, sdd, revision, harness]
relacionados: ["[[cursos/harness-engineering/08-veredictos-y-reparacion-acotada]]", "[[plantillas/veredicto-de-revision]]", "[[patrones/07-evaluador-optimizador]]", "[[plantillas/estado-de-feature]]"]
---

Cuando el revisor encuentra un fallo pequeño y bien localizado, lo más barato es que el builder lo arregle sin pasar otra vez por diseño ni por la puerta humana. El riesgo es abrir un bucle: arreglo, revisión, otro arreglo, y en cada vuelta el alcance crece un poco. `repair-request.yaml` cierra ese riesgo: es la petición del **único repair automático**, con el fallo exacto, el comando que lo reproduce, lo que el builder puede tocar y lo que no, y la garantía de que la aceptación no cambia. Si el repair no basta, decide el humano.

## Cuándo usarla

- Solo cuando el veredicto es `FAIL_REPAIRABLE` ([[plantillas/veredicto-de-revision]]): las cinco condiciones de reparación son ciertas y no se ha gastado ya el repair.
- En cualquier bucle evaluador-optimizador donde quieras **una vuelta acotada** en lugar de «hasta que pase» ([[patrones/07-evaluador-optimizador]]).
- No la uses para pedir mejoras, refactors ni cambios de diseño. Eso es una feature nueva o un replan.

## La plantilla

```yaml title="repair-request.yaml"
# Petición del único repair automático. La escribe el revisor solo con veredicto FAIL_REPAIRABLE.
# build_attempt = build actual + 1. source_verification_attempt = la verificación que encontró el fallo.
# allowed_scope es lo único que el builder puede cambiar; forbidden_scope lo hace explícito para lo que tienta tocar.
version: 1
feature_id: "<PREFIJO-NNN>"
build_attempt: 2
source_verification_attempt: 1
failing_checks: []                 # IDs AC-NNN que fallan
blocking_issues: []                # hallazgos bloqueantes del veredicto: "ruta:línea · qué falla · requisito"
failure_summary: "<qué falla y por qué, en 1-3 frases>"
reproduction: "<comando exacto que reproduce el fallo>"
allowed_scope: []                  # archivos o zonas ("ruta" o "ruta:función") que el builder puede cambiar
forbidden_scope: []                # lo que no debe tocar aunque parezca relacionado
acceptance_must_remain_unchanged: true
```

## Cómo rellenarla

- **`build_attempt`**: el build actual más uno. Con un solo repair permitido, casi siempre es `2`. Si no coincide con el contador del estado, el motor rechaza la petición.
- **`source_verification_attempt`**: el número de la verificación que produjo el veredicto. Une la petición con su evidencia.
- **`failing_checks`** y **`blocking_issues`**: al menos uno de los dos con contenido. Copia los hallazgos del veredicto tal cual, con `ruta:línea`: el builder no debe tener que reinterpretarlos.
- **`failure_summary`**: obligatorio. La causa probable, no solo el síntoma: «`formatear_importe` usa `abs()`» ayuda más que «el test falla».
- **`reproduction`**: el comando más corto que muestra el fallo, normalmente un solo test. El builder lo ejecuta **antes** de tocar nada para confirmar que ve lo mismo.
- **`allowed_scope`**: el mínimo que permite arreglarlo. Una función mejor que un archivo; un archivo mejor que una carpeta.
- **`forbidden_scope`**: en el harness del autor lo prohibido es implícito (todo lo que no está permitido, más la especificación congelada). Escribirlo explícito ayuda cuando hay algo obvio que tienta: el test que falla, un módulo vecino, la configuración.
- **`acceptance_must_remain_unchanged`**: siempre `true`. Un repair que necesita cambiar la aceptación no es un repair: es un replan.

## Ejemplo

Continúa el veredicto de `FAC-012`: las facturas rectificativas pierden el signo.

```yaml title="repair-request.yaml"
version: 1
feature_id: FAC-012
build_attempt: 2
source_verification_attempt: 1
failing_checks: [AC-002]
blocking_issues:
  - "src/facturas/exportar.py:58 · las rectificativas salen con importe positivo · incumple FR-02"
failure_summary: "formatear_importe usa abs() y pierde el signo de las rectificativas."
reproduction: "uv run pytest -q tests/test_exportar.py::test_rectificativas"
allowed_scope:
  - "src/facturas/exportar.py:formatear_importe"
forbidden_scope:
  - "tests/test_exportar.py (lo usa la aceptación)"
  - "src/facturas/modelos.py"
  - "la especificación de la feature (congelada)"
acceptance_must_remain_unchanged: true
```

Fíjate en que el test que falla está en `forbidden_scope`. Es la tentación clásica: ajustar la prueba en vez del código.

## Errores típicos

- **Alcance enorme.** `allowed_scope: ["src/"]` convierte el repair en una segunda implementación sin diseño ni revisión humana.
- **Dejar que el builder toque los tests de la aceptación.** Un repair que «arregla» la prueba pasa siempre y no arregla nada.
- **Sin comando de reproducción.** El builder adivina, cambia algo y declara arreglado un fallo que nunca vio.
- **Un segundo repair automático.** Si el primero no basta, el fallo no era tan acotado como parecía: la feature va a `blocked` y decide el humano. Ahí se cortan los bucles que no paran ([[problemas/el-agente-no-para]]).
- **Mezclar mejoras.** El `import` sin usar del veredicto era no bloqueante: no entra en el repair.

## Relacionadas

- [[cursos/harness-engineering/08-veredictos-y-reparacion-acotada]]: por qué una sola reparación.
- [[plantillas/veredicto-de-revision]]: el veredicto que origina esta petición.
- [[plantillas/estado-de-feature]]: los contadores `build` y `repair`.
- [[recetas/maquina-de-estados-con-guards]]: el guard que valida esta petición.
