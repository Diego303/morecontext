---
titulo: La inyección de prompt llega por las herramientas
descripcion: Cuanto más lee un agente de fuentes externas, más instrucciones ajenas se cuelan en su contexto a través de los resultados de herramientas.
creado: 2026-10-20
categoria: seguridad
tags: [seguridad, inyeccion, herramientas]
fuente:
  titulo: "Greshake et al., 2023 · Not what you've signed up for"
  url: https://arxiv.org/abs/2302.12173
relacionados: ["[[glosario/inyeccion-de-prompt]]", "[[docs/seguridad/01-prompt-injection]]", "[[cursos/seguridad-y-prompt-injection/02-inyeccion-directa-e-indirecta]]", "[[disciplinas/seguridad]]"]
---

## Qué es

La [[glosario/inyeccion-de-prompt|inyección de prompt]] ya no llega sobre todo por lo que escribe el usuario. Llega por lo que el agente lee: una página web, un correo, un PDF, un issue o la respuesta de un [[glosario/servidor-mcp|servidor MCP]]. Greshake et al. describieron esta **inyección indirecta** en 2023, y cada herramienta nueva que conectas amplía la superficie. El texto malicioso entra en el contexto como un [[glosario/tool-result|tool_result]] más y el modelo puede tratarlo como una orden.

## Qué cambia en la práctica

- Todo resultado de herramienta es entrada no confiable, venga de donde venga.
- El riesgo real depende de la combinación: datos externos + datos privados + una acción con efecto (enviar, pagar, escribir). Con las tres juntas, una instrucción oculta puede exfiltrar información.
- Los filtros de texto ayudan poco. Lo que limita el daño son los permisos y la arquitectura.

## Qué hacer

1. Haz un inventario de qué herramientas leen contenido externo y cuáles actúan. Sigue el [[cursos/seguridad-y-prompt-injection/01-modelo-de-amenazas|modelo de amenazas]].
2. Aplica [[glosario/minimo-privilegio|mínimo privilegio]]: separa herramientas de lectura y de escritura, y quita las que no hagan falta ([[docs/seguridad/02-permisos-y-minimo-privilegio]]).
3. Pide [[glosario/humano-en-el-bucle|aprobación humana]] antes de acciones irreversibles con la [[recetas/aprobacion-humana-antes-de-actuar|receta de aprobación]].
4. Monta [[cursos/seguridad-y-prompt-injection/03-defensas-en-capas|defensas en capas]] y añade casos de inyección a tu conjunto de evals.
