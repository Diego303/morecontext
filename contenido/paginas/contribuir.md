---
titulo: Cómo contribuir
descripcion: Cómo proponer correcciones, recetas y términos del glosario, qué estilo seguir, cómo usar las plantillas y el flujo de trabajo con Obsidian y git.
creado: 2026-07-03
actualizado: 2026-10-29
tags: [proyecto, contribuir]
relacionados: ["[[paginas/manifiesto]]", "[[paginas/licencia]]", "[[recetas/index]]", "[[glosario/index]]"]
---

MoreContext es abierto y mejora con cada corrección. Puedes ayudar de tres formas: avisar de un error, proponer un cambio pequeño o aportar contenido nuevo, como una receta o un término del glosario. Todo pasa por el repositorio público en GitHub.

## Proponer una corrección

Abre una **incidencia** (*issue*) en el repositorio cuando veas:

- Un dato técnico incorrecto o desactualizado.
- Un ejemplo de código que no funciona.
- Un enlace roto o una explicación confusa.

Para que se pueda arreglar rápido, incluye la URL de la página, qué esperabas y qué has encontrado. Si es código, añade la versión del SDK y el mensaje de error completo. Si sabes la solución, puedes abrir directamente un *pull request*.

## Proponer recetas y términos

Las [[recetas/index|recetas]] y los términos del [[glosario/index|glosario]] son la forma más sencilla de aportar contenido nuevo.

1. Comprueba que no exista ya. Busca en la web y en el mapa del contenido del repositorio.
2. Crea la nota desde su plantilla (más abajo).
3. Rellena el frontmatter completo y sigue la estructura de la plantilla.
4. Abre un *pull request* con una frase que explique qué problema resuelve.

Para lecciones, sistemas o cambios de estructura, abre antes una incidencia y lo hablamos. Así no trabajas en algo que luego no encaja.

## Proponer plantillas, herramientas, lecturas y problemas

Cuatro secciones crecen sobre todo con aportaciones pequeñas. Cada una tiene su plantilla en `_plantillas/` y unas reglas propias:

- **[[plantillas/index|Plantillas]]** (plantilla `plantilla.md`): un prompt, una spec, una checklist o una configuración que uses de verdad. Indica `tipo`, `formato` y el nombre de `archivo` sugerido, y añade un ejemplo rellenado. Si se inspira en la de otra persona, enlaza el original en vez de copiarla entera.
- **[[herramientas/index|Herramientas]]** (plantilla `herramienta.md`): una ficha por herramienta, sin enlaces de afiliado. La `licencia` va como identificador SPDX (o «propietaria») y `open_source` dice si lo es. Comprueba la versión y pon la fecha en `revisado`. Si eres quien la mantiene, dilo en el *pull request*.
- **[[biblioteca/index|Biblioteca]]** (plantilla `paper.md`): un paper o un texto que haya cambiado cómo se construye. Título, autores, año y URL comprobados en la fuente, y tu comentario: qué idea aporta, qué ha envejecido y dónde se ve en MoreContext.
- **[[problemas/index|Problemas frecuentes]]** (plantilla `problema.md`): un síntoma que te hayas encontrado. El campo `sintoma` lleva el mensaje de error literal o la frase con la que alguien lo buscaría. Explica cómo confirmar la causa antes del arreglo.

## Estilo de la casa

- Español de España, tuteo, voz activa y frases cortas.
- Sin humo: nada de adjetivos de folleto, cifras sin fuente ni promesas.
- Explica cada término técnico la primera vez o enlázalo al glosario.
- Si algo depende, di de qué. Si cambia rápido (modelos, precios, límites), remite a la documentación oficial.
- Código mínimo y ejecutable, con el nombre del modelo en una sola constante. Las salidas inventadas van en un bloque `text` que empieza con `# salida de ejemplo`.
- Pocos avisos por página: dos o tres como mucho.

## Usar las plantillas

La carpeta `_plantillas/` tiene una plantilla por tipo de página: lección, artículo de docs, receta, término, patrón, sistema, entrada del radar, herramienta, paper, problema y el resto. No la confundas con la sección pública [[plantillas/index|Plantillas]]: `_plantillas/` no se publica y sirve para crear notas. Cada una trae el frontmatter de su colección y las secciones que esperamos.

En Obsidian, crea una nota nueva y usa *Insertar plantilla*. Fuera de Obsidian, copia el archivo y sustituye los valores. Deja `estado: borrador` mientras escribes. La web no publica los borradores.

## Flujo con Obsidian y git

```bash
git clone <url-del-repositorio>
cd <carpeta-del-repositorio>
pnpm install
git switch -c receta/reintentos-con-jitter
```

1. Abre la carpeta `contenido/` como bóveda en Obsidian. Los enlaces `[[ruta]]` funcionan igual en Obsidian y en la web.
2. Escribe con la ruta completa en los enlaces, por ejemplo `[[glosario/rag]]`.
3. Mira el resultado con `pnpm dev` en `http://localhost:4321`.
4. Pasa `pnpm validar`. Comprueba el frontmatter y falla si hay enlaces a páginas que no existen.
5. Quita el `estado: borrador`, haz commit y abre el *pull request*.

> [!consejo] Cambios pequeños
> Un *pull request* por receta o por corrección. Se revisa antes y se fusiona antes. Es la misma idea que en [[disciplinas/cambios-pequenos-y-revisables]].

## Licencia de lo que aportas

Al contribuir aceptas que tu texto se publique con la licencia del contenido (CC BY-SA 4.0) y tu código con la del código (MIT). Los detalles están en [[paginas/licencia]].

## Código de conducta

- Trata a todo el mundo con respeto, sea cual sea su nivel.
- Critica el contenido, no a las personas.
- Las preguntas de principiante son bienvenidas.
- No se tolera el acoso, los insultos ni la discriminación. Esas aportaciones se cierran y sus autores pueden quedar fuera del proyecto.
