---
titulo: Pesos abiertos
descripcion: Modelo cuyos parámetros entrenados se publican para descargarlos y ejecutarlos donde quieras, con una licencia que puede ser permisiva o tener restricciones.
creado: 2026-10-29
categoria: fundamentos
ingles: Open weights
aliases: [open weights, open-weight, modelo de pesos abiertos, modelo abierto, modelos abiertos]
tags: [fundamentos, modelos-abiertos, licencias]
relacionados: ["[[cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias]]", "[[glosario/open-source-ai]]", "[[modelos/11-modelos-abiertos]]", "[[glosario/inferencia-local]]"]
---

Un modelo de pesos abiertos publica sus [[glosario/parametros]] entrenados para que puedas descargarlos y ejecutarlos en tu máquina o en tu nube. Eso no implica que se publiquen los datos ni el código de entrenamiento, ni que la licencia sea open source.

## En la práctica

Lo que decide qué puedes hacer es el archivo `LICENSE` del repositorio del modelo, no la etiqueta de la web del proveedor. En octubre de 2026 conviven licencias permisivas (Gemma 4 o gpt-oss con Apache 2.0, DeepSeek V4 con MIT), licencias «MIT modificadas» con umbrales de ingresos o restricciones para ofrecer el modelo como servicio, y licencias comunitarias como la de Llama 4, que exige pedir permiso por encima de 700 millones de usuarios mensuales. Antes de usarlo en un producto, comprueba en este orden: si es una licencia OSI, si tiene umbrales, si restringe el uso como servicio y si la concesión base es no comercial.

Tener los pesos te da privacidad y control, pero también te toca servirlos: memoria, [[glosario/cuantizacion]], plantilla de chat y *parser* de herramientas.

## No confundir con

- **[[glosario/open-source-ai]]**: según la OSI exige además información de los datos y el código completo.
- **Modelo gratuito por API**: usas el modelo, pero no tienes los pesos.

## Ver también

- [[cursos/agentes-con-modelos-abiertos/06-local-o-api]]
- [[docs/modelos-abiertos/index]]
- [[glosario/mezcla-de-expertos]]
