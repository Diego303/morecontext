import chromadb
print("chromadb", chromadb.__version__)
print("hybrid names:", [n for n in ("Search","K","Knn","Rrf","SparseVectorIndexConfig","Schema") if hasattr(chromadb, n)])
c = chromadb.EphemeralClient()
col = c.get_or_create_collection("docs", metadata={"hnsw:space": "cosine"} )
col.add(ids=["1","2"], documents=["Política de devoluciones", "Horario de soporte"],
        embeddings=[[0.1,0.9,0.1],[0.9,0.1,0.0]], metadatas=[{"tenant":"acme"},{"tenant":"acme"}])
r = col.query(query_embeddings=[[0.1,0.9,0.1]], n_results=2, where={"tenant":"acme"}, where_document={"$contains":"devoluciones"})
print(r["ids"], r["distances"])

import lancedb, pyarrow as pa
print("lancedb", lancedb.__version__)
db = lancedb.connect("/tmp/claude-0/-home-claude/815d9cec-1ff3-53e4-b90d-1cdf1b2bd414/scratchpad/investigacion/tmp-2b/lance_db")
data = [{"id":1,"texto":"Política de devoluciones en 30 días","vector":[0.1,0.9,0.1],"tenant":"acme"},
        {"id":2,"texto":"Horario de soporte técnico","vector":[0.9,0.1,0.0],"tenant":"acme"},
        {"id":3,"texto":"Cómo pedir un reembolso","vector":[0.2,0.8,0.2],"tenant":"acme"}]
t = db.create_table("docs", data=data, mode="overwrite")
t.create_fts_index("texto", replace=True)
from lancedb.rerankers import RRFReranker
res = (t.search(query_type="hybrid")
        .vector([0.1,0.9,0.1]).text("devoluciones")
        .where("tenant = 'acme'")
        .rerank(RRFReranker())
        .limit(3).to_list())
for x in res: print(x["id"], x["texto"], round(x.get("_relevance_score",0),4))
