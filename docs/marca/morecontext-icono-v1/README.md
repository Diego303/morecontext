# MoreContext · Icono v1

Kit del icono y del logotipo de MoreContext. La versión 1 parte del concepto `[+]`: los corchetes son la ventana de contexto y el `+` significa «más». El icono imita el botón principal de la web: cara blanca con borde negro y una sombra dura amarilla desplazada abajo a la derecha. La sombra forma parte del icono, no se añade con CSS.

## Contenido

```
svg/
  morecontext-icon.svg              Icono principal (usar desde 32 px)
  morecontext-icon-small.svg        Icono para 16–24 px (trazos más gruesos)
  morecontext-icon-mono-black.svg   Una tinta, negro (impresión)
  morecontext-icon-mono-white.svg   Una tinta, blanco (fondos oscuros o fotográficos)
  morecontext-logo-dark.svg         Logotipo [+] morecontext para fondo oscuro
  morecontext-logo-light.svg        Logotipo para fondo claro
  morecontext-logo-mono-black.svg   Logotipo a una tinta, negro
  morecontext-logo-mono-white.svg   Logotipo a una tinta, blanco
  morecontext-wordmark-dark.svg     Solo el nombre, fondo oscuro
  morecontext-wordmark-light.svg    Solo el nombre, fondo claro
png/
  morecontext-icon-{16,24,32,48,64,128,256,512,1024}.png   Fondo transparente
  morecontext-logo-dark@2x.png, morecontext-logo-light@2x.png
web/                                Copiar tal cual a la raíz pública de la web
  favicon.ico (16, 32, 48), favicon.svg
  apple-touch-icon.png (180), icon-192.png, icon-512.png, icon-maskable-512.png
  site.webmanifest
```

En todos los SVG del logotipo, el nombre `morecontext` está convertido en trazos (JetBrains Mono Bold). Se ven igual en cualquier sitio sin tener la fuente instalada.

## Instalación en la web

```html
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0f0f11">
```

Para el icono animado del header, el buscador y el botón de copiar, usa el kit `morecontext-animaciones-v1`.

## Construcción

Retícula de 26 × 26 unidades:

| Elemento | Medida |
|---|---|
| Cara blanca `#fafafa` | 23,6 × 23,6, desde (0, 0) |
| Borde negro `#000` | 1,2 (1,6 en la versión pequeña) |
| Sombra amarilla `#fde047` | desplazada 3 unidades a la derecha y 3 hacia abajo |
| Corchetes | 3 de ancho × 14 de alto, trazo 2,2, terminaciones rectas |
| `+` | brazos de 6, trazo 2,2, bajado unas 0,25 unidades para compensar los corchetes |

## Colores

| Uso | Hex |
|---|---|
| Amarillo de marca (sombra) | `#fde047` |
| Cara | `#fafafa` |
| Tinta | `#000000` |
| Fondo de la web | `#0f0f11` |
| Texto del logotipo sobre oscuro | `#f4f4f5` |

## Reglas de uso

- **Área de respeto:** deja libre al menos el 25 % del lado del icono alrededor de él.
- **Tamaño mínimo:** 16 px con `morecontext-icon-small.svg` y 32 px con el icono principal. El logotipo completo, a no menos de 20 px de alto.
- **La sombra va siempre abajo a la derecha.** No la cambies de lado, no la desenfoques y no le cambies el color. Las únicas excepciones son los estados animados de la web (verde al copiar, roja sin resultados).
- No redondees el cuadrado ni lo conviertas en círculo.
- No escribas `[+]` con una fuente: usa siempre los archivos SVG.
- No rotes ni deformes el icono ni el logotipo.
- Sobre fondo blanco, usa el logotipo claro: el borde negro mantiene la cara separada del fondo.

## Registro

Si se registra como marca, conviene registrar el logotipo completo, `[+] morecontext` (`morecontext-logo-light.svg` o la versión mono), no el icono suelto. Esto es una recomendación de diseño, no asesoramiento legal.

## Licencia

Los archivos de la marca no se rigen por la licencia CC BY-SA del contenido de la web. Úsalos para referirte a MoreContext, sin modificarlos.

JetBrains Mono, la fuente con la que se ha trazado el wordmark, tiene licencia SIL Open Font License 1.1.
