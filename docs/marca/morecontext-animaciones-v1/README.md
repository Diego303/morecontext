# MoreContext · Icono animado v1

Animaciones del icono `[+]` (cara blanca y sombra amarilla) para la web de MoreContext. No tienen dependencias: son un CSS y un JS pequeño. El icono va en línea, como SVG, para que el CSS pueda mover sus piezas.

## Contenido

| Archivo | Qué es |
|---|---|
| `morecontext-icon.css` | Todos los estados animados y el estilo opcional del botón Copiar |
| `morecontext-icon.js` | Disparadores: giro, pulsación, copiar, buscando y sin resultados |
| `mc-icon.svg` | El SVG con las clases `mc-*`. Pégalo en línea donde quieras el icono |
| `demo.html` | Página de prueba con todo funcionando. Ábrela en el navegador |

## Instalación

```html
<link rel="stylesheet" href="/assets/morecontext-icon.css">
<script src="/assets/morecontext-icon.js" defer></script>
```

Para el icono, pega el contenido de `mc-icon.svg` y cambia solo `width` y `height`. Recomendado: 28 en el header, 18 en el buscador y 14 en el botón Copiar.

## Las animaciones

| # | Animación | Dónde | Cómo se activa | Duración |
|---|---|---|---|---|
| 1 | **Elevación** | Logo del header y cualquier icono que sea un enlace | Clase `.mc-lift` en el `<a>` o `<button>` que contiene el icono. Solo CSS | 140 ms |
| 2 | **Giro** | Logo del header | Atributo `data-mc-spin` en el enlace. Si el enlace lleva a la página en la que ya estás, sube al principio en lugar de recargar | 700 ms |
| 3 | **Pulsación** | Clic en cualquier icono que no sea el logo | `data-mc-press` o `MoreContextIcon.press(el)` | 260–420 ms |
| 4 | **Buscando** | Icono del buscador mientras busca | `MoreContextIcon.searching(el, true / false)` | 900 ms, en bucle |
| 5 | **Sin resultados** | Icono del buscador | `MoreContextIcon.noResults(el)` | 420–900 ms |
| 6 | **Copiado `[+] → [✓]`** | Botón Copiar de los bloques de código | `data-mc-copy` en el botón | 1,6 s |

### Header

```html
<a class="brand mc-lift" href="/" data-mc-spin aria-label="MoreContext, inicio">
  <!-- mc-icon.svg con width="28" height="28" -->
  <span>morecontext</span>
</a>
```

### Botón Copiar

```html
<div class="code" data-mc-code>
  <div class="code-bar">
    <span>terminal</span>
    <button class="mc-copy" type="button" data-mc-copy>
      <!-- mc-icon.svg con width="14" height="14" -->
      <span data-mc-label aria-live="polite">Copiar</span>
    </button>
  </div>
  <pre><code>pip install anthropic</code></pre>
</div>
```

El botón copia el `<pre>`/`<code>` de su contenedor `[data-mc-code]`. También puedes indicarle otro bloque con un selector: `data-mc-copy="#mi-bloque"`. Al copiar, el `+` gira y se convierte en `✓`, la sombra pasa a verde, el texto cambia a «Copiado» y todo vuelve a su estado a los 1,6 s.

### Buscador

```js
const icon = document.querySelector("#search .mc-icon");

async function buscar(q) {
  // Activa «buscando» solo si tarda más de 150 ms, para que no parpadee
  const t = setTimeout(() => MoreContextIcon.searching(icon, true), 150);
  const resultados = await tuBusqueda(q);
  clearTimeout(t);
  MoreContextIcon.searching(icon, false);
  if (!resultados.length) MoreContextIcon.noResults(icon);
}
```

### API

```js
MoreContextIcon.play(elemento, "is-spin" | "is-press" | "is-nope" | "is-copied")
MoreContextIcon.spin(el) · press(el) · copied(el) · noResults(el)
MoreContextIcon.searching(el, true | false)
```

`elemento` puede ser el propio `<svg class="mc-icon">`, un contenedor que lo incluya o un selector CSS. Puedes repetir una animación aunque no haya terminado: se reinicia.

## Criterios

- **Movimiento mecánico y breve:** curvas sin rebote y duraciones de 140–700 ms. El estado de copiado dura 1,6 s, igual que el «Copiado» de la web.
- **Los colores mantienen su significado:** la sombra es amarilla en reposo, verde cuando algo sale bien y roja cuando no hay resultados. El estado siempre se acompaña de texto («Copiado», «Nada con…»), así que el color nunca es la única señal.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` se desactivan todas las animaciones. Al copiar se sigue viendo el `[✓]` en verde, sin animar.
- **Accesibilidad:** el SVG lleva `aria-hidden="true"`. El texto accesible va en el enlace (`aria-label`) o en la etiqueta del botón. El texto «Copiado» se anuncia con `aria-live`.

## Navegadores

Funciona en las versiones actuales de Chrome, Edge, Firefox y Safari. Usa `transform-box: fill-box` y animaciones CSS sobre elementos SVG. Copiar usa la API del portapapeles en HTTPS o `localhost`, y si no está disponible recurre a `execCommand`.
