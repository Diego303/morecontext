---
titulo: "Cambian los motores: TGI se archiva y llama.cpp cambia de puerto"
descripcion: TGI está archivado, llama.cpp estrena versiones semánticas y su servidor escucha en el 9931, y vLLM cierra el CORS. Qué revisar en tus despliegues locales.
creado: 2026-10-29
categoria: herramientas
tags: [inferencia, llama-cpp, vllm, tgi, modelos-abiertos]
fuente:
  titulo: llama.cpp v0.7.0 · Notas de versión en GitHub
  url: https://github.com/ggml-org/llama.cpp/releases/tag/v0.7.0
relacionados: ["[[docs/modelos-abiertos/02-vllm-y-llama-cpp]]", "[[herramientas/llama-cpp]]", "[[herramientas/vllm]]", "[[recetas/servir-un-modelo-con-vllm]]"]
---

## Qué es

Tres motores de inferencia abiertos han cambiado cosas que rompen tutoriales y configuraciones:

- **TGI**, el servidor de Hugging Face, está en modo mantenimiento y su [repositorio](https://github.com/huggingface/text-generation-inference) se archivó el 21 de marzo de 2026. Hugging Face recomienda vLLM, SGLang, llama.cpp o MLX.
- **llama.cpp** publicó el 15 de octubre la v0.7.0, su primera versión estable con versionado semántico. Con ella, `llama-server` escucha por defecto en el puerto **9931** en lugar del 8080; las imágenes Docker mantienen el 8080 ([notas de la v0.7.0](https://github.com/ggml-org/llama.cpp/releases/tag/v0.7.0)).
- **vLLM 0.32.0** (18 oct.) cierra el CORS por defecto, exige Python 3.11 y trata `max_tokens` como tope de salida.

## Qué cambia en la práctica

- Cualquier configuración que apunte a `localhost:8080` deja de encontrar `llama-server` si lo arrancas fuera de Docker tras actualizar. El síntoma es un «connection refused», no un error del modelo.
- Con versiones semánticas, puedes fijar `llama.cpp` en un rango y leer qué rompe cada versión mayor, en lugar de seguir números de *build*.
- Una interfaz web que llamaba a vLLM desde el navegador falla por CORS hasta que declares su origen con `--allowed-origins`.
- Un proyecto nuevo sobre TGI nace sin mantenimiento.

## Qué hacer

1. Fija el puerto siempre de forma explícita: `llama-server -hf <repo>:Q4_K_M --port 8080`. No dependas del valor por defecto.
2. Si sirves con TGI, planifica la migración a vLLM o llama.cpp: [[docs/modelos-abiertos/02-vllm-y-llama-cpp]] compara los dos.
3. Al actualizar vLLM, revisa CORS, clave y memoria con [[recetas/servir-un-modelo-con-vllm]].
