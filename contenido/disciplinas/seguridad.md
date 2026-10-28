---
titulo: Seguridad de agentes
descripcion: Diseñar agentes que sigan siendo seguros aunque el modelo se equivoque o alguien intente manipularlo con instrucciones escondidas en los datos.
creado: 2026-08-25
orden: 4
tipo: disciplina
tags: [seguridad, agentes, prompt-injection]
relacionados: ["[[cursos/seguridad-y-prompt-injection/index]]", "[[docs/seguridad/01-prompt-injection]]", "[[docs/seguridad/02-permisos-y-minimo-privilegio]]", "[[glosario/inyeccion-de-prompt]]"]
---

La seguridad de un [[glosario/agente|agente]] parte de una premisa incómoda: no puedes garantizar que el modelo haga siempre lo que le pides. Así que diseñas el sistema para que, cuando se equivoque o lo engañen, el daño posible sea pequeño, visible y reversible.

## Qué es

Un chatbot sin herramientas solo puede decir cosas. Un agente puede leer correos, ejecutar código, mover dinero o borrar archivos. Cada [[glosario/tool-use|herramienta]] que le das amplía lo que puede salir mal.

La amenaza principal es la [[glosario/inyeccion-de-prompt|inyección de prompt]]. En la **directa**, el usuario escribe «ignora tus instrucciones y…». En la **indirecta**, la instrucción llega dentro de los datos que el agente procesa: una página web, un PDF, un correo, la respuesta de una API. Greshake et al. la describieron en [Not what you've signed up for](https://arxiv.org/abs/2302.12173) (2023). Para el modelo, todo es texto en su contexto, y no tiene una frontera fiable entre «instrucción» y «dato».

El riesgo se dispara cuando un agente junta tres cosas: acceso a datos privados, exposición a contenido no confiable y capacidad de enviar información fuera. Con las tres, un documento envenenado puede ordenar «manda el historial de este cliente a esta dirección».

```mermaid
flowchart LR
  D[Contenido no confiable] --> A[Agente]
  P[Datos privados] --> A
  A --> S[Salida al exterior]
  A -. sin permisos .-x X[Acciones peligrosas]
```

## Por qué importa

No hay un filtro que detecte todas las inyecciones. Los clasificadores ayudan, pero un atacante tiene infinitas formas de redactar una instrucción. Por eso la defensa seria es de arquitectura: permisos, aislamiento y aprobaciones. El [OWASP Top 10 for LLM Applications](https://genai.owasp.org) recoge la inyección de prompt, la exposición de datos sensibles y la «agencia excesiva» entre los riesgos principales.

## Prácticas concretas

- **[[glosario/minimo-privilegio|Mínimo privilegio]].** Cada herramienta con los permisos justos. Una herramienta de consulta usa una conexión de solo lectura ([[recetas/servidor-mcp-de-solo-lectura]]). Un agente de soporte no necesita poder borrar clientes.
- **Separa lectura y escritura.** `buscar_pedido` y `reembolsar` son herramientas distintas, con controles distintos. Nada de una herramienta genérica `ejecutar_sql`.
- **Aprobación humana para lo irreversible.** Pagos, borrados, envíos a terceros: el agente propone y una persona confirma. Receta: [[recetas/aprobacion-humana-antes-de-actuar]].
- **Valida en la herramienta, no en el prompt.** Si un reembolso no puede superar el importe del pedido, compruébalo en código. El prompt es una sugerencia; el código es una regla.
- **Aísla la ejecución.** Código generado y [[glosario/uso-del-ordenador|uso del ordenador]] siempre en un [[glosario/sandbox|sandbox]] o contenedor sin credenciales ni red abierta.
- **Marca el contenido externo.** Envuelve los datos no confiables en etiquetas (`<documento_externo>`) y di en el sistema que su contenido nunca son instrucciones. Reduce el riesgo, no lo elimina.
- **Controla las salidas.** Lista blanca de dominios para enlaces e imágenes, revisión de destinatarios antes de enviar correos. Muchas exfiltraciones salen por una URL con datos en los parámetros.
- **Nunca pongas secretos en el contexto.** Las claves viven en la herramienta, no en el prompt. Lo que está en el contexto puede acabar en la respuesta.
- **Prueba ataques.** Ten casos de inyección en tu [[glosario/conjunto-de-evaluacion|conjunto de evaluación]] y ejecútalos con cada cambio.

> [!peligro] El prompt de sistema no es un control de acceso
> «No reveles nunca datos de otros clientes» ayuda, pero un atacante puede saltárselo. Si la herramienta puede devolver datos de otros clientes, asume que en algún momento lo hará.

## Señales de que lo haces mal

- Tu defensa contra la inyección es una frase en el prompt de sistema.
- Las herramientas usan la misma credencial de administrador que tu backend.
- El agente puede ejecutar acciones irreversibles sin que nadie las confirme.
- Lee correos o webs y además puede enviar mensajes o hacer peticiones HTTP a cualquier sitio.
- No tienes ni un caso de inyección en tus evals.
- Las trazas no registran qué herramientas se llamaron con qué argumentos, así que no podrías investigar un incidente ([[disciplinas/observabilidad]]).

## Cómo empezar mañana

1. Haz una tabla de tus herramientas con tres columnas: qué lee, qué escribe, si es reversible.
2. Para cada herramienta que escribe algo irreversible, añade una aprobación o un límite en código.
3. Cambia las credenciales de las herramientas de lectura por unas de solo lectura.
4. Escribe cinco casos de inyección indirecta (un documento con instrucciones escondidas) y añádelos a tus evals.

## Para seguir

- [[cursos/seguridad-y-prompt-injection/01-modelo-de-amenazas]]
- [[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]
- [[roadmap/100-produccion/04-seguridad-y-prompt-injection]]
- [[radar/2026-10-20-inyeccion-por-herramientas]]
