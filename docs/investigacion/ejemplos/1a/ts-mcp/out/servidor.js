// Servidor MCP mínimo con el SDK de TypeScript v2 (@modelcontextprotocol/server 2.4.0)
import { McpServer, InMemoryTransport } from "@modelcontextprotocol/server";
import { Client } from "@modelcontextprotocol/client";
import { z } from "zod";
const server = new McpServer({ name: "pedidos", version: "1.0.0" });
server.registerTool("consultar_pedido", {
    description: "Devuelve el estado de un pedido por su identificador (p. ej. A-1).",
    inputSchema: z.object({ idPedido: z.string() }),
    outputSchema: z.object({ id: z.string(), estado: z.string() }),
}, async ({ idPedido }) => {
    if (idPedido !== "A-1") {
        return { isError: true, content: [{ type: "text", text: `No existe el pedido ${idPedido}` }] };
    }
    const out = { id: idPedido, estado: "enviado" };
    return { content: [{ type: "text", text: JSON.stringify(out) }], structuredContent: out };
});
// Prueba en memoria; en producción: new StdioServerTransport() de "@modelcontextprotocol/server/stdio"
const [a, b] = InMemoryTransport.createLinkedPair();
await server.connect(a);
const client = new Client({ name: "prueba", version: "1.0.0" });
await client.connect(b);
const { tools } = await client.listTools();
console.log(tools.map((t) => t.name), Object.keys(tools[0].inputSchema.properties ?? {}));
console.log(await client.callTool({ name: "consultar_pedido", arguments: { idPedido: "A-1" } }));
await client.close();
