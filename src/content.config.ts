import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { generarId } from './lib/rutas.mjs';

const C = './contenido';
const MD_SIN_INDEX = ['**/*.md', '!**/index.md'];

// ---------- Campos comunes a todo el contenido ----------
const wikilinks = z.array(z.string()).default([]);
const base = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().min(20).max(220),
  estado: z.enum(['borrador', 'revision', 'publicado']).default('publicado'),
  creado: z.coerce.date(),
  actualizado: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  aliases: z.array(z.string()).default([]),
  relacionados: wikilinks,
});
const nivelDificultad = z.enum(['inicial', 'intermedio', 'avanzado']);
const escala = z.number().int().min(1).max(3);

// ---------- Portadillas de sección: contenido/<seccion>/index.md ----------
const secciones = defineCollection({
  loader: glob({ pattern: '[!_]*/index.md', base: C, generateId: generarId }),
  schema: base.extend({ orden: z.number().int() }),
});

// ---------- Aprender: roadmap ----------
const niveles = defineCollection({
  loader: glob({ pattern: '*/index.md', base: `${C}/roadmap`, generateId: generarId }),
  schema: base.extend({
    nivel: z.number().int().min(0).max(100),
    horas: z.number().positive(),
    objetivo: z.string(),
    prerrequisitos: wikilinks,
    proyecto: z.object({ titulo: z.string(), descripcion: z.string(), entregable: z.string() }),
  }),
});
const leccion = base.extend({
  orden: z.number().int().positive(),
  minutos: z.number().int().positive(),
  tipo: z.enum(['teoria', 'practica', 'proyecto']).default('teoria'),
  objetivos: z.array(z.string()).min(1),
  requiere: wikilinks,
});
const lecciones = defineCollection({
  loader: glob({ pattern: ['*/*.md', '!*/index.md'], base: `${C}/roadmap`, generateId: generarId }),
  schema: leccion,
});

// ---------- Aprender: cursos específicos ----------
const cursos = defineCollection({
  loader: glob({ pattern: '*/index.md', base: `${C}/cursos`, generateId: generarId }),
  schema: base.extend({
    orden: z.number().int(),
    nivel: nivelDificultad,
    horas: z.number().positive(),
    objetivo: z.string(),
    requiere: wikilinks,
  }),
});
const leccionesCurso = defineCollection({
  loader: glob({ pattern: ['*/*.md', '!*/index.md'], base: `${C}/cursos`, generateId: generarId }),
  schema: leccion,
});

// ---------- Documentación ----------
const docsGrupos = defineCollection({
  loader: glob({ pattern: '*/index.md', base: `${C}/docs`, generateId: generarId }),
  schema: base.extend({ orden: z.number().int() }),
});
const docs = defineCollection({
  loader: glob({ pattern: ['*/*.md', '!*/index.md'], base: `${C}/docs`, generateId: generarId }),
  schema: base.extend({ orden: z.number().int(), nivel: nivelDificultad.default('intermedio') }),
});

// ---------- Resto de secciones (un archivo = una página) ----------
function plana<S extends z.ZodType>(carpeta: string, schema: S) {
  return defineCollection({ loader: glob({ pattern: MD_SIN_INDEX, base: `${C}/${carpeta}`, generateId: generarId }), schema });
}

const modelos = plana('modelos', base.extend({ orden: z.number().int() }));
const sistemas = plana('sistemas', base.extend({
  orden: z.number().int(),
  complejidad: escala,
  tiempo: z.string(),                       // "1–2 días"
  stack: z.array(z.string()).default([]),
  componentes: z.array(z.string()).default([]),
  patrones: wikilinks,
}));
const patrones = plana('patrones', base.extend({
  orden: z.number().int(),
  tipo: z.enum(['fundamento', 'workflow', 'agente']),
  coste: escala.optional(),
  latencia: escala.optional(),
  cuandoUsar: z.string().optional(),
  cuandoNo: z.string().optional(),
}));
const disciplinas = plana('disciplinas', base.extend({
  orden: z.number().int(),
  tipo: z.enum(['disciplina', 'forma-de-trabajar']),
}));
const recetas = plana('recetas', base.extend({
  nivel: nivelDificultad,
  minutos: z.number().int().positive(),
  tema: z.enum(['prompting', 'herramientas', 'rag', 'agentes', 'evals', 'produccion']),
  stack: z.array(z.string()).default([]),
}));
const glosario = plana('glosario', base.extend({
  categoria: z.enum(['fundamentos', 'prompting', 'herramientas', 'contexto', 'agentes', 'evals', 'produccion', 'seguridad']),
  ingles: z.string().optional(),            // término original si se usa en inglés
}));
const radar = plana('radar', base.extend({
  categoria: z.enum(['modelos', 'herramientas', 'practicas', 'seguridad', 'evals']),
  fuente: z.object({ titulo: z.string(), url: z.string() }).optional(),
}));
const blog = plana('blog', base.extend({
  tipo: z.enum(['ensayo', 'analisis', 'nota-de-campo', 'tutorial']),
  destacado: z.boolean().default(false),
  autor: z.string().optional(),
}));
const boletin = plana('boletin', base.extend({ numero: z.number().int().positive() }));
const paginas = plana('paginas', base);

// ---------- Backlog (fase 13): secciones que se publican cuando tienen entradas ----------
const problemas = plana('problemas', base.extend({
  orden: z.number().int().optional(),
  sintoma: z.string().min(10),              // «Mi agente entra en bucle»
}));
const plantillas = plana('plantillas', base.extend({
  orden: z.number().int().optional(),
  formato: z.enum(['md', 'txt', 'json', 'jsonl', 'yaml']),
}));
const biblioteca = plana('biblioteca', base.extend({
  autores: z.string(),                       // «Yao et al.»
  anio: z.number().int().min(1950).max(2100),
  url: z.url(),
}));
const herramientas = plana('herramientas', base.extend({
  url: z.url(),
  categoria: z.string(),                     // framework, observabilidad, evals…
  licencia: z.string().optional(),
}));
const comunidad = plana('comunidad', base.extend({
  autor: z.string(),
  url: z.url(),
}));

export const collections = {
  secciones, niveles, lecciones, cursos, leccionesCurso, docsGrupos, docs,
  modelos, sistemas, patrones, disciplinas, recetas, glosario, radar, blog, boletin, paginas,
  problemas, plantillas, biblioteca, herramientas, comunidad,
};
