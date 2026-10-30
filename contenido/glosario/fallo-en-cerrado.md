---
titulo: Fallo en cerrado
descripcion: Principio de diseño por el que un control de seguridad que falla o no puede decidir bloquea la acción en lugar de dejarla pasar.
creado: 2026-10-29
categoria: seguridad
ingles: Fail closed
aliases: [fail closed, fail-closed, fallo seguro, denegar por defecto]
tags: [seguridad, harness, hooks]
relacionados: ["[[glosario/hook]]", "[[cursos/harness-engineering/09-seguridad-en-profundidad]]", "[[problemas/el-hook-bloquea-todo]]", "[[disciplinas/seguridad]]"]
---

Un control falla en cerrado cuando, ante un error propio o una situación que no sabe evaluar, **bloquea**. Lo contrario, fallar en abierto, deja pasar la acción cuando el control se rompe, justo en el momento en que nadie lo está mirando.

## En la práctica

En agentes importa porque los controles deterministas son la última barrera cuando lo probabilístico falla. Un ejemplo concreto: en Claude Code, un [[glosario/hook]] que sale con código 2 bloquea, pero uno que revienta con una excepción y sale con 1 produce un error que **no** bloquea. Si tu hook de seguridad no captura sus excepciones, falla en abierto. La solución es envolver la lógica y salir con 2 ante cualquier fallo:

```python title="guard.py"
import json
import sys

def decidir(evento: dict) -> bool:
    """True si la acción está permitida (aquí iría tu lógica real)."""
    return "rm -rf" not in evento.get("tool_input", {}).get("command", "")

try:
    permitido = decidir(json.load(sys.stdin))
except Exception as exc:  # JSON roto, campo inesperado, bug propio
    print(f"guard: no pude evaluar la acción ({exc}); la bloqueo", file=sys.stderr)
    sys.exit(2)
if not permitido:
    print("guard: comando bloqueado", file=sys.stderr)
    sys.exit(2)
```

El harness del autor aplica la misma idea al flujo: una transición que no cumple sus guards no escribe nada, y un error determinista bloquea aunque la revisión del modelo sea favorable.

## No confundir con

- **Tolerancia a fallos**: seguir funcionando ante errores. Aquí se prefiere parar.

## Ver también

- [[recetas/hook-que-bloquea-comandos-peligrosos]]
- [[glosario/minimo-privilegio]]
- [[roadmap/90-harness/03-permisos-y-hooks]]
