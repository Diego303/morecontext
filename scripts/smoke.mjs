#!/usr/bin/env node
// Prueba de humo del sitio construido (fase 12): con la preview levantada, abre las páginas clave
// a varios anchos y comprueba scroll horizontal, errores de consola, Mermaid dibujado,
// paleta Ctrl+K, pestañas sincronizadas y botón Copiar, y el icono [+] animado (hero, «buscando» en la paleta,
// [+] → [✓] al copiar, movimiento reducido) con los archivos de marca.
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

// 5) Icono [+] del hero: se eleva al pasar el ratón, baja sobre su sombra al pulsar y vuelve al soltar.
//    Es decorativo: ni foco ni aria (el nombre lo da el h1).
const desplazamiento = (m) => (m.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number) ?? [1, 0, 0, 1, 0, 0]).slice(4);
for (const ancho of [400, 1440]) {
  const { pagina } = await abrir('/', ancho);
  const transform = () => pagina.locator('.wm-mark .mc-front').evaluate((el) => getComputedStyle(el).transform);
  const caja = await pagina.locator('.wm-mark').boundingBox();
  const reposo = await transform();
  await pagina.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await pagina.waitForTimeout(250);
  const encima = await transform();
  await pagina.mouse.down();
  await pagina.waitForTimeout(50);
  const pulsado = await transform();
  await pagina.mouse.up();
  await pagina.waitForTimeout(250);
  const soltado = await transform();
  comprobar(reposo === 'none' && encima !== 'none', `/ @${ancho}: el [+] del hero no se eleva al pasar el ratón (${reposo} → ${encima})`);
  comprobar(desplazamiento(pulsado).every((v) => v > 0), `/ @${ancho}: el [+] del hero no baja al pulsar (${pulsado})`);
  comprobar(soltado === encima, `/ @${ancho}: el [+] del hero no vuelve al soltar (${soltado})`);
  comprobar(await pagina.locator('.wm-mark').evaluate((s) => !s.hasAttribute('tabindex') && s.getAttribute('aria-hidden') === 'true'),
    `/ @${ancho}: el [+] del hero no es decorativo`);
  await pagina.close();
}

// 6) Paleta: el [+] anima «buscando» (con aria-busy) mientras la búsqueda tarda, y se apaga al terminar o al cerrar.
//    Las peticiones a /pagefind/ se retrasan 600 ms para que la búsqueda tarde.
{
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
  await pagina.route('**/pagefind/**', async (r) => { await new Promise((x) => setTimeout(x, 600)); await r.continue(); });
  await pagina.goto(BASE + '/', { waitUntil: 'networkidle' });
  const estado = () => pagina.evaluate(() => ({
    buscando: document.querySelector('#buscador .bus-icono .mc-icon')?.classList.contains('is-searching'),
    ocupado: document.querySelector('#buscador [data-resultados]')?.getAttribute('aria-busy'),
  }));
  const encendido = () => pagina.waitForFunction(() => document.querySelector('#buscador .bus-icono .mc-icon')?.classList.contains('is-searching')
    && document.querySelector('#buscador [data-resultados]')?.getAttribute('aria-busy') === 'true', null, { timeout: 5000 }).then(() => true, () => false);
  const campo = pagina.locator('#buscador input[type=search]');
  await pagina.keyboard.press('Control+k');
  await campo.pressSequentially('tool use', { delay: 30 });
  comprobar(await encendido(), 'Paleta: no aparecen .is-searching y aria-busy="true" mientras se busca');
  await pagina.waitForFunction(() => document.querySelectorAll('#buscador [data-resultados] a').length > 0, null, { timeout: 15000 });
  const fin = await estado();
  comprobar(fin.buscando === false && fin.ocupado === null, `Paleta: «buscando» no se apaga al llegar los resultados (${JSON.stringify(fin)})`);
  await campo.fill('');
  await campo.pressSequentially('ventana de contexto', { delay: 20 });
  await encendido();
  await pagina.keyboard.press('Escape');
  await pagina.waitForTimeout(1500);   // la búsqueda interrumpida termina sin volver a encenderlo
  const cerrado = await estado();
  comprobar(cerrado.buscando === false && cerrado.ocupado === null, `Paleta: «buscando» queda encendido tras cerrarla (${JSON.stringify(cerrado)})`);
  await pagina.close();
}

// 7) Copiar en un bloque con pestañas (la segunda): «Copiado», [+] → [✓] y el código de la pestaña visible; a los 1,6 s, vuelta
{
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
  await contexto.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE + '/roadmap/40-primer-agente/el-bucle-agentico/', { waitUntil: 'networkidle' });
  const bloque = pagina.locator('.code--tabs').first();
  await bloque.locator('.code__tab').nth(1).click();
  const esperado = await bloque.locator('.code__panel:not([hidden]) pre').evaluate((pre) => pre.innerText);
  const boton = bloque.locator('.code__copy');
  const leer = () => boton.evaluate((b) => ({ texto: b.querySelector('.code__copy-t')?.textContent, copiado: b.querySelector('.mc-icon')?.classList.contains('is-copied') }));
  await boton.click();
  await pagina.waitForTimeout(100);
  const justo = await leer();
  const copiado = await pagina.evaluate(() => navigator.clipboard.readText());
  comprobar(justo.texto === 'Copiado' && justo.copiado === true, `Copiar: justo después no hay «Copiado» con .is-copied (${JSON.stringify(justo)})`);
  comprobar(copiado === esperado, 'Copiar: el portapapeles no tiene el código de la pestaña visible');
  await pagina.waitForTimeout(1700);
  const luego = await leer();
  comprobar(luego.texto === 'Copiar' && luego.copiado === false, `Copiar: a los 1,8 s no vuelve a «Copiar» sin .is-copied (${JSON.stringify(luego)})`);
  await contexto.close();
}

// 8) Movimiento reducido: al copiar se ve el [✓] (scale(1)) sin animación
{
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await contexto.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const pagina = await contexto.newPage();
  await pagina.emulateMedia({ reducedMotion: 'reduce' });
  await pagina.goto(BASE + '/roadmap/40-primer-agente/el-bucle-agentico/', { waitUntil: 'networkidle' });
  const boton = pagina.locator('.code__copy').first();
  await boton.click();
  await pagina.waitForTimeout(100);
  const check = await boton.locator('.mc-check').evaluate((c) => ({ transform: getComputedStyle(c).transform, animacion: getComputedStyle(c).animationName }));
  comprobar(check.transform === 'matrix(1, 0, 0, 1, 0, 0)' && check.animacion === 'none', `Movimiento reducido: el [✓] no está en scale(1) sin animar (${JSON.stringify(check)})`);
  await contexto.close();
}

// 9) Marca: favicon, iconos y manifiesto del kit; ninguna página con el icono antiguo
for (const ruta of ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/site.webmanifest', '/icon-maskable-512.png']) {
  const r = await fetch(BASE + ruta);
  comprobar(r.status === 200, `${ruta}: HTTP ${r.status}`);
}
for (const ruta of PAGINAS) {
  const html = await (await fetch(BASE + ruta)).text();
  comprobar(!/#i-mark|fill: var\(--accent-yellow\)|M8 5H5v14h3/.test(html), `${ruta}: todavía tiene el icono [+] antiguo`);
}

await navegador.close();
fallos.forEach((f) => console.log('✗', f));
console.log(`\n${comprobaciones} comprobaciones · ${fallos.length} fallos`);
process.exit(fallos.length ? 1 : 0);
