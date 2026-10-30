---
titulo: Cambios pequeños y revisables
descripcion: Trabajar con agentes en cambios acotados, con un propósito por cambio y pruebas incluidas, para que una persona pueda revisarlos de verdad y revertirlos si hace falta.
creado: 2026-10-20
actualizado: 2026-10-29
orden: 12
tipo: forma-de-trabajar
tags: [forma-de-trabajar, agentes-de-codigo, revision]
relacionados: ["[[cursos/agentes-de-codigo/04-revisar-y-confiar]]", "[[disciplinas/spec-primero]]", "[[disciplinas/explorar-planificar-implementar-verificar]]", "[[sistemas/agente-de-codigo]]"]
---

Cambios pequeños y revisables significa que todo lo que produce un agente llega en unidades que una persona puede entender de principio a fin en una sesión de revisión: un propósito, un diff acotado, sus tests y una descripción de qué y por qué. Si no se puede revisar bien, no se acepta.

## Qué es

Un agente de código puede generar en diez minutos un diff que a una persona le cuesta una tarde revisar. El cuello de botella pasa de escribir a revisar. Esta forma de trabajar ajusta el tamaño de los cambios a la capacidad de revisión, no a la de generación.

Un cambio revisable tiene:

- **Un solo propósito.** Una corrección, una funcionalidad o una refactorización. Nunca las tres mezcladas.
- **Un tamaño que se lee de una vez.** No hay una cifra universal, pero si no puedes mantener el cambio entero en la cabeza, es grande.
- **Tests que demuestran el propósito.** El test que falla sin el cambio y pasa con él.
- **Una descripción útil.** Qué cambia, por qué, cómo se ha verificado y qué queda fuera.

## Por qué importa

Los diffs grandes se revisan peor. Quien revisa empieza leyendo con atención y termina pasando pantallas. Los errores sutiles del agente (un caso límite olvidado, una condición invertida, un `try` que se traga una excepción) sobreviven justo en ese tramo.

Los cambios pequeños también se revierten fácil. Si un cambio de 40 líneas rompe producción, lo deshaces sin perder nada más. Si el fallo está dentro de un PR de 2 000 líneas que mezcla tres cosas, revertir duele.

Y te dan señales tempranas. Diez cambios pequeños te dicen pronto si el agente va bien encaminado. Uno grande solo te lo dice al final.

## Prácticas concretas

- **Divide antes de empezar.** Con la [[disciplinas/spec-primero|spec]] delante, pide al agente que proponga una secuencia de cambios independientes. Cada uno, un PR.
- **Separa refactorización de comportamiento.** Primero un PR que mueve o renombra sin cambiar lo que hace (los tests no cambian). Después, otro con el cambio de comportamiento.
- **Un commit por paso del plan.** Con mensajes que expliquen el porqué. Facilita revisar por partes y bisecar.
- **Una feature por sesión.** Cada sesión del agente lleva una sola feature de principio a fin. Si mezclas dos, el diff que revisas incluye código de la otra y los tests de una fallan por la mitad sin terminar de la otra. Para varias a la vez, una sesión y un *[[glosario/worktree|worktree]]* por feature ([[disciplinas/trabajo-en-paralelo-con-agentes]]).
- **Un commit *squash* por feature al integrar.** Los commits intermedios te sirven mientras trabajas; en la rama de integración, cada feature entra como un único commit con un mensaje que explica qué y por qué. En el harness del autor ese mensaje lo redacta el revisor (en Conventional Commits) al dar el `PASS`, y el commit y el *push* los hace la persona, nunca el agente ([[sistemas/harness-sdd-olas]], [[recetas/integrar-features-en-paralelo]]). Revertir una feature es revertir un commit.
- **Pide al agente la descripción del PR** con una estructura fija: propósito, cambios por archivo, cómo se verificó (con la salida de los tests), riesgos.
- **Pon límites al agente.** «No toques archivos fuera de `facturacion/`», «no cambies dependencias». Si necesita salirse, que lo pida.
- **Revisa con un segundo contexto.** Un subagente revisor que solo ve el diff y la spec ([[disciplinas/orquestador-y-subagentes]]) encuentra cosas distintas que el autor. No sustituye a tu revisión.
- **Usa ramas y *feature flags*.** Un cambio puede entrar pequeño y desactivado mientras el resto llega.
- **Rechaza sin culpa.** Si el diff es demasiado grande, pide que se divida. Con un agente, regenerar cuesta poco.

```text title="Descripción de PR que pedir al agente"
## Propósito
Una frase.

## Cambios
- archivo.py: qué y por qué.

## Verificación
Comandos ejecutados y su salida (tests, linter).

## Fuera de alcance / riesgos
Lo que no se ha hecho y lo que conviene mirar con lupa.
```

> [!aviso] El agente también comete errores que «compilan»
> Tests que pasan porque comprueban poco, mocks que esconden el fallo real, casos borrados en lugar de arreglados. Revisa los tests con el mismo cuidado que el código.

## Señales de que lo haces mal

- Tus PR con agente tienen miles de líneas y cambian decenas de archivos.
- En la revisión escribes «LGTM» sin haber leído todo.
- Un PR arregla un bug, renombra un módulo y actualiza dependencias.
- Cuando algo falla, nadie sabe qué parte del cambio fue.
- Una sesión del agente arrastra dos o tres features a medias.
- El agente borra o relaja tests para que pasen, y no lo ves hasta producción.

## Cómo empezar mañana

1. Fija un tamaño máximo orientativo para tus PR y díselo al agente en el archivo de instrucciones del repositorio.
2. En tu próxima tarea, pide primero la lista de cambios independientes y abre un PR por cada uno.
3. Exige en cada descripción la sección «Verificación» con la salida real de los tests.
4. Revisa los tests primero: si no prueban el propósito, el resto da igual.

## Para seguir

- [[cursos/agentes-de-codigo/04-revisar-y-confiar]]
- [[sistemas/agente-de-codigo]]
- [[disciplinas/pair-programming-con-agentes]]
- [[disciplinas/verificar-antes-de-dar-por-hecho]]
