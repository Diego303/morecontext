#!/usr/bin/env node
// Prueba de humo del sitio construido (fase 12): con la preview levantada, abre las páginas clave
// a varios anchos y comprueba scroll horizontal, errores de consola, Mermaid dibujado,
// paleta Ctrl+K, pestañas sincronizadas y botón Copiar.
// Uso:  pnpm build && pnpm preview   (en otra terminal)  →  pnpm smoke [--base http://localhost:4321]
// La primera vez: pnpm exec playwright install chromium
import { chromium } from 'playwright';

const i = process.argv.indexOf('--base');
const BASE = (i > 0 ? process.argv[i + 1] : 'http://localhost:4321').replace(/\/$/, '');
const ANCHOS = [360, 400, 768, 1024, 1280, 1440];
const PAGINAS = [
  '/', '/roadmap/', '/roadmap/40-primer-agente/el-bucle-agentico/', '/docs/', '/docs/herramientas/uso-de-herramientas/',
  '/glosario/', '/glosario/rag/', '/recetas/', '/recetas/aprobacion-humana-antes-de-actuar/', '/patrones/',
  '/sistemas/agente-de-codigo/', '/radar/', '/blog/',
  // Contenido v2: secciones nuevas y una página de cada tipo nuevo
  '/plantillas/', '/plantillas/agents-md/', '/herramientas/', '/herramientas/langgraph/', '/biblioteca/', '/biblioteca/react/',
  '/problemas/', '/problemas/tool-result-sin-tool-use/', '/cursos/ruta-en-video/fase-0-que-es-la-ia/',
  '/cursos/harness-engineering/el-flujo-como-maquina-de-estados/', '/cursos/langchain-y-langgraph/langgraph-estado-nodos-y-aristas/',
  '/sistemas/harness-sdd-claude-code/', '/patrones/inicializador-y-agente-de-trabajo/', '/docs/claude-code/hooks/', '/mapa/',
];
const CON_MERMAID = ['/roadmap/40-primer-agente/el-bucle-agentico/', '/sistemas/agente-de-codigo/', '/patrones/enrutado/',
  '/cursos/harness-engineering/el-flujo-como-maquina-de-estados/', '/sistemas/harness-sdd-claude-code/', '/cursos/langchain-y-langgraph/langgraph-estado-nodos-y-aristas/'];

const fallos = [];
let comprobaciones = 0;
const comprobar = (ok, msg) => { comprobaciones++; if (!ok) fallos.push(msg); };

try { const r = await fetch(BASE + '/'); if (!r.ok) throw new Error(String(r.status)); }
catch { console.error(`✗ No responde ${BASE}. Levanta antes la preview: pnpm build && pnpm preview`); process.exit(1); }

const navegador = await chromium.launch();

async function abrir(ruta, ancho) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: 900 } });
  const errores = [];
  pagina.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  pagina.on('pageerror', (e) => errores.push(e.message));
  const r = await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' });
  comprobar(r?.status() === 200, `${ruta} @${ancho}: HTTP ${r?.status()}`);
  return { pagina, errores };
}

// 1) Sin scroll horizontal ni errores de consola, a todos los anchos
for (const ruta of PAGINAS) for (const ancho of ANCHOS) {
  const { pagina, errores } = await abrir(ruta, ancho);
  const { sw, cw } = await pagina.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  comprobar(sw <= cw, `${ruta} @${ancho}: scroll horizontal (${sw} > ${cw})`);
  comprobar(errores.length === 0, `${ruta} @${ancho}: consola: ${errores.join(' | ')}`);
  await pagina.close();
}

// 2) Mermaid se dibuja (se carga al acercarse a la pantalla)
for (const ruta of CON_MERMAID) {
  const { pagina } = await abrir(ruta, 1280);
  const n = await pagina.locator('pre.mermaid').count();
  for (let k = 0; k < n; k++) { await pagina.locator('pre.mermaid').nth(k).scrollIntoViewIfNeeded(); await pagina.waitForTimeout(200); }
  const ok = await pagina.waitForFunction(() => [...document.querySelectorAll('pre.mermaid')].every((p) => p.querySelector('svg')), null, { timeout: 20000 }).then(() => true, () => false);
  comprobar(n > 0 && ok, `${ruta}: Mermaid sin dibujar (${n} diagramas)`);
  await pagina.close();
}

// 3) Paleta: Ctrl+K abre el diálogo y Escape lo cierra
{
  const { pagina } = await abrir('/', 1280);
  await pagina.keyboard.press('Control+k');
  comprobar(await pagina.evaluate(() => document.querySelector('dialog#buscador')?.open === true), 'Ctrl+K no abre la paleta');
  await pagina.keyboard.press('Escape');
  comprobar(await pagina.evaluate(() => document.querySelector('dialog#buscador')?.open === false), 'Escape no cierra la paleta');
  await pagina.close();
}

// 4) Pestañas sincronizadas entre páginas y botón Copiar
{
  const contexto = await navegador.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE + '/roadmap/40-primer-agente/el-bucle-agentico/', { waitUntil: 'networkidle' });
  await pagina.locator('.code__tab', { hasText: 'TypeScript' }).first().click();
  await pagina.goto(BASE + '/docs/herramientas/uso-de-herramientas/', { waitUntil: 'networkidle' });
  const sincronizada = await pagina.evaluate(() => [...document.querySelectorAll('.code--tabs')].every((b) =>
    !b.querySelector('.code__tab[data-tab="TypeScript"]') || b.querySelector('.code__tab[aria-selected="true"]')?.textContent === 'TypeScript'));
  comprobar(sincronizada, 'Las pestañas no se recuerdan entre páginas');
  const copiar = pagina.locator('.code__copy').first();
  await copiar.click();
  comprobar((await copiar.textContent())?.trim() === 'Copiado', 'Copiar no muestra «Copiado»');
  await contexto.close();
}

await navegador.close();
fallos.forEach((f) => console.log('✗', f));
console.log(`\n${comprobaciones} comprobaciones · ${fallos.length} fallos`);
process.exit(fallos.length ? 1 : 0);
