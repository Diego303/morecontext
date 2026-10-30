---
titulo: Open WebUI
descripcion: Interfaz de chat autoalojada para Ollama y APIs compatibles con OpenAI, con RAG, herramientas y usuarios; su licencia añade una cláusula de marca.
creado: 2026-10-29
tags: [interfaz, autoalojado, modelos-abiertos]
relacionados: ["[[sistemas/asistente-100-local]]", "[[herramientas/ollama]]", "[[cursos/agentes-con-modelos-abiertos/01-pesos-abiertos-y-licencias]]"]
categoria: interfaz
licencia: Open WebUI License (BSD-3 con cláusula de marca)
open_source: false
lenguajes: [Python]
url: https://docs.openwebui.com
repositorio: https://github.com/open-webui/open-webui
version: "0.12.5"
revisado: 2026-10-29
---

Open WebUI es una interfaz web de chat que instalas en tu servidor. Habla con [[herramientas/ollama]] y con cualquier API compatible con OpenAI, y añade lo que un equipo pide a un «ChatGPT interno»: usuarios y grupos con permisos, bases de conocimiento con [[glosario/rag]], modelos personalizados con instrucciones y herramientas, y «Open Terminal» para que un agente ejecute código. Puede funcionar sin conexión a internet.

**Licencia: por qué no la marcamos como open source.** El código está publicado y puedes autoalojarlo gratis, pero la licencia es propia: **BSD-3 más una cláusula que prohíbe alterar o quitar la marca «Open WebUI»**, salvo con 50 usuarios o menos en 30 días, con permiso escrito o con licencia enterprise. Además pide un CLA a quien contribuye y conserva partes con licencias anteriores (ver `LICENSE_HISTORY`). Una restricción así no aparece en ninguna licencia aprobada por la OSI. **Criterio de MoreContext:** fuente disponible y autoalojable, no open source. Si vas a darle tu marca para más de 50 usuarios, lee el `LICENSE` antes.

## Para qué sirve

- Dar a tu equipo un chat sobre modelos locales o propios, con los datos dentro de tu red.
- Probar modelos y *prompts* con una interfaz cómoda sobre el servidor que ya tienes.
- Montar asistentes con documentos internos sin escribir el *frontend* ([[sistemas/asistente-100-local]]).

## Cuándo usarla

Para uso interno, con la marca tal cual, cuando quieres una interfaz completa en minutos encima de Ollama, vLLM o una API.

## Cuándo no

- Si vas a ofrecerla con tu marca a más de 50 usuarios: necesitas permiso o licencia enterprise.
- Si estás construyendo tu producto: una interfaz genérica no sustituye a la [[disciplinas/ux-de-agentes]] de tu caso.
- Expuesta a internet sin revisar autenticación y permisos: tiene usuarios, herramientas y terminal.

## Ejemplo mínimo

Del README (no se ha ejecutado aquí). Con pip, usa Python 3.12:

```bash
pip install open-webui
open-webui serve          # http://localhost:8080
```

Con Docker, conectando con un Ollama que corre en la propia máquina:

```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:main
# abre http://localhost:3000
```

Si el contenedor no llega a Ollama en `127.0.0.1:11434`, el README propone `--network=host` (y entonces la interfaz queda en el puerto 8080). El volumen `open-webui` guarda usuarios, conversaciones y documentos: inclúyelo en tus copias de seguridad.

## Alternativas

- [[herramientas/lm-studio]]: chat de escritorio para una sola persona (propietario).
- LibreChat, AnythingLLM y Dify: licencias no verificadas en esta revisión; compruébalas antes de elegir.
- Tu propia interfaz sobre el [[herramientas/anthropic-sdk]] o un framework, si el chat es parte del producto.

## Enlaces

- Documentación: [docs.openwebui.com](https://docs.openwebui.com)
- Repositorio y licencia: [github.com/open-webui/open-webui](https://github.com/open-webui/open-webui)
