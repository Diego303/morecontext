---
titulo: El contexto del repositorio
descripcion: Cómo darle a un agente de código las convenciones de tu proyecto con un archivo de memoria (CLAUDE.md o AGENTS.md), qué poner en él y qué dejar fuera.
creado: 2026-09-16
orden: 2
minutos: 40
tipo: practica
objetivos:
  - Redactar un archivo de memoria del proyecto con comandos, convenciones y límites verificables
  - Distinguir qué información conviene precargar y cuál debe descubrir el agente bajo demanda
  - Implementar la carga del archivo de memoria en el prompt de sistema con prompt caching
requiere: ["[[cursos/agentes-de-codigo/01-como-trabaja-un-agente-de-codigo]]"]
relacionados: ["[[disciplinas/context-engineering]]", "[[glosario/memoria]]", "[[docs/contexto/02-prompt-caching]]", "[[cursos/context-engineering/02-que-meter-y-que-no]]"]
tags: [agentes, codigo, contexto]
---

Al terminar esta lección sabrás escribir el archivo que le explica tu proyecto a un agente de código y conectarlo a tu agente. Es el cambio con mejor relación esfuerzo/resultado que puedes hacer: veinte minutos de redacción ahorran la misma corrección en cada sesión.

## La idea

Cada sesión de un agente empieza en blanco. No sabe que tus tests se lanzan con `make test` y no con `pytest`, que la carpeta `legacy/` no se toca o que el equipo prefiere `httpx` a `requests`. Puede descubrir parte de eso explorando, pero gasta pasos, tokens y a veces se equivoca.

La solución habitual es un **archivo de memoria del proyecto**: un Markdown en la raíz del repositorio que el agente carga al empezar. Distintas herramientas usan nombres distintos (`CLAUDE.md`, `AGENTS.md` y otros), pero la idea es la misma: un documento corto con lo que un desarrollador nuevo tardaría una semana en aprender. Es una forma de [[glosario/memoria|memoria]] explícita, escrita por humanos y versionada con el código.

## Qué poner

Piensa en lo que el agente no puede deducir leyendo el código, o que le costaría muchos pasos deducir.

```markdown title="AGENTS.md"
## Comandos
- Instalar: `uv sync`
- Tests: `uv run pytest -q` (tarda ~1 min; para un archivo: `uv run pytest tests/test_x.py`)
- Lint y formato: `uv run ruff check --fix . && uv run ruff format .`
- Tipos: `uv run mypy src/`

## Estructura
- `src/app/api/`: endpoints HTTP. Cada endpoint valida con Pydantic.
- `src/app/dominio/`: lógica de negocio. No importa nada de `api/`.
- `legacy/`: código antiguo en migración. No lo modifiques.

## Convenciones
- Cliente HTTP: `httpx`, nunca `requests`.
- Fechas siempre con zona horaria (`datetime.now(tz=UTC)`).
- Cada bug arreglado lleva un test que fallaba antes del arreglo.

## Antes de terminar
- Tests, lint y mypy en verde.
- No añadas dependencias sin decirlo en el resumen.
```

Cuatro bloques cubren casi todo:

- **Comandos** exactos y copiables. Es lo más valioso: elimina el ensayo y error al ejecutar.
- **Estructura**: un mapa breve de carpetas con su responsabilidad y las reglas de dependencia entre ellas.
- **Convenciones** que el linter no comprueba. Si el linter ya lo impone, sobra aquí.
- **Definición de terminado**: qué tiene que estar en verde antes de entregar.

## Qué dejar fuera

Todo lo que metes compite por la atención del modelo en cada paso. El contexto es finito y cada línea irrelevante resta ([[cursos/context-engineering/01-el-contexto-como-presupuesto]]).

- **El README entero o la documentación de arquitectura.** Enlázalos con su ruta; el agente los leerá si los necesita.
- **Información que cambia a menudo** (versiones, tareas del sprint). Se queda obsoleta y el agente la tratará como verdad.
- **Reglas vagas** como «escribe código limpio». No cambian el comportamiento. Escribe la regla concreta que tienes en mente.
- **Secretos, URLs internas sensibles o credenciales.** El archivo se versiona y se envía al proveedor del modelo en cada petición.
- **Listas de prohibiciones sin motivo.** «No uses `print`» funciona peor que «Usa `logger` (de `app.log`); los `print` no llegan a producción». El motivo ayuda al modelo a generalizar.

> [!consejo] Una prueba sencilla
> Para cada línea, pregúntate: si la borro, ¿el agente se equivocará en algo concreto? Si no sabes decir en qué, bórrala.

## Precargar o descubrir

Hay dos formas de dar contexto a un agente de código, y conviene combinarlas.

| Estrategia | Qué incluye | Ventaja | Coste |
|---|---|---|---|
| Precargar | Archivo de memoria en el prompt de sistema | Disponible desde el primer paso, sin herramientas | Ocupa contexto en cada llamada |
| Descubrir bajo demanda | Rutas, nombres y búsquedas; el agente lee lo que necesita | El contexto crece solo con lo relevante | Más pasos y más latencia |

La regla práctica: **precarga lo que se necesita en casi todas las tareas y deja el resto como referencias**. Una línea como «La guía de migraciones está en `docs/migraciones.md`» cuesta diez tokens y permite al agente leer la guía solo cuando toque una migración. Anthropic describe este enfoque de recuperación «justo a tiempo» en *[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)*: el agente mantiene identificadores ligeros (rutas, consultas) y carga los datos con herramientas cuando los necesita.

En repositorios grandes ayuda tener archivos de memoria por carpeta: uno general en la raíz y otro en `frontend/` con sus propios comandos. El agente carga el de la raíz siempre y el de la subcarpeta cuando trabaja en ella.

## Cargarlo en tu agente

El archivo de memoria es estable entre llamadas, así que es un candidato perfecto para [[glosario/prompt-caching|prompt caching]]: va en el prompt de sistema, después de las instrucciones fijas y con un punto de corte de caché. Así no pagas su precio completo en cada paso del bucle.

```python tab="Python" title="contexto_repo.py"
import pathlib
import anthropic

MODEL = "claude-sonnet-5-5"
client = anthropic.Anthropic()
NOMBRES = ("AGENTS.md", "CLAUDE.md")

def cargar_memoria(raiz: pathlib.Path, carpeta: pathlib.Path | None = None) -> str:
    """Archivo de la raíz y, si hay, el de la carpeta de trabajo."""
    partes = []
    for d in [raiz] + ([carpeta] if carpeta and carpeta != raiz else []):
        for nombre in NOMBRES:
            f = d / nombre
            if f.exists():
                partes.append(f'<memoria_proyecto ruta="{f.relative_to(raiz)}">\n'
                              f'{f.read_text(encoding="utf-8")}\n</memoria_proyecto>')
                break
    return "\n\n".join(partes)

def construir_system(raiz: pathlib.Path) -> list[dict]:
    return [
        {"type": "text", "text": "Eres un agente de código. Sigue las convenciones del proyecto."},
        {"type": "text", "text": cargar_memoria(raiz),
         "cache_control": {"type": "ephemeral"}},  # prefijo estable: se cachea
    ]

resp = client.messages.create(
    model=MODEL, max_tokens=2048,
    system=construir_system(pathlib.Path(".").resolve()),
    messages=[{"role": "user", "content": "¿Con qué comando lanzo solo los tests de la API?"}],
)
print(resp.content[0].text)
print(resp.usage.cache_creation_input_tokens, resp.usage.cache_read_input_tokens)
```

```ts tab="TypeScript" title="contexto_repo.ts"
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MODEL = "claude-sonnet-5-5";
const client = new Anthropic();

function cargarMemoria(raiz: string): string {
  for (const nombre of ["AGENTS.md", "CLAUDE.md"]) {
    const ruta = join(raiz, nombre);
    if (existsSync(ruta)) {
      return `<memoria_proyecto ruta="${nombre}">\n${readFileSync(ruta, "utf-8")}\n</memoria_proyecto>`;
    }
  }
  return "";
}

const resp = await client.messages.create({
  model: MODEL,
  max_tokens: 2048,
  system: [
    { type: "text", text: "Eres un agente de código. Sigue las convenciones del proyecto." },
    { type: "text", text: cargarMemoria(process.cwd()), cache_control: { type: "ephemeral" } },
  ],
  messages: [{ role: "user", content: "¿Con qué comando lanzo solo los tests de la API?" }],
});
console.log(resp.usage);
```

Ten en cuenta que hay un mínimo de tokens para que un bloque se cachee, y depende del modelo. Si tu archivo es muy corto, quizá no llegue; no pasa nada, el coste también es pequeño. Lo tienes en [[docs/contexto/02-prompt-caching]].

## Mantenerlo vivo

Trata el archivo de memoria como código: va en el repositorio, se revisa en las *pull requests* y se corrige cuando falla. El mejor momento para añadir una línea es justo después de corregir al agente por segunda vez en lo mismo. Si una regla ya no aplica, quítala: una regla obsoleta hace más daño que una ausente, porque el modelo la sigue.

## Errores frecuentes

- **Archivo de memoria de 2.000 líneas.** Cuanto más largo, más se diluye cada instrucción. Apunta a lo que cabe en una pantalla o dos.
- **Comandos que no funcionan.** Si `make test` falla en una máquina limpia, el agente perderá pasos en cada sesión. Pruébalos.
- **Duplicar lo que impone el linter.** Gasta contexto y crea contradicciones cuando cambia la configuración.

## Ejercicio

> [!ejercicio] El archivo de memoria de tu proyecto
> Escribe un `AGENTS.md` para un repositorio tuyo con los cuatro bloques (comandos, estructura, convenciones, definición de terminado) en menos de 60 líneas. Conéctalo al agente de la lección anterior con `construir_system`. Pídele dos tareas: «añade un test para X» y «¿qué carpeta no debo tocar?».
> Está bien si: el agente usa el comando de tests del archivo sin buscarlo, respeta la carpeta prohibida y en la segunda llamada del bucle `cache_read_input_tokens` es mayor que cero (si tu archivo supera el mínimo cacheable).

> [!ejercicio]- Pistas
> Ejecuta los comandos del archivo tú mismo en una terminal limpia antes de dárselos al agente. Si el agente ignora una convención, añade el motivo junto a la regla.

## Resumen

- Cada sesión empieza en blanco: el archivo de memoria del proyecto le da al agente lo que no puede deducir del código.
- Comandos exactos, mapa de carpetas, convenciones no automatizadas y definición de terminado.
- Fuera: documentación entera, datos cambiantes, reglas vagas y secretos.
- Precarga lo que casi siempre hace falta; deja el resto como rutas que el agente lee bajo demanda.
- Versiónalo, revísalo y cachéalo.

## Para seguir

- [[cursos/agentes-de-codigo/03-explorar-planificar-implementar-verificar]]
- [[cursos/context-engineering/02-que-meter-y-que-no]]
- [[modelos/02-ingenieria-de-contexto]]
