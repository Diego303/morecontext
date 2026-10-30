---
titulo: pass@k y pass^k
descripcion: Dos métricas de evals con varios intentos por tarea, una mide si el agente acierta alguna vez y otra si acierta siempre.
creado: 2026-10-29
categoria: evals
ingles: pass@k / pass^k
aliases: [pass@k, pass^k, pass hat k, pass at k]
tags: [evals, agentes]
relacionados: ["[[cursos/evals-para-agentes/01-que-medir]]", "[[biblioteca/demystifying-evals]]", "[[glosario/evals]]"]
---

Cuando ejecutas cada tarea varias veces, **pass@k** es la probabilidad de que al menos uno de k intentos acierte y **pass^k** es la probabilidad de que acierten los k. La primera viene de la evaluación de código ([Chen et al., 2021](https://arxiv.org/abs/2107.03374)); la segunda la introdujo τ-bench ([Yao et al., 2024](https://arxiv.org/abs/2406.12045)) para medir consistencia.

## En la práctica

Con n ensayos y c aciertos por tarea, se estiman así:

```python title="pass_k.py"
from math import comb

def pass_at_k(n: int, c: int, k: int) -> float:
    return 1 - comb(n - c, k) / comb(n, k)

def pass_hat_k(n: int, c: int, k: int) -> float:
    return comb(c, k) / comb(n, k)

print(round(pass_at_k(10, 7, 3), 3), round(pass_hat_k(10, 7, 3), 3))  # 0.992 0.292
```

Las dos cuentan historias opuestas: con un 75 % de acierto por ensayo, pass^3 baja a un 42 % ([Anthropic, ene. 2026](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). Usa pass@k cuando basta una buena solución (generar candidatos y elegir); usa pass^k para un agente de cara al cliente, que tiene que acertar cada vez.

## No confundir con

- **Tasa de acierto por ensayo**: la media simple de aciertos, sin agrupar por tarea.

## Ver también

- [[cursos/evals-para-agentes/01-que-medir]]
- [[docs/evals/01-disenar-evals]]
- [[biblioteca/demystifying-evals]]
- [[glosario/conjunto-de-evaluacion]]
