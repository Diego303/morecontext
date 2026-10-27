<p align="center">
  <img src="public/favicon.svg" width="72" height="72" alt="Icono de MoreContext">
</p>

<h1 align="center">MoreContext</h1>

<p align="center">
  <strong>Más contexto, menos ruido.</strong><br>
  La guía abierta y gratuita en español para entender y construir agentes de IA.
</p>

<p align="center">
  <a href="https://morecontextai.com">morecontextai.com</a> ·
  <a href="#secciones">Secciones</a> ·
  <a href="#escribir-contenido">Escribir contenido</a> ·
  <a href="#contribuir">Contribuir</a> ·
  <a href="#licencia">Licencia</a>
</p>

---

## Qué es

Cada semana salen modelos, herramientas y titulares nuevos sobre IA. Casi nada explica qué cambia de verdad cuando te sientas a construir.

MoreContext ordena ese conocimiento desde la base: qué es un agente, cómo se construye, qué patrón usar en cada caso y cómo llevarlo a producción. Con código que funciona, en español, gratis y sin registro.

**¿No entiendes algo? Búscalo aquí y tendrás el contexto que te falta.**

## Secciones

| Sección | Carpeta | Qué encuentras |
|---|---|---|
| Empieza aquí | `contenido/paginas/empieza-aqui.md` | Test de nivel y rutas según tu punto de partida. |
| Roadmap 0→100 | `contenido/roadmap/` | Ocho niveles y 43 lecciones, de qué es un token a agentes en producción. |
| Cursos específicos | `contenido/cursos/` | Monográficos: RAG, MCP, evals, seguridad, agentes de código, multiagente, context engineering, uso del ordenador. |
| Documentación | `contenido/docs/` | Referencia por temas. |
| Guía de modelos | `contenido/modelos/` | Cómo usarlos bien, cómo elegir modelo, parámetros, antipatrones. |
| Sistemas | `contenido/sistemas/` | Arquitecturas completas de proyectos reales. |
| Patrones de agentes | `contenido/patrones/` | Los patrones de *Building effective agents* y cuándo usar cada uno. |
| Disciplinas | `contenido/disciplinas/` | Context engineering, evals, observabilidad, seguridad y formas de trabajar. |
| Recetas | `contenido/recetas/` | Soluciones cortas a problemas concretos. |
| Glosario | `contenido/glosario/` | Un término por archivo. |
| Radar | `contenido/radar/` | Solo lo que cambia cómo construyes. |
| Blog | `contenido/blog/` | Ensayos y análisis. |
| Boletín | `contenido/boletin/` | Archivo de envíos. |

## Escribir contenido

Todo el contenido está en `contenido/` como Markdown. **Un archivo = una página.** La carpeta también es una bóveda de Obsidian: ábrela con *Abrir carpeta como bóveda* y tendrás plantillas, enlaces `[[…]]`, grafo y retroenlaces.

```bash
pnpm nuevo termino glosario/agente-de-voz "Agente de voz"   # crea la nota desde _plantillas (borrador)
pnpm dev                                                    # http://localhost:4321
pnpm validar                                                # comprueba frontmatter y enlaces
```

Las reglas completas (frontmatter, enlaces, avisos, código, diagramas, estilo) están en [`docs/GUIA-CONTENIDO.md`](docs/GUIA-CONTENIDO.md).

### Segundo cerebro con Obsidian

La configuración de la bóveda va incluida en `contenido/.obsidian/`:

- **Enlaces con ruta completa** (`[[glosario/rag]]`), igual que los que entiende la web. Al mover o renombrar una nota, Obsidian actualiza los enlaces.
- **Plantillas** en `_plantillas/` (*Insertar plantilla*); fechas `AAAA-MM-DD`.
- **Adjuntos** en `_adjuntos/`; se enlazan con `![[archivo.png]]`.
- Lo que empieza por `_` o `.` no se publica: plantillas, adjuntos, `_borradores/` y la configuración.

El flujo de una nota nueva:

1. Créala con `pnpm nuevo <plantilla> <ruta> "<Título>"` (o desde Obsidian con la plantilla). Nace con `estado: borrador`.
2. Escríbela y enlázala. En `pnpm dev` se ve con el aviso «Borrador», con sus retroenlaces.
3. `pnpm validar` revisa frontmatter y enlaces, y avisa si una página publicada enlaza a un borrador. En la web, ese enlace sale en gris («aún no existe») hasta que lo publiques.
4. Cambia a `estado: publicado` (o quita la línea), haz commit y push.

Cada página publicada muestra «Enlazado desde» (las notas que la citan con `[[…]]` o en `relacionados`), sus etiquetas (`/tags/`) y un enlace «Editar en GitHub».

## Desarrollo

Requisitos: Node ≥ 22.23.4 y pnpm.

```bash
pnpm install
pnpm dev        # desarrollo
pnpm build      # validar + construir + índice de búsqueda
pnpm preview    # ver la web construida (con búsqueda)
pnpm enlaces    # comprobar enlaces internos de dist/
```

Stack: Astro 7 · Markdown con plugins propios (wikilinks, avisos, pestañas de código) · Shiki · Mermaid · Pagefind · GitHub Pages. Detalles en [`docs/PLAN-IMPLEMENTACION.md`](docs/PLAN-IMPLEMENTACION.md).

### Boletín

El formulario de suscripción solo aparece cuando `SITIO.boletin.action` (en `src/config/sitio.ts`) tiene una URL. Mientras esté vacío, la web muestra «Próximamente» y enlaza al RSS, sin formularios que no llevan a ninguna parte.

1. Crea una cuenta y una lista en tu proveedor de correo (Buttondown, Brevo, MailerLite…).
2. Busca su formulario HTML de suscripción. Copia la URL de su atributo `action` en `boletin.action`, y el `name` de su campo de email en `boletin.campoEmail`.
3. `pnpm build` y comprueba el formulario en `/boletin/` y en la portada. Funciona sin JavaScript: envía por POST en una pestaña nueva.

Cada número se escribe en `contenido/boletin/NNN.md` (plantilla `boletin`). Después se envía desde el proveedor, copiando la página publicada o importando el RSS (`/rss.xml`, que incluye blog, radar y boletín).

## Contribuir

- **Errores y erratas**: abre un *issue* con la página y qué falla.
- **Recetas, términos, correcciones**: *pull request* usando las plantillas de `contenido/_plantillas/` y respetando la [guía de contenido](docs/GUIA-CONTENIDO.md).
- Cada página tiene un enlace «Editar en GitHub».

Estilo de la casa: español de España, frases cortas, tuteo, código que funciona y nada de humo (sin «revolucionario», sin cifras sin fuente).

## Licencia

- **Contenido** (`contenido/`): [CC BY-SA 4.0](LICENSE-CONTENIDO.md).
- **Código**: [MIT](LICENSE).
- **Marca** (nombre MoreContext, icono y logotipo): no incluida en las licencias anteriores.

---

<p align="center"><sub>MoreContext · más contexto, menos ruido</sub></p>
