// Nombres visibles de los valores de los campos del esquema (listados, filtros y fichas), en el orden en que se muestran.
export const TEMA: Record<string, string> = {
  prompting: 'Prompting', herramientas: 'Herramientas', rag: 'RAG', agentes: 'Agentes', evals: 'Evals', produccion: 'Producción', seguridad: 'Seguridad',
};
export const CATEGORIA_GLOSARIO: Record<string, string> = {
  fundamentos: 'Fundamentos', prompting: 'Prompting', herramientas: 'Herramientas', contexto: 'Contexto', agentes: 'Agentes',
  evals: 'Evals', produccion: 'Producción', seguridad: 'Seguridad',
};
export const TIPO_PLANTILLA: Record<string, string> = {
  configuracion: 'Configuración', agente: 'Agentes', skill: 'Skills', spec: 'Especificaciones', checklist: 'Checklists', prompt: 'Prompts',
};
export const CATEGORIA_HERRAMIENTA: Record<string, string> = {
  framework: 'Framework', sdk: 'SDK', 'agente-de-codigo': 'Agente de código', inferencia: 'Inferencia', 'base-vectorial': 'Base vectorial',
  ingesta: 'Ingesta', observabilidad: 'Observabilidad', evals: 'Evals', guardrails: 'Guardrails', interfaz: 'Interfaz',
  protocolo: 'Protocolo', pasarela: 'Pasarela',
};
export const TIPO_TEXTO: Record<string, string> = { paper: 'paper', ensayo: 'ensayo', especificacion: 'especificación', libro: 'libro' };
/** Ruta en vídeo: cuánto merece cada lección (insignia: imprescindible = amarillo, por encima = neutro, extra = cian). */
export const PROFUNDIDAD: Record<string, { texto: string; clase: string }> = {
  imprescindible: { texto: 'imprescindible', clase: 'y' }, 'por-encima': { texto: 'por encima', clase: '' }, extra: { texto: 'extra', clase: 'c' },
};
