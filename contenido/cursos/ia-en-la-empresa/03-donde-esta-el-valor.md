---
titulo: Dónde está el valor y cómo encontrar casos de uso
descripcion: Señales de que un proceso se presta a la IA, ejemplos concretos por área de negocio y un método para priorizar casos de uso con impacto, viabilidad y riesgo.
creado: 2026-10-29
orden: 3
minutos: 30
tipo: teoria
objetivos:
  - Reconocer las señales de un proceso con potencial y las que lo descartan.
  - Describir casos de uso concretos en soporte, recursos humanos, ventas, ingeniería y dirección con su nivel de personalización.
  - Priorizar una lista de casos con impacto, viabilidad y riesgo, y justificar el orden ante otras personas.
requiere: ["[[cursos/ia-en-la-empresa/02-la-piramide-de-personalizacion]]"]
tags: [empresa, casos-de-uso, priorizacion]
relacionados: ["[[cursos/ia-en-la-empresa/04-medir-el-valor]]", "[[sistemas/soporte-con-aprobacion-humana]]", "[[patrones/01-workflows-vs-agentes]]", "[[recetas/clasificar-y-enrutar-tickets]]"]
---

Al terminar esta lección sabrás buscar oportunidades en los procesos de tu empresa en vez de buscar dónde poner un chat, tendrás ejemplos concretos por área y un método para ordenar los candidatos que puedes defender en una reunión.

## La idea

El valor aparece cuando la IA mejora un proceso, no cuando impresiona en una demo. La cadena que importa es corta:

```text title="De dónde sale el valor"
Problema del negocio → la IA mejora un paso del proceso → ahorro, ingresos, calidad o velocidad
```

Por eso conviene empezar por el proceso y no por la tecnología. «¿Dónde podemos usar IA?» produce listas de deseos. «¿Qué tarea consume más horas de gente cualificada buscando y redactando?» produce casos de uso.

## Señales de que un proceso se presta

Busca procesos que combinen varias de estas señales:

- **Mucho lenguaje.** Correos, tickets, contratos, actas, informes. Es el terreno natural de un [[glosario/llm|LLM]].
- **Conocimiento disperso.** La respuesta existe, pero está repartida entre la wiki, varios PDF y la cabeza de dos personas.
- **Trabajo repetido con variación.** El mismo tipo de tarea con casos distintos. Si nunca varía, basta código normal; si cada caso es único, será difícil de evaluar.
- **Volumen.** Muchos casos al mes multiplican cualquier mejora por caso.
- **Decisiones frecuentes con un criterio que se puede escribir.** Si nadie sabe explicar cómo se decide, la IA tampoco lo hará bien.
- **Un error que se detecta y se corrige a bajo coste.** Si el error es caro o irreversible, el caso no se descarta, pero se diseña con revisión humana.

Y estas señales lo desaconsejan, al menos de momento:

- **El proceso no está definido.** Si dos personas lo hacen de forma distinta, la IA no lo arregla: amplifica la confusión.
- **Los datos no son accesibles** o nadie puede decir si están al día.
- **Nadie es responsable del resultado.** Sin dueño, nadie mantiene el sistema ni decide si funciona.
- **No hay forma de medir.** Sin métrica no sabrás si ha servido ([[cursos/ia-en-la-empresa/04-medir-el-valor]]).

## Ejemplos por área

Cada ejemplo indica quién lo usa, qué capas necesita (lección 2) y cómo se mide.

### Soporte

- **Copiloto del agente humano.** Antes: el agente busca en manuales e incidencias antiguas y redacta desde cero. Después: el sistema propone una respuesta citando la fuente y el agente la revisa y la envía. Capas: conocimiento (RAG sobre manuales e incidencias resueltas), herramientas (estado del pedido) y proceso (la persona envía). Métrica: tiempo hasta la resolución y tickets reabiertos. Lo tienes construido en [[sistemas/soporte-con-aprobacion-humana]].
- **Clasificar y enrutar tickets.** Prompt con ejemplos y [[glosario/salida-estructurada|salida estructurada]]. Métrica: tickets mal enrutados. Receta: [[recetas/clasificar-y-enrutar-tickets]].

### Recursos humanos

- **Asistente de políticas internas.** «¿Cómo solicito una excedencia?» El sistema busca en el convenio y en las políticas y explica los pasos, citando el apartado. Capas: instrucciones y conocimiento, con permisos, porque no todo el mundo puede ver lo mismo. Métrica: consultas repetitivas que llegan al equipo de RRHH. Riesgo: una respuesta desactualizada sobre un derecho laboral; por eso, citas obligatorias y abstención cuando no hay fuente ([[sistemas/rag-con-citas]]).

### Ventas

- **Borrador de propuesta comercial.** El comercial pide «prepara una propuesta para este cliente». El sistema consulta el CRM (herramienta), el catálogo y las condiciones vigentes (RAG) y la plantilla aprobada (prompt), y genera un borrador que el comercial edita. Métrica: tiempo hasta enviar la propuesta. Riesgo: precios o condiciones no aprobadas; las reglas de descuento se comprueban en código, no en el prompt.
- **Resumen de reuniones con acciones y responsables**: [[recetas/resumen-de-reuniones-con-acciones]].

### Ingeniería

- **Preguntas sobre el código y la documentación interna.** «¿Cómo funciona este módulo?» Un agente de código con acceso al repositorio y a las decisiones de arquitectura responde y señala los archivos. Métrica: tiempo de incorporación de una persona nueva o tiempo de ciclo de un cambio. Ver [[sistemas/agente-de-codigo]] y [[cursos/agentes-de-codigo/index]].

### Dirección

- **Informe mensual de problemas.** «Resume los principales problemas detectados este mes.» Cuidado con el diseño: contar y agregar es trabajo de una consulta a la base de datos, no de recuperar fragmentos. Las cifras salen de consultas (herramientas sobre los datos, como en [[sistemas/asistente-de-datos-con-mcp]]) y el modelo solo las resume y las explica. Riesgo: cifras inventadas si el modelo «calcula» por su cuenta.

### Otras áreas

- **Compras y administración**: extraer datos de facturas y albaranes a JSON validado ([[sistemas/extraccion-documental]]).
- **Legal**: revisar un contrato frente a las cláusulas aprobadas por la empresa y señalar desviaciones, con revisión de una persona del equipo jurídico.
- **Operaciones**: convertir procedimientos largos en listas de comprobación y responder dudas en planta sobre ellos.

## De IA genérica a IA integrada

Los casos anteriores no están todos al mismo nivel de integración. Cada paso de esta progresión aporta más valor y también más responsabilidad:

```mermaid
flowchart LR
  G[Chat genérico] --> C[Prompt con contexto]
  C --> R[RAG propio]
  R --> D[Datos internos]
  D --> H[Herramientas]
  H --> P[Integrado en el proceso]
```

No todo tiene que llegar al final. Un copiloto que redacta borradores para que una persona los envíe suele ser el destino correcto, no una etapa a superar. Antes de dar autonomía, lee la diferencia entre [[patrones/01-workflows-vs-agentes|workflows y agentes]]: si conoces los pasos, un *workflow* con código es más barato y más predecible.

## Priorizar: impacto, viabilidad y riesgo

Con una lista de candidatos, puntúa cada uno de 1 a 3 en tres dimensiones:

- **Impacto**: volumen de casos, tiempo por caso e importancia del proceso. ¿Afecta a clientes, a ingresos o a cumplimiento normativo?
- **Viabilidad**: ¿los datos existen, son accesibles y están al día? ¿El proceso está definido? ¿Hay forma de integrarse con los sistemas? ¿Se puede medir con una línea base?
- **Riesgo**: coste de un error, si es reversible, si toca datos personales o sensibles, si lo ve directamente un cliente y si hay regulación aplicable.

La prioridad sale de multiplicar: `impacto × viabilidad × (4 − riesgo)`, entre 1 y 27. Multiplicar en vez de sumar hace que una dimensión floja hunda el caso aunque las otras dos sean buenas, que es lo que pasa en la realidad. Antes de puntuar, aplica dos filtros eliminatorios: sin métrica medible o sin una persona responsable del resultado, el caso espera.

```python title="priorizar.py"
from dataclasses import dataclass

@dataclass
class Caso:
    nombre: str
    impacto: int      # 1 bajo · 2 medio · 3 alto
    viabilidad: int   # 1 baja · 2 media · 3 alta
    riesgo: int       # 1 bajo · 2 medio · 3 alto
    metrica: bool     # ¿se puede medir con una línea base?
    responsable: bool # ¿hay una persona dueña del resultado?

    @property
    def prioridad(self) -> int:
        return self.impacto * self.viabilidad * (4 - self.riesgo)   # de 1 a 27

CASOS = [
    Caso("Copiloto de respuestas de soporte", 3, 3, 2, True, True),
    Caso("Asistente de políticas de RRHH", 2, 3, 1, True, True),
    Caso("Borradores de propuestas comerciales", 3, 2, 2, True, False),
    Caso("Respuesta automática a reclamaciones", 3, 2, 3, True, True),
    Caso("Chatbot genérico en la intranet", 1, 3, 1, False, False),
]

aptos = [c for c in CASOS if c.metrica and c.responsable]
# a igual prioridad, primero el de menor riesgo
for c in sorted(aptos, key=lambda c: (c.prioridad, -c.riesgo), reverse=True):
    print(f"{c.prioridad:>2}  {c.nombre}  (I{c.impacto} V{c.viabilidad} R{c.riesgo})")
print("Fuera hasta que tengan métrica y responsable:",
      ", ".join(c.nombre for c in CASOS if c not in aptos))
```

```text title="Salida"
18  Asistente de políticas de RRHH  (I2 V3 R1)
18  Copiloto de respuestas de soporte  (I3 V3 R2)
 6  Respuesta automática a reclamaciones  (I3 V2 R3)
Fuera hasta que tengan métrica y responsable: Borradores de propuestas comerciales, Chatbot genérico en la intranet
```

Fíjate en tres cosas. El empate se rompe a favor del caso de menor riesgo, que es buen criterio para un primer piloto: construyes capacidad y confianza con algo interno antes de tocar al cliente. La respuesta automática a reclamaciones tiene mucho impacto, pero su riesgo la hunde; rediseñada como copiloto con revisión humana, bajaría a riesgo 2 y subiría en la lista. Y el chatbot genérico no llega ni a puntuarse.

> [!consejo] El número sirve para discutir
> Trata la puntuación como una excusa para hablar. Lo valioso es la conversación cuando dos personas puntúan distinto el mismo caso: ahí salen los datos que faltan, los riesgos que nadie había nombrado y quién debería ser el responsable.

## Errores frecuentes

- Empezar por el caso de mayor impacto aunque sea el de mayor riesgo y el menos viable.
- Elegir casos por lo vistosa que es la demo y no por el volumen y el tiempo que ahorran.
- Usar recuperación de fragmentos para preguntas que exigen contar o agregar datos.
- Dar autonomía completa a un proceso que funcionaría igual de bien como copiloto.

## Ejercicio

> [!ejercicio] Tu lista priorizada
> Escribe cinco procesos candidatos de tu organización, de al menos tres áreas distintas. Para cada uno: qué señales de oportunidad cumple, qué capas necesitaría, su puntuación de impacto, viabilidad y riesgo con una frase que justifique cada número, y si pasa los dos filtros. Ordénalos y elige uno para el resto del curso.
>
> Está bien si cada puntuación tiene justificación, si al menos un caso queda fuera por los filtros o rediseñado para bajar su riesgo, y si el elegido tiene una métrica que se podría medir hoy, antes de construir nada.

> [!ejercicio]- Pistas
> Para encontrar candidatos, pregunta a tres equipos qué tareas les quitan más tiempo buscando información o redactando lo mismo con variaciones. Las respuestas del tipo «tardo mucho en encontrar…» suelen ser RAG; las de «tengo que mirar en tres sistemas…», herramientas.

## Resumen

- Empieza por el proceso y su problema, no por la tecnología.
- Las mejores señales: mucho lenguaje, conocimiento disperso, repetición con variación, volumen y errores revisables.
- Sin proceso definido, datos accesibles, responsable o métrica, el caso espera.
- Prioriza con impacto × viabilidad × (4 − riesgo) y desempata hacia el menor riesgo en el primer piloto.
- Un copiloto con revisión humana es a menudo el destino correcto.

## Para seguir

- [[cursos/ia-en-la-empresa/04-medir-el-valor]]: cómo demostrar que el caso elegido funciona.
- [[patrones/09-elegir-patron]]: qué arquitectura le corresponde.
- [[sistemas/soporte-con-aprobacion-humana]] como ejemplo completo de un caso priorizado.
