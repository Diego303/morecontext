---
titulo: Mínimo privilegio
descripcion: Principio de dar a un agente y a sus herramientas solo los permisos estrictamente necesarios para su tarea y nada más.
creado: 2026-09-24
categoria: seguridad
ingles: principle of least privilege
aliases: [principle of least privilege, least privilege, principio de mínimo privilegio]
tags: [seguridad]
relacionados: ["[[docs/seguridad/02-permisos-y-minimo-privilegio]]", "[[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]"]
---

El mínimo privilegio es un principio clásico de seguridad: cada componente recibe solo los permisos que necesita para su función. En agentes se aplica a las herramientas, las credenciales y los datos: si el agente solo tiene que leer pedidos, su herramienta no puede modificarlos y su credencial no da acceso a otras tablas.

## En la práctica

Asume que el modelo puede acabar haciendo cualquier cosa que sus herramientas permitan, por error o por una [[glosario/inyeccion-de-prompt]]. Por eso: herramientas estrechas (`buscar_pedido(id)` en lugar de `ejecutar_sql(consulta)`), credenciales de solo lectura cuando basta, acceso limitado a los datos del usuario actual, y [[glosario/humano-en-el-bucle|aprobación humana]] para lo irreversible. Aplícalo en el código y en la infraestructura, no en el prompt: una instrucción no es un permiso.

## Ver también

- [[docs/seguridad/02-permisos-y-minimo-privilegio]]
- [[cursos/seguridad-y-prompt-injection/04-permisos-y-sandbox]]
- [[recetas/servidor-mcp-de-solo-lectura]]
- [[glosario/sandbox]]
