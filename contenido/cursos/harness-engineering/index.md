---
titulo: "Harness engineering: construye el tuyo"
descripcion: Desmonta pieza a pieza un harness SDD multiagente real para Claude Code y adáptalo a tu repositorio, con sus contratos, su motor de estado y sus tests.
creado: 2026-10-29
orden: 11
nivel: avanzado
horas: 10
objetivo: Entender, ejecutar y adaptar a tu proyecto un harness SDD multiagente completo para Claude Code, con máquina de estados, spec congelada, aceptación ejecutable, fronteras de seguridad y coste por feature.
requiere: ["[[roadmap/90-harness/index]]"]
relacionados: ["[[sistemas/harness-sdd-claude-code]]", "[[disciplinas/harness-engineering]]", "[[roadmap/70-flujos-con-especificacion/index]]", "[[docs/claude-code/index]]"]
tags: [harness, claude-code, multiagente, sdd]
---

Este curso no parte de un ejemplo de juguete. Recorre el [[glosario/harness|harness]] que el autor usa a diario con Claude Code: un bundle de [[glosario/sdd|desarrollo guiado por especificación]] con un orquestador, cuatro [[glosario/subagente|subagentes]] con contexto limpio, una sola [[glosario/puerta-humana|puerta humana]] y herramientas deterministas en Python que deciden qué transiciones son legales. Está en la versión 0.8.0, funciona y sus 95 tests pasan. Vas a leer su código, ejecutarlo en una copia y entender por qué cada pieza está hecha así, para que puedas construir el tuyo o adaptar este.

## Qué construyes

Al terminar tendrás el harness instalado en un repositorio tuyo y adaptado a su stack:

- un `CLAUDE.md` que convierte la sesión principal en orquestador e importa el contrato (`HARNESS.md`) y las reglas del proyecto (`AGENTS.md`);
- cuatro agentes (explorer, designer, builder, reviewer) con herramientas mínimas y un informe de retorno estructurado;
- un contrato de flujo en TOML con 9 fases y 15 eventos, y un motor (`feature.py`) que es el único que escribe el estado;
- una especificación que se congela por hash al aprobarla y una aceptación que se ejecuta con evidencia fresca;
- un hook que bloquea lo que ningún agente debe hacer y otro que mide el coste real de cada subagente.

La ficha completa del sistema está en [[sistemas/harness-sdd-claude-code]]; la variante para trabajar varias features a la vez, en [[sistemas/harness-sdd-olas]].

## Para quién

Para desarrolladores que ya usan Claude Code (o cualquier [[glosario/agente|agente]] de código) en proyectos reales y han visto sus límites: sesiones que se degradan, «hecho» sin pruebas, cambios fuera de alcance, gasto que nadie controla. Si nunca has escrito un subagente o un hook, empieza por [[docs/claude-code/index]].

## Requisitos

- Los niveles [[roadmap/50-skills/index]], [[roadmap/70-flujos-con-especificacion/index]] y [[roadmap/90-harness/index]] del roadmap.
- Python 3.11 o posterior (3.9 con el paquete `tomli`), `bash` y `git`. El harness usa solo la biblioteca estándar.
- Una instalación reciente de Claude Code y un repositorio de prueba con tests.

## Temario

1. [[cursos/harness-engineering/01-del-prompt-al-harness]]. Agente = modelo + harness, y dónde encajan context, loop y graph engineering.
2. [[cursos/harness-engineering/02-los-problemas-que-resuelve]]. Cada limitación del modelo, lo que provoca y la respuesta concreta del bundle.
3. [[cursos/harness-engineering/03-las-quince-piezas]]. Las quince piezas de un harness, su archivo en el bundle y la arquitectura por capas.
4. [[cursos/harness-engineering/04-patrones-y-principios]]. Pipeline, router, evaluador-optimizador acotado, máquina de estados, los nueve principios y las primitivas de Claude Code.
5. [[cursos/harness-engineering/05-agentes-y-orquestador]]. Qué ve, qué escribe y qué devuelve cada agente, y un orquestador que no escribe código.
6. [[cursos/harness-engineering/06-el-flujo-como-maquina-de-estados]]. `workflow.toml`, las 24 guards y una feature recorrida paso a paso.
7. [[cursos/harness-engineering/07-spec-congelada-y-aceptacion]]. El hash de la spec aprobada y `run_acceptance.py`.
8. [[cursos/harness-engineering/08-veredictos-y-reparacion-acotada]]. Cuatro veredictos y un único repair automático.
9. [[cursos/harness-engineering/09-seguridad-en-profundidad]]. Permisos de `settings.json` y el hook `guard.py`.
10. [[cursos/harness-engineering/10-coste-y-presupuesto]]. Coste medido en los transcripts y presupuesto que detiene el trabajo nuevo.
11. [[cursos/harness-engineering/11-sesiones-largas]]. Canario de contexto, traspaso de sesión y reanudación segura.
12. [[cursos/harness-engineering/12-probar-y-evolucionar-el-harness]]. Validador, tests y métricas para cambiar el harness sin romperlo.
13. [[cursos/harness-engineering/13-features-en-paralelo-con-olas]]. Varias features a la vez, cada una en su [[glosario/worktree|worktree]] y su sesión, integradas de una en una.
14. [[cursos/harness-engineering/14-especializa-el-harness]]. Proyecto final: del diseño técnico a un harness especializado, con `AGENTS.md` y `verify.sh` reales, backlog, olas y especialistas.

## Cómo usar el repositorio

El bundle completo está en el repositorio del harness. Tiene dos carpetas: `HARNESS/`, lo que se copia a tu proyecto, e `INSTRUCCIONES/`, los manuales para humanos (no se copian y no gastan contexto de los agentes). Para las prácticas del curso usa un repositorio de prueba; cuando lo adoptes en tu proyecto, la instalación es la misma:

```bash title="instalar el harness"
cp -r harness-base/HARNESS/. /ruta/a/tu-repo/
cd /ruta/a/tu-repo
bash .claude/bootstrap/init.sh                     # comprueba Python, valida y pasa los tests
python3 .claude/tools/validate_harness.py          # bundle y features
python3 -m unittest discover -s .claude/tests      # los 95 tests del harness
python3 .claude/tools/feature.py status            # cola de features
```

Si tu repositorio ya tiene `CLAUDE.md`, `AGENTS.md` o `.gitignore`, fusiónalos en lugar de pisarlos. Recién instalado, el validador da un único aviso: `verify.sh` sin configurar. Lo resolverás en la lección 14.

> [!consejo] Lee el código con la lección abierta
> Cada lección cita archivos con su ruta. Ábrelos a la vez: las seis herramientas suman unas 3.900 líneas de Python y casi todas las decisiones están explicadas en el propio código o en `HARNESS.md`.
