---
titulo: "Uso del ordenador: siempre en sandbox"
descripcion: Un modelo que ve la pantalla y mueve ratón y teclado actúa con tus permisos; ejecútalo siempre en una máquina virtual o contenedor aislado.
creado: 2026-07-02
actualizado: 2026-10-29
categoria: seguridad
tags: [uso-del-ordenador, sandbox, seguridad]
fuente:
  titulo: Documentación de la API de Claude
  url: https://platform.claude.com/docs
relacionados: ["[[glosario/uso-del-ordenador]]", "[[glosario/sandbox]]", "[[docs/herramientas/04-uso-del-ordenador]]", "[[cursos/uso-del-ordenador/04-seguridad-y-aislamiento]]"]
---

## Qué es

El [[glosario/uso-del-ordenador|uso del ordenador]] es una herramienta versionada con la que el modelo recibe capturas de pantalla y devuelve acciones de ratón y teclado que tu código ejecuta. Lo que pueda hacer depende de la máquina donde corra. La práctica recomendada en la documentación oficial es clara: ejecútalo en un [[glosario/sandbox|sandbox]], una máquina virtual o contenedor aislado con lo mínimo.

## Qué cambia en la práctica

- Todo lo que aparece en pantalla entra en el contexto: una web puede contener instrucciones que el modelo intente seguir ([[glosario/inyeccion-de-prompt|inyección de prompt]]).
- Una sesión con tus credenciales abiertas convierte cualquier error en un error con tus permisos.
- Es más lento y frágil que una API. Si existe una API para la tarea, suele ser mejor opción.

## Qué hacer

1. Monta un entorno aislado sin credenciales personales, con red restringida a los dominios necesarios: [[cursos/uso-del-ordenador/04-seguridad-y-aislamiento]].
2. Pide confirmación humana antes de compras, envíos o borrados ([[glosario/humano-en-el-bucle|humano en el bucle]]).
3. Decide si de verdad necesitas el navegador: [[cursos/uso-del-ordenador/02-navegador-o-api]].
4. Consulta el nombre exacto de la versión de la herramienta en la documentación oficial y la referencia [[docs/herramientas/04-uso-del-ordenador]].

> [!nota] Actualización (oct. 2026)
> Desde agosto, el uso del ordenador es un *toolset* (una sola entrada en `tools` con su configuración) y hay otro para el navegador; el criterio de usar siempre la versión vigente de la documentación no cambia. Un matiz al punto 1: restringir la red a una lista de dominios no basta por sí solo, porque cada dominio permitido es una capacidad que el modelo o un atacante pueden aprovechar (Anthropic, [How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude), may. 2026). Elige esos dominios como eliges permisos. Más en [[docs/herramientas/04-uso-del-ordenador]] y [[cursos/uso-del-ordenador/04-seguridad-y-aislamiento]].
