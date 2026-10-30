---
titulo: Temperatura
descripcion: Parámetro de muestreo que controla cuánta aleatoriedad hay al elegir cada token; la API de Claude ya no lo admite, pero sigue en modelos abiertos y otros proveedores.
creado: 2026-07-06
actualizado: 2026-10-29
categoria: fundamentos
ingles: temperature
aliases: [temperature]
tags: [fundamentos, parametros]
relacionados: ["[[modelos/06-parametros]]", "[[glosario/top-p]]"]
---

La temperatura ajusta cómo elige el modelo cada [[glosario/token]] entre los candidatos posibles. Con valores bajos, la distribución de probabilidad se concentra en los tokens más probables y las respuestas son más repetibles; con valores altos se aplana y aparecen opciones menos probables, más variadas y también más propensas a errores.

## En la práctica

> [!aviso] En la API de Claude ya no existe
> Desde la versión `2026-10-21`, `temperature`, `top_p` y `top_k` no se aceptan: la API devuelve 400 en cualquier modelo y el SDK `anthropic` 2.x lanza `TypeError`. Desde Claude 4.7 ya no admitían valores distintos del de por defecto. `ChatAnthropic` de LangChain también los rechaza con `claude-sonnet-5-5`.

Con Claude, la consistencia se busca de otra forma: [[glosario/salida-estructurada]], rúbricas cerradas, varias muestras y [[glosario/evals]].

La temperatura sigue existiendo en modelos abiertos y en otros proveedores. Ollama usa 0.8 por defecto y se cambia en `options` o con `ChatOllama(temperature=…)`. Valores bajos para extracción, clasificación y código; algo más altos para ideas o variantes. Empieza por lo que recomiende la *model card*: algunos modelos de razonamiento piden 1.0, y bajarla a 0 por costumbre les sienta mal. Ni siquiera 0 garantiza respuestas idénticas entre llamadas: no construyas tests que dependan de ello. Ajusta la temperatura o [[glosario/top-p]], no los dos a la vez.

## No confundir con

- **[[glosario/esfuerzo]]**: regula cuánto razona el modelo, no cuánta aleatoriedad hay al muestrear.

## Ver también

- [[modelos/06-parametros]]
- [[glosario/top-p]]
- [[glosario/max-tokens]]
- [[radar/2026-10-23-api-2026-10-21-sin-temperatura]]
- [[modelos/11-modelos-abiertos]]
