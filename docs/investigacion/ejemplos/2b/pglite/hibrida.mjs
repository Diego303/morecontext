// Verifica el SQL de pgvector (HNSW, halfvec, ef_search, iterative_scan) y la búsqueda híbrida con RRF
import { PGlite } from "@electric-sql/pglite";
import * as ext from "@electric-sql/pglite-pgvector";
const vector = ext.vector ?? ext.default;
const db = new PGlite({ extensions: { vector } });
const q = (s, p) => db.query(s, p);
await db.exec("CREATE EXTENSION IF NOT EXISTS vector;");
console.log((await q("SELECT extversion FROM pg_extension WHERE extname='vector'")).rows, (await q("SELECT version()")).rows[0].version.slice(0,40));
await db.exec(`
CREATE TABLE fragmentos (
  id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  contenido text NOT NULL,
  embedding vector(3) NOT NULL,
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('spanish', contenido)) STORED
);
CREATE INDEX ON fragmentos USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX ON fragmentos USING gin (tsv);
CREATE INDEX ON fragmentos (tenant_id);
INSERT INTO fragmentos (tenant_id, contenido, embedding) VALUES
 ('acme', 'Política de devoluciones: tienes 30 días para devolver el producto', '[0.1,0.9,0.1]'),
 ('acme', 'Horario del servicio de soporte técnico', '[0.9,0.1,0.0]'),
 ('acme', 'Cómo solicitar un reembolso de un pedido', '[0.2,0.8,0.2]'),
 ('otra', 'Devoluciones de otro cliente', '[0.1,0.9,0.1]');
`);
await db.exec("SET hnsw.ef_search = 100; SET hnsw.iterative_scan = relaxed_order;");
const hibrida = `
WITH semantica AS (
  SELECT id, RANK() OVER (ORDER BY embedding <=> $1::vector) AS rk
  FROM fragmentos WHERE tenant_id = $3
  ORDER BY embedding <=> $1::vector LIMIT 20
),
lexica AS (
  SELECT id, RANK() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS rk
  FROM fragmentos, websearch_to_tsquery('spanish', $2) q
  WHERE tenant_id = $3 AND tsv @@ q
  ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 20
)
SELECT f.id, f.contenido,
       COALESCE(1.0 / (60 + s.rk), 0) + COALESCE(1.0 / (60 + l.rk), 0) AS rrf
FROM semantica s
FULL OUTER JOIN lexica l USING (id)
JOIN fragmentos f USING (id)
ORDER BY rrf DESC LIMIT 5;`;
const r = await q(hibrida, ["[0.1,0.9,0.1]", "devoluciones", "acme"]);
console.table(r.rows);
// halfvec: cast en el índice para ahorrar memoria
await db.exec("CREATE INDEX ON fragmentos USING hnsw ((embedding::halfvec(3)) halfvec_cosine_ops);");
const h = await q("SELECT id FROM fragmentos ORDER BY embedding::halfvec(3) <=> $1::halfvec(3) LIMIT 2", ["[0.1,0.9,0.1]"]);
console.log("halfvec ok", h.rows);
const e = await q("EXPLAIN SELECT id FROM fragmentos ORDER BY embedding <=> '[0.1,0.9,0.1]' LIMIT 2");
console.log(e.rows.map(x=>x["QUERY PLAN"]).join("\n"));
