// Fase I5: búsqueda real (paleta Ctrl+K sobre Pagefind), memoria de pestañas y Mermaid, con Playwright sobre dist/.
// Uso, tras pnpm build: pnpm exec node docs/integracion/probar-busqueda.mjs . docs/integracion/busqueda.md
// (necesita Chromium de Playwright: pnpm exec playwright install chromium)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [proyecto, salida] = process.argv.slice(2);
const { chromium } = createRequire(path.join(proyecto, 'package.json'))('playwright');
const dist = path.join(proyecto, 'dist');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };
const srv = http.createServer((q, s) => {
  let f = path.join(dist, decodeURIComponent(new URL(q.url, 'http://x').pathname));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'content-type': TIPOS[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(s);
});
await new Promise((r) => srv.listen(0, r));
const BASE = `http://localhost:${srv.address().port}`;
const nav = await chromium.launch();
let fallos = 0;
const md = ['# Integración v2 · Búsqueda (fase I5)', '', `Generado con Playwright sobre \`dist/\` (paleta Ctrl+K, índice de Pagefind), ${new Date().toISOString().slice(0, 10)}.`, ''];

// ---------- 1) Búsqueda ----------
const CONSULTAS = [
  { q: 'tool_result sin tool_use', esperadas: ['/problemas/tool-result-sin-tool-use/'] },
  { q: 'LangGraph interrupt', esperadas: ['/problemas/langgraph-no-reanuda-tras-interrupt/', '/cursos/langchain-y-langgraph/humano-en-el-bucle-con-interrupt/'] },
  { q: 'worktree', esperadas: ['/glosario/worktree/', '/recetas/features-en-paralelo-con-worktrees/', '/blog/2026-10-25-tres-cosas-que-se-rompen-sin-worktrees/'] },
  { q: 'HNSW', esperadas: ['/glosario/hnsw/', '/cursos/rag-a-fondo/bases-vectoriales-por-dentro/'] },
  { q: 'Ollama', esperadas: ['/herramientas/ollama/', '/docs/modelos-abiertos/ollama/', '/recetas/agente-local-con-ollama/'] },
  // pegando el mensaje de error literal (sin ids), como dice la portadilla de problemas
  { q: 'unexpected tool_use_id found in tool_result blocks', esperadas: ['/problemas/tool-result-sin-tool-use/'] },
];
md.push('## Búsquedas de aceptación', '', '| Consulta | 1.º | 2.º | 3.º | ¿Esperada entre las 3 primeras? |', '|---|---|---|---|---|');
const pg = await nav.newPage({ viewport: { width: 1280, height: 900 } });
await pg.goto(BASE + '/', { waitUntil: 'networkidle' });
for (const { q, esperadas } of CONSULTAS) {
  await pg.keyboard.press('Control+K');
  const input = pg.locator('#buscador input[type=search]');
  await input.fill('');
  await input.fill(q);
  await pg.waitForFunction((qq) => {
    const l = document.querySelector('[data-resultados]');
    return l && l.querySelector('a') && document.querySelector('#buscador input').value === qq;
  }, q, { timeout: 15000 });
  await pg.waitForTimeout(600); // debounce de 150 ms + carga de fragmentos
  const top = await pg.$$eval('[data-resultados] a', (as) => as.slice(0, 3).map((a) => new URL(a.href).pathname));
  const ok = top.some((u) => esperadas.includes(u));
  if (!ok) fallos++;
  md.push(`| «${q}» | ${top.map((u) => `\`${u}\``).join(' | ')}${' | —'.repeat(3 - top.length)} | ${ok ? 'sí' : '**no**'} (${esperadas.map((u) => `\`${u}\``).join(' o ')}) |`);
  await pg.keyboard.press('Escape');
}
await pg.close();

// ---------- 2) Pestañas: memoria por orden de uso ----------
const A = '/roadmap/10-prompting/instrucciones-claras/';
const B = '/problemas/el-agente-no-para/';
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const activa = async () => p.$$eval('.code--tabs', (gs) => gs.map((g) => g.querySelector('.code__tab[aria-selected="true"]')?.textContent?.trim()));
await p.goto(BASE + A, { waitUntil: 'networkidle' });
const inicial = await activa();
await p.locator('.code--tabs .code__tab', { hasText: /^TypeScript$/ }).first().click();
const trasTs = await activa();
await p.goto(BASE + B, { waitUntil: 'networkidle' });
const antesB = await activa();
const etiquetasB = await p.$$eval('.code--tabs .code__tab', (ts) => [...new Set(ts.map((t) => t.textContent.trim()))]);
await p.locator('.code--tabs .code__tab', { hasText: /^LangGraph$/ }).first().click();
const enB = await activa();
await p.goto(BASE + A, { waitUntil: 'networkidle' });
const vuelta = await activa();
const guardado = await p.evaluate(() => localStorage.getItem('mc.pestanas'));
const okTabs = inicial.every((t) => t === inicial[0]) && trasTs.every((t) => t === 'TypeScript') && antesB.every((t) => t === 'LangChain') && enB.includes('LangGraph') && vuelta.every((t) => t === 'TypeScript');
if (!okTabs) fallos++;
md.push('', '## Pestañas (memoria por orden de uso)', '',
  `1. Sin nada guardado, \`${A}\`: ${inicial.length} grupos, activas: ${[...new Set(inicial)].join(', ')} (la primera de cada grupo).`,
  '2. Se pulsa «TypeScript»: todos los grupos de la página pasan a TypeScript.',
  `3. \`${B}\` (etiquetas: ${etiquetasB.join(', ')}): ninguna está guardada, así que al entrar se ve la primera (${[...new Set(antesB)].join(', ')}); se pulsa «LangGraph»; activas: ${[...new Set(enB)].join(', ')}.`,
  `4. Vuelta a \`${A}\`: activas: ${[...new Set(vuelta)].join(', ')}. ${vuelta.every((t) => t === 'TypeScript') ? '**Sigue en TypeScript.**' : '**No sigue en TypeScript.**'}`,
  `5. \`localStorage["mc.pestanas"]\` = \`${guardado}\`.`,
  '', `Resultado: ${okTabs ? 'correcto' : '**fallo**'}.`);
await ctx.close();

// ---------- 3) Mermaid ----------
const MERMAID = ['/cursos/harness-engineering/el-flujo-como-maquina-de-estados/', '/sistemas/harness-sdd-claude-code/', '/cursos/langchain-y-langgraph/langgraph-estado-nodos-y-aristas/'];
md.push('', '## Mermaid', '', '| Página | Diagramas | Dibujados (SVG) | Errores de consola |', '|---|---:|---:|---|');
for (const ruta of MERMAID) {
  const m = await nav.newPage({ viewport: { width: 1280, height: 900 } });
  const errores = [];
  m.on('console', (x) => { if (x.type() === 'error') errores.push(x.text()); });
  m.on('pageerror', (e) => errores.push(e.message));
  const r = await m.goto(BASE + ruta, { waitUntil: 'networkidle' });
  const n = await m.locator('pre.mermaid').count();
  for (let i = 0; i < n; i++) { await m.locator('pre.mermaid').nth(i).scrollIntoViewIfNeeded(); await m.waitForTimeout(400); }
  await m.waitForFunction((total) => document.querySelectorAll('pre.mermaid svg').length >= total, n, { timeout: 15000 }).catch(() => {});
  const svg = await m.locator('pre.mermaid svg').count();
  const ok = r?.status() === 200 && n > 0 && svg === n && errores.length === 0;
  if (!ok) fallos++;
  md.push(`| \`${ruta}\` | ${n} | ${svg} | ${errores.length ? errores.join(' / ') : 'ninguno'} |`);
  await m.close();
}

await nav.close(); srv.close();
fs.writeFileSync(salida, md.join('\n') + '\n');
console.log(md.join('\n'));
console.log(fallos ? `\n✗ ${fallos} fallo(s)` : '\n✓ todo correcto');
process.exit(fallos ? 1 : 0);
