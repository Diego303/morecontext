---
titulo: Detección de fin de turno
descripcion: Decidir cuándo el usuario ha terminado de hablar para que un agente de voz responda sin cortarle ni hacerle esperar.
creado: 2026-10-29
categoria: produccion
ingles: Turn detection
aliases: [turn detection, end-of-turn detection, detección de turno, endpointing]
tags: [voz, latencia, produccion]
relacionados: ["[[sistemas/agente-de-voz]]", "[[glosario/voz-a-voz]]", "[[glosario/latencia]]"]
---

La detección de fin de turno es la pieza de un agente de voz que decide cuándo el usuario ha terminado de hablar y le toca responder. Si se adelanta, el agente interrumpe a alguien que solo estaba pensando; si se retrasa, la conversación se hace lenta. La forma más simple espera un silencio de cierta duración; las más finas usan un modelo que mira **qué** se ha dicho, porque «quiero cambiar la dirección de…» no es un final aunque haya una pausa.

## En la práctica

Cuenta en tu presupuesto de [[glosario/latencia]]: Kwindla Kramer reparte unos 400 ms entre detección de turno y transcripción dentro de un objetivo de unos 800 ms de mediana voz a voz ([jun. 2025](https://gist.github.com/kwindla/f755284ef2b14730e1075c2ac803edcf)). LiveKit publicó un modelo de fin de turno basado en texto, con 14 idiomas incluido el español, que redujo un 39 % las interrupciones falsas frente a su versión anterior ([dic. 2025](https://livekit.com/blog/improved-end-of-turn-model-cuts-voice-ai-interruptions-39)). Mide P50 y P95 de latencia y la tasa de interrupciones falsas, y deja el ajuste fino para el final.

## No confundir con

- **VAD** (detección de actividad de voz): dice si hay voz o silencio en el audio, no si la frase ha terminado. Suele ser la primera capa.
- **Dúplex completo**: modelos [[glosario/voz-a-voz]] que escuchan y hablan a la vez y prescinden de un detector separado.

## Ver también

- [[sistemas/agente-de-voz]]
- [[docs/produccion/03-latencia]]
- [[disciplinas/ux-de-agentes]]
