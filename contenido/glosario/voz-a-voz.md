---
titulo: Voz a voz
descripcion: Arquitectura de agente de voz en la que un mismo modelo escucha audio, razona, usa herramientas y responde hablando, sin pasar por texto.
creado: 2026-10-29
categoria: produccion
ingles: Speech-to-speech
aliases: [speech-to-speech, S2S, modelo de voz nativo, realtime]
tags: [voz, produccion, latencia]
relacionados: ["[[sistemas/agente-de-voz]]", "[[glosario/deteccion-de-turno]]", "[[glosario/latencia]]"]
---

En un agente voz a voz, un único modelo recibe el audio del usuario, razona, llama a herramientas y genera la respuesta hablada dentro de la misma sesión. La alternativa es la arquitectura **encadenada**: transcripción (STT), un agente de texto y síntesis de voz (TTS), cada pieza por separado ([OpenAI, guía *Voice agents*](https://developers.openai.com/api/docs/guides/voice-agents)).

## En la práctica

Elige voz a voz cuando mandan la naturalidad y la [[glosario/latencia]]: te ahorras dos conversiones entre audio y texto. Elige la cadena cuando necesitas auditar o filtrar lo que el agente va a decir antes de que lo diga, guardar transcripciones, reutilizar tus [[glosario/evals]] de texto o cambiar una pieza por otra. En ambos casos pide confirmación verbal antes de acciones con efectos, usa respuestas cortas y di algo mientras corre una herramienta lenta. OpenAI describió en agosto de 2026 un sistema dúplex completo (GPT-Live) que escucha y habla a la vez y delega lo difícil en modelos más capaces en segundo plano; su API estaba anunciada como próxima.

## No confundir con

- **Texto a voz (TTS)**: solo convierte texto en audio; es la última pieza de la cadena.

## Ver también

- [[sistemas/agente-de-voz]]
- [[glosario/deteccion-de-turno]]
- [[docs/produccion/03-latencia]]
- [[glosario/streaming]]
