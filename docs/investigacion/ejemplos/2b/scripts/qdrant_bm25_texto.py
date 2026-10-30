# Qdrant >= 1.20: BM25 sobre índice full-text del payload + densa, fusionadas con RRF (modo local)
from qdrant_client import QdrantClient, models

client = QdrantClient(":memory:")
client.create_collection("docs",
    vectors_config={"densa": models.VectorParams(size=4, distance=models.Distance.COSINE)})
client.create_payload_index("docs", field_name="texto",
    field_schema=models.TextIndexParams(type=models.TextIndexType.TEXT,
        tokenizer=models.TokenizerType.WORD, lowercase=True, scoring=True))
client.upsert("docs", points=[
    models.PointStruct(id=1, vector={"densa": [0.1, 0.9, 0.1, 0.0]}, payload={"texto": "Política de devoluciones en 30 días"}),
    models.PointStruct(id=2, vector={"densa": [0.9, 0.1, 0.0, 0.1]}, payload={"texto": "Horario de soporte técnico"}),
    models.PointStruct(id=3, vector={"densa": [0.2, 0.7, 0.2, 0.1]}, payload={"texto": "Cómo pedir un reembolso"}),
])
res = client.query_points("docs",
    prefetch=[
        models.Prefetch(query=[0.1, 0.9, 0.1, 0.0], using="densa", limit=20),
        models.Prefetch(query=models.TextQuery(text="devoluciones"), using="texto", limit=20),
    ],
    query=models.RrfQuery(rrf=models.Rrf(k=60)),
    limit=3, with_payload=True)
for p in res.points:
    print(p.id, round(p.score, 4), p.payload["texto"])
