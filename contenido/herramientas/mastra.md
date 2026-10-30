---
titulo: Mastra
descripcion: Framework de agentes en TypeScript con herramientas tipadas con zod y modelos como «proveedor/modelo»; Apache-2.0 salvo las carpetas ee/ de licencia empresarial.
creado: 2026-10-29
tags: [frameworks, agentes, typescript, open-source]
relacionados: ["[[docs/frameworks/11-agentes-en-typescript]]", "[[herramientas/vercel-ai-sdk]]", "[[herramientas/langchain]]", "[[docs/frameworks/01-elegir-framework]]"]
categoria: framework
licencia: Apache-2.0
open_source: true
lenguajes: [TypeScript]
url: https://www.npmjs.com/package/@mastra/core
repositorio: https://github.com/mastra-ai/mastra
version: "1.80.0"
revisado: 2026-10-29
---

Mastra es un framework de agentes para TypeScript. Un `Agent` reúne instrucciones, modelo y herramientas creadas con `createTool` (esquemas de entrada y salida con zod), y `agente.generate(…, { maxSteps })` ejecuta el [[glosario/bucle-agentico|bucle]] hasta la respuesta.

**Licencia**: Apache-2.0, open source, **salvo el código bajo carpetas `ee/`**, que lleva una licencia empresarial (por ejemplo `@mastra/core/auth/ee` y `agent-builder/ee`). Si importas algo de una ruta con `ee/`, ya no estás en la parte abierta: revisa el `LICENSE.md` del paquete.

## Para qué sirve

- Agentes con herramientas tipadas en un proyecto Node o TypeScript.
- Validar también la salida de cada herramienta (`outputSchema`), no solo la entrada.
- Elegir modelo con un string `"proveedor/modelo"`, que resuelve su enrutador de pasarelas (models.dev, Mastra, Netlify, Azure).

## Cuándo usarla

Equipos que trabajan en TypeScript y quieren una capa de agente más completa que una llamada suelta, con el código de la aplicación y del agente en el mismo lenguaje.

## Cuándo no

- Si te basta con un bucle con herramientas en una app web: [[herramientas/vercel-ai-sdk]] es más pequeño.
- Si necesitas paridad con un backend en Python: LangChain.js y LangGraph.js comparten modelo mental con [[herramientas/langchain]] y [[herramientas/langgraph]].
- Si no puedes aceptar ninguna dependencia con licencia no OSI: vigila las rutas `ee/`.

## Ejemplo mínimo

Copia del ejemplo verificado de la investigación de MoreContext (compila con `tsc --noEmit` contra `@mastra/core` 1.80.0; no se ejecutó contra la API):

```ts title="agente.ts"
// npm i @mastra/core zod
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const verPedidos = createTool({
  id: "ver_pedidos",
  description: "Lista los pedidos de un cliente por su email.",
  inputSchema: z.object({ email: z.string() }),
  outputSchema: z.object({ pedidos: z.array(z.object({ id: z.string(), estado: z.string() })) }),
  execute: async ({ email }) => ({
    pedidos: email === "ana@example.com" ? [{ id: "P-1001", estado: "enviado" }] : [],
  }),
});

export const agente = new Agent({
  id: "soporte",
  name: "Soporte",
  instructions: "Eres el soporte de una tienda. Usa las herramientas; no inventes datos.",
  model: "anthropic/claude-sonnet-5-5",
  tools: { verPedidos },
});

export async function main() {
  const r = await agente.generate("Soy ana@example.com, ¿dónde está mi pedido?", { maxSteps: 10 }); // tope de pasos
  console.log(r.text);
}
```

> [!aviso] Comprueba por dónde pasa el modelo
> Un modelo indicado como string lo resuelve el enrutador de Mastra. La investigación no pudo confirmar qué ruta exacta sigue `"anthropic/…"` (directo a Anthropic o por una pasarela). Compruébalo antes de producción, sobre todo si tus datos no deben pasar por terceros.

## Alternativas

- [[herramientas/vercel-ai-sdk]], el SDK de TypeScript más extendido para apps web.
- [[herramientas/openai-agents-sdk]], con versión JavaScript (`@openai/agents`).
- [[herramientas/strands-agents]], con SDK de TypeScript (`@strands-agents/sdk`).

## Enlaces

- [Repositorio](https://github.com/mastra-ai/mastra) · [npm](https://www.npmjs.com/package/@mastra/core)
- En MoreContext: [[docs/frameworks/11-agentes-en-typescript]] · [[docs/frameworks/02-equivalencias]]
