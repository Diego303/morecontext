<p align="center">
  <img src="assets/brand/icon.svg" width="72" height="72" alt="Icono de MoreContext">
</p>

<h1 align="center">MoreContext</h1>

<p align="center">
  <strong>Más contexto, menos ruido.</strong><br>
  La guía abierta y gratuita en español para entender y construir agentes de IA.
</p>

<p align="center">
  <a href="https://morecontextai.com">morecontextai.com</a> ·
  <a href="#secciones">Secciones</a> ·
  <a href="#contribuir">Contribuir</a> ·
  <a href="#licencia">Licencia</a>
</p>

---

## Qué es

Cada semana salen modelos, herramientas y titulares nuevos sobre IA. Casi nada explica qué cambia de verdad cuando te sientas a construir.

MoreContext ordena ese conocimiento desde la base: qué es un agente, cómo se construye, qué patrón usar en cada caso y cómo llevarlo a producción. Con código que funciona, en español, gratis y sin registro.

**¿No entiendes algo? Búscalo aquí y tendrás el contexto que te falta.**

## Principios

- **Sin humo.** Nada de cifras inventadas, promesas ni testimonios. Si algo no se sabe, se dice.
- **Útil.** Cada página deja algo que puedes hacer hoy.
- **De lo simple a lo complejo.** Empieza por lo más sencillo que funcione y añade complejidad solo cuando se demuestra que mejora.
- **Código real.** Los ejemplos se pueden ejecutar y llevan su forma de comprobar que funcionan.
- **Abierto.** Contenido CC BY-SA 4.0 y código MIT. Cualquiera puede leer, reutilizar y proponer mejoras.

## Secciones

| Sección | Qué encuentras |
|---|---|
| **Empieza aquí** | Test de nivel y rutas según tu punto de partida. |
| **Roadmap 0→100** | Ocho niveles en orden, de qué es un token a agentes en producción. |
| **Cursos específicos** | Monográficos cortos: RAG, MCP, evals, seguridad, multiagente, agentes de código… |
| **Documentación** | Referencia por temas: prompting, herramientas, contexto, agentes, evals, producción. |
| **Guía de modelos** | Cómo usarlos bien, cómo elegir modelo por tarea, parámetros y antipatrones. |
| **Sistemas** | Arquitecturas completas de proyectos reales: RAG con citas, multiagente, soporte, extracción… |
| **Patrones de agentes** | Encadenado, enrutado, paralelización, orquestador, evaluador-optimizador y agente autónomo. |
| **Disciplinas** | Context engineering, evals, observabilidad, seguridad y formas de trabajar con agentes. |
| **Recetas** | Soluciones cortas a problemas concretos, con código. |
| **Glosario** | Los términos que vas a encontrar, con definiciones claras. |
| **Radar** | Solo lo que cambia cómo construyes: qué es, qué cambia y qué hacer. |
| **Blog** | Ensayos, análisis y notas de campo. |
| **Boletín** | Un correo cada dos semanas con lo que ha cambiado y una receta. |

## Estado

🚧 En construcción. La web se está diseñando y el contenido se publicará por fases, empezando por el roadmap, la documentación básica y el glosario.

## Estructura del repositorio

```
.
├── index.html          # Portada
├── assets/
│   ├── css/            # Estilos (design system)
│   ├── js/             # Buscador, pestañas de código, progreso
│   └── brand/          # Icono, logotipo y guía de marca
├── docs/               # Documentación
├── aprender/           # Roadmap, cursos y lecciones
├── sistemas/           # Arquitecturas de referencia
├── patrones/
├── recetas/
├── glosario/
├── radar/
├── blog/
└── CNAME               # Dominio personalizado (morecontextai.com)
```

## Ver la web en local

Es una web estática: no necesita instalación.

```bash
git clone https://github.com/Diego303/morecontext.git
cd morecontext
python3 -m http.server 8000
```

Abre `http://localhost:8000` en el navegador.

## Contribuir

Las aportaciones son bienvenidas, sobre todo:

- **Erratas y errores técnicos.** Si algo está mal o desactualizado, abre un *issue* indicando la página y qué falla.
- **Recetas y ejemplos.** Propón una receta con el problema que resuelve, el código y cómo comprobar que funciona.
- **Términos del glosario.** Definición corta, correcta y con enlaces a donde se usa.

Antes de enviar contenido, ten en cuenta el estilo de la casa:

1. Español de España, frases cortas y en segunda persona (tú).
2. Nada de marketing: sin "revolucionario", "potente" ni cifras sin fuente.
3. El código debe ejecutarse y, si muestras una salida inventada, márcala como *salida de ejemplo*.

Para cambios grandes, abre primero un *issue* para comentarlo.

## Licencia

- **Contenido** (textos, lecciones, documentación, diagramas): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es). Puedes compartirlo y adaptarlo citando la fuente y con la misma licencia.
- **Código** (ejemplos y código de la web): [MIT](LICENSE).
- **Marca** (nombre MoreContext, icono y logotipo): no incluida en las licencias anteriores.

---

<p align="center"><sub>MoreContext · más contexto, menos ruido</sub></p>
