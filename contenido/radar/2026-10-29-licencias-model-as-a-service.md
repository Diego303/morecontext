---
titulo: "Pesos abiertos con letra pequeña: licencias contra el modelo como servicio"
descripcion: Mistral Large 4, Kimi K3, GLM-5.3 y Qwen3.8-Max publican pesos con licencias MIT modificadas que limitan venderlos como servicio. Qué mirar en el LICENSE.
creado: 2026-10-29
categoria: modelos
tags: [modelos-abiertos, licencias, pesos-abiertos]
fuente:
  titulo: Mistral Ecosystem Open-Weight License · Mistral Large 4 en Hugging Face
  url: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
relacionados: ["[[cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias]]", "[[modelos/11-modelos-abiertos]]", "[[glosario/pesos-abiertos]]", "[[glosario/open-source-ai]]"]
---

## Qué es

El 29 de octubre de 2026 Mistral publicó los pesos de Mistral Large 4 con la *Mistral Ecosystem Open-Weight License*: una MIT modificada que exige una licencia aparte para ofrecer el modelo comercialmente como servicio, deja exento el uso interno y no fija umbrales ([LICENSE](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE)). No es un caso aislado. Según sus ficheros `LICENSE` en Hugging Face:

- **Kimi K3** (jul.): ofrecerlo como servicio con más de 20 M$ en 12 meses exige un acuerdo.
- **Qwen3.8-2.4T-A95B** (ago.): los negocios de «Model as a Service» o «AI Work Assistant» con más de 50 M$ en 12 meses necesitan licencia aparte.
- **GLM-5.3** (oct.): por encima de 10 000 M$ en 12 meses, revisión de seguridad de Z.ai.

En sentido contrario, Gemma 4 pasó a Apache 2.0 y el Qwen3.8 de 27B sigue con Apache-2.0.

## Qué cambia en la práctica

- «De [[glosario/pesos-abiertos|pesos abiertos]]» y «MIT» en la web del proveedor ya no garantizan que puedas revender el modelo. Mistral documenta GLM 5.3 como «MIT», pero su `LICENSE` es una licencia propia.
- Usarlo dentro de tu empresa o integrado en una función de tu producto suele quedar fuera de la restricción; montar una API que venda inferencia de ese modelo, no.
- Ninguno de estos es [[glosario/open-source-ai|open source AI]] según la OSI, que pide también información de datos y código.

## Qué hacer

1. Abre el `LICENSE` del repositorio del modelo, no la ficha comercial, y responde cuatro preguntas: ¿es OSI sin añadidos?, ¿hay umbral de usuarios o ingresos?, ¿restringe el modelo como servicio?, ¿la concesión base es no comercial (como MiniMax M3)?
2. Apunta la licencia junto al modelo en tu registro de dependencias y revísala en cada versión: puede cambiar entre variantes de la misma familia.
3. El método completo, en [[cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias]] y [[modelos/11-modelos-abiertos]].
