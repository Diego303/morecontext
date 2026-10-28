---
titulo: Revisar y saber cuándo confiar
descripcion: Cómo revisar los cambios de un agente de código, qué señales indican que no debes fiarte y cómo graduar su autonomía según el riesgo de cada acción.
creado: 2026-09-21
orden: 4
minutos: 45
tipo: practica
objetivos:
  - Revisar un diff de un agente con un orden de lectura que detecte los fallos típicos
  - Implementar comprobaciones automáticas de alarmas sobre un diff de git
  - Decidir el nivel de autonomía de un agente según la reversibilidad y el alcance de cada acción
requiere: ["[[cursos/agentes-de-codigo/03-explorar-planificar-implementar-verificar]]"]
relacionados: ["[[disciplinas/cambios-pequenos-y-revisables]]", "[[disciplinas/humano-en-el-bucle]]", "[[patrones/07-evaluador-optimizador]]", "[[roadmap/80-evals/04-evals-de-trayectoria]]"]
tags: [agentes, codigo, revision]
---

Al terminar esta lección tendrás un método para revisar lo que entrega un agente de código en pocos minutos, un script que marca automáticamente los cambios sospechosos y un criterio para decidir qué puede hacer el agente sin preguntarte.

## La idea

Un agente de código escribe deprisa y con seguridad aparente. Su resumen final suele decir «todos los tests pasan» y suele ser verdad. El problema está en los casos en que no lo es, o en que los tests pasan por el motivo equivocado. La revisión existe para eso.

**Confiar en un agente significa confiar en la evidencia que produce**, no en su resumen. Hay tres fuentes de evidencia, de más a menos fiable: lo que puedes comprobar ejecutando (tests, tipos, lint), lo que ves en el diff y lo que el agente dice que hizo. Revisa en ese orden.

## Diffs pequeños: la condición previa

Un diff de 40 líneas se revisa en tres minutos. Uno de 900 no se revisa: se aprueba o se rechaza a ojo. Si quieres revisar de verdad, la tarea tiene que producir cambios pequeños, y eso se decide antes, al dividir el trabajo ([[disciplinas/cambios-pequenos-y-revisables]]).

Trabaja en una rama y pide al agente un commit por paso del plan. Así cada commit se revisa por separado y deshacer un paso es un `git revert`. Git es tu red de seguridad: un agente que trabaja en una rama limpia puede equivocarse sin coste.

## Orden de lectura de un diff

1. **Lista de archivos.** ¿Coincide con el plan? Un archivo inesperado es la primera alarma.
2. **Cambios en tests.** Lee los tests antes que el código. ¿Se ha añadido un test que fallaba antes? ¿Se ha modificado o borrado alguno existente?
3. **Dependencias y configuración.** `pyproject.toml`, `package.json`, CI, variables de entorno. Cambios pequeños aquí tienen efectos grandes.
4. **El código.** Ahora sí: ¿hace lo que dice el plan? ¿Maneja el caso de error?
5. **El resumen del agente.** Contrástalo con lo anterior.

## Señales de que no debes fiarte

| Señal | Por qué es grave |
|---|---|
| Se ha modificado un test existente para que pase | El agente puede haber ajustado la expectativa al bug |
| Tests marcados como `skip` o `xfail`, o borrados | La suite pasa porque mide menos |
| Aserciones debilitadas (`assert resultado` en lugar de `assert resultado == 42`) | El test ya no comprueba nada concreto |
| `try/except` amplio alrededor del código nuevo | El error sigue ahí, oculto |
| Valores fijos que casualmente coinciden con el test | Se ha optimizado para el test, no para el problema |
| Dependencia nueva no pedida | Superficie de ataque y mantenimiento |
| Archivos fuera del plan | El agente se ha extendido o ha arreglado algo que no tocaba |

Ninguna de estas señales prueba que el cambio esté mal. Todas justifican leer con atención. Muchas se detectan con un script.

## Alarmas automáticas sobre el diff

Este script compara la rama del agente con la base y marca lo sospechoso. Úsalo como paso previo a tu revisión o como comprobación en CI.

```python title="alarmas_diff.py"
import re, subprocess, sys

def git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout

def alarmas(base: str = "main", permitidos: set[str] | None = None) -> list[str]:
    avisos = []
    stat = [l.split("\t") for l in git("diff", "--numstat", base).splitlines() if l]
    archivos = {ruta for _, _, ruta in stat}
    total = sum(int(a) + int(b) for a, b, _ in stat if a != "-")
    if total > 300:
        avisos.append(f"Diff grande: {total} líneas. Pide dividirlo.")
    if permitidos is not None:
        for f in sorted(archivos - permitidos):
            avisos.append(f"Fuera del plan: {f}")
    for f in sorted(archivos):
        if re.search(r"(pyproject\.toml|requirements.*\.txt|package\.json|\.github/)", f):
            avisos.append(f"Configuración o dependencias tocadas: {f}")
    estado = {l.split("\t")[-1]: l[0] for l in git("diff", "--name-status", base).splitlines() if l}
    for f, st in estado.items():
        if "test" in f and st in ("M", "D"):
            avisos.append(f"Test existente {'borrado' if st == 'D' else 'modificado'}: {f}")
    for linea in git("diff", "-U0", base).splitlines():
        if linea.startswith("+") and not linea.startswith("+++"):
            if re.search(r"pytest\.mark\.(skip|xfail)|@unittest\.skip|\.skip\(", linea):
                avisos.append(f"Test desactivado: {linea[1:].strip()}")
            if re.search(r"except\s*(Exception)?\s*:", linea):
                avisos.append(f"Excepción genérica capturada: {linea[1:].strip()}")
    return avisos

if __name__ == "__main__":
    lista = alarmas(sys.argv[1] if len(sys.argv) > 1 else "main")
    print("\n".join(lista) or "Sin alarmas.")
    sys.exit(1 if lista else 0)
```

```text
# salida de ejemplo
Test existente modificado: tests/test_texto.py
Excepción genérica capturada: except Exception:
```

Con esto no sustituyes la revisión. La diriges: sabes qué mirar primero.

## Un segundo par de ojos automático

Puedes añadir un modelo revisor que lea el diff y el plan con una rúbrica concreta: ¿el cambio cumple cada paso?, ¿hay cambios fuera de alcance?, ¿los tests nuevos fallarían sin el arreglo? Es el patrón [[patrones/07-evaluador-optimizador]] aplicado a la revisión. Funciona mejor con una rúbrica de preguntas cerradas que con «revisa este código» ([[recetas/modelo-juez-con-rubrica]]). Úsalo para priorizar tu atención, nunca como sustituto de los tests.

## Graduar la autonomía

No todas las acciones merecen la misma supervisión. El criterio útil combina dos preguntas: **¿se puede deshacer?** y **¿afecta a algo fuera de la rama?**

| Acción | Reversible | Alcance | Autonomía razonable |
|---|---|---|---|
| Leer, buscar, ejecutar tests | Sí | Local | Sin preguntar |
| Editar archivos en una rama | Sí (git) | Local | Sin preguntar; revisas el diff al final |
| Instalar dependencias | Casi siempre | Entorno | Preguntar o lista permitida |
| Commit y push a una rama propia | Sí | Remoto, aislado | Sin preguntar si la rama es del agente |
| Merge a la rama principal, despliegue | Difícil | Producción | Siempre humano |
| Migraciones de datos, borrar recursos | No | Producción | Siempre humano, con revisión previa |

La confianza se gana con datos. Si mides cuántas propuestas del agente aceptas sin cambios en un tipo de tarea, sabrás dónde puedes relajar la supervisión y dónde no ([[roadmap/80-evals/04-evals-de-trayectoria]]). Para la mecánica de aprobaciones, mira [[disciplinas/humano-en-el-bucle]] y [[recetas/aprobacion-humana-antes-de-actuar]].

> [!peligro] Tests que el agente puede editar
> Si el agente puede modificar los tests y su objetivo es que pasen, tienes un conflicto de intereses en el bucle. Para tareas sensibles, protege los tests existentes: rechaza ediciones sobre ellos desde la herramienta y permite solo añadir tests nuevos.

## Errores frecuentes

- **Revisar el resumen en lugar del diff.** El resumen es lo que el agente cree que hizo.
- **Aceptar «todos los tests pasan» sin ver la salida.** Pide la salida literal del comando en el informe.
- **Dar la misma autonomía a todo.** O frenas lo inofensivo o dejas pasar lo irreversible.

## Ejercicio

> [!ejercicio] Revisión con alarmas
> Ejecuta `alarmas_diff.py` en la rama que produjo tu agente en la lección anterior. Después, pídele al agente una tarea donde la salida fácil sea tocar un test (por ejemplo, cambiar el formato de una fecha que un test comprueba) y revisa qué hace.
> Está bien si: el script detecta el test modificado, puedes explicar en una frase si la modificación era legítima y has añadido a la herramienta `editar_archivo` una protección que rechaza con `is_error` los cambios en tests existentes.

> [!ejercicio]- Pistas
> Para saber si un test ya existía, compara con `git ls-files tests/` en la rama base. Permite crear archivos nuevos en `tests/` pero no editar los que ya estaban.

## Resumen

- Confía en la evidencia (tests, diff), no en el resumen del agente.
- Diffs pequeños y un commit por paso hacen la revisión posible.
- Lee primero archivos, tests y dependencias; después el código.
- Automatiza las alarmas típicas y protege los tests existentes en tareas sensibles.
- Gradúa la autonomía según reversibilidad y alcance.

## Para seguir

- [[sistemas/agente-de-codigo]]
- [[disciplinas/pair-programming-con-agentes]]
- [[cursos/evals-para-agentes/index]]
