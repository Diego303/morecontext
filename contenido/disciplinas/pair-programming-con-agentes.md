---
titulo: Pair programming con un agente
descripcion: Programar en pareja con un agente de código, repartiendo los papeles de conductor y navegante y manteniendo tú el criterio sobre el diseño.
creado: 2026-09-22
orden: 8
tipo: forma-de-trabajar
tags: [forma-de-trabajar, agentes-de-codigo]
relacionados: ["[[cursos/agentes-de-codigo/index]]", "[[disciplinas/explorar-planificar-implementar-verificar]]", "[[disciplinas/cambios-pequenos-y-revisables]]", "[[cursos/agentes-de-codigo/04-revisar-y-confiar]]"]
---

Hacer pair programming con un agente es trabajar con él en tiempo real sobre el mismo código, conversando, en lugar de lanzarle una tarea y volver una hora después. Tú pones el criterio, el conocimiento del dominio y la revisión. El agente pone velocidad para leer, escribir y probar.

## Qué es

En el pair programming clásico hay dos papeles. El **conductor** escribe. El **navegante** piensa en el diseño, detecta errores y mira hacia dónde va el cambio. Con un agente de código los papeles se intercambian según la fase:

| Fase | Conductor | Navegante |
|---|---|---|
| Entender código ajeno | Agente (lee, resume, traza llamadas) | Tú (preguntas, decides qué importa) |
| Diseñar | Tú (decides la forma) | Agente (propone alternativas, señala riesgos) |
| Escribir | Agente | Tú (revisas cada bloque) |
| Depurar | Agente (ejecuta, añade logs) | Tú (formulas hipótesis) |

Es distinto de delegar una tarea completa a un agente en segundo plano. Ambas formas tienen su sitio: el pair programming rinde con código que no conoces, diseño incierto o problemas difíciles de depurar. La delegación, con tareas bien definidas y una buena [[disciplinas/spec-primero|spec]].

## Por qué importa

Un agente de código escribe rápido y con seguridad aparente, también cuando se equivoca. Si solo miras el resultado final, revisas un diff grande sin el razonamiento que lo produjo. En pareja ves cada decisión cuando se toma y la corriges cuando aún es barata.

Además aprendes. Pedir al agente que te explique un módulo, que te enseñe dónde se llama una función o que proponga dos diseños y argumente cada uno te hace entender el código más rápido que leerlo solo.

## Prácticas concretas

- **Empieza preguntando, no pidiendo cambios.** «Explícame cómo fluye una petición desde `routes.py` hasta la base de datos» antes de «añade un campo».
- **Pide un plan y apruébalo.** Antes de editar, que el agente diga qué archivos tocará y qué hará en cada uno. Corrige el plan, no el código. Ver [[roadmap/40-primer-agente/04-planificar-antes-de-actuar]].
- **Avanza en pasos que puedas revisar.** Un cambio, sus tests, revisión, siguiente. Si un paso produce un diff de 400 líneas, era demasiado grande.
- **Haz que el agente ejecute.** Tests, linter, el script que reproduce el bug. Un agente que ve la salida real de sus cambios se corrige solo. Uno que no la ve, adivina.
- **Di lo que sabes y él no.** «Ese campo puede venir nulo en clientes antiguos», «este servicio tiene un límite de 10 peticiones por segundo». El contexto del dominio es tu aportación principal.
- **Pon las convenciones en un archivo.** Las reglas que repites en cada sesión (estilo, comandos de test, carpetas prohibidas) van en un archivo de instrucciones del repositorio que el agente lee al empezar. Lo trata [[cursos/agentes-de-codigo/02-contexto-del-repositorio]].
- **Desconfía de la confianza.** Cuando el agente dice «esto ya funciona», pide la prueba: el test que pasa, la salida del comando.
- **Corta y reinicia cuando se atasca.** Si lleva tres intentos con el mismo error, para. Resume lo aprendido, limpia el contexto y empieza una sesión nueva con ese resumen.

> [!aviso] Revisas tú
> El código que entra en el repositorio es tuyo, lo haya escrito quien lo haya escrito. Si no entiendes un cambio, no lo aceptes hasta entenderlo.

## Señales de que lo haces mal

- Aceptas cambios sin leerlos porque «el agente sabe lo que hace».
- Las sesiones acaban con un diff enorme que no sabrías explicar.
- Repites las mismas instrucciones en cada conversación.
- El agente propone, tú aceptas, falla, le pegas el error, propone otra cosa, y así diez veces.
- Nunca le pides que ejecute nada: solo escribe y tú pruebas a mano.
- Dejas de entender tu propio código base.

## Cómo empezar mañana

1. Elige un módulo del proyecto que conozcas poco y pide al agente que te lo explique con un diagrama de llamadas. Comprueba dos afirmaciones en el código.
2. En tu siguiente cambio, pide primero un plan, corrígelo por escrito y solo entonces deja que edite.
3. Pídele que ejecute los tests tras cada paso y que te enseñe la salida.
4. Apunta las instrucciones que has repetido hoy y llévalas al archivo de instrucciones del repositorio.

## Para seguir

- [[cursos/agentes-de-codigo/01-como-trabaja-un-agente-de-codigo]]
- [[cursos/agentes-de-codigo/03-explorar-planificar-implementar-verificar]]
- [[sistemas/agente-de-codigo]]
