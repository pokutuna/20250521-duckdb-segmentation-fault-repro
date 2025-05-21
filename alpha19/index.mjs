import { DOUBLE, DuckDBInstance, LIST, listValue } from "@duckdb/node-api";

(async () => {
  const db = await DuckDBInstance.create("../data.duckdb", {
    access_mode: "READ_ONLY",
  });

  const query = `
  SELECT
    id,
    list_cosine_similarity(embedding, $embedding) AS similarity
  FROM embeddings
  ORDER BY similarity DESC
  LIMIT 1
`;

  const conn = await db.connect();
  const queryEmbedding = Array.from({ length: 768 }, () => Math.random());
  const res = await conn.run(
    query,
    { embedding: listValue(queryEmbedding) },
    { embedding: LIST(DOUBLE) }
  );
  console.log(await res.getRowObjectsJS());
})();
