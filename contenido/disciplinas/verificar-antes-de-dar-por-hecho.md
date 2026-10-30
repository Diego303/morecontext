---
titulo: Verificar antes de dar por hecho
descripcion: Ninguna tarea está terminada sin evidencia fresca, un comando ejecutado después del último cambio; los tests no se debilitan y el veredicto es estructurado.
creado: 2026-10-29
orden: 15
tipo: forma-de-trabajar
tags: [forma-de-trabajar, verificacion, agentes-de-codigo, tests]
relacionados: ["[[glosario/veredicto]]", "[[glosario/aceptacion-ejecutable]]", "[[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]", "[[cursos/agentes-de-codigo/04-revisar-y-confiar]]", "[[plantillas/veredicto-de-revision]]"]
---

Verificar antes de dar por hecho significa que ni tú ni tu agente decís «terminado», «arreglado» o «listo» sin una comprobación ejecutada sobre la versión actual del trabajo, con su resultado completo a la vista. Sin evidencia no hay «hecho». Es la regla más barata de aplicar y la que más PASS falsos evita.

## Qué es

Una regla con tres partes, tomada de la skill `verification-before-completion` del harness del autor:

1. **Evidencia fresca.** La comprobación se ejecuta **después del último cambio relevante**. Un resultado de hace diez minutos no vale si después se tocó una línea.
2. **Cada afirmación, ligada a un check.** «FR-03 cumplido» apunta a `AC-003 → pass`, no a una impresión.
3. **Si no se puede comprobar, se dice.** Una comprobación que no se puede ejecutar (falta una herramienta, no hay red) se informa como bloqueo, con la limitación exacta. No se sustituye por confianza.

## Por qué importa

Los modelos tienden a declarar éxito. No por mala fe: el texto «he ejecutado los tests y pasan» es muy probable al final de una tarea, se hayan ejecutado o no. Anthropic lo documenta en su arnés para tareas largas: uno de los fallos que tuvo que corregir fue el agente que marca una funcionalidad como hecha sin probarla, y la regla que puso es que el agente solo puede marcarla como superada, nunca quitar ni editar sus pruebas ([*Effective harnesses for long-running agents*](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), noviembre de 2025).

Y porque la verificación es lo que hace revisable el trabajo de un agente. Si cada «hecho» viene con un comando y su salida, revisas en minutos. Si viene con un párrafo, tienes que repetirlo todo.

## Qué cuenta como evidencia

| Cuenta | No cuenta |
|---|---|
| El comando ejecutado, su código de salida y su salida, después del último cambio | «Lo comprobé antes» |
| Un `acceptance-results.json` cuya huella coincide con el código actual | Un resultado de otra rama o de otro intento |
| Una inspección con procedimiento y lo observado, anotado por quien revisa | «Parece correcto» |
| Un bloqueo explícito: «no se pudo ejecutar AC-004: falta pytest» | Omitir el check que no se pudo ejecutar |

Las frases que delatan falta de evidencia, según la misma skill: «debería funcionar», «parece correcto», «casi verde», «probablemente pasa», «lo comprobé antes».

## Prácticas concretas

- **Pide siempre la salida, no el resumen.** «Ejecuta `python3 -m pytest -q` y pega las últimas veinte líneas» en lugar de «comprueba que los tests pasan».
- **Comprueba la frescura.** Si guardas la evidencia con una huella del código, puedes comprobar en un segundo si sigue valiendo ([[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]).
- **Nunca debilites un test para que pase.** Un `assert` borrado, un `skip` nuevo, un umbral más laxo o un filtro `-k` más amplio son cambios de la aceptación, no arreglos. Si el test estaba mal, se vuelve a aprobar la spec. La aceptación aprobada se congela con una huella para que esto sea detectable ([[recetas/congelar-la-spec-con-un-hash]]).
- **Un veredicto estructurado, no un párrafo.** El harness del autor usa cuatro: `PASS` (todos los obligatorios en verde), `FAIL_REPAIRABLE` (falla algo reproducible y arreglable dentro del alcance aprobado), `FAIL_NONREPAIRABLE` (hay que cambiar la spec o hay efectos irreversibles) y `BLOCKED_TOOLING` (no se pudo comprobar por el entorno). Cada uno lleva a un sitio distinto: archivar, una reparación, una persona o arreglar el entorno ([[plantillas/veredicto-de-revision]]).
- **Quien verifica no es quien construyó.** Un revisor con contexto limpio, otra sesión o tú. Cognition encontró en 2026 que el bucle generador-verificador funciona mejor cuando el revisor no comparte el contexto del autor.
- **Salida mínima de cualquier verificación**: comando o procedimiento ejecutado, resultado y código de salida, criterios no ejecutados y por qué, y veredicto.

## Señales de que lo haces mal

- Aceptas un «listo» del agente sin ver ninguna salida de comando.
- Los tests pasan después de que el agente «ajustara» los tests.
- Tus informes de verificación son párrafos, no listas de checks con resultado.
- Tratas un «no se pudo ejecutar» como un fallo del código y pides que lo arregle.
- Das por buena una ejecución de antes del último cambio porque «solo fue un comentario».

## Cómo empezar mañana

1. Añade a las instrucciones de tu agente: «Antes de decir que algo está terminado, ejecuta `<tu comando de tests>` después del último cambio y pega la salida. Si no puedes ejecutarlo, dilo y explica por qué».
2. En la próxima revisión, rechaza cualquier «hecho» sin salida de comando, aunque creas que es verdad.
3. Revisa el diff de `tests/` antes que el del código: busca `assert` borrados, `skip` y filtros nuevos.
4. Cuando una tarea tenga criterios de aceptación, pide el veredicto en formato fijo: un check por línea con `pass`, `fail`, `blocked` o `manual`, y un veredicto final.

## Para seguir

- [[roadmap/70-flujos-con-especificacion/04-aceptacion-ejecutable]]
- [[cursos/harness-engineering/08-veredictos-y-reparacion-acotada]]
- [[disciplinas/explorar-planificar-implementar-verificar]]
- [[recetas/un-verify-para-toda-la-regresion]]
