---
titulo: Apuntes de vídeo con IA para tu segundo cerebro
descripcion: Cómo usar el prompt maestro del autor para convertir un vídeo técnico en apuntes de Obsidian, qué hace cada fase, qué revisar a mano y cómo usarlo de forma responsable.
creado: 2026-10-29
nivel: inicial
minutos: 15
tema: prompting
stack: ["Obsidian"]
tags: [prompting, obsidian, apuntes, aprendizaje, video]
relacionados: ["[[plantillas/prompt-apuntes-de-video]]", "[[cursos/ruta-en-video/index]]", "[[blog/2026-10-14-mi-ruta-para-aprender-ia-con-videos]]", "[[roadmap/10-prompting/01-instrucciones-claras]]", "[[glosario/alucinacion]]"]
---

## Problema

Ves un vídeo técnico de cuarenta minutos, tomas cuatro notas y a la semana no recuerdas ni la mitad. Pedirle a un modelo «resúmeme este vídeo» tampoco ayuda: te da cinco viñetas genéricas, mezcla lo que dijo el autor con lo que el modelo ya sabía y se inventa la cifra que no oyó bien.

El autor usa un **prompt maestro** para su ruta de aprendizaje en vídeo ([[cursos/ruta-en-video/index]]): convierte un vídeo (o su transcripción) en unos apuntes de Obsidian exhaustivos, con definiciones, analogías, código, marcas de tiempo y, sobre todo, con lo dudoso y lo añadido señalados. El prompt completo está en [[plantillas/prompt-apuntes-de-video]]; esta receta explica cómo funciona, cómo usarlo y qué revisar.

## Ingredientes

- Una herramienta de IA que acepte el vídeo, o la transcripción del vídeo si no lo acepta (pierdes lo que solo se ve en pantalla: márcalo).
- El prompt de [[plantillas/prompt-apuntes-de-video]].
- Una bóveda de Obsidian donde guardar los apuntes.
- Diez minutos para revisar lo que el modelo marque.

## Pasos

1. **Entiende el criterio de éxito.** El prompt lo fija en una frase: alguien que nunca ha visto el vídeo debe quedarse con el mismo conocimiento y el mismo detalle que quien lo vio tomando notas. Por eso pide exhaustividad, no resumen, y explicarlo todo para alguien que parte de cero.

2. **Fase 1: inventario interno.** Antes de escribir, el modelo recorre el vídeo entero y apunta sin mostrarlo: la estructura con marcas de tiempo, todos los conceptos y términos (también los que se dan por sabidos), los datos duros (cifras, versiones, precios), herramientas y personas citadas, código y comandos, lo que se ve en pantalla, los pasos de cada procedimiento, las opiniones separadas de los hechos y los huecos (lo que se menciona y no se explica). Cierra con un control: ¿hay algún minuto sin representar?, ¿algún concepto solo nombrado?

3. **Fase 2: redacción.** Las reglas que hacen útiles los apuntes:
   - Ningún término sin definir antes.
   - Cada concepto complejo, en dos pasos y en este orden: **la base** técnica correcta y después **el símil** cotidiano. El símil nunca sustituye a la base.
   - Callouts de Obsidian con significado: `[!INFO]` para definiciones, `[!EXAMPLE]` para símiles, `[!WARNING]` y `[!DANGER]` para riesgos, `[!NOTE] Contexto` para lo que añade el modelo, `[!QUOTE]` para citas literales, `[!QUESTION]` para dudas abiertas.
   - Un formato fijo: frontmatter (título, canal, URL, duración, fechas, nivel, tags, `estado: sin-repasar`), resumen en tres frases, objetivos, requisitos, mapa mental, desarrollo por bloques con `⏱️ MM:SS`, herramientas, glosario, cifras, errores comunes, **opiniones del autor (≠ hechos)**, pendientes, práctica, notas relacionadas en wikilinks y cinco preguntas de repaso con la respuesta plegada.

4. **Las reglas que te protegen.** Cero invención: si el modelo no está seguro de un dato, un nombre o un comando, lo marca como `⚠️ verificar en el vídeo (MM:SS)` en lugar de rellenarlo. Separación de fuentes: lo que dice el vídeo va en el cuerpo y lo que añade el modelo para que se entienda va siempre en `[!NOTE] Contexto`. Salida limpia: solo el Markdown y, al final, el nombre de archivo sugerido (`AAAA-MM-DD - Canal - Título corto.md`).

5. **Úsalo.** Copia el prompt, sustituye `{{URL_DEL_VIDEO}}` por el enlace (o pega la transcripción y di que lo es), y si hace falta añade una de sus líneas de ajuste: vídeo de más de dos horas (un índice y un archivo por bloque), puramente teórico (más glosario y símiles), tutorial (cada comando y versión exactos) o tarjetas de repaso para el plugin de repetición espaciada.

6. **Revisa a mano lo que importa.** Antes de cambiar `estado: sin-repasar`:
   - Cada `⚠️ verificar`: vuelve al minuto y corrige.
   - **Cada cifra, versión, fecha y precio**: es donde más se equivoca un modelo y donde más daño hace un error.
   - Las **opiniones**: que no se hayan colado en el cuerpo como hechos.
   - Los bloques `Contexto`: son conocimiento del modelo, no del vídeo; pueden estar desfasados ([[glosario/alucinacion]]).
   - Los comandos: pruébalos antes de fiarte.

   Este script hace la lista por ti:

```python title="revisar_apuntes.py"
#!/usr/bin/env python3
"""Lista lo que hay que revisar a mano en unos apuntes generados por IA.

Uso: python3 revisar_apuntes.py "2026-10-29 - Canal - Título.md"
"""
import re
import sys

CIFRA = re.compile(r"\d+(?:[.,]\d+)?\s*(?:%|€|\$|USD|ms|s\b|GB|MB|tokens|k\b|M\b)|\bv?\d+\.\d+(?:\.\d+)?\b|\b(?:19|20)\d{2}\b")
SECCIONES = ("## 🔢 Datos y cifras concretas", "## 💡 Opiniones del autor (≠ hechos)", "## ❓ Lo que queda pendiente")


def revisar(texto: str) -> list[str]:
    avisos = []
    cuerpo = texto.split("\n---\n", 1)[-1]
    for n, linea in enumerate(texto.splitlines(), 1):
        if "⚠️ verificar" in linea:
            avisos.append(f"línea {n}: dudoso, vuelve al vídeo → {linea.strip()[:80]}")
        elif CIFRA.search(linea) and not linea.startswith(("fecha_", "duracion", "url")):
            avisos.append(f"línea {n}: cifra o versión, compruébala → {linea.strip()[:80]}")
    avisos += [f"falta la sección «{s}»" for s in SECCIONES if s not in texto]
    if len(re.findall(r"⏱️ \d{1,2}:\d{2}", cuerpo)) < 2:
        avisos.append("casi sin marcas de tiempo: no podrás volver al vídeo")
    contexto = len(re.findall(r"\[!NOTE\] Contexto", texto))
    avisos.append(f"{contexto} bloques «Contexto»: es lo que añadió el modelo, no el vídeo; léelos con lupa")
    return avisos


if __name__ == "__main__":
    for aviso in revisar(open(sys.argv[1], encoding="utf-8").read()):
        print("·", aviso)
```

7. **Guárdalo y enlázalo.** Pega el archivo en tu bóveda con el nombre sugerido, sustituye los wikilinks genéricos por tus notas reales y crea una plantilla de Obsidian con la estructura vacía: así, aunque cambies de herramienta, todos tus apuntes tienen el mismo formato y se enlazan entre sí.

## Cómo comprobar que funciona

Sobre unos apuntes de ejemplo inventados para la prueba:

```text
$ python3 revisar_apuntes.py ejemplo.md
· línea 18: cifra o versión, compruébala → El autor cuenta que su harness redujo un 40 % los fallos.
· línea 23: dudoso, vuelve al vídeo → Usa la versión 2.1 de la herramienta ⚠️ verificar en el vídeo (05:32).
· falta la sección «## 🔢 Datos y cifras concretas»
· falta la sección «## ❓ Lo que queda pendiente»
· 1 bloques «Contexto»: es lo que añadió el modelo, no el vídeo; léelos con lupa
```

La prueba de verdad: una semana después, contesta las cinco preguntas de repaso sin mirar. Si no puedes, los apuntes eran un resumen disfrazado; pide al modelo que rehaga los bloques que fallas.

## Variaciones

- **Sin visión de vídeo.** Con la transcripción, añade al prompt que lo es: el modelo no inventará diagramas que no ha visto y marcará como pendiente lo que el ponente «enseña en pantalla».
- **Varios vídeos de un tema.** Genera los apuntes de cada uno y luego pide una nota de síntesis que solo enlace y compare, sin repetir contenido.
- **Tu propio formato.** Cambia la plantilla de salida por la estructura de tu bóveda; conserva las reglas de cero invención y separación de fuentes, que son las que hacen fiables los apuntes ([[roadmap/10-prompting/01-instrucciones-claras]]).

## Errores típicos

- **Pedir un resumen.** Cinco viñetas no son apuntes. El prompt pide lo contrario: exhaustividad.
- **No revisar las cifras.** El número mal oído acaba en tu segundo cerebro como hecho.
- **Confundir opinión con hecho.** «Esto no escala» puede ser la experiencia del ponente, no una ley. Por eso va en su sección.
- **Republicar los apuntes.** Son para ti. Unos apuntes exhaustivos son casi una transcripción del trabajo de otra persona: no los publiques como contenido propio ni los compartas como sustituto del vídeo. Si algo te sirve para escribir, escríbelo con tus palabras y enlaza al original.
- **Fiarse de los bloques «Contexto».** Son la parte que el modelo añadió de memoria: compruébalos como cualquier otra fuente.
