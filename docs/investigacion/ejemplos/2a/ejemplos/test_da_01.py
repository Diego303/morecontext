from langchain_core.messages import AIMessage

from _fakes import FakeToolModel, llamada
from da_01_deep_agent import crear_agente

# Un único modelo falso para principal y subagente: responde según el último mensaje.
vistos = []


class Guion(FakeToolModel):
    def bind_tools(self, tools, **kwargs):
        vistos.append(sorted(t["name"] if isinstance(t, dict) else t.name for t in tools))
        return self

    def _generate(self, messages, stop=None, run_manager=None, **kwargs):
        from langchain_core.outputs import ChatGeneration, ChatResult
        sistema = messages[0].content if messages and messages[0].type == "system" else ""
        sistema = sistema if isinstance(sistema, str) else str(sistema)
        ultimo = messages[-1]
        es_sub = "Investiga solo la pregunta" in sistema
        n_tool = sum(1 for m in messages if m.type == "tool")
        if es_sub:
            msg = (AIMessage(content="", tool_calls=[llamada("buscar_web", {"consulta": "langgraph interrupt"}, "s1")])
                   if n_tool == 0 else AIMessage(content="Hallazgo: LangGraph usa interrupt() (https://docs.langchain.com)"))
        else:
            pasos = [
                AIMessage(content="", tool_calls=[llamada("write_todos", {"todos": [
                    {"content": "Investigar LangGraph", "status": "in_progress"},
                    {"content": "Escribir informe", "status": "pending"}]}, "p1")]),
                AIMessage(content="", tool_calls=[llamada("task", {"subagent_type": "investigador",
                                                                   "description": "¿Cómo hace HITL LangGraph?"}, "p2")]),
                AIMessage(content="", tool_calls=[llamada("write_file", {"file_path": "/informe.md",
                                                                         "content": "# Informe\nLangGraph: interrupt()."}, "p3")]),
                AIMessage(content="Informe escrito en /informe.md"),
            ]
            msg = pasos[min(n_tool, len(pasos) - 1)]
        return ChatResult(generations=[ChatGeneration(message=msg)])


agente = crear_agente(Guion(messages=iter([])))
out = agente.invoke({"messages": [("user", "Compara LangGraph y Pydantic AI")]}, {"configurable": {"thread_id": "t"}})
print("herramientas vistas por cada modelo:")
for v in vistos:
    print("  ", v)
print("todos:", out.get("todos"))
print("files:", {k: (v if isinstance(v, str) else v.get("content")) for k, v in out["files"].items()})
print("tool msgs:", [(m.name, str(m.content)[:60]) for m in out["messages"] if m.type == "tool"])
print("final:", out["messages"][-1].content)
