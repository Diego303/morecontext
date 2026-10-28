---
titulo: Temperatura
descripcion: Parámetro de muestreo que controla cuánta aleatoriedad hay al elegir cada token de la respuesta.
creado: 2026-07-06
categoria: fundamentos
ingles: temperature
aliases: [temperature]
tags: [fundamentos, parametros]
relacionados: ["[[modelos/06-parametros]]", "[[glosario/top-p]]"]
---

La temperatura ajusta cómo elige el modelo cada [[glosario/token]] entre los candidatos posibles. Con valores bajos, la distribución de probabilidad se concentra en los tokens más probables y las respuestas son más repetibles; con valores altos se aplana y aparecen opciones menos probables, más variadas y también más propensas a errores.

## En la práctica

Usa valores bajos para extracción, clasificación y código, y algo más altos para generar ideas o variantes de texto. Una temperatura de 0 hace la salida casi determinista, pero no garantiza respuestas idénticas entre llamadas: no construyas tests que dependan de ello. Ajusta la temperatura o [[glosario/top-p]], no los dos a la vez. El rango admitido y si puedes cambiarla con el [[glosario/razonamiento-extendido]] activado dependen del proveedor y del modelo: consulta la documentación oficial.

## No confundir con

- **[[glosario/esfuerzo]]**: regula cuánto razona el modelo, no cuánta aleatoriedad hay al muestrear.

## Ver también

- [[modelos/06-parametros]]
- [[glosario/top-p]]
- [[glosario/max-tokens]]
