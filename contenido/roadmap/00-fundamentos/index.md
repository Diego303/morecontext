---
titulo: "Nivel 00 · Fundamentos"
descripcion: "Qué es un LLM, cómo se mide en tokens, qué cabe en su contexto y cómo hacer tu primera llamada a la API midiendo coste y latencia."
creado: 2026-09-01
nivel: 0
horas: 3
objetivo: "Entender qué hace un modelo de lenguaje y llamarlo desde código sabiendo cuánto cuesta y cuánto tarda cada petición."
prerrequisitos: []
proyecto:
  titulo: "Script de consulta medido"
  descripcion: "Un programa de línea de comandos que recibe una pregunta, llama a la API y muestra la respuesta junto con los tokens de entrada y salida, la latencia y el coste estimado de la llamada."
  entregable: "Un archivo preguntar.py (o preguntar.ts) que se ejecuta con una pregunta como argumento, avisa si la respuesta se corta por max_tokens y añade una fila por llamada a un CSV con tokens, latencia y coste; más ese CSV con al menos 5 llamadas reales."
tags: [fundamentos, api, tokens]
relacionados: ["[[roadmap/index]]", "[[docs/fundamentos/index]]", "[[glosario/llm]]", "[[roadmap/10-prompting/index]]"]
---

Este nivel es el suelo sobre el que se apoya todo lo demás. Si nunca has llamado a la API de un modelo de lenguaje, empieza aquí. Si ya lo has hecho, repasa las lecciones de tokens y de coste: casi todos los problemas que verás más adelante (agentes caros, respuestas cortadas, contextos que no caben) se explican con lo que aprendes en este nivel.

## Para quién es

- Desarrolladores que saben programar en Python o TypeScript pero no han trabajado con un [[glosario/llm|LLM]] desde código.
- Gente que usa chats como Claude o similares y quiere entender qué pasa por debajo.
- Perfiles técnicos de producto que necesitan razonar sobre coste y [[glosario/latencia|latencia]] con datos.

Necesitas saber instalar paquetes, usar la terminal y leer código sencillo. No necesitas saber nada de aprendizaje automático.

## Qué vas a saber hacer

Al terminar podrás explicar qué hace un modelo y en qué falla, contar [[glosario/token|tokens]] antes de enviar una petición, razonar sobre la [[glosario/ventana-de-contexto|ventana de contexto]] y escribir un script que llama a la API, interpreta la respuesta y registra lo que ha costado.

## Lecciones

1. [[roadmap/00-fundamentos/01-que-es-un-llm]]. Qué hace un modelo de lenguaje por dentro, a grandes rasgos, y por qué eso explica sus aciertos y sus fallos. Sin matemáticas.
2. [[roadmap/00-fundamentos/02-tokens]]. La unidad con la que se cobra, se limita y se mide todo. Aprenderás a contarlos con la API antes de gastar.
3. [[roadmap/00-fundamentos/03-ventana-de-contexto]]. Qué entra en cada petición, por qué la API no recuerda nada entre llamadas y qué hacer cuando la conversación crece.
4. [[roadmap/00-fundamentos/04-primera-llamada-api]]. Instalar el SDK, configurar la clave y hacer tu primera petición leyendo bien la respuesta.
5. [[roadmap/00-fundamentos/05-coste-y-latencia]]. Medir tokens, tiempo total y tiempo hasta el primer token, y convertirlo en coste por llamada.

## El proyecto del nivel

Construirás el **script de consulta medido**: una herramienta pequeña que usarás durante el resto del roadmap para probar cosas. Recibe una pregunta, llama a la API y registra cada llamada en un CSV.

Está terminado si cumple todo esto:

- Se ejecuta con `python preguntar.py "tu pregunta"` y muestra la respuesta.
- Lee la clave de la variable de entorno `ANTHROPIC_API_KEY`; la clave no aparece en el código.
- Muestra `stop_reason`, tokens de entrada, tokens de salida y latencia en milisegundos.
- Si `stop_reason` es `max_tokens`, avisa de que la respuesta está incompleta.
- Calcula el coste con precios que lees de una configuración, no escritos en mitad del código.
- Añade una fila por llamada a `llamadas.csv`, y entregas ese CSV con al menos cinco llamadas reales.

> [!consejo] Guarda el script
> Lo reutilizarás en el [[roadmap/10-prompting/index|nivel 10]] para comparar versiones de un prompt y en el [[roadmap/20-herramientas/index|nivel 20]] como base del primer bucle con herramientas.

## Después de este nivel

Sigue con [[roadmap/10-prompting/index]], donde aprenderás a escribir instrucciones que dan resultados repetibles. Si buscas una referencia rápida en vez de un recorrido, consulta [[docs/fundamentos/index]].
