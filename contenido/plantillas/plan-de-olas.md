---
titulo: Plan de olas para features en paralelo
descripcion: Plantilla de docs/planes/olas.md para decidir qué features pueden construirse a la vez en worktrees, en qué orden se integran, qué conflictos esperar y con qué prompts arrancarlas.
creado: 2026-10-29
tipo: spec
formato: md
archivo: docs/planes/olas.md
tags: [plantillas, paralelo, worktrees, olas, harness]
relacionados: ["[[cursos/harness-engineering/13-features-en-paralelo-con-olas]]", "[[glosario/ola]]", "[[recetas/features-en-paralelo-con-worktrees]]", "[[recetas/integrar-features-en-paralelo]]", "[[sistemas/harness-sdd-olas]]"]
---

Construir varias features a la vez con agentes es fácil de arrancar y difícil de cerrar: el problema aparece al integrar. Una [[glosario/ola|ola]] es un grupo de features cuyas dependencias ya están integradas y que no tocan el mismo módulo, así que pueden ir a la vez, **cada una en su propio [[glosario/worktree|worktree]] y con su propia sesión**. Este documento fija qué features forman cada ola, en qué orden se integran, qué conflictos son esperables y cómo se resuelven, y los prompts para arrancar cada sesión. Es la plantilla del harness del autor en su perfil con olas: las reglas valen para cualquier proyecto y las tablas de olas y de dependencias implícitas se rellenan con las tuyas.

## Cuándo usarla

- Cuando tienes un backlog con dependencias declaradas y más features independientes de las que puedes revisar de una en una.
- Cuando el cuello de botella eres tú (las aprobaciones y las integraciones), no el agente: el plan te dice cuántas cosas abrir a la vez.
- No la uses con un backlog sin dependencias claras ni con features que tocan todas el mismo módulo: ahí las olas serían de una feature.

## La plantilla

````markdown nocheck title="docs/planes/olas.md"
# Olas: varias features a la vez

> Qué features de <PROYECTO> se pueden construir en paralelo y cómo hacerlo sin romper el flujo.
> El catálogo de features fija qué depende de qué; este documento fija qué puede ir a la vez.
> §6 y §8 son de este proyecto; el resto son reglas generales. Los IDs <PREFIJO>-NNN son ficticios.

## 1. En una página

- Una ola es un grupo de hasta <MAX_ABIERTAS> features (4 por defecto) cuyas dependencias
  ya están integradas en <RAMA_INTEGRACION> y que no tocan el mismo módulo.
- Cada feature de la ola va en su propio worktree (rama temporal wt/<id>) con su propia
  sesión del agente. El flujo de cada feature no cambia: apruebas cada puerta humana como siempre.
- El árbol principal es solo para integrar: cuando una feature se archiva, entra en
  <RAMA_INTEGRACION> con un squash (un commit por feature) y la regresión en verde.

| Etapa | Features | Olas | Mínimo teórico (ruta más larga) |
| --- | --- | --- | --- |
| <versión> | <n> | <n> | <n> |

Por qué un worktree por feature: en el mismo árbol, el diff del revisor mezcla el código de
las dos features, la regresión de una falla por el código a medias de la otra y dos
transiciones de estado a la vez pueden perder una.

## 2. Reglas

1. Arranca una feature solo con todas sus dependencias integradas (las de «depende de:» en el
   backlog y las implícitas de §8), y crea su worktree desde <RAMA_INTEGRACION>.
2. Una feature por worktree y por sesión, siempre con su ID explícito.
3. Nada se construye en el árbol principal mientras haya worktrees abiertos.
4. Como mucho <MAX_ABIERTAS> features a la vez, y menos si la máquina va justa. El límite real
   eres tú: puertas humanas, dependencias e integraciones.
5. Una por módulo: dos features que tocan el mismo módulo, registro central o formato de datos
   del usuario no van en la misma ola.
6. Integra de una en una, en el orden de la ola. Tras cada integración, la regresión en verde
   antes de integrar la siguiente.
7. Una sola prueba E2E a la vez si usan puertos o recursos fijos.
8. Los cuellos de botella van con compañía ligera: <IDs de las features de las que dependen
   muchas otras>. Revisa su puerta humana con calma.
9. No se cruzan versiones: una ola nunca mezcla versiones del roadmap.
10. Ritmo continuo: si una feature de la ola siguiente ya tiene sus dependencias integradas y
    su módulo libre, puede arrancar sin esperar a que acabe la ola entera.

## 3. Preparación

- AGENTS.md lleva el apartado «Paralelo» de Git y la convención «depende de:» en las notas.
- Worktrees en un disco rápido (<~/repo-wt>); en WSL, en el disco de Linux, no en /mnt/c.
- Si varias features de la ola necesitan dependencias nuevas, instálalas antes de abrir la
  ola, de una vez, desde <RAMA_INTEGRACION> y con su propio commit.

## 4. Ciclo de una feature en paralelo

| Paso | Orden | Quién |
| --- | --- | --- |
| Abrir | git worktree add -b wt/<id> <carpeta>/<id> <RAMA_INTEGRACION>, y una sesión en esa carpeta | tú o tu script |
| Trabajar | el flujo normal de la feature en su sesión | agente + tú (puerta humana) |
| Integrar | en el árbol principal: git merge --squash wt/<id>, regresión y commit con el mensaje que propone el revisor | tú |
| Cerrar | git worktree remove <carpeta>/<id> y git branch -D wt/<id> | tú o tu script |

Si la regresión falla al integrar, no lo arregles encima: aborta la integración y registra
un bug en <RAMA_INTEGRACION> con el log. Las demás features de la ola no necesitan rebase.

## 5. Conflictos esperables al integrar

| Dónde | Por qué choca | Cómo se resuelve |
| --- | --- | --- |
| Backlog (<feature_list.json>) | Cambios de estado y seguimientos nuevos | Une las features por ID. |
| Lockfiles (<uv.lock, pnpm-lock.yaml…>) | Dependencias nuevas en dos features | Nunca a mano: lado de la rama de integración y reinstala. |
| Manifiestos (<pyproject.toml, package.json…>) | Dependencias nuevas en dos features | Conserva las dos líneas. |
| Código generado | Se regenera en cada feature | Nunca a mano: regenéralo tras integrar. |
| Registros (rutas, comandos, errores, textos) | Cada feature añade su entrada | Conserva las dos entradas. |
| Migraciones | Dos features añaden «la siguiente» | Primero la de la rama de integración; la nueva, con el número siguiente. |
| <archivo compartido de tu proyecto> | <por qué choca> | <cómo se resuelve> |

## 6. Las olas

«Integra en este orden»: la ruta crítica primero, o quien cambia la forma de algo compartido.
«Vigila»: lo que puede chocar. «Decides tú»: decisiones de la puerta humana y pasos humanos previos.

### <versión> · <objetivo>

| Ola | Features | Integra en este orden | Vigila | Decides tú |
| --- | --- | --- | --- | --- |
| O1.1 | <PREFIJO>-101 | sola | Cuello de botella: sola. | <decisión> |
| O1.2 | <PREFIJO>-102 · <PREFIJO>-103 · <PREFIJO>-104 | 104 → 103 → 102 | <archivos compartidos> | nada |
| O1.x | <PREFIJO>-198 | sola | Pruebas de la versión, con todo integrado. | nada |
| O1.y | <PREFIJO>-199 | sola | Release (§7). | <firma, publicación> |

## 7. Entre versiones

- Las pruebas de la versión (x98) y la release (x99) van solas, con toda la versión integrada.
- Durante la release puedes construir la primera ola de la versión siguiente en worktrees,
  pero no integres nada hasta publicar: la release arrastraría código de la versión siguiente.

## 8. Dependencias implícitas

Código que una feature usa de otra sin declararlo en el backlog. En serie no importa, porque
el orden global ya las respeta; en paralelo, sí. Dalas de alta también en el backlog.

| Feature | Necesita antes | Motivo (plan y sección) |
| --- | --- | --- |
| <PREFIJO>-109 | <PREFIJO>-105 | <Usa la cola de trabajos que crea 105 (plan 02, §3).> |

## 9. Cuándo no paralelizar

- Cuando la puerta humana de un cuello de botella te pide pensar: mejor esa feature sola.
- Cuando la regresión falla al integrar: arregla en la rama de integración antes de seguir.
- Cuando la máquina no da abasto y los comandos de aceptación superan su timeout.
- Cuando dos features tocan el mismo formato de datos del usuario.

## 10. Prompts

Arrancar una feature en su worktree:

```text
Esta sesión trabaja en el worktree wt/<id> y solo lleva <ID> (modo olas,
docs/planes/olas.md). Autorizo construir esta feature en paralelo en este
worktree. Arráncala con el flujo normal, o reanúdala si ya estaba empezada.
No crees ramas ni hagas commits. Al archivar, dame el mensaje de commit que
propone el revisor y para.
```

Integrar con conflictos (en el árbol principal):

```text
Fuera del flujo, cambio concreto que te pido: integro <ID> y el squash ha
dejado conflictos. Resuélvelos sin cambiar comportamiento, según la tabla de
§5 de docs/planes/olas.md: en registros conserva las entradas de los dos
lados; en migraciones, primero la de la rama de integración y después la
nueva con el número siguiente; lockfiles y código generado, nunca a mano. No
ejecutes la regresión ni hagas commit: avísame cuando no queden marcas.
```
````

## Cómo rellenarla

- **Parámetros.** `<MAX_ABIERTAS>` es cuántas sesiones puedes revisar a la vez, no cuántas aguanta la máquina; empieza con 2. `<RAMA_INTEGRACION>` suele ser `develop`; si integras directamente en `main`, cámbialo en todo el documento y en `AGENTS.md`.
- **§1, tabla de etapas.** El *mínimo teórico* es la cadena de dependencias más larga de la etapa: ni con infinitas sesiones bajarías de ese número de olas. Si tus olas son muchas más, revisa si hay dependencias que sobran o módulos demasiado grandes.
- **§4, el ciclo.** Los comandos de git son el mínimo manual. El harness del autor los envuelve en un script (`scripts/ola.sh abrir | estado | integrar | cerrar`) que además comprueba dependencias, copia la configuración local y abre una ventana por feature. La rama `wt/<id>` se borra con `-D` porque, tras un squash, git no la considera fusionada.
- **§5, conflictos.** Recorre tu repositorio buscando archivos donde cada feature añade una línea: registros de rutas, catálogos de errores, migraciones, `feature_list.json`. Cada uno es una fila con su forma de resolverlo.
- **§6, las olas.** Calcúlalas por niveles del grafo de dependencias dentro de cada versión: una feature entra en la primera ola posterior a la de todas sus dependencias. Luego aplica «una por módulo» y saca a los cuellos de botella. El orden de integración pone primero la ruta crítica.
- **§8, dependencias implícitas.** Lee los planes de cada feature buscando «usa», «reutiliza» o «extiende» algo de otra que no esté en su `depende de:`. Cada hallazgo es una fila aquí y, mejor aún, una dependencia declarada en el backlog.
- **§10, prompts.** Ajusta las rutas y el nombre del flujo. La frase «Autorizo construir esta feature en paralelo» importa: sin ella, un agente que sigue el apartado «Paralelo» de `AGENTS.md` se negará a construir fuera del flujo normal.

## Ejemplo

La sección 6 y la 8 de un backlog pequeño de facturación (IDs ficticios):

```markdown title="docs/planes/olas.md"
### v1 · Facturas básicas

| Ola | Features | Integra en este orden | Vigila | Decides tú |
| --- | --- | --- | --- | --- |
| O1.1 | FAC-101 Modelo de factura | sola | Cuello de botella: todo depende de ella. | Formato del número de factura |
| O1.2 | FAC-102 Alta · FAC-103 Listado · FAC-104 Exportar CSV | 102 → 104 → 103 | Registro de rutas en api/rutas.py | nada |
| O1.3 | FAC-105 Cola de envíos · FAC-106 Rectificativas | 105 → 106 | Migraciones: 105 primero | Proveedor de correo |
| O1.x | FAC-198 Pruebas de la v1 | sola | E2E con todo integrado | nada |

| Feature | Necesita antes | Motivo (plan y sección) |
| --- | --- | --- |
| FAC-106 | FAC-104 | Reutiliza formatear_importe de la exportación (plan 02, §4). |
```

Con O1.2 abierta, `FAC-106` no puede adelantarse aunque su dependencia declarada (`FAC-101`) ya esté integrada: la implícita con `FAC-104` lo impide.

## Errores típicos

- **Dos features en el mismo árbol.** El revisor ve un diff mezclado, la regresión falla por código ajeno y el estado puede perder transiciones ([[blog/2026-10-25-tres-cosas-que-se-rompen-sin-worktrees]]).
- **Integrar varias a la vez** «porque todas pasaron». Cada una pasó sola; juntas no se han probado nunca. Una integración, una regresión.
- **Arreglar a mano encima de una integración rota.** Se pierde quién rompió qué. Aborta y registra el bug ([[problemas/conflictos-al-integrar-en-paralelo]]).
- **Resolver lockfiles a mano.** Quédate con el de la rama de integración y reinstala.
- **Olas que mezclan versiones.** Una release a medias arrastra código de la versión siguiente.
- **Abrir tantas como permite la máquina.** El límite es tu capacidad de revisar con calma cada puerta humana.

## Relacionadas

- [[cursos/harness-engineering/13-features-en-paralelo-con-olas]]: la lección completa.
- [[recetas/features-en-paralelo-con-worktrees]] · [[recetas/integrar-features-en-paralelo]]
- [[disciplinas/trabajo-en-paralelo-con-agentes]]: cuándo compensa paralelizar.
- [[plantillas/agents-md]]: el apartado «Paralelo» y la convención `depende de:`.
- [[plantillas/prompt-plan-de-implementacion]]: el prompt que calcula este documento para un proyecto entero.
