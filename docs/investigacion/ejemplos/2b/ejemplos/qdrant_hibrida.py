# Verificación local (modo embebido :memory:) de búsqueda híbrida densa + sparse con RRF
from qdrant_client import QdrantClient, models
import qdrant_client
print("qdrant-client", qdrant_client.__version__ if hasattr(qdrant_client, "__version__") else "?")

client = QdrantClient(":memory:")
client.create_collection(
    collection_name="docs",
    vectors_config={"densa": models.VectorParams(size=4, distance=models.Distance.COSINE)},
    sparse_vectors_config={"bm25": models.SparseVectorParams(modifier=models.Modifier.IDF)},
)
client.create_payload_index("docs", field_name="tenant_id",
    field_schema=models.KeywordIndexParams(type=models.KeywordIndexType.KEYWORD, is_tenant=True))

client.upsert("docs", points=[
    models.PointStruct(id=1, vector={"densa": [0.1, 0.9, 0.1, 0.0],
        "bm25": models.SparseVector(indices=[10, 42], values=[1.0, 2.0])},
        payload={"tenant_id": "acme", "texto": "Política de devoluciones"}),
    models.PointStruct(id=2, vector={"densa": [0.9, 0.1, 0.0, 0.1],
        "bm25": models.SparseVector(indices=[7], values=[1.0])},
        payload={"tenant_id": "acme", "texto": "Horario de soporte"}),
    models.PointStruct(id=3, vector={"densa": [0.1, 0.8, 0.2, 0.0],
        "bm25": models.SparseVector(indices=[42], values=[1.0])},
        payload={"tenant_id": "otra", "texto": "Devoluciones (otro cliente)"}),
])

filtro = models.Filter(must=[models.FieldCondition(key="tenant_id", match=models.MatchValue(value="acme"))])
res = client.query_points(
    collection_name="docs",
    prefetch=[
        models.Prefetch(query=[0.1, 0.9, 0.1, 0.0], using="densa", limit=20, filter=filtro),
        models.Prefetch(query=models.SparseVector(indices=[42], values=[1.0]), using="bm25", limit=20, filter=filtro),
    ],
    query=models.FusionQuery(fusion=models.Fusion.RRF),
    limit=5,
    with_payload=True,
)
for p in res.points:
    print(p.id, round(p.score, 4), p.payload["texto"])
print("Fusion members:", [f for f in models.Fusion])
print("RrfQuery exists:", hasattr(models, "RrfQuery"), "Rrf:", hasattr(models, "Rrf"))
