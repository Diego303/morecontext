---
titulo: La API de Claude estrena versión y se despide de temperature
descripcion: La versión 2026-10-21 elimina temperature, top_p y top_k y llega con SDK mayores. Qué rompe y cómo estabilizar evals y jueces sin esos parámetros.
creado: 2026-10-23
categoria: modelos
tags: [api, sdk, temperatura, evals]
fuente:
  titulo: Migrating to API version 2026-10-21 · Documentación de la API de Claude
  url: https://platform.claude.com/docs/en/api/migration-2026-10-21
relacionados: ["[[docs/fundamentos/05-versiones-de-api-y-sdks]]", "[[modelos/06-parametros]]", "[[glosario/temperatura]]", "[[recetas/modelo-juez-con-rubrica]]"]
---

## Qué es

El 21 de octubre de 2026 Anthropic publicó la versión `2026-10-21` de la API de Claude, la primera desde `2023-06-01`, y rompe compatibilidad. Lo más visible: [[glosario/temperatura|temperature]], [[glosario/top-p|top_p]] y `top_k` desaparecen. Si los envías, la API responde 400 en cualquier modelo, aunque lleven el valor por defecto ([guía de migración](https://platform.claude.com/docs/en/api/migration-2026-10-21)).

Con ella salen SDK mayores que envían la nueva cabecera `anthropic-version`: Python `anthropic` 2.0.0, TypeScript `@anthropic-ai/sdk` 1.0.0, Go v2, Java 3, C# 13, PHP 1, Ruby 2 y el CLI `ant` 2, ya con licencia Apache 2.0 ([notas de versión](https://platform.claude.com/docs/en/release-notes/overview)).

## Qué cambia en la práctica

- En el SDK de Python 2.x, `temperature=` ni siquiera sale de tu máquina: `messages.create` lanza `TypeError`.
- Los modelos 4.7 y posteriores ya solo aceptaban los valores por defecto, así que su comportamiento no cambia. Lo que se rompe es tu código. Si un modelo anterior necesita otro valor, la guía indica quedarse en `2023-06-01`.
- El SDK también cambia: la clave viaja como `Authorization: Bearer` (revisa proxies que lean `X-Api-Key`), un cliente admite una sola credencial y los mensajes se escriben como dict.
- `temperature=0` deja de ser la forma de estabilizar un modelo juez:

```diff
 veredicto = client.messages.create(
     model=MODEL, max_tokens=1024,
-    temperature=0,
+    output_config={"format": {"type": "json_schema", "schema": VEREDICTO}},
     messages=[{"role": "user", "content": prompt_juez}],
 )
```

## Qué hacer

1. Busca `temperature`, `top_p` y `top_k` en tu código y en la configuración de tus [[glosario/evals|evals]], quítalos y fija `anthropic>=2` (exige Python 3.10). Lista completa de cambios en [[docs/fundamentos/05-versiones-de-api-y-sdks]].
2. Estabiliza a tus jueces con otras palancas: [[glosario/salida-estructurada|salida estructurada]], rúbrica cerrada, modelo y esfuerzo fijos, y varias muestras con voto. Cómo, en [[roadmap/80-evals/03-codigo-o-modelo-juez]] y [[recetas/modelo-juez-con-rubrica]].
3. Si trabajas con otros proveedores o con modelos abiertos, allí esos parámetros siguen existiendo: [[modelos/06-parametros]].
