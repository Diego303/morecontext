---
titulo: Trifecta letal
descripcion: Combinación de acceso a datos privados, exposición a contenido no fiable y capacidad de comunicar al exterior que permite a un atacante robar datos a través del agente.
creado: 2026-10-29
categoria: seguridad
ingles: Lethal trifecta
aliases: [lethal trifecta, la trifecta letal]
tags: [seguridad, prompt-injection, agentes]
relacionados: ["[[glosario/inyeccion-de-prompt]]", "[[glosario/regla-de-dos]]", "[[docs/seguridad/03-patrones-contra-inyeccion]]", "[[cursos/seguridad-y-prompt-injection/01-modelo-de-amenazas]]"]
---

La trifecta letal es el nombre que Simon Willison dio en [junio de 2025](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) a la combinación más peligrosa en un agente: **acceso a datos privados**, **exposición a contenido no fiable** y **capacidad de comunicar al exterior**. Con las tres, una [[glosario/inyeccion-de-prompt]] escondida en un correo o una web puede ordenar al agente que lea tus datos y los envíe a un atacante.

## En la práctica

Úsala como lista de comprobación al diseñar. Dibuja qué datos lee el agente, de dónde le llega texto que no controlas y por dónde puede sacar información: herramientas HTTP, envío de correos, incluso una imagen con una URL. Si están las tres, rompe una pata: quita la salida a red (o déjala solo hacia una lista corta de destinos), separa los datos privados o pide aprobación humana sobre los argumentos reales de la acción de salida. Willison insiste en que la única forma segura es evitar la combinación entera; los detectores de inyección reducen el riesgo pero no lo eliminan.

Ojo con las listas blancas: un dominio permitido también puede servir para exfiltrar.

## No confundir con

- **[[glosario/regla-de-dos]]** de Meta: una regla parecida que habla de cambiar estado, no solo de comunicar.
- **[[glosario/envenenamiento-de-herramientas]]**: una vía de entrada del contenido no fiable.

## Ver también

- [[disciplinas/seguridad]]
- [[cursos/seguridad-y-prompt-injection/03-defensas-en-capas]]
- [[glosario/minimo-privilegio]]
